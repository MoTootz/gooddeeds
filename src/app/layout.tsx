import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GoodDeeds - Community Help Network',
  description: 'A local community platform to offer and request help',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-blue-600 text-white p-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">GoodDeeds</h1>
            <ul className="flex gap-6">
              <li><a href="/" className="hover:text-blue-200">Home</a></li>
              <li><a href="/posts" className="hover:text-blue-200">Browse Posts</a></li>
              <li><a href="/create" className="hover:text-blue-200">Create Post</a></li>
              <li><a href="/login" className="hover:text-blue-200">Login</a></li>
            </ul>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}
