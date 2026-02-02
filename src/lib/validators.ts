/**
 * Input validation schemas using Zod
 * Provides type-safe validation for all API requests
 */

import { z } from 'zod'

/**
 * Email validation schema
 * Must be a valid email format
 */
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .toLowerCase()
  .trim()

/**
 * Password validation schema
 * Must meet security requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[@$!%*?&]/, 'Password must contain at least one special character (@$!%*?&)')

/**
 * Name validation schema
 * Must be 2-100 characters and contain only letters, spaces, and hyphens
 */
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters long')
  .max(100, 'Name must be at most 100 characters long')
  .regex(/^[a-zA-Z\s\-']+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')

/**
 * Signup request validation
 */
export const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
})

export type SignupInput = z.infer<typeof signupSchema>

/**
 * Login request validation
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export type LoginInput = z.infer<typeof loginSchema>

/**
 * Post type validation
 */
export const postTypeSchema = z.enum(['offer', 'request'])

/**
 * Post category validation
 */
export const categorySchema = z.enum(['physical', 'monetary', 'goods', 'mentoring', 'other'])

/**
 * Create post request validation
 */
export const createPostSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters long')
    .max(200, 'Title must be at most 200 characters long'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters long')
    .max(5000, 'Description must be at most 5000 characters long'),
  type: postTypeSchema,
  category: categorySchema,
})

export type CreatePostInput = z.infer<typeof createPostSchema>

/**
 * Validates input data against a schema
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validation result with data or errors
 */
export function validateInput<T extends z.ZodSchema>(
  schema: T,
  data: unknown
): { success: boolean; data?: z.infer<T>; errors?: Record<string, string> } {
  const result = schema.safeParse(data)

  if (!result.success) {
    const errors: Record<string, string> = {}
    result.error.issues.forEach((issue) => {
      const path = issue.path.join('.')
      errors[path] = issue.message
    })
    return { success: false, errors }
  }

  return { success: true, data: result.data }
}
