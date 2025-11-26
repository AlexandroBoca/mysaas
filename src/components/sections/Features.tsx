import { Zap, Shield, Globe, Smartphone, BarChart, Users } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized performance that delivers exceptional speed and responsiveness for your users.'
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    description: 'Enterprise-grade security with 99.9% uptime guarantee to keep your data safe and accessible.'
  },
  {
    icon: Globe,
    title: 'Global Scale',
    description: 'Deploy worldwide with our CDN and infrastructure that scales with your business needs.'
  },
  {
    icon: Smartphone,
    title: 'Mobile First',
    description: 'Responsive design that works perfectly on all devices, from phones to desktops.'
  },
  {
    icon: BarChart,
    title: 'Analytics & Insights',
    description: 'Comprehensive analytics to track performance and make data-driven decisions.'
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Work together seamlessly with real-time collaboration tools and permissions.'
  }
]

export default function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Powerful Features for
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {' '}Modern Teams
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to build, deploy, and scale your digital products in one comprehensive platform.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white p-8 rounded-2xl border border-gray-200 hover:border-blue-200 hover:shadow-xl transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
