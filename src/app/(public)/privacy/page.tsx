import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — THE SHIVA',
  description: 'Privacy policy for THE SHIVA online education platform.',
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

export default function PrivacyPage() {
  return (
    <>
      <section style={{ paddingBottom: 24 }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="kicker">Legal</span>
            <h2>Privacy Policy</h2>
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
              <h2 style={heading}>1. Introduction</h2>
              <p style={prose}>
                THE SHIVA (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our online education platform.
              </p>
            </section>

            <section>
              <h2 style={heading}>2. Information We Collect</h2>
              <p style={prose}>We collect information that you provide directly to us, including:</p>
              <ul style={list}>
                <li>Account information (name, email, password)</li>
                <li>Profile information (educational background, target exams)</li>
                <li>Learning activity data (course progress, test scores, lecture views)</li>
                <li>Communication data (doubt questions, feedback, support inquiries)</li>
              </ul>
            </section>

            <section>
              <h2 style={heading}>3. How We Use Your Information</h2>
              <p style={prose}>We use the information we collect to:</p>
              <ul style={list}>
                <li>Provide, maintain, and improve our educational services</li>
                <li>Track your learning progress and performance analytics</li>
                <li>Facilitate communication between students and teachers</li>
                <li>Send important platform updates and educational content</li>
                <li>Ensure platform security and prevent fraud</li>
              </ul>
            </section>

            <section>
              <h2 style={heading}>4. Data Sharing and Disclosure</h2>
              <p style={prose}>
                We maintain strict role-based access control (RBAC). Your data is only shared with:
              </p>
              <ul style={list}>
                <li>Teachers assigned to your enrolled courses (for educational purposes)</li>
                <li>Platform administrators (for account management and support)</li>
                <li>Service providers who assist in platform operations (under strict confidentiality)</li>
              </ul>
              <p style={{ ...prose, marginTop: 10 }}>
                We do not sell your personal information to third parties.
              </p>
            </section>

            <section>
              <h2 style={heading}>5. Data Security</h2>
              <p style={prose}>
                We implement industry-standard security measures including encryption, secure authentication, and regular security audits to protect your information. However, no method of transmission over the Internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 style={heading}>6. Your Rights</h2>
              <p style={prose}>You have the right to:</p>
              <ul style={list}>
                <li>Access and review your personal information</li>
                <li>Request corrections to inaccurate data</li>
                <li>Request deletion of your account and associated data</li>
                <li>Opt-out of non-essential communications</li>
              </ul>
            </section>

            <section>
              <h2 style={heading}>7. Children&apos;s Privacy</h2>
              <p style={prose}>
                Our platform is designed for students of various ages preparing for competitive exams. For users under 18, we recommend parental supervision and consent before registration.
              </p>
            </section>

            <section>
              <h2 style={heading}>8. Changes to This Policy</h2>
              <p style={prose}>
                We may update this Privacy Policy from time to time. We will notify you of significant changes via email or platform notification.
              </p>
            </section>

            <section>
              <h2 style={heading}>9. Contact Us</h2>
              <p style={prose}>
                If you have questions about this Privacy Policy, please contact us through the{' '}
                <Link href="/contact" style={{ color: '#6d28d9', fontWeight: 700, textDecoration: 'underline' }}>
                  Contact page
                </Link>
                .
              </p>
            </section>
          </div>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)', marginTop: 24 }}>
            <Link href="/terms" style={{ color: '#6d28d9', fontWeight: 700 }}>
              Terms of Service →
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
