# Analytics Setup Guide

This guide will help you set up the comprehensive analytics system for your content generation application.

## 🎯 Overview

The analytics system provides real-time tracking of:
- Content generation metrics
- User engagement data
- Performance analytics
- Social media metrics
- SEO tracking
- Business intelligence

## 📋 Prerequisites

1. **Supabase Project** with existing tables (`profiles`, `projects`, `generations`)
2. **Admin Access** to your Supabase project
3. **Environment Variables** configured in your `.env.local` file

## 🚀 Quick Setup

### Step 1: Create Analytics Table

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Click **"New query"**
4. Copy and paste the complete SQL code from the analytics table creation
5. Click **"Run"**

The SQL code includes:
- Table creation with all necessary columns
- Indexes for performance optimization
- Row Level Security (RLS) policies
- Automatic calculation functions
- Data population triggers

### Step 2: Verify Table Creation

1. Go to **Table Editor** in Supabase
2. Look for the `analytics` table
3. Verify all columns are present
4. Check that RLS is enabled

### Step 3: Migrate Existing Data

#### Option A: Automatic Migration (Recommended)

Run the migration script:

```bash
# Install dependencies if needed
npm install @supabase/supabase-js

# Run the migration script
npx tsx src/scripts/migrate-analytics.ts
```

#### Option B: Manual Migration

If you prefer to migrate data manually, you can use the built-in functions:

```typescript
import { migrateExistingData, createSampleAnalyticsData } from '@/lib/analytics'

// Migrate existing projects and generations
await migrateExistingData()

// Or create sample data for testing
await createSampleAnalyticsData('user-id-here')
```

### Step 4: Update Environment Variables

Make sure your `.env.local` file includes:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Required for migrations
```

## 📊 How It Works

### Data Collection

The analytics system automatically tracks:

1. **Content Generation** - When users generate content via the templates
2. **Page Views** - When content is viewed
3. **Engagement** - Likes, shares, comments, time on page
4. **Performance** - Load times, conversion rates
5. **Geographic** - User location, device type
6. **Traffic Sources** - How users found your content

### Automatic Tracking

The system automatically creates analytics records when:

- ✅ **Content is generated** via the template system
- ✅ **Pages are viewed** by users
- ✅ **Engagement metrics** are updated
- ✅ **Performance data** is collected

### Data Sources

The system shows users whether they're viewing:

- 🟢 **Real Data** - Actual analytics from their content
- 🟡 **Sample Data** - Demo data for testing

## 🔧 Integration Points

### 1. Content Generation

When content is generated, the system automatically creates an analytics record:

```typescript
import { trackContentGeneration } from '@/lib/analytics'

// This is called automatically when content is generated
await trackContentGeneration({
  user_id: 'user-uuid',
  project_id: 'project-uuid', 
  generation_id: 'generation-uuid',
  content_type: 'blog',
  word_count: 1250,
  tokens_used: 850,
  model_used: 'gpt-4',
  prompt: 'Write a blog post about...',
  output: 'Generated content...'
})
```

### 2. Page View Tracking

Track when content is viewed:

```typescript
import { trackPageView } from '@/lib/analytics'

await trackPageView({
  analytics_id: 'analytics-record-uuid',
  device_type: 'mobile',
  browser: 'Chrome',
  operating_system: 'iOS',
  country: 'United States',
  traffic_source: 'organic'
})
```

### 3. Engagement Updates

Update engagement metrics:

```typescript
import { updateEngagementMetrics } from '@/lib/analytics'

await updateEngagementMetrics({
  analytics_id: 'analytics-record-uuid',
  views: 150,
  shares: 12,
  comments: 5,
  likes: 28,
  time_on_page: 180
})
```

## 📈 Analytics Dashboard Features

### Overview Stats
- Total Projects
- Content Generated  
- Words Written
- Engagement Rate
- Growth Rate

### Performance Trends
- Daily activity charts
- Engagement over time
- Content volume tracking

### Content Distribution
- Breakdown by content type
- Visual pie charts
- Percentage calculations

### Top Projects
- Best performing content
- Engagement scores
- View counts

### Engagement Metrics
- Time on page
- Bounce rate
- Click-through rate
- Social shares
- Comments and likes

## 🎨 Customization

### Adding New Metrics

1. Add columns to the `analytics` table
2. Update the TypeScript interfaces in `src/app/analytics/page.tsx`
3. Modify the data processing functions
4. Update the UI components

### Custom Calculations

The system includes automatic engagement score calculation:

```sql
-- Weighted formula:
-- Views (10%) + Shares (25%) + Comments (30%) + Likes (15%) + Time (10%) + CTR (10%)
```

You can modify this in the `calculate_engagement_score` function.

## 🔍 Troubleshooting

### Common Issues

#### 1. Analytics Table Not Found
**Error:** `relation "analytics" does not exist`
**Solution:** Run the SQL creation script first

#### 2. Permission Denied
**Error:** `permission denied for table analytics`
**Solution:** Check RLS policies and ensure service role key is used

#### 3. No Data Showing
**Issue:** Analytics page shows sample data
**Solution:** Run the migration script or generate new content

#### 4. Real Data Not Updating
**Issue:** New content not appearing in analytics
**Solution:** Check that `trackContentGeneration` is being called

### Debug Mode

Enable debug logging:

```typescript
// In your analytics functions
console.log('Analytics tracked:', data)
```

## 📚 API Reference

### Core Functions

- `trackContentGeneration()` - Track new content generation
- `updateEngagementMetrics()` - Update engagement data
- `trackPageView()` - Track page views
- `getUserAnalyticsSummary()` - Get user analytics
- `migrateExistingData()` - Migrate existing data
- `createSampleAnalyticsData()` - Create sample data

### Data Models

See the column explanations in the SQL table for complete data structure.

## 🚀 Production Deployment

### Environment Setup

1. Set up production Supabase project
2. Create analytics table in production
3. Run migration script for existing data
4. Test with sample data first
5. Monitor performance and adjust indexes as needed

### Performance Optimization

- The table includes optimized indexes
- Consider archiving old data for large datasets
- Monitor query performance in Supabase dashboard
- Adjust time range limits as needed

## 📞 Support

If you encounter issues:

1. Check the Supabase logs
2. Verify table structure matches SQL
3. Ensure RLS policies are correct
4. Test with sample data first
5. Check environment variables

## 🔄 Updates

The analytics system is designed to be:
- **Backward compatible** - Existing data won't break
- **Extensible** - Easy to add new metrics
- **Performant** - Optimized for large datasets
- **Secure** - Row-level security for user privacy

---

**Ready to go!** 🎉

Your analytics system is now set up and ready to track real user engagement data!
