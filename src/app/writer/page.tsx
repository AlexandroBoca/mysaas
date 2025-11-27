'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  ChevronRight
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { deductCredit, getUserCredits } from '@/lib/credits'
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

export default function Writer() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [creditsRemaining, setCreditsRemaining] = useState(0)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [showSaveToProjectPopup, setShowSaveToProjectPopup] = useState(false)
  const { theme } = useTheme()
  
  // Project form
  const [projectTitle, setProjectTitle] = useState('')
  const [projectType, setProjectType] = useState('blog')
  const [showProjectForm, setShowProjectForm] = useState(true)
  const [currentProject, setCurrentProject] = useState<any>(null)
  
  // Template state
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null)
  const [templateInputs, setTemplateInputs] = useState<Record<string, string>>({})
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  
  // Writer state
  const [prompt, setPrompt] = useState('')
  const [generatedContent, setGeneratedContent] = useState('')
  const [selectedModel, setSelectedModel] = useState('gpt-4')
  const [wordCount, setWordCount] = useState(0)

  const router = useRouter()
  const searchParams = useSearchParams()

  // Sample templates for quick access
  const quickTemplates: TemplateData[] = [
    {
      id: 'quick-1',
      name: 'Blog Post Introduction',
      description: 'Create an engaging introduction for a blog post',
      category: 'blog',
      type: 'blog',
      prompt: 'Write an engaging blog post introduction about [TOPIC] for [AUDIENCE]. Include: 1) A compelling hook or statistic, 2) Brief context about why this topic matters, 3) What readers will learn, 4) A smooth transition to the main content. Tone: [TONE]. Length: [LENGTH] sentences.',
      inputs: [
        { name: 'TOPIC', placeholder: 'What is the blog post about?', type: 'text' },
        { name: 'AUDIENCE', placeholder: 'Target audience', type: 'text' },
        { name: 'TONE', placeholder: 'Formal, casual, inspiring?', type: 'select' },
        { name: 'LENGTH', placeholder: 'Number of sentences', type: 'number' }
      ]
    },
    {
      id: 'quick-2',
      name: 'Email Newsletter',
      description: 'Create a newsletter email for subscribers',
      category: 'email',
      type: 'email',
      prompt: 'Write a newsletter email about [TOPIC] for [AUDIENCE]. Include: 1) Catchy subject line, 2) Personal greeting, 3) Main content with value, 4) Call-to-action, 5) Professional closing. Tone: [TONE]. Key points to cover: [KEY_POINTS].',
      inputs: [
        { name: 'TOPIC', placeholder: 'Newsletter topic', type: 'text' },
        { name: 'AUDIENCE', placeholder: 'Subscriber type', type: 'text' },
        { name: 'TONE', placeholder: 'Professional, friendly, casual?', type: 'select' },
        { name: 'KEY_POINTS', placeholder: 'Key points to include', type: 'text' }
      ]
    },
    {
      id: 'quick-3',
      name: 'Social Media Post',
      description: 'Create engaging social media content',
      category: 'social',
      type: 'social',
      prompt: 'Create a social media post about [TOPIC] for [PLATFORM]. Include: 1) Attention-grabbing hook, 2) Main message with value, 3) Relevant hashtags, 4) Call-to-action or engagement question. Tone: [TONE]. Character limit: [LIMIT].',
      inputs: [
        { name: 'TOPIC', placeholder: 'Post topic', type: 'text' },
        { name: 'PLATFORM', placeholder: 'Twitter, Instagram, LinkedIn?', type: 'select' },
        { name: 'TONE', placeholder: 'Professional, casual, witty?', type: 'select' },
        { name: 'LIMIT', placeholder: 'Character limit', type: 'number' }
      ]
    },
    {
      id: 'quick-4',
      name: 'Product Description',
      description: 'Write compelling product copy',
      category: 'ecommerce',
      type: 'ad',
      prompt: 'Write a product description for [PRODUCT_NAME] targeting [AUDIENCE]. Highlight: [FEATURES] and benefits: [BENEFITS]. Include: 1) Catchy headline, 2) Engaging description, 3) Key benefits, 4) Social proof element, 5) Call-to-action. Tone: [TONE].',
      inputs: [
        { name: 'PRODUCT_NAME', placeholder: 'Product name', type: 'text' },
        { name: 'AUDIENCE', placeholder: 'Target customers', type: 'text' },
        { name: 'FEATURES', placeholder: 'Key features', type: 'text' },
        { name: 'BENEFITS', placeholder: 'Customer benefits', type: 'text' },
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

      // Fetch user credits
      const credits = await getUserCredits(user.id)
      setCreditsRemaining(credits)
      
      // Check for template data in URL params
      const templateData = searchParams.get('template')
      if (templateData) {
        try {
          const template = JSON.parse(decodeURIComponent(templateData))
          setSelectedTemplate(template)
          setProjectType(template.type)
          setProjectTitle(template.name)
          
          // Initialize template inputs
          const inputs: Record<string, string> = {}
          template.inputs.forEach((input: any) => {
            inputs[input.name] = ''
          })
          setTemplateInputs(inputs)
        } catch (error) {
          console.error('Error parsing template data:', error)
        }
      }
      
      setLoading(false)
    }

    getUser()
  }, [router, searchParams])

  useEffect(() => {
    setWordCount(generatedContent.split(/\s+/).filter(word => word.length > 0).length)
  }, [generatedContent])

  const createProject = async () => {
    if (!projectTitle.trim() || !user) return

    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          title: projectTitle,
          type: projectType,
          input_data: {
            initial_prompt: prompt,
            model: selectedModel
          }
        } as any)
        .select()
        .single()

      if (error) throw error

      setCurrentProject(data)
      setShowProjectForm(false)
      
      // Show success popup
      setShowSuccessPopup(true)
      setTimeout(() => {
        setShowSuccessPopup(false)
      }, 2000)
    } catch (error) {
      console.error('Error creating project:', error)
    } finally {
      setSaving(false)
    }
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
    setProjectType(template.type)
    
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

  const generateContent = async () => {
    const finalPrompt = selectedTemplate ? buildPromptFromTemplate() : prompt
    
    if (!finalPrompt.trim()) return

    // Check credits before generation
    if (creditsRemaining < 1) {
      alert('You have insufficient credits. Please upgrade your plan to continue generating content.')
      return
    }

    setGenerating(true)
    try {
      // Deduct 1 credit
      const creditResult = await deductCredit(user.id)
      
      if (!creditResult.success) {
        alert(creditResult.error || 'Failed to deduct credit. Please try again.')
        setGenerating(false)
        return
      }

      // Update credits remaining
      setCreditsRemaining(creditResult.creditsRemaining || 0)

      // Simulate AI generation (replace with actual AI call)
      const mockResponse = await new Promise(resolve => {
        setTimeout(() => {
          resolve(`Generated ${projectType} content based on your prompt: "${finalPrompt}"

This is a professionally written piece of content that addresses your requirements. In a real implementation, this would connect to an AI service like OpenAI GPT-4, Claude, or another advanced language model.

The content would be tailored specifically for a ${projectType} format, with appropriate tone, structure, and length. For blog posts, it would include engaging headlines, clear sections, and compelling conclusions. For emails, it would have proper formatting and call-to-action elements. For social media, it would be concise and platform-appropriate.

This demonstrates the AI content generation capability of your platform. Users can input prompts and receive high-quality, contextually relevant content for various use cases.`)
        }, 2000)
      })

      setGeneratedContent(mockResponse as string)
    } catch (error) {
      console.error('Error generating content:', error)
      alert('An error occurred while generating content. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const saveGeneration = async () => {
    if (!currentProject || !generatedContent.trim()) return
    if (!user) {
      console.error('No user found')
      return
    }

    try {
      const finalPrompt = selectedTemplate ? buildPromptFromTemplate() : prompt || 'Generated content'
      const modelToUse = selectedModel || 'gpt-4'
      
      console.log('Saving generation:', {
        project_id: currentProject.id,
        user_id: user.id,
        model_used: modelToUse,
        prompt: finalPrompt,
        output: generatedContent
      })
      
      const { data, error } = await supabase
        .from('generations')
        .insert({
          project_id: currentProject.id,
          user_id: user.id,
          model_used: modelToUse,
          prompt: finalPrompt,
          output: generatedContent
        } as any)

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Generation saved successfully:', data)

      // Show save to project popup
      setShowSaveToProjectPopup(true)
      
      // Redirect to projects page after showing popup
      setTimeout(() => {
        setShowSaveToProjectPopup(false)
        router.push('/projects')
      }, 1500)
    } catch (error: any) {
      console.error('Error saving generation:', error)
      console.error('Error details:', error.message, error.details, error.hint)
    }
  }

  const copyContent = () => {
    navigator.clipboard.writeText(generatedContent)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'blog': return <FileText className="h-5 w-5" />
      case 'email': return <Mail className="h-5 w-5" />
      case 'social': return <MessageSquare className="h-5 w-5" />
      case 'ad': return <Tag className="h-5 w-5" />
      default: return <FileText className="h-5 w-5" />
    }
  }

  const getTypePlaceholder = (type: string) => {
    switch (type) {
      case 'blog': return 'Write a blog post about the benefits of artificial intelligence in modern business...'
      case 'email': return 'Compose an email to announce our new product launch to existing customers...'
      case 'social': return 'Create engaging social media posts for a new restaurant opening...'
      case 'ad': return 'Write compelling ad copy for a productivity app that helps people focus...'
      default: return 'Enter your content prompt here...'
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
            Loading writer...
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
                <button
                  onClick={() => router.push('/projects')}
                  className="p-2 rounded-md transition-colors duration-300"
                  style={{ color: theme === 'dark' ? '#d1d5db' : '#4b5563' }}
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h1 
                    className="text-2xl font-bold transition-colors duration-300"
                    style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                  >
                    Writer
                  </h1>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <ThemeToggle />
                {generatedContent && (
                  <button
                    onClick={saveGeneration}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save to Project</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Project Creation Form */}
          {showProjectForm && (
            <div 
              className="rounded-lg shadow-sm border p-6 mb-8 transition-colors duration-300"
              style={{
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
              }}
            >
              <h2 
                className="text-lg font-semibold mb-4 transition-colors duration-300"
                style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
              >
                Create New Project
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label 
                    className="block text-sm font-medium mb-1 transition-colors duration-300"
                    style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                  >
                    Project Title
                  </label>
                  <input
                    type="text"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="Enter project title..."
                    className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                    style={{
                      backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                      borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                      color: theme === 'dark' ? '#f9fafb' : '#111827'
                    }}
                  />
                </div>
                
                <div>
                  <label 
                    className="block text-sm font-medium mb-1 transition-colors duration-300"
                    style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                  >
                    Content Type
                  </label>
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                    style={{
                      backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                      borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                      color: theme === 'dark' ? '#f9fafb' : '#111827'
                    }}
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
              
              <div className="mt-4">
                <button
                  onClick={createProject}
                  disabled={!projectTitle.trim() || saving}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      {getTypeIcon(projectType)}
                      <span>Create Project</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Writer Interface */}
          {!showProjectForm && currentProject && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Input Panel */}
              <div className="space-y-6">
                {/* Template Info */}
                {selectedTemplate ? (
                  <div 
                    className="rounded-lg p-4 transition-colors duration-300"
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
                    className="rounded-lg shadow-sm border p-4 transition-colors duration-300"
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
                      Get started faster with pre-built templates
                    </p>
                  </div>
                )}

                {/* Template Inputs */}
                {selectedTemplate && (
                  <div 
                    className="rounded-lg shadow-sm border p-6 transition-colors duration-300"
                    style={{
                      backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                      borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
                    }}
                  >
                    <h3 
                      className="text-lg font-semibold mb-4 transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      Template Inputs
                    </h3>
                    <div className="space-y-4">
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

                <div 
                  className="rounded-lg shadow-sm border p-6 transition-colors duration-300"
                  style={{
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 
                      className="text-lg font-semibold transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      Content Generator
                    </h2>
                    <div className="flex items-center space-x-2">
                      <div style={{ color: theme === 'dark' ? '#93c5fd' : '#2563eb' }}>
                        {getTypeIcon(currentProject.type)}
                      </div>
                      <span 
                        className="text-sm transition-colors duration-300"
                        style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                      >
                        {currentProject.title}
                      </span>
                    </div>
                  </div>
                  
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
                        <option value="gpt-4">GPT-4 (Most Advanced)</option>
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Fast)</option>
                        <option value="claude-3">Claude 3 (Creative)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label 
                        className="block text-sm font-medium mb-1 transition-colors duration-300"
                        style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                      >
                        {selectedTemplate ? 'Template Preview' : 'Your Prompt'}
                      </label>
                      <textarea
                        value={selectedTemplate ? buildPromptFromTemplate() : prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={selectedTemplate ? "Template will build your prompt..." : "Describe what you want to generate..."}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        style={{
                          backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                          borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                          color: theme === 'dark' ? '#f9fafb' : '#111827'
                        }}
                      />
                    </div>
                    
                    {/* Credits Display */}
                    <div 
                      className="p-3 rounded-lg border transition-colors duration-300"
                      style={{
                        backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb',
                        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span 
                          className="text-sm font-medium transition-colors duration-300"
                          style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                        >
                          Credits Remaining
                        </span>
                        <span 
                          className={`text-lg font-bold transition-colors duration-300 ${
                            creditsRemaining < 1 ? 'text-red-600' : 
                            creditsRemaining < 5 ? 'text-yellow-600' : 'text-green-600'
                          }`}
                        >
                          {creditsRemaining}
                        </span>
                      </div>
                      <p 
                        className="text-xs mt-1 transition-colors duration-300"
                        style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                      >
                        Each generation costs 1 credit
                      </p>
                      {creditsRemaining < 1 && (
                        <div className="mt-2">
                          <button
                            onClick={() => router.push('/billing')}
                            className="text-xs text-blue-600 hover:text-blue-700 underline"
                          >
                            Upgrade your plan to get more credits
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={generateContent}
                      disabled={generating || (selectedTemplate ? Object.values(templateInputs).some(v => !v.trim()) : !prompt.trim())}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {generating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Generating Content...</span>
                        </>
                      ) : (
                        <>
                          <Bot className="h-5 w-5" />
                          <span>Generate Content</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Output Panel */}
              <div 
                className="rounded-lg shadow-sm border p-6 transition-colors duration-300"
                style={{
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                  borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 
                    className="text-lg font-semibold transition-colors duration-300"
                    style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                  >
                    Generated Content
                  </h2>
                  {generatedContent && (
                    <div className="flex items-center space-x-2">
                      <span 
                        className="text-sm transition-colors duration-300"
                        style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                      >
                        {wordCount} words
                      </span>
                      <button
                        onClick={copyContent}
                        className="p-1 rounded-md transition-colors duration-300"
                        style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }}
                        title="Copy content"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                {generatedContent ? (
                  <div className="space-y-4">
                    <div 
                      className="p-4 rounded-lg min-h-[300px] transition-colors duration-300"
                      style={{ backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb' }}
                    >
                      <div 
                        className="whitespace-pre-wrap transition-colors duration-300"
                        style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                      >
                        {generatedContent}
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        onClick={saveGeneration}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Save className="h-4 w-4" />
                        <span>Save to Project</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Bot 
                      className="h-12 w-12 mx-auto mb-4 transition-colors duration-300" 
                      style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }} 
                    />
                    <h3 
                      className="text-lg font-medium mb-2 transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      No content generated yet
                    </h3>
                    <p 
                      className="transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                    >
                      Enter a prompt and click "Generate Content" to get started
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Choose a Template</h2>
                <button
                  onClick={() => setShowTemplateSelector(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-md"
                >
                  ×
                </button>
              </div>
              <p className="text-gray-600 mt-2">
                Select a template to quickly generate content with pre-built prompts
              </p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickTemplates.map((template) => (
                  <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer" onClick={() => selectQuickTemplate(template)}>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                        {template.type === 'blog' && <FileText className="h-5 w-5" />}
                        {template.type === 'email' && <Mail className="h-5 w-5" />}
                        {template.type === 'social' && <MessageSquare className="h-5 w-5" />}
                        {template.type === 'ad' && <Tag className="h-5 w-5" />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{template.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{template.type}</p>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">{template.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {template.inputs.length} inputs
                        </span>
                      </div>
                      
                      <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700">
                        <span>Use</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Need more options? <button onClick={() => {router.push('/templates'); setShowTemplateSelector(false)}} className="text-blue-600 hover:text-blue-700 font-medium">Browse all templates</button>
                  </p>
                  
                  <button
                    onClick={() => setShowTemplateSelector(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
          <div 
            className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 pointer-events-auto transform transition-all duration-300 animate-pulse"
            style={{
              backgroundColor: theme === 'dark' ? '#10b981' : '#10b981',
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Project created successfully!</span>
          </div>
        </div>
      )}

      {/* Save to Project Popup */}
      {showSaveToProjectPopup && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
          <div 
            className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 pointer-events-auto transform transition-all duration-300 animate-pulse"
            style={{
              backgroundColor: theme === 'dark' ? '#3b82f6' : '#3b82f6',
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
            </svg>
            <span className="font-medium">Saved to project!</span>
          </div>
        </div>
      )}
    </div>
  )
}
