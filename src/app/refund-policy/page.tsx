'use client'

import React from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import ThemeToggle from '@/components/ui/ThemeToggle'
import Link from 'next/link'
import { ArrowLeft, Shield, Clock, CheckCircle, AlertCircle, Mail } from 'lucide-react'

export default function RefundPolicy() {
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

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div 
          className="rounded-2xl shadow-lg transition-colors duration-300"
          style={{
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`
          }}
        >
          <div className="p-8">
            {/* Header */}
            <div className="mb-8">
              <Link 
                href="/"
                className="inline-flex items-center text-sm font-medium mb-6 transition-colors duration-300 rounded-lg px-4 py-2"
                style={{
                  backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
                  color: theme === 'dark' ? '#f9fafb' : '#111827'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme === 'dark' ? '#4b5563' : '#e5e7eb'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#f3f4f6'
                }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
              
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h1 
                  className="text-3xl font-bold transition-colors duration-300"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                >
                  Refund Policy
                </h1>
              </div>
              
              <p 
                className="text-lg transition-colors duration-300"
                style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
              >
                Our commitment to customer satisfaction and fair refund practices in compliance with payment processor's buyer protection terms.
              </p>
            </div>

            {/* Policy Content */}
            <div className="space-y-8">
              {/* 14-Day Guarantee */}
              <div 
                className="rounded-xl p-6 transition-colors duration-300"
                style={{
                  backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                  border: `1px solid ${theme === 'dark' ? '#4b5563' : '#e5e7eb'}`
                }}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 
                      className="text-xl font-semibold mb-3 transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      14-Day Money-Back Guarantee
                    </h3>
                    <p 
                      className="mb-3 transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                    >
                      We offer a minimum 14-day refund period for all subscription plans, in full compliance with payment processor's buyer protection terms. If you're not satisfied with TechFlow within the first 14 days of your purchase, you're eligible for a full refund.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <Clock className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: theme === 'dark' ? '#10b981' : '#059669' }} />
                        <span 
                          className="text-sm transition-colors duration-300"
                          style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                        >
                          Refund requests must be submitted within 14 days of the initial purchase
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: theme === 'dark' ? '#10b981' : '#059669' }} />
                        <span 
                          className="text-sm transition-colors duration-300"
                          style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                        >
                          Full refund of the initial subscription payment
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Eligibility Criteria */}
              <div>
                <h3 
                  className="text-xl font-semibold mb-4 transition-colors duration-300"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                >
                  Refund Eligibility Criteria
                </h3>
                <div className="space-y-4">
                  <div 
                    className="rounded-lg p-4 transition-colors duration-300"
                    style={{
                      backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                      border: `1px solid ${theme === 'dark' ? '#4b5563' : '#e5e7eb'}`
                    }}
                  >
                    <h4 
                      className="font-medium mb-2 transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      Valid Refund Reasons
                    </h4>
                    <ul className="space-y-2 text-sm" style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>
                      <li>• Technical issues preventing normal use of the service</li>
                      <li>• Service not performing as described or advertised</li>
                      <li>• Dissatisfaction with features or functionality</li>
                      <li>• Accidental purchase or wrong subscription tier</li>
                      <li>• Change in business needs or circumstances</li>
                    </ul>
                  </div>

                  <div 
                    className="rounded-lg p-4 transition-colors duration-300"
                    style={{
                      backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                      border: `1px solid ${theme === 'dark' ? '#4b5563' : '#e5e7eb'}`
                    }}
                  >
                    <h4 
                      className="font-medium mb-2 transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      Non-Refundable Cases
                    </h4>
                    <ul className="space-y-2 text-sm" style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>
                      <li>• Requests made after the 14-day period</li>
                      <li>• Excessive usage beyond reasonable trial limits</li>
                      <li>• Violation of our Terms of Service</li>
                      <li>• Requests for partial refunds of used periods</li>
                      <li>• Custom enterprise solutions or development work</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* How to Request */}
              <div>
                <h3 
                  className="text-xl font-semibold mb-4 transition-colors duration-300"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                >
                  How to Request a Refund
                </h3>
                <div 
                  className="rounded-lg p-6 transition-colors duration-300"
                  style={{
                    backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                    border: `1px solid ${theme === 'dark' ? '#4b5563' : '#e5e7eb'}`
                  }}
                >
                  <ol className="space-y-4">
                    <li className="flex items-start">
                      <div 
                        className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3 flex-shrink-0"
                      >
                        1
                      </div>
                      <div>
                        <h4 
                          className="font-medium mb-1 transition-colors duration-300"
                          style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                        >
                          Contact Support
                        </h4>
                        <p 
                          className="text-sm transition-colors duration-300"
                          style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                        >
                          Email us at <a href="mailto:support@techflow.com" className="text-blue-500 hover:text-blue-600 underline">support@techflow.com</a> with your refund request
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div 
                        className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3 flex-shrink-0"
                      >
                        2
                      </div>
                      <div>
                        <h4 
                          className="font-medium mb-1 transition-colors duration-300"
                          style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                        >
                          Provide Details
                        </h4>
                        <p 
                          className="text-sm transition-colors duration-300"
                          style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                        >
                          Include your account email, order ID, and reason for the refund request
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div 
                        className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3 flex-shrink-0"
                      >
                        3
                      </div>
                      <div>
                        <h4 
                          className="font-medium mb-1 transition-colors duration-300"
                          style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                        >
                          Review Process
                        </h4>
                        <p 
                          className="text-sm transition-colors duration-300"
                          style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                        >
                          Our team will review your request within 3-5 business days
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div 
                        className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3 flex-shrink-0"
                      >
                        4
                      </div>
                      <div>
                        <h4 
                          className="font-medium mb-1 transition-colors duration-300"
                          style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                        >
                          Refund Processing
                        </h4>
                        <p 
                          className="text-sm transition-colors duration-300"
                          style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                        >
                          Approved refunds are processed via payment processor within 5-10 business days
                        </p>
                      </div>
                    </li>
                  </ol>
                </div>
              </div>

              {/* payment processor Compliance */}
              <div 
                className="rounded-xl p-6 transition-colors duration-300"
                style={{
                  backgroundColor: theme === 'dark' ? '#1e40af' : '#dbeafe',
                  border: `1px solid ${theme === 'dark' ? '#3730a3' : '#3b82f6'}`
                }}
              >
                <div className="flex items-start space-x-4">
                  <AlertCircle className="h-6 w-6 mt-1 flex-shrink-0" style={{ color: theme === 'dark' ? '#93c5fd' : '#1e40af' }} />
                  <div>
                    <h3 
                      className="text-xl font-semibold mb-3 transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      payment processor Buyer Protection
                    </h3>
                    <p 
                      className="mb-3 transition-colors duration-300"
                      style={{ color: theme === 'dark' ? '#dbeafe' : '#1e3a8a' }}
                    >
                      As a payment processor-powered service, we comply with all payment processor buyer protection policies and consumer rights regulations. This ensures fair treatment for all customers and provides additional safeguards for your purchases.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: theme === 'dark' ? '#93c5fd' : '#1e40af' }} />
                        <span 
                          className="transition-colors duration-300"
                          style={{ color: theme === 'dark' ? '#dbeafe' : '#1e3a8a' }}
                        >
                          All transactions are processed securely through payment processor
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: theme === 'dark' ? '#93c5fd' : '#1e40af' }} />
                        <span 
                          className="transition-colors duration-300"
                          style={{ color: theme === 'dark' ? '#dbeafe' : '#1e3a8a' }}
                        >
                          Additional dispute resolution options available through payment processor
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: theme === 'dark' ? '#93c5fd' : '#1e40af' }} />
                        <span 
                          className="transition-colors duration-300"
                          style={{ color: theme === 'dark' ? '#dbeafe' : '#1e3a8a' }}
                        >
                          Compliance with EU consumer protection laws and regulations
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div 
                className="rounded-lg p-6 text-center transition-colors duration-300"
                style={{
                  backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                  border: `1px solid ${theme === 'dark' ? '#4b5563' : '#e5e7eb'}`
                }}
              >
                <Mail className="h-8 w-8 mx-auto mb-3" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }} />
                <h3 
                  className="text-lg font-semibold mb-2 transition-colors duration-300"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                >
                  Questions About Refunds?
                </h3>
                <p 
                  className="mb-4 transition-colors duration-300"
                  style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                >
                  Our support team is here to help with any refund-related questions or concerns.
                </p>
                <a
                  href="mailto:support@techflow.com"
                  className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                >
                  Contact Support
                  <Mail className="ml-2 h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t text-center" style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
              <p 
                className="text-sm transition-colors duration-300"
                style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
              >
                This service is operated by Alexandro Boca
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
