'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, LogOut, Settings, Bell, Menu } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/layout/Sidebar'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { useTheme } from '@/contexts/ThemeContext'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalGenerations: 0,
    creditsUsed: 0,
    creditsRemaining: 0
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

      await fetchDashboardData(user.id)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          router.push('/login')
        } else if (session?.user) {
          setUser(session.user)
          fetchDashboardData(session.user.id)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router])

  const fetchDashboardData = async (userId: string) => {
    try {
      // Fetch user's projects
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

      if (projectsError) throw projectsError

      // Fetch user's generations
      const { data: generations, error: generationsError } = await supabase
        .from('generations')
        .select('tokens_used, created_at')
        .eq('user_id', userId)

      if (generationsError) throw generationsError

      // Fetch user profile for credits
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('credits_remaining')
        .eq('id', userId)
        .single()

      if (profileError) throw profileError

      // Calculate statistics
      const totalTokens = generations?.reduce((sum: number, gen: any) => sum + (gen.tokens_used || 0), 0) || 0

      setStats({
        totalProjects: projects?.length || 0,
        totalGenerations: generations?.length || 0,
        creditsUsed: totalTokens,
        creditsRemaining: (profile as any)?.credits_remaining || 0
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
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h1 
                      className="text-2xl font-bold transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      Dashboard
                    </h1>
                    <p 
                      className="text-sm transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                    >
                      Welcome back, {user.user_metadata?.name || user.email?.split('@')[0]}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span 
                  className="text-sm transition-colors duration-300"
                  style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                >
                  Welcome back!
                </span>
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300"
                  style={{ backgroundColor: theme === 'dark' ? '#3b82f6' : '#3b82f6' }}
                >
                  <User className="h-4 w-4" style={{ color: '#ffffff' }} />
                </div>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 
              className="text-3xl font-bold mb-2 transition-colors duration-300"
              style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
            >
              Welcome back, {user.user_metadata?.name || 'User'}!
            </h2>
            <p 
              className="transition-colors duration-300"
              style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
            >
              Here's what's happening with your projects today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div 
              className="p-6 rounded-lg border transition-colors duration-300"
              style={{
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
              }}
            >
              <h3 
                className="text-sm font-medium mb-2 transition-colors duration-300"
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
            </div>

            <div 
              className="p-6 rounded-lg border transition-colors duration-300"
              style={{
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
              }}
            >
              <h3 
                className="text-sm font-medium mb-2 transition-colors duration-300"
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
            </div>

            <div 
              className="p-6 rounded-lg border transition-colors duration-300"
              style={{
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
              }}
            >
              <h3 
                className="text-sm font-medium mb-2 transition-colors duration-300"
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
            </div>

            <div 
              className="p-6 rounded-lg border transition-colors duration-300"
              style={{
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
              }}
            >
              <h3 
                className="text-sm font-medium mb-2 transition-colors duration-300"
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
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div 
              className="rounded-lg shadow p-6 transition-colors duration-300"
              style={{
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`
              }}
            >
              <h3 
                className="text-lg font-semibold mb-4 transition-colors duration-300"
                style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
              >
                Recent Projects
              </h3>
              <div className="space-y-4">
                {recentProjects.length === 0 ? (
                  <div className="text-center py-8">
                    <p 
                      className="transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                    >
                      No projects yet. Create your first project to get started!
                    </p>
                  </div>
                ) : (
                  recentProjects.map((project, index) => (
                    <div 
                      key={project.id} 
                      className="flex items-center justify-between p-3 rounded-lg transition-colors duration-300"
                      style={{
                        backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb'
                      }}
                    >
                      <div>
                        <p 
                          className="font-medium transition-colors duration-300"
                          style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                        >
                          {project.name}
                        </p>
                        <p 
                          className="text-sm transition-colors duration-300"
                          style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                        >
                          {project.type} • {project.updated}
                        </p>
                      </div>
                      <button 
                        onClick={() => router.push(`/projects/${project.id}`)}
                        className="text-sm font-medium transition-colors duration-300 hover:opacity-80"
                        style={{ color: theme === 'dark' ? '#3b82f6' : '#2563eb' }}
                      >
                        Open
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div 
              className="rounded-lg shadow p-6 transition-colors duration-300"
              style={{
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`
              }}
            >
              <h3 
                className="text-lg font-semibold mb-4 transition-colors duration-300"
                style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
              >
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button 
                  onClick={() => router.push('/writer')}
                  className="w-full text-left px-4 py-3 rounded-lg transition-colors duration-300 hover:opacity-90"
                  style={{
                    backgroundColor: theme === 'dark' ? '#1e3a8a' : '#dbeafe',
                    color: theme === 'dark' ? '#93c5fd' : '#1e40af'
                  }}
                >
                  📝 Create New Project
                </button>
                <button 
                  onClick={() => router.push('/writer')}
                  className="w-full text-left px-4 py-3 rounded-lg transition-colors duration-300 hover:opacity-90"
                  style={{
                    backgroundColor: theme === 'dark' ? '#581c87' : '#f3e8ff',
                    color: theme === 'dark' ? '#d8b4fe' : '#6b21a8'
                  }}
                >
                  🤖 AI Writer
                </button>
                <button 
                  onClick={() => router.push('/writer')}
                  className="w-full text-left px-4 py-3 rounded-lg transition-colors duration-300 hover:opacity-90"
                  style={{
                    backgroundColor: theme === 'dark' ? '#14532d' : '#dcfce7',
                    color: theme === 'dark' ? '#86efac' : '#166534'
                  }}
                >
                  📧 Email Generator
                </button>
                <button 
                  onClick={() => router.push('/writer')}
                  className="w-full text-left px-4 py-3 rounded-lg transition-colors duration-300 hover:opacity-90"
                  style={{
                    backgroundColor: theme === 'dark' ? '#7c2d12' : '#fed7aa',
                    color: theme === 'dark' ? '#fb923c' : '#9a3412'
                  }}
                >
                  💬 Social Media
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
