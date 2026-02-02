# GoodDeeds Codebase Refactoring Suggestions

## Executive Summary

The codebase has been significantly improved with implementation of Critical and High Priority best practices. This document outlines additional refactoring suggestions based on current code analysis and architecture patterns.

---

## 🎯 PHASE 1: IMMEDIATE IMPROVEMENTS (1-2 weeks)

### 1. **Extract API Service Layer**

**Current Issue**: API calls scattered throughout components

**Suggestion**:
```typescript
// src/services/api.ts
export class ApiService {
  private static readonly BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

  static async signup(name: string, email: string, password: string) {
    const res = await fetch(`${this.BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    return res.json()
  }

  static async login(email: string, password: string) {
    const res = await fetch(`${this.BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    return res.json()
  }

  static async getPosts() {
    const res = await fetch(`${this.BASE_URL}/posts`)
    return res.json()
  }

  static async createPost(post: CreatePostInput, token: string) {
    const res = await fetch(`${this.BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(post),
    })
    return res.json()
  }
}
```

**Benefits**:
- Centralized API logic
- Single point of change for endpoints
- Easier testing and mocking
- Consistent error handling

---

### 2. **Create Custom Hooks for Common Patterns**

**Suggestion**: Create `src/hooks/` directory with:

#### `useApi.ts` - Generic API call hook
```typescript
interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T>(
  url: string,
  options?: RequestInit
): UseApiState<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      try {
        const res = await fetch(url, options)
        if (!res.ok) throw new Error('API error')
        const data = await res.json()
        
        if (isMounted) {
          setState({ data: data.data, loading: false, error: null })
        }
      } catch (error) {
        if (isMounted) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [url, options])

  return state
}
```

#### `useForm.ts` - Form state management
```typescript
export function useForm<T extends Record<string, unknown>>(
  initialValues: T,
  onSubmit: (values: T) => Promise<void>
) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setValues(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } catch (error) {
      setErrors({ submit: 'Failed to submit form' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return { values, errors, isSubmitting, handleChange, handleSubmit }
}
```

**Benefits**:
- Reduce code duplication across pages
- Better state management
- Cleaner component logic
- Easier to test

---

### 3. **Extract Reusable Components**

**Create `src/components/`**:

#### `FormInput.tsx`
```typescript
interface FormInputProps {
  label: string
  type?: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
  required?: boolean
  placeholder?: string
}

export function FormInput({
  label,
  type = 'text',
  error,
  ...props
}: FormInputProps) {
  return (
    <div className="mb-4">
      <label htmlFor={props.name} className="block text-gray-700 font-semibold mb-2">
        {label}
      </label>
      <input
        type={type}
        id={props.name}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}
```

#### `LoadingSpinner.tsx`
```typescript
export function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  )
}
```

---

### 4. **Create Database Service Layer**

**Create `src/services/database.ts`**:
```typescript
import prisma from '@/lib/prisma'

export class UserService {
  static async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, bio: true }
    })
  }

  static async getUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } })
  }

  static async createUser(data: { name: string; email: string; password: string }) {
    return prisma.user.create({ data })
  }
}

export class PostService {
  static async getAllPosts() {
    return prisma.post.findMany({
      include: { author: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  static async createPost(data: { title: string; description: string; type: string; category: string; authorId: string }) {
    return prisma.post.create({
      data,
      include: { author: { select: { id: true, name: true, email: true } } },
    })
  }

  static async getPostsByUser(userId: string) {
    return prisma.post.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
    })
  }
}
```

**Benefits**:
- Centralized database logic
- Easier to add caching
- Single place to modify queries
- Better for unit testing

---

## 🔄 PHASE 2: STRUCTURE IMPROVEMENTS (2-3 weeks)

### 5. **Implement Middleware for Authentication**

**Create `src/middleware.ts`**:
```typescript
import { NextRequest, NextResponse } from 'next/server'

const protectedRoutes = ['/create', '/profile', '/messages']

export function middleware(request: NextRequest) {
  const token = request.cookies.get('authToken')?.value

  // Protect routes that require authentication
  if (protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

**Benefits**:
- Centralized auth enforcement
- Cleaner components without auth checks
- Better security

---

### 6. **Add Error Boundary Component**

**Create `src/components/ErrorBoundary.tsx`**:
```typescript
'use client'

import React, { ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-2">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message}
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
```

---

### 7. **Create Type-Safe Response Handlers**

**Update `src/lib/apiResponse.ts`** with Response Wrappers:
```typescript
// Type-safe response creation
export interface HttpResponse<T> {
  status: number
  body: T
}

export function createApiResponse<T>(
  data: T,
  statusCode: number = 200,
  message?: string
): HttpResponse<ApiSuccess<T>> {
  return {
    status: statusCode,
    body: {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    },
  }
}
```

---

### 8. **Add Pagination Support**

**Create `src/lib/pagination.ts`**:
```typescript
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
  }
}

export function calculatePagination(
  total: number,
  page: number,
  limit: number
): PaginatedResponse<any>['pagination'] {
  return {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  }
}
```

**Update Posts API**:
```typescript
export async function GET(req: NextRequest) {
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1')
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10')

  const skip = (page - 1) * limit

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      skip,
      take: limit,
      include: { author: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.post.count(),
  ])

  return successResponse({
    data: posts,
    pagination: calculatePagination(total, page, limit),
  })
}
```

---

## 📊 PHASE 3: ADVANCED FEATURES (3-4 weeks)

### 9. **Add Request/Response Logging**

**Create `src/lib/logger.ts`**:
```typescript
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export class Logger {
  static log(level: LogLevel, message: string, data?: unknown) {
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] [${level}] ${message}`, data)
  }

  static debug(message: string, data?: unknown) {
    this.log(LogLevel.DEBUG, message, data)
  }

  static info(message: string, data?: unknown) {
    this.log(LogLevel.INFO, message, data)
  }

  static warn(message: string, data?: unknown) {
    this.log(LogLevel.WARN, message, data)
  }

  static error(message: string, error?: Error | unknown) {
    this.log(LogLevel.ERROR, message, error)
  }
}
```

---

### 10. **Add Rate Limiting**

**Create `src/lib/rateLimit.ts`**:
```typescript
import { LRUCache } from 'lru-cache'

const cache = new LRUCache<string, number[]>({
  max: 500,
  ttl: 1000 * 60, // 1 minute
})

export function rateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 60 * 1000
): boolean {
  const now = Date.now()
  const requests = cache.get(key) || []

  const validRequests = requests.filter(time => time > now - windowMs)

  if (validRequests.length >= limit) {
    return false
  }

  cache.set(key, [...validRequests, now])
  return true
}
```

---

### 11. **Add Caching with React Query**

**Install**: `npm install @tanstack/react-query`

**Create `src/lib/queryClient.ts`**:
```typescript
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
    },
  },
})
```

**Update `src/app/layout.tsx`**:
```typescript
'use client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'

