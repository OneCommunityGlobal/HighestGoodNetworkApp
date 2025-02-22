import { connect } from 'react-redux';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { Alert, Col, Container, Row } from 'reactstrap';
// import { MultiSelect } from 'react-multi-select-component';

import 'moment-timezone';
import moment from 'moment';

import hasPermission from 'utils/permissions';

// actions
import { getTotalOrgSummary } from 'actions/totalOrgSummary';
import { getAllUserProfile } from 'actions/userManagement';
import { getAllUsersTimeEntries } from 'actions/allUsersTimeEntries';
import { getTimeEntryForOverDate } from 'actions/index';
import { getTaskAndProjectStats } from 'actions/totalOrgSummary';

import Select from 'react-select';
import SkeletonLoading from '../common/SkeletonLoading';
import '../Header/DarkMode.css';
import './TotalOrgSummary.css';

// components
import VolunteerHoursDistribution from './VolunteerHoursDistribution/VolunteerHoursDistribution';
import AccordianWrapper from './AccordianWrapper/AccordianWrapper';
import VolunteerStatus from './VolunteerStatus/VolunteerStatus';
import VolunteerActivities from './VolunteerActivities/VolunteerActivities';
import VolunteerStatusChart from './VolunteerStatus/VolunteerStatusChart';
import BlueSquareStats from './BlueSquareStats/BlueSquareStats';
import TeamStats from './TeamStats/TeamStats';
import HoursCompletedBarChart from './HoursCompleted/HoursCompletedBarChart';
import HoursWorkList from './HoursWorkList/HoursWorkList';
import NumbersVolunteerWorked from './NumbersVolunteerWorked/NumbersVolunteerWorked';
import Loading from '../common/Loading';

import AnniversaryCelebrated from './AnniversaryCelebrated/AnniversaryCelebrated';
import RoleDistributionPieChart from './VolunteerRolesTeamDynamics/RoleDistributionPieChart';
import WorkDistributionBarChart from './VolunteerRolesTeamDynamics/WorkDistributionBarChart';

function calculateFromDate() {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  const dayOfWeek = currentDate.getDay();
  const daysToSubtract = dayOfWeek === 0 ? 0 : dayOfWeek;
  currentDate.setDate(currentDate.getDate() - daysToSubtract - 7);
  return currentDate.toISOString().split('T')[0];
}

function calculateToDate() {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  const dayOfWeek = currentDate.getDay();
  const daysToAdd = dayOfWeek === 6 ? 0 : -1 - dayOfWeek;
  currentDate.setDate(currentDate.getDate() + daysToAdd);
  return currentDate.toISOString().split('T')[0];
}

function calculateFromOverDate() {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  const dayOfWeek = currentDate.getDay();
  const daysToSubtract = dayOfWeek === 0 ? 0 : dayOfWeek;
  currentDate.setDate(currentDate.getDate() - daysToSubtract - 14);
  return currentDate.toISOString().split('T')[0];
}

function calculateToOverDate() {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  const dayOfWeek = currentDate.getDay();
  const daysToAdd = dayOfWeek === 6 ? 0 : -8 - dayOfWeek;
  currentDate.setDate(currentDate.getDate() + daysToAdd);
  return currentDate.toISOString().split('T')[0];
}

const fromDate = calculateFromDate();
const toDate = calculateToDate();
const fromOverDate = calculateFromOverDate();
const toOverDate = calculateToOverDate();
const comparisonOptions = [
  {
    label: 'Week over week',
    value: 'lastweek',
  },
  {
    label: 'Same week last month',
    value: 'lastmonth',
  },
  {
    label: 'Same week last year',
    value: 'lastyear',
  },
  {
    label: 'Do not show comparison data',
    value: 'nocomparsion',
  },
];

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

