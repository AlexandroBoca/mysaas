// Database types for AI Content Generator

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          credits_remaining: number
          subscription_tier: string
          paddle_customer_id: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          credits_remaining?: number
          subscription_tier?: string
          paddle_customer_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          credits_remaining?: number
          subscription_tier?: string
          paddle_customer_id?: string | null
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          title: string
          type: string
          input_data: any
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          title: string
          type: string
          input_data?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          type?: string
          input_data?: any
          created_at?: string
          updated_at?: string
        }
      }
      generations: {
        Row: {
          id: string
          project_id: string
          user_id: string
          model_used: string
          prompt: string
          output: string | null
          tokens_used: number | null
          created_at: string
        }
        Insert: {
          project_id: string
          user_id: string
          model_used: string
          prompt: string
          output?: string | null
          tokens_used?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          model_used?: string
          prompt?: string
          output?: string | null
          tokens_used?: number | null
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          paddle_subscription_id: string
          paddle_customer_id: string
          status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing' | 'paused'
          price_id: string
          paddle_price_id: string
          quantity: number
          current_period_start: string
          current_period_end: string
          trial_end: string | null
          cancel_at_period_end: boolean
          canceled_at: string | null
          ended_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          paddle_subscription_id: string
          paddle_customer_id: string
          status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing' | 'paused'
          price_id: string
          paddle_price_id: string
          quantity?: number
          current_period_start: string
          current_period_end: string
          trial_end?: string | null
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          ended_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          paddle_subscription_id?: string
          paddle_customer_id?: string
          status?: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing' | 'paused'
          price_id?: string
          paddle_price_id?: string
          quantity?: number
          current_period_start?: string
          current_period_end?: string
          trial_end?: string | null
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          ended_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Type aliases for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Project = Database['public']['Tables']['projects']['Row']
export type Generation = Database['public']['Tables']['generations']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']

export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type GenerationInsert = Database['public']['Tables']['generations']['Insert']
export type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert']

// Content types for projects
export type ContentType = 'blog' | 'tweet' | 'email' | 'ad' | 'social' | 'article' | 'other'
