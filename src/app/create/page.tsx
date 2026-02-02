'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from '@/hooks/useForm'
import { FormInput } from '@/components/FormInput'
import { ApiService } from '@/services/api'
import { ROUTES } from '@/lib/constants'

interface CreatePostFormData {
  title: string
  description: string
  type: string
  category: string
}

export default function CreatePostPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken')
    if (!token) {
      router.push(ROUTES.LOGIN)
    }
  }, [router])

  const { values, errors, isSubmitting, handleChange, handleSubmit, setErrors } =
    useForm<CreatePostFormData>(
      {
        title: '',
        description: '',
        type: 'offer',
        category: 'physical',
      },
      async values => {
        const token = localStorage.getItem('authToken')
        if (!token) {
          setErrors({ submit: 'Authentication required' })
          return
        }

        const response = await ApiService.createPost(values, token)

        if (response.success) {
          router.push(ROUTES.POSTS)
        } else {
          setErrors({
            submit: response.message || 'Failed to create post',
          })
        }
      }
    )

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Create a New Post</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8">
          {errors.submit && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
              {errors.submit}
            </div>
          )}

          <FormInput
            label="Title *"
            type="text"
            name="title"
            value={values.title}
            onChange={handleChange}
            required
            placeholder="What do you want to offer or request?"
          />

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={values.description}
              onChange={e => {
                const event = {
                  ...e,
                  target: { ...e.target, name: 'description' },
                } as any
                handleChange(event)
              }}
              required
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Provide more details..."
            ></textarea>
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Type *
              </label>
              <select
                name="type"
                value={values.type}
                onChange={e => {
                  const event = {
                    ...e,
                    target: { ...e.target, name: 'type' },
                  } as any
                  handleChange(event)
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="offer">Offer Help</option>
                <option value="request">Request Help</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Category *
              </label>
              <select
                name="category"
                value={values.category}
                onChange={e => {
                  const event = {
                    ...e,
                    target: { ...e.target, name: 'category' },
                  } as any
                  handleChange(event)
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="physical">Physical Help</option>
                <option value="monetary">Monetary</option>
                <option value="goods">Goods/Items</option>
                <option value="mentoring">Mentoring/Skills</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isSubmitting ? 'Creating...' : 'Create Post'}
          </button>
        </form>
      </div>
    </main>
  )
}
