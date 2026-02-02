import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GoodDeeds - Community Help Network',
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-4">Community Help Network</h2>
          <p className="text-xl mb-8">Connect with your neighbors. Offer help. Request assistance.</p>
          <div className="flex gap-4 justify-center">
            <a href="/posts" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
              Browse Posts
            </a>
            <a href="/create" className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700">
              Create Post
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-lg shadow">
            <h3 className="text-2xl font-bold mb-4 text-blue-600">Offer Help</h3>
            <p className="text-gray-600">Share your skills and resources with your community. Whether it&apos;s physical assistance, financial help, or goods, make a difference.</p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow">
            <h3 className="text-2xl font-bold mb-4 text-blue-600">Request Support</h3>
            <p className="text-gray-600">Need help? Post what you need and connect with community members who are willing to assist you.</p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow">
            <h3 className="text-2xl font-bold mb-4 text-blue-600">Build Community</h3>
            <p className="text-gray-600">Strengthen local bonds by helping one another. Every act of kindness strengthens our neighborhood.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-50 py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Get Started Today</h3>
          <p className="text-gray-600 mb-8">Join thousands of community members making a positive impact</p>
          <a href="/signup" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700">
            Sign Up Now
          </a>
        </div>
      </section>
    </main>
  )
}
