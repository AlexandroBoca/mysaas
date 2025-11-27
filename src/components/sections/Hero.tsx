import { ArrowRight, Play, Star, Zap, FileText, Users, TrendingUp } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import Link from 'next/link'

export default function Hero() {
  const { theme } = useTheme()
  
  return (
    <section 
      id="home" 
      className="pt-16 min-h-screen flex items-center transition-colors duration-300"
      style={{
        background: theme === 'dark' 
          ? 'linear-gradient(to bottom right, #1f2937, #111827, #1f2937)'
          : 'linear-gradient(to bottom right, #dbeafe, #ffffff, #ede9fe)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div 
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300"
              style={{
                backgroundColor: theme === 'dark' ? '#1e3a8a' : '#dbeafe',
                color: theme === 'dark' ? '#93c5fd' : '#1e40af'
              }}
            >
              <Zap className="h-4 w-4" />
              <span>AI-Powered Content Generation</span>
            </div>
            
            <h1 
              className="text-4xl md:text-6xl font-bold leading-tight transition-colors duration-300"
              style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
            >
              Transform Your Content with
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {' '}AI-Powered Excellence
              </span>
            </h1>
            
            <p 
              className="text-lg leading-relaxed max-w-lg transition-colors duration-300"
              style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
            >
              We offer an advanced AI-powered content generation platform that helps businesses, creators, and professionals produce high-quality, engaging content at scale. From blog posts and marketing copy to technical documentation and creative writing, our intelligent algorithms understand your context, tone, and objectives to deliver content that resonates with your target audience.
            </p>

            <div className="grid grid-cols-3 gap-6 max-w-lg">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold" style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                  10M+
                </div>
                <div className="text-sm" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                  Content Pieces
                </div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold" style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                  50K+
                </div>
                <div className="text-sm" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                  Active Users
                </div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold" style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
                  95%
                </div>
                <div className="text-sm" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                  Satisfaction
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/signup"
                className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg hover:shadow-xl transition-all font-medium"
              >
                Start Creating Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              
              <button 
                className="inline-flex items-center justify-center px-8 py-4 rounded-lg border transition-all font-medium hover:opacity-90"
                style={{
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                  borderColor: theme === 'dark' ? '#374151' : '#d1d5db',
                  color: theme === 'dark' ? '#f9fafb' : '#111827'
                }}
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </button>
            </div>
            
            <div className="flex items-center space-x-8 pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 border-2 border-white"
                  />
                ))}
              </div>
              <div>
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                  <span className="font-semibold">50,000+</span> creators trust our platform
                </p>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative animate-float">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl transform rotate-6 opacity-20"></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 animate-fade-in">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <FileText className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-sm font-medium" style={{ color: theme === 'dark' ? '#374151' : '#6b7280' }}>
                        AI Content Generation
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg w-1/3"></div>
                    <div className="h-8 bg-gray-200 rounded-lg w-1/3"></div>
                    <div className="h-8 bg-gray-200 rounded-lg w-1/3"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
