import { NextResponse } from 'next/server';

export type ApiErrorResponse = {
  success: false;
  error: string;
  details?: string | unknown;
};

export type ApiSuccessResponse<T = unknown> = {
  success: true;
  data?: T;
  message?: string;
} & (T extends Record<string, unknown> ? T : Record<string, unknown>);

export class ApiHandler {
  /**
   * Generates a standardized successful API response.
   */
  static success<T extends Record<string, unknown> | undefined = undefined>(
    data?: T,
    message?: string,
    status = 200
  ) {
    return NextResponse.json(
      { success: true, message, ...(data || {}) },
      { status }
    );
  }

  /**
   * Generates a standardized error API response.
   */
  static error(error: string, status = 400, details?: unknown) {
    const payload: ApiErrorResponse = { success: false, error };
    if (details) {
      payload.details = details instanceof Error ? details.message : details;
    }
    return NextResponse.json(payload, { status });
  }

  /**
   * Standardized 401 Unauthorized response.
   */
  static unauthorized(error = 'Unauthorized') {
    return this.error(error, 401);
  }

  /**
   * Standardized 403 Forbidden response.
   */
  static forbidden(error = 'Forbidden') {
    return this.error(error, 403);
  }

  /**
   * Standardized 404 Not Found response.
   */
  static notFound(error = 'Resource not found') {
    return this.error(error, 404);
  }

  /**
   * Standardized 500 Internal Server Error response.
   */
  static internalServerError(error = 'Internal server error', details?: unknown) {
    console.error(`[API Error] ${error}:`, details);
    return this.error(error, 500, details);
  }
}
