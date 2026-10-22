import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service — THE SHIVA',
  description: 'Terms of service for THE SHIVA online education platform.',
};

/**
 * MARKETING-A — SIRF presentation/readability polish.
 * Legal text ka content ek shabd bhi nahi badla gaya hai;
 * sirf typography, spacing aur heading style naye landing
 * system ke hisaab se saaf kiya gaya hai.
 */

const prose: React.CSSProperties = { fontSize: 15, lineHeight: 1.75, color: '#374151' };
const heading: React.CSSProperties = {
  fontSize: 19,
  fontWeight: 800,
  color: 'var(--ink)',
  marginBottom: 10,
  paddingBottom: 8,
  borderBottom: '2px solid var(--line)',
};
const list: React.CSSProperties = {
  ...prose,
  listStyle: 'disc',
  paddingLeft: 22,
  display: 'grid',
  gap: 6,
  marginTop: 8,
};

export default function TermsPage() {
  return (
    <>
      <section style={{ paddingBottom: 24 }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="kicker">Legal</span>
            <h2>Terms of Service</h2>
            <p>Last updated: September 2, 2026</p>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap" style={{ maxWidth: 860 }}>
          <div
            style={{
              background: '#fff',
              border: '2px solid var(--line)',
              borderRadius: 24,
              padding: '40px 36px',
              display: 'grid',
              gap: 34,
            }}
          >
            <section>
              <h2 style={heading}>1. Acceptance of Terms</h2>
              <p style={prose}>
                By accessing and using THE SHIVA platform, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
              </p>
            </section>

            <section>
              <h2 style={heading}>2. User Accounts</h2>
              <p style={prose}>When you create an account, you agree to:</p>
              <ul style={list}>
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized access</li>
              </ul>
            </section>

            <section>
              <h2 style={heading}>3. User Roles and Access</h2>
              <p style={prose}>
                THE SHIVA operates with strict role-based access control:
              </p>
              <ul style={list}>
                <li><strong style={{ color: 'var(--ink)' }}>Students:</strong> Access enrolled courses, lectures, tests, and doubt resolution</li>
                <li><strong style={{ color: 'var(--ink)' }}>Teachers:</strong> Assigned by administrators to create and manage course content</li>
                <li><strong style={{ color: 'var(--ink)' }}>Administrators:</strong> Manage platform operations, user provisioning, and course assignments</li>
              </ul>
              <p style={{ ...prose, marginTop: 10 }}>
                Attempting to access resources outside your assigned role is prohibited.
              </p>
            </section>

            <section>
              <h2 style={heading}>4. Acceptable Use</h2>
              <p style={prose}>You agree not to:</p>
              <ul style={list}>
                <li>Share your account credentials with others</li>
                <li>Reproduce, distribute, or publicly display platform content without authorization</li>
                <li>Use automated tools to scrape or harvest platform data</li>
                <li>Interfere with or disrupt platform security or functionality</li>
                <li>Submit false or misleading information</li>
                <li>Harass, abuse, or harm other users</li>
              </ul>
            </section>

            <section>
              <h2 style={heading}>5. Intellectual Property</h2>
              <p style={prose}>
                All course content, lectures, tests, and platform materials are owned by THE SHIVA or our content partners. You are granted a limited, non-transferable license to access content for personal educational use only.
              </p>
            </section>

            <section>
              <h2 style={heading}>6. Payment and Subscriptions</h2>
              <p style={prose}>
                Course enrollment and subscription fees, if applicable, are non-refundable except as required by law. We reserve the right to modify pricing with advance notice.
              </p>
            </section>

            <section>
              <h2 style={heading}>7. Termination</h2>
              <p style={prose}>
                We reserve the right to suspend or terminate your account for violations of these Terms, fraudulent activity, or any behavior that harms the platform or other users.
              </p>
            </section>

            <section>
              <h2 style={heading}>8. Disclaimers</h2>
              <p style={prose}>
                THE SHIVA provides educational content &quot;as is&quot; without warranties of any kind. While we strive for accuracy, we do not guarantee specific exam results or outcomes.
              </p>
            </section>

            <section>
              <h2 style={heading}>9. Limitation of Liability</h2>
              <p style={prose}>
                To the maximum extent permitted by law, THE SHIVA shall not be liable for indirect, incidental, or consequential damages arising from your use of the platform.
              </p>
            </section>

            <section>
              <h2 style={heading}>10. Changes to Terms</h2>
              <p style={prose}>
                We may update these Terms from time to time. Continued use of the platform after changes constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 style={heading}>11. Governing Law</h2>
              <p style={prose}>
                These Terms are governed by the laws of India. Any disputes shall be resolved in the courts of [jurisdiction].
              </p>
            </section>

            <section>
              <h2 style={heading}>12. Contact</h2>
              <p style={prose}>
                For questions about these Terms, please visit our{' '}
                <Link href="/contact" style={{ color: '#6d28d9', fontWeight: 700, textDecoration: 'underline' }}>
                  Contact page
                </Link>
                .
              </p>
            </section>
          </div>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)', marginTop: 24 }}>
            <Link href="/privacy" style={{ color: '#6d28d9', fontWeight: 700 }}>
              Privacy Policy →
            </Link>
            {'  ·  '}
            <Link href="/register" style={{ color: '#6d28d9', fontWeight: 700 }}>
              Register on THE SHIVA →
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
