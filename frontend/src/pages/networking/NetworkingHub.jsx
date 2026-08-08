import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Users, MapPin, HandCoins, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import CoFounderMatcher from './CoFounderMatcher';
import PitchFeed from './PitchFeed';
import SwipeMatch from './SwipeMatch';
import LocalEcosystem from './LocalEcosystem';
import MicroGrants from './MicroGrants';

const NetworkingHub = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname.split('/').pop();
  const activeTab = currentPath === 'networking' ? 'swipe' : currentPath;

  const handleTabChange = (tab) => {
    navigate(tab === 'swipe' ? '' : tab);
  };

  return (
    <div className="flex h-full w-full bg-surface">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white border-r border-purple-100 flex flex-col pt-8">
        <div className="px-6 mb-8">
          <h2 className="text-xl font-serif font-bold text-brand-primary">Networking</h2>
          <p className="text-sm text-gray-500 mt-1">Connect, Collaborate, Grow.</p>
        </div>

        <nav className="flex flex-col space-y-2 px-4">
          <button 
            onClick={() => handleTabChange('swipe')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${activeTab === 'swipe' ? 'bg-brand-primary text-white shadow-md' : 'text-gray-600 hover:bg-purple-50 hover:text-brand-primary'}`}
          >
            <Users size={18} />
            <span className="font-medium">Co-Founder Match</span>
          </button>
          
          <button 
            onClick={() => handleTabChange('pitches')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${activeTab === 'pitches' ? 'bg-brand-primary text-white shadow-md' : 'text-gray-600 hover:bg-purple-50 hover:text-brand-primary'}`}
          >
            <HandCoins size={18} />
            <span className="font-medium">Pitch Feed</span>
          </button>
          
          <button 
            onClick={() => handleTabChange('local')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${activeTab === 'local' ? 'bg-brand-primary text-white shadow-md' : 'text-gray-600 hover:bg-purple-50 hover:text-brand-primary'}`}
          >
            <MapPin size={18} />
            <span className="font-medium">Local Ecosystem</span>
          </button>

          <button 
            onClick={() => handleTabChange('grants')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${activeTab === 'grants' ? 'bg-brand-primary text-white shadow-md' : 'text-gray-600 hover:bg-purple-50 hover:text-brand-primary'}`}
          >
            <HandCoins size={18} />
            <span className="font-medium">Micro-Grants</span>
          </button>
        </nav>
        
        {/* Network Activity Mini-Widget */}
        <div className="mt-auto p-4">
          <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
            <h4 className="text-sm font-bold text-brand-primary mb-2">Network Activity</h4>
            <p className="text-xs text-gray-600 mb-3">You have 0 new matches. Start exploring!</p>
            <button className="w-full py-2 bg-white text-brand-primary text-xs font-medium rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors">
              View Profile
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto h-full flex flex-col">
          
          {/* Top Search Bar (Global for Networking) */}
          <div className="flex items-center gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search founders, mentors, skills or location..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-purple-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent text-gray-800"
              />
            </div>
            <button className="bg-white border border-purple-100 p-4 rounded-2xl shadow-sm text-brand-primary hover:bg-purple-50 transition-colors">
              <Filter size={20} />
            </button>
          </div>

          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1"
          >
            <Routes>
              <Route path="/" element={<CoFounderMatcher />} />
              <Route path="pitches" element={<PitchFeed />} />
              <Route path="local" element={<LocalEcosystem />} />
              <Route path="grants" element={<MicroGrants />} />
            </Routes>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default NetworkingHub;
