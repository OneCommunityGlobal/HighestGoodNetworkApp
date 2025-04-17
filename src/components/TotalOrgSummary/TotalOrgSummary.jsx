import { connect } from 'react-redux';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { Alert, Col, Container, Row, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'moment-timezone';

import hasPermission from 'utils/permissions';

// actions
import { getTotalOrgSummary } from 'actions/totalOrgSummary';
import { getAllUserProfile } from 'actions/userManagement';
import { getAllUsersTimeEntries } from 'actions/allUsersTimeEntries';
import { getTimeEntryForOverDate } from 'actions/index';
import { getTaskAndProjectStats } from 'actions/totalOrgSummary';

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

function calculateComparisonDates(comparisonType, fromDate, toDate) {
  const start = new Date(fromDate);
  const end = new Date(toDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  switch (comparisonType) {
    case 'Week Over Week':
      return {
        comparisonStartDate: new Date(start.setDate(start.getDate() - diffDays)).toISOString().split('T')[0],
        comparisonEndDate: new Date(end.setDate(end.getDate() - diffDays)).toISOString().split('T')[0]
      };
    case 'Month Over Month':
      return {
        comparisonStartDate: new Date(start.setMonth(start.getMonth() - 1)).toISOString().split('T')[0],
        comparisonEndDate: new Date(end.setMonth(end.getMonth() - 1)).toISOString().split('T')[0]
      };
    case 'Year Over Year':
      return {
        comparisonStartDate: new Date(start.setFullYear(start.getFullYear() - 1)).toISOString().split('T')[0],
        comparisonEndDate: new Date(end.setFullYear(end.getFullYear() - 1)).toISOString().split('T')[0]
      };
    default:
      return {
        comparisonStartDate: null,
        comparisonEndDate: null
      };
  }
}

const fromDate = calculateFromDate();
const toDate = calculateToDate();
const fromOverDate = calculateFromOverDate();
const toOverDate = calculateToOverDate();

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
  const { darkMode, error, allUserProfiles, volunteerOverview } = props;
  const [usersId, setUsersId] = useState([]);
  const [usersTimeEntries, setUsersTimeEntries] = useState([]);
  const [usersOverTimeEntries, setUsersOverTimeEntries] = useState([]);
  const [taskProjectHours, setTaskProjectHours] = useState([]);
  const [isVolunteerFetchingError, setIsVolunteerFetchingError] = useState(false);
  const [volunteerStats, setVolunteerStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRangeDropdownOpen, setDateRangeDropdownOpen] = useState(false);
  const [comparisonDropdownOpen, setComparisonDropdownOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('Current Week');
  const [selectedComparison, setSelectedComparison] = useState('No Comparison');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [currentFromDate, setCurrentFromDate] = useState(fromDate);
  const [currentToDate, setCurrentToDate] = useState(toDate);

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
    if (Array.isArray(usersId) && usersId.length > 0 && currentFromDate && currentToDate) {
      dispatch(getAllUsersTimeEntries(usersId, currentFromDate, currentToDate));
    }
  }, [usersId, currentFromDate, currentToDate, dispatch]);

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
      const {
        taskHours: { count: taskHours },
        projectHours: { count: projectHours },
      } = await props.getTaskAndProjectStats(currentFromDate, currentToDate);
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
  }, [currentFromDate, currentToDate, fromOverDate, toOverDate]);

  useEffect(() => {
    const fetchVolunteerStats = async () => {
      try {
        const { comparisonStartDate, comparisonEndDate } = calculateComparisonDates(
          selectedComparison,
          currentFromDate,
          currentToDate
        );
        
        const volunteerStatsResponse = await props.getTotalOrgSummary(
          currentFromDate,
          currentToDate,
          comparisonStartDate,
          comparisonEndDate
        );
        setVolunteerStats(volunteerStatsResponse.data);
        await props.hasPermission('');
        setIsLoading(false);
      } catch (catchFetchError) {
        setIsVolunteerFetchingError(true);
      }
    };

    fetchVolunteerStats();
  }, [currentFromDate, currentToDate, selectedComparison]);

  const handleDateRangeSelect = option => {
    if (option === 'Select Date Range') {
      setShowDatePicker(true);
    } else {
      setSelectedDateRange(option);
      setShowDatePicker(false);
      setSelectedComparison('No Comparison');
      
      if (option === 'Current Week') {
        setCurrentFromDate(fromDate);
        setCurrentToDate(toDate);
      } else if (option === 'Previous Week') {
        const prevWeekStart = new Date(fromDate);
        const prevWeekEnd = new Date(toDate);
        prevWeekStart.setDate(prevWeekStart.getDate() - 7);
        prevWeekEnd.setDate(prevWeekEnd.getDate() - 7);
        setCurrentFromDate(prevWeekStart.toISOString().split('T')[0]);
        setCurrentToDate(prevWeekEnd.toISOString().split('T')[0]);
      }
    }
  };

  const handleDatePickerSubmit = () => {
    if (startDate && endDate) {
      setSelectedDateRange(`${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`);
      setShowDatePicker(false);
      setSelectedComparison('No Comparison');
      
      setCurrentFromDate(startDate.toISOString().split('T')[0]);
      setCurrentToDate(endDate.toISOString().split('T')[0]);
    }
  };

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

  return (
    <Container
      fluid
      className={`container-total-org-wrapper py-3 mb-5 ${
        darkMode ? 'bg-oxford-blue text-light' : 'cbg--white-smoke'
      }`}
    >
      <Row className="d-flex justify-content-between align-items-center">
        <Col lg={{ size: 6 }}>
          <h3 className="mt-3 mb-5">Total Org Summary</h3>
        </Col>
        <Col lg={{ size: 6 }} className="d-flex justify-content-end">
          <Dropdown
            isOpen={dateRangeDropdownOpen}
            toggle={() => setDateRangeDropdownOpen(!dateRangeDropdownOpen)}
          >
            <DropdownToggle caret>{selectedDateRange}</DropdownToggle>
            <DropdownMenu>
              <DropdownItem onClick={() => handleDateRangeSelect('Current Week')}>
                Current Week
              </DropdownItem>
              <DropdownItem onClick={() => handleDateRangeSelect('Previous Week')}>
                Previous Week
              </DropdownItem>
              <DropdownItem onClick={() => handleDateRangeSelect('Select Date Range')}>
                Select Date Range
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <div style={{ width: '25px' }} />
          <Dropdown
            isOpen={comparisonDropdownOpen}
            toggle={() => setComparisonDropdownOpen(!comparisonDropdownOpen)}
          >
            <DropdownToggle caret>{selectedComparison}</DropdownToggle>
            <DropdownMenu>
              <DropdownItem onClick={() => setSelectedComparison('No Comparison')}>
                No Comparison
              </DropdownItem>
              <DropdownItem onClick={() => setSelectedComparison('Week Over Week')}>
                Week Over Week
              </DropdownItem>
              <DropdownItem onClick={() => setSelectedComparison('Month Over Month')}>
                Month Over Month
              </DropdownItem>
              <DropdownItem onClick={() => setSelectedComparison('Year Over Year')}>
                Year Over Year
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </Col>
      </Row>

      <Modal isOpen={showDatePicker} toggle={() => setShowDatePicker(!showDatePicker)}>
        <ModalHeader toggle={() => setShowDatePicker(!showDatePicker)}>
          Select Date Range
        </ModalHeader>
        <ModalBody>
          <div className="d-flex flex-column gap-4">
            <div>
              <label style={{ display: 'block', marginBottom: '1rem' }}>Start Date</label>
              <div style={{ padding: '0.5rem 0' }}>
                <DatePicker
                  selected={startDate}
                  onChange={date => setStartDate(date)}
                  className="form-control"
                  dateFormat="MM/dd/yyyy"
                  placeholderText="Select start date"
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '1rem' }}>End Date</label>
              <div style={{ padding: '0.5rem 0' }}>
                <DatePicker
                  selected={endDate}
                  onChange={date => setEndDate(date)}
                  className="form-control"
                  dateFormat="MM/dd/yyyy"
                  placeholderText="Select end date"
                  minDate={startDate}
                />
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setShowDatePicker(false)}>
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={handleDatePickerSubmit}
            disabled={!startDate || !endDate}
          >
            Apply
          </Button>
        </ModalFooter>
      </Modal>

      <hr />
      <AccordianWrapper title="Volunteer Status">
        <Row>
          <Col lg={{ size: 12 }}>
            <div className="component-container">
              <VolunteerStatus
                isLoading={isLoading}
                volunteerNumberStats={volunteerStats?.volunteerNumberStats}
                totalHoursWorked={volunteerStats?.totalHoursWorked}
                comparisonType={selectedComparison}
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
                isLoading={isLoading}
                totalSummariesSubmitted={volunteerStats?.totalSummariesSubmitted}
                completedAssignedHours={volunteerStats?.completedAssignedHours}
                totalBadgesAwarded={volunteerStats?.totalBadgesAwarded}
                tasksStats={volunteerStats?.tasksStats}
                totalActiveTeams={volunteerStats?.totalActiveTeams}
                comparisonType={selectedComparison}
              />
            </div>
          </Col>
        </Row>
      </AccordianWrapper>
      <AccordianWrapper title="Global Distribution and Volunteer Status Overview">
        <Row>
          <Col lg={{ size: 6 }}>
            <div className="component-container component-border">
              <div className="chart-title">
                <p>Global Volunteer Network: Uniting Communities Worldwide</p>
              </div>
              In progress...
            </div>
          </Col>
          <Col lg={{ size: 6 }}>
            <div className="component-container component-border">
              <div className="chart-title">
                <p>Volunteer Status</p>
              </div>
              <VolunteerStatusChart
                isLoading={isLoading}
                volunteerNumberStats={volunteerStats?.volunteerNumberStats}
                comparisonType={selectedComparison}
              />
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
              <div className="chart-title">
                <p>Volunteer Hours Distribution</p>
              </div>
              <div className="d-flex flex-row justify-content-center flex-wrap my-4">
                <VolunteerHoursDistribution
                  isLoading={isLoading}
                  darkMode={darkMode}
                  usersTimeEntries={usersTimeEntries}
                  usersOverTimeEntries={usersOverTimeEntries}
                  hoursData={volunteerStats?.volunteerHoursStats}
                  comparisonType={selectedComparison}
                />
                <div className="d-flex flex-column align-items-center justify-content-center">
                  <HoursWorkList darkMode={darkMode} usersTimeEntries={usersTimeEntries} />
                  <NumbersVolunteerWorked
                    isLoading={isLoading}
                    usersTimeEntries={usersTimeEntries}
                    darkMode={darkMode}
                  />
                </div>
              </div>
            </div>
          </Col>
          <Col lg={{ size: 3 }}>
            <div className="component-container component-border">
              <div className="chart-title">
                <p>Task Completed</p>
              </div>
            </div>
          </Col>
          <Col lg={{ size: 3 }}>
            <div className="component-container component-border">
              <div className="chart-title">
                <p>Hours Completed</p>
              </div>
              <div className="mt-4">
                <HoursCompletedBarChart
                  isLoading={isLoading}
                  data={taskProjectHours}
                  darkMode={darkMode}
                  comparisonType={selectedComparison}
                />
              </div>
            </div>
          </Col>
        </Row>
      </AccordianWrapper>
      <AccordianWrapper title="Volunteer Engagement Trends and Milestones">
        <Row>
          <Col lg={{ size: 7 }}>
            <div className="component-container component-border">
              <div className="chart-title">
                <p>Volunteer Trends by Time</p>
              </div>
              <span className="text-center"> Work in progres...</span>
            </div>
          </Col>
          <Col lg={{ size: 5 }}>
            <div className="component-container component-border">
              <div className="chart-title">
                <p>Anniversary Celebrated</p>
              </div>
              <AnniversaryCelebrated
                isLoading={isLoading}
                data={volunteerStats?.anniversaryStats}
                darkMode={darkMode}
                comparisonType={selectedComparison}
              />
            </div>
          </Col>
        </Row>
      </AccordianWrapper>
      <AccordianWrapper title="Volunteer Roles and Team Dynamics">
        <Row>
          <Col lg={{ size: 7 }}>
            <div className="component-container component-border">
              <div className="chart-title">
                <p>Work Distribution</p>
              </div>
              <WorkDistributionBarChart
                isLoading={isLoading}
                workDistributionStats={volunteerOverview?.workDistributionStats}
                comparisonType={selectedComparison}
              />
            </div>
          </Col>
          <Col lg={{ size: 5 }}>
            <div className="component-container component-border">
              <div className="chart-title">
                <p>Role Distribution</p>
              </div>
              <RoleDistributionPieChart
                isLoading={isLoading}
                roleDistributionStats={volunteerOverview?.roleDistributionStats}
                comparisonType={selectedComparison}
              />
            </div>
          </Col>
        </Row>
      </AccordianWrapper>
      <AccordianWrapper title="Volunteer Roles and Team Dynamics">
        <Row>
          <Col lg={{ size: 6 }}>
            <div className="component-container component-border">
              <div className="chart-title">
                <p>Team Stats</p>
              </div>
              <TeamStats
                isLoading={isLoading}
                usersInTeamStats={volunteerStats?.usersInTeamStats}
                endDate={currentToDate}
                comparisonType={selectedComparison}
              />
            </div>
          </Col>
          <Col lg={{ size: 6 }}>
            <div className="component-container component-border">
              <div className="chart-title">
                <p>Blue Square Stats</p>
              </div>
              <BlueSquareStats
                isLoading={isLoading}
                blueSquareStats={volunteerStats?.blueSquareStats}
                comparisonType={selectedComparison}
              />
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
  getTotalOrgSummary: (startDate, endDate, comparisonStartDate, comparisonEndDate) =>
    dispatch(getTotalOrgSummary(startDate, endDate, comparisonStartDate, comparisonEndDate)),
  getTaskAndProjectStats: () => dispatch(getTaskAndProjectStats(fromDate, toDate)),
  hasPermission: permission => dispatch(hasPermission(permission)),
  getAllUserProfile: () => dispatch(getAllUserProfile()),
});

export default connect(mapStateToProps, mapDispatchToProps)(TotalOrgSummary);
