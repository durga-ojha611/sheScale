import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Search } from 'lucide-react';
import api from '../../services/api';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import './Networking.css';

const LocalEcosystem = () => {
  const [zipcode, setZipcode] = useState('');
  const [activeZipcode, setActiveZipcode] = useState('');

  const { data: businesses, isLoading, error } = useQuery({
    queryKey: ['localBusinesses', activeZipcode],
    queryFn: async () => {
      const { data } = await api.get('/networking/local-businesses', {
        params: { zipcode: activeZipcode || '000000' } // Using dummy default if empty for MVP
      });
      return data.data;
    },
    enabled: !!activeZipcode
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (zipcode) {
      setActiveZipcode(zipcode);
    }
  };

  return (
    <div className="fade-in">
      <div className="funding-header">
        <h2 className="funding-title">Hyper-Local Ecosystem</h2>
        <p className="funding-subtitle">Discover women-led businesses, suppliers, and partners near you.</p>
      </div>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', maxWidth: '400px' }}>
        <Input 
          placeholder="Enter Zipcode (e.g. 560001)" 
          value={zipcode}
          onChange={(e) => setZipcode(e.target.value)}
          className="flex-1"
          style={{ marginBottom: 0 }}
        />
        <button 
          type="submit" 
          className="btn btn-primary"
          style={{ alignSelf: 'flex-start' }}
        >
          <Search size={18} />
        </button>
      </form>

      {/* Map Placeholder */}
      <div className="map-placeholder">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin size={32} />
          <span>Interactive Map View (Requires Google Maps API Key)</span>
        </div>
      </div>

      <h3 style={{ marginBottom: '1rem' }}>Local Directory</h3>

      {isLoading && <div className="text-center" style={{ padding: '2rem' }}><Spinner /></div>}
      
      {error && (
        <div className="copilot-alert" style={{ backgroundColor: 'var(--error-light)', color: 'var(--error)' }}>
          Failed to load businesses.
        </div>
      )}

      {!isLoading && !error && businesses && businesses.length === 0 && (
        <p className="text-secondary text-center" style={{ padding: '2rem' }}>No businesses found in this area.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {!isLoading && businesses && businesses.map((biz) => (
          <Card key={biz._id} className="fade-in">
            <CardContent style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem' }}>
              <div>
                <h4 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>{biz.profile?.businessName || 'Unnamed Business'}</h4>
                <p className="text-sm text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={14} />
                  {biz.profile?.location?.city || 'Unknown City'}, {biz.profile?.location?.state} {biz.profile?.location?.zipcode}
                </p>
              </div>
              <Badge variant="primary">{biz.profile?.industry || 'General'}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LocalEcosystem;
