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

    try {
      const response = await withRequestLogging(handler)(request, context);
      return withCors(response, request);
    } catch (error) {
      const response = errorResponse(error);
      return withCors(response, request);
    }
  };
}

// Input validation wrapper
<<<<<<< HEAD
=======
import { ZodSchema } from 'zod';

>>>>>>> 6adf7ea839744bf6fc209c2a3c4c6ac9784f3dd6
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
