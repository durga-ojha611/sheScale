import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UploadCloud, FileText, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import './Funding.css';

const DocWhisperer = () => {
  const [file, setFile] = useState(null);
  const [clientError, setClientError] = useState('');
  const queryClient = useQueryClient();

  const parseMutation = useMutation({
    mutationFn: async (formData) => {
      const { data } = await api.post('/docs/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userChecklist']);
    }
  });

  const handleFileChange = (e) => {
    setClientError('');
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      setClientError('Only PDF files are allowed.');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setClientError('File size exceeds the maximum limit of 5MB.');
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('document', file);
    parseMutation.mutate(formData);
  };

  return (
    <div className="doc-whisperer-container fade-in" style={{ marginBottom: '3rem' }}>
      <div className="funding-header">
        <h2 className="funding-title">Doc Whisperer — PDF Authenticity & Structure Scanner</h2>
        <p className="funding-subtitle">Upload your Aadhaar, PAN, Udyam, or registration PDF to verify document integrity before submitting scheme applications.</p>
      </div>

      <Card className="upload-section" style={{ marginBottom: '2rem', backgroundColor: '#FFFFFF' }}>
        <CardContent style={{ padding: '2.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(245, 10, 112, 0.08)', borderRadius: '50%', color: '#F50A70' }}>
            <UploadCloud size={40} />
          </div>
          <h3>Upload Verification PDF</h3>
          <p className="text-secondary" style={{ fontSize: '0.85rem' }}>Supported format: PDF only (Max 5MB)</p>
          
          <input 
            type="file" 
            accept="application/pdf" 
            id="pdf-upload" 
            style={{ display: 'none' }}
            onChange={handleFileChange}
            disabled={parseMutation.isPending}
          />
          <label htmlFor="pdf-upload">
            <Button as="span" variant="outline" disabled={parseMutation.isPending}>
              Select PDF File
            </Button>
          </label>
          
          {file && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontWeight: 600 }}>
              <FileText size={18} style={{ color: '#F50A70' }} />
              <span>{file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
            </div>
          )}

          {clientError && (
            <p style={{ color: '#F50A70', fontSize: '0.85rem', fontWeight: 500 }}>⚠️ {clientError}</p>
          )}

          {file && !clientError && (
            <Button 
              onClick={handleUpload} 
              isLoading={parseMutation.isPending}
              style={{ marginTop: '0.5rem', minWidth: '200px' }}
            >
              Verify Document Authenticity 🛡️
            </Button>
          )}

          {parseMutation.isError && (
            <div className="copilot-alert" style={{ backgroundColor: 'rgba(244, 67, 54, 0.1)', color: '#D32F2F', marginTop: '1rem' }}>
              {parseMutation.error.response?.data?.message || 'Failed to verify document.'}
            </div>
          )}
        </CardContent>
      </Card>

      {parseMutation.isSuccess && parseMutation.data && (
        <div className="analysis-results fade-in">
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={22} color="#2E7D32" />
            Verification Summary Card
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <Card style={{ backgroundColor: '#FFFFFF' }}>
              <CardHeader>
                <CardTitle style={{ fontSize: '1rem', color: '#1A1A1A' }}>Document Metadata</CardTitle>
              </CardHeader>
              <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F0F0F0', paddingBottom: '0.4rem' }}>
                  <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Status</span>
                  <span style={{ fontWeight: 700, color: parseMutation.data.isValid ? '#2E7D32' : '#D32F2F' }}>
                    {parseMutation.data.isValid ? 'Valid & Authentic ✅' : 'Review Required ⚠️'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F0F0F0', paddingBottom: '0.4rem' }}>
                  <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Detected Type</span>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{parseMutation.data.docType}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F0F0F0', paddingBottom: '0.4rem' }}>
                  <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Holder Name</span>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{parseMutation.data.extractedFields?.holderName || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Doc Number / ID</span>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{parseMutation.data.extractedFields?.documentNumber || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>

            <Card style={{ backgroundColor: '#FFFFFF' }}>
              <CardHeader>
                <CardTitle style={{ fontSize: '1rem', color: '#1A1A1A' }}>AI Verification Flags</CardTitle>
              </CardHeader>
              <CardContent>
                <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {parseMutation.data.flags?.map((flag, idx) => (
                    <li key={idx} style={{ fontSize: '0.85rem', color: '#444444' }}>
                      <CheckCircle2 size={14} color="#2E7D32" style={{ display: 'inline', marginRight: '0.4rem' }} />
                      {flag}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocWhisperer;
