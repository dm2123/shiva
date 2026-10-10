export const metadata = {
  title: 'Privacy Policy — THE SHIVA',
  description: 'Privacy policy for THE SHIVA online education platform.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen relative py-24 px-6 overflow-hidden">
      <div className="shiva-liquid-section absolute inset-0" aria-hidden="true" />

      <div className="max-w-4xl mx-auto relative z-10 space-y-12">
        <div className="text-center space-y-4">
          <span className="shiva-capsule shiva-capsule-gold">Legal</span>
          <h1 className="text-shiva-section text-white">Privacy Policy</h1>
          <p className="text-slate-400 text-sm">Last updated: September 2, 2026</p>
        </div>

        <div className="shiva-glass rounded-3xl p-12 space-y-8 text-slate-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">1. Introduction</h2>
            <p>
              THE SHIVA (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our online education platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">2. Information We Collect</h2>
            <p className="mb-3">We collect information that you provide directly to us, including:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Account information (name, email, password)</li>
              <li>Profile information (educational background, target exams)</li>
              <li>Learning activity data (course progress, test scores, lecture views)</li>
              <li>Communication data (doubt questions, feedback, support inquiries)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">3. How We Use Your Information</h2>
            <p className="mb-3">We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide, maintain, and improve our educational services</li>
              <li>Track your learning progress and performance analytics</li>
              <li>Facilitate communication between students and teachers</li>
              <li>Send important platform updates and educational content</li>
              <li>Ensure platform security and prevent fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">4. Data Sharing and Disclosure</h2>
            <p className="mb-3">
              We maintain strict role-based access control (RBAC). Your data is only shared with:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Teachers assigned to your enrolled courses (for educational purposes)</li>
              <li>Platform administrators (for account management and support)</li>
              <li>Service providers who assist in platform operations (under strict confidentiality)</li>
            </ul>
            <p className="mt-3">
              We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">5. Data Security</h2>
            <p>
              We implement industry-standard security measures including encryption, secure authentication, and regular security audits to protect your information. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">6. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Access and review your personal information</li>
              <li>Request corrections to inaccurate data</li>
              <li>Request deletion of your account and associated data</li>
              <li>Opt-out of non-essential communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">7. Children&apos;s Privacy</h2>
            <p>
              Our platform is designed for students of various ages preparing for competitive exams. For users under 18, we recommend parental supervision and consent before registration.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes via email or platform notification.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">9. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us through the{' '}
              <a href="/contact" className="text-[#c8a96e] hover:underline">Contact page</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
