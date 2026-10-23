'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * GLOBAL PUBLIC SHELL — Header / Nav (Workstream 10 + Round 2 Stream E)
 * Sticky header: logo left · 'All Courses' mega-dropdown · main nav centre ·
 * KAALA solid Login pill + purple Join Free (primary CTA) right.
 * Logged-in (shiva_session_id cookie, same check as MarketingHero) → Dashboard link.
 * Mobile: hamburger → full-height drawer (focus-safe, Esc / overlay close, scroll-lock).
 * Class contract preserved: header, .wrap .nav, .logo, .nav-links, .nav-cta,
 * .btn .btn-ghost .btn-primary, .hamburger, .mobile-menu(.open).
 * WS10 classes: .announce, .logo-text/.logo-name/.logo-tag, .nav-link(.active),
 * .btn-gold, .drawer-overlay, .drawer-*.
 * Round 2 additive classes: .btn-dark (kaala pill), .btn-pill, .mega-wrap,
 * .mega-trigger(.open), .mega-panel, .mega-cats, .mega-cat, .mega-tiles,
 * .mega-tile, .mega-foot, .drawer-group.
 */

const LINKS = [
  { href: '/courses', label: 'Courses' },
  { href: '/batches', label: 'Batches' },
  { href: '/test-series', label: 'Test Series' },
  { href: '/teachers', label: 'Teachers' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

/** Mega-dropdown — baaye categories (asal exam families), sab /courses par. */
const MEGA_CATS = [
  { label: 'SSC Exams', desc: 'CGL · CHSL · MTS · GD', href: '/courses' },
  { label: 'Railway Exams', desc: 'RRB NTPC · Group D · ALP', href: '/courses' },
  { label: 'Banking Exams', desc: 'IBPS · SBI PO / Clerk', href: '/courses' },
  { label: 'Defence Exams', desc: 'Agniveer · NDA · CDS', href: '/courses' },
  { label: 'Teaching Exams', desc: 'CTET · UPTET · STET', href: '/courses' },
];

/** Mega-dropdown — daaye exam tiles (3-column), sab asal /courses route par. */
const MEGA_TILES = [
  { ico: '🎯', label: 'SSC CGL' },
  { ico: '📝', label: 'SSC CHSL' },
  { ico: '🚆', label: 'RRB NTPC' },
  { ico: '🚂', label: 'Railway Group D' },
  { ico: '🏦', label: 'IBPS PO' },
  { ico: '💼', label: 'SBI Clerk' },
  { ico: '🪖', label: 'Agniveer' },
  { ico: '🎖️', label: 'NDA' },
  { ico: '🍎', label: 'CTET' },
];

/** Extra homepage anchors kept in the mobile drawer so nothing from the old nav is lost. */
const DRAWER_EXTRA = [
  { href: '/#results', label: 'Results' },
  { href: '/#scholarship', label: 'Scholarship' },
  { href: '/#faq', label: 'FAQ' },
];

export default function ShivaNav() {
  const [open, setOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [showStrip, setShowStrip] = useState(true);
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const megaRef = useRef<HTMLDivElement>(null);

  // Sticky-header shadow once the page scrolls.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Logged-in state — same cookie signal the marketing hero already uses.
  useEffect(() => {
    setLoggedIn(document.cookie.includes('shiva_session_id'));
  }, [pathname]);

  // Route change closes the drawer + mega-dropdown.
  useEffect(() => {
    setOpen(false);
    setMegaOpen(false);
  }, [pathname]);

  // Mega-dropdown: Esc + bahar click par band.
  useEffect(() => {
    if (!megaOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMegaOpen(false);
    };
    const onDown = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) setMegaOpen(false);
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, [megaOpen]);

  // Drawer: scroll-lock + Esc close + initial focus.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    drawerRef.current?.querySelector<HTMLElement>('a, button')?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
      burgerRef.current?.focus();
    };
  }, [open ]);

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && !!pathname?.startsWith(`${href}/`));

  return (
    <>
      <header className={scrolled ? 'is-scrolled' : undefined}>
        {showStrip && (
          <div className="announce" role="region" aria-label="Announcement">
            <span className="announce-text">
              Free demo class aur scholarship test ke liye{' '}
              <Link href="/register">register karein →</Link>
            </span>
            <button
              type="button"
              className="announce-close"
              aria-label="Announcement band karein"
              onClick={() => setShowStrip(false)}
            >
              ×
            </button>
          </div>
        )}
        <div className="wrap nav">
          <Link className="logo" href="/" aria-label="THE SHIVA — Home">
            <Image
              src="/assets/logo.jpeg"
              alt="THE SHIVA"
              width={46}
              height={46}
              style={{ borderRadius: 12, flexShrink: 0 }}
              priority
            />
            <span className="logo-text" aria-hidden="true">
              <span className="logo-name">
                THE <span className="logo-name-gold">SHIVA</span>
              </span>
              <span className="logo-tag">Learn · Practice · Succeed</span>
            </span>
          </Link>

          {/* All Courses — outline button + bada mega-dropdown (map pattern) */}
          <div
            className="mega-wrap"
            ref={megaRef}
            onMouseEnter={() => setMegaOpen(true)}
            onMouseLeave={() => setMegaOpen(false)}
          >
            <button
              type="button"
              className={`btn btn-ghost btn-pill mega-trigger${megaOpen ? ' open' : ''}`}
              aria-haspopup="true"
              aria-expanded={megaOpen}
              aria-controls="shiva-mega-panel"
              onClick={() => setMegaOpen((v) => !v)}
            >
              All Courses <span className="mega-caret" aria-hidden="true">▾</span>
            </button>
            {megaOpen && (
              <div className="mega-panel" id="shiva-mega-panel">
                <div className="mega-cats">
                  <p className="mega-head">Exam Categories</p>
                  {MEGA_CATS.map((c) => (
                    <Link
                      key={c.label}
                      className="mega-cat"
                      href={c.href}
                      onClick={() => setMegaOpen(false)}
                    >
                      <span className="mega-cat-name">{c.label}</span>
                      <span className="mega-cat-desc">{c.desc}</span>
                    </Link>
                  ))}
                </div>
                <div className="mega-right">
                  <p className="mega-head">Popular Exams</p>
                  <div className="mega-tiles">
                    {MEGA_TILES.map((t) => (
                      <Link
                        key={t.label}
                        className="mega-tile"
                        href="/courses"
                        onClick={() => setMegaOpen(false)}
                      >
                        <span className="mega-tile-ico" aria-hidden="true">{t.ico}</span>
                        <span>{t.label}</span>
                      </Link>
                    ))}
                  </div>
                  <div className="mega-foot">
                    <Link href="/batches" onClick={() => setMegaOpen(false)}>
                      All Batches →
                    </Link>
                    <Link href="/test-series" onClick={() => setMegaOpen(false)}>
                      Test Series →
                    </Link>
                    <Link href="/teachers" onClick={() => setMegaOpen(false)}>
                      Meet Our Teachers →
                    </Link>
                    <Link href="/courses" onClick={() => setMegaOpen(false)}>
                      View All Courses →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          <nav className="nav-links" aria-label="Main navigation">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`nav-link${isActive(l.href) ? ' active' : ''}`}
                aria-current={isActive(l.href) ? 'page' : undefined}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="nav-cta">
            {loggedIn ? (
              <>
                <Link className="btn btn-ghost btn-pill" href="/app/my-courses">
                  My Courses
                </Link>
                <Link className="btn btn-primary btn-pill" href="/app">
                  Dashboard →
                </Link>
              </>
            ) : (
              <>
                {/* Map pattern: aakhri action = KAALA solid pill */}
                <Link className="btn btn-dark btn-pill" href="/login">
                  Login / Register
                </Link>
                {/* Primary CTA — purple */}
                <Link className="btn btn-primary btn-pill" href="/register">
                  Join Free
                </Link>
              </>
            )}
          </div>

          <button
            ref={burgerRef}
            type="button"
            className="hamburger"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Menu band karein' : 'Menu kholein'}
            aria-expanded={open}
            aria-controls="shiva-mobile-menu"
          >
            <span className={`burger-lines${open ? ' open' : ''}`} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </header>

      {/* Mobile drawer — .mobile-menu contract kept, upgraded to a right-side drawer */}
      <div
        className={`drawer-overlay${open ? ' open' : ''}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <div
        ref={drawerRef}
        id="shiva-mobile-menu"
        className={`mobile-menu${open ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        <div className="drawer-head">
          <span className="drawer-title">THE SHIVA</span>
          <button
            type="button"
            className="drawer-close"
            onClick={() => setOpen(false)}
            aria-label="Menu band karein"
          >
            ×
          </button>
        </div>
        <nav aria-label="Mobile">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={isActive(l.href) ? 'active' : undefined}
              aria-current={isActive(l.href) ? 'page' : undefined}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <p className="drawer-group">Exam Categories</p>
          {MEGA_CATS.map((c) => (
            <Link key={c.label} href={c.href} onClick={() => setOpen(false)}>
              {c.label}
            </Link>
          ))}
          {DRAWER_EXTRA.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="drawer-cta">
          {loggedIn ? (
            <Link className="btn btn-primary btn-pill" href="/app" onClick={() => setOpen(false)}>
              Dashboard →
            </Link>
          ) : (
            <>
              <Link className="btn btn-dark btn-pill" href="/login" onClick={() => setOpen(false)}>
                Login / Register
              </Link>
              <Link className="btn btn-primary btn-pill" href="/register" onClick={() => setOpen(false)}>
                Join Free
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
