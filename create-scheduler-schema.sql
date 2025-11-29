-- Social Media Scheduler Database Schema
-- Run this in Supabase SQL Editor

-- Connected social media accounts
CREATE TABLE IF NOT EXISTS social_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'twitter', 'instagram', 'facebook')),
  platform_user_id TEXT NOT NULL, -- ID from the platform
  username TEXT NOT NULL,
  display_name TEXT NOT NULL,
  access_token TEXT NOT NULL, -- OAuth access token (encrypted)
  refresh_token TEXT, -- OAuth refresh token (encrypted)
  token_expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scheduled posts
CREATE TABLE IF NOT EXISTS scheduled_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  platforms TEXT[] NOT NULL, -- Array of platform IDs
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'posted', 'failed', 'cancelled')),
  timezone TEXT DEFAULT 'UTC',
  media_urls TEXT[], -- Array of media file URLs
  hashtags TEXT[], -- Array of hashtags
  mentions TEXT[], -- Array of @mentions
  post_type TEXT DEFAULT 'text' CHECK (post_type IN ('text', 'image', 'video', 'carousel', 'story')),
  engagement_goal INTEGER, -- Target engagement metrics
  posted_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post execution history (track each platform separately)
CREATE TABLE IF NOT EXISTS post_executions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scheduled_post_id UUID REFERENCES scheduled_posts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  platform_post_id TEXT, -- ID returned by the platform
  status TEXT NOT NULL CHECK (status IN ('pending', 'posted', 'failed')),
  response_data JSONB, -- API response data
  error_message TEXT,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content templates
CREATE TABLE IF NOT EXISTS content_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  platforms TEXT[], -- Suitable platforms for this template
  category TEXT,
  tags TEXT[],
  is_public BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics for posted content
CREATE TABLE IF NOT EXISTS post_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_execution_id UUID REFERENCES post_executions(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2),
  reach INTEGER DEFAULT 0,
  analytics_data JSONB, -- Raw analytics from platform
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhook configurations for platform callbacks
CREATE TABLE IF NOT EXISTS webhook_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  secret_key TEXT, -- For webhook verification
  events TEXT[], -- Types of events to receive
  is_active BOOLEAN DEFAULT TRUE,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_social_accounts_user_id ON social_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_platform ON social_accounts(platform);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user_id ON scheduled_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status ON scheduled_posts(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_scheduled_date ON scheduled_posts(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_post_executions_post_id ON post_executions(scheduled_post_id);
CREATE INDEX IF NOT EXISTS idx_post_analytics_execution_id ON post_analytics(post_execution_id);
CREATE INDEX IF NOT EXISTS idx_content_templates_user_id ON content_templates(user_id);

-- Enable Row Level Security
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own social accounts" ON social_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own social accounts" ON social_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own social accounts" ON social_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own social accounts" ON social_accounts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own scheduled posts" ON scheduled_posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scheduled posts" ON scheduled_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scheduled posts" ON scheduled_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own scheduled posts" ON scheduled_posts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own post executions" ON post_executions FOR SELECT USING (
  auth.uid() IN (
    SELECT user_id FROM scheduled_posts WHERE id = post_executions.scheduled_post_id
  )
);
CREATE POLICY "Users can insert own post executions" ON post_executions FOR INSERT WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM scheduled_posts WHERE id = post_executions.scheduled_post_id
  )
);
CREATE POLICY "Users can update own post executions" ON post_executions FOR UPDATE USING (
  auth.uid() IN (
    SELECT user_id FROM scheduled_posts WHERE id = post_executions.scheduled_post_id
  )
);

CREATE POLICY "Users can view own content templates" ON content_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own content templates" ON content_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own content templates" ON content_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own content templates" ON content_templates FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view public templates" ON content_templates FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Users can view own analytics" ON post_analytics FOR SELECT USING (
  auth.uid() IN (
    SELECT sp.user_id FROM post_executions pe
    JOIN scheduled_posts sp ON sp.id = pe.scheduled_post_id
    WHERE pe.id = post_analytics.post_execution_id
  )
);
CREATE POLICY "Users can insert own analytics" ON post_analytics FOR INSERT WITH CHECK (
  auth.uid() IN (
    SELECT sp.user_id FROM post_executions pe
    JOIN scheduled_posts sp ON sp.id = pe.scheduled_post_id
    WHERE pe.id = post_analytics.post_execution_id
  )
);

CREATE POLICY "Users can manage own webhook configs" ON webhook_configs FOR ALL USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON social_accounts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON scheduled_posts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON post_executions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON content_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON post_analytics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON webhook_configs TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON social_accounts TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON scheduled_posts TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON post_executions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON content_templates TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON post_analytics TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON webhook_configs TO service_role;
