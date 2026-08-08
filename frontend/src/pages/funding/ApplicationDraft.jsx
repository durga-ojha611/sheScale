import React, { useState } from 'react';
import { FileText, Download, X, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import './Funding.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ApplicationDraft = ({ isOpen, onClose, applicationText, schemeName, pnlData }) => {
  const [activeTab, setActiveTab] = useState('application');

  if (!isOpen) return null;

  const handleDownloadApplication = () => {
    const element = document.createElement("a");
    const file = new Blob([applicationText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${schemeName}_Loan_Application.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadFinancials = () => {
    if (!pnlData) return;
    let combinedText = `=== 12-MONTH FINANCIAL PROJECTIONS (BizCalculus) ===\n\n`;
    combinedText += `Summary: ${pnlData.summary}\n`;
    combinedText += `Break-Even Month: Month ${pnlData.breakEvenMonth}\n\n`;
    
    if (pnlData.monthlyProjections) {
      combinedText += `Monthly Breakdown:\n`;
      pnlData.monthlyProjections.forEach(row => {
        combinedText += `Month ${row.month}: Revenue ₹${row.revenue} | COGS ₹${row.cogs} | Gross Profit ₹${row.grossProfit} | OPEX ₹${row.opex} | Net Profit ₹${row.netProfit}\n`;
      });
    }
    
    if (pnlData.cfoAdvice && pnlData.cfoAdvice.length > 0) {
      combinedText += `\nCFO Advice:\n`;
      pnlData.cfoAdvice.forEach((tip, idx) => {
        combinedText += `${idx + 1}. ${tip}\n`;
      });
    }

    const element = document.createElement("a");
    const file = new Blob([combinedText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${schemeName}_Financial_Report.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const projections = pnlData?.monthlyProjections || [];

  // Line Chart Data
  const lineChartData = {
    labels: projections.map(p => `M${p.month}`),
    datasets: [
      {
        label: 'Revenue (₹)',
        data: projections.map(p => p.revenue),
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        fill: true,
        tension: 0.3
      },
      {
        label: 'Net Profit (₹)',
        data: projections.map(p => p.netProfit),
        borderColor: '#F50A70',
        backgroundColor: 'rgba(245, 10, 112, 0.05)',
        fill: true,
        tension: 0.3
      }
    ]
  };

  // Pie Chart Data (Averages over 12 months)
  const avgCogs = projections.reduce((acc, curr) => acc + curr.cogs, 0) / (projections.length || 1);
  const avgOpex = projections.reduce((acc, curr) => acc + curr.opex, 0) / (projections.length || 1);
  const avgGrossProfit = projections.reduce((acc, curr) => acc + curr.grossProfit, 0) / (projections.length || 1);

  const pieChartData = {
    labels: ['COGS (Avg)', 'OPEX (Avg)', 'Gross Profit (Avg)'],
    datasets: [
      {
        data: [avgCogs, avgOpex, avgGrossProfit],
        backgroundColor: [
          '#FF9800', // COGS (Orange)
          '#2196F3', // OPEX (Blue)
          '#4CAF50'  // Gross Profit (Green)
        ],
        borderWidth: 1,
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
    },
  };

  const lineOptions = {
    ...commonOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (val) => '₹' + (val / 1000) + 'k' }
      }
    }
  };

  return (
    <div className="scanning-overlay glassmorphic-overlay fade-in">
      <div className="draft-modal glassmorphic-modal">
        
        {/* Header */}
        <div className="draft-modal-header border-b">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={24} color="var(--accent-primary)" />
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Funding Application Suite</h2>
          </div>
          <button onClick={onClose} className="close-button-modern">
            <X size={20} />
          </button>
        </div>
        
        {/* Tabs Navigation */}
        <div className="modern-tabs">
          <button 
            className={`modern-tab ${activeTab === 'application' ? 'active' : ''}`}
            onClick={() => setActiveTab('application')}
          >
            <FileText size={16} /> Loan Application
          </button>
          <button 
            className={`modern-tab ${activeTab === 'financials' ? 'active' : ''}`}
            onClick={() => setActiveTab('financials')}
            disabled={!pnlData}
          >
            <BarChart3 size={16} /> BizCalculus Financials
          </button>
        </div>

        {/* Tab Content Areas */}
        <div className="draft-modal-content motion-content">
          
          {/* TAB 1: Application */}
          {activeTab === 'application' && (
            <div className="tab-pane slide-in-up">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: '#1A1A1A', fontWeight: 600 }}>Formal Loan Application Draft</h3>
              <textarea
                className="draft-textarea modern-textarea"
                value={applicationText}
                readOnly
              />
              <div className="tab-footer">
                <Button variant="primary" onClick={handleDownloadApplication} className="download-btn-motion">
                  <Download size={16} style={{ marginRight: '0.5rem' }} /> Download Application (.txt)
                </Button>
              </div>
            </div>
          )}

          {/* TAB 2: Financials */}
          {activeTab === 'financials' && pnlData && (
            <div className="tab-pane slide-in-up">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#1A1A1A', margin: 0, fontWeight: 600 }}>BizCalculus Report</h3>
                <div className="break-even-badge">
                  <span>Break-even: Month {pnlData.breakEvenMonth}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Line Chart */}
                <Card className="modern-card">
                  <CardHeader style={{ padding: '1rem', paddingBottom: '0.5rem' }}>
                    <CardTitle style={{ fontSize: '0.9rem' }}>Revenue vs Net Profit Trend</CardTitle>
                  </CardHeader>
                  <CardContent style={{ padding: '1rem' }}>
                    <div style={{ height: '220px' }}>
                      <Line options={lineOptions} data={lineChartData} />
                    </div>
                  </CardContent>
                </Card>

                {/* Pie Chart */}
                <Card className="modern-card">
                  <CardHeader style={{ padding: '1rem', paddingBottom: '0.5rem' }}>
                    <CardTitle style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <PieChart size={16} /> Cost Breakdown (12M Avg)
                    </CardTitle>
                  </CardHeader>
                  <CardContent style={{ padding: '1rem' }}>
                    <div style={{ height: '220px' }}>
                      <Pie options={commonOptions} data={pieChartData} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* CFO Advice */}
              {pnlData.cfoAdvice && pnlData.cfoAdvice.length > 0 && (
                <Card className="modern-card highlight-card">
                  <CardHeader style={{ padding: '1rem', paddingBottom: '0.5rem' }}>
                    <CardTitle style={{ fontSize: '0.95rem', color: '#F50A70', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <TrendingUp size={18} />
                      CFO Financial Advice
                    </CardTitle>
                  </CardHeader>
                  <CardContent style={{ padding: '1rem', paddingTop: 0 }}>
                    <ul className="modern-list">
                      {pnlData.cfoAdvice.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              
              <div className="tab-footer">
                <Button variant="primary" onClick={handleDownloadFinancials} className="download-btn-motion">
                  <Download size={16} style={{ marginRight: '0.5rem' }} /> Download BizCalculus Report (.txt)
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationDraft;
