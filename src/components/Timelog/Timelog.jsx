import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardTitle,
  CardSubtitle,
  CardHeader,
  CardBody,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import './Timelog.css';
import classnames from 'classnames';
import { connect, useSelector } from 'react-redux';
import moment from 'moment';
import { isEmpty, isEqual } from 'lodash';
import ReactTooltip from 'react-tooltip';
import ActiveCell from 'components/UserManagement/ActiveCell';
import { ProfileNavDot } from 'components/UserManagement/ProfileNavDot';
import TeamMemberTasks from 'components/TeamMemberTasks';
import { getTimeEntriesForWeek, getTimeEntriesForPeriod } from '../../actions/timeEntries';
import { getUserProfile, updateUserProfile, getUserTask } from '../../actions/userProfile';
import { getUserProjects } from '../../actions/userProjects';
import { getAllRoles } from '../../actions/role';
import TimeEntryForm from './TimeEntryForm';
import TimeEntry from './TimeEntry';
import EffortBar from './EffortBar';
import SummaryBar from '../SummaryBar/SummaryBar';
import WeeklySummary from '../WeeklySummary/WeeklySummary';
import LoadingSkeleton from '../common/SkeletonLoading';
import hasPermission from '../../utils/permissions';
import WeeklySummaries from './WeeklySummaries';
import { boxStyle } from 'styles';

const doesUserHaveTaskWithWBS = (tasks = [], userId) => {
  if (!Array.isArray(tasks)) return false;

  for (let task of tasks) {
    for (let resource of task.resources) {
      if (resource.userID == userId && resource.completedTask == false) {
        return true;
      }
    }
  }
  return false;
};

function useDeepEffect(effectFunc, deps) {
  const isFirst = useRef(true);
  const prevDeps = useRef(deps);
  useEffect(() => {
    const isSame = prevDeps.current.every((obj, index) => {
      let isItEqual = isEqual(obj, deps[index]);
      return isItEqual;
    });
    if (isFirst.current || !isSame) {
      effectFunc();
    }
    isFirst.current = false;
    prevDeps.current = deps;
  }, deps);
}

