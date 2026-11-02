import Link from 'next/link';

export const metadata = {
  title: 'Scholarship — THE SHIVA',
  description:
    'THE SHIVA Scholarship Program — padhai me aarthik madad har deserving student ka haq hai. Program abhi design ho raha hai; koi jhoothi rakam ya vaada nahi.',
};

/**
 * JSX CONVERSION (HTML -> React): purani static scholarship.html ka
 * design/content is JSX page me hai. Header/footer (public) layout ke
 * shared ShivaNav/ShivaFooter se aate hain. Imaandaar seema barkarar:
 * scholarship ki koi rakam, percentage ya date NAHI dikhayi gayi hai —
 * program final hone tak sirf pakki baatein hi likhi hain.
 */

const TICKER = ['SSC', 'RAILWAY', 'BANKING', 'DEFENCE', 'TEACHING', 'FOUNDATION'];

const HELP_CARDS = [
  {
    icon: '🎓',
    title: 'Free Aptitude Course',
    desc: 'Poora Aptitude Foundation course bilkul free — enroll karke aaj hi padho.',
  },
  {
    icon: '🧭',
    title: 'Free Counselling',
    desc: 'Exam aur batch chunne me counsellor ki muft salah — koi charge nahi.',
  },
  {
    icon: '🗺️',
    title: 'Free Study Direction',
    desc: 'Kya padhna hai aur kis order me — counsellor se apna study plan banao.',
  },
];

const PLAN_STEPS = [
  { title: 'Apply', desc: 'Program live hone par platform se simple application.' },
  { title: 'Merit Test', desc: 'Chhota scholarship test — padhai ki neev ke basis par.' },
  { title: 'Zaroorat', desc: 'Aarthik zaroorat ko bhi samman ke saath dhyaan me rakha jayega.' },
  { title: 'Support', desc: 'Chune gaye students ko course access aur mentorship support.' },
];

const FAQS = [
  {
    q: 'Scholarship me kitne paise milenge?',
    a: 'Abhi koi rakam tay nahi hai, isliye hum koi number nahi batate. Program final hote hi sahi jaankari isi page par milegi — kisi aur jagah suni rakam par bharosa mat karo.',
  },
  {
    q: 'Apply kab se hoga?',
    a: 'Dates abhi ghoshit nahi hain. Updates ke liye counsellor se jud jao ya free course me enroll karke platform par bane raho.',
  },
  {
    q: 'Tab tak main padhai kaise afford karun?',
    a: 'Aptitude Foundation course 100% free hai — wahi se shuruaat karo. Aage ke paid batches affordable rakhna hi THE SHIVA ka mission hai.',
  },
];

