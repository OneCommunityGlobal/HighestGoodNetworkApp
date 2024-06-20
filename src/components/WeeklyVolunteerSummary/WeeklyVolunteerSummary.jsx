/* eslint-disable react/forbid-prop-types */
import { connect } from 'react-redux';
import { useSelector } from 'react-redux';
import { Alert, Col, Container, Row } from 'reactstrap';
import hasPermission from 'utils/permissions';
import { getWeeklyVolunteerSummaries } from 'actions/weeklyVolunteerSummary';
import SkeletonLoading from '../common/SkeletonLoading';

function WeeklyVolunteerSummary({ error, loading }) {
  const darkMode = useSelector(state => state.theme.darkMode);
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
            template="WeeklySummariesReport"
            className={darkMode ? 'bg-yinmn-blue' : ''}
          />
        </Row>
      </Container>
    );
  }
  return (
    <Container>
      <h1>Weekly Volunteer Summary</h1>
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
  getWeeklyVolunteerSummary: () => dispatch(getWeeklyVolunteerSummaries()),
  hasPermission: permission => dispatch(hasPermission(permission)),
});

export default connect(mapStateToProps, mapDispatchToProps)(WeeklyVolunteerSummary);
