import React, { useState } from 'react';
import { Users, Search, Target, Zap, Loader2, Sparkles, MapPin } from 'lucide-react';
import api from '../../services/api';

const CoFounderMatcher = () => {
  const [skills, setSkills] = useState('');
  const [needs, setNeeds] = useState('');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleMatch = async (e) => {
    e.preventDefault();
    if (!needs) return;

    setLoading(true);
    setSearched(true);
    
    // Convert comma separated strings to arrays
    const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
    const needsArray = needs.split(',').map(s => s.trim()).filter(Boolean);

    try {
      const res = await api.post('/networking/match', {
        skills: skillsArray,
        needs: needsArray
      });
      setMatches(res.data.matches || []);
    } catch (err) {
      console.error('Failed to find matches:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      {/* Left: Input Form */}
      <div className="w-full lg:w-[450px] shrink-0">
        <div className="bg-white p-8 rounded-[2rem] border border-purple-100 shadow-xl shadow-brand-500/5 sticky top-0">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-100 to-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mb-6">
            <Users size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Find a Co-Founder</h2>
          <p className="text-gray-500 text-sm mb-8">Enter the skills you have and the skills you are looking for in a co-founder.</p>
          
          <form onSubmit={handleMatch} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">My Skills (What I bring)</label>
              <input 
                value={skills} 
                onChange={e=>setSkills(e.target.value)} 
                type="text" 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none" 
                placeholder="e.g. Marketing, Sales, Design" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Co-Founder Needs (What I lack) <span className="text-red-500">*</span></label>
              <input 
                required 
                value={needs} 
                onChange={e=>setNeeds(e.target.value)} 
                type="text" 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none" 
                placeholder="e.g. Engineering, Finance, Legal" 
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading || !needs.trim()}
              className="w-full bg-gradient-to-r from-brand-600 to-purple-600 text-white font-bold py-3.5 rounded-xl hover:from-brand-700 hover:to-purple-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
              Find Matches
            </button>
          </form>
        </div>
      </div>

      {/* Right: Results */}
      <div className="flex-1 overflow-y-auto pr-4 pb-10">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-4 text-brand-600">
            <Loader2 className="animate-spin" size={40} />
            <p className="font-bold">Analyzing profiles...</p>
          </div>
        ) : searched && matches.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 bg-white rounded-3xl border border-gray-100 p-10 text-center">
            <Target size={48} className="text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No exact matches yet</h3>
            <p className="max-w-md">We couldn't find a perfect match for those specific skills. Try broadening your needs (e.g., use "Marketing" instead of "B2B SaaS Content Marketing").</p>
          </div>
        ) : !searched ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-3xl border border-dashed border-gray-200 p-10 text-center">
            <Sparkles size={48} className="text-brand-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">AI Matchmaking</h3>
            <p className="max-w-md">Our algorithm analyzes thousands of profiles to find the perfect complementary partner for your startup journey.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Top Matches ({matches.length})</h3>
            {matches.map((match, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-brand-300 transition-colors">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-brand-100 to-brand-50 rounded-full flex items-center justify-center text-brand-700 font-bold text-xl">
                      {match.name.charAt(0)}
                    </div>
                    {match.matchScore >= 80 && (
                      <div className="absolute -top-1 -right-1 bg-yellow-400 text-white rounded-full p-1 shadow-sm">
                        <Zap size={12} className="fill-current" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                      {match.name}
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 border border-brand-100">
                        {match.matchScore}% Match
                      </span>
                    </h4>
                    <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                      <MapPin size={14} /> {match.location || 'Remote'} {match.domain && `• ${match.domain}`}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {match.skills.slice(0, 4).map((s, i) => (
                        <span key={i} className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                          {s}
                        </span>
                      ))}
                      {match.skills.length > 4 && <span className="text-xs text-gray-400">+{match.skills.length - 4} more</span>}
                    </div>
                  </div>
                </div>
                <button className="bg-white text-brand-600 font-bold px-5 py-2.5 rounded-xl border border-gray-200 hover:bg-brand-50 hover:border-brand-200 transition-all">
                  Connect
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoFounderMatcher;
