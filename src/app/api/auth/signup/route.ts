import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcrypt'
import {
  successResponse,
  conflictResponse,
  validationErrorResponse,
} from '@/lib/apiResponse'
import { signupSchema, validateInput } from '@/lib/validators'
import { generateToken } from '@/lib/auth'
import { withErrorHandling } from '@/lib/routeHandler'
import { AUTH_CONFIG, SUCCESS_MESSAGES } from '@/lib/constants'

/**
 * POST /api/auth/signup
 * Creates a new user account with email and password
 * 
 * Request body:
 * - name: string (2-100 characters)
 * - email: string (valid email format)
 * - password: string (8+ chars, must include uppercase, lowercase, number, special char)
 * 
 * Response: 201 Created
 * - token: JWT token for authentication
 * - user: Created user object
 */
async function POST(req: NextRequest) {
  const body = await req.json()

  // Validate input data
  const validation = validateInput(signupSchema, body)
  if (!validation.success) {
    return validationErrorResponse(validation.errors || {})
  }

  const { name, email, password } = validation.data!

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    return conflictResponse(
      `User with email "${email}" already exists. Please try logging in or use a different email.`
    )
  }

  // Hash password with bcrypt
  const hashedPassword = await bcrypt.hash(password, AUTH_CONFIG.BCRYPT_ROUNDS)

  // Create user in database
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  })

  // Generate JWT token
  const token = generateToken(user.id, user.email)

  return successResponse(
    {
      token,
      user: { id: user.id, email: user.email, name: user.name },
    },
    SUCCESS_MESSAGES.USER_CREATED,
    201
  )
}

const handler = withErrorHandling(POST, 'SIGNUP')
export { handler as POST }
