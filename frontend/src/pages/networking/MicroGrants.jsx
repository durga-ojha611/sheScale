import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, Megaphone } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import './Networking.css';

const MicroGrants = () => {
  const queryClient = useQueryClient();
  const [pledgeAmounts, setPledgeAmounts] = useState({});

  const { data: grants, isLoading, error } = useQuery({
    queryKey: ['microGrants'],
    queryFn: async () => {
      const { data } = await api.get('/networking/micro-grants');
      return data.data;
    }
  });

  const pledgeMutation = useMutation({
    mutationFn: async ({ grantId, amount }) => {
      const { data } = await api.post(`/networking/micro-grants/${grantId}/pledge`, { amount });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['microGrants']);
      alert('Pledge successful! Thank you for supporting women entrepreneurs.');
    }
  });

  const handlePledge = (grantId) => {
    const amount = Number(pledgeAmounts[grantId]);
    if (!amount || amount <= 0) return;
    pledgeMutation.mutate({ grantId, amount });
  };

  const handleAmountChange = (grantId, val) => {
    setPledgeAmounts(prev => ({ ...prev, [grantId]: val }));
  };

  if (isLoading) return <div className="text-center" style={{ padding: '3rem' }}><Spinner /></div>;
  if (error) return <div className="copilot-alert" style={{ backgroundColor: 'var(--error-light)', color: 'var(--error)' }}>Failed to load micro-grants.</div>;

  return (
    <div className="fade-in">
      <div className="funding-header">
        <h2 className="funding-title">Micro-Grant Community Ledger</h2>
        <p className="funding-subtitle">Support fellow founders by pledging micro-grants to their business pitches.</p>
      </div>

      <div className="grants-grid">
        {grants && grants.map((grant) => {
          const progressPercent = Math.min(100, Math.round((grant.currentAmount / grant.targetAmount) * 100));
          
          return (
            <Card key={grant._id} className="fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
              <CardHeader>
                <CardTitle style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span>{grant.title}</span>
                </CardTitle>
                <p className="text-sm text-secondary" style={{ marginTop: '0.25rem' }}>
                  by {grant.creator?.profile?.businessName || grant.creator?.email}
                </p>
              </CardHeader>
              
              <CardContent style={{ flex: 1 }}>
                <p className="text-sm" style={{ marginBottom: '1.5rem' }}>
                  {grant.description}
                </p>
                
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span className="font-medium">₹{grant.currentAmount.toLocaleString()} raised</span>
                    <span className="text-secondary">Goal: ₹{grant.targetAmount.toLocaleString()}</span>
                  </div>
                  
                  <div className="progress-bar-bg">
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ display: 'flex', position: 'relative', flex: 1 }}>
                  <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>₹</span>
                  <input 
                    type="number" 
                    className="input-field" 
                    style={{ width: '100%', marginBottom: 0, paddingLeft: '1.75rem' }}
                    placeholder="Amount"
                    value={pledgeAmounts[grant._id] || ''}
                    onChange={(e) => handleAmountChange(grant._id, e.target.value)}
                    disabled={pledgeMutation.isPending && pledgeMutation.variables?.grantId === grant._id}
                  />
                </div>
                <Button 
                  onClick={() => handlePledge(grant._id)}
                  isLoading={pledgeMutation.isPending && pledgeMutation.variables?.grantId === grant._id}
                  disabled={!pledgeAmounts[grant._id]}
                >
                  <Heart size={16} fill="currentColor" style={{ marginRight: '0.5rem' }} />
                  Pledge
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MicroGrants;
