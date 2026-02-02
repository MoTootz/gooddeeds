import { NextRequest } from 'next/server'
import {
  successResponse,
  paginatedResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from '@/lib/apiResponse'
import { createPostSchema, validateInput } from '@/lib/validators'
import { authenticateRequest } from '@/lib/auth'
import { withErrorHandling } from '@/lib/routeHandler'
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/lib/constants'
import { PostService } from '@/services/database'
import {
  parsePaginationParams,
  calculatePagination,
  calculateSkip,
} from '@/lib/pagination'

/**
 * GET /api/posts
 * Retrieves paginated posts with author information
 * Supports pagination via query parameters: ?page=1&limit=10
 * No authentication required
 *
 * Query parameters:
 * - page: number (default: 1)
 * - limit: number (default: 10, max: 100)
 *
 * Response: 200 OK
 * - Array of post objects with author details and pagination metadata
 */
async function GET(req: NextRequest) {
  // Parse pagination parameters from query string
  const { page, limit } = parsePaginationParams(req.nextUrl.searchParams)
  const skip = calculateSkip(page, limit)

  // Get total count and paginated posts in parallel
  const [posts, total] = await Promise.all([
    PostService.getAllPosts({ skip, take: limit }),
    PostService.getPostCount(),
  ])

  // Calculate pagination metadata
  const pagination = calculatePagination(total, page, limit)

  return paginatedResponse(posts, pagination)
}

/**
 * POST /api/posts
 * Creates a new post (requires authentication)
 *
 * Request headers:
 * - Authorization: Bearer <JWT_TOKEN>
 *
 * Request body:
 * - title: string (5-200 characters)
 * - description: string (10-5000 characters)
 * - type: 'offer' | 'request'
 * - category: 'physical' | 'monetary' | 'goods' | 'mentoring' | 'other'
 *
 * Response: 201 Created
 * - Created post object with author details
 */
async function POST(req: NextRequest) {
  // Authenticate request
  const authResult = authenticateRequest(req)
  if (!authResult.success) {
    return unauthorizedResponse(
      authResult.error || ERROR_MESSAGES.UNAUTHORIZED
    )
  }

  const body = await req.json()

  // Validate input data
  const validation = validateInput(createPostSchema, body)
  if (!validation.success) {
    return validationErrorResponse(validation.errors || {})
  }

  const { title, description, type, category } = validation.data!

  const post = await PostService.createPost({
    title,
    description,
    type,
    category,
    authorId: authResult.user!.id,
  })

  return successResponse(post, SUCCESS_MESSAGES.POST_CREATED, 201)
}

const getHandler = withErrorHandling(GET, 'GET_POSTS')
const postHandler = withErrorHandling(POST, 'CREATE_POST')

export { getHandler as GET, postHandler as POST }
