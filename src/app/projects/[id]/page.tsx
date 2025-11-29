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
  Trash2,
  FileDown,
  Clipboard,
  Zap,
  Clock,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Project, Generation } from '@/types/database'
import { getThemeColor } from '@/lib/theme'
import Sidebar from '@/components/layout/Sidebar'
import { useTheme } from '@/contexts/ThemeContext'
import ThemeToggle from '@/components/ui/ThemeToggle'
import jsPDF from 'jspdf'
import { marked } from 'marked'
import { getUserCredits, deductCredit } from '@/lib/credits'

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
  const colors = getThemeColor(theme)
  
  // Template state
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null)
  const [templateInputs, setTemplateInputs] = useState<Record<string, string>>({})
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  
  // Delete confirmation state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [generationToDelete, setGenerationToDelete] = useState<string | null>(null)
  
  // Credits state
  const [creditsRemaining, setCreditsRemaining] = useState<number>(0)
  
  // Accept/Reject state
  const [generationFeedback, setGenerationFeedback] = useState<Record<string, 'accepted' | 'rejected' | null>>({})
  const [newlyGeneratedId, setNewlyGeneratedId] = useState<string | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [generationToReject, setGenerationToReject] = useState<string | null>(null)
  const [showRegenerateModal, setShowRegenerateModal] = useState(false)
  const [hiddenThumbsGenerations, setHiddenThumbsGenerations] = useState<Set<string>>(new Set())
  const [lastUsedPrompt, setLastUsedPrompt] = useState<string>('')
  const [lastUsedTemplate, setLastUsedTemplate] = useState<TemplateData | null>(null)
  
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

  const fetchCredits = async (userId: string) => {
    try {
      const credits = await getUserCredits(userId)
      setCreditsRemaining(credits)
    } catch (error) {
      console.error('Error fetching credits:', error)
      setCreditsRemaining(0)
    }
  }

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (!user) {
        router.push('/login')
        return
      }

      await fetchProject(params.id as string, user.id)
      await fetchCredits(user.id)
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

    // Fetch generations with cache bypass
    const { data: generationsData, error: generationsError } = await supabase
      .from('generations')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (generationsError) {
      console.error('Error fetching generations:', generationsError)
    } else {
      console.log('Fetched generations:', generationsData?.length || 0)
      setGenerations(generationsData || [])
    }
  }

  const handleGenerate = async (isRegeneration: boolean = false) => {
    // Ensure isRegeneration is a boolean
    if (typeof isRegeneration !== 'boolean') {
      console.warn('isRegeneration is not a boolean, defaulting to false')
      isRegeneration = false
    }
    
    // Check credits first (skip for regeneration)
    if (!isRegeneration && creditsRemaining === 0) {
      alert('⚠️ Insufficient credits. Please purchase more credits to continue generating content.')
      return
    }
    
    // For regeneration, use stored values if current state is empty
    let finalPrompt = prompt
    let currentTemplate = selectedTemplate
    
    if (isRegeneration && !finalPrompt?.trim() && lastUsedPrompt) {
      finalPrompt = lastUsedPrompt
      currentTemplate = lastUsedTemplate
      console.log('Using stored prompt for regeneration:', { finalPrompt, template: currentTemplate?.name })
    } else {
      finalPrompt = selectedTemplate ? buildPromptFromTemplate() : prompt
    }
    
    // Store the prompt and template for potential regeneration
    if (finalPrompt?.trim()) {
      setLastUsedPrompt(finalPrompt)
      setLastUsedTemplate(selectedTemplate)
    }
    
    // Enhanced debugging for missing data
    console.log('handleGenerate debug:', {
      isRegeneration,
      finalPrompt: finalPrompt?.trim(),
      prompt: prompt?.trim(),
      storedPrompt: lastUsedPrompt,
      selectedTemplate: selectedTemplate?.name,
      storedTemplate: lastUsedTemplate?.name,
      project: !!project,
      projectId: project?.id,
      user: !!user,
      userId: user?.id,
      selectedModel,
      newlyGeneratedId,
      templateInputs,
      creditsRemaining
    })
    
    if (!finalPrompt?.trim() || !project || !user) {
      console.error('Missing required data:', { 
        finalPrompt: !!finalPrompt?.trim(), 
        project: !!project,
        user: !!user,
        projectId: project?.id,
        userId: user?.id,
        promptValue: prompt,
        hasSelectedTemplate: !!selectedTemplate,
        templateInputsCount: Object.keys(templateInputs).length
      })
      
      // For regeneration, try to restore state
      if (isRegeneration) {
        console.error('Regeneration failed due to missing state. Attempting to restore...')
        // Try to refresh project data
        if (params?.id) {
          await fetchProject(params.id as string, user?.id)
          // Retry once after refresh
          if (project && user) {
            console.log('State restored, retrying regeneration...')
            return handleGenerate(true)
          }
        }
      }
      
      // Provide more specific error messages
      if (!finalPrompt?.trim()) {
        alert('⚠️ Please enter a prompt or select a template.')
      } else if (!project) {
        alert('⚠️ Project not found. Please refresh the page.')
      } else if (!user) {
        alert('⚠️ User not authenticated. Please log in again.')
      }
      return
    }

    setIsGenerating(true)
    try {
      // Simulate AI generation (replace with actual AI call)
      // NOTE: With real OpenAI API, regeneration would naturally produce different results
      // due to temperature parameter and API's inherent randomness. This mock simulation
      // adds manual randomness to demonstrate the concept.
      const variations = [
        `Generated content for: ${finalPrompt}\n\nThis is a sample AI-generated response based on your prompt. In a real implementation, this would connect to an AI service like OpenAI, Claude, or another provider.\n\nThe content would be tailored to the project type: ${project.type}`,
        
        `AI Response to: ${finalPrompt}\n\nHere's an alternative take on your request. When using actual AI APIs like OpenAI, each generation would naturally vary due to the model's probabilistic nature and temperature settings.\n\nContent adapted for ${project.type} project with fresh perspective.`,
        
        `New AI Generation: ${finalPrompt}\n\nThis represents a different approach to your prompt. Real AI services would provide unique responses each time, ensuring regenerations offer genuinely new content rather than repeated outputs.\n\nOptimized for ${project.type} with enhanced creativity and variation.`,
        
        `Alternative AI Content: ${finalPrompt}\n\nExperience a fresh interpretation of your request. With OpenAI API and similar services, regeneration leverages the model's randomness to produce novel results, giving users multiple creative options.\n\nCustomized for ${project.type} project with unique insights.`
      ]
      
      // Select a random variation to simulate different AI responses
      const mockOutput = variations[Math.floor(Math.random() * variations.length)]

      console.log('Inserting generation:', {
        project_id: project.id,
        user_id: user.id,
        model_used: selectedModel,
        prompt: finalPrompt,
        output: mockOutput,
        tokens_used: Math.floor(Math.random() * 1000) + 100
      })

      const { data, error } = await supabase
        .from('generations')
        .insert({
          project_id: project.id,
          user_id: user.id,
          model_used: selectedModel,
          prompt: finalPrompt,
          output: mockOutput,
          tokens_used: Math.floor(Math.random() * 1000) + 100
        } as any)
        .select()

      if (error) {
        console.error('Supabase insert error:', error)
        throw error
      }

      console.log('Generation inserted successfully:', data)

      // Set the newly generated ID to show thumbs buttons
      if (data && Array.isArray(data) && data.length > 0 && data[0]) {
        const newGeneration = data[0] as { id: string }
        setNewlyGeneratedId(newGeneration.id)
      }

      // Deduct one credit after successful generation (skip for regeneration)
      if (!isRegeneration) {
        try {
          await deductCredit(user.id)
          console.log('Credit deducted successfully')
          
          // Refresh credits display
          const newCredits = await getUserCredits(user.id)
          setCreditsRemaining(newCredits)
        } catch (creditError) {
          console.error('Error deducting credit:', creditError)
          // Don't fail the whole process if credit deduction fails
          alert('Content generated successfully, but there was an issue updating your credits. Please contact support.')
        }
      } else {
        console.log('Regeneration: No credit deducted')
      }

      // Refresh generations
      await fetchProject(params.id as string, user.id)
      setPrompt('')
    } catch (error: any) {
      console.error('Error generating content:', error)
      console.error('Error details:', {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code
      })
      
      // Show user-friendly error message
      if (error?.message) {
        alert(`Failed to generate content: ${error.message}`)
      } else {
        alert('Failed to generate content. Please try again.')
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAcceptGeneration = (generationId: string) => {
    setGenerationFeedback(prev => ({
      ...prev,
      [generationId]: 'accepted'
    }))
    // Hide thumbs buttons after acceptance
    setHiddenThumbsGenerations(prev => new Set([...prev, generationId]))
    setNewlyGeneratedId(null)
    console.log('Generation accepted:', generationId)
    // You could also save this to the database if needed
  }

  const handleRejectGeneration = (generationId: string) => {
  setGenerationToReject(generationId)
  setShowRejectModal(true)
}

const confirmRejectGeneration = async () => {
  if (!generationToReject || !user) {
    console.error('No generation ID or user found for reject operation')
    return
  }

  try {
    // Delete the rejected generation
    const { error: deleteError } = await supabase
      .from('generations')
      .delete()
      .eq('id', generationToReject)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting generation:', deleteError)
      alert('Failed to delete generation. Please try again.')
      return
    }

    console.log('Generation deleted successfully:', generationToReject)
    
    // Remove from state
    setGenerations(prev => prev.filter(g => g.id !== generationToReject))
    setGenerationFeedback(prev => {
      const newFeedback = { ...prev }
      delete newFeedback[generationToReject]
      return newFeedback
    })
    setNewlyGeneratedId(null)

    // Close reject modal
    setShowRejectModal(false)
    setGenerationToReject(null)

    // Show regeneration modal instead of browser confirm
    setShowRegenerateModal(true)
  } catch (error) {
    console.error('Error in reject and regenerate flow:', error)
    alert('Something went wrong. Please try again.')
  }
}

const confirmRegeneration = () => {
  setShowRegenerateModal(false)
  // Trigger regeneration with the same prompt (no credit cost)
  setTimeout(() => {
    handleGenerate(true) // Pass true for isRegeneration
  }, 300)
}

const cancelRegeneration = () => {
  setShowRegenerateModal(false)
}

const cancelRejectGeneration = () => {
  setShowRejectModal(false)
  setGenerationToReject(null)
}

  const handleDeleteGeneration = (generationId: string) => {
    if (!user) {
      console.error('No user found for delete operation')
      return
    }

    // Validate generation ID
    if (!generationId || generationId === 'undefined' || generationId === 'null') {
      console.error('Invalid generation ID:', generationId)
      alert('Invalid generation selected for deletion.')
      return
    }

    // Debug: Log the actual generations array
    console.log('Full generations array:', generations)
    console.log('Generations with details:', generations.map(g => ({ 
      id: g?.id, 
      hasId: !!g?.id, 
      prompt: g?.prompt?.substring(0, 50) + '...',
      output: g?.output?.substring(0, 50) + '...'
    })))

    // Check if generation actually exists in current state
    const generationExists = generations.some(g => g && g.id === generationId)
    if (!generationExists) {
      console.error('Generation not found in current state:', generationId)
      console.log('Current generations IDs:', generations.map(g => g?.id))
      alert('Generation not found. Please refresh the page.')
      return
    }

    // Show custom confirmation modal
    setGenerationToDelete(generationId)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!generationToDelete || !user || !params.id) return

    try {
      console.log('Deleting generation:', generationToDelete)
      console.log('Current generations count:', generations.length)
      console.log('Current generations IDs:', generations.map(g => g.id))
      
      // First, check what's actually in the database
      const { data: dbGenerations, error: dbError } = await supabase
        .from('generations')
        .select('id, created_at')
        .eq('project_id', params.id as string)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      console.log('Database generations:', dbGenerations)
      console.log('Database generation IDs:', dbGenerations?.map((g: any) => g.id) || [])
      
      // Check if the generation exists in database
      const existsInDB = dbGenerations?.some((g: any) => g.id === generationToDelete) || false
      console.log('Generation exists in database:', existsInDB)
      
      if (!existsInDB) {
        console.log('Generation not found in database, removing from UI state')
        // Remove from UI state since it doesn't exist in database
        setGenerations(prev => prev.filter(g => g.id !== generationToDelete))
        setShowDeleteModal(false)
        setGenerationToDelete(null)
        alert('Generation was already removed from database. UI has been updated.')
        return
      }
      
      const { error, count } = await supabase
        .from('generations')
        .delete({ count: 'exact' })
        .eq('id', generationToDelete)

      console.log('Delete result - error:', error, 'count:', count)
      
      // Log detailed error information
      if (error) {
        console.error('Delete error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
      }
      
      // Try a simpler delete to see if it's a count issue
      if (count === 0 && !error) {
        console.log('Trying simple delete without count...')
        const { error: simpleError, count: simpleCount } = await supabase
          .from('generations')
          .delete()
          .eq('id', generationToDelete)
        
        console.log('Simple delete result - error:', simpleError, 'count:', simpleCount)
        
        if (simpleError) {
          console.error('Simple delete error details:', {
            message: simpleError.message,
            details: simpleError.details,
            hint: simpleError.hint,
            code: simpleError.code
          })
        }
        
        // Try a different approach - use RPC or direct SQL
        console.log('Trying alternative delete approach...')
        try {
          if (!generationToDelete) {
            throw new Error('No generation ID provided for deletion')
          }
          
          const { error: rpcError } = await supabase.rpc('delete_generation', { 
            generation_id: generationToDelete 
          })
          
          if (rpcError) {
            console.error('RPC delete error:', rpcError)
            console.log('RPC not available, trying manual refresh approach')
            
            // As a last resort, just remove from UI and refresh
            setGenerations(prev => prev.filter(g => g.id !== generationToDelete))
            setShowDeleteModal(false)
            setGenerationToDelete(null)
            alert('⚠️ Database permissions issue detected. The generation has been removed from view but may reappear after refresh. To fix this permanently, you need to update the RLS policies in Supabase to allow DELETE operations on the generations table.')
            return
          } else {
            console.log('RPC delete succeeded')
            // Refresh the list
            await fetchProject(params.id as string, user.id)
            setShowDeleteModal(false)
            setGenerationToDelete(null)
            return
          }
        } catch (rpcCatchError) {
          console.error('RPC call failed:', rpcCatchError)
          console.log('RPC not available, using manual refresh approach')
          
          // As a last resort, just remove from UI and refresh
          setGenerations(prev => prev.filter(g => g.id !== generationToDelete))
          setShowDeleteModal(false)
          setGenerationToDelete(null)
          alert('⚠️ Database permissions issue detected. The generation has been removed from view but may reappear after refresh. To fix this permanently, you need to update the RLS policies in Supabase to allow DELETE operations on the generations table.')
          return
        }
      }

      if (error) {
        console.error('Delete error:', error)
        alert('Failed to delete generation. Please try again.')
        return
      }

      if (count === 0) {
        console.error('No rows were deleted - generation not found')
        console.log('This suggests a state sync issue. Refreshing generations...')
        
        // Close modal
        setShowDeleteModal(false)
        setGenerationToDelete(null)
        
        // Refresh generations to sync with database
        await fetchProject(params.id as string, user.id)
        
        // Show user-friendly message
        setTimeout(() => {
          alert('Generation was already removed. List has been refreshed.')
        }, 100)
        
        return
      }

      console.log('Generation deleted successfully')

      // Close modal
      setShowDeleteModal(false)
      setGenerationToDelete(null)

      // Wait for database to be updated
      await new Promise(resolve => setTimeout(resolve, 500))

      // First, verify the generation is actually deleted
      const { data: checkData, count: remainingCount } = await supabase
        .from('generations')
        .select('id')
        .eq('id', generationToDelete)

      console.log('Verification - deleted generation still exists?', checkData?.length || 0)
      console.log('Total remaining generations:', remainingCount)

      // Now fetch all generations for this project
      console.log('Fetching fresh generations data...')
      const { data: freshGenerations, error: fetchError } = await supabase
        .from('generations')
        .select('*')
        .eq('project_id', params.id as string)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Error fetching fresh generations:', fetchError)
      } else {
        console.log('Fresh generations fetched:', freshGenerations?.length || 0)
        console.log('Fresh generations IDs:', freshGenerations?.map((g: any) => g.id) || [])
        setGenerations(freshGenerations || [])
      }
      
      // Log the result
      console.log('Delete operation completed, new generations count:', generations.length)
    } catch (error) {
      console.error('Error deleting generation:', error)
      alert('Failed to delete generation. Please try again.')
      setShowDeleteModal(false)
      setGenerationToDelete(null)
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setGenerationToDelete(null)
  }

  const handleCopyContent = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
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

  const exportToPDF = (content: string, generation: Generation) => {
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 20
      const lineHeight = 7
      const fontSize = 12
      
      doc.setFontSize(16)
      doc.text(project?.title || 'Generated Content', margin, 30)
      
      doc.setFontSize(fontSize)
      doc.text(`Generated on: ${new Date(generation.created_at).toLocaleDateString()}`, margin, 40)
      doc.text(`Model: ${generation.model_used}`, margin, 50)
      doc.text(`Tokens Used: ${generation.tokens_used || 'N/A'}`, margin, 60)
      
      // Add content
      const lines = doc.splitTextToSize(content, pageWidth - 2 * margin)
      let yPosition = 70
      
      lines.forEach((line: string) => {
        if (yPosition > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage()
          yPosition = margin
        }
        doc.text(line, margin, yPosition)
        yPosition += lineHeight
      })
      
      // Save the PDF
      const fileName = `${project?.title || 'content'}_${new Date(generation.created_at).toISOString().split('T')[0]}.pdf`
      doc.save(fileName)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    }
  }

  const exportToMarkdown = (content: string, generation: Generation) => {
    try {
      const markdownContent = `# ${project?.title || 'Generated Content'}

**Generated on:** ${new Date(generation.created_at).toLocaleDateString()}  
**Model:** ${generation.model_used}  
**Tokens Used:** ${generation.tokens_used || 'N/A'}  
**Content Type:** ${project?.type || 'Unknown'}

---

## Prompt
${generation.prompt}

## Generated Content
${content}

---

*Generated by AI Content Platform*`
      
      const blob = new Blob([markdownContent], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${project?.title || 'content'}_${new Date(generation.created_at).toISOString().split('T')[0]}.md`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting Markdown:', error)
      alert('Failed to export Markdown. Please try again.')
    }
  }

  const exportAsText = (content: string, generation: Generation) => {
    try {
      const textContent = `${project?.title || 'Generated Content'}

Generated on: ${new Date(generation.created_at).toLocaleDateString()}
Model: ${generation.model_used}
Tokens Used: ${generation.tokens_used || 'N/A'}
Content Type: ${project?.type || 'Unknown'}

${'='.repeat(50)}

## Prompt
${generation.prompt}

## Generated Content
${content}

${'='.repeat(50)}

Generated by AI Content Platform`
      
      const blob = new Blob([textContent], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${project?.title || 'content'}_${new Date(generation.created_at).toISOString().split('T')[0]}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting text:', error)
      alert('Failed to export text. Please try again.')
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
                              className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                              style={{
                                backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                                borderColor: theme === 'dark' ? '#4b5563' : '#9ca3af',
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
                              className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                              style={{
                                backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                                borderColor: theme === 'dark' ? '#4b5563' : '#9ca3af',
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
                      className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      style={{
                        backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                        borderColor: theme === 'dark' ? '#4b5563' : '#9ca3af',
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
                        style={{ color: colors.text.secondary }}
                      >
                        Prompt
                      </label>
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Enter your prompt here..."
                        rows={4}
                        className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none transition-colors duration-300 placeholder-gray-500 dark:placeholder-gray-400"
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
                    onClick={() => handleGenerate(false)}
                    disabled={isGenerating || creditsRemaining === 0 || (selectedTemplate ? Object.values(templateInputs).some(v => !v.trim()) : !prompt.trim())}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Generating...</span>
                      </>
                    ) : creditsRemaining === 0 ? (
                      <>
                        <Bot className="h-4 w-4" />
                        <span>No Credits Available</span>
                      </>
                    ) : (
                      <>
                        <Bot className="h-4 w-4" />
                        <span>Generate</span>
                      </>
                    )}
                  </button>
                  
                  {/* Credits Information */}
                  <div 
                    className="mt-3 p-3 rounded-lg border transition-colors duration-300"
                    style={{
                      backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb',
                      borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
                    }}
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span 
                        className="font-medium transition-colors duration-300"
                        style={{ color: theme === 'dark' ? '#f9fafb' : '#374151' }}
                      >
                        Credits Remaining:
                      </span>
                      <span 
                        className={`font-bold transition-colors duration-300 ${
                          creditsRemaining > 0 
                            ? theme === 'dark' ? '#10b981' : '#059669'
                            : theme === 'dark' ? '#ef4444' : '#dc2626'
                        }`}
                      >
                        {creditsRemaining}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span 
                        className="font-medium transition-colors duration-300"
                        style={{ color: theme === 'dark' ? '#f9fafb' : '#374151' }}
                      >
                        Cost per Generation:
                      </span>
                      <span 
                        className="font-bold transition-colors duration-300"
                        style={{ color: theme === 'dark' ? '#3b82f6' : '#2563eb' }}
                      >
                        1 Credit
                      </span>
                    </div>
                    {creditsRemaining === 0 && (
                      <div 
                        className="mt-2 p-2 rounded text-xs text-center transition-colors duration-300"
                        style={{
                          backgroundColor: theme === 'dark' ? '#991b1b' : '#fef2f2',
                          color: theme === 'dark' ? '#fca5a5' : '#991b1b'
                        }}
                      >
                        ⚠️ Insufficient credits. Please purchase more credits to continue generating.
                      </div>
                    )}
                  </div>
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
                  <div className="space-y-4">
                    {generations.map((generation) => (
                      <div 
                        key={generation.id} 
                        className="border rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                        style={{
                          backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                          borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
                        }}
                      >
                        {/* Header */}
                        <div 
                          className="px-6 py-4 border-b flex items-center justify-between"
                          style={{ borderColor: theme === 'dark' ? '#374151' : '#f3f4f6' }}
                        >
                          <div className="flex items-center space-x-4">
                            <div 
                              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300"
                              style={{ backgroundColor: theme === 'dark' ? '#1e3a8a' : '#dbeafe' }}
                            >
                              <Bot 
                                className="h-5 w-5 transition-colors duration-300"
                                style={{ color: theme === 'dark' ? '#60a5fa' : '#2563eb' }}
                              />
                            </div>
                            <div>
                              <div className="flex items-center space-x-3">
                                <p 
                                  className="font-semibold text-sm"
                                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                                >
                                  {generation.model_used}
                                </p>
                                <span 
                                  className="px-2 py-1 rounded-full text-xs font-medium"
                                  style={{
                                    backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
                                    color: theme === 'dark' ? '#d1d5db' : '#6b7280'
                                  }}
                                >
                                  AI Generated
                                </span>
                              </div>
                              <p 
                                className="text-xs mt-1"
                                style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                              >
                                {new Date(generation.created_at).toLocaleString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {/* Export Dropdown */}
                            <div className="relative group">
                              <button
                                className="p-2 rounded-lg transition-all duration-300 hover:scale-105"
                                style={{
                                  backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                                  color: theme === 'dark' ? '#6b7280' : '#9ca3af'
                                }}
                                title="Export content"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                              
                              {/* Dropdown Menu */}
                              <div className="absolute right-0 top-full mt-2 w-52 rounded-xl shadow-xl border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform group-hover:translate-y-0 translate-y-2"
                                style={{
                                  backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                                  borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
                                }}
                              >
                                <div className="py-2">
                                  <button
                                    onClick={() => handleCopyContent(generation.output || '')}
                                    className="flex items-center w-full px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 group/item"
                                    style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                                  >
                                    <div 
                                      className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-transform duration-200 group-hover/item:scale-110"
                                      style={{ backgroundColor: theme === 'dark' ? '#1e3a8a' : '#dbeafe' }}
                                    >
                                      <Clipboard className="h-4 w-4" style={{ color: theme === 'dark' ? '#60a5fa' : '#2563eb' }} />
                                    </div>
                                    <div className="flex flex-col items-start">
                                      <span className="font-medium">Copy to Clipboard</span>
                                      <span className="text-xs" style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }}>Copy instantly</span>
                                    </div>
                                  </button>
                                  <button
                                    onClick={() => exportToPDF(generation.output || '', generation)}
                                    className="flex items-center w-full px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/20 group/item"
                                    style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                                  >
                                    <div 
                                      className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-transform duration-200 group-hover/item:scale-110"
                                      style={{ backgroundColor: theme === 'dark' ? '#991b1b' : '#fee2e2' }}
                                    >
                                      <FileDown className="h-4 w-4" style={{ color: theme === 'dark' ? '#f87171' : '#dc2626' }} />
                                    </div>
                                    <div className="flex flex-col items-start">
                                      <span className="font-medium">Export as PDF</span>
                                      <span className="text-xs" style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }}>Download PDF</span>
                                    </div>
                                  </button>
                                  <button
                                    onClick={() => exportToMarkdown(generation.output || '', generation)}
                                    className="flex items-center w-full px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-purple-50 dark:hover:bg-purple-900/20 group/item"
                                    style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                                  >
                                    <div 
                                      className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-transform duration-200 group-hover/item:scale-110"
                                      style={{ backgroundColor: theme === 'dark' ? '#6b21a8' : '#f3e8ff' }}
                                    >
                                      <FileText className="h-4 w-4" style={{ color: theme === 'dark' ? '#c084fc' : '#9333ea' }} />
                                    </div>
                                    <div className="flex flex-col items-start">
                                      <span className="font-medium">Export as Markdown</span>
                                      <span className="text-xs" style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }}>Documentation</span>
                                    </div>
                                  </button>
                                  <button
                                    onClick={() => exportAsText(generation.output || '', generation)}
                                    className="flex items-center w-full px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-green-50 dark:hover:bg-green-900/20 group/item"
                                    style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                                  >
                                    <div 
                                      className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-transform duration-200 group-hover/item:scale-110"
                                      style={{ backgroundColor: theme === 'dark' ? '#14532d' : '#dcfce7' }}
                                    >
                                      <Download className="h-4 w-4" style={{ color: theme === 'dark' ? '#4ade80' : '#16a34a' }} />
                                    </div>
                                    <div className="flex flex-col items-start">
                                      <span className="font-medium">Export as Text</span>
                                      <span className="text-xs" style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }}>Plain text</span>
                                    </div>
                                  </button>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteGeneration(generation.id)}
                              className="p-2 rounded-lg transition-all duration-300 hover:scale-105"
                              style={{
                                backgroundColor: theme === 'dark' ? '#991b1b' : '#fee2e2',
                                color: theme === 'dark' ? '#f87171' : '#dc2626'
                              }}
                              title="Delete generation"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="px-6 py-4 space-y-4">
                          {/* Prompt Section */}
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <div 
                                className="w-5 h-5 rounded flex items-center justify-center"
                                style={{ backgroundColor: theme === 'dark' ? '#1e3a8a' : '#dbeafe' }}
                              >
                                <MessageSquare className="h-3 w-3" style={{ color: theme === 'dark' ? '#60a5fa' : '#2563eb' }} />
                              </div>
                              <p 
                                className="font-semibold text-sm"
                                style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                              >
                                Prompt
                              </p>
                            </div>
                            <div 
                              className="p-3 rounded-lg text-sm border"
                              style={{
                                backgroundColor: theme === 'dark' ? '#111827' : '#f8fafc',
                                borderColor: theme === 'dark' ? '#374151' : '#e2e8f0',
                                color: theme === 'dark' ? '#d1d5db' : '#475569'
                              }}
                            >
                              {generation.prompt}
                            </div>
                          </div>
                          
                          {/* Output Section */}
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <div 
                                className="w-5 h-5 rounded flex items-center justify-center"
                                style={{ backgroundColor: theme === 'dark' ? '#14532d' : '#dcfce7' }}
                              >
                                <FileText className="h-3 w-3" style={{ color: theme === 'dark' ? '#4ade80' : '#16a34a' }} />
                              </div>
                              <p 
                                className="font-semibold text-sm"
                                style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                              >
                                Generated Output
                              </p>
                            </div>
                            <div 
                              className="p-4 rounded-lg text-sm whitespace-pre-wrap border leading-relaxed"
                              style={{
                                backgroundColor: theme === 'dark' ? '#111827' : '#f8fafc',
                                borderColor: theme === 'dark' ? '#374151' : '#e2e8f0',
                                color: theme === 'dark' ? '#f9fafb' : '#1e293b'
                              }}
                            >
                              {generation.output}
                            </div>
                          </div>
                          
                          {/* Metadata */}
                          <div className="flex items-center justify-between pt-3 border-t"
                            style={{ borderColor: theme === 'dark' ? '#374151' : '#f3f4f6' }}
                          >
                            <div className="flex items-center space-x-4">
                              {generation.tokens_used && (
                                <div className="flex items-center space-x-2">
                                  <Zap className="h-4 w-4" style={{ color: theme === 'dark' ? '#60a5fa' : '#2563eb' }} />
                                  <span 
                                    className="text-xs font-medium"
                                    style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                                  >
                                    {generation.tokens_used} tokens
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4" style={{ color: theme === 'dark' ? '#60a5fa' : '#2563eb' }} />
                                <span 
                                  className="text-xs font-medium"
                                  style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                                >
                                  {Math.ceil((generation.output || '').length / 100)} words
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              {/* Accept/Reject Buttons - Only show for newly generated generation and not hidden */}
                              {newlyGeneratedId === generation.id && !hiddenThumbsGenerations.has(generation.id) && (
                                <div className="flex items-center space-x-1 p-1 rounded-lg"
                                  style={{
                                    backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6'
                                  }}
                                >
                                  <button
                                    onClick={() => handleAcceptGeneration(generation.id)}
                                    className={`p-2 rounded-lg transition-all duration-200 ${
                                      generationFeedback[generation.id] === 'accepted' 
                                        ? 'bg-green-500 text-white' 
                                        : 'hover:bg-green-100 dark:hover:bg-green-900/30'
                                    }`}
                                    style={{
                                      color: generationFeedback[generation.id] === 'accepted' 
                                        ? '#ffffff' 
                                        : theme === 'dark' ? '#6ee7b7' : '#16a34a'
                                    }}
                                    title="Keep this generation"
                                  >
                                    <ThumbsUp className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleRejectGeneration(generation.id)}
                                    className={`p-2 rounded-lg transition-all duration-200 ${
                                      generationFeedback[generation.id] === 'rejected' 
                                        ? 'bg-red-500 text-white' 
                                        : 'hover:bg-red-100 dark:hover:bg-red-900/30'
                                    }`}
                                    style={{
                                      color: generationFeedback[generation.id] === 'rejected' 
                                        ? '#ffffff' 
                                        : theme === 'dark' ? '#f87171' : '#dc2626'
                                    }}
                                    title="Delete and regenerate"
                                  >
                                    <ThumbsDown className="h-4 w-4" />
                                  </button>
                                </div>
                              )}
                              
                              {/* Status Badge */}
                              <span 
                                className="px-2 py-1 rounded-full text-xs font-medium"
                                style={{
                                  backgroundColor: generationFeedback[generation.id] === 'accepted' 
                                    ? theme === 'dark' ? '#064e3b' : '#d1fae5'
                                    : generationFeedback[generation.id] === 'rejected'
                                    ? theme === 'dark' ? '#7f1d1d' : '#fee2e2'
                                    : theme === 'dark' ? '#374151' : '#f3f4f6',
                                  color: generationFeedback[generation.id] === 'accepted'
                                    ? theme === 'dark' ? '#6ee7b7' : '#065f46'
                                    : generationFeedback[generation.id] === 'rejected'
                                    ? theme === 'dark' ? '#f87171' : '#dc2626'
                                    : theme === 'dark' ? '#d1d5db' : '#6b7280'
                                }}
                              >
                                {generationFeedback[generation.id] === 'accepted' 
                                  ? 'Accepted' 
                                  : generationFeedback[generation.id] === 'rejected'
                                  ? 'Rejected'
                                  : newlyGeneratedId === generation.id
                                  ? 'New'
                                  : 'Complete'
                                }
                              </span>
                            </div>
                          </div>
                        </div>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 max-w-sm w-full mx-4 border border-gray-200 dark:border-gray-700"
            style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff' }}
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-3">
                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 
                  className="text-lg font-semibold"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                >
                  Delete Generation
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                >
                  This action cannot be undone
                </p>
              </div>
            </div>
            
            <p 
              className="mb-6 text-sm"
              style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
            >
              Are you sure you want to delete this generation? All content will be permanently removed.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
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
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium text-sm"
              >
                Delete
              </button>
            </div>
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
                  Reject Generation
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                >
                  Delete and regenerate if needed
                </p>
              </div>
            </div>
            
            <p 
              className="mb-6 text-sm"
              style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
            >
              Are you sure you want to delete this generation? You'll be able to generate a new one with the same prompt.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelRejectGeneration}
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
                onClick={confirmRejectGeneration}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200 font-medium text-sm"
              >
                Delete & Regenerate
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
                  Create a new AI generation
                </p>
              </div>
            </div>
            
            <p 
              className="mb-6 text-sm"
              style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
            >
              Would you like to generate a new AI response with the same prompt? This regeneration is <span style={{ color: theme === 'dark' ? '#10b981' : '#059669', fontWeight: 'bold' }}>FREE</span> since you already paid for the original generation.
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
