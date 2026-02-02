'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/useAuth'
import { ROUTES, ERROR_MESSAGES } from '@/lib/constants'
import { useForm } from '@/hooks/useForm'
import { FormInput } from '@/components/FormInput'
import { ApiService } from '@/services/api'

interface SignupFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

/**
 * Signup page component
 * Allows new users to create an account
 */
export default function SignupPage() {
  const router = useRouter()
  const { login } = useAuth()

  const { values, errors, isSubmitting, handleChange, handleSubmit, setErrors } =
    useForm<SignupFormData>(
      {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      },
      async values => {
        // Client-side validation
        if (values.password !== values.confirmPassword) {
          setErrors({ confirmPassword: 'Passwords do not match' })
          return
        }

        const response = await ApiService.signup(
          values.name,
          values.email,
          values.password
        )

        if (response.success && response.data) {
          // Use auth hook to store credentials
          login(response.data.token, response.data.user)
          router.push(ROUTES.POSTS)
        } else {
          setErrors({
            submit: response.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
          })
        }
      }
    )

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">Sign Up</h1>

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
              label="Full Name"
              type="text"
              name="name"
              value={values.name}
              onChange={handleChange}
              required
              placeholder="John Doe"
            />

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
              placeholder="Min 8 chars, uppercase, lowercase, number, special char"
            />
            <p className="text-xs text-gray-600 mb-4">
              Password must contain: uppercase, lowercase, number, and special
              character (@$!%*?&)
            </p>

            <FormInput
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={values.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
              placeholder="Re-enter your password"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {isSubmitting ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="text-center mt-6">
            Already have an account?{' '}
            <Link href={ROUTES.LOGIN} className="text-blue-600 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
