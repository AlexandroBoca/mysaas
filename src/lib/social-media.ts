// Social Media Integration Utilities
import { supabase } from '@/lib/supabase'

export interface SocialAccount {
  id: string
  platform: string
  username: string
  displayName: string
  isActive: boolean
  connectedAt: string
}

export interface ScheduledPost {
  id: string
  content: string
  platforms: string[]
  scheduledDate: string
  scheduledTime: string
  status: 'draft' | 'scheduled' | 'posted' | 'failed' | 'cancelled'
  createdAt: string
  postedAt?: string
  errorMessage?: string
}

export interface PlatformConfig {
  id: string
  name: string
  icon: string
  color: string
  oauthUrl: string
  characterLimit?: number
  supportedMediaTypes: string[]
}

export const PLATFORMS: PlatformConfig[] = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: 'linkedin',
    color: '#0077B5',
    oauthUrl: '/api/auth/linkedin',
    characterLimit: 3000,
    supportedMediaTypes: ['image', 'video', 'document']
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: 'twitter',
    color: '#1DA1F2',
    oauthUrl: '/api/auth/twitter',
    characterLimit: 280,
    supportedMediaTypes: ['image', 'video', 'gif']
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: 'instagram',
    color: '#E4405F',
    oauthUrl: '/api/auth/instagram',
    characterLimit: 2200,
    supportedMediaTypes: ['image', 'video', 'carousel', 'story']
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'facebook',
    color: '#1877F2',
    oauthUrl: '/api/auth/facebook',
    characterLimit: 63206,
    supportedMediaTypes: ['image', 'video', 'link', 'status']
  }
]

