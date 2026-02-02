import prisma from '@/lib/prisma'

export class UserService {
  static async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true },
    })
  }

  static async getUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } })
  }

  static async createUser(data: {
    name: string
    email: string
    password: string
  }) {
    return prisma.user.create({ data })
  }
}

export class PostService {
  static async getAllPosts(options?: { skip?: number; take?: number }) {
    return prisma.post.findMany({
      include: { author: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      ...(options && {
        skip: options.skip,
        take: options.take,
      }),
    })
  }

  static async getPostCount() {
    return prisma.post.count()
  }

  static async createPost(data: {
    title: string
    description: string
    type: string
    category: string
    authorId: string
  }) {
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
