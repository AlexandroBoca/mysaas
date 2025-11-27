'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/contexts/ThemeContext'
import ThemeToggle from '@/components/ui/ThemeToggle'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetMode, setResetMode] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [resetSuccess, setResetSuccess] = useState('')
  const router = useRouter()
  const { theme } = useTheme()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetLoading(true)
    setError('')
    setResetSuccess('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        setError(error.message)
      } else {
        setResetSuccess('Password reset link has been sent to your email!')
        setTimeout(() => {
          setResetMode(false)
          setResetSuccess('')
        }, 3000)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 transition-colors duration-300"
      style={{
        background: theme === 'dark' 
          ? 'linear-gradient(to bottom right, #1f2937, #111827, #1f2937)'
          : 'linear-gradient(to bottom right, #dbeafe, #ffffff, #ede9fe)'
      }}
    >
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p 
            className="transition-colors duration-300"
            style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
          >
            Sign in to your TechFlow account
          </p>
        </div>

        <div 
          className="rounded-2xl shadow-xl transition-colors duration-300"
          style={{
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`
          }}
        >
          {/* Card Header with Theme Toggle */}
          <div className="flex justify-end p-4 border-b transition-colors duration-300" style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
            <ThemeToggle />
          </div>
          {!resetMode ? (
            <form onSubmit={handleLogin} className="space-y-6 p-8 pt-6">
              {error && (
                <div 
                  className="px-4 py-3 rounded-lg text-sm transition-colors duration-300"
                  style={{
                    backgroundColor: theme === 'dark' ? '#7f1d1d' : '#fef2f2',
                    borderColor: theme === 'dark' ? '#991b1b' : '#fecaca',
                    color: theme === 'dark' ? '#fca5a5' : '#dc2626'
                  }}
                >
                  {error}
                </div>
              )}

              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium mb-2 transition-colors duration-300"
                  style={{ color: theme === 'dark' ? '#e5e7eb' : '#374151' }}
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail 
                      className="h-5 w-5 transition-colors duration-300" 
                      style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }} 
                    />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-3 py-3 rounded-lg border focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    style={{
                      backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                      borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                      color: theme === 'dark' ? '#f3f4f6' : '#111827'
                    }}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium mb-2 transition-colors duration-300"
                  style={{ color: theme === 'dark' ? '#e5e7eb' : '#374151' }}
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock 
                      className="h-5 w-5 transition-colors duration-300" 
                      style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }} 
                    />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-10 py-3 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    style={{
                      backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                      borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                      color: theme === 'dark' ? '#f3f4f6' : '#111827'
                    }}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff 
                        className="h-5 w-5 transition-colors duration-300 hover:opacity-80" 
                        style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }} 
                      />
                    ) : (
                      <Eye 
                        className="h-5 w-5 transition-colors duration-300 hover:opacity-80" 
                        style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }} 
                      />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 border rounded focus:ring-blue-500 transition-colors duration-300"
                    style={{
                      backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                      borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db'
                    }}
                  />
                  <span 
                    className="ml-2 text-sm transition-colors duration-300"
                    style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
                  >
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => setResetMode(true)}
                  className="text-sm transition-colors duration-300 hover:opacity-80"
                  style={{ color: theme === 'dark' ? '#3b82f6' : '#2563eb' }}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordReset} className="space-y-6 p-8 pt-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2" style={{ color: theme === 'dark' ? '#f3f4f6' : '#111827' }}>
                  Reset Password
                </h2>
                <p className="text-sm" style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}>
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              {error && (
                <div 
                  className="px-4 py-3 rounded-lg text-sm transition-colors duration-300"
                  style={{
                    backgroundColor: theme === 'dark' ? '#7f1d1d' : '#fef2f2',
                    borderColor: theme === 'dark' ? '#991b1b' : '#fecaca',
                    color: theme === 'dark' ? '#fca5a5' : '#dc2626'
                  }}
                >
                  {error}
                </div>
              )}

              {resetSuccess && (
                <div 
                  className="px-4 py-3 rounded-lg text-sm transition-colors duration-300"
                  style={{
                    backgroundColor: theme === 'dark' ? '#14532d' : '#f0fdf4',
                    borderColor: theme === 'dark' ? '#166534' : '#bbf7d0',
                    color: theme === 'dark' ? '#86efac' : '#166534'
                  }}
                >
                  {resetSuccess}
                </div>
              )}

              <div>
                <label 
                  htmlFor="reset-email" 
                  className="block text-sm font-medium mb-2 transition-colors duration-300"
                  style={{ color: theme === 'dark' ? '#e5e7eb' : '#374151' }}
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail 
                      className="h-5 w-5 transition-colors duration-300" 
                      style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }} 
                    />
                  </div>
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-3 py-3 rounded-lg border focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    style={{
                      backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                      borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                      color: theme === 'dark' ? '#f3f4f6' : '#111827'
                    }}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resetLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setResetMode(false)
                    setError('')
                    setResetSuccess('')
                  }}
                  className="w-full flex items-center justify-center px-6 py-3 rounded-lg transition-all font-medium"
                  style={{
                    backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
                    color: theme === 'dark' ? '#f3f4f6' : '#111827'
                  }}
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Don't have an account?{' '}
            <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign up
            </Link>
          </p>
          <p className="text-xs text-gray-500">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-blue-600 hover:text-blue-700 underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-700 underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
