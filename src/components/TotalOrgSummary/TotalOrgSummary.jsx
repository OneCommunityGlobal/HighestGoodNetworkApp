import { connect } from 'react-redux';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { Alert, Col, Container, Row } from 'reactstrap';
import 'moment-timezone';
import moment from 'moment';

import hasPermission from 'utils/permissions';

// actions
import { getTotalOrgSummary } from 'actions/totalOrgSummary';
import { getAllUserProfile } from 'actions/userManagement';
import { getAllUsersTimeEntries } from 'actions/allUsersTimeEntries';
import { getTimeEntryForOverDate } from 'actions/index';
import { getTaskAndProjectStats } from 'actions/totalOrgSummary';

// import Select from 'react-select';
import SkeletonLoading from '../common/SkeletonLoading';
import '../Header/DarkMode.css';
import './TotalOrgSummary.css';

// components
import VolunteerHoursDistribution from './VolunteerHoursDistribution/VolunteerHoursDistribution';
import AccordianWrapper from './AccordianWrapper/AccordianWrapper';
import HoursCompletedBarChart from './HoursCompleted/HoursCompletedBarChart';
import HoursWorkList from './HoursWorkList/HoursWorkList';
import NumbersVolunteerWorked from './NumbersVolunteerWorked/NumbersVolunteerWorked';
import Loading from '../common/Loading';
import DateRangeSelector from './DateRangeSelector';

