/* eslint-disable react/forbid-prop-types */
import { connect } from 'react-redux';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { Alert, Col, Container, Row } from 'reactstrap';

import hasPermission from 'utils/permissions';

// actions
import { getTotalOrgSummary } from 'actions/totalOrgSummary';
import { getAllUserProfile } from 'actions/userManagement';
import { getAllUsersTimeEntries } from 'actions/allUsersTimeEntries';

import SkeletonLoading from '../common/SkeletonLoading';
import '../Header/DarkMode.css';
import './TotalOrgSummary.css';

// components
import VolunteerHoursDistribution from './VolunteerHoursDistribution/VolunteerHoursDistribution';
import AccordianWrapper from './AccordianWrapper/AccordianWrapper';
import HoursWorkList from './HoursWorkList/HoursWorkList';
import NumbersVolunteerWorked from './NumbersVolunteerWorked/NumbersVolunteerWorked';

const fromDate = '2024-06-01';
// const toDate = new Date().toISOString().split('T')[0];
const toDate = '2024-07-01';

function TotalOrgSummary(props) {
  // eslint-disable-next-line no-console
  // console.log('props', props);
  const { darkMode, loading, error } = props;

  const [usersId, setUsersId] = useState([]);
  const [volunteerHoursStats, setVolunteerHoursStats] = useState([]);

  const dispatch = useDispatch();

  const totalOrgSummary = useSelector(state => state.totalOrgSummary);
  const allUserProfiles = useSelector(state => state.allUserProfiles);
  const allUsersTimeEntries = useSelector(state => state.allUsersTimeEntries);

  useEffect(() => {
    dispatch(getAllUserProfile());
  }, []);

  useEffect(() => {
    dispatch(getTotalOrgSummary(fromDate, toDate));
  }, [fromDate, toDate, dispatch]);

  useEffect(() => {
    if (Array.isArray(usersId) && usersId.length > 0) {
      dispatch(getAllUsersTimeEntries(usersId, fromDate, toDate));
    }
  }, [usersId, fromDate, toDate, dispatch]);

  useEffect(() => {
    // eslint-disable-next-line no-console
    // console.log('All User Profile', allUserProfiles);

    if (Array.isArray(allUserProfiles.userProfiles) && allUserProfiles.userProfiles.length > 0) {
      const idsList = allUserProfiles.userProfiles.reduce((acc, user) => {
        if (user.isActive) acc.push(user._id);
        return acc;
      }, []);
      setUsersId(idsList);
    }
  }, [allUserProfiles]);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('Users Ids', usersId);
  }, [usersId]);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('All Users Time ENtries', allUsersTimeEntries);
  }, [allUsersTimeEntries]);

  // useEffect(() => {
  //   // eslint-disable-next-line no-console
  //   console.log('totalOrgSummary', totalOrgSummary);
  // }, [totalOrgSummary]);

  useEffect(() => {
    if (
      !totalOrgSummary.loading &&
      Array.isArray(totalOrgSummary.volunteerstats?.volunteerHoursStats?.hoursStats) &&
      totalOrgSummary.volunteerstats.volunteerHoursStats.hoursStats.length > 0
    ) {
      setVolunteerHoursStats(totalOrgSummary.volunteerstats.volunteerHoursStats.hoursStats);
    }
  }, [
    totalOrgSummary,
    totalOrgSummary.loading,
    totalOrgSummary.volunteerstats?.volunteerHoursStats?.hoursStats,
  ]);

  // useEffect(() => {
  //   // eslint-disable-next-line no-console
  //   console.log('volunteerHoursStats updated', volunteerHoursStats);
  // }, [volunteerHoursStats]);

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
            <div className="component-container component-border" style={{ position: 'relative' }}>
              <div className="d-flex flex-row justify-content-end">
                {Array.isArray(volunteerHoursStats) && volunteerHoursStats.length > 0 && (
                  <>
                    <VolunteerHoursDistribution
                      darkMode={darkMode}
                      volunteerHoursStats={volunteerHoursStats}
                    />
                    <div className="d-flex flex-column align-items-center justify-content-center">
                      <HoursWorkList
                        darkMode={darkMode}
                        volunteerHoursStats={volunteerHoursStats}
                      />
                      <NumbersVolunteerWorked />
                    </div>
                  </>
                )}
              </div>
              {/* <p
                className="component-border component-pie-chart-label"
                style={{
                  position: 'absolute',
                  bottom: '5%',
                  right: '5%',
                  width: '20%',
                  padding: '5px',
                }}
              >
                {'xxx '}
                Volunteers worked over assigned time
              </p> */}
            </div>
            {/* <div>
              <span>{JSON.stringify(totalOrgSummary)}</span>
            </div> */}
          </Col>
          <Col lg={{ size: 3 }}>
            <div className="component-container component-border">
              <span> task Completed</span>
            </div>
          </Col>
          <Col lg={{ size: 3 }}>
            <div className="component-container component-border">
              <span>hours completed </span>
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
  getTotalOrgSummary: () => dispatch(getTotalOrgSummary(fromDate, toDate)),
  hasPermission: permission => dispatch(hasPermission(permission)),
});

export default connect(mapStateToProps, mapDispatchToProps)(TotalOrgSummary);