// Content optimization for different platforms
export function optimizeContentForPlatform(content: string, platform: string): string {
  const config = PLATFORMS.find(p => p.id === platform)
  if (!config) return content

  let optimizedContent = content

  // Truncate content if it exceeds character limit
  if (config.characterLimit && content.length > config.characterLimit) {
    optimizedContent = content.substring(0, config.characterLimit - 3) + '...'
  }

  // Platform-specific optimizations
  switch (platform) {
    case 'linkedin':
      // Add professional hashtags if not present
      if (!optimizedContent.includes('#')) {
        optimizedContent += '\n\n#Professional #Business #Networking'
      }
      break
    
    case 'twitter':
      // Ensure hashtags are properly formatted
      optimizedContent = optimizedContent.replace(/#(\w+)/g, '#$1')
      break
    
    case 'instagram':
      // Add line breaks for better readability
      optimizedContent = optimizedContent.replace(/\n/g, '\n\n')
      break
    
    case 'facebook':
      // Add engagement questions if not present
      if (!optimizedContent.includes('?')) {
        optimizedContent += '\n\nWhat are your thoughts?'
      }
      break
  }

  return optimizedContent
}

// Get optimal posting times based on platform analytics
export function getOptimalPostingTimes(platform: string): string[] {
  const timesByPlatform = {
    linkedin: ['09:00', '12:00', '17:00'],
    twitter: ['08:00', '12:00', '18:00'],
    instagram: ['11:00', '14:00', '19:00'],
    facebook: ['09:00', '15:00', '20:00']
  }

  return timesByPlatform[platform as keyof typeof timesByPlatform] || ['12:00']
}

// Calculate engagement score based on content
export function calculateEngagementScore(content: string, platform: string): number {
  let score = 0

  // Base score
  score += content.length > 50 ? 10 : 5

  // Hashtag bonus
  const hashtagCount = (content.match(/#\w+/g) || []).length
  score += Math.min(hashtagCount * 5, 20)

  // Mention bonus
  const mentionCount = (content.match(/@\w+/g) || []).length
  score += Math.min(mentionCount * 3, 15)

  // Question bonus (engagement)
  if (content.includes('?')) {
    score += 10
  }

  // Emoji bonus
  const emojiCount = (content.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu) || []).length
  score += Math.min(emojiCount * 2, 10)

  // Platform-specific adjustments
  switch (platform) {
    case 'linkedin':
      // Professional content gets bonus
      if (content.toLowerCase().includes('professional') || content.toLowerCase().includes('business')) {
        score += 15
      }
      break
    
    case 'twitter':
      // Retweet-friendly content
      if (content.length < 200) {
        score += 10
      }
      break
    
    case 'instagram':
      // Visual content gets bonus
      if (content.toLowerCase().includes('photo') || content.toLowerCase().includes('image')) {
        score += 20
      }
      break
  }

  return Math.min(score, 100)
}

// Generate content suggestions based on platform
export function generateContentSuggestions(platform: string, topic: string): string[] {
  const suggestions = {
    linkedin: [
      `Excited to share insights on ${topic}! 🚀\n\nIn today's rapidly evolving landscape, understanding ${topic} is crucial for professionals. Here are my key takeaways:\n\n1. Innovation drives growth\n2. Collaboration amplifies impact\n3. Continuous learning is essential\n\nWhat's your experience with ${topic}? Share your thoughts below! 👇\n\n#${topic.replace(' ', '')} #Professional #Business`,
      `Just published an article about ${topic} - check it out!\n\nThe future of ${topic} is here, and it's transforming how we work and live. From enhanced productivity to new opportunities, the possibilities are endless.\n\nRead more about my insights and let me know what you think!\n\n#${topic.replace(' ', '')} #Innovation #Technology`,
    ],
    twitter: [
      `🚀 ${topic} is changing the game! Here's what you need to know:\n\n✅ Key benefit 1\n✅ Key benefit 2\n✅ Key benefit 3\n\nAre you ready for the future? #${topic.replace(' ', '')}`,
      `Hot take: ${topic} isn't just a trend—it's the future.\n\nHere's why:\n📈 Growth\n💡 Innovation\n🌍 Impact\n\nAgree or disagree? 👇 #${topic.replace(' ', '')}`,
    ],
    instagram: [
      `✨ ${topic} ✨\n\nDiscover the power of ${topic} and how it's transforming our world!\n\n📸 Tag someone who needs to see this!\n\n#${topic.replace(' ', '')} #Inspiration #Growth`,
      `🌟 ${topic} Spotlight 🌟\n\nEverything you need to know about ${topic} in one post!\n\nSave this for later and share with friends! 💫\n\n#${topic.replace(' ', '')} #Learn #Share`,
    ],
    facebook: [
      `I've been thinking a lot about ${topic} lately, and I wanted to share some thoughts with you all.\n\n${topic} is more than just a buzzword—it's fundamentally changing how we approach [relevant field]. The opportunities are incredible, but so are the challenges.\n\nWhat's your take on ${topic}? Have you implemented it in your work or personal life? I'd love to hear your experiences in the comments below! 👇\n\n#${topic.replace(' ', '')} #Discussion #Community`,
      `🎯 Quick question for my network: How are you leveraging ${topic} in your daily routine?\n\nI've been experimenting with it and the results have been fascinating! Here's what I've discovered:\n\n💡 [Insight 1]\n💡 [Insight 2]\n💡 [Insight 3]\n\nWould love to hear your experiences and tips! Let's learn together! 🤝\n\n#${topic.replace(' ', '')} #Learning #Community`,
    ]
  }

  return suggestions[platform as keyof typeof suggestions] || []
}

// Validate content for platform requirements
export function validateContentForPlatform(content: string, platform: string): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  const config = PLATFORMS.find(p => p.id === platform)
  if (!config) {
    return { isValid: false, errors: ['Unknown platform'], warnings }
  }

  // Check character limit
  if (config.characterLimit && content.length > config.characterLimit) {
    errors.push(`Content exceeds ${config.characterLimit} character limit`)
  }

  // Platform-specific validations
  switch (platform) {
    case 'instagram':
      if (!content.match(/\.(jpg|jpeg|png|gif|mp4|mov)/i)) {
        warnings.push('Instagram posts work better with visual content')
      }
      break
    
    case 'linkedin':
      if (content.length < 100) {
        warnings.push('LinkedIn posts perform better with more detailed content')
      }
      break
    
    case 'twitter':
      if (content.length < 50) {
        warnings.push('Twitter posts may get more engagement with more content')
      }
      break
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// Get connected social accounts for a user
export async function getConnectedAccounts(userId: string): Promise<SocialAccount[]> {
  const { data, error } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('connected_at', { ascending: false })

  if (error) {
    console.error('Error fetching connected accounts:', error)
    return []
  }

  return data || []
}

// Get scheduled posts for a user
export async function getScheduledPosts(userId: string): Promise<ScheduledPost[]> {
  const { data, error } = await supabase
    .from('scheduled_posts')
    .select('*')
    .eq('user_id', userId)
    .order('scheduled_date', { ascending: true })

  if (error) {
    console.error('Error fetching scheduled posts:', error)
    return []
  }

  return data || []
}

// Create a new scheduled post
export async function createScheduledPost(post: Omit<ScheduledPost, 'id' | 'createdAt'>): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('scheduled_posts')
      .insert({
        ...post,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error creating scheduled post:', error)
      return null
    }

    return (data as any)?.id || null
  } catch (error) {
    console.error('Error creating scheduled post:', error)
    return null
  }
}

// Update scheduled post
export async function updateScheduledPost(id: string, updates: Partial<ScheduledPost>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('scheduled_posts')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      console.error('Error updating scheduled post:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating scheduled post:', error)
    return false
  }
}

// Delete scheduled post
export async function deleteScheduledPost(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('scheduled_posts')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting scheduled post:', error)
    return false
  }

  return true
}
