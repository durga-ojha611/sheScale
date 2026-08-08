import React, { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, Send, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const PitchFeed = () => {
  const { user } = useAuth();
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');
  const [budget, setBudget] = useState('');
  const [stage, setStage] = useState('idea');

  const fetchPitches = async () => {
    try {
      const res = await api.get('/networking/pitches');
      setPitches(res.data.pitches || []);
    } catch (err) {
      console.error('Failed to fetch pitches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPitches();
  }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!title || !problem || !solution || !budget) return;
    
    setIsPosting(true);
    try {
      await api.post('/networking/create-pitch', {
        userId: user?._id || 'anonymous',
        title,
        problem,
        solution,
        budget: Number(budget),
        stage
      });
      
      // Reset form
      setTitle(''); setProblem(''); setSolution(''); setBudget(''); setStage('idea');
      // Refresh feed
      fetchPitches();
    } catch (err) {
      console.error('Failed to post pitch:', err);
      alert('Error posting pitch');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      {/* Left: Feed */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-4 pb-10">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="text-brand-500" /> Community Pitch Feed
        </h2>
        
        {loading ? (
          <div className="flex justify-center p-10"><Loader2 className="animate-spin text-brand-500" size={32} /></div>
        ) : pitches.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center text-gray-500">
            No pitches yet. Be the first to share your idea!
          </div>
        ) : (
          pitches.map((pitch) => (
            <div key={pitch.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-brand-900">{pitch.title}</h3>
                  <span className="inline-block mt-2 px-3 py-1 bg-brand-50 text-brand-700 text-xs font-bold rounded-md uppercase tracking-wide">
                    Stage: {pitch.stage}
                  </span>
                </div>
                <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  ₹{pitch.budget.toLocaleString()}
                </span>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-1">The Problem:</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{pitch.problem}</p>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-1">The Solution:</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{pitch.solution}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
                <button className="flex items-center gap-2 text-gray-400 hover:text-brand-500 transition-colors text-sm font-medium">
                  <ThumbsUp size={16} /> Support
                </button>
                <button className="flex items-center gap-2 text-gray-400 hover:text-brand-500 transition-colors text-sm font-medium">
                  <MessageSquare size={16} /> Discuss
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Right: Post Form */}
      <div className="w-full lg:w-[400px] shrink-0">
        <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm sticky top-0">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Share Your Pitch</h3>
          
          <form onSubmit={handlePost} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Project Title</label>
              <input required value={title} onChange={e=>setTitle(e.target.value)} type="text" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none" placeholder="e.g. Eco-friendly Packaging" />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">The Problem</label>
              <textarea required value={problem} onChange={e=>setProblem(e.target.value)} rows={3} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none" placeholder="What problem are you solving?" />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">The Solution</label>
              <textarea required value={solution} onChange={e=>setSolution(e.target.value)} rows={3} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none" placeholder="How does your product fix it?" />
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Budget (₹)</label>
                <input required value={budget} onChange={e=>setBudget(e.target.value)} type="number" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none" placeholder="100000" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Stage</label>
                <select value={stage} onChange={e=>setStage(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none">
                  <option value="idea">Idea</option>
                  <option value="prototype">Prototype</option>
                  <option value="revenue">Revenue</option>
                </select>
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={isPosting}
              className="w-full mt-4 bg-brand-600 text-white font-bold py-3 rounded-xl hover:bg-brand-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isPosting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              Post to Feed
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PitchFeed;
