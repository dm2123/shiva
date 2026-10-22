import Reveal from './Reveal';

export default function ShivaResults() {
  return (
    <section id="results">
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="kicker">Results</span>
          <h2>Selection — Hamara Ek Hi Lakshya</h2>
          <p>Yahan sirf asli students ki asli success stories aayengi — jab pehle results aayenge, tabhi. Tab tak koi nakli topper nahi.</p>
        </Reveal>
        <Reveal>
          <div className="toppers">
            <div className="topper">
              <div className="medal">🎯</div>
              <b>Agla Naam Aapka Ho Sakta Hai</b>
              <span>Free demo class lo — taiyaari aaj se shuru karo</span>
            </div>
            <div className="topper">
              <div className="medal">📚</div>
              <b>Poora System, Ek Hi Platform</b>
              <span>Live classes • Test series • Doubt solving</span>
            </div>
            <div className="topper">
              <div className="medal">🏆</div>
              <b>Scholarship Test Se Shuruaat</b>
              <span>
                Fee me chhoot ka mauka — <a href="/#scholarship">details dekho</a>
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
