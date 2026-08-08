import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { User, Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import DashboardOverview from './DashboardOverview';
import SecuritySettings from './SecuritySettings';

const ProfileLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname.split('/').pop();
  const activeTab = currentPath === 'profile' ? 'overview' : currentPath;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-full w-full bg-surface">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white border-r border-purple-100 flex flex-col pt-8">
        <div className="px-6 mb-8 flex flex-col items-center">
          <div className="w-20 h-20 bg-purple-100 text-brand-primary rounded-full flex items-center justify-center mb-4 overflow-hidden border-2 border-brand-primary/20">
            {user?.profile?.avatarUrl ? (
              <img src={user.profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={40} />
            )}
          </div>
          <h2 className="text-xl font-serif font-bold text-gray-900 text-center">{user?.name || 'Founder'}</h2>
          <p className="text-sm text-gray-500 mt-1 text-center truncate w-full px-4">{user?.email}</p>
        </div>

        <nav className="flex flex-col space-y-2 px-4 flex-1">
          <button 
            onClick={() => navigate('/profile')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${activeTab === 'overview' ? 'bg-brand-primary text-white shadow-md' : 'text-gray-600 hover:bg-purple-50 hover:text-brand-primary'}`}
          >
            <User size={18} />
            <span className="font-medium">Overview</span>
          </button>
          
          <button 
            onClick={() => navigate('/profile/settings')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${activeTab === 'settings' ? 'bg-brand-primary text-white shadow-md' : 'text-gray-600 hover:bg-purple-50 hover:text-brand-primary'}`}
          >
            <Settings size={18} />
            <span className="font-medium">Settings</span>
          </button>
        </nav>

        <div className="p-4 mt-auto">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left text-red-600 hover:bg-red-50 w-full"
          >
            <LogOut size={18} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8 relative">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-4xl mx-auto h-full"
        >
          <Routes>
            <Route path="/" element={<DashboardOverview />} />
            <Route path="settings" element={<SecuritySettings />} />
          </Routes>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileLayout;
