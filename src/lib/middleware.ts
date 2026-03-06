import { NextRequest, NextResponse } from 'next/server';
import { ZodError, ZodSchema } from 'zod';
import { getCorsHeaders, logRequest, getClientIp, getUserAgent } from './security';

// Error types
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter: number) {
    super('Too many requests, please try again later', 429, 'RATE_LIMIT_ERROR', { retryAfter });
    this.name = 'RateLimitError';
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service is currently unavailable') {
    super(message, 503, 'SERVICE_UNAVAILABLE');
    this.name = 'ServiceUnavailableError';
  }
}

export class CsrfError extends AppError {
  constructor(message: string = 'Cross-site request blocked') {
    super(message, 403, 'CSRF_ERROR');
    this.name = 'CsrfError';
  }
}

function isMutationMethod(method: string): boolean {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
}

function validateRequestOrigin(request: NextRequest): void {
  if (!isMutationMethod(request.method)) {
    return;
  }

  const requestOrigin = request.nextUrl.origin;
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  if (origin) {
    if (origin !== requestOrigin) {
      throw new CsrfError('Origin validation failed');
    }
    return;
  }

  if (referer) {
    try {
      if (new URL(referer).origin !== requestOrigin) {
        throw new CsrfError('Referer validation failed');
      }
      return;
    } catch {
      throw new CsrfError('Referer validation failed');
    }
  }

  throw new CsrfError('Missing Origin/Referer header for state-changing request');
}

// Error response formatter
export function errorResponse(error: unknown): NextResponse {
  console.error('API Error:', error);

  if (error instanceof AppError) {
    const response: Record<string, unknown> = {
      error: error.message,
      code: error.code,
    };

    if (error.details) {
      response.details = error.details;
    }

    return NextResponse.json(response, { status: error.statusCode });
  }

  if (error instanceof Error) {
    return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, { status: 500 });
  }

  return NextResponse.json(
    { error: 'An unexpected error occurred', code: 'INTERNAL_ERROR' },
    { status: 500 }
  );
}

// Success response formatter
export function successResponse<T>(data?: T, message?: string): NextResponse {
  const response: Record<string, unknown> = { success: true };

  if (message) {
    response.message = message;
  }

  if (data !== undefined) {
    response.data = data;
  }

  return NextResponse.json(response);
}

// Paginated response formatter
export function paginatedResponse<T>(
  items: T[],
  total: number,
  limit: number,
  offset: number
): NextResponse {
  return NextResponse.json({
    success: true,
    data: {
      items,
      total,
      limit,
      offset,
      hasMore: offset + items.length < total,
    },
  });
}

// API handler wrapper with request logging
type ApiHandler = (
  request: NextRequest,
  context?: { params: Promise<Record<string, string | string[]>> }
) => Promise<NextResponse>;

const mutatingMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function validateOriginForMutation(request: NextRequest): void {
  if (!mutatingMethods.has(request.method.toUpperCase())) {
    return;
  }

  const origin = request.headers.get('origin');
  const host = request.headers.get('host');

  if (!origin || !host) {
    throw new AuthenticationError('Invalid request origin');
  }

  const originHost = new URL(origin).host;
  if (originHost !== host) {
    throw new AuthenticationError('Cross-site requests are not allowed');
  }
}

export function withRequestLogging(handler: ApiHandler): ApiHandler {
  return async (request: NextRequest, context) => {
    const startTime = Date.now();
    const ipAddress = getClientIp(request);
    const userAgent = getUserAgent(request);

    try {
      const response = await handler(request, context);
      const duration = Date.now() - startTime;

      // Log successful request
      await logRequest(
        request.method,
        new URL(request.url).pathname,
        response.status,
        duration,
        ipAddress,
        userAgent
      );

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Log failed request
      await logRequest(
        request.method,
        new URL(request.url).pathname,
        500,
        duration,
        ipAddress,
        userAgent
      );

      throw error;
    }
  };
}


function isStateChangingMethod(method: string): boolean {
  return method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE';
}

function validateCsrfRequest(request: NextRequest): void {
  if (!isStateChangingMethod(request.method)) {
    return;
  }

  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  const secFetchSite = request.headers.get('sec-fetch-site');

  if (secFetchSite && secFetchSite !== 'same-origin' && secFetchSite !== 'none') {
    throw new AuthorizationError('Cross-site state-changing requests are blocked');
  }

  if (!origin || !host) {
    return;
  }

  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new AuthorizationError('Invalid request origin');
  }

  if (originHost !== host) {
    throw new AuthorizationError('Cross-site state-changing requests are blocked');
  }
}

// CORS middleware for OPTIONS requests
export function handleCors(request: NextRequest): NextResponse | null {
  if (request.method === 'OPTIONS') {
    const origin = request.headers.get('origin') || undefined;
    return new NextResponse(null, {
      status: 204,
      headers: getCorsHeaders(origin),
    });
  }
  return null;
}

// Add CORS headers to response
export function withCors(response: NextResponse, request: NextRequest): NextResponse {
  const origin = request.headers.get('origin') || undefined;
  const corsHeaders = getCorsHeaders(origin);

  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

// Combined middleware wrapper
export function withMiddleware(handler: ApiHandler): ApiHandler {
  return async (request: NextRequest, context) => {
    // Handle CORS preflight
    const corsResponse = handleCors(request);
    if (corsResponse) {
      return corsResponse;
    }

    validateRequestOrigin(request);

    try {
      validateCsrfRequest(request);
      const response = await withRequestLogging(handler)(request, context);
      return withCors(response, request);
    } catch (error) {
      const response = errorResponse(error);
      return withCors(response, request);
    }
  };
}

// Input validation wrapper
export function validateInput<T>(
  schema: ZodSchema<T>,
  data: unknown
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError('Validation failed', {
        errors: error.issues.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      });
    }
    throw new ValidationError('Validation failed');
  }
}
