import Link from 'next/link';
import ContactForm from './ContactForm';

export const metadata = {
  title: 'Contact — THE SHIVA',
  description: 'Get in touch with THE SHIVA team for inquiries, support, or partnership opportunities.',
};

/**
 * MARKETING-A polish — page ko naye landing system par laya gaya.
 * Sirf asal info jo pehle se thi wahi hai: koi phone/email/address
 * invent nahi kiya gaya. Form ki wiring ContactForm me unchanged hai.
 */
export default function ContactPage() {
  return (
    <>
      {/* ── Heading band — sajawat sirf apne CSS graphics se:
          purple/gold radial glow (koi bahari image nahi) ── */}
      <section
        style={{
          paddingBottom: 24,
          position: 'relative',
          background:
            'radial-gradient(640px 300px at 12% -40px, rgba(109,40,217,.10), transparent 60%), radial-gradient(560px 280px at 88% -30px, rgba(245,185,66,.16), transparent 60%)',
        }}
      >
        <div className="wrap">
          <div className="sec-head">
            <span className="kicker">Get in Touch</span>
            <h2>
              Contact <span className="hl">THE SHIVA</span>
            </h2>
            <p>
              Have questions, feedback, or partnership inquiries? We&apos;re here to help.
              Neeche apne liye sahi raasta chunein — portal support ya general form.
            </p>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap" style={{ maxWidth: 960 }}>
          {/* ── Sahi raasta chunein ─────────────────────────── */}
          <div className="grid3" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', marginBottom: 28 }}>
            <div className="feat" style={{ flexDirection: 'column' }}>
              <span className="ico" style={{ background: '#ede9fe' }} aria-hidden="true">
                🎓
              </span>
              <div>
                <b>Student Support</b>
                <p>
                  Already registered? Access support directly through your student portal
                  after logging in.
                </p>
                <Link
                  href="/login"
                  style={{ display: 'inline-block', marginTop: 10, fontSize: 13, fontWeight: 800, color: '#6d28d9' }}
                >
                  Go to Student Portal →
                </Link>
              </div>
            </div>

            <div className="feat" style={{ flexDirection: 'column' }}>
              <span className="ico" style={{ background: '#f3e8ff' }} aria-hidden="true">
                👨‍🏫
              </span>
              <div>
                <b>Faculty Portal</b>
                <p>
                  Teachers are provisioned by administrators. If you&apos;re an assigned
                  educator, access your portal here.
                </p>
                <Link
                  href="/teacher/login"
                  style={{ display: 'inline-block', marginTop: 10, fontSize: 13, fontWeight: 800, color: '#6d28d9' }}
                >
                  Teacher Login →
                </Link>
              </div>
            </div>

            <div className="feat" style={{ flexDirection: 'column' }}>
              <span className="ico" style={{ background: '#fef3c7' }} aria-hidden="true">
                ✉️
              </span>
              <div>
                <b>General Inquiries</b>
                <p>
                  Business partnerships, institutional collaborations, ya koi aam sawaal ho —
                  neeche wala form bharein.
                </p>
                <a
                  href="#inquiry-form"
                  style={{ display: 'inline-block', marginTop: 10, fontSize: 13, fontWeight: 800, color: '#b45309' }}
                >
                  Form par jayein ↓
                </a>
              </div>
            </div>
          </div>

          {/* ── Form card ───────────────────────────────────── */}
          <div
            id="inquiry-form"
            style={{
              background: '#fff',
              border: '2px solid var(--line)',
              borderRadius: 24,
              padding: 36,
              scrollMarginTop: 116,
            }}
          >
            <span className="sec-badge">General Inquiries</span>
            <h3 style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)', margin: '10px 0 6px' }}>
              Humein message bhejein
            </h3>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>
              For business partnerships, institutional collaborations, or general questions.
            </p>
            <ContactForm />
          </div>

          {/* ── Quick links ─────────────────────────────────── */}
          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 12 }}>
              Looking for something else?
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
              <Link href="/courses" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: 14 }}>
                Browse Courses
              </Link>
              <Link
                href="/teachers"
                className="btn"
                style={{ padding: '10px 20px', fontSize: 14, border: '2px solid var(--line)', background: '#fff', borderRadius: 12 }}
              >
                Meet Teachers
              </Link>
              <Link
                href="/about"
                className="btn"
                style={{ padding: '10px 20px', fontSize: 14, border: '2px solid var(--line)', background: '#fff', borderRadius: 12 }}
              >
                About Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── End CTA band ────────────────────────────────────── */}
      <section style={{ paddingTop: 8 }}>
        <div className="wrap">
          <div className="scholar">
            <div>
              <h2>
                Abhi account <span className="hl">nahi hai?</span>
              </h2>
              <p>
                Free me register karo — courses publish hote hi structured taiyaari ka access
                tumhare student portal me milega.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/register" className="btn btn-gold">
                Register Free →
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
