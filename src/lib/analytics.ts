import { supabase } from './supabase'

// Define the analytics record type since the table doesn't exist yet
interface AnalyticsRecord {
  id?: string
  user_id: string
  project_id: string
  generation_id: string
  content_type: string
  word_count: number
  tokens_used: number
  model_used: string
  views?: number
  unique_views?: number
  shares?: number
  comments?: number
  likes?: number
  time_on_page?: number
  bounce_rate?: number
  click_through_rate?: number
  scroll_depth?: number
  facebook_shares?: number
  twitter_shares?: number
  linkedin_shares?: number
  instagram_likes?: number
  tiktok_views?: number
  load_time_ms?: number
  conversion_rate?: number
  revenue_generated?: number
  search_ranking?: number
  organic_traffic?: number
  backlinks?: number
  read_completion_rate?: number
  repeat_visits?: number
  session_duration?: number
  pages_per_session?: number
  lead_generated?: boolean
  customer_acquisition_cost?: number
  lifetime_value?: number
  device_type?: string
  browser?: string
  operating_system?: string
  country?: string
  region?: string
  city?: string
  traffic_source?: string
  campaign?: string
  medium?: string
  data_source?: string
  data_quality_score?: number
  is_sample_data?: boolean
  created_at?: string
  updated_at?: string
}

// Function to automatically track analytics when content is generated
export async function trackContentGeneration({
  user_id,
  project_id,
  generation_id,
  content_type,
  word_count,
  tokens_used,
  model_used,
  prompt,
  output
}: {
  user_id: string
  project_id: string
  generation_id: string
  content_type: string
  word_count: number
  tokens_used: number
  model_used: string
  prompt: string
  output: string
}) {
  try {
    // Create analytics record with default values
    const analyticsData: Partial<AnalyticsRecord> = {
      user_id,
      project_id,
      generation_id,
      content_type,
      word_count,
      tokens_used,
      model_used,
      // Default engagement metrics (will be updated as real data comes in)
      views: 0,
      unique_views: 0,
      shares: 0,
      comments: 0,
      likes: 0,
      time_on_page: 0,
      bounce_rate: 0,
      click_through_rate: 0,
      scroll_depth: 0,
      // Default social metrics
      facebook_shares: 0,
      twitter_shares: 0,
      linkedin_shares: 0,
      instagram_likes: 0,
      tiktok_views: 0,
      // Default performance metrics
      load_time_ms: 0,
      conversion_rate: 0,
      revenue_generated: 0,
      // Default SEO metrics
      search_ranking: 0,
      organic_traffic: 0,
      backlinks: 0,
      // Default content performance
      read_completion_rate: 0,
      repeat_visits: 0,
      session_duration: 0,
      pages_per_session: 1.0,
      // Default business metrics
      lead_generated: false,
      customer_acquisition_cost: 0,
      lifetime_value: 0,
      // Default geographic data (can be updated later)
      device_type: 'desktop',
      traffic_source: 'direct',
      // Data source tracking
      data_source: 'automated',
      data_quality_score: 0.8, // Lower score for estimated data
      is_sample_data: false
    }

    // Use any type to bypass TypeScript checking for the dynamic table
    const { data, error } = await (supabase as any)
      .from('analytics')
      .insert(analyticsData)
      .select()
      .single()

    if (error) {
      console.warn('Failed to track analytics:', error)
      return null
    }

    console.log('Analytics tracked successfully:', data)
    return data
  } catch (error) {
    console.error('Error tracking analytics:', error)
    return null
  }
}

// Function to update engagement metrics for existing analytics record
export async function updateEngagementMetrics({
  analytics_id,
  views,
  shares,
  comments,
  likes,
  time_on_page,
  bounce_rate,
  click_through_rate,
  scroll_depth
}: {
  analytics_id: string
  views?: number
  shares?: number
  comments?: number
  likes?: number
  time_on_page?: number
  bounce_rate?: number
  click_through_rate?: number
  scroll_depth?: number
}) {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (views !== undefined) updateData.views = views
    if (shares !== undefined) updateData.shares = shares
    if (comments !== undefined) updateData.comments = comments
    if (likes !== undefined) updateData.likes = likes
    if (time_on_page !== undefined) updateData.time_on_page = time_on_page
    if (bounce_rate !== undefined) updateData.bounce_rate = bounce_rate
    if (click_through_rate !== undefined) updateData.click_through_rate = click_through_rate
    if (scroll_depth !== undefined) updateData.scroll_depth = scroll_depth

    const { data, error } = await (supabase as any)
      .from('analytics')
      .update(updateData)
      .eq('id', analytics_id)
      .select()
      .single()

    if (error) {
      console.warn('Failed to update engagement metrics:', error)
      return null
    }

    console.log('Engagement metrics updated successfully:', data)
    return data
  } catch (error) {
    console.error('Error updating engagement metrics:', error)
    return null
  }
}

