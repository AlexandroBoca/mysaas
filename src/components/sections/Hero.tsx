import { ArrowRight, Play, Star } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

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
              <Star className="h-4 w-4" />
              <span>New Features Available</span>
            </div>
            
            <h1 
              className="text-4xl md:text-6xl font-bold leading-tight transition-colors duration-300"
              style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
            >
              Build Amazing
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {' '}Digital Experiences
              </span>
            </h1>
            
            <p 
              className="text-lg leading-relaxed max-w-lg transition-colors duration-300"
              style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
            >
              Transform your ideas into reality with our powerful platform. Create stunning websites, 
              applications, and digital solutions that captivate your audience.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg hover:shadow-xl transition-all font-medium">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              
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
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">10,000+</span> happy customers
                </p>
              </div>
            </div>
          </div>
          
          <div className="relative animate-float">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl transform rotate-6 opacity-20"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 animate-fade-in">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>
    </section>
  )
}
