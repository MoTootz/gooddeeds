/**
 * API route handler wrapper for error handling and middleware
 * Provides consistent error handling and logging for all API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { handleError } from './apiResponse'

/**
 * API route handler function type
 */
export type RouteHandler = (req: NextRequest) => Promise<NextResponse | Response>

/**
 * Wraps a route handler with error handling
 * All exceptions are caught and converted to standardized API errors
 * @param handler - The route handler function
 * @param context - Optional context for error logging
 * @returns Wrapped handler function
 */
export function withErrorHandling(
  handler: RouteHandler,
  context?: string
): RouteHandler {
  return async (req: NextRequest) => {
    try {
      return await handler(req)
    } catch (error) {
      return handleError(error, context)
    }
  }
}

/**
 * Wraps a route handler to log request details
 * @param handler - The route handler function
 * @returns Wrapped handler function
 */
export function withLogging(handler: RouteHandler): RouteHandler {
  return async (req: NextRequest) => {
    const timestamp = new Date().toISOString()
    const method = req.method
    const path = req.nextUrl.pathname
    const startTime = Date.now()

    try {
      const response = await handler(req)
      const duration = Date.now() - startTime

      console.log(
        `[${timestamp}] ${method} ${path} - ${response.status} (${duration}ms)`
      )

      return response
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(
        `[${timestamp}] ${method} ${path} - Error (${duration}ms):`,
        error
      )
      throw error
    }
  }
}

/**
 * Chains multiple middleware/wrappers together
 * @param handler - The base route handler
 * @param wrappers - Array of wrapper functions to apply
 * @returns Handler wrapped with all middleware
 */
export function applyMiddleware(
  handler: RouteHandler,
  ...wrappers: Array<(handler: RouteHandler) => RouteHandler>
): RouteHandler {
  let wrappedHandler = handler

  // Apply wrappers in reverse order so they execute in correct order
  for (let i = wrappers.length - 1; i >= 0; i--) {
    wrappedHandler = wrappers[i](wrappedHandler)
  }

  return wrappedHandler
}
