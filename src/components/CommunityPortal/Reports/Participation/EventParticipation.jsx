/* eslint-disable testing-library/no-node-access */
import { useSelector } from 'react-redux';
import { useRef, useState, useCallback } from 'react';
import MyCases from './MyCases';
import DropOffTracking from './DropOffTracking';
import NoShowInsights from './NoShowInsights';
import './Participation.css';

function EventParticipation() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const exportRef = useRef(null);
  const [exporting, setExporting] = useState(false);

  const handleSaveAsPDF = useCallback(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    if (exporting) return;
    setExporting(true);

    document.documentElement.setAttribute('data-exporting', 'true');

    // Expand “More” so all visible items are included
    const moreBtn = document.querySelector('.more-btn');
    const toggled = moreBtn && moreBtn.textContent?.toLowerCase().includes('more');
    if (toggled) moreBtn.click();

    const prevTitle = document.title;
    document.title = 'event_participation';

    setTimeout(() => {
      window.print();

      setTimeout(() => {
        if (toggled) moreBtn.click();
        document.documentElement.removeAttribute('data-exporting');
        document.title = prevTitle;
        setExporting(false);
      }, 100);
    }, 50);
  }, [exporting]);

  return (
    <div
      ref={exportRef}
      className={`participation-landing-page ${darkMode ? 'participation-landing-page-dark' : ''}`}
    >
      {/* Print-only page title header */}
      <div className="print-only print-header">
        <div className="print-header-title">Social And Recreational Management</div>
        <div className="print-header-subtitle">Event Participation</div>
      </div>

      <header className="landing-page-header-container avoid-break no-print-gap">
        <h1 className={`landing-page-header ${darkMode ? 'landing-page-header-dark' : ''}`}>
          Social And Recreational Management
        </h1>
        <button
          className={`save-pdf-btn ${
            darkMode ? 'save-pdf-btn-dark' : 'save-pdf-btn-light'
          } no-print`}
          onClick={handleSaveAsPDF}
          disabled={exporting}
          aria-busy={exporting}
        >
          {exporting ? 'Preparing…' : '📄 Save as PDF'}
        </button>
      </header>

      <MyCases />

      <div className="analytics-section">
        <DropOffTracking />
        <NoShowInsights />
      </div>

      {/* Print-only footer note */}
      <div className="print-only print-footer">Generated from Event Participation</div>
    </div>
  );
}

export default EventParticipation;
