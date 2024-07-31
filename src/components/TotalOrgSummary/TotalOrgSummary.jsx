/* eslint-disable react/forbid-prop-types */
import { connect } from 'react-redux';
import { useEffect, useState } from 'react';
import { Alert, Col, Container, Row } from 'reactstrap';
import moment from 'moment';
import 'moment-timezone';

import hasPermission from 'utils/permissions';
import { getTotalOrgSummary, getTaskAndProjectStats} from 'actions/totalOrgSummary';
import SkeletonLoading from '../common/SkeletonLoading';
import '../Header/DarkMode.css';
import './TotalOrgSummary.css';

// components
import VolunteerHoursDistribution from './VolunteerHoursDistribution/VolunteerHoursDistribution';
import AccordianWrapper from './AccordianWrapper/AccordianWrapper';
import HoursCompletedBarChart from './HoursCompleted/HoursCompletedBarChart';

const startDate = '2016-01-01'
const endDate = moment()
.tz('America/Los_Angeles')
.endOf('week')
.toISOString()
const lastStartDate = moment()
.tz('America/Los_Angeles')
.endOf('week')
.subtract(2, 'week')
.toISOString()
const lastEndDate = moment()
.tz('America/Los_Angeles')
.endOf('week')
.subtract(1, 'week')
.toISOString()

function TotalOrgSummary(props) {
  const { darkMode, loading, error } = props;
  const [taskProjectHours, setTaskProjectHours] = useState([]);

  useEffect(() => {
    // props.getTotalOrgSummary(startDate, endDate);
    // props.getTaskAndProjectStats(startDate, endDate);
    // props.hasPermission('');
    async function fetchData() {

      const { taskHours, projectHours } = await props.getTaskAndProjectStats(startDate, endDate);
      const { taskHours: lastTaskHours, projectHours: lastProjectHours } = await props.getTaskAndProjectStats(lastStartDate, lastEndDate);
      if (taskHours && projectHours) {
        setTaskProjectHours({ taskHours: taskHours, projectHours: projectHours, lastTaskHours: lastTaskHours, lastProjectHours: lastProjectHours });
      }
    }
    fetchData();
    // props.hasPermission('');
  }, [startDate, endDate]);

  
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
    <Container
      fluid
      className={`container-total-org-wrapper py-3 mb-5 ${
        darkMode ? 'bg-oxford-blue text-light' : 'cbg--white-smoke'
      }`}
    >
      <Row>
        <Col lg={{ size: 12 }}>
          <h3 className="mt-3 mb-5">Total Org Summary</h3>
        </Col>
      </Row>
      <hr />
      <AccordianWrapper title="Volunteer Status">
        <Row>
          <Col lg={{ size: 12 }}>
            <div className="component-container">
              <VolunteerHoursDistribution />
            </div>
          </Col>
        </Row>
      </AccordianWrapper>
      <AccordianWrapper title="Volunteer Activities">
        <Row>
          <Col lg={{ size: 12 }}>
            <div className="component-container">
              <VolunteerHoursDistribution />
            </div>
          </Col>
        </Row>
      </AccordianWrapper>
      <AccordianWrapper title="Global Distribution and Volunteer Status Overview">
        <Row>
          <Col lg={{ size: 6 }}>
            <div className="component-container component-border">
              <VolunteerHoursDistribution />
            </div>
          </Col>
          <Col lg={{ size: 6 }}>
            <div className="component-container component-border">
              <VolunteerHoursDistribution />
            </div>
          </Col>
        </Row>
      </AccordianWrapper>
      <AccordianWrapper title="Volunteer Workload and Task Completion Analysis">
        <Row>
          <Col lg={{ size: 6 }}>
            <div className="component-container component-border">
              <VolunteerHoursDistribution />
            </div>
          </Col>
          <Col lg={{ size: 3 }}>
            <div className="component-container component-border">
              <VolunteerHoursDistribution />
            </div>
          </Col>
          <Col lg={{ size: 3 }}>
            <div className="component-container component-border">
              <HoursCompletedBarChart data={taskProjectHours}/>
            </div>
          </Col>
        </Row>
      </AccordianWrapper>
      <AccordianWrapper title="Volunteer Engagement Trends and Milestones">
        <Row>
          <Col lg={{ size: 7 }}>
            <div className="component-container component-border">
              <VolunteerHoursDistribution />
            </div>
          </Col>
          <Col lg={{ size: 5 }}>
            <div className="component-container component-border">
              <VolunteerHoursDistribution />
            </div>
          </Col>
        </Row>
      </AccordianWrapper>
      <AccordianWrapper title="Volunteer Roles and Team Dynamics">
        <Row>
          <Col lg={{ size: 7 }}>
            <div className="component-container component-border">
              <VolunteerHoursDistribution />
            </div>
          </Col>
          <Col lg={{ size: 5 }}>
            <div className="component-container component-border">
              <VolunteerHoursDistribution />
            </div>
          </Col>
        </Row>
      </AccordianWrapper>
      <AccordianWrapper title="Volunteer Roles and Team Dynamics">
        <Row>
          <Col lg={{ size: 6 }}>
            <div className="component-container component-border">
              <VolunteerHoursDistribution />
            </div>
          </Col>
          <Col lg={{ size: 6 }}>
            <div className="component-container component-border">
              <VolunteerHoursDistribution />
            </div>
          </Col>
        </Row>
      </AccordianWrapper>
    </Container>
  );
}

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
  getTaskAndProjectStats: () => dispatch(getTaskAndProjectStats(startDate, endDate)),
  hasPermission: permission => dispatch(hasPermission(permission)),
});

export default connect(mapStateToProps, mapDispatchToProps)(TotalOrgSummary);