// This needed delete
import mockVolunteerData from './mockVolunteerData';

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
// const comparisionOptions = [
//   {
//     label: 'last week',
//     value: 'lastweek',
//   },
//   {
//     label: 'Same week last month',
//     value: 'lastmonth',
//   },
//   {
//     label: 'Same week last year',
//     value: 'lastyear',
//   },
//   {
//     label: 'Do not show comparision data',
//     value: 'nocomparision',
//   },
// ];
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
  // const { darkMode, loading, error, allUserProfiles, volunteerstats } = props;
  const { darkMode, loading, error, allUserProfiles } = props;

  const [usersId, setUsersId] = useState([]);
  const [usersTimeEntries, setUsersTimeEntries] = useState([]);
  const [usersOverTimeEntries, setUsersOverTimeEntries] = useState([]);
  const [taskProjectHours, setTaskProjectHours] = useState([]);
  // const [selectedWeek, setDate] = useState({
  //   startDate: new Date(),
  //   endDate: new Date(),
  //   key: 'selection',
  //   // endDate: new Date().toISOString().split('T')[0],
  // });
  // const [comparisionWeek, setComparisionWeek] = useState({ startDate: '', endDate: '' });
  // console.log(volunteerstats);

  const dispatch = useDispatch();

  const allUsersTimeEntries = useSelector(state => state.allUsersTimeEntries);

  // State to hold the selected date range
  const [selectedDateRange, setSelectedDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  const [filteredData, setFilteredData] = useState([]);

  const handleDateRangeChange = ({ startDate, endDate }) => {
    setSelectedDateRange({ startDate, endDate });
  };

  // Filter the mock volunteer data based on the selected date range
  useEffect(() => {
    if (selectedDateRange.startDate && selectedDateRange.endDate) {
      const startDate = moment(selectedDateRange.startDate);
      const endDate = moment(selectedDateRange.endDate);

      const filtered = mockVolunteerData.filter(volunteer => {
        const volunteerDate = moment(volunteer.date);
        return volunteerDate.isBetween(startDate, endDate, null, '[]');
      });

      setFilteredData(filtered);
    } else {
      setFilteredData(mockVolunteerData);
    }
  }, [selectedDateRange]);

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
      const { taskHours, projectHours } = await props.getTaskAndProjectStats(fromDate, toDate);
      const {
        taskHours: lastTaskHours,
        projectHours: lastProjectHours,
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

  // useEffect(() => {
  //   props.getTotalOrgSummary(selectedWeek.startDate, selectedWeek.endDate);
  //   props.hasPermission('');
  // }, [selectedWeek]);

  // useEffect(() => {
  //   if (comparisionWeek.startDate !== '') {
  //     props.getTotalOrgSummary(comparisionWeek.startDate, comparisionWeek.endDate);
  //   }
  // }, [comparisionWeek]);

  // this is called on date change and it sets the date range in State
  // const handleChange = ranges => {
  //   setDate(ranges.selection);
  // };

  // sets comparision date based on comparision option and time period selection
  // const handleComparisionPeriodChange = option => {
  //   const { startDate, endDate } = selectedWeek;
  //   const commonStartDate = new Date(startDate);
  //   const commonEndDate = new Date(endDate);
  //   switch (option.value) {
  //     case 'lastweek':
  //       // Calculate last week's start and end dates
  //       commonStartDate.setDate(commonStartDate.getDate() - 7 * 2); // Move back 2 weeks
  //       commonEndDate.setDate(commonEndDate.getDate() - 7 * 2); // Move back 2 weeks
  //       break;

  //     case 'lastmonth':
  //       // Set dates to last month
  //       commonStartDate.setMonth(commonStartDate.getMonth() - 1);
  //       commonEndDate.setMonth(commonEndDate.getMonth() - 1);
  //       break;

  //     case 'lastyear':
  //       // Set dates to last year
  //       commonStartDate.setFullYear(commonStartDate.getFullYear() - 1);
  //       commonEndDate.setFullYear(commonEndDate.getFullYear() - 1);
  //       break;

  //     default:
  //       throw new Error('Invalid option selected');
  //   }
  //   setComparisionWeek({
  //     startDate: commonStartDate.toISOString().split('T')[0],
  //     endDate: commonEndDate.toISOString().split('T')[0],
  //   });
  // };

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
        <Col lg={{ size: 6 }}>
          <h3 className="mt-3 mb-5">Total Org Summary</h3>
        </Col>
        <Col lg={{ size: 2 }}>
          <h3 className="mt-3 mb-5">
            {/* <DateRangePicker
              className="dateRange"
              ranges={[selectedWeek]}
              onChangse={handleChange}
            /> */}
            {/* DATE SELECTOR COMPONENT GOES HERE */}
            {/* use selectedWeek to store dates and handleChange to update dates */}
          </h3>
        </Col>
        <Col lg={{ size: 2 }} style={{ paddingTop: '20px' }}>
          {/* <Select
            options={comparisionOptions}
            onChange={option => handleComparisionPeriodChange(option)}
            default
          /> */}
        </Col>
        <Col lg={{ size: 2 }}>
          <h3 className="mt-3 mb-5">PDF Button</h3>
        </Col>
      </Row>
      {/* Date Range Selector Component */}
      <Row>
        <Col lg={12}>
          <DateRangeSelector onDateRangeChange={handleDateRangeChange} />
        </Col>
      </Row>

      <hr />

      {/* Display filtered volunteer data */}
      <Row>
        <Col lg={12}>
          {filteredData.length === 0 ? (
            <Alert color="warning">No data available for the selected date range.</Alert>
          ) : (
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Hours Worked</th>
                  <th>Tasks Completed</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map(volunteer => (
                  <tr key={volunteer.name + volunteer.date}>
                    <td>{volunteer.name}</td>
                    <td>{volunteer.hoursWorked}</td>
                    <td>{volunteer.tasksCompleted}</td>
                    <td>{volunteer.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
    </Container>
  );
}
// totalOrgSummary: state.totalOrgSummary,
const mapStateToProps = state => ({
  error: state.error,
  loading: state.loading,
  volunteerstats: state.totalOrgSummary.volunteerstats,
  role: state.auth.user.role,
  auth: state.auth,
  darkMode: state.theme.darkMode,
  allUserProfiles: state.allUserProfiles,
});

const mapDispatchToProps = dispatch => ({
  // getTotalOrgSummary: () => dispatch(getTotalOrgSummary(fromDate, toDate)),
  getTaskAndProjectStats: () => dispatch(getTaskAndProjectStats(fromDate, toDate)),
  hasPermission: permission => dispatch(hasPermission(permission)),
  getAllUserProfile: () => dispatch(getAllUserProfile()),
  getTotalOrgSummary: (startDate, endDate) => dispatch(getTotalOrgSummary(startDate, endDate)),
});

export default connect(mapStateToProps, mapDispatchToProps)(TotalOrgSummary);
