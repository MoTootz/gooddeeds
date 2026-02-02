'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * User data structure stored in auth
 */
interface AuthUser {
  id: string
  email: string
  name: string
}

/**
 * useAuth hook return type
 */
interface UseAuthReturn {
  token: string | null
  user: AuthUser | null
  login: (token: string, user: AuthUser) => void
  logout: () => void
  isAuthenticated: boolean
}

/**
 * Sets a cookie that persists across page navigation
 * Used for both client and server-side auth verification
 */
function setAuthCookie(token: string) {
  // Create a cookie that expires in 7 days
  const expirationDate = new Date()
  expirationDate.setDate(expirationDate.getDate() + 7)

  document.cookie = `authToken=${token}; path=/; expires=${expirationDate.toUTCString()}; SameSite=Strict`
}

/**
 * Clears the auth cookie
 */
function clearAuthCookie() {
  document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict'
}

/**
 * Hook for managing authentication state
 * Provides login/logout functionality and persists auth in localStorage and cookies
 * @returns Authentication state and methods
 */
export function useAuth(): UseAuthReturn {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)

  /**
   * Load auth state from localStorage on component mount
   */
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken')
    const storedUser = localStorage.getItem('user')

    if (storedToken) {
      setToken(storedToken)
    }
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as AuthUser
        setUser(parsedUser)
      } catch (error) {
        console.error('Failed to parse stored user data:', error)
        localStorage.removeItem('user')
      }
    }
  }, [])

  /**
   * Stores auth token and user data in localStorage and cookies
   * Cookies are used by middleware for server-side auth verification
   * @param token - JWT authentication token
   * @param userData - User information to store
   */
  const login = (token: string, userData: AuthUser) => {
    // Store in localStorage for client-side access
    localStorage.setItem('authToken', token)
    localStorage.setItem('user', JSON.stringify(userData))

    // Store token in cookie for middleware access
    setAuthCookie(token)

    setToken(token)
    setUser(userData)
  }

  /**
   * Clears auth data from localStorage, cookies, and state, then redirects to home
   */
  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    clearAuthCookie()
    setToken(null)
    setUser(null)
    router.push('/')
  }

  return {
    token,
    user,
    login,
    logout,
    isAuthenticated: !!token && !!user,
  }
}
