import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import './Funding.css';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const SchemeResultsOverview = ({ matchData }) => {
  if (!matchData) return null;

  const { matchScore, subScores, highlights, improvements } = matchData;

  const data = {
    labels: ['Eligibility', 'Financial Fit', 'Documentation', 'Location', 'Business Stage'],
    datasets: [
      {
        label: 'Match Fit',
        data: [
          subScores?.eligibility || 0,
          subScores?.financialFit || 0,
          subScores?.documentation || 0,
          subScores?.location || 0,
          subScores?.businessStage || 0,
        ],
        backgroundColor: 'rgba(76, 175, 80, 0.2)', // Light green
        borderColor: '#4CAF50', // Green line
        pointBackgroundColor: '#4CAF50',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#4CAF50',
      },
    ],
  };

  const options = {
    scales: {
      r: {
        angleLines: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          display: false, // Hide the numbers on the axis
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
    },
    plugins: {
      legend: {
        display: false // Hide legend to match screenshot
      }
    }
  };

  return (
    <div className="results-overview-card fade-in-up">
      <h2 className="overview-title">Overview</h2>
      <div className="overview-score-header">
        <span className="score-label">Match Score: </span>
        <span className="score-value">{matchScore}</span>
      </div>
      <p className="overview-description">
        Your business profile aligns well with this scheme, especially in terms of business stage and location. Ensure your documentation is up to date to boost your chances.
      </p>

      <div className="overview-content-grid">
        <div className="radar-chart-container">
          <Radar data={data} options={options} />
        </div>

        <div className="insights-container">
          {highlights && highlights.length > 0 && (
            <div className="insight-box highlight-box">
              <h4 className="insight-title">Highlights</h4>
              <ul className="insight-list">
                {highlights.map((item, idx) => (
                  <li key={idx}>
                    <CheckCircle2 size={16} color="#4CAF50" className="insight-icon" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {improvements && improvements.length > 0 && (
            <div className="insight-box improvement-box">
              <h4 className="insight-title">Improvements</h4>
              <ul className="insight-list">
                {improvements.map((item, idx) => (
                  <li key={idx}>
                    <AlertCircle size={16} color="#8D6E63" className="insight-icon" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchemeResultsOverview;
