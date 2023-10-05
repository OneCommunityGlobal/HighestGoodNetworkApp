// eslint-disable-next-line no-unused-vars
import React, { Component, useState } from 'react';
import '../../Teams/Team.css';
import './PeopleReport.css';
import { formatDate } from 'utils/formatDate';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { FiUser } from 'react-icons/fi';
import moment from 'moment';
import { toast } from 'react-toastify';
import {
  updateUserProfileProperty,
  getUserProfile,
  getUserTask,
} from '../../../actions/userProfile';

import { getUserProjects } from '../../../actions/userProjects';
import { getWeeklySummaries, updateWeeklySummaries } from '../../../actions/weeklySummaries';
import 'react-input-range/lib/css/index.css';
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
      isRehireable: false,
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
      toDate: this.endOfWeek(0),
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
    const { match, userProfile, userTask, userProjects, timeEntries, auth } = this.props;
    const { fromDate, toDate } = this.state;

    if (match) {
      const { userId } = match.params;
      await getUserProfile(userId);
      await getUserTask(userId);
      await getUserProjects(userId);
      await getWeeklySummaries(userId);
      await getTimeEntriesForPeriod(userId, fromDate, toDate);

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
    this.setState(() => {
      return {
        isRehireable: rehireValue,
      };
    });

    try {
      await this.props.updateUserProfileProperty(
        this.props.userProfile,
        'isRehireable',
        rehireValue,
      );
      toast.success(`You have changed the rehireable status of this user to ${rehireValue}`);
    } catch (err) {
      alert('An error occurred while attempting to save the rehireable status of this user.');
    }
  }

  setPriority(priorityValue) {
    if (priorityValue !== 'Filter Off') {
      this.setState(() => {
        return {
          priority: priorityValue,
          priorityList: this.state.priorityList.concat(priorityValue),
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
    if (statusValue !== 'Filter Off') {
      this.setState(() => {
        return {
          status: statusValue,
          statusList: this.state.statusList.concat(statusValue),
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
        toDate: this.endOfWeek(0),
        startDate: '',
        endDate: '',
      };
    });
  }

  setClassfication(classificationValue) {
    if (classificationValue !== 'Filter Off') {
      this.setState(() => {
        return {
          classification: classificationValue,
          classificationList: this.state.classificationList.concat(classificationValue),
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

  endOfWeek(offset) {
    return moment()
      .tz('America/Los_Angeles')
      .endOf('week')
      .subtract(offset, 'weeks')
      .format('YYYY-MM-DD');
  }

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

    let totalTangibleHrsRound = 0;
    if (hoursByCategory) {
      const hours = hoursByCategory
        ? Object.values(hoursByCategory).reduce((prev, curr) => prev + curr, 0)
        : 0;
      totalTangibleHrsRound = hours.toFixed(2);
    }

    const UserProject = props => {
      const userProjectList = [];
      return <div>{userProjectList}</div>;
    };
    const Infringements = props => {
      const BlueSquare = [];
      const dict = {};

      // aggregate infringements
      for (let i = 0; i < props.infringements.length; i++) {
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

      const startdate = Object.keys(dict)[0];
      if (startdate) {
        startdate.toString();
      }
      if (props.infringements.length > 0) {
        props.infringements.map((current, index) => (
          <tr className="teams__tr">
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
    };

    const PeopleDataTable = props => {
      const peopleData = {
        alertVisible: false,
        taskData: [],
        color: null,
        message: '',
      };

      for (let i = 0; i < userTask.length; i++) {
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
        for (let j = 0; j < userTask[i].resources.length; j++) {
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
        if (userTask[i].startedDatetime == null) {
          task.startDate = 'null';
        }
        if (userTask[i].endedDatime == null) {
          task.endDate = 'null';
        }
        task.hoursBest = userTask[i].hoursBest;
        task.hoursMost = userTask[i].hoursMost;
        task.hoursWorst = userTask[i].hoursWorst;
        task.whyInfo = userTask[i].whyInfo;
        task.intentInfo = userTask[i].intentInfo;
        task.endstateInfo = userTask[i].endstateInfo;
        peopleData.taskData.push(task);
      }

      return <PeopleTableDetails taskData={peopleData.taskData} />;
    };

    const renderProfileInfo = () => (
      <ReportPage.ReportHeader
        src={this.state.userProfile.profilePic}
        avatar={this.state.userProfile.profilePic ? undefined : <FiUser />}
        isActive={isActive}
      >
        <div className="report-stats">
          <p>
            <Link to={`/userProfile/${userProfile._id}`} title="View Profile">
              {userProfile.firstName} {userProfile.lastName}
            </Link>
          </p>
          <p>Role: {userProfile.role}</p>
          <p>Title: {userProfile.jobTitle}</p>

          {userProfile.endDate ? (
            <div className="rehireable">
              <Checkbox
                value={this.state.isRehireable}
                onChange={() => this.setRehireable(!this.state.isRehireable)}
                label="Rehireable"
              />
            </div>
          ) : (
            ''
          )}

          <div className="stats">
            <div>
              <h4>{formatDate(userProfile.createdDate)}</h4>
              <p>Start Date</p>
            </div>
            <div>
              <h4>{userProfile.endDate ? formatDate(userProfile.endDate) : 'N/A'}</h4>
              <p>End Date</p>
            </div>
            {this.state.bioStatus ? (
              <div>
                <h5>
                  Bio {this.state.bioStatus === 'default' ? 'not requested' : this.state.bioStatus}
                </h5>{' '}
                {this.state.authRole === 'Administrator' || this.state.authRole === 'Owner' ? (
                  <ToggleSwitch
                    fontSize="13px"
                    switchType="bio"
                    state={this.state.bioStatus}
                    handleUserProfile={bio => onChangeBioPosted(bio)}
                  />
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </ReportPage.ReportHeader>
    );

    const onChangeBioPosted = async bio => {
      const bioStatus = bio;
      this.setState(() => {
        return {
          bioStatus,
        };
      });

      try {
        await this.props.updateUserProfileProperty(this.props.userProfile, 'bioPosted', bioStatus);
        toast.success('You have changed the bio announcement status of this user.');
      } catch (err) {
        alert('An error occurred while attempting to save the bioPosted change to the profile.');
      }
    };

    return (
      <div className="container-people-wrapper">
        <ReportPage renderProfile={renderProfileInfo}>
          <div className="people-report-time-logs-wrapper">
            <ReportPage.ReportBlock
              firstColor="#ff5e82"
              secondColor="#e25cb2"
              className="people-report-time-log-block"
            >
              <h3>{weeklycommittedHours}</h3>
              <p>Weekly Committed Hours</p>
            </ReportPage.ReportBlock>

            {userProfile.endDate ? (
              ''
            ) : (
              <ReportPage.ReportBlock
                firstColor="#b368d2"
                secondColor="#831ec4"
                className="people-report-time-log-block"
              >
                <h3>{this.props.tangibleHoursReportedThisWeek}</h3>
                <p>Hours Logged This Week</p>
              </ReportPage.ReportBlock>
            )}

            <ReportPage.ReportBlock
              firstColor="#64b7ff"
              secondColor="#928aef"
              className="people-report-time-log-block"
            >
              <h3>{infringements.length}</h3>
              <p>Blue squares</p>
            </ReportPage.ReportBlock>
            <ReportPage.ReportBlock
              firstColor="#ffdb56"
              secondColor="#ff9145"
              className="people-report-time-log-block"
            >
              <h3>{totalTangibleHrsRound}</h3>
              <p>Total Hours Logged</p>
            </ReportPage.ReportBlock>
          </div>

          <PeopleTasksPieChart />
          <div className="mobile-people-table">
            <ReportPage.ReportBlock>
              <div className="intro_date">
                <h4>Tasks contributed</h4>
              </div>

              <PeopleDataTable />

              <div className="container">
                <table>
                  <UserProject userProjects={userProjects} />
                  <Infringements
                    infringements={infringements}
                    fromDate={fromDate}
                    toDate={toDate}
                    timeEntries={timeEntries}
                  />
                  <div className="visualizationDiv">
                    <InfringementsViz
                      infringements={infringements}
                      fromDate={fromDate}
                      toDate={toDate}
                    />
                  </div>
                  <div className="visualizationDiv">
                    <TimeEntriesViz timeEntries={timeEntries} fromDate={fromDate} toDate={toDate} />
                  </div>
                  <div className="visualizationDiv">
                    <BadgeSummaryViz
                      authId={this.props.auth.user.userid}
                      userId={this.props.match.params.userId}
                      badges={userProfile.badgeCollection}
                    />
                  </div>
                  <div className="visualizationDiv">
                    <BadgeSummaryPreview badges={userProfile.badgeCollection} />
                  </div>
                </table>
              </div>
            </ReportPage.ReportBlock>
          </div>
        </ReportPage>
      </div>
    );
  }
}
export default connect(getPeopleReportData, {
  getUserProfile,
  updateUserProfileProperty,
  getWeeklySummaries,
  updateWeeklySummaries,
  getUserTask,
  getUserProjects,
  getTimeEntriesForPeriod,
})(PeopleReport);
