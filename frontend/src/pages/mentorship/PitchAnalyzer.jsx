import React, { useState } from 'react';
import { Target, CheckCircle2, AlertTriangle, Lightbulb, Play, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const PitchAnalyzer = () => {
  const { user } = useAuth();
  const [pitchText, setPitchText] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleEvaluate = async () => {
    if (!pitchText.trim()) return;
    setIsEvaluating(true);
    setError('');
    setResult(null);

    try {
      const response = await api.post('/mentorship/analyze-pitch', {
        pitchText,
        userId: user?._id
      });
      
      setResult(response.data);
    } catch (err) {
      console.error('Error analyzing pitch:', err);
      setError('Failed to analyze pitch. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] p-8 lg:p-12 border border-purple-100 shadow-xl shadow-brand-500/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-100 to-brand-50 border border-brand-200 text-brand-600 rounded-2xl flex items-center justify-center shadow-sm">
            <Target size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">AI Pitch Analyzer</h2>
            <p className="text-gray-500 text-sm mt-1">Get instant feedback on your startup pitch from our AI VC.</p>
          </div>
        </div>

        {!result ? (
          <div className="flex flex-col gap-6">
            <textarea
              className="w-full h-48 p-6 rounded-2xl border-2 border-gray-100 bg-gray-50/50 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-500/10 transition-all outline-none resize-none text-gray-800 text-lg"
              placeholder="Paste your 1-minute elevator pitch or funding ask here..."
              value={pitchText}
              onChange={(e) => setPitchText(e.target.value)}
            />
            
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3">
                <AlertTriangle size={20} /> {error}
              </div>
            )}

            <button 
              onClick={handleEvaluate} 
              disabled={!pitchText.trim() || isEvaluating}
              className="self-end bg-gradient-to-r from-brand-600 to-purple-600 text-white px-8 py-3.5 rounded-xl font-bold text-lg hover:from-brand-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg shadow-brand-500/30 flex items-center gap-2"
            >
              {isEvaluating ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} />}
              {isEvaluating ? 'Analyzing...' : 'Analyze Pitch'}
            </button>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-8"
          >
            {/* Scores Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-surface p-6 rounded-2xl border border-brand-100 text-center">
                <p className="text-gray-500 font-semibold mb-2">Overall Score</p>
                <p className="text-5xl font-black text-brand-600">{result.pitchScore}<span className="text-xl text-gray-400">/100</span></p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center shadow-sm">
                <p className="text-gray-500 font-semibold mb-2">Clarity</p>
                <p className="text-4xl font-extrabold text-gray-800">{result.clarityScore}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center shadow-sm">
                <p className="text-gray-500 font-semibold mb-2">Market Fit</p>
                <p className="text-4xl font-extrabold text-gray-800">{result.marketScore}</p>
              </div>
            </div>

            {/* Funding Readiness */}
            <div className="flex items-center gap-4 bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <span className="font-bold text-gray-700">Funding Readiness:</span>
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                result.fundingReadiness.toLowerCase() === 'high' ? 'bg-green-100 text-green-700' :
                result.fundingReadiness.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {result.fundingReadiness.toUpperCase()}
              </span>
            </div>

            {/* Analysis Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><CheckCircle2 className="text-green-500" size={20} /> Strengths</h4>
                <ul className="space-y-3">
                  {result.strengths?.map((item, i) => (
                    <li key={i} className="flex gap-3 text-gray-600 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                      <span className="text-green-500 mt-0.5">•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><AlertTriangle className="text-orange-500" size={20} /> Weaknesses</h4>
                <ul className="space-y-3">
                  {result.weaknesses?.map((item, i) => (
                    <li key={i} className="flex gap-3 text-gray-600 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                      <span className="text-orange-500 mt-0.5">•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Suggestions */}
            <div className="bg-brand-50 p-6 rounded-2xl border border-brand-100">
              <h4 className="text-lg font-bold text-brand-900 mb-4 flex items-center gap-2"><Lightbulb className="text-brand-600" size={20} /> Key Suggestions</h4>
              <ul className="space-y-3">
                {result.suggestions?.map((item, i) => (
                  <li key={i} className="flex gap-3 text-brand-800">
                    <span className="text-brand-500 mt-0.5">→</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            <button 
              onClick={() => setResult(null)}
              className="self-center mt-4 text-brand-600 font-bold hover:underline"
            >
              Analyze Another Pitch
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PitchAnalyzer;
