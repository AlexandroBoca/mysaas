'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Lock, ArrowRight, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/contexts/ThemeContext'
import ThemeToggle from '@/components/ui/ThemeToggle'

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme } = useTheme()

  useEffect(() => {
    // Check if we have the reset token in the URL
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    
    if (!accessToken || !refreshToken) {
      setError('Invalid or expired reset link. Please try again.')
    }
  }, [searchParams])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Validate passwords
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long')
      setLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const accessToken = searchParams.get('access_token')
      const refreshToken = searchParams.get('refresh_token')

      if (!accessToken || !refreshToken) {
        throw new Error('Invalid reset tokens')
      }

      // Set the session with the tokens from the reset link
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })

      if (sessionError) {
        throw sessionError
      }

      // Update the user's password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) {
        throw updateError
      }

      setSuccess('Password has been successfully reset!')
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)

    } catch (err: any) {
      setError(err.message || 'An error occurred while resetting your password')
    } finally {
      setLoading(false)
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
        <div className="text-center mb-8">
          <div className="flex justify-end mb-4">
            <ThemeToggle />
          </div>
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Lock className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Reset Password
          </h1>
          <p 
            className="transition-colors duration-300"
            style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
          >
            Create your new password
          </p>
        </div>

        <div 
          className="rounded-2xl shadow-xl p-8 transition-colors duration-300"
          style={{
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`
          }}
        >
          <form onSubmit={handleResetPassword} className="space-y-6">
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

            {success && (
              <div 
                className="px-4 py-3 rounded-lg text-sm transition-colors duration-300 flex items-center space-x-2"
                style={{
                  backgroundColor: theme === 'dark' ? '#14532d' : '#f0fdf4',
                  borderColor: theme === 'dark' ? '#166534' : '#bbf7d0',
                  color: theme === 'dark' ? '#86efac' : '#166534'
                }}
              >
                <Check className="h-4 w-4" />
                <span>{success}</span>
              </div>
            )}

            <div>
              <label 
                htmlFor="new-password" 
                className="block text-sm font-medium mb-2 transition-colors duration-300"
                style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
              >
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock 
                    className="h-5 w-5 transition-colors duration-300" 
                    style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }} 
                  />
                </div>
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full pl-10 pr-10 py-3 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                  style={{
                    backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                    borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                    color: theme === 'dark' ? '#f9fafb' : '#111827'
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
              <p className="text-xs mt-1" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                Must be at least 8 characters long
              </p>
            </div>

            <div>
              <label 
                htmlFor="confirm-password" 
                className="block text-sm font-medium mb-2 transition-colors duration-300"
                style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
              >
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock 
                    className="h-5 w-5 transition-colors duration-300" 
                    style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }} 
                  />
                </div>
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full pl-10 pr-10 py-3 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                  style={{
                    backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                    borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                    color: theme === 'dark' ? '#f9fafb' : '#111827'
                  }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
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

            <button
              type="submit"
              disabled={loading || success !== ''}
              className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Resetting...' : success ? 'Success!' : 'Reset Password'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}>
              Remember your password?{' '}
              <Link href="/login" className="font-medium hover:opacity-80" style={{ color: theme === 'dark' ? '#3b82f6' : '#2563eb' }}>
                Back to Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
