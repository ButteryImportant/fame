import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Compass, Settings, Layers, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Brand } from './shared';
import { ThemeToggle } from './ThemeToggle';

export function StudentLayout({ children }) {
  const { user, logout } = useAuth();
  return (
    <div className="student-layout">
      <aside className="student-sidebar">
        <Brand />
        <div className="sidebar-label">YOUR LEARNING SPACE</div>
        <nav>
          <NavLink to="/dashboard">
            <LayoutDashboard size={19} />
            Overview
          </NavLink>
          <NavLink to="/courses">
            <Compass size={19} />
            Explore programmes
          </NavLink>
          <NavLink to="/account">
            <Settings size={19} />
            My account
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin">
              <Layers size={19} />
              Owner dashboard
            </NavLink>
          )}
        </nav>
        <div className="sidebar-bottom">
          <div className="avatar">{user?.name?.slice(0, 1)}</div>
          <span>
            {user?.name}
            <small>FAME {user?.role === 'admin' ? 'owner' : 'learner'}</small>
          </span>
          <button className="icon-button" onClick={logout} aria-label="Sign out">
            <LogOut size={18} />
          </button>
        </div>
      </aside>
      <main id="main" className="student-main">
        <div className="student-top-bar">
          <ThemeToggle />
        </div>
        {children}
      </main>
    </div>
  );
}
