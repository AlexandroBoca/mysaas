'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Save, 
  Bot, 
  FileText, 
  MessageSquare, 
  Tag,
  Mail,
  Copy,
  Download,
  Settings,
  ChevronRight,
  Plus,
  Calendar,
  Edit,
  Trash2
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Project, Generation } from '@/types/database'
import Sidebar from '@/components/layout/Sidebar'
import { useTheme } from '@/contexts/ThemeContext'
import ThemeToggle from '@/components/ui/ThemeToggle'

interface TemplateData {
  id: string
  name: string
  description: string
  category: string
  type: string
  prompt: string
  inputs: { name: string; placeholder: string; type: string }[]
}

export default function ProjectDetail() {
  const [user, setUser] = useState<any>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [selectedModel, setSelectedModel] = useState('gpt-4')
  const { theme } = useTheme()
  
  // Template state
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null)
  const [templateInputs, setTemplateInputs] = useState<Record<string, string>>({})
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  
  const router = useRouter()
  const params = useParams()

  // Sample templates for quick access
  const quickTemplates: TemplateData[] = [
    {
      id: 'quick-1',
      name: 'Continue Blog Post',
      description: 'Add more content to your blog post',
      category: 'blog',
      type: 'blog',
      prompt: 'Continue writing this blog post about [TOPIC]. Build upon the existing content by adding: [NEW_SECTION]. Include relevant examples, data, or insights. Maintain the same tone and style as the previous content. Target audience: [AUDIENCE]. Length: [LENGTH] paragraphs.',
      inputs: [
        { name: 'TOPIC', placeholder: 'Main topic of the blog post', type: 'text' },
        { name: 'NEW_SECTION', placeholder: 'What new section to add', type: 'text' },
        { name: 'AUDIENCE', placeholder: 'Target audience', type: 'text' },
        { name: 'LENGTH', placeholder: 'How many paragraphs', type: 'number' }
      ]
    },
    {
      id: 'quick-2',
      name: 'Email Follow-up',
      description: 'Create a follow-up email sequence',
      category: 'email',
      type: 'email',
      prompt: 'Write a follow-up email about [TOPIC] for [AUDIENCE]. This is email #[EMAIL_NUMBER] in the sequence. Include: 1) Reference to previous communication, 2) New value or information, 3) Clear call-to-action, 4) Professional closing. Tone: [TONE]. Key message: [KEY_MESSAGE].',
      inputs: [
        { name: 'TOPIC', placeholder: 'Email topic', type: 'text' },
        { name: 'AUDIENCE', placeholder: 'Recipient type', type: 'text' },
        { name: 'EMAIL_NUMBER', placeholder: 'Email number in sequence', type: 'number' },
        { name: 'TONE', placeholder: 'Professional, friendly, urgent?', type: 'select' },
        { name: 'KEY_MESSAGE', placeholder: 'Main message to convey', type: 'text' }
      ]
    },
    {
      id: 'quick-3',
      name: 'Social Media Series',
      description: 'Create a series of social media posts',
      category: 'social',
      type: 'social',
      prompt: 'Create a series of [NUMBER] social media posts about [TOPIC] for [PLATFORM]. Each post should: 1) Be part of a cohesive campaign, 2) Have unique angle while maintaining theme, 3) Include relevant hashtags, 4) Have engagement elements. Campaign goal: [GOAL]. Tone: [TONE].',
      inputs: [
        { name: 'TOPIC', placeholder: 'Campaign topic', type: 'text' },
        { name: 'PLATFORM', placeholder: 'Instagram, Twitter, LinkedIn?', type: 'select' },
        { name: 'NUMBER', placeholder: 'Number of posts', type: 'number' },
        { name: 'GOAL', placeholder: 'Campaign objective', type: 'text' },
        { name: 'TONE', placeholder: 'Professional, casual, witty?', type: 'select' }
      ]
    },
    {
      id: 'quick-4',
      name: 'Product Variations',
      description: 'Create variations of product descriptions',
      category: 'ecommerce',
      type: 'ad',
      prompt: 'Create [NUMBER] variations of product copy for [PRODUCT_NAME]. Target audience: [AUDIENCE]. Each variation should: 1) Highlight different benefits, 2) Use different angles (emotional, logical, urgent), 3) Maintain brand voice, 4) Include unique call-to-action. Key features: [FEATURES]. Tone: [TONE].',
      inputs: [
        { name: 'PRODUCT_NAME', placeholder: 'Product name', type: 'text' },
        { name: 'AUDIENCE', placeholder: 'Target customers', type: 'text' },
        { name: 'NUMBER', placeholder: 'Number of variations', type: 'number' },
        { name: 'FEATURES', placeholder: 'Key features to highlight', type: 'text' },
        { name: 'TONE', placeholder: 'Exciting, professional, urgent?', type: 'select' }
      ]
    }
  ]

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (!user) {
        router.push('/login')
        return
      }

      await fetchProject(params.id as string, user.id)
      setLoading(false)
    }

    getUser()
  }, [router, params.id])

  const fetchProject = async (projectId: string, userId: string) => {
    // Fetch project
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single()

    if (projectError) {
      console.error('Error fetching project:', projectError)
      router.push('/projects')
      return
    }

    setProject(projectData)

    // Fetch generations
    const { data: generationsData, error: generationsError } = await supabase
      .from('generations')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (generationsError) {
      console.error('Error fetching generations:', generationsError)
    } else {
      setGenerations(generationsData || [])
    }
  }

  const handleGenerate = async () => {
    const finalPrompt = selectedTemplate ? buildPromptFromTemplate() : prompt
    
    if (!finalPrompt.trim() || !project) return

    setIsGenerating(true)
    try {
      // Simulate AI generation (replace with actual AI call)
      const mockOutput = `Generated content for: ${finalPrompt}\n\nThis is a sample AI-generated response based on your prompt. In a real implementation, this would connect to an AI service like OpenAI, Claude, or another provider.\n\nThe content would be tailored to the project type: ${project.type}`

      const { error } = await supabase
        .from('generations')
        .insert({
          project_id: project.id,
          user_id: user.id,
          model_used: selectedModel,
          prompt: finalPrompt,
          output: mockOutput,
          tokens_used: Math.floor(Math.random() * 1000) + 100
        } as any)

      if (error) throw error

      // Refresh generations
      await fetchProject(params.id as string, user.id)
      setPrompt('')
    } catch (error) {
      console.error('Error generating content:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDeleteGeneration = async (generationId: string) => {
    try {
      const { error } = await supabase
        .from('generations')
        .delete()
        .eq('id', generationId)

      if (error) throw error

      // Refresh generations
      await fetchProject(params.id as string, user.id)
    } catch (error) {
      console.error('Error deleting generation:', error)
    }
  }

  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const buildPromptFromTemplate = () => {
    if (!selectedTemplate) return prompt
    
    let builtPrompt = selectedTemplate.prompt
    
    // Replace template placeholders with user inputs
    selectedTemplate.inputs.forEach(input => {
      const value = templateInputs[input.name] || `[${input.name}]`
      builtPrompt = builtPrompt.replace(new RegExp(`\\[${input.name}\\]`, 'g'), value)
    })
    
    return builtPrompt
  }

  const selectQuickTemplate = (template: TemplateData) => {
    setSelectedTemplate(template)
    
    // Initialize template inputs
    const inputs: Record<string, string> = {}
    template.inputs.forEach((input: any) => {
      inputs[input.name] = ''
    })
    setTemplateInputs(inputs)
    setShowTemplateSelector(false)
  }

  const clearTemplate = () => {
    setSelectedTemplate(null)
    setTemplateInputs({})
    setPrompt('')
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'blog': return <FileText className="h-5 w-5" />
      case 'email': return <MessageSquare className="h-5 w-5" />
      case 'social': return <MessageSquare className="h-5 w-5" />
      case 'ad': return <Tag className="h-5 w-5" />
      default: return <FileText className="h-5 w-5" />
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
        style={{ backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb' }}
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
            Loading project...
          </p>
        </div>
      </div>
    )
  }

  if (!user || !project) {
    return null
  }

  return (
    <div 
      className="min-h-screen flex transition-colors duration-300"
      style={{ backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb' }}
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
                <button
                  onClick={() => router.push('/projects')}
                  className="p-2 rounded-md transition-colors duration-300"
                  style={{ color: theme === 'dark' ? '#d1d5db' : '#4b5563' }}
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    {getTypeIcon(project.type)}
                  </div>
                  <div>
                    <h1 
                      className="text-2xl font-bold transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      {project.title}
                    </h1>
                    <div className="flex items-center space-x-2 mt-1">
                      <span 
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors duration-300"
                        style={{
                          backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
                          color: theme === 'dark' ? '#d1d5db' : '#374151'
                        }}
                      >
                        {project.type}
                      </span>
                      <div 
                        className="flex items-center text-sm transition-colors duration-300"
                        style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(project.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <ThemeToggle />
                <button
                  onClick={() => router.push(`/projects/${project.id}/edit`)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-300"
                  style={{
                    border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
                    backgroundColor: theme === 'dark' ? 'transparent' : '#ffffff',
                    color: theme === 'dark' ? '#d1d5db' : '#374151'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#f9fafb'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? 'transparent' : '#ffffff'
                  }}
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Generator Panel */}
            <div className="lg:col-span-1">
              <div 
                className="rounded-lg shadow-sm border p-6 transition-colors duration-300"
                style={{
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                  borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
                }}
              >
                <h2 
                  className="text-lg font-semibold mb-4 transition-colors duration-300"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                >
                  Generate Content
                </h2>
                
                {/* Template Info */}
                {selectedTemplate ? (
                  <div 
                    className="rounded-lg p-4 mb-4 transition-colors duration-300"
                    style={{
                      backgroundColor: theme === 'dark' ? '#1e3a8a' : '#dbeafe',
                      borderColor: theme === 'dark' ? '#1e40af' : '#93c5fd'
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 
                        className="font-semibold transition-colors duration-300"
                        style={{ color: theme === 'dark' ? '#dbeafe' : '#1e40af' }}
                      >
                        Using Template
                      </h3>
                      <button
                        onClick={clearTemplate}
                        className="text-sm transition-colors duration-300 hover:opacity-80"
                        style={{ color: theme === 'dark' ? '#60a5fa' : '#2563eb' }}
                      >
                        Clear Template
                      </button>
                    </div>
                    <p 
                      className="font-medium transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#bfdbfe' : '#1e3a8a' }}
                    >
                      {selectedTemplate.name}
                    </p>
                    <p 
                      className="text-sm transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#93c5fd' : '#3b82f6' }}
                    >
                      {selectedTemplate.description}
                    </p>
                  </div>
                ) : (
                  <div 
                    className="rounded-lg shadow-sm border p-4 mb-4 transition-colors duration-300"
                    style={{
                      backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                      borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
                    }}
                  >
                    <button
                      onClick={() => setShowTemplateSelector(true)}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                    >
                      <FileText className="h-5 w-5" />
                      <span>Use a Template</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <p 
                      className="text-center text-sm mt-2 transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                    >
                      Generate more content with templates
                    </p>
                  </div>
                )}

                {/* Template Inputs */}
                {selectedTemplate && (
                  <div 
                    className="rounded-lg shadow-sm border p-4 mb-4 transition-colors duration-300"
                    style={{
                      backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                      borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
                    }}
                  >
                    <h3 
                      className="text-sm font-semibold mb-3 transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      Template Inputs
                    </h3>
                    <div className="space-y-3">
                      {selectedTemplate.inputs.map((input, index) => (
                        <div key={index}>
                          <label 
                            className="block text-sm font-medium mb-1 transition-colors duration-300"
                            style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                          >
                            {input.name}
                          </label>
                          {input.type === 'select' ? (
                            <select
                              value={templateInputs[input.name] || ''}
                              onChange={(e) => setTemplateInputs(prev => ({
                                ...prev,
                                [input.name]: e.target.value
                              }))}
                              className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                              style={{
                                backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                                borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                                color: theme === 'dark' ? '#f9fafb' : '#111827'
                              }}
                            >
                              <option value="">Select an option</option>
                              <option value="formal">Formal</option>
                              <option value="casual">Casual</option>
                              <option value="friendly">Friendly</option>
                              <option value="professional">Professional</option>
                            </select>
                          ) : (
                            <input
                              type={input.type}
                              value={templateInputs[input.name] || ''}
                              onChange={(e) => setTemplateInputs(prev => ({
                                ...prev,
                                [input.name]: e.target.value
                              }))}
                              placeholder={input.placeholder}
                              className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                              style={{
                                backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                                borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                                color: theme === 'dark' ? '#f9fafb' : '#111827'
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label 
                      className="block text-sm font-medium mb-1 transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                    >
                      AI Model
                    </label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      style={{
                        backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                        borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                        color: theme === 'dark' ? '#f9fafb' : '#111827'
                      }}
                    >
                      <option value="gpt-4">GPT-4</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      <option value="claude-3">Claude 3</option>
                    </select>
                  </div>
                  
                  {/* Show custom prompt input if no template */}
                  {!selectedTemplate && (
                    <div>
                      <label 
                        className="block text-sm font-medium mb-1 transition-colors duration-300"
                        style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                      >
                        Prompt
                      </label>
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Enter your prompt here..."
                        rows={4}
                        className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors duration-300"
                        style={{
                          backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                          borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                          color: theme === 'dark' ? '#f9fafb' : '#111827'
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Show built prompt preview if template */}
                  {selectedTemplate && (
                    <div>
                      <label 
                        className="block text-sm font-medium mb-1 transition-colors duration-300"
                        style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                      >
                        Generated Prompt Preview
                      </label>
                      <div 
                        className="p-3 rounded border transition-colors duration-300"
                        style={{
                          backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                          borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db'
                        }}
                      >
                        <p 
                          className="text-sm whitespace-pre-wrap font-mono transition-colors duration-300"
                          style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                        >
                          {buildPromptFromTemplate()}
                        </p>
                      </div>
                      <p 
                        className="text-xs mt-1 transition-colors duration-300"
                        style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }}
                      >
                        This is the prompt that will be sent to the AI. Fill in the template inputs above to customize it.
                      </p>
                    </div>
                  )}
                  
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || (selectedTemplate ? Object.values(templateInputs).some(v => !v.trim()) : !prompt.trim())}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Bot className="h-4 w-4" />
                        <span>Generate</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Generations List */}
            <div className="lg:col-span-2">
              <div 
                className="rounded-lg shadow-sm border transition-colors duration-300"
                style={{
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                  borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
                }}
              >
                <div 
                  className="p-6 border-b transition-colors duration-300"
                  style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}
                >
                  <h2 
                    className="text-lg font-semibold transition-colors duration-300"
                    style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                  >
                    Generations ({generations.length})
                  </h2>
                </div>
                
                {generations.length === 0 ? (
                  <div className="p-12 text-center">
                    <Bot 
                      className="h-12 w-12 mx-auto mb-4 transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }}
                    />
                    <h3 
                      className="text-lg font-medium mb-2 transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      No generations yet
                    </h3>
                    <p 
                      className="transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                    >
                      Start by generating content using the panel on the left
                    </p>
                  </div>
                ) : (
                  <div 
                    className="divide-y transition-colors duration-300"
                    style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}
                  >
                    {generations.map((generation) => (
                      <div key={generation.id} className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300"
                              style={{ backgroundColor: theme === 'dark' ? '#1e3a8a' : '#dbeafe' }}
                            >
                              <Bot 
                                className="h-4 w-4 transition-colors duration-300"
                                style={{ color: theme === 'dark' ? '#60a5fa' : '#2563eb' }}
                              />
                            </div>
                            <div>
                              <p 
                                className="text-sm font-medium transition-colors duration-300"
                                style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                              >
                                {generation.model_used}
                              </p>
                              <p 
                                className="text-xs transition-colors duration-300"
                                style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                              >
                                {new Date(generation.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleCopyContent(generation.output || '')}
                              className="p-1 rounded-md transition-colors duration-300"
                              style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }}
                              title="Copy content"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteGeneration(generation.id)}
                              className="p-1 rounded-md transition-colors duration-300"
                              style={{ color: theme === 'dark' ? '#ef4444' : '#dc2626' }}
                              title="Delete generation"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <p 
                            className="text-sm font-medium mb-1 transition-colors duration-300"
                            style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                          >
                            Prompt:
                          </p>
                          <p 
                            className="text-sm p-2 rounded transition-colors duration-300"
                            style={{
                              backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                              color: theme === 'dark' ? '#d1d5db' : '#4b5563'
                            }}
                          >
                            {generation.prompt}
                          </p>
                        </div>
                        
                        <div>
                          <p 
                            className="text-sm font-medium mb-1 transition-colors duration-300"
                            style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                          >
                            Output:
                          </p>
                          <div 
                            className="p-3 rounded text-sm whitespace-pre-wrap transition-colors duration-300"
                            style={{
                              backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                              color: theme === 'dark' ? '#f9fafb' : '#111827'
                            }}
                          >
                            {generation.output}
                          </div>
                        </div>
                        
                        {generation.tokens_used && (
                          <div 
                            className="mt-2 text-xs transition-colors duration-300"
                            style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }}
                          >
                            Tokens used: {generation.tokens_used}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div 
            className="rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300"
            style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff' }}
          >
            <div 
              className="p-6 border-b transition-colors duration-300"
              style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}
            >
              <div className="flex items-center justify-between">
                <h2 
                  className="text-xl font-semibold transition-colors duration-300"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                >
                  Choose a Template
                </h2>
                <button
                  onClick={() => setShowTemplateSelector(false)}
                  className="p-2 rounded-md transition-colors duration-300"
                  style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }}
                >
                  ×
                </button>
              </div>
              <p 
                className="mt-2 transition-colors duration-300"
                style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
              >
                Select a template to generate more content for your project
              </p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickTemplates.map((template) => (
                  <div 
                    key={template.id} 
                    className="border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                    style={{
                      borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                      backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = theme === 'dark' ? '#3b82f6' : '#3b82f6'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = theme === 'dark' ? '#374151' : '#e5e7eb'
                    }}
                    onClick={() => selectQuickTemplate(template)}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-300"
                        style={{ backgroundColor: theme === 'dark' ? '#1e3a8a' : '#dbeafe' }}
                      >
                        {template.type === 'blog' && <FileText className="h-5 w-5" style={{ color: theme === 'dark' ? '#60a5fa' : '#2563eb' }} />}
                        {template.type === 'email' && <Mail className="h-5 w-5" style={{ color: theme === 'dark' ? '#60a5fa' : '#2563eb' }} />}
                        {template.type === 'social' && <MessageSquare className="h-5 w-5" style={{ color: theme === 'dark' ? '#60a5fa' : '#2563eb' }} />}
                        {template.type === 'ad' && <Tag className="h-5 w-5" style={{ color: theme === 'dark' ? '#60a5fa' : '#2563eb' }} />}
                      </div>
                      <div>
                        <h3 
                          className="font-semibold transition-colors duration-300"
                          style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                        >
                          {template.name}
                        </h3>
                        <p 
                          className="text-sm capitalize transition-colors duration-300"
                          style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                        >
                          {template.type}
                        </p>
                      </div>
                    </div>
                    
                    <p 
                      className="text-sm mb-3 transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#d1d5db' : '#4b5563' }}
                    >
                      {template.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span 
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors duration-300"
                          style={{
                            backgroundColor: theme === 'dark' ? '#1e3a8a' : '#dbeafe',
                            color: theme === 'dark' ? '#60a5fa' : '#2563eb'
                          }}
                        >
                          {template.inputs.length} inputs
                        </span>
                      </div>
                      
                      <button 
                        className="flex items-center space-x-1 transition-colors duration-300"
                        style={{ color: theme === 'dark' ? '#60a5fa' : '#2563eb' }}
                      >
                        <span>Use</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div 
                className="mt-6 pt-6 border-t transition-colors duration-300"
                style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}
              >
                <div className="flex items-center justify-between">
                  <p 
                    className="text-sm transition-colors duration-300"
                    style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                  >
                    Need more options? 
                    <button 
                      onClick={() => {router.push('/templates'); setShowTemplateSelector(false)}} 
                      className="font-medium transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#60a5fa' : '#2563eb' }}
                    >
                      Browse all templates
                    </button>
                  </p>
                  
                  <button
                    onClick={() => setShowTemplateSelector(false)}
                    className="px-4 py-2 rounded-lg transition-colors duration-300"
                    style={{
                      backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
                      color: theme === 'dark' ? '#d1d5db' : '#374151'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme === 'dark' ? '#4b5563' : '#e5e7eb'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#f3f4f6'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