export default function ScholarshipPage() {
  return (
    <div className="bg-[#faf9ff] text-[#1e1b2e]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="pt-6 text-sm text-[#6b7280]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#6d28d9]">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="font-semibold text-[#2a1650]">Scholarship</span>
        </nav>

        {/* Hero */}
        <section className="py-10 text-center sm:py-14">
          <span className="inline-block rounded-full bg-[#f5b942] px-4 py-1.5 text-xs font-extrabold tracking-wide text-[#2a1650]">
            SCHOLARSHIP
          </span>
          <h1 className="mt-4 text-4xl font-black leading-tight text-[#2a1650] sm:text-5xl">
            Scholarship <span className="text-[#6d28d9]">Program</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#4b5563] sm:text-lg">
            Padhai me aarthik madad har deserving student ka haq hai. Program abhi design ho raha
            hai — is page par hum sirf wahi likhte hain jo pakka hai, koi jhoothi rakam ya vaada
            nahi.
          </p>
        </section>
      </div>

      {/* Exam ticker */}
      <div className="overflow-hidden border-y border-[#ede9fe] bg-[#2a1650] py-3">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 text-sm font-extrabold tracking-widest text-white">
          {TICKER.map((t) => (
            <span key={t} className="flex items-center gap-6">
              {t} <span className="text-[#f5b942]">✦</span>
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Honest status card */}
        <section className="py-12">
          <div className="rounded-3xl border border-[#ede9fe] bg-white p-6 shadow-sm sm:p-10">
            <h2 className="text-2xl font-extrabold text-[#2a1650] sm:text-3xl">
              Scholarship Details Jald Aayenge
            </h2>
            <p className="mt-4 leading-relaxed text-[#4b5563]">
              Hum scholarship program ki shartein, eligibility aur selection process taiyaar kar
              rahe hain. Jab tak sab kuch pakka nahi hota, hum{' '}
              <strong className="text-[#2a1650]">
                koi amount, percentage ya last date ghoshit nahi karte
              </strong>{' '}
              — taaki koi student galat ummeed par faisla na le.
            </p>
            <p className="mt-4 leading-relaxed text-[#4b5563]">
              Tab tak sabse badi madad pehle se live hai:{' '}
              <strong className="text-[#6d28d9]">100% Free Aptitude Foundation Course</strong> —
              bina kisi scholarship ke, sabke liye.
            </p>
            <Link
              href="/courses/aptitude-foundation-free"
              className="mt-6 inline-block rounded-full bg-[#121216] px-7 py-3 font-bold text-white transition hover:bg-[#2a1650]"
            >
              Free Course Se Shuru Karo →
            </Link>
          </div>
        </section>

        {/* Abhi ki madad */}
        <section className="pb-12">
          <p className="text-center text-sm font-extrabold uppercase tracking-widest text-[#6d28d9]">
            Abhi Ki Madad
          </p>
          <h2 className="mt-2 text-center text-3xl font-black text-[#2a1650]">
            Scholarship Ke Bina Bhi Yeh Sab Free Hai
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {HELP_CARDS.map((c) => (
              <div
                key={c.title}
                className="rounded-3xl border border-[#ede9fe] bg-white p-6 shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5f3ff] text-2xl">
                  {c.icon}
                </div>
                <h3 className="mt-4 text-lg font-extrabold text-[#2a1650]">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#4b5563]">{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Aage ka plan */}
        <section className="pb-12">
          <p className="text-center text-sm font-extrabold uppercase tracking-widest text-[#6d28d9]">
            Aage Ka Plan
          </p>
          <h2 className="mt-2 text-center text-3xl font-black text-[#2a1650]">
            Scholarship Aise Kaam Karega
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-[#4b5563]">
            Program ke usool pehle se tay hain — rakam aur dates final hote hi yahin ghoshit hongi.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PLAN_STEPS.map((s, i) => (
              <div
                key={s.title}
                className="rounded-3xl border border-[#ede9fe] bg-white p-6 shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6d28d9] font-black text-white">
                  {i + 1}
                </div>
                <h3 className="mt-4 text-lg font-extrabold text-[#2a1650]">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#4b5563]">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="pb-12">
          <p className="text-center text-sm font-extrabold uppercase tracking-widest text-[#6d28d9]">
            FAQ
          </p>
          <h2 className="mt-2 text-center text-3xl font-black text-[#2a1650]">
            Scholarship Se Jude Sawal
          </h2>
          <div className="mx-auto mt-8 max-w-3xl space-y-4">
            {FAQS.map((f) => (
              <div
                key={f.q}
                className="rounded-3xl border border-[#ede9fe] bg-white p-6 shadow-sm"
              >
                <h3 className="font-extrabold text-[#2a1650]">{f.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#4b5563]">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Counsellor strip */}
        <section className="pb-16">
          <div className="rounded-3xl bg-[#2a1650] p-6 text-center text-white sm:p-10">
            <h2 className="text-2xl font-extrabold">Abhi bhi confused ho?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-white/80">
              Hamare counsellor se FREE me baat karo — sahi exam, sahi batch, sahi plan — ya{' '}
              <Link href="/contact" className="font-semibold text-[#f5b942] underline">
                Contact page
              </Link>{' '}
              par message bhejo.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/contact"
                className="rounded-full bg-[#f5b942] px-7 py-3 font-bold text-[#2a1650] transition hover:brightness-105"
              >
                Counsellor se baat karo
              </Link>
              <Link
                href="/courses/aptitude-foundation-free"
                className="rounded-full border border-white/40 px-7 py-3 font-bold text-white transition hover:bg-white/10"
              >
                Free Course
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
