/**
 * Standardized API response and error handling utilities
 * Provides consistent response formatting across all API endpoints
 */

import { NextResponse } from 'next/server'
import { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } from './constants'
import { PaginationMeta } from './pagination'

/**
 * Standard API error response structure
 */
export interface ApiError {
  success: false
  error: string
  code: string
  status: number
  details?: Record<string, unknown>
  timestamp: string
}

/**
 * Standard API success response structure
 */
export interface ApiSuccess<T = unknown> {
  success: true
  data: T
  message?: string
  timestamp: string
}

/**
 * Paginated API success response structure
 */
export interface PaginatedApiSuccess<T = unknown> {
  success: true
  data: T[]
  pagination: PaginationMeta
  message?: string
  timestamp: string
}

/**
 * API response type
 */
export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError

/**
 * Paginated API response type
 */
export type PaginatedResponse<T = unknown> = PaginatedApiSuccess<T> | ApiError

/**
 * Creates a standardized success response
 * @param data - Response data payload
 * @param message - Optional success message
 * @param status - HTTP status code (default: 200)
 * @returns NextResponse with standardized success format
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = HTTP_STATUS.OK
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message: message || SUCCESS_MESSAGES.OPERATION_SUCCESS,
      timestamp: new Date().toISOString(),
    },
    { status }
  )
}

/**
 * Creates a paginated success response
 * @param data - Array of items
 * @param pagination - Pagination metadata
 * @param message - Optional success message
 * @param status - HTTP status code (default: 200)
 * @returns NextResponse with paginated success format
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: PaginationMeta,
  message?: string,
  status: number = HTTP_STATUS.OK
): NextResponse<PaginatedApiSuccess<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      pagination,
      message: message || SUCCESS_MESSAGES.OPERATION_SUCCESS,
      timestamp: new Date().toISOString(),
    },
    { status }
  )
}

/**
 * Creates a standardized error response
 * @param message - Error message to display to client
 * @param code - Error code for client-side handling
 * @param status - HTTP status code
 * @param details - Additional error details (only in development)
 * @returns NextResponse with standardized error format
 */
export function errorResponse(
  message: string = ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
  code: string = 'INTERNAL_ERROR',
  status: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  details?: Record<string, unknown>
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code,
      status,
      ...(process.env.NODE_ENV === 'development' && { details }),
      timestamp: new Date().toISOString(),
    },
    { status }
  )
}

/**
 * Creates a validation error response
 * @param errors - Object mapping field names to error messages
 * @returns NextResponse with validation error format
 */
export function validationErrorResponse(
  errors: Record<string, string>
): NextResponse<ApiError> {
  return errorResponse(
    ERROR_MESSAGES.INVALID_INPUT,
    'VALIDATION_ERROR',
    HTTP_STATUS.BAD_REQUEST,
    { validationErrors: errors }
  )
}

/**
 * Creates a 400 Bad Request error response
 * @param message - Error message
 * @param details - Optional error details
 * @returns NextResponse with 400 status
 */
export function badRequestResponse(
  message: string = ERROR_MESSAGES.MISSING_REQUIRED_FIELDS,
  details?: Record<string, unknown>
): NextResponse<ApiError> {
  return errorResponse(message, 'BAD_REQUEST', HTTP_STATUS.BAD_REQUEST, details)
}

/**
 * Creates a 401 Unauthorized error response
 * @param message - Error message
 * @returns NextResponse with 401 status
 */
export function unauthorizedResponse(
  message: string = ERROR_MESSAGES.UNAUTHORIZED
): NextResponse<ApiError> {
  return errorResponse(message, 'UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
}

/**
 * Creates a 409 Conflict error response (e.g., duplicate entry)
 * @param message - Error message
 * @returns NextResponse with 409 status
 */
export function conflictResponse(
  message: string = ERROR_MESSAGES.USER_ALREADY_EXISTS
): NextResponse<ApiError> {
  return errorResponse(message, 'CONFLICT', HTTP_STATUS.CONFLICT)
}

/**
 * Creates a 404 Not Found error response
 * @param message - Error message
 * @returns NextResponse with 404 status
 */
export function notFoundResponse(message: string = ERROR_MESSAGES.POST_NOT_FOUND): NextResponse<ApiError> {
  return errorResponse(message, 'NOT_FOUND', HTTP_STATUS.NOT_FOUND)
}

/**
 * Safely handles errors and returns appropriate API response
 * @param error - The caught error
 * @param context - Additional context for error logging
 * @returns NextResponse with error format
 */
export function handleError(error: unknown, context?: string): NextResponse<ApiError> {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
  const timestamp = new Date().toISOString()

  console.error(`[${timestamp}] ${context ? `[${context}] ` : ''}Error:`, error)

  // Don't expose internal errors to client
  return errorResponse(
    ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    'INTERNAL_ERROR',
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    process.env.NODE_ENV === 'development' ? { originalError: errorMessage } : undefined
  )
}
