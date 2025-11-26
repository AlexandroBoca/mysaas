import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service & Privacy Policy',
  description: 'Read our Terms of Service and Privacy Policy',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Terms of Service & Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Terms of Service Section */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Terms of Service</h2>
              <div className="prose prose-slate dark:prose-invert max-w-none space-y-4">
                <h3 className="text-lg font-medium">1. Acceptance of Terms</h3>
                <p>
                  By accessing and using our service, you accept and agree to be bound by the terms and provision of this agreement.
                </p>

                <h3 className="text-lg font-medium">2. Use License</h3>
                <p>
                  Permission is granted to temporarily download one copy of the materials on our service for personal, non-commercial transitory viewing only.
                </p>

                <h3 className="text-lg font-medium">3. Disclaimer</h3>
                <p>
                  The materials on our service are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                </p>

                <h3 className="text-lg font-medium">4. Limitations</h3>
                <p>
                  In no event shall our company or our suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our service.
                </p>

                <h3 className="text-lg font-medium">5. Privacy Policy</h3>
                <p>
                  Your Privacy Policy is incorporated into this Agreement by reference. Please review our Privacy Policy, which also governs the site visit and informs users of our data collection practices.
                </p>

                <h3 className="text-lg font-medium">6. Revisions and Errata</h3>
                <p>
                  Materials appearing on our service could include technical, typographical, or photographic errors. We do not warrant that any of the materials on its site are accurate, complete, or current.
                </p>

                <h3 className="text-lg font-medium">7. Governing Law</h3>
                <p>
                  These terms and conditions are governed by and construed in accordance with the laws of your jurisdiction and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
                </p>
              </div>
            </section>

            {/* Privacy Policy Section */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Privacy Policy</h2>
              <div className="prose prose-slate dark:prose-invert max-w-none space-y-4">
                <h3 className="text-lg font-medium">1. Information We Collect</h3>
                <p>
                  We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.
                </p>

                <h3 className="text-lg font-medium">2. How We Use Your Information</h3>
                <p>
                  We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.
                </p>

                <h3 className="text-lg font-medium">3. Information Sharing</h3>
                <p>
                  We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.
                </p>

                <h3 className="text-lg font-medium">4. Data Security</h3>
                <p>
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                </p>

                <h3 className="text-lg font-medium">5. Your Rights</h3>
                <p>
                  You have the right to access, update, or delete your personal information. You may also opt out of certain communications from us.
                </p>

                <h3 className="text-lg font-medium">6. Cookies and Tracking</h3>
                <p>
                  We use cookies and similar tracking technologies to track activity on our service and hold certain information to improve your experience.
                </p>

                <h3 className="text-lg font-medium">7. Changes to This Policy</h3>
                <p>
                  We may update our privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p>
                  If you have any questions about these Terms of Service or Privacy Policy, please contact us:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>By email: privacy@yourcompany.com</li>
                  <li>By visiting this page on our website: [Your Website Contact Page]</li>
                  <li>By phone number: [Your Phone Number]</li>
                </ul>
              </div>
            </section>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
              <Link href="/signup" className="flex-1">
                <Button variant="outline" className="w-full">
                  Back to Sign Up
                </Button>
              </Link>
              <Link href="/login" className="flex-1">
                <Button variant="outline" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
