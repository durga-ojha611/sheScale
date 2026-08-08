import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User } from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      {/* TOP NAVIGATION */}
      <nav className="dashboard-nav-top">
        <div className="nav-header">
          <h1 className="brand-logo">SHE<span>scale</span></h1>
        </div>

        <div className="nav-pill-container">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-item-pill active' : 'nav-item-pill')} end>
            Home
          </NavLink>
          
          <NavLink to="/about" className={({ isActive }) => (isActive ? 'nav-item-pill active' : 'nav-item-pill')}>
            About
          </NavLink>

          <NavLink to="/funding" className={({ isActive }) => (isActive ? 'nav-item-pill active' : 'nav-item-pill')}>
            Funding
          </NavLink>
          
          <NavLink to="/mentorship" className={({ isActive }) => (isActive ? 'nav-item-pill active' : 'nav-item-pill')}>
            Mentorship
          </NavLink>
          
          <NavLink to="/networking" className={({ isActive }) => (isActive ? 'nav-item-pill active' : 'nav-item-pill')}>
            Networking
          </NavLink>
        </div>

        <div className="nav-footer-top">
          <div className="user-profile-pill">
            <div className="avatar-small">
              {user?.profile?.businessName ? user.profile.businessName.charAt(0).toUpperCase() : <User size={14} />}
            </div>
            <span className="user-name-small">{user?.profile?.businessName || user?.email.split('@')[0]}</span>
          </div>
          <button className="logout-pill-btn" onClick={handleLogout} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </nav>

      {/* CENTER CANVAS */}
      <main className="dashboard-main">
        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
