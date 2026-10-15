'use client';

import Reveal from './Reveal';
import { openCallbackModal } from './ShivaScholarship';

export default function ShivaFooter() {
  return (
    <footer>
      <div className="wrap">
        <Reveal>
          <div className="fgrid">
            <div>
              <h4>THE SHIVA</h4>
              <p style={{ fontSize: 14, color: '#9ca3af' }}>
                India ka affordable learning platform — SSC, Railway, Banking, Defence aur Teaching exams ke
                liye.
              </p>
              <p style={{ fontSize: 14, marginTop: 12 }}>
                🤔 <strong style={{ color: '#e5e7eb' }}>Sawaal hain?</strong>
                <br />
                <button className="flink" onClick={openCallbackModal} style={{ color: '#fbbf24', fontWeight: 700 }}>
                  Talk to a counsellor →
                </button>
              </p>
            </div>
            <div>
              <h4>Exams</h4>
              <a href="/#courses">SSC</a>
              <a href="/#courses">Railway</a>
              <a href="/#courses">Banking</a>
              <a href="/#courses">Defence</a>
              <a href="/#courses">Teaching</a>
            </div>
            <div>
              <h4>Company</h4>
              <a href="/#faculty">Our Faculty</a>
              <a href="/#results">Results</a>
              <a href="/#scholarship">Scholarship</a>
              <a href="/#app">Download App</a>
            </div>
            <div>
              <h4>Support</h4>
              <a href="/#faq">Help Center</a>
              <a href="/#demoCard">Book Free Demo</a>
              <button className="flink" onClick={openCallbackModal}>
                Contact Us
              </button>
              <a href="/#app">Download App</a>
            </div>
          </div>
        </Reveal>
        <div className="fbot">
          <span>© 2026 THE SHIVA. All rights reserved.</span>
          <span>Made with ❤️ in India</span>
        </div>
      </div>
    </footer>
  );
}
