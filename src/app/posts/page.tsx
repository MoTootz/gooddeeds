'use client'

import { useState, useEffect } from 'react'
import { LoadingSpinner } from '@/components/LoadingSpinner'

interface Post {
  id: string
  title: string
  description: string
  type: string
  category: string
  author: { name: string }
  createdAt: string
}

interface PaginationMeta {
  page: number
  limit: number
  total: number
  pages: number
  hasMore: boolean
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    // Fetch posts from API with pagination
    const fetchPosts = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `/api/posts?page=${currentPage}&limit=${pageSize}`
        )
        const json = await response.json()

        if (json.success && Array.isArray(json.data)) {
          setPosts(json.data)
          if (json.pagination) {
            setPagination(json.pagination)
          }
          setError(null)
        } else {
          setError(json.message || 'Failed to load posts')
          setPosts([])
        }
      } catch (err) {
        console.error('Error fetching posts:', err)
        setError('Error fetching posts')
        setPosts([])
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [currentPage])

  const filteredPosts = filter === 'all' 
    ? posts 
    : posts.filter(post => post.type === filter)

  if (loading) {
    return <LoadingSpinner message="Loading posts..." />
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-red-100 text-red-700 p-4 rounded">
            {error}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Community Posts</h1>

        {/* Filter Buttons */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('offer')}
            className={`px-4 py-2 rounded ${filter === 'offer' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
          >
            Offers
          </button>
          <button
            onClick={() => setFilter('request')}
            className={`px-4 py-2 rounded ${filter === 'request' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
          >
            Requests
          </button>
        </div>

        {/* Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No posts found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map(post => (
              <div key={post.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-800">{post.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    post.type === 'offer' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {post.type}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{post.description}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span className="bg-gray-100 px-2 py-1 rounded">{post.category}</span>
                  <span>{post.author.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {pagination && pagination.pages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700"
            >
              Previous
            </button>

            <div className="text-gray-700 font-semibold">
              Page {pagination.page} of {pagination.pages}
            </div>

            <button
              onClick={() =>
                setCurrentPage(prev => Math.min(pagination.pages, prev + 1))
              }
              disabled={!pagination.hasMore}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
