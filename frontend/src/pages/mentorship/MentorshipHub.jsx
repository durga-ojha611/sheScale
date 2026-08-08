import React, { useState, useEffect } from 'react';
import { Target, Bot, Calendar, ArrowRight, Lock, Users, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import PitchAnalyzer from './PitchAnalyzer';
import MentorSuggestions from './MentorSuggestions';
import AITwinChat from './AITwinChat';
import api from '../../services/api';

const MentorshipHub = () => {
  const { user, refreshUser } = useAuth();
  const [showPitchSimulator, setShowPitchSimulator] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);
  const [readinessData, setReadinessData] = useState(null);
  
  const isUnlocked = readinessData?.overallScore >= 80;
  const score = readinessData?.overallScore || 0;

  useEffect(() => {
    const fetchReadiness = async () => {
      if (!user?._id) return;
      try {
        const res = await api.get(`/mentorship/readiness/${user._id}`);
        setReadinessData(res.data);
      } catch (err) {
        console.error('Failed to fetch readiness score:', err);
      }
    };
    fetchReadiness();
  }, [user]);

  return (
    <div className="w-full h-full bg-surface overflow-y-auto">
      <div className="max-w-6xl mx-auto p-8 flex flex-col gap-10">
        
        {/* Header Section */}
        <div>
          <h1 className="text-3xl font-serif font-bold text-brand-primary">Mentorship & Upskilling</h1>
          <p className="text-gray-600 mt-2">Level up your entrepreneurial skills with our AI tools and top industry experts.</p>
        </div>

        {/* Hero inside page: Mock Pitch Simulator CTA */}
        <motion.div 
          className="bg-white rounded-3xl p-8 md:p-12 border border-purple-100 shadow-sm relative overflow-hidden"
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.3 }}
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 max-w-2xl">
            <div className="w-16 h-16 bg-purple-100 text-brand-primary rounded-2xl flex items-center justify-center mb-6">
              <Target size={32} />
            </div>
            <h2 className="text-3xl font-serif font-bold text-brand-primary mb-4">
              Nail Your Pitch. Unlock Funding.
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Before you step into a VC room, practice with our strict AI evaluator. We assess your clarity, financial viability, and market fit. Score 80+ to unlock 1-on-1 sessions with human industry leaders.
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
              <button 
                onClick={() => setShowPitchSimulator(!showPitchSimulator)}
                className="bg-brand-primary text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:bg-accent transition-colors shadow-sm"
              >
                {showPitchSimulator ? 'Close Pitch Analyzer' : 'Start Pitch Analyzer'} <ArrowRight size={18} />
              </button>
              
              <button 
                onClick={() => setShowAiChat(!showAiChat)}
                className="bg-white text-brand-primary border border-purple-200 px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:bg-purple-50 transition-colors shadow-sm"
              >
                <Bot size={18} /> Chat with AI Twin
              </button>
            </div>
          </div>
        </motion.div>

        {showAiChat && (
          <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden h-[600px]">
             <AITwinChat />
          </div>
        )}

        {showPitchSimulator && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
             <PitchAnalyzer />
          </motion.div>
        )}

        {/* Readiness Dashboard & Mentors */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Readiness Matrix */}
          <div className="lg:col-span-1 flex flex-col gap-8">
            <div className="bg-white rounded-3xl p-8 border border-purple-100 shadow-sm flex flex-col items-center justify-center">
              <h3 className="text-xl font-serif font-bold text-brand-primary mb-6 self-start">Readiness Score</h3>
              
              <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#F1F5F9" strokeWidth="8" fill="none" />
                  <motion.circle 
                    cx="50" cy="50" r="40" 
                    stroke={score >= 80 ? '#16A34A' : '#EA580C'} 
                    strokeWidth="8" 
                    fill="none" 
                    strokeDasharray="251.2"
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{ strokeDashoffset: 251.2 - (251.2 * score) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-4xl font-bold ${score >= 80 ? 'text-green-600' : 'text-orange-600'}`}>{score}</span>
                  <span className="text-xs text-gray-500 font-medium">/ 100</span>
                </div>
              </div>
              
              <p className="text-center text-gray-600 font-medium mb-4">
                {score >= 80 
                  ? "Incredible! You've unlocked expert mentorship." 
                  : "Keep practicing! You need 80+ to unlock mentors."}
              </p>

              {/* Breakdown */}
              {readinessData && (
                <div className="w-full space-y-3 mt-4 border-t border-gray-100 pt-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Idea Clarity</span>
                    <span className="font-bold text-gray-800">{readinessData.breakdown.ideaClarity}%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Financial Readiness</span>
                    <span className="font-bold text-gray-800">{readinessData.breakdown.financialReadiness}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Mentors List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-8 border border-purple-100 shadow-sm h-full relative overflow-hidden">
              <h3 className="text-xl font-serif font-bold text-brand-primary mb-6 flex items-center gap-2">
                <Users size={20} /> AI Suggested Mentors
              </h3>
              
              <MentorSuggestions isUnlocked={isUnlocked} />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default MentorshipHub;
