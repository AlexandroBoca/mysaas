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
  ChevronRight,
  FileDown,
  Clipboard,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { deductCredit, getUserCredits } from '@/lib/credits'
import { getThemeColor } from '@/lib/theme'
import Sidebar from '@/components/layout/Sidebar'
import { useTheme } from '@/contexts/ThemeContext'
import ThemeToggle from '@/components/ui/ThemeToggle'
import jsPDF from 'jspdf'
import { marked } from 'marked'

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
  const colors = getThemeColor(theme)
  
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
  
  // Accept/Reject state
  const [contentFeedback, setContentFeedback] = useState<'accepted' | 'rejected' | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showRegenerateModal, setShowRegenerateModal] = useState(false)
  const [lastUsedPrompt, setLastUsedPrompt] = useState<string>('')
  const [lastUsedTemplate, setLastUsedTemplate] = useState<TemplateData | null>(null)
  const [hideThumbsButtons, setHideThumbsButtons] = useState(false)

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
    },
    {
      id: 'quick-5',
      name: 'Press Release',
      description: 'Professional press release for announcements',
      category: 'business',
      type: 'article',
      prompt: 'Write a professional press release about [TOPIC] for [COMPANY]. Include: 1) FOR IMMEDIATE RELEASE header, 2) Compelling headline, 3) Dateline and location, 4) Lead paragraph with 5W\'s, 5) Company boilerplate, 6) Contact information. Quote from [SPOKESPERSON].',
      inputs: [
        { name: 'TOPIC', placeholder: 'What\'s the news?', type: 'text' },
        { name: 'COMPANY', placeholder: 'Company name', type: 'text' },
        { name: 'SPOKESPERSON', placeholder: 'Quote source person', type: 'text' }
      ]
    },
    {
      id: 'quick-6',
      name: 'YouTube Script',
      description: 'Engaging YouTube tutorial script',
      category: 'video',
      type: 'script',
      prompt: 'Create a YouTube tutorial script about [TOPIC] for [AUDIENCE]. Structure: 1) Hook (first 15 seconds), 2) Introduction, 3) Main content with [NUMBER] steps, 4) Common mistakes to avoid, 5) Conclusion with call-to-action. Include visual cues and timing notes.',
      inputs: [
        { name: 'TOPIC', placeholder: 'Tutorial topic', type: 'text' },
        { name: 'AUDIENCE', placeholder: 'Target audience', type: 'text' },
        { name: 'NUMBER', placeholder: 'Number of steps', type: 'number' }
      ]
    },
    {
      id: 'quick-7',
      name: 'Case Study',
      description: 'Business case study demonstrating success',
      category: 'business',
      type: 'article',
      prompt: 'Write a compelling case study about [CLIENT]\'s success with [SOLUTION]. Include: 1) Executive summary, 2) Client background and challenges, 3) Solution implementation, 4) Results with metrics, 5) Client testimonial, 6) Lessons learned.',
      inputs: [
        { name: 'CLIENT', placeholder: 'Client company name', type: 'text' },
        { name: 'SOLUTION', placeholder: 'Product/service provided', type: 'text' },
        { name: 'METRICS', placeholder: 'Key success metrics', type: 'text' }
      ]
    },
    {
      id: 'quick-8',
      name: 'Recipe Blog Post',
      description: 'Engaging recipe with ingredients and instructions',
      category: 'food',
      type: 'blog',
      prompt: 'Write a recipe blog post for [DISH_NAME]. Include: 1) Story behind the recipe, 2) Ingredients list with quantities, 3) Step-by-step instructions, 4) Pro tips and variations, 5) Nutritional information, 6) Serving suggestions. Dietary: [DIETARY]. Difficulty: [DIFFICULTY].',
      inputs: [
        { name: 'DISH_NAME', placeholder: 'Recipe name', type: 'text' },
        { name: 'DIETARY', placeholder: 'Vegetarian, gluten-free, etc?', type: 'text' },
        { name: 'DIFFICULTY', placeholder: 'Easy, medium, hard?', type: 'select' }
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

  const generateContent = async (isRegeneration: boolean = false) => {
    console.log('generateContent called. isRegeneration:', isRegeneration, 'prompt:', prompt?.trim(), 'template:', selectedTemplate?.name)
    
    // Ensure isRegeneration is a boolean
    if (typeof isRegeneration !== 'boolean') {
      console.warn('isRegeneration is not a boolean, defaulting to false')
      isRegeneration = false
    }
    
    // For regeneration, use stored values if current state is empty
    let finalPrompt = prompt
    
    if (isRegeneration && !finalPrompt?.trim() && lastUsedPrompt) {
      finalPrompt = lastUsedPrompt
      console.log('Using stored prompt for regeneration:', { finalPrompt })
    } else {
      finalPrompt = selectedTemplate ? buildPromptFromTemplate() : prompt
    }
    
    console.log('Final prompt determined. finalPrompt:', finalPrompt?.trim(), 'length:', finalPrompt?.length)
    
    // Store the prompt and template for potential regeneration
    if (finalPrompt?.trim()) {
      setLastUsedPrompt(finalPrompt)
      setLastUsedTemplate(selectedTemplate)
    }
    
    if (!finalPrompt.trim()) {
      console.log('Early return: no final prompt')
      return
    }

    // Check credits before generation (skip for regeneration)
    if (!isRegeneration && creditsRemaining < 1) {
      console.log('Early return: insufficient credits. creditsRemaining:', creditsRemaining)
      alert('You have insufficient credits. Please upgrade your plan to continue generating content.')
      return
    }

    console.log('Credit deduction debug. isRegeneration:', isRegeneration, 'creditsRemaining:', creditsRemaining, 'userId:', user?.id)

    setGenerating(true)
    try {
      // Deduct 1 credit (skip for regeneration)
      if (!isRegeneration) {
        console.log('Normal generation - attempting to deduct credit...')
        const creditResult = await deductCredit(user.id)
        
        console.log('Credit deduction result:', creditResult)
        
        if (!creditResult.success) {
          alert(creditResult.error || 'Failed to deduct credit. Please try again.')
          setGenerating(false)
          return
        }

        // Update credits remaining
        console.log('Updating credits from', creditsRemaining, 'to', creditResult.creditsRemaining)
        setCreditsRemaining(creditResult.creditsRemaining || 0)
      } else {
        console.log('Regeneration detected - skipping credit deduction. isRegeneration:', isRegeneration)
      }

      // Simulate AI generation with variations (replace with actual AI call)
      const variations = [
        `Generated ${projectType} content based on your prompt: "${finalPrompt}"

This is a professionally written piece of content that addresses your requirements. In a real implementation, this would connect to an AI service like OpenAI GPT-4, Claude, or another advanced language model.

The content would be tailored specifically for a ${projectType} format, with appropriate tone, structure, and length. For blog posts, it would include engaging headlines, clear sections, and compelling conclusions. For emails, it would have proper formatting and call-to-action elements. For social media, it would be concise and platform-appropriate.

This demonstrates the AI content generation capability of your platform. Users can input prompts and receive high-quality, contextually relevant content for various use cases.`,
        
        `AI Response for ${projectType}: "${finalPrompt}"

Here's an alternative take on your content request. When using actual AI APIs like OpenAI, each generation would naturally vary due to the model's probabilistic nature and temperature settings.

This content is specifically crafted for ${projectType} format with enhanced creativity and variation. The structure, tone, and approach are designed to provide a fresh perspective while maintaining professional quality and relevance to your original prompt.`,
        
        `New AI Generation for ${projectType}: "${finalPrompt}"

This represents a different approach to your content request. Real AI services would provide unique responses each time, ensuring regenerations offer genuinely new content rather than repeated outputs.

Optimized for ${projectType} with enhanced creativity and variation, this content demonstrates the power of AI to generate multiple high-quality options for the same prompt, giving you more choices and creative directions.`,
        
        `Alternative AI Content for ${projectType}: "${finalPrompt}"

Experience a fresh interpretation of your content request. With OpenAI API and similar services, regeneration leverages the model's randomness to produce novel results, giving users multiple creative options.

Customized for ${projectType} with unique insights and approach, this content showcases how AI can provide diverse perspectives on the same topic, helping you find the perfect match for your needs.`
      ]
      
      // Select a random variation to simulate different AI responses
      const mockResponse = variations[Math.floor(Math.random() * variations.length)]

      setGeneratedContent(mockResponse)
      setContentFeedback(null) // Reset feedback for new content
      setHideThumbsButtons(false) // Show thumbs buttons for new content
    } catch (error) {
      console.error('Error generating content:', error)
      alert('An error occurred while generating content. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const handleAcceptContent = () => {
    setContentFeedback('accepted')
    setHideThumbsButtons(true) // Hide thumbs buttons after acceptance
    console.log('Content accepted')
  }

  const handleRejectContent = () => {
    setShowRejectModal(true)
  }

  const confirmRejectContent = () => {
    setShowRejectModal(false)
    setShowRegenerateModal(true)
  }

  const cancelRejectContent = () => {
    setShowRejectModal(false)
  }

  const confirmRegeneration = () => {
    setShowRegenerateModal(false)
    // Clear current content and regenerate
    setGeneratedContent('')
    setContentFeedback(null)
    setHideThumbsButtons(false) // Reset hide state for new content
    setTimeout(() => {
      generateContent(true) // Pass true for isRegeneration
    }, 300)
  }

  const cancelRegeneration = () => {
    setShowRegenerateModal(false)
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

      if (error) throw error

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

  const copyContent = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent)
      // Show success feedback
      const button = document.getElementById('copy-button')
      if (button) {
        button.innerHTML = '<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>'
        setTimeout(() => {
          button.innerHTML = '<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>'
        }, 2000)
      }
    } catch (err) {
      console.error('Failed to copy text: ', err)
      alert('Failed to copy content to clipboard')
    }
  }

  const exportToPDF = () => {
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 20
      const lineHeight = 7
      const fontSize = 12
      
      doc.setFontSize(16)
      doc.text(currentProject?.title || 'Generated Content', margin, 30)
      
      doc.setFontSize(fontSize)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, 40)
      doc.text(`Word Count: ${wordCount}`, margin, 50)
      
      // Add content
      const lines = doc.splitTextToSize(generatedContent, pageWidth - 2 * margin)
      let yPosition = 60
      
      lines.forEach((line: string) => {
        if (yPosition > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage()
          yPosition = margin
        }
        doc.text(line, margin, yPosition)
        yPosition += lineHeight
      })
      
      // Save the PDF
      const fileName = `${currentProject?.title || 'content'}_${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(fileName)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    }
  }

  const exportToMarkdown = () => {
    try {
      const markdownContent = `# ${currentProject?.title || 'Generated Content'}

**Generated on:** ${new Date().toLocaleDateString()}  
**Word Count:** ${wordCount}  
**Content Type:** ${currentProject?.type || 'Unknown'}

---

${generatedContent}

---

*Generated by AI Content Platform*`
      
      const blob = new Blob([markdownContent], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${currentProject?.title || 'content'}_${new Date().toISOString().split('T')[0]}.md`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting Markdown:', error)
      alert('Failed to export Markdown. Please try again.')
    }
  }

  const exportAsText = () => {
    try {
      const textContent = `${currentProject?.title || 'Generated Content'}

Generated on: ${new Date().toLocaleDateString()}
Word Count: ${wordCount}
Content Type: ${currentProject?.type || 'Unknown'}

${'='.repeat(50)}

${generatedContent}

${'='.repeat(50)}

Generated by AI Content Platform`
      
      const blob = new Blob([textContent], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${currentProject?.title || 'content'}_${new Date().toISOString().split('T')[0]}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting text:', error)
      alert('Failed to export text. Please try again.')
    }
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
        style={{ backgroundColor: colors.background.primary }}
      >
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto transition-colors duration-300"
            style={{ borderColor: theme === 'dark' ? colors.button.primary.background.dark : colors.button.primary.background.light }}
          ></div>
          <p 
            className="mt-4 transition-colors duration-300"
            style={{ color: colors.text.secondary }}
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
      style={{ backgroundColor: colors.background.primary }}
    >
      <Sidebar user={user} />
      
      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Header */}
        <div 
          className="shadow-sm border-b transition-colors duration-300"
          style={{
            backgroundColor: colors.background.secondary,
            borderColor: colors.border.secondary
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/projects')}
                  className="p-2 rounded-md transition-colors duration-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  style={{ color: colors.text.secondary }}
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
                    style={{ color: colors.text.primary }}
                  >
                    Writer
                  </h1>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <ThemeToggle />
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
                backgroundColor: colors.background.secondary,
                borderColor: colors.border.secondary
              }}
            >
              <h2 
                className="text-lg font-semibold mb-4 transition-colors duration-300"
                style={{ color: colors.text.primary }}
              >
                Create New Project
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label 
                    className="block text-sm font-medium mb-1 transition-colors duration-300"
                    style={{ color: colors.text.secondary }}
                  >
                    Project Title
                  </label>
                  <input
                    type="text"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="Enter project title..."
                    className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors duration-300 placeholder-gray-500 dark:placeholder-gray-400"
                    style={{
                      backgroundColor: theme === 'dark' ? colors.input.background.dark : colors.input.background.light,
                      border: theme === 'dark' ? colors.input.border.dark : colors.input.border.light,
                      color: theme === 'dark' ? colors.input.text.dark : colors.input.text.light
                    }}
                    onFocus={(e) => {
                      e.target.style.border = theme === 'dark' ? colors.input.focus.dark : colors.input.focus.light
                    }}
                    onBlur={(e) => {
                      e.target.style.border = theme === 'dark' ? colors.input.border.dark : colors.input.border.light
                    }}
                  />
                </div>
                
                <div>
                  <label 
                    className="block text-sm font-medium mb-1 transition-colors duration-300"
                    style={{ color: colors.text.secondary }}
                  >
                    Content Type
                  </label>
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
                    style={{
                      backgroundColor: theme === 'dark' ? colors.input.background.dark : colors.input.background.light,
                      border: theme === 'dark' ? colors.input.border.dark : colors.input.border.light,
                      color: theme === 'dark' ? colors.input.text.dark : colors.input.text.light
                    }}
                    onFocus={(e) => {
                      e.target.style.border = theme === 'dark' ? colors.input.focus.dark : colors.input.focus.light
                    }}
                    onBlur={(e) => {
                      e.target.style.border = theme === 'dark' ? colors.input.border.dark : colors.input.border.light
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
                      backgroundColor: colors.background.secondary,
                      borderColor: colors.border.secondary
                    }}
                  >
                    <h3 
                      className="text-lg font-semibold mb-4 transition-colors duration-300"
                      style={{ color: colors.text.primary }}
                    >
                      Template Inputs
                    </h3>
                    <div className="space-y-4">
                      {selectedTemplate.inputs.map((input, index) => (
                        <div key={index}>
                          <label 
                            className="block text-sm font-medium mb-1 transition-colors duration-300"
                            style={{ color: colors.text.secondary }}
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
                              className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
                              style={{
                                backgroundColor: theme === 'dark' ? colors.input.background.dark : colors.input.background.light,
                                border: theme === 'dark' ? colors.input.border.dark : colors.input.border.light,
                                color: theme === 'dark' ? colors.input.text.dark : colors.input.text.light
                              }}
                              onFocus={(e) => {
                                e.target.style.border = theme === 'dark' ? colors.input.focus.dark : colors.input.focus.light
                              }}
                              onBlur={(e) => {
                                e.target.style.border = theme === 'dark' ? colors.input.border.dark : colors.input.border.light
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
                              className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors duration-300 placeholder-gray-500 dark:placeholder-gray-400"
                              style={{
                                backgroundColor: theme === 'dark' ? colors.input.background.dark : colors.input.background.light,
                                border: theme === 'dark' ? colors.input.border.dark : colors.input.border.light,
                                color: theme === 'dark' ? colors.input.text.dark : colors.input.text.light
                              }}
                              onFocus={(e) => {
                                e.target.style.border = theme === 'dark' ? colors.input.focus.dark : colors.input.focus.light
                              }}
                              onBlur={(e) => {
                                e.target.style.border = theme === 'dark' ? colors.input.border.dark : colors.input.border.light
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
                        style={{ color: colors.text.secondary }}
                      >
                        AI Model
                      </label>
                      <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
                        style={{
                          backgroundColor: theme === 'dark' ? colors.input.background.dark : colors.input.background.light,
                          border: theme === 'dark' ? colors.input.border.dark : colors.input.border.light,
                          color: theme === 'dark' ? colors.input.text.dark : colors.input.text.light
                        }}
                        onFocus={(e) => {
                          e.target.style.border = theme === 'dark' ? colors.input.focus.dark : colors.input.focus.light
                        }}
                        onBlur={(e) => {
                          e.target.style.border = theme === 'dark' ? colors.input.border.dark : colors.input.border.light
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
                        style={{ color: colors.text.secondary }}
                      >
                        {selectedTemplate ? 'Template Preview' : 'Your Prompt'}
                      </label>
                      <textarea
                        value={selectedTemplate ? buildPromptFromTemplate() : prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={selectedTemplate ? "Template will build your prompt..." : "Describe what you want to generate..."}
                        rows={6}
                        className="w-full px-3 py-2 rounded-lg resize-none transition-colors duration-300 placeholder-gray-500 dark:placeholder-gray-400"
                        style={{
                          backgroundColor: theme === 'dark' ? colors.input.background.dark : colors.input.background.light,
                          border: theme === 'dark' ? colors.input.border.dark : colors.input.border.light,
                          color: theme === 'dark' ? colors.input.text.dark : colors.input.text.light
                        }}
                        onFocus={(e) => {
                          e.target.style.border = theme === 'dark' ? colors.input.focus.dark : colors.input.focus.light
                        }}
                        onBlur={(e) => {
                          e.target.style.border = theme === 'dark' ? colors.input.border.dark : colors.input.border.light
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
                      onClick={() => generateContent(false)}
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
                      
                      {/* Export Dropdown */}
                      <div className="relative group">
                        <button
                          className="p-2 rounded-md transition-colors duration-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }}
                          title="Export content"
                        >
                          <Download className="h-5 w-5" />
                        </button>
                        
                        {/* Dropdown Menu */}
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform group-hover:translate-y-0 translate-y-1">
                          <div className="py-1">
                            <button
                              onClick={copyContent}
                              id="copy-button"
                              className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/20 dark:hover:to-blue-800/20 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-200 group/item"
                            >
                              <div className="w-6 h-6 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-2 group-hover/item:scale-110 transition-transform duration-200">
                                <Clipboard className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="flex flex-col items-start">
                                <span className="font-medium text-xs">Copy to Clipboard</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Copy instantly</span>
                              </div>
                            </button>
                            <button
                              onClick={exportToPDF}
                              className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-red-900/20 dark:hover:to-red-800/20 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200 group/item"
                            >
                              <div className="w-6 h-6 rounded bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-2 group-hover/item:scale-110 transition-transform duration-200">
                                <FileDown className="h-3 w-3 text-red-600 dark:text-red-400" />
                              </div>
                              <div className="flex flex-col items-start">
                                <span className="font-medium text-xs">Export as PDF</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Download PDF</span>
                              </div>
                            </button>
                            <button
                              onClick={exportToMarkdown}
                              className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 dark:hover:from-purple-900/20 dark:hover:to-purple-800/20 hover:text-purple-700 dark:hover:text-purple-300 transition-all duration-200 group/item"
                            >
                              <div className="w-6 h-6 rounded bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-2 group-hover/item:scale-110 transition-transform duration-200">
                                <FileText className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                              </div>
                              <div className="flex flex-col items-start">
                                <span className="font-medium text-xs">Export as Markdown</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Documentation</span>
                              </div>
                            </button>
                            <button
                              onClick={exportAsText}
                              className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 dark:hover:from-green-900/20 dark:hover:to-green-800/20 hover:text-green-700 dark:hover:text-green-300 transition-all duration-200 group/item"
                            >
                              <div className="w-6 h-6 rounded bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-2 group-hover/item:scale-110 transition-transform duration-200">
                                <Download className="h-3 w-3 text-green-600 dark:text-green-400" />
                              </div>
                              <div className="flex flex-col items-start">
                                <span className="font-medium text-xs">Export as Text</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Plain text</span>
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
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
                    
                    {/* Accept/Reject Buttons - Hide after acceptance */}
                    {!hideThumbsButtons && (
                      <div className="flex justify-center">
                        <div className="flex items-center space-x-3 p-2 rounded-lg"
                          style={{
                            backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6'
                          }}
                        >
                          <button
                            onClick={handleAcceptContent}
                            className={`p-3 rounded-lg transition-all duration-200 ${
                              contentFeedback === 'accepted' 
                                ? 'bg-green-500 text-white' 
                                : 'hover:bg-green-100 dark:hover:bg-green-900/30'
                            }`}
                            style={{
                              color: contentFeedback === 'accepted' 
                                ? '#ffffff' 
                                : theme === 'dark' ? '#6ee7b7' : '#16a34a'
                            }}
                            title="Keep this content"
                          >
                            <ThumbsUp className="h-5 w-5" />
                          </button>
                          <button
                            onClick={handleRejectContent}
                            className={`p-3 rounded-lg transition-all duration-200 ${
                              contentFeedback === 'rejected' 
                                ? 'bg-red-500 text-white' 
                                : 'hover:bg-red-100 dark:hover:bg-red-900/30'
                            }`}
                            style={{
                              color: contentFeedback === 'rejected' 
                                ? '#ffffff' 
                                : theme === 'dark' ? '#f87171' : '#dc2626'
                            }}
                            title="Generate new content"
                          >
                            <ThumbsDown className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="flex justify-center">
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: contentFeedback === 'accepted' 
                            ? theme === 'dark' ? '#064e3b' : '#d1fae5'
                            : contentFeedback === 'rejected'
                            ? theme === 'dark' ? '#7f1d1d' : '#fee2e2'
                            : theme === 'dark' ? '#374151' : '#f3f4f6',
                          color: contentFeedback === 'accepted'
                            ? theme === 'dark' ? '#6ee7b7' : '#065f46'
                            : contentFeedback === 'rejected'
                            ? theme === 'dark' ? '#f87171' : '#dc2626'
                            : theme === 'dark' ? '#d1d5db' : '#6b7280'
                        }}
                      >
                        {contentFeedback === 'accepted' 
                          ? 'Accepted' 
                          : contentFeedback === 'rejected'
                          ? 'Rejected'
                          : 'New'
                        }
                      </span>
                    </div>
                    
                    {/* Save to Project Button */}
                    <div className="flex justify-center">
                      <button
                        onClick={saveGeneration}
                        className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-lg hover:shadow-xl"
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

      {/* Reject Confirmation Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 max-w-sm w-full mx-4 border border-gray-200 dark:border-gray-700"
            style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff' }}
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mr-3">
                <ThumbsDown className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 
                  className="text-lg font-semibold"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                >
                  Reject Content
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                >
                  Generate new content
                </p>
              </div>
            </div>
            
            <p 
              className="mb-6 text-sm"
              style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
            >
              Are you sure you want to reject this content? You'll be able to generate new content with the same prompt.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelRejectContent}
                className="px-4 py-2 rounded-lg transition-colors duration-200 font-medium text-sm"
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
              <button
                onClick={confirmRejectContent}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200 font-medium text-sm"
              >
                Generate New
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Regeneration Confirmation Modal */}
      {showRegenerateModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 max-w-sm w-full mx-4 border border-gray-200 dark:border-gray-700"
            style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff' }}
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                <Bot className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 
                  className="text-lg font-semibold"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                >
                  Generate New Content
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                >
                  Create new AI content
                </p>
              </div>
            </div>
            
            <p 
              className="mb-6 text-sm"
              style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
            >
              Would you like to generate new AI content with the same prompt? This regeneration is <span style={{ color: theme === 'dark' ? '#10b981' : '#059669', fontWeight: 'bold' }}>FREE</span> since you already paid for the original generation.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelRegeneration}
                className="px-4 py-2 rounded-lg transition-colors duration-200 font-medium text-sm"
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
              <button
                onClick={confirmRegeneration}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm flex items-center space-x-2"
              >
                <Bot className="h-4 w-4" />
                <span>Generate New</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
