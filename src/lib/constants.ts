/**
 * Constants used throughout the application
 * Single source of truth for magic strings and configuration values
 */

/**
 * Application route paths
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  POSTS: '/posts',
  CREATE: '/create',
} as const

/**
 * API endpoint paths
 */
export const API_ROUTES = {
  SIGNUP: '/api/auth/signup',
  LOGIN: '/api/auth/login',
  POSTS: '/api/posts',
} as const

/**
 * Post types
 */
export const POST_TYPES = {
  OFFER: 'offer',
  REQUEST: 'request',
} as const

/**
 * Post categories
 */
export const CATEGORIES = {
  PHYSICAL: 'physical',
  MONETARY: 'monetary',
  GOODS: 'goods',
  MENTORING: 'mentoring',
  OTHER: 'other',
} as const

/**
 * Post statuses
 */
export const POST_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CLOSED: 'closed',
} as const

/**
 * Error messages for common scenarios
 */
export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_ALREADY_EXISTS: 'User with this email already exists',
  MISSING_REQUIRED_FIELDS: 'Missing required fields',
  INTERNAL_SERVER_ERROR: 'An error occurred while processing your request',
  UNAUTHORIZED: 'Unauthorized: Please provide a valid authentication token',
  INVALID_TOKEN: 'Invalid or expired authentication token',
  USER_NOT_FOUND: 'User not found',
  POST_NOT_FOUND: 'Post not found',
  INVALID_INPUT: 'Invalid input data',
  PASSWORD_HASHING_ERROR: 'Failed to process password',
  DATABASE_ERROR: 'Database operation failed',
} as const

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  USER_CREATED: 'User created successfully',
  LOGIN_SUCCESSFUL: 'Login successful',
  POST_CREATED: 'Post created successfully',
  POST_UPDATED: 'Post updated successfully',
  POST_DELETED: 'Post deleted successfully',
  OPERATION_SUCCESS: 'Operation completed successfully',
} as const

/**
 * Authentication configuration
 */
export const AUTH_CONFIG = {
  TOKEN_EXPIRY: '7d',
  BCRYPT_ROUNDS: 10,
  TOKEN_HEADER_PREFIX: 'Bearer ',
} as const

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 1,
} as const

/**
 * HTTP status codes (for clarity)
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const

/**
 * Regular expressions for validation
 */
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  NAME: /^[a-zA-Z\s\-']+$/,
  URL: /^https?:\/\/[^\s]+$/,
} as const

export default {
  ROUTES,
  API_ROUTES,
  POST_TYPES,
  CATEGORIES,
  POST_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  AUTH_CONFIG,
  PAGINATION,
  HTTP_STATUS,
  REGEX_PATTERNS,
} as const
