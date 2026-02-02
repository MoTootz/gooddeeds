// Database types
export interface User {
  id: string
  email: string
  name: string
  bio?: string
  avatar?: string
  location?: string
  createdAt: Date
  updatedAt: Date
}

export interface Post {
  id: string
  title: string
  description: string
  type: 'offer' | 'request'
  category: string
  status: 'active' | 'completed' | 'closed'
  authorId: string
  author: User
  createdAt: Date
  updatedAt: Date
}

export interface Comment {
  id: string
  content: string
  postId: string
  userId: string
  createdAt: Date
}

export interface Message {
  id: string
  content: string
  senderId: string
  receiverId: string
  createdAt: Date
}
// API Response types
export interface ApiSuccess<T = any> {
  success: true
  data: T
  message?: string
  timestamp?: string
}

export interface ApiError {
  success: false
  message: string
  error?: string
  timestamp?: string
}