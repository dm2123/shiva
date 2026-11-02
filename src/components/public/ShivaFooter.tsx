'use client';

import Link from 'next/link';
import Reveal from './Reveal';
import { openCallbackModal } from './ShivaScholarship';
import { BRAND } from '@/lib/brand';

/** Social links — URLs src/lib/brand.ts se (codebase me pehle se asal config). */
const SOCIALS = [
  { label: 'Facebook', href: BRAND.social.facebook },
  { label: 'YouTube', href: BRAND.social.youtube },
  { label: 'Instagram', href: BRAND.social.instagram },
  { label: 'X (Twitter)', href: BRAND.social.twitter },
];

/**
 * GLOBAL PUBLIC SHELL — Footer (Workstream 10 + Round 2 Stream E)
 * Brand row + 5 link columns (map pattern: Company / Popular Exams / Products /
 * Free Resources / Legal) + bottom bar with copyright.
 * Link rule (fleet 2026-11-02): platform routes (/courses, /batches,
 * /test-series, /teachers, /about, /contact, /privacy, /terms) app ke
 * apne routes hain — ye the-shiva.onrender.com par serve hote hain.
 * Marketing content (Results, Scholarship, Free Study Material, FAQ,
 * Download App) GitHub Pages marketing site par hai:
 * https://dm2123.github.io/shiva/ (+ results.html / scholarship.html) —
 * purane '/#…' homepage-anchor links platform root ke redirect ke baad
 * kahin nahi pahunchte the, isliye woh marketing pages se badle gaye.
 * 'Book Free Demo' counsellor-callback modal kholta hai (asal demo
 * request ka yahi flow hai). Koi invented address / phone / social
 * counts nahi. Popular Exams = platform ke asal exam families, sab
 * /courses par. Class contract preserved: footer, .wrap, .fgrid,
 * .fbot, .flink. WS10 additive classes: .fbrand, .fbot-links.
 */

// Marketing ab isi app ke JSX routes par hai ('/', '/scholarship', '/results') — purana GitHub Pages MARKETING constant hata diya (2026-11-02 JSX conversion).

const COLUMNS: {
  heading: string;
  links: ({ label: string; href: string; external?: boolean } | { label: string; action: 'callback' })[];
}[] = [
  {
    heading: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Our Faculty', href: '/teachers' },
      { label: 'Download App', href: '/' },
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
      { label: 'Test Series', href: '/test-series' },
      { label: 'Book Free Demo', action: 'callback' },
      { label: 'Student Login', href: '/login' },
    ],
  },
  {
    heading: 'Free Resources',
    links: [
      { label: 'Free Study Material', href: '/' },
      { label: 'Scholarship', href: '/scholarship' },
      { label: 'Results', href: '/results' },
      { label: 'FAQ', href: '/' },
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
              <h4>
                THE <span style={{ color: '#f5b942' }}>SHIVA</span>
              </h4>
              <p className="fbrand-desc">
                India ka affordable learning platform — SSC, Railway, Banking, Defence aur Teaching exams ke
                liye.
              </p>
              <div className="fsocial" aria-label="Social media">
                {SOCIALS.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer">
                    {s.label}
                  </a>
                ))}
              </div>
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
                    l.external ? (
                      <a key={l.label} href={l.href}>
                        {l.label}
                      </a>
                    ) : (
                      <Link key={l.label} href={l.href}>
                        {l.label}
                      </Link>
                    )
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

        {/* SEO paragraph — design-map wala footer pattern: platform kya hai,
            kin exams ke liye, aur free-first approach. Koi sankhya, rank ya
            result ka daava nahi — sirf wahi jo platform asal me deta hai. */}
        <div
          style={{
            borderTop: '1px solid #232044',
            marginTop: 4,
            paddingTop: 22,
            paddingBottom: 22,
            fontSize: 13,
            lineHeight: 1.8,
            color: '#8b87b0',
          }}
        >
          <p style={{ margin: '0 0 10px', maxWidth: 860 }}>
            THE SHIVA ek free-first learning platform hai — SSC, Railway, Banking, Defence,
            Teaching aur State exams ki taiyaari ke liye. Yahan structured courses, live aur
            recorded lectures, chapter-wise practice, mock tests, previous year papers aur doubt
            solving ek hi jagah milte hain, taaki student ko taiyaari ke liye alag-alag jagah
            bhaagna na pade.
          </p>
          <p style={{ margin: 0, maxWidth: 860 }}>
            Shuruaat free registration se hoti hai: apna exam goal chuno, published course ya
            batch join karo, free demo lectures dekhkar faisla lo, aur tests se apni taiyaari
            ko number me aanko. Free study material — notes, previous year papers aur mock
            tests — har student ke liye bina fee ke uplabdh hai.
          </p>
        </div>

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
