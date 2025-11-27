'use client'

// @ts-nocheck - Disable TypeScript checking for this file due to Supabase type inference issues

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  Tag,
  MessageSquare
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Project, Generation, Database } from '@/types/database'
import Sidebar from '@/components/layout/Sidebar'
import { useTheme } from '@/contexts/ThemeContext'
import ThemeToggle from '@/components/ui/ThemeToggle'

export default function Projects() {
  const [user, setUser] = useState<any>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const { theme } = useTheme()
  const [editType, setEditType] = useState('')
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalGenerations: 0,
    creditsUsed: 0,
    templatesUsed: 0
  })
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (!user) {
        router.push('/login')
        return
      }

      await fetchProjects(user.id)
      setLoading(false)
    }

    getUser()
  }, [router])

  const fetchProjects = async (userId: string) => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
    } else {
      setProjects(data || [])
      
      // Calculate real statistics
      await fetchStats(userId, data || [])
    }
  }

  const fetchStats = async (userId: string, userProjects: Project[]) => {
    try {
      // Get all generations for this user (just count them)
      const { data: generations, error: genError } = await supabase
        .from('generations')
        .select('id')
        .eq('user_id', userId)

      if (genError) throw genError

      // Get user profile for credits and credits used
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('credits_remaining, credits_used')
        .eq('id', userId)
        .single()

      if (profileError) throw profileError

      // Set stats with actual credits used from profiles table
      setStats({
        totalProjects: userProjects.length,
        totalGenerations: generations?.length || 0,
        creditsUsed: (profile as any)?.credits_used || 0,
        templatesUsed: (profile as any)?.credits_remaining || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleDelete = async () => {
    if (!selectedProject) return

    try {
      // Delete generations first (foreign key constraint)
      await supabase
        .from('generations')
        .delete()
        .eq('project_id', selectedProject.id)

      // Then delete the project
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', selectedProject.id)

      if (error) throw error

      // Refresh projects
      await fetchProjects(user.id)
      setShowDeleteModal(false)
      setSelectedProject(null)
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  // @ts-nocheck
  const handleEdit = async () => {
    if (!selectedProject) return

    try {
      // Use a workaround to bypass TypeScript issues
      const updateData = { title: editTitle, type: editType }
      const { error } = await (supabase.from('projects') as any).update(updateData).eq('id', selectedProject.id)

      if (error) throw error

      // Refresh projects
      await fetchProjects(user.id)
      setShowEditModal(false)
      setSelectedProject(null)
    } catch (error) {
      console.error('Error updating project:', error)
    }
  }

  const openEditModal = (project: Project) => {
    setSelectedProject(project)
    setEditTitle(project.title)
    setEditType(project.type)
    setShowEditModal(true)
  }

  const openDeleteModal = (project: Project) => {
    setSelectedProject(project)
    setShowDeleteModal(true)
  }

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'blog': return <FileText className="h-4 w-4" />
      case 'email': return <MessageSquare className="h-4 w-4" />
      case 'social': return <MessageSquare className="h-4 w-4" />
      case 'ad': return <Tag className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'blog': return 'bg-blue-100 text-blue-700'
      case 'email': return 'bg-green-100 text-green-700'
      case 'social': return 'bg-purple-100 text-purple-700'
      case 'ad': return 'bg-orange-100 text-orange-700'
      default: return 'bg-gray-100 text-gray-700'
    }
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
            Loading projects...
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
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h1 
                  className="text-2xl font-bold transition-colors duration-300"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                >
                  Projects
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                <button
                  onClick={() => router.push('/writer')}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <Plus className="h-5 w-5" />
                  <span>New Project</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div 
          className="border-b transition-colors duration-300"
          style={{
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-300" 
                  style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }} 
                />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                  style={{
                    backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                    borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                    color: theme === 'dark' ? '#f9fafb' : '#111827'
                  }}
                />
              </div>
              
              <button 
                className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-300 hover:opacity-80 cursor-pointer"
                style={{
                  backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                  borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                  color: theme === 'dark' ? '#f9fafb' : '#111827'
                }}
              >
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </button>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <FileText 
                className="h-12 w-12 mx-auto mb-4 transition-colors duration-300" 
                style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }} 
              />
              <h3 
                className="text-lg font-medium mb-2 transition-colors duration-300"
                style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
              >
                No projects yet
              </h3>
              <p 
                className="mb-4 transition-colors duration-300"
                style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
              >
                Get started by creating your first AI content project
              </p>
              <button
                onClick={() => router.push('/writer')}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
              >
                <Plus className="h-5 w-5" />
                <span>Create Project</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <div 
                  key={project.id} 
                  className="rounded-lg shadow-sm border hover:shadow-md transition-shadow transition-colors duration-300"
                  style={{
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
                  }}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div style={{ color: theme === 'dark' ? '#93c5fd' : '#2563eb' }}>
                          {getTypeIcon(project.type)}
                        </div>
                        <span 
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${getTypeColor(project.type)}`}
                        >
                          {project.type}
                        </span>
                      </div>
                      
                      <div className="relative">
                        <button
                          onClick={() => setSelectedProject(project)}
                          className="p-1 rounded-md transition-colors duration-300 cursor-pointer"
                          style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        
                        {selectedProject?.id === project.id && (
                          <div 
                            className="absolute right-0 mt-1 w-48 rounded-md shadow-lg border z-10 transition-colors duration-300"
                            style={{
                              backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                              borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
                            }}
                          >
                            <div className="py-1">
                              <button
                                onClick={() => router.push(`/projects/${project.id}`)}
                                className="flex items-center px-4 py-2 text-sm w-full text-left transition-colors duration-300 hover:opacity-80 cursor-pointer"
                                style={{ color: theme === 'dark' ? '#f9fafb' : '#374151' }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </button>
                              <button
                                onClick={() => openEditModal(project)}
                                className="flex items-center px-4 py-2 text-sm w-full text-left transition-colors duration-300 hover:opacity-80 cursor-pointer"
                                style={{ color: theme === 'dark' ? '#f9fafb' : '#374151' }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </button>
                              <button
                                onClick={() => openDeleteModal(project)}
                                className="flex items-center px-4 py-2 text-sm w-full text-left transition-colors duration-300 hover:opacity-80 cursor-pointer"
                                style={{ color: theme === 'dark' ? '#ef4444' : '#dc2626' }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <h3 
                      className="text-lg font-semibold mb-2 transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      {project.title}
                    </h3>
                    
                    <div 
                      className="flex items-center text-sm mb-4 transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(project.created_at).toLocaleDateString()}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span 
                        className="text-sm transition-colors duration-300"
                        style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                      >
                        {project.input_data ? 'Has input data' : 'No input data'}
                      </span>
                      <button
                        onClick={() => router.push(`/projects/${project.id}`)}
                        className="text-sm font-medium transition-colors duration-300 hover:opacity-80 cursor-pointer"
                        style={{ color: theme === 'dark' ? '#3b82f6' : '#2563eb' }}
                      >
                        Open →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Project</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="blog">Blog Post</option>
                  <option value="email">Email</option>
                  <option value="social">Social Media</option>
                  <option value="ad">Advertisement</option>
                  <option value="article">Article</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            
            <h2 className="text-lg font-semibold text-gray-900 mb-2 text-center">Delete Project</h2>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete "{selectedProject.title}"? This action cannot be undone and will also delete all associated generations.
            </p>
            
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
