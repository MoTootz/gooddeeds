'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/useAuth'
import { ROUTES, ERROR_MESSAGES } from '@/lib/constants'
import { useForm } from '@/hooks/useForm'
import { FormInput } from '@/components/FormInput'
import { ApiService } from '@/services/api'

interface LoginFormData {
  email: string
  password: string
}

/**
 * Login page component
 * Allows users to authenticate with email and password
 */
export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()

  const { values, errors, isSubmitting, handleChange, handleSubmit, setErrors } =
    useForm<LoginFormData>(
      {
        email: '',
        password: '',
      },
      async values => {
        const response = await ApiService.login(values.email, values.password)

        if (response.success && response.data) {
          // Use auth hook to store credentials
          login(response.data.token, response.data.user)
          router.push(ROUTES.POSTS)
        } else {
          setErrors({
            submit: response.message || ERROR_MESSAGES.INVALID_CREDENTIALS,
          })
        }
      }
    )

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>

          {errors.submit && (
            <div
              className="mb-4 p-4 bg-red-100 text-red-700 rounded"
              role="alert"
            >
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <FormInput
              label="Email"
              type="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
            />

            <FormInput
              label="Password"
              type="password"
              name="password"
              value={values.password}
              onChange={handleChange}
              required
              placeholder="Your password"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center mt-6">
            Don&apos;t have an account?{' '}
            <Link href={ROUTES.SIGNUP} className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
