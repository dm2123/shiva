'use client';

import { useState } from 'react';

const LINKS = [
  { href: '/#courses', label: 'Courses' },
  { href: '/#batches', label: 'Batches' },
  { href: '/#faculty', label: 'Faculty' },
  { href: '/#results', label: 'Results' },
  { href: '/#scholarship', label: 'Scholarship' },
];

export default function ShivaNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header>
        <div className="wrap nav">
          <a className="logo" href="/">
            <span className="mark">S</span> THE SHIVA
          </a>
          <nav className="nav-links">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
          <div className="nav-cta">
            <a className="btn btn-ghost" href="/login">
              Login
            </a>
            <a className="btn btn-primary" href="/courses">
              Get Started
            </a>
          </div>
          <button className="hamburger" onClick={() => setOpen(!open)} aria-label="Menu">
            ☰
          </button>
        </div>
      </header>
      <div className={`mobile-menu${open ? ' open' : ''}`}>
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
            {l.label}
          </a>
        ))}
        <a href="/login" onClick={() => setOpen(false)}>
          Login
        </a>
      </div>
    </>
  );
}
