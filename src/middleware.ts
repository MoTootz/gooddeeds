import { NextRequest, NextResponse } from 'next/server'

// Routes that require authentication
const protectedRoutes = ['/create', '/profile', '/messages', '/dashboard']

/**
 * Middleware to enforce authentication on protected routes
 * Redirects unauthenticated users to /login
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  )

  if (isProtectedRoute) {
    // Check for authToken in cookies
    const authToken = request.cookies.get('authToken')?.value

    // Redirect to login if no token found
    if (!authToken) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

// Configure which routes the middleware should run on
export const config = {
  // Run middleware on all routes except static assets and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
