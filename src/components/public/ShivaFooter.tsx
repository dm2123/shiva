'use client';

import Link from 'next/link';
import Reveal from './Reveal';
import { openCallbackModal } from './ShivaScholarship';

/**
 * GLOBAL PUBLIC SHELL — Footer (Workstream 10 + Round 2 Stream E)
 * Brand row + 5 link columns (map pattern: Company / Popular Exams / Products /
 * Free Resources / Legal) + bottom bar with copyright.
 * Only real routes are linked (/courses, /batches, /teachers, /about, /contact,
 * /privacy, /terms, /app/tests, homepage anchors) — no invented address / phone /
 * social counts. Popular Exams = platform ke asal exam families, sab /courses par.
 * Class contract preserved: footer, .wrap, .fgrid, .fbot, .flink.
 * WS10 additive classes: .fbrand, .fbot-links. (Grid 5-column R2 CSS me hai.)
 */

const COLUMNS: {
  heading: string;
  links: ({ label: string; href: string } | { label: string; action: 'callback' })[];
}[] = [
  {
    heading: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Our Faculty', href: '/teachers' },
      { label: 'Download App', href: '/#app' },
      { label: 'Talk to a Counsellor', action: 'callback' },
    ],
  },
  {
    heading: 'Popular Exams',
    links: [
      { label: 'SSC Exams', href: '/courses' },
      { label: 'Railway Exams', href: '/courses' },
      { label: 'Banking Exams', href: '/courses' },
      { label: 'Defence Exams', href: '/courses' },
      { label: 'Teaching Exams', href: '/courses' },
    ],
  },
  {
    heading: 'Products',
    links: [
      { label: 'Courses', href: '/courses' },
      { label: 'Batches', href: '/batches' },
      { label: 'Test Series', href: '/app/tests' },
      { label: 'Book Free Demo', href: '/#demoCard' },
      { label: 'Student Login', href: '/login' },
    ],
  },
  {
    heading: 'Free Resources',
    links: [
      { label: 'Free Study Material', href: '/#material' },
      { label: 'Scholarship', href: '/#scholarship' },
      { label: 'Results', href: '/#results' },
      { label: 'FAQ', href: '/#faq' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
];

export default function ShivaFooter() {
  return (
    <footer>
      <div className="wrap">
        <Reveal>
          <div className="fbrand">
            <div className="fbrand-main">
              <h4>THE SHIVA</h4>
              <p className="fbrand-desc">
                India ka affordable learning platform — SSC, Railway, Banking, Defence aur Teaching exams ke
                liye.
              </p>
            </div>
            <p className="fbrand-help">
              🤔 <strong>Sawaal hain?</strong>
              <br />
              <button
                type="button"
                className="flink"
                onClick={openCallbackModal}
                style={{ color: '#f5b942', fontWeight: 700, display: 'inline-block', padding: 0 }}
              >
                Talk to a counsellor →
              </button>
            </p>
          </div>

          <nav className="fgrid" aria-label="Footer">
            {COLUMNS.map((col) => (
              <div key={col.heading}>
                <h4>{col.heading}</h4>
                {col.links.map((l) =>
                  'href' in l ? (
                    <Link key={l.label} href={l.href}>
                      {l.label}
                    </Link>
                  ) : (
                    <button key={l.label} type="button" className="flink" onClick={openCallbackModal}>
                      {l.label}
                    </button>
                  ),
                )}
              </div>
            ))}
          </nav>
        </Reveal>

        <div className="fbot">
          <span>© 2026 THE SHIVA. All rights reserved.</span>
          <span className="fbot-links">
            <Link href="/privacy">Privacy</Link>
            <span aria-hidden="true">·</span>
            <Link href="/terms">Terms</Link>
            <span aria-hidden="true">·</span>
            <Link href="/contact">Contact</Link>
          </span>
          <span>Made with ❤️ in India</span>
        </div>
      </div>
    </footer>
  );
}
