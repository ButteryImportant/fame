import { Link } from 'react-router-dom';
import { Brand } from './shared';

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-main">
          <div>
            <Brand />
            <p>
              Future Ready Agro Food
              <br />
              Entrepreneurship Community.
            </p>
          </div>
          <div>
            <h4>Build with FAME</h4>
            <Link to="/courses">Explore programmes</Link>
            <Link to="/about">Meet your mentor</Link>
            <Link to="/dashboard">My learning</Link>
          </div>
          <div>
            <h4>Here to help</h4>
            <Link to="/contact">Contact &amp; support</Link>
            <Link to="/privacy">Privacy policy</Link>
            <Link to="/terms">Terms of use</Link>
            <Link to="/refunds">Refund policy</Link>
          </div>
          <div className="footer-note">
            Ideas deserve
            <br />
            <em>a clear way forward.</em>
            <p>Made for India's food &amp; agro entrepreneurs.</p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} FAME · Manmath Biradar</span>
          <span>Start. Set up. Scale.</span>
        </div>
      </div>
    </footer>
  );
}
