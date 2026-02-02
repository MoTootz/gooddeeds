/**
 * Authentication utility functions
 * Handles JWT token verification and authentication logic
 */

import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import { getJwtSecret } from './env'

/**
 * JWT payload structure
 */
export interface JwtPayload {
  id: string
  email: string
  iat?: number
  exp?: number
}

/**
 * Authentication result type
 */
export interface AuthResult {
  success: boolean
  user?: JwtPayload
  error?: string
}

/**
 * Extracts the JWT token from the Authorization header
 * @param req - Next.js request object
 * @returns The JWT token or null if not present
 */
export function extractToken(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  return authHeader.substring(7) // Remove 'Bearer ' prefix
}

/**
 * Verifies a JWT token and returns the payload
 * @param token - The JWT token to verify
 * @returns AuthResult with user data or error
 */
export function verifyToken(token: string): AuthResult {
  try {
    const secret = getJwtSecret()
    const decoded = jwt.verify(token, secret) as JwtPayload

    return {
      success: true,
      user: decoded,
    }
  } catch (error) {
    const errorMessage = error instanceof jwt.JsonWebTokenError
      ? error.name === 'TokenExpiredError'
        ? 'Token has expired'
        : 'Invalid token'
      : 'Token verification failed'

    return {
      success: false,
      error: errorMessage,
    }
  }
}

/**
 * Extracts and verifies the JWT from a request
 * @param req - Next.js request object
 * @returns AuthResult with user data or error
 */
export function authenticateRequest(req: NextRequest): AuthResult {
  const token = extractToken(req)

  if (!token) {
    return {
      success: false,
      error: 'No authentication token provided',
    }
  }

  return verifyToken(token)
}

/**
 * Creates a JWT token for a user
 * @param userId - User ID to encode in token
 * @param email - User email to encode in token
 * @param expiresIn - Token expiration time (default: '7d')
 * @returns The generated JWT token
 * @throws Error if JWT_SECRET is not configured
 */
export function generateToken(
  userId: string,
  email: string,
  expiresIn: string = '7d'
): string {
  const secret = getJwtSecret()

  return jwt.sign(
    { id: userId, email },
    secret,
    { expiresIn } as jwt.SignOptions
  )
}

/**
 * Type guard to check if a value is a JwtPayload
 * @param value - Value to check
 * @returns true if value matches JwtPayload structure
 */
export function isJwtPayload(value: unknown): value is JwtPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value &&
    typeof (value as Record<string, unknown>).id === 'string' &&
    typeof (value as Record<string, unknown>).email === 'string'
  )
}
