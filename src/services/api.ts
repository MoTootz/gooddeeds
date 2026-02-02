import { ApiSuccess, ApiError } from '@/types'

interface CreatePostInput {
  title: string
  description: string
  type: string
  category: string
}

export class ApiService {
  private static readonly BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

  static async signup(
    name: string,
    email: string,
    password: string
  ): Promise<ApiSuccess<{ token: string; user: any }> | ApiError> {
    const res = await fetch(`${this.BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    return res.json()
  }

  static async login(
    email: string,
    password: string
  ): Promise<ApiSuccess<{ token: string; user: any }> | ApiError> {
    const res = await fetch(`${this.BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    return res.json()
  }

  static async getPosts(): Promise<ApiSuccess<any[]> | ApiError> {
    const res = await fetch(`${this.BASE_URL}/posts`)
    return res.json()
  }

  static async createPost(
    post: CreatePostInput,
    token: string
  ): Promise<ApiSuccess<any> | ApiError> {
    const res = await fetch(`${this.BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(post),
    })
    return res.json()
  }
}
