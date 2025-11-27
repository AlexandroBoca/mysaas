'use client'

import React from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import ThemeToggle from '@/components/ui/ThemeToggle'
import Link from 'next/link'

export default function PrivacyPage() {
  const { theme } = useTheme()

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme === 'dark' ? '#111827' : '#ffffff' }}>
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
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TechFlow
              </Link>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Privacy Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h2 
              className="text-3xl font-bold mb-4 transition-colors duration-300"
              style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
            >
              Privacy Policy
            </h2>
            <p 
              className="text-lg transition-colors duration-300"
              style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
            >
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-8">
            <section>
              <h3 
                className="text-xl font-semibold mb-4 transition-colors duration-300"
                style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
              >
                1. Information We Collect
              </h3>
              <div className="space-y-4" style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>
                <p>
                  We collect information you provide directly to us, such as when you create an account, 
                  use our content generation services, or contact us for support.
                </p>
                <div className="pl-6 space-y-2">
                  <p><strong>Account Information:</strong> Name, email address, and password</p>
                  <p><strong>Content Data:</strong> Content you generate and store on our platform</p>
                  <p><strong>Usage Data:</strong> How you interact with our services and features</p>
                  <p><strong>Payment Information:</strong> Billing details for subscription services</p>
                </div>
              </div>
            </section>

            <section>
              <h3 
                className="text-xl font-semibold mb-4 transition-colors duration-300"
                style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
              >
                2. How We Use Your Information
              </h3>
              <div className="space-y-4" style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>
                <p>We use the information we collect to provide, maintain, and improve our services:</p>
                <div className="pl-6 space-y-2">
                  <p>• To provide and maintain our AI content generation services</p>
                  <p>• To process transactions and manage your subscription</p>
                  <p>• To communicate with you about your account and services</p>
                  <p>• To improve our AI models and service quality</p>
                  <p>• To detect and prevent fraud or abuse</p>
                </div>
              </div>
            </section>

            <section>
              <h3 
                className="text-xl font-semibold mb-4 transition-colors duration-300"
                style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
              >
                3. Data Security
              </h3>
              <div className="space-y-4" style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>
                <p>
                  We implement appropriate technical and organizational measures to protect your data:
                </p>
                <div className="pl-6 space-y-2">
                  <p>• Encryption of data in transit and at rest</p>
                  <p>• Regular security audits and assessments</p>
                  <p>• Access controls and authentication systems</p>
                  <p>• Secure data storage and processing practices</p>
                </div>
              </div>
            </section>

            <section>
              <h3 
                className="text-xl font-semibold mb-4 transition-colors duration-300"
                style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
              >
                4. Content Privacy
              </h3>
              <div className="space-y-4" style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>
                <p>
                  Your generated content is private and secure:
                </p>
                <div className="pl-6 space-y-2">
                  <p>• Your content is not shared with other users</p>
                  <p>• We do not claim ownership of your generated content</p>
                  <p>• Content is used only to improve our AI services with your consent</p>
                  <p>• You maintain full rights to your created content</p>
                </div>
              </div>
            </section>

            <section>
              <h3 
                className="text-xl font-semibold mb-4 transition-colors duration-300"
                style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
              >
                5. Third-Party Services
              </h3>
              <div className="space-y-4" style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>
                <p>
                  We may use third-party services to operate our business:
                </p>
                <div className="pl-6 space-y-2">
                  <p>• Payment processors for subscription management</p>
                  <p>• Analytics services to improve our platform</p>
                  <p>• Cloud infrastructure providers for data storage</p>
                  <p>• Email services for user communications</p>
                </div>
              </div>
            </section>

            <section>
              <h3 
                className="text-xl font-semibold mb-4 transition-colors duration-300"
                style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
              >
                6. Your Rights
              </h3>
              <div className="space-y-4" style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>
                <p>
                  You have the following rights regarding your data:
                </p>
                <div className="pl-6 space-y-2">
                  <p>• Access to your personal information</p>
                  <p>• Correction of inaccurate data</p>
                  <p>• Deletion of your account and data</p>
                  <p>• Export of your data in a portable format</p>
                  <p>• Opt-out of marketing communications</p>
                </div>
              </div>
            </section>

            <section>
              <h3 
                className="text-xl font-semibold mb-4 transition-colors duration-300"
                style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
              >
                7. Contact Us
              </h3>
              <div className="space-y-4" style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>
                <p>
                  If you have questions about this Privacy Policy, please contact us:
                </p>
                <div className="pl-6 space-y-2">
                  <p><strong>Email:</strong> privacy@techflow.com</p>
                  <p><strong>Support:</strong> support@techflow.com</p>
                  <p><strong>Website:</strong> www.techflow.com</p>
                </div>
              </div>
            </section>
          </div>

          {/* Footer Note */}
          <div 
            className="mt-12 p-6 rounded-lg border transition-colors duration-300"
            style={{
              borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
              backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb'
            }}
          >
            <p className="text-sm" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
              This Privacy Policy is designed to be transparent and easy to understand. We are committed to protecting 
              your privacy and ensuring the security of your data. By using our services, you agree to the collection 
              and use of information in accordance with this policy.
            </p>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-12">
            <Link 
              href="/"
              className="inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-300"
              style={{
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                color: theme === 'dark' ? '#f9fafb' : '#111827',
                border: '1px solid'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#f3f4f6'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1f2937' : '#ffffff'
              }}
            >
              ← Back to Home
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center" style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
          <p 
            className="text-sm transition-colors duration-300"
            style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
          >
            This service is operated by Alexandro Boca
          </p>
        </div>
      </main>
    </div>
  )
}
