'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, X, ChevronDown, User, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="fixed top-0 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md z-50 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TechFlow
              </h1>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="#home" className="text-gray-900 dark:text-gray-100 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                Home
              </a>
              <a href="#features" className="text-gray-900 dark:text-gray-100 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                Features
              </a>
              <a href="#about" className="text-gray-900 dark:text-gray-100 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                About
              </a>
              <a href="#contact" className="text-gray-900 dark:text-gray-100 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                Contact
              </a>
              
              {!loading && (
                <>
                  {user ? (
                    <div className="flex items-center space-x-3">
                      <a
                        href="/dashboard"
                        className="text-gray-900 dark:text-gray-100 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                      >
                        Dashboard
                      </a>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <a
                        href="/login"
                        className="text-gray-900 dark:text-gray-100 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                      >
                        Login
                      </a>
                      <a
                        href="/signup"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
                      >
                        Sign Up
                      </a>
                    </div>
                  )}
                </>
              )}
              
              {/* Theme Toggle removed - moved to dashboard */}
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-900 dark:text-gray-100 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <a href="#home" className="text-gray-900 dark:text-gray-100 hover:text-blue-600 block px-3 py-2 text-base font-medium">
              Home
            </a>
            <a href="#features" className="text-gray-900 dark:text-gray-100 hover:text-blue-600 block px-3 py-2 text-base font-medium">
              Features
            </a>
            <a href="#about" className="text-gray-900 dark:text-gray-100 hover:text-blue-600 block px-3 py-2 text-base font-medium">
              About
            </a>
            <a href="#contact" className="text-gray-900 dark:text-gray-100 hover:text-blue-600 block px-3 py-2 text-base font-medium">
              Contact
            </a>
            
            {/* Mobile Theme Toggle removed - moved to dashboard */}
            
            {!loading && (
              <>
                {user ? (
                  <>
                    <a
                      href="/dashboard"
                      className="text-gray-900 dark:text-gray-100 hover:text-blue-600 block px-3 py-2 text-base font-medium"
                    >
                      Dashboard
                    </a>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center space-x-2 px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <a href="/login" className="text-gray-900 dark:text-gray-100 hover:text-blue-600 block px-3 py-2 text-base font-medium">
                      Login
                    </a>
                    <a href="/signup" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all text-center">
                      Sign Up
                    </a>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
