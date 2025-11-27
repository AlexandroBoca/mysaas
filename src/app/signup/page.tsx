'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Phone } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/contexts/ThemeContext'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { hashPassword } from '@/lib/password'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const { theme } = useTheme()

  const validatePassword = () => {
    return password.length >= 8
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (!validatePassword()) {
      setError('Password must be at least 8 characters long')
      setLoading(false)
      return
    }

    try {
      // Hash the password for storage in profiles table
      const hashedPassword = await hashPassword(password)

      // First create the user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            phone: phone,
          }
        }
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      // If signup successful, store the hashed password in profiles table
      if (data.user) {
        const { error: profileError } = await (supabase
          .from('profiles')
          .update({
            password_hash: hashedPassword
          })
          .eq('id', data.user.id) as any)

        if (profileError) {
          console.error('Error storing password hash:', profileError)
          // Don't fail the signup, but log the error
        }
      }

      setSuccess('Account created successfully! Please check your email to verify your account.')
      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 py-12 transition-colors duration-300"
      style={{
        background: theme === 'dark' 
          ? 'linear-gradient(to bottom right, #1f2937, #111827, #1f2937)'
          : 'linear-gradient(to bottom right, #dbeafe, #ffffff, #ede9fe)'
      }}
    >
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Create Account
          </h1>
          <p 
            className="transition-colors duration-300"
            style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
          >
            Join TechFlow and start building amazing things
          </p>
        </div>

        <div 
          className="rounded-2xl shadow-xl transition-colors duration-300 mb-8"
          style={{
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`
          }}
        >
          {/* Card Header with Theme Toggle */}
          <div className="flex justify-end p-4 border-b transition-colors duration-300" style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
            <ThemeToggle />
          </div>
          <form onSubmit={handleSignup} className="space-y-6 p-8 pt-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {success}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2 transition-colors duration-300" style={{ color: theme === 'dark' ? '#e5e7eb' : '#374151' }}>
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 transition-colors duration-300" style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }} />
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-3 rounded-lg border focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                  style={{
                    backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                    borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                    color: theme === 'dark' ? '#f3f4f6' : '#111827'
                  }}
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 transition-colors duration-300" style={{ color: theme === 'dark' ? '#e5e7eb' : '#374151' }}>
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 transition-colors duration-300" style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }} />
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
              <label htmlFor="phone" className="block text-sm font-medium mb-2 transition-colors duration-300" style={{ color: theme === 'dark' ? '#e5e7eb' : '#374151' }}>
                Phone Number (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 transition-colors duration-300" style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }} />
                </div>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 rounded-lg border focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                  style={{
                    backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                    borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                    color: theme === 'dark' ? '#f3f4f6' : '#111827'
                  }}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2 transition-colors duration-300" style={{ color: theme === 'dark' ? '#e5e7eb' : '#374151' }}>
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 transition-colors duration-300" style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }} />
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
                    <EyeOff className="h-5 w-5 transition-colors duration-300 hover:opacity-80" style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }} />
                  ) : (
                    <Eye className="h-5 w-5 transition-colors duration-300 hover:opacity-80" style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }} />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs transition-colors duration-300" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>Must be at least 8 characters long</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2 transition-colors duration-300" style={{ color: theme === 'dark' ? '#e5e7eb' : '#374151' }}>
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 transition-colors duration-300" style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }} />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 transition-colors duration-300 hover:opacity-80" style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }} />
                  ) : (
                    <Eye className="h-5 w-5 transition-colors duration-300 hover:opacity-80" style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }} />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                required
                className="w-4 h-4 border rounded focus:ring-blue-500 transition-colors duration-300"
                style={{
                  backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                  borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db'
                }}
              />
              <span className="ml-2 text-sm transition-colors duration-300" style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}>
                I agree to the{' '}
                <Link href="/terms" className="transition-colors duration-300 hover:opacity-80" style={{ color: theme === 'dark' ? '#3b82f6' : '#2563eb' }}>
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="transition-colors duration-300 hover:opacity-80" style={{ color: theme === 'dark' ? '#3b82f6' : '#2563eb' }}>
                  Privacy Policy
                </Link>
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>

            <div className="mt-4 text-center">
              <p className="text-sm transition-colors duration-300" style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}>
                Already have an account?{' '}
                <Link href="/login" className="font-medium transition-colors duration-300 hover:opacity-80" style={{ color: theme === 'dark' ? '#3b82f6' : '#2563eb' }}>
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