const Timelog = props => {
  //Main Function component

  //access the store states
  const auth = useSelector(state => state.auth);
  const userProfile = useSelector(state => state.userProfile);
  const timeEntries = useSelector(state => state.timeEntries);
  const userProjects = useSelector(state => state.userProjects);
  const role = useSelector(state => state.role);
  const userTask = useSelector(state => state.userTask);
  const userIdByState = useSelector(state => state.auth.user.userid);
  const [isTaskUpdated, setIsTaskUpdated] = useState(false);

  const defaultTab = () => {
    //change default to time log tab(1) in the following cases:
    const role = auth.user.role;
    let tab = 0;
    const UserHaveTask = doesUserHaveTaskWithWBS(userTask, userIdByState);
    /* To set the Task tab as defatult this.userTask is being watched.
    Accounts with no tasks assigned to it return an empty array.
    Accounts assigned with tasks with no wbs return and empty array.
    Accounts assigned with tasks with wbs return an array with that wbs data.
    The problem: even after unassigning tasks the array keeps the wbs data.
    That breaks this feature. Necessary to check if this array should keep data or be reset when unassinging tasks.*/

    //if user role is volunteer or core team and they don't have tasks assigned, then default tab is timelog.
    if (role === 'Volunteer' && !UserHaveTask) {
      tab = 1;
    }

    // Sets active tab to "Current Week Timelog" when the Progress bar in Leaderboard is clicked
    if (!props.isDashboard) {
      tab = 1;
    }
    return tab;
  };

  const timeLogFunction = () => {
    //build the time log component
    buildOptions()
      .then(response => {
        setProjectOrTaskOptions(response);
      })
      .then(() => {
        generateAllTimeEntries().then(response => {
          setCurrentWeekEntries(response[0]);
          setLastWeekEntries(response[1]);
          setBeforeLastEntries(response[2]);
          setPeriodEntries(response[3]);
        });
      });
  };

  const loadAsyncData = async userId => {
    //load the timelog data
    setState({ ...state, isTimeEntriesLoading: true });
    try {
      await Promise.all([
        props.getTimeEntriesForWeek(userId, 0),
        props.getTimeEntriesForWeek(userId, 1),
        props.getTimeEntriesForWeek(userId, 2),
        props.getTimeEntriesForPeriod(userId, state.fromDate, state.toDate),
        props.getUserProjects(userId),
        props.getAllRoles(),
        props.getUserTask(userId),
      ]);
    } catch (e) {
      setError(e);
    }

    //setState({...state,activeTab:defaultTabValue});
  };

  const toggle = () => {
    setState({ ...state, modal: !state.modal });
  };

  const showSummary = isOwner => {
    if (isOwner) {
      setState({ ...state, summary: !state.summary });
      setTimeout(() => {
        const elem = document.getElementById('weeklySum');
        if (elem) {
          elem.scrollIntoView();
        }
      }, 150);
    }
  };

  const openInfo = () => {
    const str = `This is the One Community time log! It is used to show a record of all the time you have volunteered with One Community, what you’ve done for each work session, etc.
    * “Add Time Entry” Button: Clicking this button will only allow you to add “Intangible” time. This is for time not related to your tasks OR for time you need a manager to change to “Tangible” for you because you were working away from your computer or made a mistake and are trying to manually log time. Intangible time will not be counted towards your committed time for the week or your tasks. “Intangible” time changed by a manager to “Tangible” time WILL be counted towards your committed time for the week and whatever task it is logged towards. For Blue Square purposes, changing Intangible Time to Tangible Time for any reason other than work away from your computer will count and be recorded in the system the same as a time edit.
    * Viewing Past Work: The current week is always shown by default but past weeks can also be viewed by clicking the tabs or selecting a date range.
    * Sorting by Project and Task: All projects and tasks are shown by default but you can also choose to sort your time log by Project or Task.
    * Notes: The “Notes” section is where you write a summary of what you did during the time you are about to log. You must write a minimum of 10 words because we want you to be specific. You must include a link to your work so others can easily confirm and review it.
    * Tangible Time: By default, the “Tangible” box is clicked. Tangible time is any time spent working on your Projects/Tasks and counts towards your committed time for the week and also the time allocated for your task.
    * Intangible Time: Clicking the Tangible box OFF will mean you are logging “Intangible Time.” This is for time not related to your tasks OR for time you need a manager to change to “Tangible” for you because you were working away from your computer or made a mistake and are trying to manually log time. Intangible time will not be counted towards your committed time for the week or your tasks. “Intangible” time changed by a manager to “Tangible” time WILL be counted towards your committed time for the week and whatever task it is logged towards. For Blue Square purposes, changing Intangible Time to Tangible Time for any reason other than work away from your computer will count and be recorded in the system the same as a time edit. `;

    setState({
      ...state,
      in: !state.in,
      information: str.split('\n').map((item, i) => <p key={i}>{item}</p>),
    });
  };

  const changeTab = tab => {
    setState({
      ...state,
      activeTab: tab,
    });
  };

  const handleInputChange = e => {
    setState({ ...state, [e.target.name]: e.target.value });
  };

  const handleSearch = e => {
    e.preventDefault();
    const userId =
      props.match && props.match.params.userId
        ? props.match.params.userId
        : props.asUser || auth.user.userid;
    props.getTimeEntriesForPeriod(userId, state.fromDate, state.toDate);
  };

  // startOfWeek returns the date of the start of the week based on offset. Offset is the number of weeks before.
  // For example, if offset is 0, returns the start of this week. If offset is 1, returns the start of last week.
  const startOfWeek = offset => {
    return moment()
      .tz('America/Los_Angeles')
      .startOf('week')
      .subtract(offset, 'weeks')
      .format('YYYY-MM-DD');
  };

  // endOfWeek returns the date of the end of the week based on offset. Offset is the number of weeks before.
  // For example, if offset is 0, returns the end of this week. If offset is 1, returns the end of last week.
  const endOfWeek = offset => {
    return moment()
      .tz('America/Los_Angeles')
      .endOf('week')
      .subtract(offset, 'weeks')
      .format('YYYY-MM-DD');
  };

  const calculateTotalTime = (data, isTangible) => {
    const filteredData = data.filter(entry => entry.isTangible === isTangible);
    const reducer = (total, entry) => total + parseInt(entry.hours) + parseInt(entry.minutes) / 60;
    return filteredData.reduce(reducer, 0);
  };

  const generateTimeEntries = data => {
    if (!state.projectsSelected.includes('all')) {
      data = data.filter(entry => state.projectsSelected.includes(entry.projectId));
    }
    return data.map(entry => (
      <TimeEntry data={entry} displayYear={false} key={entry._id} userProfile={userProfile} />
    ));
  };

  const renderViewingTimeEntriesFrom = () => {
    if (state.activeTab === 0 || state.activeTab === 5) {
      return <></>;
    } else if (state.activeTab === 4) {
      return (
        <p className="ml-1">
          Viewing time Entries from <b>{state.fromDate}</b> to <b>{state.toDate}</b>
        </p>
      );
    } else {
      return (
        <p className="ml-1">
          Viewing time Entries from <b>{startOfWeek(state.activeTab - 1)}</b> to{' '}
          <b>{endOfWeek(state.activeTab - 1)}</b>
        </p>
      );
    }
  };

  const generateAllTimeEntries = async () => {
    const currentWeekEntries = generateTimeEntries(timeEntries.weeks[0]);
    const lastWeekEntries = generateTimeEntries(timeEntries.weeks[1]);
    const beforeLastEntries = generateTimeEntries(timeEntries.weeks[2]);
    const periodEntries = generateTimeEntries(timeEntries.period);
    return [currentWeekEntries, lastWeekEntries, beforeLastEntries, periodEntries];
  };

  const makeBarData = userId => {
    //pass the data to summary bar
    const weekEffort = calculateTotalTime(timeEntries.weeks[0], true);
    setState({ ...state, currentWeekEffort: weekEffort });
    if (props.isDashboard) {
      props.passSummaryBarData({ personId: userId, tangibletime: weekEffort });
    } else {
      setSummaryBarData({ personId: userId, tangibletime: weekEffort });
    }
  };

  const buildOptions = async () => {
    //build options for the project and task
    let projects = [];
    if (!isEmpty(userProjects.projects)) {
      projects = userProjects.projects;
    }
    const options = projects.map(project => (
      <option value={project.projectId} key={project.projectId}>
        {' '}
        {project.projectName}{' '}
      </option>
    ));
    options.unshift(
      <option value="all" key="all">
        All Projects and Tasks (Default)
      </option>,
    );

    let tasks = [];
    if (!isEmpty(userTask)) {
      tasks = userTask;
    }
    const activeTasks = tasks.filter(task =>
      task.resources.some(
        resource => resource.userID === auth.user.userid && !resource.completedTask,
      ),
    );
    const taskOptions = activeTasks.map(task => (
      <option value={task._id} key={task._id}>
        {task.taskName}
      </option>
    ));
    const allOptions = options.concat(taskOptions);
    return allOptions;
  };

  const [error, setError] = useState(null);
  const [initialTab, setInitialTab] = useState(null);
  const [projectOrTaskOptions, setProjectOrTaskOptions] = useState(null);
  const [currentWeekEntries, setCurrentWeekEntries] = useState(null);
  const [lastWeekEntries, setLastWeekEntries] = useState(null);
  const [beforeLastEntries, setBeforeLastEntries] = useState(null);
  const [periodEntries, setPeriodEntries] = useState(null);
  const [userId, setUserId] = useState(null);
  const [summaryBarData, setSummaryBarData] = useState(null);
  const [data, setData] = useState({
    disabled: !hasPermission(
      auth.user.role,
      'disabledDataTimelog',
      role.roles,
      auth.user?.permissions?.frontPermissions,
    )
      ? false
      : true,
    isTangible: false,
  });
  const initialState = {
    modal: false,
    summary: false,
    activeTab: 0,
    projectsSelected: ['all'],
    fromDate: startOfWeek(0),
    toDate: endOfWeek(0),
    in: false,
    information: '',
    currentWeekEffort: 0,
    isTimeEntriesLoading: true,
  };
  const [state, setState] = useState(initialState);

  const handleUpdateTask = useCallback(() => {
    setIsTaskUpdated(!isTaskUpdated);
  }, []);

  useEffect(() => {
    // Does not run again (except once in development): load data
    const userId = props?.match?.params?.userId || props.asUser; //Including fix for "undefined"
    setUserId(userId);
    if (userProfile._id !== userId) {
      props.getUserProfile(userId);
    }
    loadAsyncData(userId).then(() => {
      setState({ ...state, isTimeEntriesLoading: false });
      const defaultTabValue = defaultTab();
      setInitialTab(defaultTabValue);
    });
  }, []);

  useEffect(() => {
    changeTab(initialTab);
  }, [initialTab]);

  useDeepEffect(() => {
    // Only re-render when time entries change
    if (!state.isTimeEntriesLoading) {
      makeBarData(userId);
      timeLogFunction();
    }
  }, [timeEntries]);

  useEffect(() => {
    // Build the time log after new data is loaded
    if (!state.isTimeEntriesLoading) {
      timeLogFunction();
      makeBarData(userId);
    }
  }, [state.isTimeEntriesLoading]);

  useEffect(() => {
    // Only render (reload data) when asUser changes.
    if (!userId && !state.isTimeEntriesLoading) {
      // skip the first render.
      setState(initialState);
      const newId = props.match?.params?.userId || props.asUser;
      if (userProfile._id !== newId) {
        props.getUserProfile(newId);
      }
      loadAsyncData(newId).then(() => {
        const defaultTabValue = defaultTab();
        setInitialTab(defaultTabValue);
        setState({ ...state, isTimeEntriesLoading: false });
      });
      setUserId(newId);
    }
  }, [props.asUser]);

  useEffect(() => {
    // Filter the time entries
    generateAllTimeEntries().then(response => {
      setCurrentWeekEntries(response[0]);
      setLastWeekEntries(response[1]);
      setBeforeLastEntries(response[2]);
      setPeriodEntries(response[3]);
    });
  }, [state.projectsSelected]);

  const userPermissions = auth.user?.permissions?.frontPermissions;
  const isOwner = auth.user.userid === userId;
  const fullName = `${userProfile.firstName} ${userProfile.lastName}`;

  return (
    <div>
      {!props.isDashboard ? (
        <Container fluid>
          <SummaryBar
            asUser={userId}
            toggleSubmitForm={() => showSummary(isOwner)}
            role={auth.user}
            summaryBarData={summaryBarData}
          />
          <br />
        </Container>
      ) : (
        ''
      )}
      {state.isTimeEntriesLoading ? (
        <LoadingSkeleton template="Timelog" />
      ) : (
        <Container fluid="md" className="right-padding-temp-fix">
          {state.summary ? (
            <div className="my-2">
              <div id="weeklySum">
                <WeeklySummary asUser={userId} />
              </div>
            </div>
          ) : null}
          <Row>
            <Col md={12}>
              <Card>
                <CardHeader>
                  <Row>
                    <Col md={11}>
                      <CardTitle tag="h4">
                        Tasks and Timelogs &nbsp;
                        <i
                          className="fa fa-info-circle"
                          data-tip
                          data-for="registerTip"
                          aria-hidden="true"
                          onClick={openInfo}
                        />
                        <span style={{ padding: '0 5px' }}>
                          <ActiveCell
                            isActive={userProfile.isActive}
                            user={userProfile}
                            onClick={() => {
                              props.updateUserProfile(userId, {
                                ...userProfile,
                                isActive: !userProfile.isActive,
                                endDate:
                                  !userProfile.isActive === false
                                    ? moment(new Date()).format('YYYY-MM-DD')
                                    : undefined,
                              });
                            }}
                          />
                        </span>
                        <ProfileNavDot
                          userId={
                            props.match?.params?.userId || props.asUser || props.auth.user.userid
                          }
                        />
                      </CardTitle>
                      <CardSubtitle tag="h6" className="text-muted">
                        Viewing time entries logged in the last 3 weeks
                      </CardSubtitle>
                    </Col>
                    <Col md={11}>
                      {isOwner ? (
                        <div className="float-right">
                          <div>
                            <Button color="success" onClick={toggle} style={boxStyle}>
                              {'Add Intangible Time Entry '}
                              <i
                                className="fa fa-info-circle"
                                data-tip
                                data-for="timeEntryTip"
                                data-delay-hide="1000"
                                aria-hidden="true"
                                title=""
                              />
                            </Button>
                            <ReactTooltip id="timeEntryTip" place="bottom" effect="solid">
                              Clicking this button only allows for “Intangible Time” to be added to
                              your time log.{' '}
                              <u>
                                You can manually log Intangible Time but it doesn’t <br />
                                count towards your weekly time commitment.
                              </u>
                              <br />
                              <br />
                              “Tangible Time” is the default for logging time using the timer at the
                              top of the app. It represents all work done on assigned action items{' '}
                              <br />
                              and is what counts towards a person’s weekly volunteer time
                              commitment. The only way for a volunteer to log Tangible Time is by
                              using the clock
                              <br />
                              in/out timer. <br />
                              <br />
                              Intangible Time is almost always used only by the management team. It
                              is used for weekly Monday night management team calls, monthly
                              management
                              <br />
                              team reviews and Welcome Team Calls, and non-action-item related
                              research, classes, and other learning, meetings, etc. that benefit or
                              relate to <br />
                              the project but aren’t related to a specific action item on the{' '}
                              <a href="https://www.tinyurl.com/oc-os-wbs">
                                One Community Work Breakdown Structure.
                              </a>
                              <br />
                              <br />
                              Intangible Time may also be logged by a volunteer when in the field or
                              for other reasons when the timer wasn’t able to be used. In these
                              cases, the <br />
                              volunteer will use this button to log time as “intangible time” and
                              then request that an Admin manually change the log from Intangible to
                              Tangible.
                              <br />
                              <br />
                            </ReactTooltip>
                          </div>
                        </div>
                      ) : (
                        hasPermission(
                          auth.user.role,
                          'addTimeEntryOthers',
                          role.roles,
                          userPermissions,
                        ) && (
                          <div className="float-right">
                            <div>
                              <Button color="warning" onClick={toggle} style={boxStyle}>
                                Add Time Entry {!isOwner && `for ${fullName}`}
                              </Button>
                            </div>
                          </div>
                        )
                      )}
                      <Modal isOpen={state.in} toggle={openInfo}>
                        <ModalHeader>Info</ModalHeader>
                        <ModalBody>{state.information}</ModalBody>
                        <ModalFooter>
                          <Button onClick={openInfo} color="primary" style={boxStyle}>
                            Close
                          </Button>
                        </ModalFooter>
                      </Modal>
                      <TimeEntryForm
                        userId={userId}
                        data={data}
                        edit={false}
                        toggle={toggle}
                        isOpen={state.modal}
                        userProfile={userProfile}
                        roles={role.roles}
                        isTaskUpdated={isTaskUpdated}
                      />
                      <ReactTooltip id="registerTip" place="bottom" effect="solid">
                        Click this icon to learn about the timelog.
                      </ReactTooltip>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  <Nav tabs className="mb-1">
                    <NavItem>
                      <NavLink
                        className={classnames({ active: state.activeTab === 0 })}
                        onClick={() => {
                          changeTab(0);
                        }}
                        href="#"
                        to="#"
                      >
                        Tasks
                      </NavLink>
                    </NavItem>
                    <NavLink
                      className={classnames({ active: state.activeTab === 1 })}
                      onClick={() => {
                        changeTab(1);
                      }}
                      href="#"
                      to="#"
                    >
                      Current Week Timelog
                    </NavLink>

                    <NavItem>
                      <NavLink
                        className={classnames({ active: state.activeTab === 2 })}
                        onClick={() => {
                          changeTab(2);
                        }}
                        href="#"
                        to="#"
                      >
                        Last Week
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: state.activeTab === 3 })}
                        onClick={() => {
                          changeTab(3);
                        }}
                        href="#"
                        to="#"
                      >
                        Week Before Last
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: state.activeTab === 4 })}
                        onClick={() => {
                          changeTab(4);
                        }}
                        href="#"
                        to="#"
                      >
                        Search by Date Range
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: state.activeTab === 5 })}
                        onClick={() => {
                          changeTab(5);
                        }}
                        href="#"
                        to="#"
                      >
                        Weekly Summaries
                      </NavLink>
                    </NavItem>
                  </Nav>

                  <TabContent activeTab={state.activeTab}>
                    {renderViewingTimeEntriesFrom()}
                    {state.activeTab === 4 && (
                      <Form inline className="mb-2">
                        <FormGroup className="mr-2">
                          <Label for="fromDate" className="mr-2">
                            From
                          </Label>
                          <Input
                            type="date"
                            name="fromDate"
                            id="fromDate"
                            value={state.fromDate}
                            onChange={handleInputChange}
                          />
                        </FormGroup>
                        <FormGroup>
                          <Label for="toDate" className="mr-2">
                            To
                          </Label>
                          <Input
                            type="date"
                            name="toDate"
                            id="toDate"
                            value={state.toDate}
                            onChange={handleInputChange}
                          />
                        </FormGroup>
                        <Button
                          color="primary"
                          onClick={handleSearch}
                          className="ml-2"
                          style={boxStyle}
                        >
                          Search
                        </Button>
                      </Form>
                    )}
                    {state.activeTab === 0 || state.activeTab === 5 ? (
                      <></>
                    ) : (
                      <Form className="mb-2">
                        <FormGroup>
                          <Label htmlFor="projectSelected" className="mr-1 ml-1 mb-1 align-top">
                            Filter Entries by Project and Task:
                          </Label>
                          <Input
                            type="select"
                            name="projectSelected"
                            id="projectSelected"
                            value={state.projectsSelected}
                            title="Ctrl + Click to select multiple projects and tasks to filter."
                            onChange={e => {
                              setState({
                                ...state,
                                projectsSelected: Array.from(
                                  e.target.selectedOptions,
                                  option => option.value,
                                ),
                              });
                            }}
                            multiple
                          >
                            {projectOrTaskOptions}
                          </Input>
                        </FormGroup>
                      </Form>
                    )}

                    {state.activeTab === 0 || state.activeTab === 5 ? (
                      <></>
                    ) : (
                      <EffortBar
                        activeTab={state.activeTab}
                        projectsSelected={state.projectsSelected}
                        roles={role.roles}
                      />
                    )}
                    <TabPane tabId={0}>
                      <TeamMemberTasks
                        asUser={props.asUser}
                        handleUpdateTask={handleUpdateTask}
                      />
                    </TabPane>
                    <TabPane tabId={1}>{currentWeekEntries}</TabPane>
                    <TabPane tabId={2}>{lastWeekEntries}</TabPane>
                    <TabPane tabId={3}>{beforeLastEntries}</TabPane>
                    <TabPane tabId={4}>{periodEntries}</TabPane>
                    <TabPane tabId={5}>
                      <WeeklySummaries userProfile={userProfile} />
                    </TabPane>
                  </TabContent>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      )}
    </div>
  );
};

const mapStateToProps = state => state;

export default connect(mapStateToProps, {
  getTimeEntriesForWeek,
  getTimeEntriesForPeriod,
  getUserProjects,
  getUserProfile,
  getUserTask,
  updateUserProfile,
  getAllRoles,
})(Timelog);
