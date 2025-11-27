'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  User, 
  Mail, 
  Calendar, 
  CreditCard, 
  Settings, 
  LogOut, 
  Edit2,
  Save,
  X,
  Shield,
  Zap,
  TrendingUp,
  Award,
  Bell,
  Eye,
  EyeOff
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/layout/Sidebar'
import { useTheme } from '@/contexts/ThemeContext'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { getUserCredits } from '@/lib/credits'
import { hashPassword } from '@/lib/password'
import Toast, { ToastType } from '@/components/ui/Toast'

export default function Profile() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [creditsRemaining, setCreditsRemaining] = useState(0)
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalGenerations: 0,
    joinDate: ''
  })
  
  // Profile form
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [country, setCountry] = useState('')
  const [language, setLanguage] = useState('English (US)')
  
  // Password change fields
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  
  // Error and success states
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  
  // Store original values for cancel functionality
  const [originalValues, setOriginalValues] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    country: '',
    language: 'English (US)'
  })
  
  const router = useRouter()
  const { theme } = useTheme()

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type })
  }

  const closeToast = () => {
    setToast(null)
  }

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (!user) {
        router.push('/login')
        return
      }

      // Fetch user profile data
      await fetchProfileData(user.id, user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          router.push('/login')
        } else if (session?.user) {
          setUser(session.user)
          fetchProfileData(session.user.id, session.user)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router])

  const fetchProfileData = async (userId: string, currentUser: any) => {
    try {
      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) throw profileError

      // Fetch projects count
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', userId)

      if (projectsError) throw projectsError

      // Fetch generations count
      const { data: generations, error: generationsError } = await supabase
        .from('generations')
        .select('id')
        .eq('user_id', userId)

      if (generationsError) throw generationsError

      // Fetch credits
      const credits = await getUserCredits(userId)

      const fetchedFullName = (profile as any)?.full_name || currentUser?.user_metadata?.name || ''
      const fetchedEmail = currentUser?.email || ''
      const fetchedPhoneNumber = (profile as any)?.phone_number || currentUser?.user_metadata?.phone || ''
      const fetchedCountry = (profile as any)?.country || currentUser?.user_metadata?.country || ''
      const fetchedLanguage = (profile as any)?.language || currentUser?.user_metadata?.language || 'English (US)'

      setFullName(fetchedFullName)
      setEmail(fetchedEmail)
      setPhoneNumber(fetchedPhoneNumber)
      setCountry(fetchedCountry)
      setLanguage(fetchedLanguage)
      
      // Store original values for cancel functionality
      setOriginalValues({
        fullName: fetchedFullName,
        email: fetchedEmail,
        phoneNumber: fetchedPhoneNumber,
        country: fetchedCountry,
        language: fetchedLanguage
      })
      
      setCreditsRemaining(credits)
      setStats({
        totalProjects: projects?.length || 0,
        totalGenerations: generations?.length || 0,
        joinDate: new Date(currentUser?.created_at || '').toLocaleDateString()
      })
    } catch (error) {
      console.error('Error fetching profile data:', error)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      // Handle password change if passwords are provided
      if (currentPassword || newPassword || confirmNewPassword) {
        // Validate password fields
        if (!currentPassword || !newPassword || !confirmNewPassword) {
          throw new Error('Please fill in all password fields')
        }
        
        if (newPassword !== confirmNewPassword) {
          throw new Error('New passwords do not match')
        }
        
        if (newPassword.length < 8) {
          throw new Error('Password must be at least 8 characters long')
        }
        
        // Verify current password and update to new password
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword
        })
        
        if (signInError) {
          throw new Error('Current password is incorrect')
        }
        
        // Update password in Supabase Auth
        const { error: authPasswordError } = await supabase.auth.updateUser({
          password: newPassword
        })

        if (authPasswordError) throw authPasswordError
        
        // Hash the new password and store in profiles table
        const hashedPassword = await hashPassword(newPassword)
        const { error: profilePasswordError } = await (supabase
          .from('profiles')
          .update({
            password_hash: hashedPassword
          })
          .eq('id', user.id) as any)

        if (profilePasswordError) {
          console.error('Error storing new password hash:', profilePasswordError)
          // Don't fail the operation, but log the error
        }
        
        // Track password reset in database
        const trackingQuery = supabase.rpc('record_password_reset', {
          user_id: user.id
        } as any)
        const { error: trackingError } = await (trackingQuery as any)

        if (trackingError) {
          console.warn('Password reset tracking failed:', trackingError)
          // Don't throw error - password was still updated successfully
        }

        // Show success toast for password update
        showToast('Password updated successfully!', 'success')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmNewPassword('')
        setShowCurrentPassword(false)
        setShowNewPassword(false)
        setShowConfirmNewPassword(false)
      }
      
      // Update profiles table with all fields (except email)
      const { error: profileError } = await (supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone_number: phoneNumber,
          country: country,
          language: language
        })
        .eq('id', user.id) as any)

      if (profileError) throw profileError

      // Update user metadata for profile fields
      const { error: authError } = await supabase.auth.updateUser({
        data: { 
          name: fullName,
          phone: phoneNumber,
          country: country,
          language: language
        }
      })

      if (authError) throw authError

      // Handle email change separately if it's different from current email
      if (email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: email
        })
        
        if (emailError) {
          // Email change failed, but other data was saved
          console.warn('Email change requires verification:', emailError.message)
          showToast('Profile updated! Email change requires verification - please check your email.', 'info')
        } else {
          showToast('Profile updated! Please check your email to verify the new address.', 'info')
        }
      } else {
        // No password change - just profile update
        showToast('Profile updated successfully!', 'success')
      }

      // Update local state
      setEditing(false)
      console.log('Profile updated successfully')
    } catch (error: any) {
      console.error('Error updating profile:', error)
      showToast(error.message || 'Failed to update profile. Please try again.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const handleChangePassword = () => {
    setChangingPassword(true)
  }

  const handleCancelPasswordChange = () => {
    setChangingPassword(false)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmNewPassword('')
    setShowCurrentPassword(false)
    setShowNewPassword(false)
    setShowConfirmNewPassword(false)
  }

  const handleSavePassword = async () => {
    setSaving(true)
    setError('')
    
    try {
      // Validate passwords
      if (!currentPassword || !newPassword || !confirmNewPassword) {
        throw new Error('Please fill in all password fields')
      }
      
      if (newPassword !== confirmNewPassword) {
        throw new Error('New passwords do not match')
      }
      
      if (newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long')
      }

      // Verify current password by signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      })
      
      if (signInError) {
        throw new Error('Current password is incorrect')
      }
      
      // Update password in Supabase Auth
      const { error: authPasswordError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (authPasswordError) throw authPasswordError
      
      // Hash the new password and store in profiles table
      const hashedPassword = await hashPassword(newPassword)
      const { error: profilePasswordError } = await (supabase
        .from('profiles')
        .update({
          password_hash: hashedPassword
        })
        .eq('id', user.id) as any)

      if (profilePasswordError) {
        console.error('Error storing new password hash:', profilePasswordError)
        // Don't fail the operation, but log the error
      }
      
      // Track password reset in database
      const trackingQuery = supabase.rpc('record_password_reset', {
        user_id: user.id
      } as any)
      const { error: trackingError } = await (trackingQuery as any)

      if (trackingError) {
        console.warn('Password reset tracking failed:', trackingError)
        // Don't throw error - password was still updated successfully
      }

      // Show success toast for password update
      showToast('Password updated successfully!', 'success')
      // Clear password fields and reset state
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
      setShowCurrentPassword(false)
      setShowNewPassword(false)
      setShowConfirmNewPassword(false)
      setChangingPassword(false)
    } catch (error: any) {
      showToast(error.message || 'Failed to update password', 'error')
    } finally {
      setSaving(false)
    }
  }

  const getSubscriptionBadge = () => {
    const tier = user?.user_metadata?.subscription_tier || 'free'
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      starter: 'bg-blue-100 text-blue-800',
      pro: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-yellow-100 text-yellow-800'
    }
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[tier as keyof typeof colors] || colors.free}`}>
        {tier.charAt(0).toUpperCase() + tier.slice(1)} Plan
      </span>
    )
  }

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center transition-colors duration-300"
        style={{ backgroundColor: theme === 'dark' ? '#111827' : '#ffffff' }}
      >
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto transition-colors duration-300"
            style={{ borderColor: theme === 'dark' ? '#3b82f6' : '#3b82f6' }}
          ></div>
          <p 
            className="mt-4 transition-colors duration-300"
            style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
          >
            Loading profile...
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div 
      className="min-h-screen flex transition-colors duration-300"
      style={{ backgroundColor: theme === 'dark' ? '#111827' : '#ffffff' }}
    >
      <Sidebar user={user} />
      
      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Header */}
        <div 
          className="shadow-sm border-b transition-colors duration-300"
          style={{
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <h1 
                  className="text-2xl font-bold transition-colors duration-300"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                >
                  Profile
                </h1>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Single Connected Profile Section */}
          <div 
            className="rounded-xl shadow-sm border transition-colors duration-300"
            style={{
              backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
              borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
            }}
          >
            {/* Profile Header */}
            <div className="p-8 border-b transition-colors duration-300" style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-6">
                  <div 
                    className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold transition-colors duration-300"
                    style={{
                      backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
                      color: theme === 'dark' ? '#f9fafb' : '#111827'
                    }}
                  >
                    {fullName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h2 
                        className="text-2xl font-bold transition-colors duration-300"
                        style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                      >
                        {fullName || 'User'}
                      </h2>
                      {getSubscriptionBadge()}
                    </div>
                    <div className="flex items-center space-x-2 text-sm" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                      <Mail className="h-4 w-4" />
                      <span>{user?.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm mt-1" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                      <Calendar className="h-4 w-4" />
                      <span>Member since {stats.joinDate}</span>
                    </div>
                  </div>
                </div>
                
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-300"
                    style={{
                      backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
                      color: theme === 'dark' ? '#f9fafb' : '#111827'
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      <span>{saving ? 'Saving...' : 'Save'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false)
                        setFullName(originalValues.fullName)
                        setEmail(originalValues.email)
                        setPhoneNumber(originalValues.phoneNumber)
                        setCountry(originalValues.country)
                        setLanguage(originalValues.language)
                        setCurrentPassword('')
                        setNewPassword('')
                        setConfirmNewPassword('')
                        setShowCurrentPassword(false)
                        setShowNewPassword(false)
                        setShowConfirmNewPassword(false)
                      }}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-300"
                      style={{
                        backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
                        color: theme === 'dark' ? '#f9fafb' : '#111827'
                      }}
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Personal Information Section */}
            <div className="p-8 border-b transition-colors duration-300" style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
              <h3 
                className="text-lg font-semibold mb-6 transition-colors duration-300"
                style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
              >
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label 
                    className="text-sm font-medium transition-colors duration-300"
                    style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                  >
                    Full Name
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full mt-1 px-4 py-2 rounded-lg border transition-colors duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      style={{
                        backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                        borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                        color: theme === 'dark' ? '#f9fafb' : '#111827'
                      }}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p 
                      className="text-sm mt-1 transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                    >
                      {fullName || 'Not set'}
                    </p>
                  )}
                </div>
                
                <div>
                  <label 
                    className="text-sm font-medium transition-colors duration-300"
                    style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                  >
                    Email Address
                  </label>
                  {editing ? (
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full mt-1 px-4 py-2 rounded-lg border transition-colors duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      style={{
                        backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                        borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                        color: theme === 'dark' ? '#f9fafb' : '#111827'
                      }}
                      placeholder="Enter your email"
                    />
                  ) : (
                    <p 
                      className="text-sm mt-1 transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                    >
                      {user?.email}
                    </p>
                  )}
                </div>
                
                <div>
                  <label 
                    className="text-sm font-medium transition-colors duration-300"
                    style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                  >
                    Phone Number
                  </label>
                  {editing ? (
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full mt-1 px-4 py-2 rounded-lg border transition-colors duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      style={{
                        backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                        borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                        color: theme === 'dark' ? '#f9fafb' : '#111827'
                      }}
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <p 
                      className="text-sm mt-1 transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                    >
                      {phoneNumber || 'Not provided'}
                    </p>
                  )}
                </div>
                
                <div>
                  <label 
                    className="text-sm font-medium transition-colors duration-300"
                    style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                  >
                    Country
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full mt-1 px-4 py-2 rounded-lg border transition-colors duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      style={{
                        backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                        borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                        color: theme === 'dark' ? '#f9fafb' : '#111827'
                      }}
                      placeholder="Enter your country"
                    />
                  ) : (
                    <p 
                      className="text-sm mt-1 transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                    >
                      {country || 'Not provided'}
                    </p>
                  )}
                </div>
                
                <div>
                  <label 
                    className="text-sm font-medium transition-colors duration-300"
                    style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                  >
                    Language
                  </label>
                  {editing ? (
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full mt-1 px-4 py-2 rounded-lg border transition-colors duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      style={{
                        backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                        borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                        color: theme === 'dark' ? '#f9fafb' : '#111827'
                      }}
                    >
                      <option value="English (US)">English (US)</option>
                      <option value="English (UK)">English (UK)</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Italian">Italian</option>
                      <option value="Portuguese">Portuguese</option>
                      <option value="Chinese">Chinese</option>
                      <option value="Japanese">Japanese</option>
                      <option value="Korean">Korean</option>
                    </select>
                  ) : (
                    <p 
                      className="text-sm mt-1 transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                    >
                      {language}
                    </p>
                  )}
                </div>
                
                <div>
                  <label 
                    className="text-sm font-medium transition-colors duration-300"
                    style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                  >
                    Time Zone
                  </label>
                  <p 
                    className="text-sm mt-1 transition-colors duration-300"
                    style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                  >
                    {Intl.DateTimeFormat().resolvedOptions().timeZone}
                  </p>
                </div>
                
                <div>
                  <label 
                    className="text-sm font-medium transition-colors duration-300"
                    style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                  >
                    Member Since
                  </label>
                  <p 
                    className="text-sm mt-1 transition-colors duration-300"
                    style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                  >
                    {stats.joinDate}
                  </p>
                </div>
              </div>
            </div>

            {/* Account Security Section */}
            <div className="p-8 border-b transition-colors duration-300" style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
              <h3 
                className="text-lg font-semibold mb-6 transition-colors duration-300"
                style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
              >
                Account Security
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p 
                      className="font-medium transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      Two-Factor Authentication
                    </p>
                    <p 
                      className="text-sm transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                    >
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <button
                    className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors duration-300"
                    style={{
                      backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                      borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                      color: theme === 'dark' ? '#f9fafb' : '#111827'
                    }}
                  >
                    Enable
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p 
                      className="font-medium transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      Change Password
                    </p>
                    <p 
                      className="text-sm transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                    >
                      Enter your current password and choose a new one
                    </p>
                  </div>
                  
                  {!changingPassword ? (
                    <button
                      onClick={handleChangePassword}
                      className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors duration-300"
                      style={{
                        backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                        borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                        color: theme === 'dark' ? '#f9fafb' : '#111827'
                      }}
                    >
                      Change Password
                    </button>
                  ) : (
                    <div className="space-y-3 max-w-md">
                      <div>
                        <label 
                          className="text-sm font-medium transition-colors duration-300"
                          style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                        >
                          Current Password
                        </label>
                        <div className="relative mt-1">
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-4 py-2 pr-10 rounded-lg border transition-colors duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            style={{
                              backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                              borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                              color: theme === 'dark' ? '#f9fafb' : '#111827'
                            }}
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 cursor-pointer"
                            style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label 
                          className="text-sm font-medium transition-colors duration-300"
                          style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                        >
                          New Password
                        </label>
                        <div className="relative mt-1">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-2 pr-10 rounded-lg border transition-colors duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            style={{
                              backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                              borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                              color: theme === 'dark' ? '#f9fafb' : '#111827'
                            }}
                            placeholder="Enter new password (min. 8 characters)"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 cursor-pointer"
                            style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label 
                          className="text-sm font-medium transition-colors duration-300"
                          style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                        >
                          Confirm New Password
                        </label>
                        <div className="relative mt-1">
                          <input
                            type={showConfirmNewPassword ? 'text' : 'password'}
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            className="w-full px-4 py-2 pr-10 rounded-lg border transition-colors duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            style={{
                              backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                              borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                              color: theme === 'dark' ? '#f9fafb' : '#111827'
                            }}
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 cursor-pointer"
                            style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                          >
                            {showConfirmNewPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 pt-2">
                        <button
                          onClick={handleSavePassword}
                          disabled={saving}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          <Save className="h-4 w-4" />
                          <span>{saving ? 'Saving...' : 'Update Password'}</span>
                        </button>
                        <button
                          onClick={handleCancelPasswordChange}
                          className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-300"
                          style={{
                            backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
                            color: theme === 'dark' ? '#f9fafb' : '#111827'
                          }}
                        >
                          <X className="h-4 w-4" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p 
                      className="font-medium transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      Login Sessions
                    </p>
                    <p 
                      className="text-sm transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                    >
                      Manage active sessions across devices
                    </p>
                  </div>
                  <button
                    className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors duration-300"
                    style={{
                      backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                      borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                      color: theme === 'dark' ? '#f9fafb' : '#111827'
                    }}
                  >
                    Manage
                  </button>
                </div>
              </div>
            </div>

            {/* Communication Preferences Section */}
            <div className="p-8 border-b transition-colors duration-300" style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
              <h3 
                className="text-lg font-semibold mb-6 transition-colors duration-300"
                style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
              >
                Communication Preferences
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p 
                      className="font-medium transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      Email Notifications
                    </p>
                    <p 
                      className="text-sm transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                    >
                      Receive updates about your account and new features
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div 
                      className="w-11 h-6 rounded-full peer transition-colors duration-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                      style={{
                        backgroundColor: theme === 'dark' ? '#374151' : '#d1d5db'
                      }}
                    ></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p 
                      className="font-medium transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      Marketing Communications
                    </p>
                    <p 
                      className="text-sm transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                    >
                      Receive product updates and promotional offers
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div 
                      className="w-11 h-6 rounded-full peer transition-colors duration-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                      style={{
                        backgroundColor: theme === 'dark' ? '#374151' : '#d1d5db'
                      }}
                    ></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p 
                      className="font-medium transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      Usage Reports
                    </p>
                    <p 
                      className="text-sm transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                    >
                      Monthly summaries of your account activity
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div 
                      className="w-11 h-6 rounded-full peer transition-colors duration-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                      style={{
                        backgroundColor: theme === 'dark' ? '#374151' : '#d1d5db'
                      }}
                    ></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Data & Privacy Section */}
            <div className="p-8">
              <h3 
                className="text-lg font-semibold mb-6 transition-colors duration-300"
                style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
              >
                Data & Privacy
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p 
                      className="font-medium transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      Download Your Data
                    </p>
                    <p 
                      className="text-sm transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                    >
                      Get a copy of all your personal information
                    </p>
                  </div>
                  <button
                    className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors duration-300"
                    style={{
                      backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                      borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                      color: theme === 'dark' ? '#f9fafb' : '#111827'
                    }}
                  >
                    Request
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p 
                      className="font-medium transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      Delete Account
                    </p>
                    <p 
                      className="text-sm transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                    >
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <button
                    className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors duration-300"
                    style={{
                      backgroundColor: theme === 'dark' ? '#dc2626' : '#dc2626',
                      borderColor: theme === 'dark' ? '#dc2626' : '#dc2626',
                      color: '#ffffff'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
    </div>
  )
}