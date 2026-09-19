import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Compass, Settings, Layers, LogOut, MessageSquare } from 'lucide-react';
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
          <NavLink to="/community">
            <MessageSquare size={19} />
            Community Doubts
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
          <Link to={`/u/${user?.handle || 'me'}`} className="sidebar-user-link" title="View Public Profile">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="avatar avatar-img" />
            ) : (
              <div className="avatar">{user?.name?.slice(0, 1)}</div>
            )}
            <span>
              {user?.name}
              <small>@{user?.handle || 'learner'} · {user?.role === 'admin' ? 'mentor' : 'founder'}</small>
            </span>
          </Link>
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
