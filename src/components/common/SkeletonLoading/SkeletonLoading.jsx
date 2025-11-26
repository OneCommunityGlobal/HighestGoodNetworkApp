import { useSelector } from 'react-redux';
import './SkeletonLoading.css';
import { Container } from 'reactstrap';
import { v4 as uuidv4 } from 'uuid';

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
            <div
              className={`skeleton-loading-timelog ${darkMode ? 'bg-space-cadet' : ''}`}
              data-testid="timelog"
            >
              <div className="skeleton-loading-item-timelog" />
              <div className="skeleton-loading-item-timelog" />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div className="skeleton-loading-item-add-intangible" />
              </div>
            </div>
          </Container>
        );
      case 'TimelogFilter':
        return (
          <div
            className={`skeleton-loading-timelog-filter ${darkMode ? 'bg-space-cadet' : ''}`}
            data-testid="timelog-filter"
          >
            <div className="skeleton-loading-timelog-filter-item" />
            <div className="skeleton-loading-timelog-filter-item" />
            <div className="skeleton-loading-timelog-filter-item" />
            <div className="skeleton-loading-timelog-filter-item" />
          </div>
        );
      case 'TeamMemberTasks':
        for (let i = 0; i < 15; i += 1) {
          rows.push(
            <tr key={uuidv4()}>
              <td
                colSpan={6}
                className="skeleton-loading-team-member-tasks-row"
                data-testid="team-member-tasks-row"
              />
            </tr>,
          );
        }
        return rows;
      case 'WeeklySummary':
        return (
          <Container fluid="sm" className={darkMode ? 'bg-space-cadet' : ''}>
            <div className="skeleton-loading-weekly-summary" data-testid="weekly-summary" />
          </Container>
        );
      case 'WeeklySummariesReport':
        for (let i = 0; i < 10; i += 1) {
          reportItems.push(
            <div key={i} className={darkMode ? 'bg-yinmn-blue' : ''}>
              {[...Array(8)].map(() => (
                <div
                  key={uuidv4()}
                  className="skeleton-loading-weekly-summaries-report-item"
                  data-testid="weekly-summaries-report-item"
                />
              ))}
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
                className="skeleton-loading-user-profile-picture"
                style={{ marginBottom: '16rem' }}
              />
              <div className="skeleton-loading-user-profile-picture" />
            </div>
            <div className="mx-5" style={{ marginTop: '6rem' }}>
              {[...Array(15)].map(() => (
                <div
                  key={uuidv4()}
                  className="skeleton-loading-user-profile-item mt-3"
                  data-testid="user-profile-item"
                />
              ))}
            </div>
          </Container>
        );
      case 'UserManagement':
        for (let i = 0; i < 17; i += 1) {
          userManagementItems.push(
            <div
              key={i}
              className="skeleton-loading-user-management-item"
              data-testid="user-management-item"
            />,
          );
        }
        return <div>{userManagementItems}</div>;
      default:
        return null;
    }
  };
  return renderSkeletonTemplate();
};

export default SkeletonLoading;
