import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, ChevronDown, Sparkles, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navLinks = [
  { name: 'Home',       path: '/' },
  { name: 'About',      path: '/about' },
  { name: 'Funding',    path: '/funding' },
  { name: 'Mentorship', path: '/mentorship' },
  { name: 'Networking', path: '/networking' },
];

const GlobalNavbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  // Detect scroll for navbar elevation
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsProfileDropdownOpen(false);
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <>
      {/* ── Main Navbar ─────────────────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-xl shadow-[0_1px_30px_-5px_rgba(124,58,237,0.15)] border-b border-purple-100'
            : 'bg-white/70 backdrop-blur-md border-b border-purple-50'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">

            {/* Logo */}
            <div
              className="flex-shrink-0 flex items-center gap-2 cursor-pointer group"
              onClick={() => navigate('/')}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-brand-600 to-brand-400 rounded-lg flex items-center justify-center shadow-purple-sm group-hover:shadow-purple-glow transition-all duration-300">
                <Sparkles size={16} className="text-white" />
              </div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-brand-700 to-brand-500 bg-clip-text text-transparent tracking-tight">
                SHEscale
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1 relative">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path || 
                  (link.path !== '/' && location.pathname.startsWith(link.path));
                return (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'text-brand-700 bg-brand-50'
                        : 'text-gray-500 hover:text-brand-700 hover:bg-brand-50'
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <motion.div
                        layoutId="navPill"
                        className="absolute inset-0 bg-brand-50 rounded-full -z-10"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                  </NavLink>
                );
              })}
            </div>

            {/* Auth Actions (Desktop) */}
            <div className="hidden md:flex items-center gap-3">
              {!isAuthenticated ? (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="text-gray-600 hover:text-brand-700 font-semibold text-sm px-4 py-2 rounded-full hover:bg-brand-50 transition-all duration-200"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="btn-primary text-sm px-5 py-2.5"
                  >
                    Get Started Free
                  </button>
                </>
              ) : (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-purple-100 bg-brand-50 hover:bg-brand-100 hover:border-brand-200 transition-all duration-200"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-brand-400 flex items-center justify-center text-white text-xs font-bold shadow-sm overflow-hidden">
                      {user?.profile?.avatarUrl
                        ? <img src={user.profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        : initials
                      }
                    </div>
                    <span className="text-sm font-semibold text-brand-700 max-w-[90px] truncate">
                      {user?.name || user?.email?.split('@')[0]}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-brand-500 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -8 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-[0_20px_60px_-10px_rgba(124,58,237,0.2)] border border-purple-100 overflow-hidden z-50"
                      >
                        <div className="px-4 py-3 bg-gradient-to-r from-brand-50 to-lavender-100 border-b border-purple-100">
                          <p className="text-sm font-bold text-brand-800 truncate">{user?.name || 'Welcome!'}</p>
                          <p className="text-xs text-brand-500 truncate">{user?.email}</p>
                        </div>
                        {[
                          { icon: LayoutDashboard, label: 'Dashboard', action: () => { navigate('/profile'); setIsProfileDropdownOpen(false); } },
                          { icon: Settings, label: 'Settings', action: () => { navigate('/profile/settings'); setIsProfileDropdownOpen(false); } },
                        ].map(item => (
                          <button
                            key={item.label}
                            onClick={item.action}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                          >
                            <item.icon size={15} className="text-brand-400" />
                            {item.label}
                          </button>
                        ))}
                        <div className="border-t border-purple-50 my-1" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={15} />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Mobile Hamburger */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl text-gray-500 hover:text-brand-700 hover:bg-brand-50 transition-all duration-200"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile Overlay ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Mobile Drawer ───────────────────────────────────────────────────── */}
      <motion.div
        className="fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-2xl md:hidden flex flex-col"
        initial={{ x: '100%' }}
        animate={{ x: isMobileMenuOpen ? 0 : '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 250 }}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-purple-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-brand rounded-lg flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="text-lg font-extrabold gradient-text">SHEscale</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-xl text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav links */}
        <div className="flex flex-col px-4 pt-4 space-y-1 flex-1 overflow-y-auto">
          {navLinks.map((link, i) => {
            const isActive = location.pathname === link.path ||
              (link.path !== '/' && location.pathname.startsWith(link.path));
            return (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <NavLink
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 border border-brand-100'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-brand-600'
                  }`}
                >
                  {link.name}
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500" />}
                </NavLink>
              </motion.div>
            );
          })}
        </div>

        {/* Auth section */}
        <div className="px-4 pb-6 pt-4 border-t border-purple-50 space-y-3">
          {!isAuthenticated ? (
            <>
              <button
                onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}
                className="w-full btn-ghost text-sm py-3"
              >
                Sign In
              </button>
              <button
                onClick={() => { navigate('/signup'); setIsMobileMenuOpen(false); }}
                className="w-full btn-primary text-sm py-3"
              >
                Get Started Free
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 px-3 py-3 bg-brand-50 rounded-xl border border-brand-100">
                <div className="w-9 h-9 rounded-full bg-gradient-brand flex items-center justify-center text-white text-sm font-bold">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-brand-800 truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-brand-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button onClick={() => { navigate('/profile'); setIsMobileMenuOpen(false); }} className="w-full btn-ghost text-sm py-2.5">Dashboard</button>
              <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full text-red-500 border border-red-200 hover:bg-red-50 rounded-full py-2.5 text-sm font-semibold transition-all">Sign Out</button>
            </>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default GlobalNavbar;
