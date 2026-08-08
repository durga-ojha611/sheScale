import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Mic, MicOff, Square, Play, Award, Target, BookOpen } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import './Mentorship.css';

const MockInterview = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  
  const scoreMutation = useMutation({
    mutationFn: async () => {
      // In a real app, this would post the audio blob or end the WebRTC session
      // For MVP, we simulate ending the session and fetching the score
      const { data } = await api.post('/mentorship/interviews', {
        type: 'vc_pitch',
        audioTranscript: "Simulated transcript from the browser's WebRTC session."
      });
      return data.data; // The Readiness Score Matrix
    },
    onSuccess: () => {
      setSessionCompleted(true);
      setIsRecording(false);
    }
  });

  const toggleRecording = () => {
    if (isRecording) {
      scoreMutation.mutate();
    } else {
      setIsRecording(true);
      setSessionCompleted(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="funding-header">
        <h2 className="funding-title">AI Mock Interview</h2>
        <p className="funding-subtitle">Practice your bank loan or VC pitch with Gemini Live Voice.</p>
      </div>

      <Card style={{ marginBottom: '2rem' }}>
        <CardContent style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <div className="interview-visualizer" style={{ width: '100%', maxWidth: '600px', backgroundColor: isRecording ? '#0f172a' : '#1e293b' }}>
            {isRecording ? (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="wave" style={{ animationDelay: `${i * 0.1}s` }}></div>
                ))}
              </div>
            ) : (
              <div style={{ color: 'var(--text-tertiary)' }}>
                <Mic size={48} style={{ opacity: 0.5 }} />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <Button 
              size="lg" 
              variant={isRecording ? 'error' : 'primary'}
              onClick={toggleRecording}
              isLoading={scoreMutation.isPending}
              style={{ width: '200px' }}
            >
              {isRecording ? (
                <><Square size={18} fill="currentColor" /> End Session</>
              ) : (
                <><Play size={18} fill="currentColor" /> Start Pitch</>
              )}
            </Button>
          </div>
          
          {isRecording && (
            <p className="text-secondary text-sm" style={{ marginTop: '1rem' }}>
              Recording in progress... Speak clearly.
            </p>
          )}

          {scoreMutation.isError && (
            <div className="copilot-alert" style={{ backgroundColor: 'var(--error-light)', color: 'var(--error)', marginTop: '1rem' }}>
              {scoreMutation.error.response?.data?.message || 'Failed to process interview.'}
            </div>
          )}
        </CardContent>
      </Card>

      {sessionCompleted && scoreMutation.data && (
        <div className="fade-in">
          <h3 style={{ marginBottom: '1.5rem' }}>Readiness Score Matrix</h3>
          
          <div className="score-matrix">
            <Card className="score-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                <Award size={20} />
                <span className="font-medium">Overall Score</span>
              </div>
              <div className="score-value">{scoreMutation.data.overallScore}/100</div>
              <p className="text-sm text-secondary">Based on clarity, financials, and confidence.</p>
            </Card>

            <Card className="score-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                <Target size={20} />
                <span className="font-medium">Key Strengths</span>
              </div>
              <ul style={{ paddingLeft: '1.5rem', margin: 0, fontSize: '0.875rem' }}>
                {scoreMutation.data.strengths.map((str, idx) => (
                  <li key={idx} style={{ marginBottom: '0.25rem' }}>{str}</li>
                ))}
              </ul>
            </Card>

            <Card className="score-card" style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                <BookOpen size={20} />
                <span className="font-medium">Areas for Improvement</span>
              </div>
              <ul style={{ paddingLeft: '1.5rem', margin: 0, fontSize: '0.875rem' }}>
                {scoreMutation.data.weaknesses.map((weak, idx) => (
                  <li key={idx} style={{ marginBottom: '0.25rem' }}>{weak}</li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockInterview;
