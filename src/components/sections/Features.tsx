import { Zap, FileText, Users, BarChart, Settings, CreditCard, Shield, Globe, Brain, Sparkles } from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Generation',
    description: 'Advanced artificial intelligence algorithms that create high-quality, context-aware content tailored to your specific needs and audience.'
  },
  {
    icon: FileText,
    title: 'Multiple Content Types',
    description: 'Generate blog posts, marketing copy, technical documentation, creative writing, social media content, and more with specialized templates.'
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Work together with your team through shared projects, real-time editing, collaborative workflows, and role-based permissions.'
  },
  {
    icon: BarChart,
    title: 'Analytics & Insights',
    description: 'Track content performance, engagement metrics, generation statistics, and get actionable insights to optimize your content strategy.'
  },
  {
    icon: Settings,
    title: 'Custom Templates',
    description: 'Create and save custom templates, set up brand-specific guidelines, and maintain consistency across all your content generation.'
  },
  {
    icon: CreditCard,
    title: 'Flexible Pricing Plans',
    description: 'Choose from Individual plans for personal use or Enterprise solutions for teams, with scalable credits and advanced features.'
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Enterprise-grade security with data encryption, secure authentication, and privacy protection for all your content and information.'
  },
  {
    icon: Globe,
    title: 'Multi-Language Support',
    description: 'Generate content in multiple languages, adapt to different cultural contexts, and reach global audiences with localized content.'
  },
  {
    icon: Sparkles,
    title: 'Smart Suggestions',
    description: 'Get intelligent content suggestions, tone adjustments, SEO recommendations, and real-time improvements as you create.'
  }
]

export default function Features() {
  return (
    <section id="features" className="py-20 transition-colors duration-300" style={{ backgroundColor: 'var(--bg-primary, #ffffff)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 transition-colors duration-300" style={{ color: 'var(--text-primary, #111827)' }}>
            Comprehensive Features for
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {' '}Content Excellence
            </span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto transition-colors duration-300" style={{ color: 'var(--text-secondary, #6b7280)' }}>
            Everything you need to create, manage, and optimize high-quality content with the power of artificial intelligence.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-8 rounded-2xl border transition-all duration-300 hover:scale-105 hover:shadow-xl"
              style={{
                backgroundColor: 'var(--card-bg, #ffffff)',
                borderColor: 'var(--border-color, #e5e7eb)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-hover, #3b82f6)'
                e.currentTarget.style.backgroundColor = 'var(--card-hover, #f8fafc)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color, #e5e7eb)'
                e.currentTarget.style.backgroundColor = 'var(--card-bg, #ffffff)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mb-4 transform transition-transform duration-300 group-hover:scale-110">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold mb-3 transition-colors duration-300" style={{ color: 'var(--text-primary, #111827)' }}>
                  {feature.title}
                </h3>
                
                <p className="leading-relaxed transition-colors duration-300" style={{ color: 'var(--text-secondary, #6b7280)' }}>
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-8 p-6 rounded-2xl border transition-colors duration-300" style={{ borderColor: 'var(--border-color, #e5e7eb)', backgroundColor: 'var(--card-bg, #ffffff)' }}>
            <div className="text-left">
              <div className="text-3xl font-bold mb-2 transition-colors duration-300" style={{ color: 'var(--text-primary, #111827)' }}>
                50+ Content Templates
              </div>
              <div className="text-sm transition-colors duration-300" style={{ color: 'var(--text-secondary, #6b7280)' }}>
                Ready-to-use templates for every need
              </div>
            </div>
            <div className="text-left">
              <div className="text-3xl font-bold mb-2 transition-colors duration-300" style={{ color: 'var(--text-primary, #111827)' }}>
                25+ Languages
              </div>
              <div className="text-sm transition-colors duration-300" style={{ color: 'var(--text-secondary, #6b7280)' }}>
                Multi-language content generation
              </div>
            </div>
            <div className="text-left">
              <div className="text-3xl font-bold mb-2 transition-colors duration-300" style={{ color: 'var(--text-primary, #111827)' }}>
                99.9% Uptime
              </div>
              <div className="text-sm transition-colors duration-300" style={{ color: 'var(--text-secondary, #6b7280)' }}>
                Reliable platform performance
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
