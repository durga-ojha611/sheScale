import React, { useState, useEffect } from 'react';
import { Lock, Calendar, Star, Users } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import './Mentorship.css';

const MentorBooking = ({ isUnlocked }) => {
  const [mentors, setMentors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMentors = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/mentor/list');
      setMentors(res.data.data.mentors);
    } catch (error) {
      console.error('Failed to fetch mentors', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isUnlocked) {
      fetchMentors();
    }
  }, [isUnlocked]);

  const handleBook = async (mentorId, slotId) => {
    try {
      await api.post('/mentor/book', { mentorId, slotId });
      alert('Session Booked Successfully! You will receive an email shortly.');
      fetchMentors(); // Refresh slots
    } catch (error) {
      console.error('Failed to book slot', error);
      alert(error.response?.data?.message || 'Failed to book slot.');
    }
  };

  return (
    <div className="mentor-booking-container">
      {!isUnlocked && (
        <div className="locked-overlay">
          <div className="locked-card fade-in">
            <div className="locked-icon">
              <Lock size={32} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1A1A1A' }}>
              Exclusive Access Locked
            </h3>
            <p style={{ color: '#64748B', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Score <strong>80+</strong> in the Mock Pitch Simulator to prove your readiness and unlock 1-on-1 sessions with top industry experts and investors.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', color: '#94A3B8', fontSize: '0.85rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Star size={14} /> Expert Mentors</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Users size={14} /> 1-on-1 Sessions</span>
            </div>
          </div>
        </div>
      )}

      <div className="mentor-grid">
        {/* If locked, show dummy blurred cards behind the overlay */}
        {(!isUnlocked ? [1, 2, 3] : mentors).map((mentor, idx) => (
          <div key={mentor._id || idx} className="mentor-card">
            <div className="mentor-header">
              <img 
                src={mentor.imageUrl || `https://i.pravatar.cc/150?img=${idx * 10}`} 
                alt="Mentor" 
                className="mentor-avatar"
              />
              <div className="mentor-info">
                <h4>{mentor.name || 'Anonymous Mentor'}</h4>
                <p>{mentor.title || 'Industry Expert'}</p>
              </div>
            </div>
            
            <div className="mentor-expertise">
              {(mentor.expertise || ['Strategy', 'Growth', 'Fundraising']).map(exp => (
                <span key={exp} className="expertise-tag">{exp}</span>
              ))}
            </div>
            
            <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: '1rem', lineHeight: '1.5' }}>
              {mentor.bio || 'This mentor specializes in scaling businesses from 0 to 1 and preparing founders for seed rounds.'}
            </p>
            
            <div className="mentor-slots">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1A1A1A', fontWeight: 600, fontSize: '0.9rem' }}>
                <Calendar size={16} /> Available Slots
              </div>
              <div className="slot-list">
                {isUnlocked && mentor.availableSlots?.map(slot => (
                  <button 
                    key={slot._id} 
                    className="slot-btn"
                    disabled={slot.isBooked}
                    onClick={() => handleBook(mentor._id, slot._id)}
                  >
                    {slot.date} at {slot.time} {slot.isBooked ? '(Booked)' : ''}
                  </button>
                ))}
                
                {isUnlocked && (!mentor.availableSlots || mentor.availableSlots.length === 0) && (
                  <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '0.5rem' }}>No available slots right now.</div>
                )}

                {!isUnlocked && (
                  <>
                    <button className="slot-btn" disabled>Oct 12 at 10:00 AM</button>
                    <button className="slot-btn" disabled>Oct 14 at 02:00 PM</button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MentorBooking;
