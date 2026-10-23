import Image from 'next/image';
import Link from 'next/link';
import DemoVideoPlayer from '@/components/common/DemoVideoPlayer';
import { BRAND } from '@/lib/brand';

export const metadata = {
  title: 'About — THE SHIVA',
  description: 'Learn about THE SHIVA — a purpose-built digital learning platform for competitive exam preparation.',
};

/**
 * MARKETING-A (Workstream: public marketing polish)
 * Page ko purane dark-glass theme se naye landing system
 * (shiva-landing.css: .wrap / .sec-head / .feat / .scholar) par laya gaya —
 * taaki (public) layout ke light shell ke saath contrast sahi rahe.
 * Copy 100% THE SHIVA ki apni hai — koi student count, rating ya
 * result ka invented daava nahi; founder/demo asal content barkarar hai.
 */

const VALUES = [
  { icon: '🎯', bg: '#ede9fe', title: 'Purpose-Built', desc: 'Every feature designed specifically for competitive exam preparation — not a generic LMS.' },
  { icon: '👨‍🏫', bg: '#fdf0d5', title: 'Expert Faculty', desc: 'Teachers are provisioned by admins and assigned to courses — ensuring quality and accountability.' },
  { icon: '🔒', bg: '#f3e8ff', title: 'Strict RBAC', desc: 'Student, Teacher, and Admin portals are completely isolated for privacy and focus.' },
  { icon: '📊', bg: '#ede9fe', title: 'Data-Driven', desc: 'Track progress across every subject, chapter, and test to identify strengths and gaps.' },
  { icon: '🎥', bg: '#fdf0d5', title: 'Hybrid Learning', desc: 'Combine live classes with on-demand lectures, practice tests, and doubt resolution.' },
  { icon: '📝', bg: '#f3e8ff', title: 'Exam-Pattern Focused', desc: 'Courses aur tests SSC, Railway, Banking, Defence aur Teaching exams ke pattern ko dhyaan me rakhkar bane hain — practice wahi, jo exam me kaam aaye.' },
];

const STEPS = [
  { n: '1', title: 'Register karo', desc: 'Free student account banao — sirf kuch hi minute lagte hain.' },
  { n: '2', title: 'Apna course chuno', desc: 'Apne exam goal ke hisaab se published course ya batch join karo.' },
  { n: '3', title: 'Seekho aur practice karo', desc: 'Live classes, recorded lectures aur chapter-wise practice — apni speed par.' },
  { n: '4', title: 'Test do, doubt poochho', desc: 'Tests se progress dekho aur doubts seedha apne teachers se clear karo.' },
];

const EXAMS = ['SSC', 'Railway', 'Banking', 'Defence', 'Teaching'];