export default function RootLayout({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

---

### 12. **Add Form Validation on Frontend**

**Install**: `npm install react-hook-form`

**Update Forms** to use react-hook-form for better validation handling

---

## 📈 CODE ORGANIZATION RECOMMENDATIONS

### Current Structure:
```
src/
├── app/                 # Pages and API routes
├── components/          # React components (to be expanded)
├── lib/                 # Utilities and helpers (good)
└── types/              # TypeScript types (good)
```

### Recommended Structure:
```
src/
├── app/                 # Pages and API routes
├── components/          # React components
│   ├── common/         # Reusable UI components
│   ├── auth/           # Auth-related components
│   ├── posts/          # Post-related components
│   └── forms/          # Form components
├── hooks/              # Custom React hooks (NEW)
├── services/           # API & Database services (NEW)
├── lib/                # Utilities and helpers
├── types/              # TypeScript types
├── middleware.ts       # Next.js middleware (NEW)
├── config.ts           # App configuration (NEW)
└── constants.ts        # Constants and enums (NEW)
```

---

## 🧪 TESTING SUGGESTIONS

### Unit Tests
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

### Integration Tests
```bash
npm install --save-dev @testing-library/user-event
```

### E2E Tests
```bash
npm install --save-dev cypress
```

---

## 🚀 PERFORMANCE OPTIMIZATIONS

1. **Image Optimization**: Use Next.js `Image` component
2. **Code Splitting**: Implement dynamic imports for heavy components
3. **Bundle Analysis**: Add `@next/bundle-analyzer`
4. **Memoization**: Use `React.memo`, `useMemo`, `useCallback` strategically

---

## 🔒 SECURITY IMPROVEMENTS

1. **CORS Policy**: Configure CORS middleware
2. **CSRF Protection**: Add CSRF tokens for state-changing requests
3. **Content Security Policy**: Add CSP headers
4. **API Key Rotation**: Implement secret rotation strategy
5. **SQL Injection**: Already protected by Prisma (good!)

---

## 📝 DEPLOYMENT CHECKLIST

Before deploying to production:

- [ ] Environment variables set correctly
- [ ] Error handling complete
- [ ] Rate limiting implemented
- [ ] Logging configured
- [ ] Database migrations tested
- [ ] SSL/TLS certificates setup
- [ ] CORS policy configured
- [ ] Tests passing
- [ ] Performance metrics acceptable
- [ ] Security audit passed

---

## 🎯 RECOMMENDED PRIORITY ORDER

1. **Week 1**: Implement API Service Layer + Custom Hooks
2. **Week 2**: Extract Components + Database Service Layer
3. **Week 3**: Middleware + Error Boundary
4. **Week 4**: Pagination + Rate Limiting
5. **Week 5+**: Caching + Advanced Features

---

## 📊 METRICS TO TRACK

- Build time
- Bundle size
- API response time
- Error rate
- User engagement
- Performance scores (Lighthouse)

---

## 🤝 CODE REVIEW GUIDELINES

When reviewing pull requests:
- [ ] Follows established patterns
- [ ] No code duplication
- [ ] Proper error handling
- [ ] Type-safe
- [ ] Documented
- [ ] Tests included

---

**Last Updated**: February 2, 2026
**Status**: Ready for phased implementation
