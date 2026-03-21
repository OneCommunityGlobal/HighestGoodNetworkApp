/* eslint-disable testing-library/no-node-access */
import { useSelector } from 'react-redux';
import { useRef, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import MyCases from './MyCases';
import DropOffTracking from './DropOffTracking';
import NoShowInsights from './NoShowInsights';
import mockEvents from './mockData';
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

  const summaryMetrics = useMemo(() => {
    if (!mockEvents.length) {
      return {
        totalEvents: 0,
        averageAttendance: 0,
        highestAttendanceEvent: 'N/A',
        eventTypesCount: 0,
      };
    }

    const totalAttendance = mockEvents.reduce(
      (sum, event) => sum + (Number(event.attendees) || 0),
      0,
    );

    const highestAttendanceEventObj = mockEvents.reduce((highest, current) => {
      return (Number(current.attendees) || 0) > (Number(highest.attendees) || 0) ? current : highest;
    }, mockEvents[0]);

    const uniqueEventTypes = new Set(mockEvents.map(event => event.eventType));

    return {
      totalEvents: mockEvents.length,
      averageAttendance: Math.round(totalAttendance / mockEvents.length),
      highestAttendanceEvent: highestAttendanceEventObj?.eventName || 'N/A',
      eventTypesCount: uniqueEventTypes.size,
    };
  }, []);

  const quickLinks = [
    {
      title: 'Virtual vs In-Person Attendance',
      description: 'Compare attendance behavior across virtual and in-person events.',
      path: '/communityportal/reports/participation/attendance-mode',
    },
    {
      title: 'Estimated Event Value',
      description: 'Review event value trends and participation impact estimates.',
      path: '/communityportal/reports/participation/value',
    },
    {
      title: 'Participation Trends',
      description: 'Explore long-term participation patterns and engagement changes.',
      path: '/communityportal/reports/participation/trends',
    },
  ];

  return (
    <div
      ref={exportRef}
      className={`participation-landing-page-global ${styles.participationLandingPage} ${
        darkMode ? styles.participationLandingPageDark : ''
      }`}
    >
      <header
        className={`${styles.landingPageHeaderContainer} ${styles.avoidBreak} ${styles.noPrintGap}`}
      >
        <div className={styles.headerContent}>
          <div>
            <h1
              className={`${styles.landingPageHeader} ${
                darkMode ? styles.landingPageHeaderDark : ''
              }`}
            >
              Event Participation Analytics
            </h1>
            <p className={`${styles.pageSubheading} ${darkMode ? styles.pageSubheadingDark : ''}`}>
              Monitor engagement across classes, workshops, and conferences with actionable
              participation insights.
            </p>
          </div>

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
        </div>

        <div className={`${styles.topNavigationLinks} ${styles.noPrint}`}>
          <Link className={styles.navPill} to="/communityportal/reports/participation/trends">
            Participation Trends
          </Link>
          <Link className={styles.navPill} to="/communityportal/reports/participation/attendance-mode">
            Virtual vs In-Person
          </Link>
          <Link className={styles.navPill} to="/communityportal/reports/participation/value">
            Estimated Event Value
          </Link>
        </div>
      </header>

      <section className={styles.summaryCardsSection}>
        <div className={`${styles.summaryCard} ${darkMode ? styles.summaryCardDark : ''}`}>
          <p className={styles.summaryLabel}>Total Events</p>
          <h3 className={styles.summaryValue}>{summaryMetrics.totalEvents}</h3>
        </div>

        <div className={`${styles.summaryCard} ${darkMode ? styles.summaryCardDark : ''}`}>
          <p className={styles.summaryLabel}>Average Attendance</p>
          <h3 className={styles.summaryValue}>{summaryMetrics.averageAttendance}</h3>
        </div>

        <div className={`${styles.summaryCard} ${darkMode ? styles.summaryCardDark : ''}`}>
          <p className={styles.summaryLabel}>Highest Attendance Event</p>
          <h3 className={styles.summaryValueSmall}>{summaryMetrics.highestAttendanceEvent}</h3>
        </div>

        <div className={`${styles.summaryCard} ${darkMode ? styles.summaryCardDark : ''}`}>
          <p className={styles.summaryLabel}>Event Categories</p>
          <h3 className={styles.summaryValue}>{summaryMetrics.eventTypesCount}</h3>
        </div>
      </section>

      <section className={styles.middleSection}>
        <div className={styles.middleSectionLeft}>
          <MyCases />
        </div>

        <div className={styles.middleSectionRight}>
          <NoShowInsights />
        </div>
      </section>

      <section className={styles.analyticsSection}>
        <DropOffTracking />
      </section>

      <section className={`${styles.bottomLinksSection} ${styles.noPrint}`}>
        <h2 className={styles.bottomLinksHeading}>Detailed Analytics</h2>
        <div className={styles.bottomLinksGrid}>
          {quickLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`${styles.analyticsLinkCard} ${darkMode ? styles.analyticsLinkCardDark : ''}`}
            >
              <h3>{link.title}</h3>
              <p>{link.description}</p>
              <span className={styles.analyticsLinkCta}>View Details →</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default EventParticipation;
