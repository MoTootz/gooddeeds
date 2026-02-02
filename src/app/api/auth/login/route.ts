import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcrypt'
import {
  successResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from '@/lib/apiResponse'
import { loginSchema, validateInput } from '@/lib/validators'
import { generateToken } from '@/lib/auth'
import { withErrorHandling } from '@/lib/routeHandler'
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/lib/constants'

/**
 * POST /api/auth/login
 * Authenticates a user and returns a JWT token
 * 
 * Request body:
 * - email: string (valid email format)
 * - password: string (user's password)
 * 
 * Response: 200 OK
 * - token: JWT token for authentication
 * - user: Authenticated user object
 */
async function POST(req: NextRequest) {
  const body = await req.json()

  // Validate input data
  const validation = validateInput(loginSchema, body)
  if (!validation.success) {
    return validationErrorResponse(validation.errors || {})
  }

  const { email, password } = validation.data!

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    return unauthorizedResponse(ERROR_MESSAGES.INVALID_CREDENTIALS)
  }

  // Verify password matches hash
  const isPasswordValid = await bcrypt.compare(password, user.password)

  if (!isPasswordValid) {
    return unauthorizedResponse(ERROR_MESSAGES.INVALID_CREDENTIALS)
  }

  // Generate JWT token
  const token = generateToken(user.id, user.email)

  return successResponse(
    {
      token,
      user: { id: user.id, email: user.email, name: user.name },
    },
    SUCCESS_MESSAGES.LOGIN_SUCCESSFUL
  )
}

const handler = withErrorHandling(POST, 'LOGIN')
export { handler as POST }

