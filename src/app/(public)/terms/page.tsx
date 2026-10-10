export const metadata = {
  title: 'Terms of Service — THE SHIVA',
  description: 'Terms of service for THE SHIVA online education platform.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen relative py-24 px-6 overflow-hidden">
      <div className="shiva-liquid-section absolute inset-0" aria-hidden="true" />

      <div className="max-w-4xl mx-auto relative z-10 space-y-12">
        <div className="text-center space-y-4">
          <span className="shiva-capsule shiva-capsule-gold">Legal</span>
          <h1 className="text-shiva-section text-white">Terms of Service</h1>
          <p className="text-slate-400 text-sm">Last updated: September 2, 2026</p>
        </div>

        <div className="shiva-glass rounded-3xl p-12 space-y-8 text-slate-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using THE SHIVA platform, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">2. User Accounts</h2>
            <p className="mb-3">When you create an account, you agree to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your password and account</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized access</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">3. User Roles and Access</h2>
            <p className="mb-3">
              THE SHIVA operates with strict role-based access control:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong className="text-white">Students:</strong> Access enrolled courses, lectures, tests, and doubt resolution</li>
              <li><strong className="text-white">Teachers:</strong> Assigned by administrators to create and manage course content</li>
              <li><strong className="text-white">Administrators:</strong> Manage platform operations, user provisioning, and course assignments</li>
            </ul>
            <p className="mt-3">
              Attempting to access resources outside your assigned role is prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">4. Acceptable Use</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Share your account credentials with others</li>
              <li>Reproduce, distribute, or publicly display platform content without authorization</li>
              <li>Use automated tools to scrape or harvest platform data</li>
              <li>Interfere with or disrupt platform security or functionality</li>
              <li>Submit false or misleading information</li>
              <li>Harass, abuse, or harm other users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">5. Intellectual Property</h2>
            <p>
              All course content, lectures, tests, and platform materials are owned by THE SHIVA or our content partners. You are granted a limited, non-transferable license to access content for personal educational use only.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">6. Payment and Subscriptions</h2>
            <p>
              Course enrollment and subscription fees, if applicable, are non-refundable except as required by law. We reserve the right to modify pricing with advance notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">7. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account for violations of these Terms, fraudulent activity, or any behavior that harms the platform or other users.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">8. Disclaimers</h2>
            <p>
              THE SHIVA provides educational content &quot;as is&quot; without warranties of any kind. While we strive for accuracy, we do not guarantee specific exam results or outcomes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, THE SHIVA shall not be liable for indirect, incidental, or consequential damages arising from your use of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">10. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. Continued use of the platform after changes constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">11. Governing Law</h2>
            <p>
              These Terms are governed by the laws of India. Any disputes shall be resolved in the courts of [jurisdiction].
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">12. Contact</h2>
            <p>
              For questions about these Terms, please visit our{' '}
              <a href="/contact" className="text-[#c8a96e] hover:underline">Contact page</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
