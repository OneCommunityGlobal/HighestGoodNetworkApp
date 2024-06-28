/* eslint-disable react/forbid-prop-types */
import { connect } from 'react-redux';
import { useEffect } from 'react';
import { Alert, Col, Container, Row } from 'reactstrap';
import hasPermission from 'utils/permissions';
import { getTotalOrgSummary } from 'actions/totalOrgSummary';
import SkeletonLoading from '../common/SkeletonLoading';
import StatisticsTab from './StatisticsTab';
import '../Header/DarkMode.css';

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
        }}
      >
        <StatisticsTab
          title="Active Volunteers"
          number={150}
          percentageChange={5}
          type="active-volunteers"
          isIncreased={true}
        />
        <StatisticsTab
          title="New Volunteers"
          number={30}
          percentageChange={10}
          type="new-volunteers"
          isIncreased={true}
        />
        <StatisticsTab
          title="Deactivated Volunteers"
          number={5}
          percentageChange={2}
          type="deactivated-volunteers"
          isIncreased={false}
        />
        <StatisticsTab
          title="Total Hours Worked"
          number={1000}
          percentageChange={8}
          type="total-hours-worked"
          isIncreased={true}
        />
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
