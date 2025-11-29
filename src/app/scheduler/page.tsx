'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Calendar, 
  Linkedin, 
  Twitter, 
  Instagram, 
  Facebook,
  Plus,
  CheckCircle,
  Clock,
  Eye,
  Users,
  Search
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/layout/Sidebar'

interface ScheduledPost {
  id: string
  content: string
  platforms: string[]
  scheduledDate: string
  scheduledTime: string
  status: 'scheduled' | 'posted' | 'failed' | 'draft'
  createdAt: string
  postedAt?: string
  engagement?: {
    likes: number
    comments: number
    shares: number
    reach: number
  }
}

interface ConnectedAccount {
  id: string
  platform: string
  username: string
  displayName: string
  isActive: boolean
  connectedAt: string
}

export default function ContentScheduler() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([])
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Form state
  const [postContent, setPostContent] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  
  const router = useRouter()

  const platforms = [
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0077B5' },
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: '#1DA1F2' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2' }
  ]

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }
        setUser(user)
        await fetchData(user.id)
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }
    getUser()
  }, [router])

  const fetchData = async (userId: string) => {
    // Mock data for clean demo
    const mockPosts: ScheduledPost[] = [
      {
        id: '1',
        content: 'Excited to announce our latest AI-powered content generation platform! 🚀 #AI #Marketing',
        platforms: ['linkedin', 'twitter'],
        scheduledDate: '2024-01-15',
        scheduledTime: '10:00',
        status: 'scheduled',
        createdAt: '2024-01-10T10:00:00Z'
      },
      {
        id: '2',
        content: 'Behind the scenes at our development sprint! 💡',
        platforms: ['instagram'],
        scheduledDate: '2024-01-16',
        scheduledTime: '14:30',
        status: 'posted',
        createdAt: '2024-01-09T15:00:00Z',
        postedAt: '2024-01-16T14:30:00Z',
        engagement: { likes: 245, comments: 32, shares: 18, reach: 1200 }
      }
    ]
    setScheduledPosts(mockPosts)
    setConnectedAccounts([]) // Start with no connected accounts
  }

  const handleCreatePost = async () => {
    if (!postContent.trim() || selectedPlatforms.length === 0 || !scheduledDate || !scheduledTime) {
      alert('Please fill in all required fields')
      return
    }

    const newPost: ScheduledPost = {
      id: Date.now().toString(),
      content: postContent,
      platforms: selectedPlatforms,
      scheduledDate,
      scheduledTime,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    }

    setScheduledPosts(prev => [newPost, ...prev])
    setPostContent('')
    setSelectedPlatforms([])
    setScheduledDate('')
    setScheduledTime('')
    setShowCreateModal(false)
  }

  const handleConnectPlatform = async () => {
    if (!selectedPlatform) {
      alert('Please select a platform to connect')
      return
    }

    if (selectedPlatform === 'linkedin') {
      const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || process.env.LINKEDIN_CLIENT_ID
      const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/linkedin`
      const state = user?.id || 'unknown'
      
      console.log('LinkedIn OAuth Debug:', {
        clientId: clientId ? 'found' : 'undefined',
        redirectUri,
        state
      })
      
      if (!clientId) {
        alert('LinkedIn Client ID is not configured. Please check your environment variables.')
        return
      }
      
      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=r_liteprofile%20r_emailaddress%20w_member_social`
      
      console.log('LinkedIn OAuth URL:', authUrl)
      
      // Show debug info and ask user to confirm
      const proceed = confirm(`Debug LinkedIn OAuth:\n\nClient ID: ${clientId}\nRedirect URI: ${redirectUri}\n\nClick OK to proceed to LinkedIn, or Cancel to debug`)
      
      if (proceed) {
        window.location.href = authUrl
      } else {
        console.log('OAuth cancelled by user. Full URL:', authUrl)
      }
      return
    }

    if (selectedPlatform === 'facebook') {
      const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID
      const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/facebook`
      const state = user?.id || 'unknown'
      
      console.log('Facebook OAuth Debug:', {
        appId: appId ? 'found' : 'undefined',
        redirectUri,
        state
      })
      
      if (!appId || appId === 'your-facebook-app-id') {
        alert('Facebook App ID is not configured. Please set up your Facebook app first.')
        return
      }
      
      const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=email,public_profile`
      
      console.log('Facebook OAuth URL:', authUrl)
      
      const proceed = confirm(`Connect Facebook:\n\nApp ID: ${appId}\nRedirect URI: ${redirectUri}\n\nClick OK to proceed to Facebook, or Cancel to debug`)
      
      if (proceed) {
        window.location.href = authUrl
      } else {
        console.log('Facebook OAuth cancelled. Full URL:', authUrl)
      }
      return
    }

    alert(`${selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)} integration coming soon!`)
    setSelectedPlatform('')
    setShowConnectModal(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'posted':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <div className="h-4 w-4 bg-red-500 rounded-full" />
      default:
        return null
    }
  }

  const filteredPosts = scheduledPosts.filter(post => 
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
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
    <div className="min-h-screen flex bg-white dark:bg-gray-900">
      <Sidebar user={user} />
      
      <div className="flex-1">
        {/* Clean Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Content Scheduler
                </h1>
                <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                  Manage your social media content
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowConnectModal(true)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Connect Platform
                </button>
                
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Schedule Post</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-6xl mx-auto px-6 py-6">
          {/* Connected Platforms */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Connected Platforms
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {platforms.map(platform => {
                const Icon = platform.icon
                const isConnected = connectedAccounts.some(acc => acc.platform === platform.id)
                
                return (
                  <div
                    key={platform.id}
                    className="p-4 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    style={{
                      borderColor: isConnected ? platform.color : undefined
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Icon className="h-5 w-5" style={{ color: platform.color }} />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {platform.name}
                        </span>
                      </div>
                      <div
                        className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`}
                      ></div>
                    </div>
                    
                    {isConnected ? (
                      <div className="text-gray-600 dark:text-gray-400 text-sm">
                        Connected
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedPlatform(platform.id)
                          setShowConnectModal(true)
                        }}
                        className="text-sm font-medium"
                        style={{ color: platform.color }}
                      >
                        Connect
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              
              <select className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <option value="all">All Posts</option>
                <option value="scheduled">Scheduled</option>
                <option value="posted">Posted</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map(post => (
              <div
                key={post.id}
                className="rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(post.status)}
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="mb-4 text-gray-900 dark:text-white line-clamp-3">
                    {post.content}
                  </p>
                  
                  <div className="flex items-center space-x-2 mb-4">
                    {post.platforms.map(platformId => {
                      const platform = platforms.find(p => p.id === platformId)
                      if (!platform) return null
                      const Icon = platform.icon
                      return (
                        <div
                          key={platformId}
                          className="p-1.5 rounded"
                          style={{ backgroundColor: platform.color + '20' }}
                        >
                          <Icon className="h-3 w-3" style={{ color: platform.color }} />
                        </div>
                      )
                    })}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {post.scheduledDate}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {post.scheduledTime}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {post.status === 'posted' && post.engagement && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Eye className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {post.engagement.reach}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {post.engagement.likes}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="rounded-lg w-full max-w-lg bg-white dark:bg-gray-800">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Schedule New Post
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Content
                </label>
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="What would you like to post?"
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg resize-none bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Platforms
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {platforms.map(platform => {
                    const Icon = platform.icon
                    const isConnected = connectedAccounts.some(acc => acc.platform === platform.id)
                    
                    return (
                      <label
                        key={platform.id}
                        className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer ${
                          !isConnected ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        style={{
                          backgroundColor: selectedPlatforms.includes(platform.id) 
                            ? platform.color + '20' 
                            : 'transparent',
                          borderColor: selectedPlatforms.includes(platform.id) 
                            ? platform.color 
                            : '#d1d5db'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedPlatforms.includes(platform.id)}
                          onChange={(e) => {
                            if (isConnected) {
                              if (e.target.checked) {
                                setSelectedPlatforms(prev => [...prev, platform.id])
                              } else {
                                setSelectedPlatforms(prev => prev.filter(p => p !== platform.id))
                              }
                            }
                          }}
                          disabled={!isConnected}
                          className="rounded"
                        />
                        <Icon className="h-4 w-4" style={{ color: platform.color }} />
                        <span className="text-gray-900 dark:text-white">
                          {platform.name}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Date
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Time
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePost}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
              >
                Schedule Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connect Platform Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="rounded-lg w-full max-w-md bg-white dark:bg-gray-800">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Connect Social Platform
              </h3>
            </div>
            
            <div className="p-6 space-y-2">
              {platforms.map(platform => {
                const Icon = platform.icon
                const isConnected = connectedAccounts.some(acc => acc.platform === platform.id)
                
                return (
                  <div
                    key={platform.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer ${
                      isConnected ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
                    }`}
                    style={{
                      backgroundColor: selectedPlatform === platform.id 
                        ? platform.color + '20' 
                        : 'transparent',
                      borderColor: selectedPlatform === platform.id 
                        ? platform.color 
                        : '#d1d5db'
                    }}
                    onClick={() => {
                      if (!isConnected) {
                        setSelectedPlatform(platform.id)
                      }
                    }}
                  >
                    <Icon className="h-5 w-5" style={{ color: platform.color }} />
                    <div className="flex-1">
                      <div className="text-gray-900 dark:text-white">
                        {platform.name}
                      </div>
                      {isConnected && (
                        <div className="text-green-600 text-xs">
                          ✓ Connected
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setSelectedPlatform('')
                  setShowConnectModal(false)
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConnectPlatform}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
              >
                Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