// Function to track page view
export async function trackPageView({
  analytics_id,
  device_type,
  browser,
  operating_system,
  country,
  region,
  city,
  traffic_source,
  campaign,
  medium
}: {
  analytics_id: string
  device_type?: string
  browser?: string
  operating_system?: string
  country?: string
  region?: string
  city?: string
  traffic_source?: string
  campaign?: string
  medium?: string
}) {
  try {
    // First get current view count, then increment it
    const { data: currentData, error: fetchError } = await (supabase as any)
      .from('analytics')
      .select('views')
      .eq('id', analytics_id)
      .single()

    if (fetchError) {
      console.warn('Failed to fetch current analytics data:', fetchError)
      return null
    }

    const currentViews = currentData?.views || 0

    const updateData: any = {
      views: currentViews + 1,
      device_type: device_type || 'desktop',
      browser: browser || 'unknown',
      operating_system: operating_system || 'unknown',
      country: country || null,
      region: region || null,
      city: city || null,
      traffic_source: traffic_source || 'direct',
      campaign: campaign || null,
      medium: medium || null,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await (supabase as any)
      .from('analytics')
      .update(updateData)
      .eq('id', analytics_id)
      .select()
      .single()

    if (error) {
      console.warn('Failed to track page view:', error)
      return null
    }

    console.log('Page view tracked successfully:', data)
    return data
  } catch (error) {
    console.error('Error tracking page view:', error)
    return null
  }
}

// Function to get analytics summary for a user
export async function getUserAnalyticsSummary(user_id: string, timeRange: string = '7d') {
  try {
    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (timeRange) {
      case '24h':
        startDate.setDate(now.getDate() - 1)
        break
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    const { data, error } = await (supabase as any)
      .from('analytics')
      .select('*')
      .eq('user_id', user_id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Failed to get user analytics summary:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error getting user analytics summary:', error)
    return null
  }
}

// Function to migrate existing data to analytics table
export async function migrateExistingData() {
  try {
    // Fetch all projects and generations
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')

    if (projectsError) {
      console.warn('Failed to fetch projects for migration:', projectsError)
      return
    }

    const { data: generations, error: generationsError } = await supabase
      .from('generations')
      .select('*')

    if (generationsError) {
      console.warn('Failed to fetch generations for migration:', generationsError)
      return
    }

    if (!projects || !generations) {
      console.log('No data to migrate')
      return
    }

    console.log(`Migrating ${projects.length} projects and ${generations.length} generations...`)

    // Create analytics records for each generation
    for (const generation of generations) {
      const project = projects.find((p: any) => p.id === (generation as any).project_id)
      
      if (project) {
        await trackContentGeneration({
          user_id: (generation as any).user_id,
          project_id: (generation as any).project_id,
          generation_id: (generation as any).id,
          content_type: (project as any).type || 'blog',
          word_count: Math.round(((generation as any).tokens_used || 0) * 0.75), // Estimate
          tokens_used: (generation as any).tokens_used || 0,
          model_used: (generation as any).model_used || 'gpt-3.5-turbo',
          prompt: (generation as any).prompt || '',
          output: (generation as any).output || ''
        })
      }
    }

    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Error migrating existing data:', error)
  }
}

// Function to create sample analytics data for testing
export async function createSampleAnalyticsData(user_id: string) {
  try {
    const sampleData = [
      {
        content_type: 'blog',
        word_count: 1250,
        tokens_used: 850,
        model_used: 'gpt-4',
        views: 234,
        shares: 12,
        comments: 8,
        likes: 45,
        time_on_page: 180,
        bounce_rate: 25.5,
        click_through_rate: 8.2,
        engagement_score: 78.5
      },
      {
        content_type: 'email',
        word_count: 450,
        tokens_used: 320,
        model_used: 'gpt-3.5-turbo',
        views: 156,
        shares: 6,
        comments: 3,
        likes: 28,
        time_on_page: 120,
        bounce_rate: 18.2,
        click_through_rate: 12.5,
        engagement_score: 82.3
      },
      {
        content_type: 'social',
        word_count: 180,
        tokens_used: 150,
        model_used: 'gpt-3.5-turbo',
        views: 892,
        shares: 45,
        comments: 23,
        likes: 156,
        time_on_page: 45,
        bounce_rate: 15.8,
        click_through_rate: 18.7,
        engagement_score: 91.2
      },
      {
        content_type: 'ad',
        word_count: 280,
        tokens_used: 220,
        model_used: 'gpt-4',
        views: 445,
        shares: 18,
        comments: 7,
        likes: 67,
        time_on_page: 90,
        bounce_rate: 32.1,
        click_through_rate: 15.3,
        engagement_score: 74.8
      },
      {
        content_type: 'article',
        word_count: 2100,
        tokens_used: 1450,
        model_used: 'gpt-4',
        views: 567,
        shares: 28,
        comments: 15,
        likes: 89,
        time_on_page: 420,
        bounce_rate: 12.4,
        click_through_rate: 10.8,
        engagement_score: 85.6
      }
    ]

    for (const sample of sampleData) {
      await (supabase as any)
        .from('analytics')
        .insert({
          user_id,
          project_id: `sample-project-${Math.random().toString(36).substr(2, 9)}`,
          generation_id: `sample-generation-${Math.random().toString(36).substr(2, 9)}`,
          ...sample,
          data_source: 'sample',
          data_quality_score: 1.0,
          is_sample_data: true
        })
    }

    console.log('Sample analytics data created successfully!')
  } catch (error) {
    console.error('Error creating sample analytics data:', error)
  }
}
