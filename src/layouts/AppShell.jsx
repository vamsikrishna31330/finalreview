import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useUI } from '../hooks/useUI.js';
import TopBarNotifications from '../components/navigation/TopBarNotifications.jsx';
import './AppShell.css';

const AppShell = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { notifications } = useUI();

  const links = [
    { to: '/dashboard/admin', label: 'Admin', roles: ['admin'] },
    { to: '/dashboard/farmer', label: 'Farmer', roles: ['farmer', 'admin'] },
    { to: '/dashboard/expert', label: 'Expert', roles: ['expert', 'admin'] },
    { to: '/dashboard/public', label: 'Public', roles: ['public', 'admin', 'farmer', 'expert'] },
    { to: '/resources', label: 'Resources', roles: ['admin', 'farmer', 'expert', 'public'] },
    { to: '/forums', label: 'Forums', roles: ['admin', 'farmer', 'expert', 'public'] },
    { to: '/events', label: 'Events', roles: ['admin', 'farmer', 'expert', 'public'] },
    { to: '/connections', label: 'Connections', roles: ['admin', 'farmer'] },
    { to: '/sectors', label: 'Sectors', roles: ['admin', 'farmer', 'expert'] },
    { to: '/notifications', label: 'Notifications', roles: ['admin', 'farmer', 'expert', 'public'] },
    { to: '/admin/users', label: 'User Management', roles: ['admin'] },
    { to: '/admin/console', label: 'SQL Console', roles: ['admin'] }
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="logo" onClick={() => navigate('/')} role="presentation">
          🌾 <span>AgriConnect</span>
        </div>
        <nav>
          {links
            .filter((link) => link.roles.includes(user.role))
            .map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                {link.label}
              </NavLink>
            ))}
        </nav>
      </aside>
      <div className="main">
        <header className="topbar">
          <div className="topbar-left">
          </div>
          <div className="top-actions">
            <TopBarNotifications notifications={notifications} />
            <div className="profile-chip" onClick={() => navigate('/dashboard/user')} role="presentation">
              <span className="avatar">{user?.name?.[0]?.toUpperCase()}</span>
              <div>
                <strong>{user?.name}</strong>
                <small>{user?.role}</small>
              </div>
            </div>
            <button type="button" className="ghost" onClick={logout}>
              Log out
            </button>
          </div>
        </header>
        <main className="content" data-path={location.pathname}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppShell;
