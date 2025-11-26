import { Award, Target, Heart } from 'lucide-react'

const stats = [
  { icon: Award, label: 'Years of Experience', value: '10+' },
  { icon: Target, label: 'Projects Completed', value: '500+' },
  { icon: Heart, label: 'Happy Clients', value: '10,000+' }
]

export default function About() {
  return (
    <section id="about" className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                We Build
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {' '}Digital Solutions
                </span>
                {' '}That Matter
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                With over a decade of experience in the digital space, we've helped thousands of businesses 
                transform their ideas into successful online presences. Our team of experts combines creativity 
                with technical excellence to deliver solutions that drive real results.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Innovation-Driven</h4>
                  <p className="text-gray-600">We stay ahead of the curve with cutting-edge technologies and modern best practices.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Customer-Centric</h4>
                  <p className="text-gray-600">Your success is our priority. We work closely with you to understand your unique needs.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Quality Assured</h4>
                  <p className="text-gray-600">Every project undergoes rigorous testing to ensure flawless performance and user experience.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl transform -rotate-6 opacity-10"></div>
            <div className="relative bg-white rounded-3xl shadow-xl p-8">
              <div className="grid grid-cols-1 gap-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl mb-4">
                      <stat.icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
