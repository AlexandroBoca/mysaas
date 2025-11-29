# Social Media Content Scheduler

A comprehensive social media scheduling and posting system that allows users to generate content and schedule it across multiple platforms.

## Features

### 🚀 Core Functionality
- **Multi-Platform Support**: LinkedIn, Twitter, Instagram, Facebook
- **Content Scheduling**: Schedule posts for specific dates and times
- **OAuth Integration**: Secure authentication with social media platforms
- **Content Optimization**: Platform-specific content optimization
- **Analytics Tracking**: Monitor post performance across platforms

### 📱 Supported Platforms

#### LinkedIn
- **Character Limit**: 3,000 characters
- **Media Types**: Images, videos, documents
- **Optimization**: Professional hashtags and business-focused content
- **OAuth**: LinkedIn OAuth 2.0

#### Twitter
- **Character Limit**: 280 characters
- **Media Types**: Images, videos, GIFs
- **Optimization**: Hashtag formatting and engagement-focused content
- **OAuth**: Twitter OAuth 2.0

#### Instagram
- **Character Limit**: 2,200 characters
- **Media Types**: Images, videos, carousels, stories
- **Optimization**: Visual content emphasis and hashtag strategy
- **OAuth**: Instagram Basic Display API

#### Facebook
- **Character Limit**: 63,206 characters
- **Media Types**: Images, videos, links, status updates
- **Optimization**: Engagement questions and community-focused content
- **OAuth**: Facebook Login API

## Database Schema

### Tables

#### `social_accounts`
Stores connected social media accounts for each user.
- **Fields**: platform, username, display_name, access_token, refresh_token, etc.
- **RLS**: Users can only access their own accounts

#### `scheduled_posts`
Main table for scheduled content.
- **Fields**: content, platforms, scheduled_date, status, etc.
- **Statuses**: draft, scheduled, posted, failed, cancelled

#### `post_executions`
Tracks individual post executions per platform.
- **Fields**: platform, platform_post_id, status, response_data
- **Purpose**: Separate tracking for multi-platform posts

#### `content_templates`
Reusable content templates for different platforms.
- **Fields**: name, content, platforms, category, tags
- **Sharing**: Public/private templates

#### `post_analytics`
Performance metrics for posted content.
- **Fields**: likes, comments, shares, views, engagement_rate
- **Purpose**: Track and analyze post performance

#### `webhook_configs`
Webhook configurations for platform callbacks.
- **Fields**: platform, webhook_url, events, secret_key
- **Purpose**: Real-time updates from platforms

## API Endpoints

### Authentication
- `GET /api/auth/linkedin` - LinkedIn OAuth callback
- `GET /api/auth/twitter` - Twitter OAuth callback
- `GET /api/auth/instagram` - Instagram OAuth callback
- `GET /api/auth/facebook` - Facebook OAuth callback

### Content Management
- `POST /api/scheduler/post` - Schedule and post content
- `GET /api/scheduler/posts` - Get scheduled posts
- `PUT /api/scheduler/posts/:id` - Update scheduled post
- `DELETE /api/scheduler/posts/:id` - Delete scheduled post

### Account Management
- `GET /api/scheduler/accounts` - Get connected accounts
- `POST /api/scheduler/accounts` - Connect new account
- `DELETE /api/scheduler/accounts/:id` - Disconnect account

### Analytics
- `GET /api/scheduler/analytics/:postId` - Get post analytics
- `GET /api/scheduler/analytics/summary` - Get overall analytics

## Setup Instructions

### 1. Database Setup
```sql
-- Run the create-scheduler-schema.sql file in Supabase SQL Editor
-- This will create all necessary tables, indexes, and RLS policies
```

### 2. Environment Variables
Add these to your `.env.local` file:

```env
# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# Twitter OAuth
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret

# Instagram OAuth
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret

# Facebook OAuth
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Platform Setup

#### LinkedIn
1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps/new)
2. Create a new app
3. Add OAuth 2.0 redirect URL: `http://localhost:3000/api/auth/linkedin`
4. Request permissions: `r_liteprofile`, `r_emailaddress`, `w_member_social`
5. Copy Client ID and Secret

#### Twitter
1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new project and app
3. Set OAuth 2.0 callback URL: `http://localhost:3000/api/auth/twitter`
4. Request permissions: `tweet.read`, `tweet.write`
5. Copy Client ID and Secret

#### Instagram
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Instagram Basic Display product
4. Set OAuth redirect URI: `http://localhost:3000/api/auth/instagram`
5. Copy Client ID and Secret

