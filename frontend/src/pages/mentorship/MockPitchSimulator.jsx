import React, { useState } from 'react';
import { Target, CheckCircle2, AlertTriangle, Play } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import './Mentorship.css';

const MockPitchSimulator = ({ onUnlock }) => {
  const { user } = useAuth();
  const [pitchText, setPitchText] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState(null);

  const handleEvaluate = async () => {
    if (!pitchText.trim()) return;
    setIsEvaluating(true);
    try {
      const response = await api.post('/mentor/evaluate-pitch', {
        pitchText,
        businessIdea: user?.businessDetails?.businessIdea || ''
      });
      
      const evalData = response.data.data.evaluation;
      setResult(evalData);
      
      if (response.data.data.isMentorBookingUnlocked) {
        onUnlock(); // Notify parent to update the lock state
      }
    } catch (error) {
      console.error('Error evaluating pitch:', error);
      alert('Failed to evaluate pitch. Try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="pitch-container">
      {/* Input Section */}
      <div className="pitch-input-section">
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Target size={20} className="text-accent" />
          Mock Pitch Simulator
        </h3>
        <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Paste your 1-minute elevator pitch or funding ask here. Our AI (acting as a strict VC) will evaluate it. Score 80+ to unlock human mentors!
        </p>
        
        <textarea
          className="pitch-textarea"
          placeholder="Hi, I am [Name], founder of [Business]. We are solving [Problem] by [Solution]..."
          value={pitchText}
          onChange={(e) => setPitchText(e.target.value)}
        />
        
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="primary" 
            onClick={handleEvaluate} 
            disabled={!pitchText.trim() || isEvaluating}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {isEvaluating ? 'Evaluating...' : <><Play size={16} /> Evaluate Pitch</>}
          </Button>
        </div>
      </div>

      {/* Result Section */}
      <div className="pitch-result-section">
        {!result && !isEvaluating && (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
            Submit a pitch to see your Readiness Matrix.
          </div>
        )}
        
        {isEvaluating && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
            <div className="spinner" style={{ marginBottom: '1rem' }}></div>
            <p>Analyzing clarity, financials, and market fit...</p>
          </div>
        )}

        {result && !isEvaluating && (
          <div className="fade-in">
            <h3 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Pitch Readiness Score</h3>
            
            <div className={`circular-score ${result.score >= 80 ? 'pass' : 'fail'}`}>
              {result.score}
            </div>
            
            {result.score >= 80 ? (
              <div style={{ textAlign: 'center', color: '#4CAF50', fontWeight: 600, marginBottom: '2rem' }}>
                🎉 Excellent! You have unlocked Mentor Booking!
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#F50A70', fontWeight: 600, marginBottom: '2rem' }}>
                Aim for 80+ to unlock 1-on-1 Mentorship.
              </div>
            )}

            <div className="readiness-matrix">
              <div className="matrix-bar-container">
                <div className="matrix-label">
                  <span>Clarity & Vision</span>
                  <span>{result.matrix.clarity}/100</span>
                </div>
                <div className="matrix-bar-bg">
                  <div className="matrix-bar-fill" style={{ width: `${result.matrix.clarity}%` }}></div>
                </div>
              </div>
              
              <div className="matrix-bar-container">
                <div className="matrix-label">
                  <span>Financial Viability</span>
                  <span>{result.matrix.financials}/100</span>
                </div>
                <div className="matrix-bar-bg">
                  <div className="matrix-bar-fill" style={{ width: `${result.matrix.financials}%` }}></div>
                </div>
              </div>

              <div className="matrix-bar-container">
                <div className="matrix-label">
                  <span>Market Fit</span>
                  <span>{result.matrix.marketFit}/100</span>
                </div>
                <div className="matrix-bar-bg">
                  <div className="matrix-bar-fill" style={{ width: `${result.matrix.marketFit}%` }}></div>
                </div>
              </div>
            </div>

            <div className="feedback-lists">
              <div className="feedback-list">
                <h4 style={{ color: '#2E7D32' }}><CheckCircle2 size={16} /> Strengths</h4>
                <ul>
                  {result.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              <div className="feedback-list">
                <h4 style={{ color: '#C62828' }}><AlertTriangle size={16} /> Needs Work</h4>
                <ul>
                  {result.improvements.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MockPitchSimulator;