function TotalOrgSummary(props) {

  const { darkMode, loading, error, allUserProfiles, volunteerOverview } = props;
  const [usersId, setUsersId] = useState([]);
  const [usersTimeEntries, setUsersTimeEntries] = useState([]);
  const [usersOverTimeEntries, setUsersOverTimeEntries] = useState([]);
  const [taskProjectHours, setTaskProjectHours] = useState([]);
  const [isVolunteerFetchingError, setIsVolunteerFetchingError] = useState(false);
  const [volunteerStats, setVolunteerStats] = useState(null);

  const [comparisonWeek, setComparisonWeek] = useState({ startDate: null, endDate: null });

  const dispatch = useDispatch();

  const allUsersTimeEntries = useSelector(state => state.allUsersTimeEntries);

  // State to hold the selected date range
  const [selectedDateRange, setSelectedDateRange] = useState({
    startDate: moment()
      .startOf('week')
      .format('YYYY-MM-DD'),
    endDate: moment()
      .endOf('week')
      .format('YYYY-MM-DD'),
  });

  const handleDateRangeChange = ({ startDate, endDate }) => {
    // console.log('Selected Date Range:', startDate, endDate);

    setSelectedDateRange({
      startDate: moment(startDate).format('YYYY-MM-DD'),
      endDate: moment(endDate).format('YYYY-MM-DD'),
    });
  };

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
    if (Array.isArray(usersId) && usersId.length > 0 && fromDate && toDate) {
      dispatch(getAllUsersTimeEntries(usersId, fromDate, toDate));
    }
  }, [usersId, fromDate, toDate, dispatch]);

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

  useEffect(() => {
    if (Array.isArray(usersId) && usersId.length > 0) {
      getTimeEntryForOverDate(usersId, fromOverDate, toOverDate)
        .then(response => {
          if (response && Array.isArray(response)) {
            setUsersOverTimeEntries(response);
          } else {
            // eslint-disable-next-line no-console
            console.log('error on fetching data');
          }
        })
        .catch(() => {
          // eslint-disable-next-line no-console
          console.log('error on fetching data');
        });
    }
  }, [allUsersTimeEntries, usersId, fromOverDate, toOverDate]);

  useEffect(() => {
    async function fetchData() {
      // const { taskHours, projectHours } = await props.getTaskAndProjectStats(fromDate, toDate);
      // const {
      //   taskHours: lastTaskHours,
      //   projectHours: lastProjectHours,
      // } = await props.getTaskAndProjectStats(fromOverDate, toOverDate);
      const {
        taskHours: { count: taskHours },
        projectHours: { count: projectHours },
      } = await props.getTaskAndProjectStats(fromDate, toDate);
      const {
        taskHours: { count: lastTaskHours },
        projectHours: { count: lastProjectHours },
      } = await props.getTaskAndProjectStats(fromOverDate, toOverDate);

      if (taskHours && projectHours) {
        setTaskProjectHours({
          taskHours,
          projectHours,
          lastTaskHours,
          lastProjectHours,
        });
      }
    }
    fetchData();
  }, [fromDate, toDate, fromOverDate, toOverDate]);

  useEffect(() => {
    const fetchVolunteerStats = async () => {
      try {
        const volunteerStatsResponse = await props.getTotalOrgSummary(fromDate, toDate);
        setVolunteerStats(volunteerStatsResponse.data);
        await props.hasPermission('');
      } catch (catchFetchError) {
        setIsVolunteerFetchingError(true);
      }
    };

    fetchVolunteerStats();
  }, [fromDate, toDate]);

  if (error || isVolunteerFetchingError) {
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
        darkMode ? 'bg-oxford-blue' : 'cbg--white-smoke'
      }`}
    >
      <Row className="d-flex align-items-center justify-content-between">
        <Col xs={12} sm={12} md={4} lg={4} className="d-flex align-items-center mb-sm-3 mb-md-0">
          <h3>Weekly Volunteer Summary</h3>
        </Col>

        <Col
          xs={12}
          sm={12}
          md={8}
          lg={8}
          className="d-flex justify-content-end align-items-center mb-0"
        >
          <div style={{ marginRight: '15px', width: '250px' }}>
            <DateRangeSelector onDateRangeChange={handleDateRangeChange} />
          </div>

          <div style={{ marginRight: '15px', width: '250px' }}>
            <Select
              options={comparisonOptions}
              onChange={handleComparisonPeriodChange}
              defaultValue={comparisonOptions.find(option => option.value === 'nocomparsion')}
            />
          </div>

          <button
            className={darkMode ? 'btn btn-outline-light' : 'btn btn-dark'}
            type="button"
            style={{ whiteSpace: 'nowrap' }}
          >
            Share PDF
          </button>
        </Col>
      </Row>

      <hr />
      <AccordianWrapper title="Volunteer Status">
        <Row>
          <Col lg={{ size: 12 }}>
            <div className="component-container">
              <VolunteerStatus
                volunteerNumberStats={volunteerStats?.volunteerNumberStats}
                totalHoursWorked={volunteerStats?.totalHoursWorked}
              />
            </div>
          </Col>
        </Row>
      </AccordianWrapper>
      <AccordianWrapper title="Volunteer Activities">
        <Row>
          <Col lg={{ size: 12 }}>
            <div className="component-container">
              <VolunteerActivities
                totalSummariesSubmitted={volunteerStats?.totalSummariesSubmitted}
                completedAssignedHours={volunteerStats?.completedAssignedHours}
                totalBadgesAwarded={volunteerStats?.totalBadgesAwarded}
                tasksStats={volunteerStats?.tasksStats}
                totalActiveTeams={volunteerStats?.totalActiveTeams}
              />
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
              <VolunteerStatusChart volunteerNumberStats={volunteerStats?.volunteerNumberStats} />
            </div>
          </Col>
        </Row>
      </AccordianWrapper>
      <AccordianWrapper title="Volunteer Workload and Task Completion Analysis">
        <Row
          className={`${darkMode ? 'bg-oxford-blue text-light' : 'cbg--white-smoke'} rounded-lg`}
        >
          <Col lg={{ size: 6 }}>
            <div className="component-container component-border">
              {(allUserProfiles.fetching || allUsersTimeEntries.loading) && (
                <div className="d-flex justify-content-center align-items-center0">
                  <div className="w-100vh ">
                    <Loading />
                  </div>
                </div>
              )}
              <div className="d-flex flex-row justify-content-center flex-wrap">
                {Array.isArray(usersTimeEntries) && usersTimeEntries.length > 0 && (
                  <>
                    <VolunteerHoursDistribution
                      darkMode={darkMode}
                      usersTimeEntries={usersTimeEntries}
                      usersOverTimeEntries={usersOverTimeEntries}
                    />
                    <div className="d-flex flex-column align-items-center justify-content-center">
                      <HoursWorkList darkMode={darkMode} usersTimeEntries={usersTimeEntries} />
                      <NumbersVolunteerWorked
                        usersTimeEntries={usersTimeEntries}
                        darkMode={darkMode}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </Col>
          <Col lg={{ size: 3 }}>
            <div className="component-container component-border">
              <span className="fw-bold"> Task Completed</span>
            </div>
          </Col>
          <Col lg={{ size: 3 }}>
            <div className="component-container component-border">
              <HoursCompletedBarChart data={taskProjectHours} darkMode={darkMode} />
            </div>
          </Col>
        </Row>
      </AccordianWrapper>
      <AccordianWrapper title="Volunteer Engagement Trends and Milestones">
        <Row>
          <Col lg={{ size: 7 }}>
            <div className="component-container component-border">
              <h4 className="text-center">Volunteer Trends by time</h4>
              <span className="text-center"> Work in progres...</span>
            </div>
          </Col>
          <Col lg={{ size: 5 }}>
            <div className="component-container component-border">
              <AnniversaryCelebrated
                fromDate={fromDate}
                toDate={toDate}
                fromOverDate={fromOverDate}
                toOverDate={toOverDate}
                darkMode={darkMode}
              />
            </div>
          </Col>
        </Row>
      </AccordianWrapper>
      <AccordianWrapper title="Volunteer Roles and Team Dynamics">
        <Row>
          <Col lg={{ size: 7 }}>
            <div className="component-container component-border">
              <div className="role-distribution-title">
                <p>Work Distribution</p>
              </div>
              <WorkDistributionBarChart
                workDistributionStats={volunteerOverview?.workDistributionStats}
              />
            </div>
          </Col>
          <Col lg={{ size: 5 }}>
            <div className="component-container component-border">
              <div className="role-distribution-title">
                <p>Role Distribution</p>
              </div>
              <RoleDistributionPieChart
                roleDistributionStats={volunteerOverview?.roleDistributionStats}
              />
            </div>
          </Col>
        </Row>
      </AccordianWrapper>
      <AccordianWrapper title="Volunteer Roles and Team Dynamics">
        <Row>
          <Col lg={{ size: 6 }}>
            <div className="component-container component-border">
              <TeamStats usersInTeamStats={volunteerStats?.usersInTeamStats} />
            </div>
          </Col>
          <Col lg={{ size: 6 }}>
            <div className="component-container component-border">
              <BlueSquareStats blueSquareStats={volunteerStats?.blueSquareStats} />
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

  volunteerOverview: state.totalOrgSummary.volunteerOverview,

  role: state.auth.user.role,
  auth: state.auth,
  darkMode: state.theme.darkMode,
  allUserProfiles: state.allUserProfiles,
});

const mapDispatchToProps = dispatch => ({

  getTotalOrgSummary: (startDate, endDate) => dispatch(getTotalOrgSummary(startDate, endDate)),

  getTaskAndProjectStats: () => dispatch(getTaskAndProjectStats(fromDate, toDate)),
  hasPermission: permission => dispatch(hasPermission(permission)),
  getAllUserProfile: () => dispatch(getAllUserProfile()),
  getTotalOrgSummary: (startDate, endDate, comparisonStartDate, comparisonEndDate) =>
    dispatch(getTotalOrgSummary(startDate, endDate, comparisonStartDate, comparisonEndDate)),
});

export default connect(mapStateToProps, mapDispatchToProps)(TotalOrgSummary);