export default function AboutPage() {
  return (
    <>
      {/* ── Hero / heading band — sajawat sirf apne CSS graphics se:
          purple/gold radial glow + dot pattern (koi bahari image nahi) ── */}
      <section
        style={{
          paddingBottom: 24,
          position: 'relative',
          background:
            'radial-gradient(640px 300px at 12% -40px, rgba(109,40,217,.10), transparent 60%), radial-gradient(560px 280px at 88% -30px, rgba(245,185,66,.16), transparent 60%)',
        }}
      >
        <div className="wrap">
          <nav className="page-crumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">About</span>
          </nav>
          <div className="sec-head">
            <span className="kicker">About THE SHIVA</span>
            <h1 className="h-display">
              Competitive exams ke liye hi bana{' '}
              <span className="hl">ek focused platform</span>
            </h1>
            <p>
              THE SHIVA ek focused digital learning ecosystem hai — SSC, Railway, Banking,
              Defence aur Teaching exams ki taiyaari karne wale students ke liye, shuru se
              unhi ki zarooraton ko dhyaan me rakhkar banaya gaya.
            </p>
          </div>
          {/* Apna CSS dot-pattern divider — purple dots, kinare fade */}
          <div
            aria-hidden="true"
            style={{
              height: 22,
              maxWidth: 460,
              margin: '6px auto 18px',
              backgroundImage: 'radial-gradient(rgba(109,40,217,.28) 1.5px, transparent 1.6px)',
              backgroundSize: '18px 18px',
              backgroundPosition: 'center',
              maskImage: 'linear-gradient(90deg, transparent, #000 25%, #000 75%, transparent)',
              WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 25%, #000 75%, transparent)',
            }}
          />
          <div
            style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}
            aria-label="Exam categories"
          >
            {EXAMS.map((exam) => (
              <Link
                key={exam}
                href="/courses"
                className="btn"
                style={{
                  padding: '8px 18px',
                  borderRadius: 999,
                  border: '2px solid var(--line)',
                  background: '#fff',
                  fontSize: 13,
                  minHeight: 40,
                }}
              >
                {exam}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission & Vision ────────────────────────────────── */}
      <section style={{ paddingTop: 24 }}>
        <div className="wrap">
          <div className="grid3" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))' }}>
            <article
              style={{ background: '#fff', border: '2px solid var(--line)', borderRadius: 20, padding: 32 }}
            >
              <span className="sec-badge">Our Mission</span>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', margin: '10px 0 12px' }}>
                Generic tool nahi — exam ke liye bana saathi
              </h3>
              <p style={{ color: 'var(--muted)', fontSize: 15, marginBottom: 12 }}>
                THE SHIVA isiliye banaya gaya kyunki zyada-tar learning platforms generic hote
                hain — har tarah ki padhai ke liye ek hi tool. Hum maante hain ki competitive
                exam ki taiyaari ko ek purpose-built platform milna chahiye.
              </p>
              <p style={{ color: 'var(--muted)', fontSize: 15, marginBottom: 12 }}>
                Isiliye yahan har feature — academic hierarchy (Course → Subject → Chapter →
                Lecture), test format, doubt system aur analytics — inhi exams ke candidates
                ki asal zarooraton ke around design hai.
              </p>
              <p style={{ color: 'var(--muted)', fontSize: 15 }}>
                Hum marketplace ki tarah kaam nahi karte. Teachers administrators dwara
                carefully select aur assign hote hain, taaki quality control aur zimmedari
                bani rahe — students ko ek curated, cohesive experience mile, bikhra hua
                content nahi.
              </p>
            </article>

            <article
              style={{
                background: 'linear-gradient(135deg,#2a1650,#6d28d9)',
                borderRadius: 20,
                padding: 32,
                color: '#fff',
              }}
            >
              <span
                className="sec-badge"
                style={{ background: 'rgba(245,185,66,.18)', color: '#f5b942' }}
              >
                Our Vision
              </span>
              <h3 style={{ fontSize: 22, fontWeight: 800, margin: '10px 0 12px', color: '#fff' }}>
                Har aspirant ko ek saaf, structured raasta mile
              </h3>
              <p style={{ color: '#ddd6fe', fontSize: 15, marginBottom: 12 }}>
                Humari vision simple hai: taiyaari ka raasta utna hi saaf hona chahiye jitna
                student ka goal. Sahi course, sahi sequence, sahi practice — bina confusion,
                bina bhatkav.
              </p>
              <p style={{ color: '#ddd6fe', fontSize: 15 }}>
                Chahe aap pehli baar kisi sarkari exam ki taiyaari kar rahe hon ya ek aur
                attempt ki planning — THE SHIVA ka har hissa aapko agla kadam saaf dikhane
                ke liye bana hai: kya padhna hai, kitna ho gaya hai, aur aage kya karna hai.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ── Kyun THE SHIVA ──────────────────────────────────── */}
      <section style={{ paddingTop: 8 }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="kicker">Kyun THE SHIVA</span>
            <h2>
              Jo humein <span className="hl">alag</span> banata hai
            </h2>
            <p>
              Koi bade daave nahi — bas woh cheezein jo platform asal me karta hai, aur
              jinpar hum har din kaam karte hain.
            </p>
          </div>
          <div className="grid4">
            {VALUES.map((v) => (
              <div key={v.title} className="feat">
                <span className="ico" style={{ background: v.bg }} aria-hidden="true">
                  {v.icon}
                </span>
                <div>
                  <b>{v.title}</b>
                  <p>{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Kaise kaam karta hai ────────────────────────────── */}
      <section style={{ paddingTop: 8 }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="kicker">Kaise Kaam Karta Hai</span>
            <h2>
              Chaar steps me <span className="hl">taiyaari shuru</span>
            </h2>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
              gap: 18,
            }}
          >
            {STEPS.map((s) => (
              <div
                key={s.n}
                style={{ background: '#fff', border: '2px solid var(--line)', borderRadius: 18, padding: '26px 20px' }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    display: 'inline-flex',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: '#6d28d9',
                    color: '#fff',
                    fontWeight: 900,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12,
                  }}
                >
                  {s.n}
                </span>
                <b style={{ display: 'block', fontSize: 16, color: 'var(--ink)', marginBottom: 6 }}>
                  {s.title}
                </b>
                <p style={{ fontSize: 14, color: 'var(--muted)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Founder (asal content barkarar) ─────────────────── */}
      <section style={{ paddingTop: 8 }}>
        <div className="wrap">
          <div
            style={{
              background: '#fff',
              border: '2px solid var(--line)',
              borderRadius: 24,
              padding: 36,
              display: 'grid',
              gap: 36,
            }}
            className="about-founder"
          >
            <div>
              <span className="sec-badge">Meet the Founder</span>
              <h3 style={{ fontSize: 26, fontWeight: 800, color: 'var(--ink)', margin: '10px 0 4px' }}>
                Shivajay Sir
              </h3>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)', marginBottom: 10 }}>
                Founder, THE SHIVA
              </p>
              <span
                style={{
                  display: 'inline-block',
                  padding: '5px 12px',
                  borderRadius: 999,
                  background: '#ede9fe',
                  color: '#6d28d9',
                  fontSize: 12,
                  fontWeight: 800,
                  border: '1px solid #ddd6fe',
                  marginBottom: 16,
                }}
              >
                4 Times IIT GATE Qualified
              </span>
              <p style={{ color: '#374151', fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}>
                Founder of THE SHIVA. Expert in Quantitative Aptitude and Reasoning with a
                proven track record. Dedicated to providing top-quality education and guidance
                to all competitive exam candidates.
              </p>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 10 }}>
                Watch Shivajay Sir&apos;s Demo Class
              </p>
              <DemoVideoPlayer src={BRAND.demoVideoUrl} title="Teaching Demo" />
            </div>
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: 380,
                margin: '0 auto',
                aspectRatio: '3 / 4',
                borderRadius: 18,
                overflow: 'hidden',
                boxShadow: '0 18px 40px rgba(42,22,80,.18)',
              }}
            >
              <Image src="/assets/shivajay-sir.jpeg" alt="Shivajay Sir" fill className="object-cover" />
            </div>
          </div>
          <style>{`@media(min-width:900px){.about-founder{grid-template-columns:1fr 380px;align-items:center}}`}</style>
        </div>
      </section>

      {/* ── End CTA band ────────────────────────────────────── */}
      <section style={{ paddingTop: 8 }}>
        <div className="wrap">
          <div className="scholar">
            <div>
              <h2>
                Focused learning ka <span className="hl">anubhav</span> karne ke liye taiyaar ho?
              </h2>
              <p>
                THE SHIVA par student ke roop me register karo aur jab courses publish hon,
                structured competitive exam preparation ka access pao.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/register" className="btn btn-gold">
                Get Started Free →
              </Link>
              <Link href="/login" className="btn btn-ghost">
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
