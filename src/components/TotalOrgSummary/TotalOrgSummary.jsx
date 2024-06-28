/* eslint-disable react/forbid-prop-types */
import { connect } from 'react-redux';
import { useEffect } from 'react';
import { Alert, Col, Container, Row } from 'reactstrap';
import hasPermission from 'utils/permissions';
import { getTotalOrgSummary } from 'actions/totalOrgSummary';
import SkeletonLoading from '../common/SkeletonLoading';
import StatisticsTab from './StatisticsTab/StatisticsTab';
import '../Header/DarkMode.css';
import {
  VOLUNTEER_STATUS_TAB as volunteerStatusTabs,
  VOLUNTEER_ACTIVITIES_TAB as volunteerActivitiesTab,
} from '../../constants/totalOrgSummary';

const startDate = '2016-01-01';
const endDate = new Date().toISOString().split('T')[0];

function TotalOrgSummary(props) {
  const { darkMode, loading, error } = props;

  useEffect(() => {
    props.getTotalOrgSummary(startDate, endDate);
    props.hasPermission();
  }, [startDate, endDate, getTotalOrgSummary, hasPermission]);

  if (error) {
    return (
      <Container className={`container-wsr-wrapper ${darkMode ? 'bg-oxford-blue' : ''}`}>
        <Row
          className="align-self-center pt-2"
          data-testid="error"
          style={{ width: '30%', margin: '0 auto' }}
        >
          <Col>
            <Alert color="danger">Error! {error.message}</Alert>
          </Col>
        </Row>
      </Container>
    );
  }
  if (loading) {
    return (
      <Container fluid style={{ backgroundColor: darkMode ? '#1B2A41' : '#f3f4f6' }}>
        <Row className="text-center" data-testid="loading">
          <SkeletonLoading
            template="WeeklyVolunteerSummaries"
            className={darkMode ? 'bg-yinmn-blue' : ''}
          />
        </Row>
      </Container>
    );
  }
  return (
    <Container fluid>
      <h1>Total Org Summary</h1>

      <section
        className="volunteer-status"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          width: '100%',
          padding: '6rem',
          flexDirection: 'column',
        }}
      >
        <h2>Volunteer Status</h2>
        <article
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            width: '100%',
            alignItems: 'center',
            marginTop: '2rem',
            marginBottom: '2rem',
          }}
        >
          {volunteerStatusTabs.map((volunteerStatusTab, volunteerStatusTabIndex) => (
            <StatisticsTab {...volunteerStatusTab} key={volunteerStatusTab.type} />
          ))}
        </article>

        <h2>Volunteer Activity</h2>

        <article
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            width: '100%',
            alignItems: 'center',
            marginTop: '2rem',
          }}
        >
          {volunteerActivitiesTab.map((volunteerActivityTab, volunteerActivityTabIndex) => (
            <StatisticsTab {...volunteerActivityTab} key={volunteerActivityTab.title} />
          ))}
        </article>
      </section>
    </Container>
  );
}

// WeeklyVolunteerSummary.propTypes = {
//   error: PropTypes.any,
//   loading: PropTypes.bool.isRequired,
//   volunteerstats: PropTypes.array.isRequired,
// };

const mapStateToProps = state => ({
  error: state.error,
  loading: state.loading,
  volunteerstats: state.volunteerstats,
  role: state.auth.user.role,
  auth: state.auth,
  darkMode: state.theme.darkMode,
});

const mapDispatchToProps = dispatch => ({
  getTotalOrgSummary: () => dispatch(getTotalOrgSummary(startDate, endDate)),
  hasPermission: permission => dispatch(hasPermission(permission)),
});

export default connect(mapStateToProps, mapDispatchToProps)(TotalOrgSummary);
