'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  TrendingUp, 
  Mail, 
  Send,
  Users,
  Target,
  Bell,
  FileText, 
  MessageSquare, 
  Tag, 
  ShoppingBag,
  Briefcase,
  GraduationCap,
  Heart,
  Zap,
  ChevronRight,
  Bookmark,
  Grid3X3,
  List
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/layout/Sidebar'
import { useTheme } from '@/contexts/ThemeContext'
import ThemeToggle from '@/components/ui/ThemeToggle'

interface Template {
  id: string
  name: string
  description: string
  category: string
  type: string
  prompt: string
  inputs: { name: string; placeholder: string; type: string }[]
  estimatedTime: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  uses: number
  rating: number
  isPro?: boolean
  icon: React.ReactNode
}

export default function Templates() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [favorites, setFavorites] = useState<string[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const router = useRouter()
  const { theme } = useTheme()

  const templates: Template[] = [
    {
      id: '1',
      name: 'Professional Email Campaign',
      description: 'Create compelling email campaigns for marketing, newsletters, and announcements',
      category: 'email',
      type: 'email',
      prompt: 'Write a professional email campaign about [TOPIC] for [AUDIENCE]. The email should have a compelling subject line, engaging opening, key benefits, clear call-to-action, and professional closing. Tone: [TONE]. Length: [LENGTH] words.',
      inputs: [
        { name: 'TOPIC', placeholder: 'What is the email about?', type: 'text' },
        { name: 'AUDIENCE', placeholder: 'Who are you sending this to?', type: 'text' },
        { name: 'TONE', placeholder: 'Formal, casual, friendly?', type: 'select' },
        { name: 'LENGTH', placeholder: 'Approximate word count', type: 'number' }
      ],
      estimatedTime: '5 min',
      difficulty: 'beginner',
      uses: 1250,
      rating: 4.8,
      icon: <Send className="h-5 w-5" />
    },
    {
      id: '2',
      name: 'Welcome Email Series',
      description: 'Generate a complete welcome email sequence for new subscribers or customers',
      category: 'email',
      type: 'email',
      prompt: 'Create a welcome email series for [USER_TYPE] who just [ACTION]. Generate [NUMBER] emails: 1) Immediate welcome with onboarding, 2) Value proposition email, 3) First engagement email. Include subject lines, personalization tokens, and clear next steps. Brand voice: [TONE].',
      inputs: [
        { name: 'USER_TYPE', placeholder: 'New subscribers, customers, members?', type: 'text' },
        { name: 'ACTION', placeholder: 'Signed up, made purchase, joined?', type: 'text' },
        { name: 'NUMBER', placeholder: 'Number of emails in series', type: 'number' },
        { name: 'TONE', placeholder: 'Friendly, professional, enthusiastic?', type: 'select' }
      ],
      estimatedTime: '8 min',
      difficulty: 'intermediate',
      uses: 890,
      rating: 4.9,
      icon: <Users className="h-5 w-5" />
    },
    {
      id: '3',
      name: 'Sales Email Template',
      description: 'High-converting sales emails for product launches and promotions',
      category: 'email',
      type: 'email',
      prompt: 'Write a persuasive sales email for [PRODUCT] targeting [CUSTOMER]. The email should: 1) Grab attention with [HOOK_TYPE], 2) Present [NUMBER] key benefits, 3) Address [OBJECTION] objections, 4) Create urgency with [URGENCY], 5) Clear call-to-action. Include subject line variations. Price point: [PRICE].',
      inputs: [
        { name: 'PRODUCT', placeholder: 'Product or service name', type: 'text' },
        { name: 'CUSTOMER', placeholder: 'Target customer profile', type: 'text' },
        { name: 'HOOK_TYPE', placeholder: 'Question, statistic, story?', type: 'select' },
        { name: 'NUMBER', placeholder: 'Number of benefits to highlight', type: 'number' },
        { name: 'OBJECTION', placeholder: 'Common objections to address', type: 'text' },
        { name: 'URGENCY', placeholder: 'Limited time, scarcity, bonus?', type: 'text' },
        { name: 'PRICE', placeholder: 'Price point or range', type: 'text' }
      ],
      estimatedTime: '6 min',
      difficulty: 'intermediate',
      uses: 1100,
      rating: 4.7,
      icon: <Target className="h-5 w-5" />
    },
    {
      id: '4',
      name: 'Newsletter Content',
      description: 'Engaging newsletter templates for regular audience communication',
      category: 'email',
      type: 'email',
      prompt: 'Create a [FREQUENCY] newsletter for [BRAND] targeting [AUDIENCE]. Include: 1) Compelling subject line, 2) Personal greeting, 3) [NUMBER] main sections with [CONTENT_TYPES], 4) Call-to-action for [GOAL], 5) Professional signature. Word count: [WORDS]. Include engagement hooks.',
      inputs: [
        { name: 'FREQUENCY', placeholder: 'Weekly, monthly, daily?', type: 'select' },
        { name: 'BRAND', placeholder: 'Your brand or company name', type: 'text' },
        { name: 'AUDIENCE', placeholder: 'Newsletter subscribers', type: 'text' },
        { name: 'NUMBER', placeholder: 'Number of main sections', type: 'number' },
        { name: 'CONTENT_TYPES', placeholder: 'Updates, tips, news, offers?', type: 'text' },
        { name: 'GOAL', placeholder: 'Read article, visit site, buy?', type: 'text' },
        { name: 'WORDS', placeholder: 'Target word count', type: 'number' }
      ],
      estimatedTime: '7 min',
      difficulty: 'beginner',
      uses: 950,
      rating: 4.8,
      icon: <Bell className="h-5 w-5" />
    },
    {
      id: '5',
      name: 'Follow-up Email Sequence',
      description: 'Automated follow-up emails for sales, meetings, and customer service',
      category: 'email',
      type: 'email',
      prompt: 'Generate a follow-up email sequence for [CONTEXT]. Create [NUMBER] follow-ups over [TIMEFRAME]. Each email should: 1) Reference previous interaction, 2) Provide additional value, 3) Handle [OBJECTION_TYPE] objections, 4) Include clear next steps. Escalate urgency appropriately.',
      inputs: [
        { name: 'CONTEXT', placeholder: 'Sales meeting, customer inquiry, application?', type: 'text' },
        { name: 'NUMBER', placeholder: 'Number of follow-up emails', type: 'number' },
        { name: 'TIMEFRAME', placeholder: 'Days, weeks between emails', type: 'text' },
        { name: 'OBJECTION_TYPE', placeholder: 'Price, timing, competition?', type: 'text' }
      ],
      estimatedTime: '9 min',
      difficulty: 'advanced',
      uses: 720,
      rating: 4.6,
      icon: <Mail className="h-5 w-5" />
    },
    {
      id: '6',
      name: 'Blog Post: Complete Guide',
      description: 'Comprehensive blog post template with introduction, main points, and conclusion',
      category: 'blog',
      type: 'blog',
      prompt: 'Write a comprehensive blog post about [TOPIC] for [AUDIENCE]. Include: 1) Engaging introduction with hook, 2) [NUMBER] key points with detailed explanations, 3) Practical examples, 4) Conclusion with call-to-action. Target SEO keywords: [KEYWORDS]. Word count: [WORDS] words.',
      inputs: [
        { name: 'TOPIC', placeholder: 'What is the blog post about?', type: 'text' },
        { name: 'AUDIENCE', placeholder: 'Target audience', type: 'text' },
        { name: 'NUMBER', placeholder: 'Number of key points', type: 'number' },
        { name: 'KEYWORDS', placeholder: 'SEO keywords (comma-separated)', type: 'text' },
        { name: 'WORDS', placeholder: 'Target word count', type: 'number' }
      ],
      estimatedTime: '10 min',
      difficulty: 'intermediate',
      uses: 890,
      rating: 4.9,
      icon: <FileText className="h-5 w-5" />
    },
    {
      id: '7',
      name: 'Social Media Content Pack',
      description: 'Generate a complete set of social media posts for multiple platforms',
      category: 'social',
      type: 'social',
      prompt: 'Create a social media content pack about [TOPIC] for [PLATFORMS]. Include: 1) Hook/attention grabber, 2) Main message with value proposition, 3) Call-to-action, 4) Relevant hashtags. Tone: [TONE]. Each post should be platform-optimized for character limits and best practices.',
      inputs: [
        { name: 'TOPIC', placeholder: 'Content topic', type: 'text' },
        { name: 'PLATFORMS', placeholder: 'Twitter, Instagram, LinkedIn, Facebook', type: 'text' },
        { name: 'TONE', placeholder: 'Professional, casual, witty?', type: 'select' }
      ],
      estimatedTime: '8 min',
      difficulty: 'beginner',
      uses: 2100,
      rating: 4.7,
      icon: <MessageSquare className="h-5 w-5" />
    },
    {
      id: '8',
      name: 'Product Description Copy',
      description: 'Persuasive product descriptions that drive sales and conversions',
      category: 'ecommerce',
      type: 'ad',
      prompt: 'Write compelling product descriptions for [PRODUCT_NAME]. Target audience: [AUDIENCE]. Key features: [FEATURES]. Benefits: [BENEFITS]. Include: 1) Catchy headline, 2) Engaging description, 3) Key benefits, 4) Social proof elements, 5) Call-to-action. Tone: [TONE].',
      inputs: [
        { name: 'PRODUCT_NAME', placeholder: 'Product name', type: 'text' },
        { name: 'AUDIENCE', placeholder: 'Target customers', type: 'text' },
        { name: 'FEATURES', placeholder: 'Key features (comma-separated)', type: 'text' },
        { name: 'BENEFITS', placeholder: 'Customer benefits', type: 'text' },
        { name: 'TONE', placeholder: 'Professional, casual, exciting?', type: 'select' }
      ],
      estimatedTime: '6 min',
      difficulty: 'beginner',
      uses: 1560,
      rating: 4.6,
      icon: <ShoppingBag className="h-5 w-5" />
    },
    {
      id: '9',
      name: 'LinkedIn Professional Article',
      description: 'Thought leadership articles for LinkedIn professional networking',
      category: 'business',
      type: 'article',
      prompt: 'Write a professional LinkedIn article about [TOPIC] for [INDUSTRY] professionals. Include: 1) Strong opening with statistic or insight, 2) Personal experience or case study, 3) Actionable advice, 4) Future trends, 5) Engagement question. Tone: authoritative but approachable. Length: [WORDS] words.',
      inputs: [
        { name: 'TOPIC', placeholder: 'Article topic', type: 'text' },
        { name: 'INDUSTRY', placeholder: 'Target industry', type: 'text' },
        { name: 'WORDS', placeholder: 'Target word count', type: 'number' }
      ],
      estimatedTime: '12 min',
      difficulty: 'advanced',
      uses: 450,
      rating: 4.9,
      icon: <Briefcase className="h-5 w-5" />
    },
    {
      id: '10',
      name: 'Educational Content Outline',
      description: 'Structured educational content for courses, tutorials, and training',
      category: 'education',
      type: 'article',
      prompt: 'Create an educational content outline about [SUBJECT] for [LEVEL] learners. Include: 1) Learning objectives, 2) Prerequisites, 3) Module breakdown with topics, 4) Activities/exercises, 5) Assessment methods. Duration: [DURATION]. Format: [FORMAT].',
      inputs: [
        { name: 'SUBJECT', placeholder: 'Subject matter', type: 'text' },
        { name: 'LEVEL', placeholder: 'Beginner, intermediate, advanced?', type: 'select' },
        { name: 'DURATION', placeholder: 'Course duration', type: 'text' },
        { name: 'FORMAT', placeholder: 'Video, text, workshop?', type: 'select' }
      ],
      estimatedTime: '15 min',
      difficulty: 'advanced',
      uses: 320,
      rating: 4.8,
      icon: <GraduationCap className="h-5 w-5" />
    },
    {
      id: '11',
      name: 'Health & Wellness Blog',
      description: 'Engaging health and wellness content with scientific backing',
      category: 'health',
      type: 'blog',
      prompt: 'Write a health and wellness blog post about [TOPIC]. Include: 1) Evidence-based information, 2) Practical tips, 3) Common myths debunked, 4) Expert quotes or studies, 5) Disclaimer. Target audience: [AUDIENCE]. Tone: informative yet accessible. Word count: [WORDS] words.',
      inputs: [
        { name: 'TOPIC', placeholder: 'Health topic', type: 'text' },
        { name: 'AUDIENCE', placeholder: 'Target audience', type: 'text' },
        { name: 'WORDS', placeholder: 'Word count', type: 'number' }
      ],
      estimatedTime: '10 min',
      difficulty: 'intermediate',
      uses: 680,
      rating: 4.7,
      icon: <Heart className="h-5 w-5" />
    },
    {
      id: '12',
      name: 'Viral Social Media Challenge',
      description: 'Create engaging social media challenges that drive engagement',
      category: 'social',
      type: 'social',
      prompt: 'Design a viral social media challenge about [TOPIC] for [PLATFORM]. Include: 1) Catchy challenge name, 2) Clear instructions, 3) Hashtag strategy, 4) User participation incentives, 5) Content examples. Target audience: [AUDIENCE]. Duration: [DURATION].',
      inputs: [
        { name: 'TOPIC', placeholder: 'Challenge theme', type: 'text' },
        { name: 'PLATFORM', placeholder: 'TikTok, Instagram, YouTube?', type: 'select' },
        { name: 'AUDIENCE', placeholder: 'Target demographic', type: 'text' },
        { name: 'DURATION', placeholder: 'Challenge length', type: 'text' }
      ],
      estimatedTime: '8 min',
      difficulty: 'intermediate',
      uses: 920,
      rating: 4.8,
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      id: '23',
      name: 'Press Release Template',
      description: 'Professional press releases for product launches, announcements, and news',
      category: 'business',
      type: 'article',
      prompt: 'Write a professional press release about [TOPIC] for [COMPANY]. Include: 1) FOR IMMEDIATE RELEASE header, 2) Compelling headline, 3) Dateline and location, 4) Lead paragraph with 5W\'s, 5) Company boilerplate, 6) Contact information. Quote from [SPOKESPERSON]. Target media: [MEDIA_TYPE].',
      inputs: [
        { name: 'TOPIC', placeholder: 'What\'s the news?', type: 'text' },
        { name: 'COMPANY', placeholder: 'Company name', type: 'text' },
        { name: 'SPOKESPERSON', placeholder: 'Quote source person', type: 'text' },
        { name: 'MEDIA_TYPE', placeholder: 'Tech, business, lifestyle?', type: 'text' }
      ],
      estimatedTime: '8 min',
      difficulty: 'intermediate',
      uses: 420,
      rating: 4.8,
      icon: <Send className="h-5 w-5" />
    },
    {
      id: '13',
      name: 'Video Script - YouTube Tutorial',
      description: 'Engaging YouTube tutorial scripts with hooks and calls-to-action',
      category: 'video',
      type: 'script',
      prompt: 'Create a YouTube tutorial script about [TOPIC] for [AUDIENCE]. Structure: 1) Hook (first 15 seconds), 2) Introduction, 3) Main content with [NUMBER] steps, 4) Common mistakes to avoid, 5) Conclusion with call-to-action. Include visual cues and timing notes. Video length: [DURATION] minutes.',
      inputs: [
        { name: 'TOPIC', placeholder: 'Tutorial topic', type: 'text' },
        { name: 'AUDIENCE', placeholder: 'Target audience', type: 'text' },
        { name: 'NUMBER', placeholder: 'Number of steps', type: 'number' },
        { name: 'DURATION', placeholder: 'Video length in minutes', type: 'number' }
      ],
      estimatedTime: '12 min',
      difficulty: 'intermediate',
      uses: 890,
      rating: 4.9,
      icon: <Zap className="h-5 w-5" />
    },
    {
      id: '14',
      name: 'Podcast Episode Outline',
      description: 'Professional podcast episode structures with segments and transitions',
      category: 'audio',
      type: 'script',
      prompt: 'Create a podcast episode outline about [TOPIC] for [SHOW_NAME]. Include: 1) Cold open with hook, 2) Introduction and guest intro, 3) [NUMBER] main segments with talking points, 4) Interview questions, 5) Call-to-action and outro. Episode length: [LENGTH] minutes. Style: [STYLE].',
      inputs: [
        { name: 'TOPIC', placeholder: 'Episode topic', type: 'text' },
        { name: 'SHOW_NAME', placeholder: 'Podcast name', type: 'text' },
        { name: 'NUMBER', placeholder: 'Number of segments', type: 'number' },
        { name: 'LENGTH', placeholder: 'Episode duration', type: 'text' },
        { name: 'STYLE', placeholder: 'Interview, solo, panel?', type: 'select' }
      ],
      estimatedTime: '10 min',
      difficulty: 'advanced',
      uses: 340,
      rating: 4.7,
      icon: <MessageSquare className="h-5 w-5" />
    },
    {
      id: '15',
      name: 'Technical Documentation',
      description: 'Clear and comprehensive technical documentation for software and APIs',
      category: 'technical',
      type: 'article',
      prompt: 'Write technical documentation for [PRODUCT/API]. Include: 1) Overview and purpose, 2) Prerequisites, 3) Installation/setup instructions, 4) [NUMBER] key features with examples, 5) Troubleshooting section, 6) API reference. Target audience: [AUDIENCE]. Include code examples.',
      inputs: [
        { name: 'PRODUCT/API', placeholder: 'Product or API name', type: 'text' },
        { name: 'AUDIENCE', placeholder: 'Developers, end users?', type: 'text' },
        { name: 'NUMBER', placeholder: 'Number of features to document', type: 'number' }
      ],
      estimatedTime: '15 min',
      difficulty: 'advanced',
      uses: 280,
      rating: 4.6,
      icon: <FileText className="h-5 w-5" />
    },
    {
      id: '16',
      name: 'Case Study Template',
      description: 'Business case studies that demonstrate ROI and success stories',
      category: 'business',
      type: 'article',
      prompt: 'Write a compelling case study about [CLIENT]\'s success with [SOLUTION]. Include: 1) Executive summary, 2) Client background and challenges, 3) Solution implementation, 4) Results with metrics, 5) Client testimonial, 6) Lessons learned. Industry: [INDUSTRY]. Key metrics: [METRICS].',
      inputs: [
        { name: 'CLIENT', placeholder: 'Client company name', type: 'text' },
        { name: 'SOLUTION', placeholder: 'Product/service provided', type: 'text' },
        { name: 'INDUSTRY', placeholder: 'Client industry', type: 'text' },
        { name: 'METRICS', placeholder: 'Key success metrics', type: 'text' }
      ],
      estimatedTime: '12 min',
      difficulty: 'intermediate',
      uses: 560,
      rating: 4.8,
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      id: '17',
      name: 'Instagram Content Strategy',
      description: 'Complete Instagram content calendar with captions and hashtags',
      category: 'social',
      type: 'social',
      prompt: 'Create a [DURATION] Instagram content strategy for [BRAND]. Include: 1) Content pillars, 2) [NUMBER] post ideas with engaging captions, 3) Hashtag strategy (niche + broad), 4) Best posting times, 5) Story ideas. Target audience: [AUDIENCE]. Goal: [GOAL]. Tone: [TONE].',
      inputs: [
        { name: 'DURATION', placeholder: 'Weekly, monthly, quarterly?', type: 'select' },
        { name: 'BRAND', placeholder: 'Brand name', type: 'text' },
        { name: 'NUMBER', placeholder: 'Number of post ideas', type: 'number' },
        { name: 'AUDIENCE', placeholder: 'Target audience', type: 'text' },
        { name: 'GOAL', placeholder: 'Engagement, sales, awareness?', type: 'text' },
        { name: 'TONE', placeholder: 'Professional, casual, trendy?', type: 'select' }
      ],
      estimatedTime: '15 min',
      difficulty: 'intermediate',
      uses: 1200,
      rating: 4.9,
      icon: <Tag className="h-5 w-5" />
    },
    {
      id: '18',
      name: 'Sales Proposal Template',
      description: 'Professional sales proposals that win contracts and deals',
      category: 'business',
      type: 'article',
      prompt: 'Write a comprehensive sales proposal for [CLIENT] for [PROJECT/SERVICE]. Include: 1) Executive summary, 2) Understanding of needs, 3) Proposed solution, 4) Timeline with milestones, 5) Pricing breakdown, 6) Terms and conditions. Budget: [BUDGET]. Decision maker: [DECISION_MAKER].',
      inputs: [
        { name: 'CLIENT', placeholder: 'Client company', type: 'text' },
        { name: 'PROJECT/SERVICE', placeholder: 'What you\'re proposing', type: 'text' },
        { name: 'BUDGET', placeholder: 'Project budget range', type: 'text' },
        { name: 'DECISION_MAKER', placeholder: 'Who approves this?', type: 'text' }
      ],
      estimatedTime: '18 min',
      difficulty: 'advanced',
      uses: 380,
      rating: 4.7,
      icon: <Briefcase className="h-5 w-5" />
    },
    {
      id: '19',
      name: 'Recipe Blog Post',
      description: 'Engaging recipe posts with ingredients, instructions, and storytelling',
      category: 'food',
      type: 'blog',
      prompt: 'Write a recipe blog post for [DISH_NAME]. Include: 1) Story behind the recipe, 2) Ingredients list with quantities, 3) Step-by-step instructions, 4) Pro tips and variations, 5) Nutritional information, 6) Serving suggestions. Dietary: [DIETARY]. Difficulty: [DIFFICULTY]. Prep time: [PREP_TIME].',
      inputs: [
        { name: 'DISH_NAME', placeholder: 'Recipe name', type: 'text' },
        { name: 'DIETARY', placeholder: 'Vegetarian, gluten-free, etc?', type: 'text' },
        { name: 'DIFFICULTY', placeholder: 'Easy, medium, hard?', type: 'select' },
        { name: 'PREP_TIME', placeholder: 'Preparation time', type: 'text' }
      ],
      estimatedTime: '8 min',
      difficulty: 'beginner',
      uses: 750,
      rating: 4.8,
      icon: <Heart className="h-5 w-5" />
    },
    {
      id: '20',
      name: 'Financial Report Summary',
      description: 'Executive summaries for financial reports and investor updates',
      category: 'finance',
      type: 'article',
      prompt: 'Write a financial report summary for [COMPANY] for [PERIOD]. Include: 1) Executive summary, 2) Key financial metrics, 3) Revenue highlights, 4) Expense analysis, 5) Profit margins, 6) Future outlook. Audience: [AUDIENCE]. Focus areas: [FOCUS_AREAS].',
      inputs: [
        { name: 'COMPANY', placeholder: 'Company name', type: 'text' },
        { name: 'PERIOD', placeholder: 'Q1, Q2, annual, etc?', type: 'text' },
        { name: 'AUDIENCE', placeholder: 'Investors, board, management?', type: 'text' },
        { name: 'FOCUS_AREAS', placeholder: 'Key areas to highlight', type: 'text' }
      ],
      estimatedTime: '12 min',
      difficulty: 'advanced',
      uses: 290,
      rating: 4.6,
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      id: '21',
      name: 'Travel Guide Blog Post',
      description: 'Comprehensive travel guides with tips, attractions, and local insights',
      category: 'travel',
      type: 'blog',
      prompt: 'Write a travel guide for [DESTINATION] for [TRAVELER_TYPE]. Include: 1) Destination overview, 2) Best time to visit, 3) Top [NUMBER] attractions with details, 4) Local cuisine recommendations, 5) Transportation tips, 6) Budget estimates. Duration: [DURATION]. Interests: [INTERESTS].',
      inputs: [
        { name: 'DESTINATION', placeholder: 'City, country, region?', type: 'text' },
        { name: 'TRAVELER_TYPE', placeholder: 'Backpacker, luxury, family?', type: 'text' },
        { name: 'NUMBER', placeholder: 'Number of attractions', type: 'number' },
        { name: 'DURATION', placeholder: 'Trip length', type: 'text' },
        { name: 'INTERESTS', placeholder: 'History, food, adventure?', type: 'text' }
      ],
      estimatedTime: '10 min',
      difficulty: 'intermediate',
      uses: 620,
      rating: 4.9,
      icon: <Target className="h-5 w-5" />
    },
    {
      id: '22',
      name: 'Product Launch Campaign',
      description: 'Complete multi-channel campaign for product launches',
      category: 'marketing',
      type: 'campaign',
      prompt: 'Create a product launch campaign for [PRODUCT] targeting [AUDIENCE]. Include: 1) Campaign timeline, 2) Key messaging, 3) Email sequence, 4) Social media content, 5) Landing page copy, 6) Press release. Launch date: [DATE]. Budget: [BUDGET]. Channels: [CHANNELS].',
      inputs: [
        { name: 'PRODUCT', placeholder: 'Product name', type: 'text' },
        { name: 'AUDIENCE', placeholder: 'Target customers', type: 'text' },
        { name: 'DATE', placeholder: 'Launch date', type: 'text' },
        { name: 'BUDGET', placeholder: 'Campaign budget', type: 'text' },
        { name: 'CHANNELS', placeholder: 'Email, social, ads, PR?', type: 'text' }
      ],
      estimatedTime: '20 min',
      difficulty: 'advanced',
      uses: 410,
      rating: 4.8,
      icon: <Zap className="h-5 w-5" />
    }
  ]

  const categories = [
    { id: 'all', name: 'All Templates', icon: <Grid3X3 className="h-4 w-4" /> },
    { id: 'email', name: 'Email', icon: <Mail className="h-4 w-4" /> },
    { id: 'blog', name: 'Blog', icon: <FileText className="h-4 w-4" /> },
    { id: 'social', name: 'Social Media', icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'ecommerce', name: 'E-commerce', icon: <ShoppingBag className="h-4 w-4" /> },
    { id: 'business', name: 'Business', icon: <Briefcase className="h-4 w-4" /> },
    { id: 'education', name: 'Education', icon: <GraduationCap className="h-4 w-4" /> },
    { id: 'health', name: 'Health', icon: <Heart className="h-4 w-4" /> },
    { id: 'video', name: 'Video', icon: <Zap className="h-4 w-4" /> },
    { id: 'audio', name: 'Audio', icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'technical', name: 'Technical', icon: <FileText className="h-4 w-4" /> },
    { id: 'food', name: 'Food', icon: <Heart className="h-4 w-4" /> },
    { id: 'finance', name: 'Finance', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'travel', name: 'Travel', icon: <Target className="h-4 w-4" /> },
    { id: 'marketing', name: 'Marketing', icon: <Tag className="h-4 w-4" /> }
  ]

  const types = [
    { id: 'all', name: 'All Types' },
    { id: 'email', name: 'Email' },
    { id: 'blog', name: 'Blog Post' },
    { id: 'social', name: 'Social Media' },
    { id: 'ad', name: 'Advertisement' },
    { id: 'article', name: 'Article' },
    { id: 'script', name: 'Script' },
    { id: 'campaign', name: 'Campaign' }
  ]

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (!user) {
        router.push('/login')
        return
      }
      
      setLoading(false)
    }

    getUser()
  }, [router])

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    const matchesType = selectedType === 'all' || template.type === selectedType
    
    return matchesSearch && matchesCategory && matchesType
  })

  const toggleFavorite = (templateId: string) => {
    setFavorites(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    )
  }

  const useTemplate = (template: Template) => {
    // Clean template data for URL transmission (remove circular references)
    const cleanTemplate = {
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      type: template.type,
      prompt: template.prompt,
      inputs: template.inputs
    }
    
    // Navigate to writer page with template data
    const templateData = encodeURIComponent(JSON.stringify(cleanTemplate))
    router.push(`/writer?template=${templateData}`)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700'
      case 'intermediate': return 'bg-yellow-100 text-yellow-700'
      case 'advanced': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Beginner'
      case 'intermediate': return 'Intermediate'
      case 'advanced': return 'Advanced'
      default: return difficulty
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
            Loading templates...
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
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h1 
                  className="text-2xl font-bold transition-colors duration-300"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                >
                  Templates
                </h1>
              </div>
              
              <div className="flex items-center space-x-3">
                <ThemeToggle />
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="p-2 rounded-md transition-colors duration-300"
                  style={{ color: theme === 'dark' ? '#d1d5db' : '#4b5563' }}
                >
                  {viewMode === 'grid' ? <List className="h-5 w-5" /> : <Grid3X3 className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div 
          className="border-b transition-colors duration-300"
          style={{
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-300" 
                  style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }} 
                />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                  style={{
                    backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                    borderColor: theme === 'dark' ? '#4b5563' : '#9ca3af',
                    color: theme === 'dark' ? '#f9fafb' : '#111827'
                  }}
                />
              </div>
              
              {/* Category Filter */}
              <div className="flex items-center space-x-2">
                <Filter 
                  className="h-4 w-4 transition-colors duration-300" 
                  style={{ color: theme === 'dark' ? '#6b7280' : '#6b7280' }} 
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                  style={{
                    backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                    borderColor: theme === 'dark' ? '#4b5563' : '#9ca3af',
                    color: theme === 'dark' ? '#f9fafb' : '#111827'
                  }}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              
              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                style={{
                  backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                  borderColor: theme === 'dark' ? '#4b5563' : '#9ca3af',
                  color: theme === 'dark' ? '#f9fafb' : '#111827'
                }}
              >
                {types.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Templates Grid/List */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300"
                style={{ backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6' }}
              >
                <Search 
                  className="h-8 w-8 transition-colors duration-300" 
                  style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }} 
                />
              </div>
              <h3 
                className="text-lg font-medium mb-2 transition-colors duration-300"
                style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
              >
                No templates found
              </h3>
              <p 
                className="transition-colors duration-300"
                style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
              >
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredTemplates.map((template) => (
                <div 
                  key={template.id} 
                  className="rounded-lg shadow-sm border hover:shadow-md transition-shadow transition-colors duration-300"
                  style={{
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
                  }}
                >
                  {viewMode === 'grid' ? (
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-300"
                            style={{ backgroundColor: theme === 'dark' ? '#1e3a8a' : '#dbeafe' }}
                          >
                            <div style={{ color: theme === 'dark' ? '#93c5fd' : '#2563eb' }}>
                              {template.icon}
                            </div>
                          </div>
                          <div>
                            <h3 
                              className="font-semibold transition-colors duration-300"
                              style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                            >
                              {template.name}
                            </h3>
                            <p 
                              className="text-sm transition-colors duration-300"
                              style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                            >
                              {template.category}
                            </p>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => toggleFavorite(template.id)}
                          className="p-1 rounded-md transition-colors duration-300"
                          style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }}
                        >
                          <Star className={`h-4 w-4 ${favorites.includes(template.id) ? 'fill-current text-yellow-500' : ''}`} />
                        </button>
                      </div>
                      
                      <p 
                        className="text-sm mb-4 line-clamp-2 transition-colors duration-300"
                        style={{ color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
                      >
                        {template.description}
                      </p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4 text-xs">
                          <div className="flex items-center space-x-1">
                            <Clock 
                              className="h-3 w-3 transition-colors duration-300" 
                              style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }} 
                            />
                            <span 
                              className="transition-colors duration-300"
                              style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                            >
                              {template.estimatedTime}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Zap 
                              className="h-3 w-3 transition-colors duration-300" 
                              style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }} 
                            />
                            <span 
                              className="transition-colors duration-300"
                              style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                            >
                              {template.uses}
                            </span>
                          </div>
                        </div>
                        
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(template.difficulty)}`}>
                          {getDifficultyLabel(template.difficulty)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < Math.floor(template.rating) ? 'fill-current' : 'fill-gray-300'}`} />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 ml-1">{template.rating}</span>
                        </div>
                        
                        <button
                          onClick={() => useTemplate(template)}
                          className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                        >
                          <span>Use</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                            {template.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{template.name}</h3>
                            <p className="text-gray-600 text-sm">{template.description}</p>
                            
                            <div className="flex items-center space-x-4 mt-2">
                              <div className="flex items-center space-x-1 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />
                                <span>{template.estimatedTime}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-xs text-gray-500">
                                <Zap className="h-3 w-3" />
                                <span>{template.uses} uses</span>
                              </div>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(template.difficulty)}`}>
                                {getDifficultyLabel(template.difficulty)}
                              </span>
                              <div className="flex items-center space-x-1">
                                <div className="flex text-yellow-400">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`h-3 w-3 ${i < Math.floor(template.rating) ? 'fill-current' : 'fill-gray-300'}`} />
                                  ))}
                                </div>
                                <span className="text-xs text-gray-500 ml-1">{template.rating}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleFavorite(template.id)}
                            className="p-2 text-gray-400 hover:text-yellow-500 rounded-md"
                          >
                            <Star className={`h-5 w-5 ${favorites.includes(template.id) ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                          </button>
                          
                          <button
                            onClick={() => useTemplate(template)}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            <span>Use Template</span>
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Template Modal */}
      {showTemplateModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-3xl w-full my-8">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    {selectedTemplate.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedTemplate.name}</h2>
                    <p className="text-gray-600">{selectedTemplate.description}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-md"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Template Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Category:</span>
                    <span className="ml-2 text-gray-900 capitalize">{selectedTemplate.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <span className="ml-2 text-gray-900 capitalize">{selectedTemplate.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Difficulty:</span>
                    <span className="ml-2 text-gray-900">{getDifficultyLabel(selectedTemplate.difficulty)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Estimated Time:</span>
                    <span className="ml-2 text-gray-900">{selectedTemplate.estimatedTime}</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Required Inputs</h3>
                <div className="space-y-3">
                  {selectedTemplate.inputs.map((input, index) => (
                    <div key={index}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {input.name}
                      </label>
                      {input.type === 'select' ? (
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          <option value="">Select an option</option>
                          <option value="formal">Formal</option>
                          <option value="casual">Casual</option>
                          <option value="friendly">Friendly</option>
                          <option value="professional">Professional</option>
                        </select>
                      ) : (
                        <input
                          type={input.type}
                          placeholder={input.placeholder}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Template Prompt</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                    {selectedTemplate.prompt}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This is the AI prompt that will be used to generate your content. The [BRACKETS] will be replaced with your inputs.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    useTemplate(selectedTemplate)
                    setShowTemplateModal(false)
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Zap className="h-4 w-4" />
                  <span>Use This Template</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
