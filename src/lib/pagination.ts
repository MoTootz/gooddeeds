/**
 * Pagination utilities for handling paginated responses
 */

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasMore: boolean
  }
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  pages: number
  hasMore: boolean
}

/**
 * Calculate pagination metadata
 * @param total - Total number of items
 * @param page - Current page (1-indexed)
 * @param limit - Items per page
 * @returns Pagination metadata
 */
export function calculatePagination(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  const pages = Math.ceil(total / limit)
  const hasMore = page < pages

  return {
    page,
    limit,
    total,
    pages,
    hasMore,
  }
}

/**
 * Calculate skip value for database queries
 * @param page - Page number (1-indexed)
 * @param limit - Items per page
 * @returns Skip value for Prisma/database
 */
export function calculateSkip(page: number, limit: number): number {
  return (page - 1) * limit
}

/**
 * Parse pagination query parameters
 * @param searchParams - URLSearchParams from request
 * @returns Validated pagination parameters
 */
export function parsePaginationParams(
  searchParams: URLSearchParams | Record<string, string>
): { page: number; limit: number } {
  let page = 1
  let limit = 10

  if (searchParams instanceof URLSearchParams) {
    page = parseInt(searchParams.get('page') || '1', 10)
    limit = parseInt(searchParams.get('limit') || '10', 10)
  } else {
    page = parseInt(searchParams['page'] || '1', 10)
    limit = parseInt(searchParams['limit'] || '10', 10)
  }

  // Validate and constrain values
  page = Math.max(1, isNaN(page) ? 1 : page)
  limit = Math.min(100, Math.max(1, isNaN(limit) ? 10 : limit)) // Max 100 items per page

  return { page, limit }
}
