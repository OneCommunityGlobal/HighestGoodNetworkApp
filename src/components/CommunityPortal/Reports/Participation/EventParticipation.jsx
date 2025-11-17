/* eslint-disable testing-library/no-node-access */
import { useSelector } from 'react-redux';
import { useRef, useState, useCallback } from 'react';
import MyCases from './MyCases';
import DropOffTracking from './DropOffTracking';
import NoShowInsights from './NoShowInsights';
import styles from './Participation.module.css';

function EventParticipation() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const exportRef = useRef(null);
  const [exporting, setExporting] = useState(false);

  const handleSaveAsPDF = useCallback(() => {
    if (!window || !document) return;
    if (exporting) return;

    setExporting(true);
    document.documentElement.dataset.exporting = 'true';

    // Toggle the "More" button inside MyCases (module approach)
    const moreBtn = document.querySelector(`[class*="moreBtn"]`);
    const shouldExpand = moreBtn?.textContent?.toLowerCase().includes('more');

    if (shouldExpand) moreBtn.click();

    const prevTitle = document.title;
    document.title = 'event_participation';

    setTimeout(() => {
      window.print();

      setTimeout(() => {
        if (shouldExpand) moreBtn.click();

        delete document.documentElement.dataset.exporting;
        document.title = prevTitle;
        setExporting(false);
      }, 120);
    }, 500);
  }, [exporting]);

  return (
    <div
      ref={exportRef}
      className={`${styles.participationLandingPage} ${
        darkMode ? styles.participationLandingPageDark : ''
      }`}
    >
      {/* PRINT-ONLY HEADER */}
      <div className={styles.printOnly}>
        <div className={styles.printHeaderTitle}>Social And Recreational Management</div>
        <div className={styles.printHeaderSubtitle}>Event Participation</div>
      </div>

      {/* PAGE HEADER */}
      <header
        className={`${styles.landingPageHeaderContainer} ${styles.avoidBreak} ${styles.noPrintGap}`}
      >
        <h1
          className={`${styles.landingPageHeader} ${darkMode ? styles.landingPageHeaderDark : ''}`}
        >
          Social And Recreational Management
        </h1>

        <button
          className={`${styles.savePdfBtn} ${
            darkMode ? styles.savePdfBtnDark : styles.savePdfBtnLight
          } ${styles.noPrint}`}
          onClick={handleSaveAsPDF}
          disabled={exporting}
          aria-busy={exporting}
        >
          {exporting ? 'Preparing…' : '📄 Save as PDF'}
        </button>
      </header>

      {/* MY CASES (Top section) */}
      <MyCases />

      {/* ANALYTICS SECTION */}
      <div className={styles.analyticsSection}>
        <DropOffTracking />
        <NoShowInsights />
      </div>

      {/* PRINT-ONLY FOOTER */}
      <div className={styles.printOnly}>Generated from Event Participation</div>
    </div>
  );
}

export default EventParticipation;
