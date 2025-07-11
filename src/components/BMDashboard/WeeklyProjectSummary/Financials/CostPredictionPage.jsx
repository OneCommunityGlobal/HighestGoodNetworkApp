// React is needed for JSX transformation
// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useLocation } from 'react-router-dom';
import CostPredictionChart from './CostPredictionChart';
import './CostPredictionPage.css';

function CostPredictionPage() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [loading] = useState(false);
  const [error] = useState(null);
  const { projectId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const projectIdFromQuery = queryParams.get('projectId');

  // Use projectId from params or query string
  const selectedProjectId = projectId || projectIdFromQuery;

  // Apply dark mode styles to document body when in dark mode
  React.useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode-body');
    } else {
      document.body.classList.remove('dark-mode-body');
    }

    // Add dark mode CSS
    if (!document.getElementById('dark-mode-styles-cost')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'dark-mode-styles-cost';
      styleElement.innerHTML = `
        .dark-mode-body .cost-prediction-page {
          background-color: #1e2736 !important;
          color: #e0e0e0 !important;
        }
        .dark-mode-body .cost-prediction-content {
          background-color: #1e2736 !important;
          color: #e0e0e0 !important;
        }
      `;
      document.head.appendChild(styleElement);
    }

    return () => {
      // Cleanup
      document.body.classList.remove('dark-mode-body');
    };
  }, [darkMode]);

  const darkModeStyles = darkMode
    ? {
        backgroundColor: '#1e2736',
        color: '#e0e0e0',
      }
    : {};

  return (
    <div className={`cost-prediction-page ${darkMode ? 'dark-mode' : ''}`} style={darkModeStyles}>
      <div className="cost-prediction-content" style={darkModeStyles}>
        {loading && <div className="page-loading">Loading data...</div>}

        {error && <div className="page-error">{error}</div>}

        {!loading && !error && (
          <CostPredictionChart darkMode={darkMode} isFullPage projectId={selectedProjectId} />
        )}
      </div>
    </div>
  );
}

export default CostPredictionPage;
