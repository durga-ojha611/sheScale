import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, FileCheck, Search, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import './Funding.css';

const PreFlightScanner = () => {
  const [file, setFile] = useState(null);
  const queryClient = useQueryClient();
  const dummyApplicationId = '000000000000000000000000'; // Replace in real app

  const { data: application, isLoading: appLoading } = useQuery({
    queryKey: ['fundingApp', dummyApplicationId],
    queryFn: async () => {
      // In MVP, we might need to fetch the app to see existing documents
      // For now, mock or fetch if route exists
      return { documents: [] };
    }
  });

  const scanMutation = useMutation({
    mutationFn: async (formData) => {
      // Create a temp app if needed, just like DocWhisperer
      const appRes = await api.post('/funding', { 
        applicationTitle: 'PreFlight Scanner Temp App', 
        targetSchemeName: 'Unknown' 
      });
      const appId = appRes.data.data._id;

      const { data } = await api.post(`/funding/${appId}/scan-document`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['fundingApp', dummyApplicationId]);
    }
  });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('document', file);
    scanMutation.mutate(formData);
  };

  return (
    <div className="preflight-scanner-container fade-in">
      <div className="funding-header">
        <h2 className="funding-title">Document Pre-Flight Scanner</h2>
        <p className="funding-subtitle">Securely scan your documents for compliance before submission. We automatically redact sensitive PII like Aadhaar and PAN.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>
        
        {/* Upload & Scan Canvas */}
        <div className="scan-canvas">
          <Card style={{ marginBottom: '2rem' }}>
            <CardContent style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ marginBottom: '0.5rem' }}>Add New Document</h3>
                <input 
                  type="file" 
                  id="secure-upload" 
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                  disabled={scanMutation.isPending}
                />
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <label htmlFor="secure-upload">
                    <Button as="span" variant="outline" disabled={scanMutation.isPending}>
                      Browse File
                    </Button>
                  </label>
                  {file && <span className="text-secondary">{file.name}</span>}
                </div>
              </div>
              <div>
                <Button 
                  onClick={handleUpload} 
                  isLoading={scanMutation.isPending}
                  disabled={!file}
                  style={{ display: 'flex', gap: '0.5rem' }}
                >
                  <Search size={18} />
                  Scan Document
                </Button>
              </div>
            </CardContent>
          </Card>

          {scanMutation.isError && (
            <div className="copilot-alert" style={{ backgroundColor: 'var(--error-light)', color: 'var(--error)', marginBottom: '2rem' }}>
              {scanMutation.error.response?.data?.message || 'Failed to scan document.'}
            </div>
          )}

          {scanMutation.isSuccess && scanMutation.data && (
            <Card className="fade-in">
              <CardHeader>
                <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Shield size={20} className="text-accent" />
                  Scan Results: {scanMutation.data.documentName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                    <span className="font-medium text-secondary">Document Status</span>
                    {scanMutation.data.verificationStatus === 'verified' ? (
                      <Badge variant="success" className="flex items-center gap-1"><CheckCircle size={14}/> Verified</Badge>
                    ) : (
                      <Badge variant="warning">Pending Review</Badge>
                    )}
                  </div>

                  <div>
                    <h4 style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>PII Redaction Report</h4>
                    {scanMutation.data.redactedFields && scanMutation.data.redactedFields.length > 0 ? (
                      <ul style={{ paddingLeft: '1.5rem' }}>
                        {scanMutation.data.redactedFields.map((field, idx) => (
                          <li key={idx} className="text-sm">Redacted <strong>{field}</strong></li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-secondary">No sensitive PII detected.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tracker Panel (Co-Pilot layout equivalent) */}
        <div className="tracker-panel">
          <Card style={{ height: '100%' }}>
            <CardHeader>
              <CardTitle style={{ fontSize: '1rem' }}>Document Tracker</CardTitle>
            </CardHeader>
            <CardContent>
              {appLoading ? (
                <div className="text-center"><Spinner size={20} /></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Mock static list of required docs if app is empty */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ color: 'var(--success)' }}><CheckCircle size={18} /></div>
                    <div style={{ flex: 1 }}>
                      <p className="font-medium text-sm">Business Registration</p>
                      <p className="text-xs text-secondary">Verified & Redacted</p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ color: 'var(--text-tertiary)' }}><FileCheck size={18} /></div>
                    <div style={{ flex: 1 }}>
                      <p className="font-medium text-sm">ID Proof (Aadhaar/PAN)</p>
                      <p className="text-xs text-secondary">Pending Upload</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ color: 'var(--error)' }}><XCircle size={18} /></div>
                    <div style={{ flex: 1 }}>
                      <p className="font-medium text-sm">Bank Statement</p>
                      <p className="text-xs text-error">Missing Signature Page</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default PreFlightScanner;
