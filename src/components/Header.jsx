import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Brand, Arrow } from './shared';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header className="site-header">
      <div className="wrap nav">
        <Brand />
        <nav className={open ? 'main-nav open' : 'main-nav'} aria-label="Main navigation">
          <NavLink to="/about">Meet Manmath</NavLink>
          <NavLink to="/courses">Our programmes</NavLink>
          <NavLink to="/community">Community</NavLink>
          <a href="/#method">The FAME approach</a>
        </nav>
        <div className="nav-actions">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {user.role === 'admin' && (
                <Link className="button small outline" to="/admin">
                  Owner dashboard
                </Link>
              )}
              <Link className="button small" to="/dashboard">
                My learning <Arrow />
              </Link>
            </div>
          ) : (
            <>
              <Link className="sign-in" to="/login">
                Sign in
              </Link>
              <Link className="button small" to="/courses">
                Explore courses <Arrow />
              </Link>
            </>
          )}
          <ThemeToggle />
          <button
            className="icon-button mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}
