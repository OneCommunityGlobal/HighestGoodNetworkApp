/* eslint-disable no-plusplus */

import { useSelector } from 'react-redux';
import { Container } from 'reactstrap';
import styles from './SkeletonLoading.module.css';

const SkeletonLoading = ({ template, className }) => {
  const darkMode = useSelector(state => state.theme.darkMode);
  const renderSkeletonTemplate = () => {
    const rows = [];
    const reportItems = [];
    const userManagementItems = [];
    switch (template) {
      case 'Timelog':
        return (
          <Container fluid="sm">
            <div className={`skeleton-loading-timelog ${darkMode ? 'bg-space-cadet' : ''}`}>
              <div className={`${styles.skeletonLoadingItemTimelog}`} />
              <div className={`${styles.skeletonLoadingItemTimelog}`} />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div className={`${styles.skeletonLoadingItemAddIntangible}`} />
              </div>
            </div>
          </Container>
        );
      case 'TimelogFilter':
        return (
          <div className={`skeleton-loading-timelog-filter ${darkMode ? 'bg-space-cadet' : ''}`}>
            <div className={`${styles.skeletonLoadingTimelogFilterItem}`} />
            <div className={`${styles.skeletonLoadingTimelogFilterItem}`} />
            <div className={`${styles.skeletonLoadingTimelogFilterItem}`} />
            <div className={`${styles.skeletonLoadingTimelogFilterItem}`} />
          </div>
        );
      case 'TeamMemberTasks':
        for (let i = 0; i < 15; i++) {
          rows.push(
            <tr key={i}>
              <td colSpan={6} className={`${styles.skeletonLoadingTeamMemberTasksRow}`} />
            </tr>,
          );
        }
        return rows;
      case 'WeeklySummary':
        return (
          <Container fluid="sm" className={darkMode ? 'bg-space-cadet' : ''}>
            <div className={`${styles.skeletonLoadingWeeklySummary}`} />
          </Container>
        );
      case 'WeeklySummariesReport':
        for (let i = 0; i < 10; i++) {
          reportItems.push(
            <div key={i} className={darkMode ? 'bg-yinmn-blue' : ''}>
              <div className={`${styles.skeletonLoadingWeeklySummariesReportItem}`} />
              <div className={`${styles.skeletonLoadingWeeklySummariesReportItem} mt-5`} />
              <div className={`${styles.skeletonLoadingWeeklySummariesReportItem}`} />
              <div className={`${styles.skeletonLoadingWeeklySummariesReportItem}`} />
              <div className={`${styles.skeletonLoadingWeeklySummariesReportItem}`} />
              <div className={`${styles.skeletonLoadingWeeklySummariesReportItem}`} />
              <div className={`${styles.skeletonLoadingWeeklySummariesReportItem}`} />
              <div className={`${styles.skeletonLoadingWeeklySummariesReportItem}`} />
              <hr />
            </div>,
          );
        }

        return (
          <Container fluid>
            <div style={{ marginTop: '2rem', marginLeft: '12rem', marginRight: '5rem' }}>
              <h3 style={{ textAlign: 'left', paddingBottom: '2rem' }}>
                Weekly Summaries Reports page
              </h3>
              <div className={`skeleton-loading-weekly-summaries-report ${className}`}>
                {reportItems}
              </div>
            </div>
          </Container>
        );
      case 'WeeklyVolunteerSummaries':
        for (let i = 0; i < 10; i++) {
          reportItems.push(
            <div key={i} className={darkMode ? 'bg-yinmn-blue' : ''}>
              <div className={`${styles.skeletonLoadingWeeklySummariesReportItem}`} />
              <div className={`${styles.skeletonLoadingWeeklySummariesReportItem} mt-5`} />
              <div className={`${styles.skeletonLoadingWeeklySummariesReportItem}`} />
              <div className={`${styles.skeletonLoadingWeeklySummariesReportItem}`} />
              <div className={`${styles.skeletonLoadingWeeklySummariesReportItem}`} />
              <div className={`${styles.skeletonLoadingWeeklySummariesReportItem}`} />
              <div className={`${styles.skeletonLoadingWeeklySummariesReportItem}`} />
              <div className={`${styles.skeletonLoadingWeeklySummariesReportItem}`} />
              <hr />
            </div>,
          );
        }

        return (
          <Container fluid>
            <div style={{ marginTop: '2rem', marginLeft: '12rem', marginRight: '5rem' }}>
              <h3 style={{ textAlign: 'left', paddingBottom: '2rem' }}>
                Weekly Volunteer Summaries
              </h3>
              <div className={`skeleton-loading-weekly-summaries-report ${className}`}>
                {reportItems}
              </div>
            </div>
          </Container>
        );
      case 'UserProfile':
        return (
          <Container
            fluid
            style={{
              display: 'flex',
              justifyContent: 'center',
              backgroundColor: darkMode ? '#1B2A41' : '',
              minHeight: '100vh',
            }}
          >
            <div style={{ margin: '3rem 3rem 0 16rem' }}>
              <div
                className={`${styles.skeletonLoadingUserProfilePicture}`}
                style={{ marginBottom: '16rem' }}
              />
              <div className={`${styles.skeletonLoadingUserProfilePicture}`} />
            </div>
            <div className="mx-5" style={{ marginTop: '6rem' }}>
              <div className={`${styles.skeletonLoadingUserProfileItem}`} />
              <div className={`${styles.skeletonLoadingUserProfileItem} mt-5`} />
              <div
                className={`${styles.skeletonLoadingUserProfileItem}`}
                style={{ height: '16rem' }}
              />
              <div
                className={`${styles.skeletonLoadingUserProfileItem}`}
                style={{ marginTop: '4rem' }}
              />
              <div className={`${styles.skeletonLoadingUserProfileItem} mt-3`} />
              <div className={`${styles.skeletonLoadingUserProfileItem} mt-3`} />
              <div className={`${styles.skeletonLoadingUserProfileItem} mt-3`} />
              <div className={`${styles.skeletonLoadingUserProfileItem} mt-3`} />
              <div className={`${styles.skeletonLoadingUserProfileItem} mt-3`} />
              <div className={`${styles.skeletonLoadingUserProfileItem} mt-3`} />
              <div className={`${styles.skeletonLoadingUserProfileItem} mt-3`} />
              <div className={`${styles.skeletonLoadingUserProfileItem} mt-3`} />
              <div className={`${styles.skeletonLoadingUserProfileItem} mt-3`} />
              <div className={`${styles.skeletonLoadingUserProfileItem} mt-3`} />
              <div className={`${styles.skeletonLoadingUserProfileItem} mt-3`} />
            </div>
          </Container>
        );
      case 'UserManagement':
        for (let i = 0; i < 17; i++) {
          userManagementItems.push(
            <div key={i} className={`${styles.skeletonLoadingUserManagementItem}`} />,
          );
        }
        return <div>{userManagementItems}</div>;
      case 'WeeklyVolunteerSummary':
        return (
          <Container fluid="sm" className={darkMode ? 'bg-space-cadet' : ''}>
            <div className={`${styles.skeletonLoadingWeeklySummary}`} />
          </Container>
        );
      default:
        return null;
    }
  };
  return renderSkeletonTemplate();
};

export default SkeletonLoading;
