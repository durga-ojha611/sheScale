import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Circle } from 'lucide-react';
import api from '../../services/api';
import './Funding.css';

const CHECKLIST_ITEMS = [
  { key: 'completeProfile', label: 'Complete Profile' },
  { key: 'findMatchingScheme', label: 'Find Matching Scheme' },
  { key: 'scanIdentityDocs', label: 'Scan Identity Docs' },
];

const FundingChecklist = ({ onScrollToSection }) => {
  const queryClient = useQueryClient();

  const { data: response } = useQuery({
    queryKey: ['userChecklist'],
    queryFn: async () => {
      const { data } = await api.get('/user/checklist');
      return data.data; // { checklistProgress, progressPercent }
    },
    staleTime: 5000,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates) => {
      const { data } = await api.patch('/user/checklist', updates);
      return data.data;
    },
    onSuccess: (updatedData) => {
      queryClient.setQueryData(['userChecklist'], updatedData);
    },
  });

  const checklist = response?.checklistProgress || {
    completeProfile: false,
    findMatchingScheme: false,
    scanIdentityDocs: false,
    generatePnLPlan: false,
  };

  const progressPercent = response?.progressPercent ?? 0;
  const completedCount = Object.values(checklist).filter(Boolean).length;

  const handleItemClick = (itemKey) => {
    // Smooth scroll to target section ref
    if (onScrollToSection) {
      onScrollToSection(itemKey);
    }
  };

  const handleToggle = (e, itemKey) => {
    e.stopPropagation(); // prevent triggering row scroll if toggled directly
    const newValue = !checklist[itemKey];
    updateMutation.mutate({ [itemKey]: newValue });
  };

  return (
    <div 
      className="funding-checklist-banner fade-in"
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        border: '1px solid var(--border-color, #E8E8E8)',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1A1A1A' }}>
          Funding Roadmap & Progress Tracker
        </h3>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F50A70' }}>
          {completedCount}/{CHECKLIST_ITEMS.length} Tasks – {progressPercent}%
        </span>
      </div>

      {/* Progress Bar with CSS animation */}
      <div 
        style={{
          width: '100%',
          height: '8px',
          backgroundColor: '#F0F0F0',
          borderRadius: '4px',
          overflow: 'hidden',
          marginBottom: '1rem',
        }}
      >
        <div 
          style={{
            width: `${progressPercent}%`,
            height: '100%',
            backgroundColor: '#F50A70',
            borderRadius: '4px',
            transition: 'width 0.5s ease-in-out',
          }}
        />
      </div>

      {/* Checkboxes Grid */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.75rem',
        }}
      >
        {CHECKLIST_ITEMS.map((item) => {
          const isChecked = Boolean(checklist[item.key]);
          return (
            <div
              key={item.key}
              onClick={() => handleItemClick(item.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                padding: '0.6rem 0.8rem',
                borderRadius: '8px',
                backgroundColor: isChecked ? 'rgba(245, 10, 112, 0.05)' : '#F9F9F9',
                border: isChecked ? '1px solid rgba(245, 10, 112, 0.2)' : '1px solid #EEEEEE',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                userSelect: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div onClick={(e) => handleToggle(e, item.key)} style={{ display: 'flex', alignItems: 'center' }}>
                  {isChecked ? (
                    <CheckCircle2 size={18} color="#F50A70" style={{ flexShrink: 0 }} />
                  ) : (
                    <Circle size={18} color="#A0A0A0" style={{ flexShrink: 0 }} />
                  )}
                </div>
                <span 
                  style={{ 
                    fontSize: '0.85rem', 
                    fontWeight: isChecked ? 600 : 400,
                    color: isChecked ? '#1A1A1A' : '#666666',
                    textDecoration: isChecked ? 'line-through' : 'none',
                  }}
                >
                  {item.label}
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#888', fontStyle: 'italic' }}>Scroll ➔</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FundingChecklist;
