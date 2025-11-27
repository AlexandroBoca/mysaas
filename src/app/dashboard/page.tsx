'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, LogOut, Settings, Bell, Menu, TrendingUp, Activity, Zap, BarChart3, Calendar, Clock, Target, ArrowUp, ArrowDown, MoreHorizontal } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/layout/Sidebar'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { useTheme } from '@/contexts/ThemeContext'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [userName, setUserName] = useState('')
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalGenerations: 0,
    creditsUsed: 0,
    creditsRemaining: 0,
    weeklyGrowth: 12.5,
    dailyActive: 8,
    completionRate: 94.2
  })
  const [recentProjects, setRecentProjects] = useState<any[]>([])
  const router = useRouter()
  const { theme } = useTheme()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
      
      if (!user) {
        router.push('/login')
        return
      }

      await fetchDashboardData(user.id, user)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          router.push('/login')
        } else if (session?.user) {
          setUser(session.user)
          fetchDashboardData(session.user.id, session.user)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router])

  const fetchDashboardData = async (userId: string, currentUser: any) => {
    try {
      // Fetch user profile for name and credits
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, credits_remaining, credits_used')
        .eq('id', userId)
        .single()

      if (profileError) throw profileError

      // Set user name from profile or fallback to user metadata
      const displayName = (profile as any)?.full_name || currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0] || 'User'
      setUserName(displayName)

      // Fetch user's projects
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

      if (projectsError) {
        console.error('Projects error:', projectsError)
      }

      // Fetch user's generations
      const { data: generations, error: generationsError } = await supabase
        .from('generations')
        .select('created_at')
        .eq('user_id', userId)

      if (generationsError) {
        console.error('Generations error:', generationsError)
      }

      // Set stats
      setStats({
        totalProjects: projects?.length || 0,
        totalGenerations: generations?.length || 0,
        creditsUsed: (profile as any)?.credits_used || 0, // Use credits_used from profile
        creditsRemaining: (profile as any)?.credits_remaining || 0,
        weeklyGrowth: 12.5,
        dailyActive: 8,
        completionRate: 94.2
      })

      // Format recent projects
      const formattedProjects = projects?.map((project: any) => ({
        id: project.id,
        name: project.title,
        type: project.type,
        updated: getRelativeTime(project.created_at)
      })) || []

      setRecentProjects(formattedProjects)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      console.error('Error details:', {
        message: (error as any)?.message,
        details: (error as any)?.details,
        hint: (error as any)?.hint,
        code: (error as any)?.code
      })
    }
  }

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    } else {
      return 'Just now'
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
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
            Loading...
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
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 
                      className="text-2xl font-bold transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      Analytics Dashboard
                    </h1>
                    <p 
                      className="text-sm transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                    >
                      Real-time overview and insights
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors duration-300"
                  style={{
                    backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6'
                  }}
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span 
                    className="text-xs font-medium transition-colors duration-300"
                    style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                  >
                    Live
                  </span>
                </div>
                <button
                  onClick={() => router.push('/profile')}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-md cursor-pointer"
                  style={{ backgroundColor: theme === 'dark' ? '#3b82f6' : '#3b82f6' }}
                  title="Profile"
                >
                  <User className="h-5 w-5" style={{ color: '#ffffff' }} />
                </button>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 
                  className="text-3xl font-bold mb-2 transition-colors duration-300"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                >
                  Welcome back, {userName}!
                </h2>
                <p 
                  className="transition-colors duration-300"
                  style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
                >
                  Here's your performance overview for {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 cursor-pointer"
                  style={{
                    backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
                    color: theme === 'dark' ? '#f9fafb' : '#111827'
                  }}
                >
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Last 30 days
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div 
              className="p-6 rounded-xl border transition-all duration-300 hover:shadow-lg hover:scale-105 relative overflow-hidden"
              style={{
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
              }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Target className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex items-center text-green-500 text-sm font-medium">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    12%
                  </div>
                </div>
                <h3 
                  className="text-sm font-medium mb-1 transition-colors duration-300"
                  style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                >
                  Total Projects
                </h3>
                <p 
                  className="text-3xl font-bold transition-colors duration-300"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                >
                  {stats.totalProjects}
                </p>
                <p 
                  className="text-xs mt-2 transition-colors duration-300"
                  style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }}
                >
                  +2 from last month
                </p>
              </div>
            </div>

            <div 
              className="p-6 rounded-xl border transition-all duration-300 hover:shadow-lg hover:scale-105 relative overflow-hidden"
              style={{
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
              }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-full"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Zap className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex items-center text-green-500 text-sm font-medium">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    24%
                  </div>
                </div>
                <h3 
                  className="text-sm font-medium mb-1 transition-colors duration-300"
                  style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                >
                  Total Generations
                </h3>
                <p 
                  className="text-3xl font-bold transition-colors duration-300"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                >
                  {stats.totalGenerations}
                </p>
                <p 
                  className="text-xs mt-2 transition-colors duration-300"
                  style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }}
                >
                  +{Math.floor(stats.totalGenerations * 0.24)} from last month
                </p>
              </div>
            </div>

            <div 
              className="p-6 rounded-xl border transition-all duration-300 hover:shadow-lg hover:scale-105 relative overflow-hidden"
              style={{
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
              }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500/10 to-transparent rounded-bl-full"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Activity className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="flex items-center text-red-500 text-sm font-medium">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    8%
                  </div>
                </div>
                <h3 
                  className="text-sm font-medium mb-1 transition-colors duration-300"
                  style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                >
                  Credits Used
                </h3>
                <p 
                  className="text-3xl font-bold transition-colors duration-300"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                >
                  {stats.creditsUsed}
                </p>
                <p 
                  className="text-xs mt-2 transition-colors duration-300"
                  style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }}
                >
                  {stats.creditsUsed > 0 ? Math.floor((stats.creditsUsed / (stats.creditsUsed + stats.creditsRemaining)) * 100) : 0}% of total
                </p>
              </div>
            </div>

            <div 
              className="p-6 rounded-xl border transition-all duration-300 hover:shadow-lg hover:scale-105 relative overflow-hidden"
              style={{
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
              }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/10 to-transparent rounded-bl-full"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex items-center text-green-500 text-sm font-medium">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    Active
                  </div>
                </div>
                <h3 
                  className="text-sm font-medium mb-1 transition-colors duration-300"
                  style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                >
                  Credits Remaining
                </h3>
                <p 
                  className="text-3xl font-bold transition-colors duration-300"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                >
                  {stats.creditsRemaining}
                </p>
                <p 
                  className="text-xs mt-2 transition-colors duration-300"
                  style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }}
                >
                  {stats.creditsRemaining > 100 ? 'Healthy balance' : stats.creditsRemaining > 50 ? 'Low balance' : 'Critical'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Projects */}
            <div 
              className="lg:col-span-2 rounded-xl shadow-lg p-6 transition-all duration-300"
              style={{
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 
                  className="text-xl font-semibold transition-colors duration-300"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                >
                  Recent Projects
                </h3>
                <button 
                  onClick={() => router.push('/projects')}
                  className="text-sm font-medium transition-colors duration-300 hover:opacity-80 cursor-pointer"
                  style={{ color: theme === 'dark' ? '#3b82f6' : '#2563eb' }}
                >
                  View all
                </button>
              </div>
              <div className="space-y-4">
                {recentProjects.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="h-8 w-8 text-gray-400" />
                    </div>
                    <h4 
                      className="text-lg font-medium mb-2 transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      No projects yet
                    </h4>
                    <p 
                      className="mb-6 transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                    >
                      Create your first project to get started with AI-powered content generation
                    </p>
                    <button
                      onClick={() => router.push('/writer')}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer"
                    >
                      Create Project
                    </button>
                  </div>
                ) : (
                  recentProjects.map((project, index) => (
                    <div 
                      key={project.id} 
                      className="flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:shadow-md group"
                      style={{
                        backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                        border: `1px solid ${theme === 'dark' ? '#4b5563' : '#e5e7eb'}`
                      }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {project.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p 
                            className="font-medium transition-colors duration-300"
                            style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                          >
                            {project.name}
                          </p>
                          <div className="flex items-center space-x-2 text-sm">
                            <span 
                              className="px-2 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                                color: theme === 'dark' ? '#d1d5db' : '#6b7280'
                              }}
                            >
                              {project.type}
                            </span>
                            <span 
                              className="transition-colors duration-300"
                              style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                            >
                              {project.updated}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => router.push(`/projects/${project.id}`)}
                          className="px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 cursor-pointer"
                          style={{
                            backgroundColor: theme === 'dark' ? '#3b82f6' : '#2563eb',
                            color: '#ffffff'
                          }}
                        >
                          Open
                        </button>
                        <button className="p-2 rounded-lg transition-colors duration-300 hover:opacity-80 cursor-pointer"
                          style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Activity & Quick Actions */}
            <div className="space-y-6">
              {/* Activity */}
              <div 
                className="rounded-xl shadow-lg p-6 transition-all duration-300"
                style={{
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                  border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`
                }}
              >
                <h3 
                  className="text-xl font-semibold mb-6 transition-colors duration-300"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                >
                  Activity Overview
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p 
                          className="font-medium transition-colors duration-300"
                          style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                        >
                          Daily Active
                        </p>
                        <p 
                          className="text-sm transition-colors duration-300"
                          style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                        >
                          {stats.dailyActive} hours
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center text-green-500 text-sm font-medium">
                      <ArrowUp className="h-4 w-4 mr-1" />
                      15%
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Target className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p 
                          className="font-medium transition-colors duration-300"
                          style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                        >
                          Completion Rate
                        </p>
                        <p 
                          className="text-sm transition-colors duration-300"
                          style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                        >
                          {stats.completionRate}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center text-green-500 text-sm font-medium">
                      <ArrowUp className="h-4 w-4 mr-1" />
                      5%
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Zap className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p 
                          className="font-medium transition-colors duration-300"
                          style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                        >
                          Weekly Growth
                        </p>
                        <p 
                          className="text-sm transition-colors duration-300"
                          style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                        >
                          {stats.weeklyGrowth}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center text-green-500 text-sm font-medium">
                      <ArrowUp className="h-4 w-4 mr-1" />
                      2%
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div 
                className="rounded-xl shadow-lg p-6 transition-all duration-300"
                style={{
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                  border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`
                }}
              >
                <h3 
                  className="text-xl font-semibold mb-6 transition-colors duration-300"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                >
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => router.push('/writer')}
                    className="w-full text-left px-4 py-3 rounded-lg transition-all duration-300 hover:scale-105 group cursor-pointer"
                    style={{
                      backgroundColor: theme === 'dark' ? '#1e3a8a' : '#dbeafe',
                      color: theme === 'dark' ? '#93c5fd' : '#1e40af'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm">📝</span>
                        </div>
                        <span className="font-medium">Create New Project</span>
                      </div>
                      <ArrowUp className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => router.push('/writer')}
                    className="w-full text-left px-4 py-3 rounded-lg transition-all duration-300 hover:scale-105 group cursor-pointer"
                    style={{
                      backgroundColor: theme === 'dark' ? '#581c87' : '#f3e8ff',
                      color: theme === 'dark' ? '#d8b4fe' : '#6b21a8'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm">🤖</span>
                        </div>
                        <span className="font-medium">AI Writer</span>
                      </div>
                      <ArrowUp className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => router.push('/templates')}
                    className="w-full text-left px-4 py-3 rounded-lg transition-all duration-300 hover:scale-105 group cursor-pointer"
                    style={{
                      backgroundColor: theme === 'dark' ? '#14532d' : '#dcfce7',
                      color: theme === 'dark' ? '#86efac' : '#166534'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm">📧</span>
                        </div>
                        <span className="font-medium">Browse Templates</span>
                      </div>
                      <ArrowUp className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
