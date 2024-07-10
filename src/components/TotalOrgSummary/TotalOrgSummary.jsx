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
import './TotalOrgSummary.css';

// components
import VolunteerHoursDistribution from './VolunteerHoursDistribution/VolunteerHoursDistribution';
import AccordianWrapper from './AccordianWrapper/AccordianWrapper';

const startDate = '2016-01-01';
const endDate = new Date().toISOString().split('T')[0];

function TotalOrgSummary(props) {
  const { darkMode, loading, error } = props;

  useEffect(() => {
    props.getTotalOrgSummary(startDate, endDate);
    props.hasPermission('');
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
              <article
                style={{
                  display: 'flex',
                  justifyContent: 'space-around',
                  flexWrap: 'wrap',
                  width: '100%',
                  alignItems: 'center',
                  marginTop: '2rem',
                  marginBottom: '2rem',
                }}
              >
                {volunteerStatusTabs.map(volunteerStatusTab => (
                  <StatisticsTab
                    title={volunteerStatusTab.title}
                    number={volunteerStatusTab.number}
                    percentageChange={volunteerStatusTab.percentageChange}
                    type={volunteerStatusTab.type}
                    isIncreased={volunteerStatusTab.isIncreased}
                    tabBackgroundColor={volunteerStatusTab.tabBackgroundColor}
                    shapeBackgroundColor={volunteerStatusTab.shapeBackgroundColor}
                    key={volunteerStatusTab.type}
                  />
                ))}
              </article>
            </div>
          </Col>
        </Row>
      </AccordianWrapper>
      <AccordianWrapper title="Volunteer Activities">
        <Row>
          <Col lg={{ size: 12 }}>
            <div className="component-container">
              <article
                style={{
                  display: 'flex',
                  justifyContent: 'space-around',
                  flexWrap: 'wrap',
                  width: '100%',
                  alignItems: 'center',
                  marginTop: '2rem',
                }}
              >
                {volunteerActivitiesTab.map(volunteerActivityTab => (
                  <StatisticsTab
                    title={volunteerActivityTab.title}
                    number={volunteerActivityTab.number}
                    percentageChange={volunteerActivityTab.percentageChange}
                    type={volunteerActivityTab.type}
                    isIncreased={volunteerActivityTab.isIncreased}
                    tabBackgroundColor={volunteerActivityTab.tabBackgroundColor}
                    shapeBackgroundColor={volunteerActivityTab.shapeBackgroundColor}
                    key={volunteerActivityTab.type}
                  />
                ))}
              </article>
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
              <VolunteerHoursDistribution />
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
  hasPermission: permission => dispatch(hasPermission(permission)),
});

export default connect(mapStateToProps, mapDispatchToProps)(TotalOrgSummary);