#### Facebook
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Set OAuth redirect URI: `http://localhost:3000/api/auth/facebook`
5. Copy Client ID and Secret

## Usage Examples

### Basic Content Scheduling
```typescript
import { createScheduledPost } from '@/lib/social-media'

const postId = await createScheduledPost({
  content: "Check out our latest feature! 🚀",
  platforms: ['linkedin', 'twitter'],
  scheduledDate: '2024-01-15',
  scheduledTime: '10:00',
  status: 'scheduled',
  userId: 'user-id'
})
```

### Content Optimization
```typescript
import { optimizeContentForPlatform } from '@/lib/social-media'

const content = "Our new AI feature is amazing!"
const linkedinContent = optimizeContentForPlatform(content, 'linkedin')
const twitterContent = optimizeContentForPlatform(content, 'twitter')
```

### Get Connected Accounts
```typescript
import { getConnectedAccounts } from '@/lib/social-media'

const accounts = await getConnectedAccounts('user-id')
console.log(accounts) // [{ platform: 'linkedin', username: 'john-doe', ... }]
```

## Content Optimization Features

### Platform-Specific Optimizations
- **LinkedIn**: Professional hashtags, business focus
- **Twitter**: Character limit compliance, hashtag formatting
- **Instagram**: Visual content emphasis, line breaks
- **Facebook**: Engagement questions, community focus

### Content Suggestions
Generate platform-specific content suggestions based on topics:
```typescript
import { generateContentSuggestions } from '@/lib/social-media'

const suggestions = generateContentSuggestions('AI technology', 'linkedin')
// Returns array of LinkedIn-optimized content suggestions
```

### Engagement Score Calculation
Calculate potential engagement score for content:
```typescript
import { calculateEngagementScore } from '@/lib/social-media`

const score = calculateEngagementScore(content, 'twitter')
// Returns score from 0-100
```

### Content Validation
Validate content for platform requirements:
```typescript
import { validateContentForPlatform } from '@/lib/social-media'

const validation = validateContentForPlatform(content, 'twitter')
// Returns { isValid: boolean, errors: string[], warnings: string[] }
```

## Security Considerations

### Token Storage
- Access tokens are encrypted before storage
- Refresh tokens are used for long-term access
- Token expiration is tracked and handled automatically

### OAuth Security
- State parameter validation prevents CSRF attacks
- Secure token storage with HttpOnly cookies
- PKCE implementation for mobile apps

### Data Privacy
- RLS policies ensure users can only access their own data
- Minimal data collection from social platforms
- GDPR compliance considerations

## Performance Optimization

### Caching
- Social account data cached for 1 hour
- Content templates cached in memory
- Analytics data refreshed every 15 minutes

### Rate Limiting
- Platform API rate limits respected
- Exponential backoff for failed requests
- Queue system for bulk posting

### Background Jobs
- Scheduled posts processed via cron jobs
- Token refresh handled automatically
- Analytics data collected periodically

## Monitoring and Logging

### Error Tracking
- All API errors logged with context
- Failed post executions retried automatically
- User notifications for critical errors

### Analytics Tracking
- Post performance metrics collected
- User engagement patterns analyzed
- Platform-specific success rates tracked

## Future Enhancements

### Planned Features
- **AI Content Generation**: AI-powered content suggestions
- **Advanced Analytics**: Deeper insights and trends
- **Team Collaboration**: Multi-user account management
- **Mobile App**: Native iOS and Android apps
- **Webhook Support**: Real-time notifications
- **Content Calendar**: Visual calendar interface
- **Bulk Operations**: Mass posting and scheduling

### Platform Additions
- **TikTok**: Short-form video content
- **YouTube**: Video publishing and scheduling
- **Pinterest**: Visual content discovery
- **Reddit**: Community engagement
- **LinkedIn Pages**: Business page management

## Troubleshooting

### Common Issues

#### OAuth Failures
- Check redirect URLs in platform developer settings
- Verify environment variables are set correctly
- Ensure app permissions are approved

#### Posting Failures
- Check token expiration and refresh
- Verify platform API rate limits
- Validate content format and length

#### Database Issues
- Check RLS policies are correctly applied
- Verify database schema is up to date
- Check Supabase connection settings

### Debug Mode
Enable debug logging by setting:
```env
DEBUG_SCHEDULER=true
```

This will provide detailed logs for:
- OAuth flow steps
- API request/response details
- Database query execution
- Error stack traces

## Contributing

When contributing to the scheduler:
1. Follow the existing code style
2. Add proper TypeScript types
3. Include error handling
4. Write tests for new features
5. Update documentation

## License

This scheduler system is part of the main application and follows the same licensing terms.
