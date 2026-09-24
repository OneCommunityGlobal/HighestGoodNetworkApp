/* eslint-disable testing-library/no-node-access */
import { useSelector } from 'react-redux';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import EventParticipationHeader from './EventParticipationHeader';
import EngagementSummaryCards from './EngagementSummaryCards';
import EventTypePieChart from './EventTypePieChart';
import EngagementBarChart from './EngagementBarChart';
import AnalyticsNavigation from './AnalyticsNavigation';
import MyCases from './MyCases';
import DropOffTracking from './DropOffTracking';
import NoShowInsights from './NoShowInsights';
import styles from './Participation.module.css';

function EventParticipation() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const exportRef = useRef(null);
  const exportStarted = useRef(false);
  const exportLocked = useRef(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  const resetExport = useCallback(() => {
    exportLocked.current = false;
    exportStarted.current = false;
    setIsExporting(false);
  }, []);

  const handlePrintError = useCallback(() => {
    resetExport();
    setExportError('Unable to prepare the PDF. Please try again.');
  }, [resetExport]);

  const printReport = useReactToPrint({
    contentRef: exportRef,
    documentTitle: 'event_participation',
    onAfterPrint: resetExport,
    onPrintError: handlePrintError,
    print: async iframe => {
      const printWindow = iframe.contentWindow;
      if (!printWindow?.print) throw new Error('Printing is unavailable.');
      const previousTitle = document.title;
      try {
        document.title = 'event_participation';
        printWindow.document.title = 'event_participation';
        printWindow.focus();
        printWindow.print();
      } finally {
        document.title = previousTitle;
      }
    },
  });

  // Start only after React has rendered every matching event into the report.
  useEffect(() => {
    if (isExporting && !exportStarted.current) {
      exportStarted.current = true;
      try {
        printReport();
      } catch {
        handlePrintError();
      }
    }
  }, [isExporting, printReport, handlePrintError]);

  const handleSaveAsPDF = () => {
    if (exportLocked.current) return;
    exportLocked.current = true;
    setExportError('');
    setIsExporting(true);
  };

  return (
    <div
      ref={exportRef}
      className={`participation-landing-page-global ${styles.participationLandingPage} ${
        darkMode ? styles.participationLandingPageDark : ''
      }`}
    >
      <EventParticipationHeader onSaveAsPDF={handleSaveAsPDF} isExporting={isExporting} />
      {exportError && (
        <p role="alert" className={styles.exportError}>
          {exportError}
        </p>
      )}
      <EngagementSummaryCards />
      <div className={styles.chartsSection}>
        <div className={styles.chartsRow}>
          <EventTypePieChart />
          <EngagementBarChart />
        </div>
      </div>

      <MyCases isExporting={isExporting} />
      <div className={`${styles.analyticsSection}`}>
        <DropOffTracking />
        <NoShowInsights />
      </div>
      <AnalyticsNavigation />
      {/* Print-only footer note */}
    </div>
  );
}

export default EventParticipation;
