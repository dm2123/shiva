import Link from 'next/link';

export const metadata = {
  title: 'Results — THE SHIVA',
  description:
    'THE SHIVA Results — koi nakli topper ya invent rank nahi. Pehla batch chal raha hai; asli verified results aate hi yahin publish honge.',
};

/**
 * JSX CONVERSION (HTML -> React): purani static results.html ka
 * design/content is JSX page me hai. Header/footer (public) layout ke
 * shared ShivaNav/ShivaFooter se aate hain. Imaandaar seema sakht
 * barkarar: koi topper, rank, selection count ya testimonial invent
 * NAHI kiya gaya hai — pehla batch chal raha hai, yahi sach hai.
 */

const TICKER = ['SSC', 'RAILWAY', 'BANKING', 'DEFENCE', 'TEACHING', 'FOUNDATION'];

const EXAM_CHIPS = ['SSC', 'Railway', 'Banking', 'Defence', 'Teaching', 'State Exams'];

const EXAM_CARDS = [
  {
    icon: '🏛️',
    title: 'SSC Results',
    desc: 'CGL, CHSL, MTS jaise exams ke selections — jab pehle students select honge.',
  },
  {
    icon: '🚆',
    title: 'Railway Results',
    desc: 'NTPC, Group D, ALP ke results — official lists se verify karke hi.',
  },
  {
    icon: '🏦',
    title: 'Banking Results',
    desc: 'PO aur Clerk selections ki stories — student ki sehmati ke saath.',
  },
];

const POLICY_STEPS = [
  { title: 'Sirf Asli', desc: 'Sirf asal enrolled students ke results — koi khareeda hua testimonial nahi.' },
  { title: 'Verify Karke', desc: 'Har result official selection list se match karke hi publish hoga.' },
  { title: 'Ijazat Se', desc: 'Student ka naam/photo sirf uski saaf ijazat ke baad.' },
  { title: 'Bina Badha-Chadha', desc: 'Counts aur ranks jaise hain, waise — koi round-up jhooth nahi.' },
];

const FAQS = [
  {
    q: 'Abhi tak koi topper kyun nahi dikh raha?',
    a: 'Kyunki platform naya hai aur pehla batch chal raha hai. Hum dusri jagah ki photos ya nakli naam lagakar jhootha bharosa nahi banana chahte — asli results aate hi yahi page update hoga.',
  },
  {
    q: 'Kya THE SHIVA selection ki guarantee deta hai?',
    a: 'Nahi — koi bhi imaandaar platform selection ki guarantee nahi de sakta. Hum structured padhai, practice aur support dete hain; selection tumhari mehnat aur exam performance par hota hai.',
  },
  {
    q: 'Main apni taiyaari kaise behtar karun?',
    a: 'Free Aptitude Foundation course se neev mazboot karo, roz practice karo aur mock tests se apni galtiyan sudharo — yahi asal selection ka rasta hai.',
  },
];

export default function ResultsPage() {
  return (
    <div className="bg-[#faf9ff] text-[#1e1b2e]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="pt-6 text-sm text-[#6b7280]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#6d28d9]">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="font-semibold text-[#2a1650]">Results</span>
        </nav>

        {/* Hero */}
        <section className="py-10 text-center sm:py-14">
          <span className="inline-block rounded-full bg-[#f5b942] px-4 py-1.5 text-xs font-extrabold tracking-wide text-[#2a1650]">
            RESULTS
          </span>
          <h1 className="mt-4 text-4xl font-black leading-tight text-[#2a1650] sm:text-5xl">
            Hamare <span className="text-[#6d28d9]">Results</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#4b5563] sm:text-lg">
            Results ka matlab hai saboot. Hum nakli toppers, invent kiye ranks ya selection ke bade
            daave nahi lagate — jab asli results aayenge, wahi yahan dikhenge.
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
          <div className="rounded-3xl border border-[#ede9fe] bg-white p-6 text-center shadow-sm sm:p-10">
            <h2 className="text-2xl font-extrabold text-[#2a1650] sm:text-3xl">
              Pehla Batch Chal Raha Hai
            </h2>
            <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-[#4b5563]">
              THE SHIVA ka pehla batch abhi padh raha hai. Students ki <strong>asli</strong> success
              stories — naam aur exam ke saath, sirf unki ijazat se — results aate hi yahin publish
              hongi.
            </p>
            <p className="mt-3 font-semibold text-[#2a1650]">
              Agli story tumhari ho sakti hai — mehnat se, kisi shortcut se nahi.
            </p>
            <Link
              href="/courses/aptitude-foundation-free"
              className="mt-6 inline-block rounded-full bg-[#121216] px-7 py-3 font-bold text-white transition hover:bg-[#2a1650]"
            >
              Taiyaari Shuru Karo →
            </Link>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {EXAM_CHIPS.map((e) => (
                <Link
                  key={e}
                  href="/courses"
                  className="rounded-full border border-[#ede9fe] bg-[#f5f3ff] px-4 py-1.5 text-sm font-bold text-[#4c1d95] transition hover:bg-[#ede9fe]"
                >
                  {e}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Kin exams ke results */}
        <section className="pb-12">
          <p className="text-center text-sm font-extrabold uppercase tracking-widest text-[#6d28d9]">
            Exams
          </p>
          <h2 className="mt-2 text-center text-3xl font-black text-[#2a1650]">
            Kin Exams Ke Results Yahan Aayenge
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-[#4b5563]">
            Jin exams ki taiyaari THE SHIVA par hoti hai, unhi ke verified results yahan publish
            honge.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {EXAM_CARDS.map((c) => (
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

        {/* Hamari neeti */}
        <section className="pb-12">
          <p className="text-center text-sm font-extrabold uppercase tracking-widest text-[#6d28d9]">
            Hamari Neeti
          </p>
          <h2 className="mt-2 text-center text-3xl font-black text-[#2a1650]">
            Results Aise Hi Publish Honge
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {POLICY_STEPS.map((s, i) => (
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
            Results Se Jude Sawal
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
