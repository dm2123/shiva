const ITEMS = ['SSC CGL', 'RRB NTPC', 'IBPS PO', 'Agniveer', 'CTET', 'SSC CHSL', 'SBI Clerk', 'NDA', 'UPTET', 'SSC MTS', 'RRB Group D', 'SSC GD'];

export default function ShivaMarquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div className="marquee-strip" aria-hidden>
      <div className="marquee-inner">
        {row.map((t, i) => (
          <span key={i}>
            {t} <span className="dot">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
