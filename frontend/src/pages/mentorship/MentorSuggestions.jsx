import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, Lock, Sparkles, Calendar } from 'lucide-react';
import api from '../../services/api';

const MentorSuggestions = ({ isUnlocked }) => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [domain, setDomain] = useState('');
  const [location, setLocation] = useState('');

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const res = await api.post('/mentorship/suggest-mentors', { domain, location });
      setMentors(res.data.recommendedMentors || []);
    } catch (err) {
      console.error('Failed to fetch mentors', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isUnlocked) {
      fetchMentors();
    }
  }, [isUnlocked, domain, location]);

  if (!isUnlocked) {
    return (
      <div className="absolute inset-0 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center z-10 rounded-3xl">
        <div className="w-16 h-16 bg-purple-100 text-brand-primary rounded-full flex items-center justify-center mb-4">
          <Lock size={32} />
        </div>
        <h4 className="text-xl font-bold text-gray-900 mb-2">Mentorship Locked</h4>
        <p className="text-gray-600 max-w-sm">Achieve a Readiness Score of 80 or higher using the Pitch Analyzer to unlock 1-on-1 sessions with industry experts.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Filter by Domain (e.g. Fintech)" 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          />
        </div>
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Filter by Location" 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
        </div>
      ) : mentors.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
          <Search size={32} className="mb-2 text-gray-300" />
          <p>No mentors found matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-2 pb-10">
          {mentors.map((mentor, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col hover:shadow-lg transition-shadow group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-brand-50 to-purple-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
              
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-100 to-brand-50 rounded-full flex items-center justify-center text-brand-700 font-bold text-lg">
                  {mentor.name.charAt(0)}
                </div>
                <span className="flex items-center gap-1 text-xs font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-md">
                  <Sparkles size={12} /> Expert
                </span>
              </div>
              
              <h4 className="font-bold text-gray-900 text-lg">{mentor.name}</h4>
              <p className="text-brand-600 text-sm font-medium mb-3">{mentor.expertise}</p>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                <span className="flex items-center gap-1"><MapPin size={14}/> {mentor.location}</span>
              </div>
              
              <button className="mt-auto w-full py-2.5 bg-gray-50 text-brand-700 font-bold rounded-xl border border-gray-100 group-hover:bg-brand-600 group-hover:text-white transition-colors flex items-center justify-center gap-2">
                <Calendar size={16} /> Book Session
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MentorSuggestions;
