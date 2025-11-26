import { Twitter, Linkedin, Github, Mail, Heart } from 'lucide-react'

const socialLinks = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Mail, href: '#', label: 'Email' }
]

const footerLinks = [
  {
    title: 'Product',
    links: [
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '#' },
      { name: 'Documentation', href: '#' },
      { name: 'API Reference', href: '#' }
    ]
  },
  {
    title: 'Company',
    links: [
      { name: 'About', href: '#about' },
      { name: 'Blog', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'Press', href: '#' }
    ]
  },
  {
    title: 'Resources',
    links: [
      { name: 'Help Center', href: '#' },
      { name: 'Community', href: '#' },
      { name: 'Guides', href: '#' },
      { name: 'Partners', href: '#' }
    ]
  },
  {
    title: 'Legal',
    links: [
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Cookie Policy', href: '#' },
      { name: 'Security', href: '#' }
    ]
  }
]

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-8">
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
              TechFlow
            </h3>
            <p className="text-gray-400 leading-relaxed mb-6">
              Building the future of digital experiences. Join thousands of companies already using our platform to grow their business.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="flex items-center justify-center w-10 h-10 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
          
          {footerLinks.map((section, index) => (
            <div key={index}>
              <h4 className="font-semibold text-white mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 TechFlow. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm flex items-center">
              Made with <Heart className="h-4 w-4 mx-1 text-red-500 fill-current" /> by the TechFlow team
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
