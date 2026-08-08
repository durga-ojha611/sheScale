import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Heart, Building, Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import './Networking.css';

const SwipeMatch = () => {
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: candidates, isLoading, error } = useQuery({
    queryKey: ['swipeCandidates'],
    queryFn: async () => {
      const { data } = await api.get('/networking/discover');
      return data.data; // Array of user profiles
    }
  });

  const swipeMutation = useMutation({
    mutationFn: async ({ candidateId, action }) => {
      const { data } = await api.post('/networking/swipe', {
        targetUserId: candidateId,
        action
      });
      return data;
    },
    onSuccess: (data) => {
      if (data.data?.match) {
        alert("It's a Match! You can now message each other.");
      }
      setCurrentIndex(prev => prev + 1);
    }
  });

  const handleSwipe = (action) => {
    if (!candidates || currentIndex >= candidates.length) return;
    const candidateId = candidates[currentIndex]._id;
    swipeMutation.mutate({ candidateId, action });
  };

  if (isLoading) return <div className="text-center" style={{ padding: '3rem' }}><Spinner /></div>;
  if (error) return <div className="copilot-alert" style={{ backgroundColor: 'var(--error-light)', color: 'var(--error)' }}>Failed to load candidates.</div>;

  const currentCandidate = candidates && currentIndex < candidates.length ? candidates[currentIndex] : null;

  return (
    <div className="fade-in">
      <div className="funding-header">
        <h2 className="funding-title">Co-Founder Match</h2>
        <p className="funding-subtitle">Swipe right to connect with potential co-founders and partners.</p>
      </div>

      <div className="swipe-container">
        {currentCandidate ? (
          <div className="swipe-card fade-in">
            <div className="swipe-card-img">
              {currentCandidate.profile?.avatarUrl ? (
                <img src={currentCandidate.profile.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <ImageIcon size={48} />
              )}
            </div>
            
            <div className="swipe-card-content">
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                {currentCandidate.profile?.businessName || currentCandidate.email.split('@')[0]}
              </h3>
              <p className="text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Building size={16} />
                {currentCandidate.profile?.industry || 'Unspecified Industry'}
              </p>
              
              <div style={{ flex: 1 }}>
                <p className="text-sm" style={{ marginBottom: '1rem' }}>
                  {currentCandidate.profile?.bio || 'No bio provided.'}
                </p>
                
                {currentCandidate.profile?.skills && currentCandidate.profile.skills.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {currentCandidate.profile.skills.map((skill, idx) => (
                      <Badge key={idx} variant="default">{skill}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="swipe-actions">
              <button 
                className="action-btn action-pass"
                onClick={() => handleSwipe('pass')}
                disabled={swipeMutation.isPending}
              >
                <X size={24} />
              </button>
              <button 
                className="action-btn action-like"
                onClick={() => handleSwipe('like')}
                disabled={swipeMutation.isPending}
              >
                <Heart size={24} />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center" style={{ color: 'var(--text-tertiary)' }}>
            <p style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>You've seen everyone!</p>
            <Button variant="outline" onClick={() => { setCurrentIndex(0); queryClient.invalidateQueries(['swipeCandidates']); }}>
              Check back later
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SwipeMatch;
