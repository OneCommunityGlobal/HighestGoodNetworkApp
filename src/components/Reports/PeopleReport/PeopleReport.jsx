/* eslint-disable*/
import { Component } from 'react';
import '../../Teams/Team.css';
import './PeopleReport.css';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { Spinner, Alert } from 'reactstrap';
import { formatDate } from '../../../utils/formatDate';
import {
  updateUserProfileProperty,
  getUserProfile,
  getUserTasks,
} from '../../../actions/userProfile';
import { getUserProjects } from '../../../actions/userProjects';
import { getWeeklySummaries, updateWeeklySummaries } from '../../../actions/weeklySummaries';
import { getTimeEntriesForPeriod } from '../../../actions/timeEntries';
import InfringementsViz from '../InfringementsViz';
import TimeEntriesViz from '../TimeEntriesViz';
import BadgeSummaryViz from '../BadgeSummaryViz';
import BadgeSummaryPreview from '../BadgeSummaryPreview';
import PeopleTableDetails from '../PeopleTableDetails';
import { ReportPage } from '../sharedComponents/ReportPage';
import { getPeopleReportData } from './selectors';
import { PeopleTasksPieChart } from './components';
import ToggleSwitch from '../../UserProfile/UserProfileEdit/ToggleSwitch';
import { Checkbox } from '../../common/Checkbox';
import { updateRehireableStatus } from '../../../actions/userManagement'

class PeopleReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userProfile: {},
      userTask: [],
      userProjects: {},
      // eslint-disable-next-line react/no-unused-state
      userId: '',
      // eslint-disable-next-line react/no-unused-state
      isLoading: true,
      bioStatus: '',
      authRole: '',
      infringements: {},
      // eslint-disable-next-line react/no-unused-state
      isAssigned: '',
      isActive: '',
      isRehireable: true,
      // eslint-disable-next-line react/no-unused-state
      priority: '',
      // eslint-disable-next-line react/no-unused-state
      status: '',
      // eslint-disable-next-line react/no-unused-state
      hasFilter: true,
      // eslint-disable-next-line react/no-unused-state
      allClassification: [],
      // eslint-disable-next-line react/no-unused-state
      classification: '',
      // eslint-disable-next-line react/no-unused-state
      users: '',
      classificationList: [],
      priorityList: [],
      statusList: [],
      fromDate: '2016-01-01',
      toDate: '3000-12-31',
      timeEntries: {},
      // eslint-disable-next-line react/no-unused-state
      startDate: '',
      // eslint-disable-next-line react/no-unused-state
      endDate: '',
      // eslint-disable-next-line react/no-unused-state
      fetched: false,
    };
    this.setStatus = this.setStatus.bind(this);
    this.setPriority = this.setPriority.bind(this);
    this.setActive = this.setActive.bind(this);
    this.setRehireable = this.setRehireable.bind(this);
    this.setAssign = this.setAssign.bind(this);
    this.setFilter = this.setFilter.bind(this);
    this.setClassfication = this.setClassfication.bind(this);
    this.setUsers = this.setUsers.bind(this);
    this.setDate = this.setDate.bind(this);
    this.setStartDate = this.setStartDate.bind(this);
    this.setEndDate = this.setEndDate.bind(this);
  }


  async componentDidMount() {
    const { match } = this.props;
    const { fromDate, toDate } = this.state;

    if (match) {
      const { userId } = match.params;
      await this.props.getUserProfile(userId);
      await this.props.getUserTasks(userId);
      await this.props.getUserProjects(userId);
      await this.props.getWeeklySummaries(userId);
      await this.props.getTimeEntriesForPeriod(userId, fromDate, toDate);

      const { userProfile, userTask, userProjects, timeEntries, auth } = this.props;
      this.setState({
        // eslint-disable-next-line react/no-unused-state
        userId,
        // eslint-disable-next-line react/no-unused-state
        isLoading: false,
        bioStatus: userProfile.bioPosted,
        authRole: auth.user.role,
        userProfile: {
          ...userProfile,
        },
        isRehireable: userProfile.isRehireable,
        userTask: [...userTask],
        userProjects: {
          ...userProjects,
        },
        // eslint-disable-next-line react/no-unused-state
        allClassification: [...Array.from(new Set(userTask.map(item => item.classification)))],
        infringements: userProfile.infringements,
        timeEntries: {
          ...timeEntries,
        },
      });
    }

  }

  async componentDidUpdate(prevProps, prevState) {
    if (prevState.userTask !== this.state.userTask ||
      prevState.userProjects !== this.state.userProjects ||
      prevState.timeEntries !== this.state.timeEntries ||
      prevState.isLoading !== this.state.isLoading) {
      // this.syncPanelHeights();
    }
  }

  setStartDate(date) {
    this.setState(() => {
      return {
        startDate: date,
      };
    });
  }

  setEndDate(date) {
    this.setState(() => {
      return {
        endDate: date,
      };
    });
  }

  setDate(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  setActive(activeValue) {
    this.setState(() => {
      return {
        isActive: activeValue,
      };
    });
  }

  async setRehireable(rehireValue) {
    const { userProfile } = this.props;

    this.setState(() => {
      return {
        isRehireable: rehireValue,
      };
    });

    try {
      await updateRehireableStatus(userProfile, rehireValue);
      toast.success(`You have changed the rehireable status of this user to ${rehireValue}`);
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert('An error occurred while attempting to save the rehireable status of this user.');
    }
  }

  setPriority(priorityValue) {
    const { priorityList } = this.state;

    if (priorityValue !== 'Filter Off') {
      this.setState(() => {
        return {
          priority: priorityValue,
          priorityList: priorityList.concat(priorityValue),
        };
      });
    } else {
      this.setState(() => {
        return {
          priority: priorityValue,
          priorityList: [],
        };
      });
    }
  }

  setStatus(statusValue) {
    const { statusList } = this.state;

    if (statusValue !== 'Filter Off') {
      this.setState(() => {
        return {
          status: statusValue,
          statusList: statusList.concat(statusValue),
        };
      });
    } else {
      this.setState(() => {
        return {
          status: statusValue,
          statusList: [],
        };
      });
    }
  }

  setAssign(assignValue) {
    this.setState(() => {
      return {
        isAssigned: assignValue,
      };
    });
  }

  // eslint-disable-next-line no-unused-vars
  setFilter(filterValue) {
    this.setState(() => {
      return {
        isAssigned: false,
        isActive: false,
        priority: '',
        priorityList: [],
        status: '',
        statusList: [],
        classificationList: [],
        classification: '',
        users: '',
        fromDate: '2016-01-01',
        toDate: '3000-12-31',
        startDate: '',
        endDate: '',
      };
    });
  }

  setClassfication(classificationValue) {
    const { classificationList } = this.state;
    if (classificationValue !== 'Filter Off') {
      this.setState(() => {
        return {
          classification: classificationValue,
          classificationList: classificationList.concat(classificationValue),
        };
      });
    } else {
      this.setState(() => {
        return {
          classification: classificationValue,
          classificationList: [],
        };
      });
    }
  }

  setUsers(userValue) {
    this.setState(() => {
      return {
        users: userValue,
      };
    });
  }

  // eslint-disable-next-line class-methods-use-this
  // endOfWeek(offset) {
  //   return moment()
  //     .tz('America/Los_Angeles')
  //     .endOf('week')
  //     .subtract(offset, 'weeks')
  //     .format('YYYY-MM-DD');
  // }
  // syncPanelHeights = () => {
  // const leftEl = this.leftContentRef?.current;
  //   const rightEl = this.rightContentRef?.current;

  //   if (leftEl && rightEl) {
  //     requestAnimationFrame(() => {
  //       const leftHeight = leftEl.offsetHeight;
  //       rightEl.style.height = `${leftHeight}px`;
  //     });
  //   }
  // };

  render() {
    const {
      userProfile,
      infringements,
      userTask,
      userProjects,
      isActive,
      fromDate,
      toDate,
      timeEntries,
    } = this.state;
    // eslint-disable-next-line no-unused-vars
    const { firstName, lastName, weeklycommittedHours, hoursByCategory } = userProfile;
    const { tangibleHoursReportedThisWeek, auth, match, darkMode } = this.props;

    const totalTangibleHrsRound = (timeEntries.period?.reduce((total, entry) => {
      return total + (entry.hours + (entry.minutes / 60));
    }, 0) || 0).toFixed(2);

    // eslint-disable-next-line react/no-unstable-nested-components,no-unused-vars
    function UserProject(props) {
      const userProjectList = [];
      return <div>{userProjectList}</div>;
    }
    // eslint-disable-next-line react/no-unstable-nested-components
    function Infringements(props) {
      const dict = {};

      // aggregate infringements
      for (let i = 0; i < props.infringements.length; i += 1) {
        if (props.infringements[i].date in dict) {
          dict[props.infringements[i].date].count += 1;
          dict[props.infringements[i].date].des.push(props.infringements[i].description);
        } else {
          dict[props.infringements[i].date] = {
            count: 1,
            des: [props.infringements[i].description],
          };
        }
      }

      const [startdate] = Object.keys(dict);
      if (startdate) {
        startdate.toString();
      }
      if (props.infringements.length > 0) {
        props.infringements.map((current, index) => (
          <tr className="teams__tr" key={index}>
            <td>{index + 1}</td>
            <td>{current.date}</td>
            <td>{current.description}</td>
          </tr>
        ));
      }
      return (
        <div>
          <div />
        </div>
      );
    }

    // eslint-disable-next-line react/no-unstable-nested-components,no-unused-vars
    function PeopleDataTable(props) {
      const peopleData = {
        alertVisible: false,
        taskData: [],
        color: null,
        message: '',
      };

      for (let i = 0; i < userTask.length; i += 1) {
        const task = {
          taskName: '',
          priority: '',
          status: '',
          resources: [],
          active: '',
          assign: '',
          estimatedHours: '',
          _id: '',
          startDate: '',
          endDate: '',
          hoursBest: '',
          hoursMost: '',
          hoursWorst: '',
          whyInfo: '',
          endstateInfo: '',
          intentInfo: '',
        };
        const resourcesName = [];

        if (userTask[i].isActive) {
          task.active = 'Yes';
        } else {
          task.active = 'No';
        }
        if (userTask[i].isAssigned) {
          task.assign = 'Yes';
        } else {
          task.assign = 'No';
        }
        task.taskName = userTask[i].taskName;
        task.priority = userTask[i].priority;
        task.status = userTask[i].status;
        const n = userTask[i].estimatedHours;
        task.estimatedHours = n.toFixed(2);
        for (let j = 0; j < userTask[i].resources.length; j += 1) {
          const tempResource = {
            name: '',
            profilePic: '',
          };
          if (userTask[i].resources[j].profilePic) {
            tempResource.name = userTask[i].resources[j].name;
            tempResource.profilePic = userTask[i].resources[j].profilePic;
          } else {
            tempResource.name = userTask[i].resources[j].name;
            tempResource.profilePic = '/pfp-default.png';
          }
          resourcesName.push(tempResource);
        }
        task._id = userTask[i]._id;
        task.resources.push(resourcesName);
        // startedDatetime
        // if (userTask[i].startedDatetime === null && userTask[i].startedDatetime !== "") {
        //   task.startDate = 'null';
        // }
        // if (userTask[i].dueDatetime === null && userTask[i].dueDatetime !== "") {
        //   task.endDate = 'null';
        // }
        // task.startDate = userTask[i].startedDatetime.split('T')[0];
        // task.endDate = userTask[i].dueDatetime.split('T')[0];
        task.startDate = userTask[i].startedDatetime ? userTask[i].startedDatetime.split('T')[0] : 'null';
        task.endDate = userTask[i].dueDatetime ? userTask[i].dueDatetime.split('T')[0] : 'null';
        task.hoursBest = userTask[i].hoursBest;
        task.hoursMost = userTask[i].hoursMost;
        task.hoursWorst = userTask[i].hoursWorst;
        task.whyInfo = userTask[i].whyInfo;
        task.intentInfo = userTask[i].intentInfo;
        task.endstateInfo = userTask[i].endstateInfo;
        peopleData.taskData.push(task);
      }

      return (
        <PeopleTableDetails
          taskData={peopleData.taskData}
          showFilter={tangibleHoursReportedThisWeek !== 0}
          darkMode={darkMode}
        />
      );
    }


    const { isRehireable, bioStatus, authRole } = this.state;
    const { profilePic, role, jobTitle, endDate, _id, startDate } = userProfile;
    const onChangeBioPosted = async bio => {
      this.setState(() => {
        return {
          bioStatus: bio,
        };
      });

      try {
        await this.props.updateUserProfileProperty(userProfile, 'bioPosted', bioStatus);
        toast.success('You have changed the bio announcement status of this user.');
      } catch (err) {
        // eslint-disable-next-line no-alert
        alert('An error occurred while attempting to save the bioPosted change to the profile.');
      }
    };

    const activeTasks = userTask.reduce((accumulator, item) => {
      const incompleteTasks = item.resources.filter(
        task => task.completedTask === false && task.userID === userProfile._id,
      );
      return accumulator.concat(incompleteTasks);
    }, []);
    const visibleBlocks = [
      'weeklycommittedHours',
      userProfile.isActive ? 'hoursLogged' : null,
      'blueSquares',
      'totalHours'
    ].filter(Boolean);

    const boxCount = visibleBlocks.length;

    return (

      <div className={`container-people-wrapper ${darkMode ? 'bg-oxford-blue' : ''}`}>
        <div className="people-report-flex-layout" >

          <div xs="12" md="9" lg="9" className="people-report-left" >
            <ReportPage darkMode={darkMode}>


              <div className={`people-report-time-logs-wrapper`} 
              // style={boxCount === 3 ? { height: '68vw' } : { width: '100%' }}
              >
                <ReportPage.ReportBlock
                  firstColor="#ff5e82"
                  secondColor="#e25cb2"
                  className="people-report-time-log-block"
                  darkMode={darkMode}
                >
                  <h3 className="text-light">{weeklycommittedHours}</h3>
                  <p>Weekly Committed Hours</p>
                </ReportPage.ReportBlock>

                {(userProfile.isActive) && (

                  <ReportPage.ReportBlock
                    firstColor="#b368d2"
                    secondColor="#831ec4"
                    className="people-report-time-log-block"
                    darkMode={darkMode}
                  >
                    <h3 className="text-light">{tangibleHoursReportedThisWeek}</h3>
                    <p>Hours Logged This Week</p>
                  </ReportPage.ReportBlock>
                )}
                <ReportPage.ReportBlock
                  firstColor="#64b7ff"
                  secondColor="#928aef"
                  className="people-report-time-log-block"
                  darkMode={darkMode}
                >
                  <h3 className="text-light">{infringements.length}</h3>
                  <p>Blue squares</p>
                </ReportPage.ReportBlock>
                <ReportPage.ReportBlock
                  firstColor="#ffdb56"
                  secondColor="#ff9145"
                  className="people-report-time-log-block"
                  darkMode={darkMode}
                >
                  <h3 className="text-light">{totalTangibleHrsRound}</h3>
                  <p>Total Hours Logged</p>
                </ReportPage.ReportBlock>
              </div>



              <PeopleTasksPieChart darkMode={darkMode} />

              <div className="mobile-people-table">
                <ReportPage.ReportBlock darkMode={darkMode}>
                  {this.state.isLoading ? (
                    <p
                      className={`${darkMode ? 'text-light' : ''}
                   d-flex align-items-center flex-row justify-content-center`}
                    >
                      Loading tasks: &nbsp; <Spinner color={`${darkMode ? 'light' : 'dark'}`} />
                    </p>
                  ) : activeTasks.length > 0 ? (
                    <>
                      <div className={`intro_date ${darkMode ? 'text-light' : ''}`}>
                        <h4>Tasks contributed</h4>
                      </div>
                      <PeopleDataTable />
                    </>
                  ) : (
                    <Alert color="danger" style={{ margin: '0 35% ' }}>You have no tasks.</Alert>
                  )}
                  <div className="Infringementcontainer">
                    <div className="InfringementcontainerInner">
                      <UserProject userProjects={userProjects} />
                      <Infringements
                        infringements={infringements}
                        fromDate={fromDate}
                        toDate={toDate}
                        timeEntries={timeEntries}
                      />
                      <div className="visualizationDiv">
                        <TimeEntriesViz timeEntries={timeEntries} fromDate={fromDate} toDate={toDate} darkMode={darkMode} />
                      </div>
                      <div className="visualizationDiv">
                        <InfringementsViz
                          infringements={infringements}
                          fromDate={fromDate}
                          toDate={toDate}
                          darkMode={darkMode}
                        />
                      </div>
                      <div className="visualizationDivRow">
                        <div className="BadgeSummaryDiv">
                          <BadgeSummaryViz
                            authId={auth.user.userid}
                            userId={match.params.userId}
                            badges={userProfile.badgeCollection}
                          />
                        </div>
                        <div className="BadgeSummaryPreviewDiv">
                          <BadgeSummaryPreview badges={userProfile.badgeCollection} darkMode={darkMode} />
                        </div>
                      </div>
                    </div>
                  </div>
                </ReportPage.ReportBlock>
              </div>
              {/* {tangibleHoursReportedThisWeek === 0 ? (
            <div className="report-no-log-message">No task has been logged this week...</div>
          ) : (
            <div className="mobile-people-table">
              <ReportPage.ReportBlock>
                <div className="intro_date">
                  <h4>Tasks contributed</h4>
                </div>

                <PeopleDataTable />

                <div className="Infringementcontainer">
                  <div className="InfringementcontainerInner">
                    <UserProject userProjects={userProjects} />
                    <Infringements
                      infringements={infringements}
                      fromDate={fromDate}
                      toDate={toDate}
                      timeEntries={timeEntries}
                    />
                    <div className="visualizationDiv">
                      <TimeEntriesViz timeEntries={timeEntries} fromDate={fromDate} toDate={toDate} />
                    </div>
                    <div className="visualizationDiv">
                      <InfringementsViz
                        infringements={infringements}
                        fromDate={fromDate}
                        toDate={toDate}
                      />
                    </div>
                    <div className="visualizationDivRow">
                      <div className="BadgeSummaryDiv">
                        <BadgeSummaryViz
                          authId={auth.user.userid}
                          userId={match.params.userId}
                          badges={userProfile.badgeCollection}
                        />
                      </div>
                      <div className="BadgeSummaryPreviewDiv">
                        <BadgeSummaryPreview badges={userProfile.badgeCollection} />
                      </div>
                    </div>
                  </div>
                </div>
              </ReportPage.ReportBlock>
            </div>
          )} */}
            </ReportPage>
          </div>
          <div className={`people-report-right ${darkMode ? 'bg-oxford-blue' : ''}`} xs="12" md="3" lg="3">
            <ReportPage.ReportHeader
              src={profilePic}
              avatar={profilePic ? undefined : <FiUser />}
              isActive={isActive}
              darkMode={darkMode}
            >

              <div
                // style={{ minHeight: '200px' }}
                className={`report-stats ${darkMode ? 'bg-yinmn-blue text-light' : ''}`}
              >
                <p>
                  <Link to={`/userProfile/${_id}`}
                    title="View Profile"
                    className={darkMode ? 'text-light font-weight-bold' : ''}
                    style={{ fontSize: "24px" }}>
                    {firstName} {lastName}
                  </Link>
                </p>
                <p>Role: {role}</p>
                <p>Title: {jobTitle}</p>

                {/* {endDate ? ( */}
                <div className="rehireable">
                  <Checkbox
                    value={isRehireable}
                    onChange={() => this.setRehireable(!isRehireable)}
                    label="Rehireable"
                    darkMode={darkMode}
                    backgroundColorCN={darkMode ? "bg-yinmn-blue" : ""}
                    textColorCN={darkMode ? "text-light" : ""}
                  />
                </div>
                {/* ) : (
              ''
            )} */}

                <div className="stats">
                  <div>
                    <h4>{formatDate(startDate)}</h4>
                    <p>Start Date</p>
                  </div>
                  <div>
                    <h4>{endDate ? formatDate(endDate) : 'N/A'}</h4>
                    <p>End Date</p>
                  </div>
                  {bioStatus ? (
                    <div>
                      <h5>Bio {bioStatus === 'default' ? 'not requested' : bioStatus}</h5>{' '}
                      {authRole === 'Administrator' || authRole === 'Owner' ? (
                        <ToggleSwitch
                          fontSize="13px"
                          fontColor="#007BFF"
                          switchType="bio"
                          state={bioStatus}
                          /* eslint-disable-next-line no-use-before-define */
                          handleUserProfile={bio => onChangeBioPosted(bio)}
                        />
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </ReportPage.ReportHeader>


          </div >
        </div>
      </div>
    );
  }
}

export default connect(getPeopleReportData, {
  getUserProfile,
  updateUserProfileProperty,
  getWeeklySummaries,
  updateWeeklySummaries,
  getUserTasks,
  getUserProjects,
  getTimeEntriesForPeriod,
})(PeopleReport);
