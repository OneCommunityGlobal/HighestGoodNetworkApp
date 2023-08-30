import React, { Component, useState } from 'react';
import '../../Teams/Team.css';
import './PeopleReport.css';
import { Button, Dropdown, DropdownButton } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { FiUser } from 'react-icons/fi';
import {
  updateUserProfileProperty,
  getUserProfile,
  getUserTask,
} from '../../../actions/userProfile';
import { getUserProjects } from '../../../actions/userProjects';
import { getWeeklySummaries, updateWeeklySummaries } from '../../../actions/weeklySummaries';
import moment from 'moment';
import 'react-input-range/lib/css/index.css';
import Collapse from 'react-bootstrap/Collapse';
import { getTimeEntriesForPeriod } from '../../../actions/timeEntries';
import InfringementsViz from '../InfringementsViz';
import TimeEntriesViz from '../TimeEntriesViz';
import BadgeSummaryViz from '../BadgeSummaryViz';
import PeopleTableDetails from '../PeopleTableDetails';
import { ReportPage } from '../sharedComponents/ReportPage';
import { getPeopleReportData } from './selectors';
import { PeopleTasksPieChart } from './components';
import { toast } from 'react-toastify';
import ToggleSwitch from '../../UserProfile/UserProfileEdit/ToggleSwitch';
import { Checkbox } from '../../common/Checkbox';
import { formatDate } from 'utils/formatDate';

class PeopleReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userProfile: {},
      userTask: [],
      userProjects: {},
      userId: '',
      isLoading: true,
      bioStatus: '',
      authRole: '',
      infringements: {},
      isAssigned: '',
      isActive: '',
      isRehireable: false,
      priority: '',
      status: '',
      hasFilter: true,
      allClassification: [],
      classification: '',
      users: '',
      classificationList: [],
      priorityList: [],
      statusList: [],
      fromDate: '2016-01-01',
      toDate: this.endOfWeek(0),
      timeEntries: {},
      startDate: '',
      endDate: '',
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
    if (this.props.match) {
      const userId = this.props.match.params.userId;
      await this.props.getUserProfile(userId);
      await this.props.getUserTask(userId);
      await this.props.getUserProjects(userId);
      await this.props.getWeeklySummaries(userId);
      await this.props.getTimeEntriesForPeriod(userId, this.state.fromDate, this.state.toDate);
      this.setState({
        userId,
        isLoading: false,
        bioStatus: this.props.userProfile.bioPosted,
        authRole: this.props.auth.user.role,
        userProfile: {
          ...this.props.userProfile,
        },
        isRehireable: this.props.userProfile.isRehireable,
        userTask: [...this.props.userTask],
        userProjects: {
          ...this.props.userProjects,
        },
        allClassification: [
          ...Array.from(new Set(this.props.userTask.map(item => item.classification))),
        ],
        infringements: this.props.userProfile.infringements,
        timeEntries: {
          ...this.props.timeEntries,
        },
      });
    }
  }
  setStartDate(date) {
    this.setState(state => {
      return {
        startDate: date,
      };
    });
  }
  setEndDate(date) {
    this.setState(state => {
      return {
        endDate: date,
      };
    });
  }

  setDate(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  startOfWeek(offset) {
    return moment()
      .tz('America/Los_Angeles')
      .startOf('week')
      .subtract(offset, 'weeks')
      .format('YYYY-MM-DD');
  }

  endOfWeek(offset) {
    return moment()
      .tz('America/Los_Angeles')
      .endOf('week')
      .subtract(offset, 'weeks')
      .format('YYYY-MM-DD');
  }

  setActive(activeValue) {
    this.setState(state => {
      return {
        isActive: activeValue,
      };
    });
  }

  async setRehireable(rehireValue) {
    this.setState(state => {
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
    if (priorityValue != 'Filter Off') {
      this.setState(state => {
        return {
          priority: priorityValue,
          priorityList: this.state.priorityList.concat(priorityValue),
        };
      });
    } else {
      this.setState(state => {
        return {
          priority: priorityValue,
          priorityList: [],
        };
      });
    }
  }
  setStatus(statusValue) {
    if (statusValue != 'Filter Off') {
      this.setState(state => {
        return {
          status: statusValue,
          statusList: this.state.statusList.concat(statusValue),
        };
      });
    } else {
      this.setState(state => {
        return {
          status: statusValue,
          statusList: [],
        };
      });
    }
  }
  setAssign(assignValue) {
    this.setState(state => {
      return {
        isAssigned: assignValue,
      };
    });
  }

  setFilter(filterValue) {
    this.setState(state => {
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
    if (classificationValue != 'Filter Off') {
      this.setState(state => {
        return {
          classification: classificationValue,
          classificationList: this.state.classificationList.concat(classificationValue),
        };
      });
    } else {
      this.setState(state => {
        return {
          classification: classificationValue,
          classificationList: [],
        };
      });
    }
  }

  setUsers(userValue) {
    this.setState(state => {
      return {
        users: userValue,
      };
    });
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
    const { firstName, lastName, weeklycommittedHours,hoursByCategory } = userProfile;

  
    var totalTangibleHrsRound = 0;
    if (hoursByCategory) {
      const hours = hoursByCategory ? Object.values(hoursByCategory).reduce((prev, curr) => prev + curr, 0):0;
      totalTangibleHrsRound = hours.toFixed(2);
    }

    const UserProject = props => {
      let userProjectList = [];
      return <div>{userProjectList}</div>;
    };

    const ClassificationOptions = props => {
      return (
        <DropdownButton
          style={{ margin: '3px' }}
          exact
          id="dropdown-basic-button"
          title="Classification"
        >
          {props.allClassification.map((c, index) => (
            <Dropdown.Item onClick={() => this.setClassfication(c)}>{c}</Dropdown.Item>
          ))}
        </DropdownButton>
      );
    };

    const StatusOptions = props => {
      var allStatus = [...Array.from(new Set(props.get_tasks.map(item => item.status))).sort()];
      allStatus.unshift('Filter Off');
      return (
        <DropdownButton style={{ margin: '3px' }} exact id="dropdown-basic-button" title="Status">
          {allStatus.map((c, index) => (
            <Dropdown.Item onClick={() => this.setStatus(c)}>{c}</Dropdown.Item>
          ))}
        </DropdownButton>
      );
    };

    const UserOptions = props => {
      let users = [];
      props.userTask.map((task, index) =>
        task.resources.map(resource => users.push(resource.name)),
      );

      users = Array.from(new Set(users)).sort();
      users.unshift('Filter Off');
      return (
        <DropdownButton style={{ margin: '3px' }} exact id="dropdown-basic-button" title="Users">
          {users.map((c, index) => (
            <Dropdown.Item onClick={() => this.setUsers(c)}>{c}</Dropdown.Item>
          ))}
        </DropdownButton>
      );
    };
    const ShowInfringementsCollapse = props => {
      const [open, setOpen] = useState(false);
      return (
        <div>
          <table className="center">
            <table className="table table-bordered table-responsive-sm">
              <thead>
                <tr>
                  <th scope="col" id="projects__order">
                    <Button variant="light" onClick={() => setOpen(!open)} aria-expanded={open}>
                      ⬇
                    </Button>
                  </th>

                  <th scope="col" id="projects__order">
                    Date
                  </th>
                  <th scope="col">Description</th>
                </tr>
              </thead>
              <Collapse in={open}>
                <tbody>{props.BlueSquare}</tbody>
              </Collapse>
            </table>
          </table>
        </div>
      );
    };

    const Infringements = props => {
      let BlueSquare = [];
      let dict = {};

      //aggregate infringements
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
      var startdateStr = '';
      if (startdate) {
        startdateStr = startdate.toString();
      }
      if (props.infringements.length > 0) {
        BlueSquare = props.infringements.map((current, index) => (
          <tr className="teams__tr">
            <td>{index + 1}</td>
            <td>{current.date}</td>
            <td>{current.description}</td>
          </tr>
        ));
      }
      return (
        <div>
          <div></div>
        </div>
      );
    };

    const PeopleDataTable = props => {
      let peopleData = {
        alertVisible: false,
        taskData: [],
        color: null,
        message: '',
      };

      for (let i = 0; i < userTask.length; i++) {
        let task = {
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
        let resourcesName = [];

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
        let n = userTask[i].estimatedHours;
        task.estimatedHours = n.toFixed(2);
        for (let j = 0; j < userTask[i].resources.length; j++) {
          let tempResource = {
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
            <h4>
              {userProfile.endDate ? formatDate(userProfile.endDate) : 'N/A'}
            </h4>
            <p>End Date</p>
          </div>
          {this.state.bioStatus ? (
            <div>
              <h5>
                Bio {this.state.bioStatus === 'default' ? 'not requested' : this.state.bioStatus}
              </h5>{' '}
              {this.state.authRole === 'Administrator' || this.state.authRole === 'Owner' ? (
                <ToggleSwitch
                  fontSize={'13px'}
                  switchType="bio"
                  state={this.state.bioStatus}
                  handleUserProfile={bio => onChangeBioPosted(bio)}
                />
              ) : null}
            </div>
          ) : null}
        </div>
      </ReportPage.ReportHeader>
    );

    const onChangeBioPosted = async bio => {
      const bioStatus = bio;
      this.setState(state => {
        return {
          bioStatus: bioStatus,
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
              <div className='visualizationDiv'>
                <BadgeSummaryViz badges={userProfile.badgeCollection} />
              </div>
            </table>
          </div>
        </ReportPage.ReportBlock>
      </ReportPage>
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
