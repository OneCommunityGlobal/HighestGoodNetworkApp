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
    if (globalThis.window === undefined || globalThis.document === undefined) return;
    if (exporting) return;
    setExporting(true);

    document.documentElement.dataset.exporting = 'true';

    // Expand "More" so all visible items are included
    const moreBtn = document.querySelector('.more-btn-global');
    const toggled = moreBtn?.textContent?.toLowerCase().includes('more') ?? false;
    if (toggled) moreBtn.click();

    const prevTitle = document.title;
    document.title = 'event_participation';

    setTimeout(() => {
      globalThis.print();

      setTimeout(() => {
        if (toggled) moreBtn.click();

        delete document.documentElement.dataset.exporting;
        document.title = prevTitle;
        setExporting(false);
      }, 100);
    }, 500);
  }, [exporting]);

  return (
    <div
      ref={exportRef}
      className={`participation-landing-page-global ${styles.participationLandingPage} ${
        darkMode ? styles.participationLandingPageDark : ''
      }`}
    >
      {/* Print-only page title header */}
      <div className={`${styles.printOnly} ${styles.printHeader}`}>
        <div className={styles.printHeaderTitle}>Social And Recreational Management</div>
        <div className={styles.printHeaderSubtitle}>Event Participation</div>
      </div>

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

      <MyCases />

      <div className={styles.analyticsSection}>
        <DropOffTracking />
        <NoShowInsights />
      </div>

      {/* Print-only footer note */}
      <div className={`${styles.printOnly} ${styles.printFooter}`}>
        Generated from Event Participation
      </div>
    </div>
  );
}

export default EventParticipation;
