import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import './Funding.css';
import { Button } from '../../components/ui/Button';

const AccordionItem = ({ title, defaultOpen = false, children, icon: Icon, badgeColor }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="accordion-item">
      <button className="accordion-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="accordion-title-wrap">
          <div className="accordion-icon-wrap" style={{ backgroundColor: badgeColor }}>
            <Icon size={18} color="#fff" />
          </div>
          <h3>{title}</h3>
        </div>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpen && <div className="accordion-content">{children}</div>}
    </div>
  );
};

const SingleSchemeCard = ({ scheme, onGenerateApplication, isGenerating }) => {
  return (
    <div className="scheme-details-container fade-in-up" style={{ marginBottom: '2rem' }}>
      <div className="scheme-header-row">
        <div>
          <h2>{scheme.schemeName}</h2>
          {scheme.badge && <span className="scheme-badge">{scheme.badge}</span>}
          <div style={{ marginTop: '0.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
            Match Score: {scheme.matchScore}%
          </div>
        </div>
        <Button 
          variant="primary" 
          onClick={() => onGenerateApplication(scheme.schemeId)}
          isLoading={isGenerating}
        >
          <FileText size={16} style={{ marginRight: '0.5rem' }} />
          Generate Loan Application 📄
        </Button>
      </div>

      <div className="accordion-list">
        <AccordionItem title="Eligibility & Key Pros" defaultOpen={true} icon={CheckCircle} badgeColor="#2196F3">
          <p className="accordion-text">{scheme.eligibilitySummary}</p>
          {scheme.pros && scheme.pros.length > 0 && (
            <div className="pros-cons-section" style={{ marginTop: '1rem' }}>
              <h4>Pros (✅)</h4>
              <ul>
                {scheme.pros.map((pro, i) => (
                  <li key={i}><CheckCircle size={14} color="#4CAF50" /> {pro}</li>
                ))}
              </ul>
            </div>
          )}
        </AccordionItem>

        <AccordionItem title="Financial Fit & Cons" icon={AlertTriangle} badgeColor="#FF9800">
          <p className="accordion-text">{scheme.financialSummary}</p>
          {scheme.cons && scheme.cons.length > 0 && (
            <div className="pros-cons-section" style={{ marginTop: '1rem' }}>
              <h4>Cons (❌)</h4>
              <ul>
                {scheme.cons.map((con, i) => (
                  <li key={i}><AlertTriangle size={14} color="#F44336" /> {con}</li>
                ))}
              </ul>
            </div>
          )}
        </AccordionItem>
      </div>
    </div>
  );
};

const SchemeCards = ({ schemes, onGenerateApplication, isGenerating, activeSchemeId }) => {
  if (!schemes || schemes.length === 0) return null;

  // Handle single scheme object vs array for backwards compatibility
  const list = Array.isArray(schemes) ? schemes : [schemes];

  return (
    <div className="scheme-cards-list">
      {list.map((scheme, idx) => (
        <SingleSchemeCard 
          key={scheme.schemeId || idx}
          scheme={scheme}
          onGenerateApplication={onGenerateApplication}
          isGenerating={isGenerating && activeSchemeId === scheme.schemeId}
        />
      ))}
    </div>
  );
};

export default SchemeCards;
