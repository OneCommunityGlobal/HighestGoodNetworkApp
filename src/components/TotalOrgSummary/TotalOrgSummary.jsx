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
import Loading from '../common/Loading';

const fromDate = '2024-07-10';
const toDate = '2024-07-19';

function TotalOrgSummary(props) {
  const { darkMode, loading, error, allUserProfiles } = props;

  const [usersId, setUsersId] = useState([]);
  const [usersTimeEntries, setUsersTimeEntries] = useState([]);
  const dispatch = useDispatch();

  const allUsersTimeEntries = useSelector(state => state.allUsersTimeEntries);

  useEffect(() => {
    dispatch(getAllUserProfile());
  }, []);

  useEffect(() => {
    if (Array.isArray(allUserProfiles.userProfiles) && allUserProfiles.userProfiles.length > 0) {
      const idsList = allUserProfiles.userProfiles.reduce((acc, user) => {
        if (user.isActive) acc.push(user._id);
        return acc;
      }, []);
      setUsersId(idsList);
    }
  }, [allUserProfiles]);

  useEffect(() => {
    if (Array.isArray(usersId) && usersId.length > 0) {
      dispatch(getAllUsersTimeEntries(usersId, fromDate, toDate));
    }
  }, [usersId, fromDate, toDate, dispatch]);

  const aggregateTimeEntries = userTimeEntries => {
    const aggregatedEntries = {};

    userTimeEntries.forEach(entry => {
      const { personId, hours, minutes } = entry;
      if (!aggregatedEntries[personId]) {
        aggregatedEntries[personId] = {
          hours: parseInt(hours, 10),
          minutes: parseInt(minutes, 10),
        };
      } else {
        aggregatedEntries[personId].hours += parseInt(hours, 10);
        aggregatedEntries[personId].minutes += parseInt(minutes, 10);
      }
    });

    Object.keys(aggregatedEntries).forEach(personId => {
      const totalMinutes = aggregatedEntries[personId].minutes;
      const additionalHours = Math.floor(totalMinutes / 60);
      aggregatedEntries[personId].hours += additionalHours;
      aggregatedEntries[personId].minutes = totalMinutes % 60;
    });

    const result = Object.entries(aggregatedEntries).map(([personId, { hours, minutes }]) => ({
      personId,
      hours,
      minutes,
    }));

    return result;
  };

  useEffect(() => {
    if (
      !Array.isArray(allUsersTimeEntries.usersTimeEntries) ||
      allUsersTimeEntries.usersTimeEntries.length === 0
    ) {
      return;
    }

    const aggregatedEntries = aggregateTimeEntries(allUsersTimeEntries.usersTimeEntries);
    setUsersTimeEntries(aggregatedEntries);
  }, [allUsersTimeEntries]);

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
              {(allUserProfiles.fetching || allUsersTimeEntries.loading) && (
                <div className="d-flex justify-content-center align-items-center0">
                  <div className="w-100vh ">
                    <Loading />
                  </div>
                </div>
              )}
              <div className="d-flex flex-row justify-content-center">
                {Array.isArray(usersTimeEntries) && usersTimeEntries.length > 0 && (
                  <>
                    <VolunteerHoursDistribution
                      darkMode={darkMode}
                      usersTimeEntries={usersTimeEntries}
                    />
                    <div className="d-flex flex-column align-items-center justify-content-center">
                      <HoursWorkList darkMode={darkMode} usersTimeEntries={usersTimeEntries} />
                      <NumbersVolunteerWorked usersTimeEntries={usersTimeEntries} />
                    </div>
                  </>
                )}
              </div>
            </div>
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
  totalOrgSummary: state.totalOrgSummary,
  role: state.auth.user.role,
  auth: state.auth,
  darkMode: state.theme.darkMode,
  allUserProfiles: state.allUserProfiles,
});

const mapDispatchToProps = dispatch => ({
  getTotalOrgSummary: () => dispatch(getTotalOrgSummary(fromDate, toDate)),
  hasPermission: permission => dispatch(hasPermission(permission)),
  getAllUserProfile: () => dispatch(getAllUserProfile()),
});

export default connect(mapStateToProps, mapDispatchToProps)(TotalOrgSummary);
