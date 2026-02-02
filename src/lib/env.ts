/**
 * Environment variable validation and access
 * Ensures all required environment variables are present and valid
 */

export const env = {
  JWT_SECRET: process.env.JWT_SECRET || '',
  DATABASE_URL: process.env.DATABASE_URL || '',
  NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
} as const

/**
 * Validates that all required environment variables are set
 * Should be called at application startup
 * @throws {Error} If any required environment variable is missing
 */
export function validateEnv(): void {
  const required = ['JWT_SECRET', 'DATABASE_URL']

  for (const key of required) {
    if (!env[key as keyof typeof env]) {
      throw new Error(
        `Missing required environment variable: ${key}. Please check your .env file.`
      )
    }
  }
}

/**
 * Safely retrieves the JWT secret with fallback error handling
 * @returns {string} The JWT secret
 * @throws {Error} If JWT_SECRET is not configured
 */
export function getJwtSecret(): string {
  if (!env.JWT_SECRET) {
    throw new Error(
      'JWT_SECRET environment variable is not set. This is required for authentication.'
    )
  }
  return env.JWT_SECRET
}
