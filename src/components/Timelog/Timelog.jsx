import React, { useState, useEffect } from 'react';

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
import { isEmpty } from 'lodash';
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
import Loading from '../common/Loading';
import hasPermission from '../../utils/permissions';



const Timelog = props => {
  /* =======Functions======== */
  const doesUserHaveTaskWithWBS = tasks => {
    let check = false;
    for (let task of tasks) {
      if (task.wbsId) {
        check = true;
        break;
      }
    }
    return check;
  };

  // startOfWeek returns the date of the start of the week based on offset. Offset is the number of weeks before.
  // For example, if offset is 0, returns the start of this week. If offset is 1, returns the start of last week.
  const startOfWeek = (offset)=> {
    return moment()
      .tz('America/Los_Angeles')
      .startOf('week')
      .subtract(offset, 'weeks')
      .format('YYYY-MM-DD');
  }

  // endOfWeek returns the date of the end of the week based on offset. Offset is the number of weeks before.
  // For example, if offset is 0, returns the end of this week. If offset is 1, returns the end of last week.
  const endOfWeek=(offset)=> {
    return moment()
      .tz('America/Los_Angeles')
      .endOf('week')
      .subtract(offset, 'weeks')
      .format('YYYY-MM-DD');
  }

  const toggle=()=> {
    setState({...state, modal: !state.modal});
  }

  const showSummary=(isOwner)=>{
    if (isOwner) {
      setState({...state, summary: !state.summary});
      setTimeout(() => {
        const elem = document.getElementById('weeklySum');
        if (elem) {
          elem.scrollIntoView();
        }
      }, 150);
    }
  }

  const openInfo=()=> {
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
      information: str.split('\n').map((item, i) => <p key={i}>{item}</p>)
    });
  }

  const changeTab=(tab)=> {
    setState({
      ...state,
      activeTab: tab,
    });
  }

  const handleInputChange=(e)=> {
    setState({ ...state,[e.target.name]: e.target.value });
  }

  const handleSearch=(e)=> {
    e.preventDefault();
    const userId =
      props.match && props.match.params.userId
        ? props.match.params.userId
        : props.asUser || props.auth.user.userid;
    getTimeEntriesForPeriod(userId, state.fromDate, state.toDate);
  }

  const calculateTotalTime=(data, isTangible) =>{
    const filteredData = data.filter(entry => entry.isTangible === isTangible);

    const reducer = (total, entry) => total + parseInt(entry.hours) + parseInt(entry.minutes) / 60;
    return filteredData.reduce(reducer, 0);
  }

  const generateTimeEntries=(data) =>{
    if (!state.projectsSelected.includes('all')) {
      data = data.filter(entry => state.projectsSelected.includes(entry.projectId));
    }
    return data.map(entry => (
      <TimeEntry data={entry} displayYear={false} key={entry._id} userProfile={props.userProfile} />
    ));
  }

  const renderViewingTimeEntriesFrom=()=> {
    if (state.activeTab === 0) {
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
  }

  const loadAsyncData = async (userId) => {
    //console.log('======loadData=======',userId);
    setState({ ...state, isTimeEntriesLoading: true });
    try {
      await Promise.all([
        getTimeEntriesForWeek(userId, 0),
        getTimeEntriesForWeek(userId, 1),
        getTimeEntriesForWeek(userId, 2),
        getTimeEntriesForPeriod(userId, state.fromDate, state.toDate),
        getUserProjects(userId),
        getAllRoles(),
        getUserTask(userId),
      ]);
      const weekEffort = calculateTotalTime(props.timeEntries.weeks[0], true);
      setState({...state,currentWeekEffort:weekEffort});
    } catch(e) {
      setError(e);
      console.log('+++++++',error);
    }
  }

  const buildOptions = async ()=>{
    let projects = [];
    if (!isEmpty(props.userProjects.projects)) {
      projects = props.userProjects.projects;
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
    if (!isEmpty(props.userTask)) {
      tasks = props.userTask;
    }
    const activeTasks = tasks.filter(task =>
      task.resources.some(resource => resource.userID === props.auth.user.userid && !resource.completedTask),
    );
    const taskOptions = activeTasks.map(task => (
      <option value={task._id} key={task._id}>
        {task.taskName}
      </option>
    ));
    const allOptions = options.concat(taskOptions);
    return allOptions;
  }

  const generateAllTimeEntries = async () =>{
    const currentWeekEntries = generateTimeEntries(props.timeEntries.weeks[0]);
    const lastWeekEntries = generateTimeEntries(props.timeEntries.weeks[1]);
    const beforeLastEntries = generateTimeEntries(props.timeEntries.weeks[2]);
    const periodEntries = generateTimeEntries(props.timeEntries.period);
    return [currentWeekEntries,lastWeekEntries,beforeLastEntries,periodEntries];
  }
 
  /* =======State======== */
  const initialState = {
    modal: false,
    summary: false,
    activeTab: 1,
    projectsSelected: ['all'],
    fromDate: startOfWeek(0),
    toDate: endOfWeek(0),
    in: false,
    information: '',
    currentWeekEffort: 0,
    isTimeEntriesLoading: true,
  };
  const [state, setState] = useState(initialState);
  const [data, setData] = useState({
    disabled: !hasPermission(
      props.auth.user.role,
      'disabledDataTimelog',
      props.role.roles,
      props.auth.user?.permissions?.frontPermissions,
    )
      ? false
      : true,
    isTangible: false,
  });
  const [error,setError] = useState();
  const [projectOrTaskOptions,setProjectOrTaskOptions] = useState();
  const [currentWeekEntries,setCurrentWeekEntries]=useState();
  const [lastWeekEntries,setLastWeekEntries]=useState();
  const [beforeLastEntries,setBeforeLastEntries]=useState();
  const [periodEntries,setPeriodEntries]=useState();
  const [userId,setUserId] = useState();

  /* =======Hook======== */
  const timeLogFunction = (userId)=>{
    loadAsyncData(userId).then(()=>{
      setState({ ...state, isTimeEntriesLoading: false });
    }).then(()=>{
      buildOptions().then((response)=>{
        setProjectOrTaskOptions(response);
      });
    })

    const role = props.auth.user.role;
    //if user role is admin, manager, mentor or owner then default tab is task. If user have any tasks assigned, default tab is task.
    if (role === 'Administrator' || role === 'Manager' || role === "'Mentor'" || role === 'Owner') {
      setState({ ...state, activeTab: 0 });
    }

    const UserHaveTask = doesUserHaveTaskWithWBS(props.userTask);
    if (UserHaveTask) {
      setState({ ...state, activeTab: 0 });
    }
  }

  useEffect (() =>{
    // Does not run again (except once in development)
    const userId = props?.match?.params?.userId || props.asUser || props.auth.user.userid; //Including fix for "undefined"
    setUserId(userId);
    timeLogFunction(userId);
  },[])
 
  useEffect(() =>{
    // runs after first and re-renders with changed dependencies.
    if (!userId) {// skip the first render. 
      setState(initialState);
      const userId = props.match?.params?.userId || props.asUser || props.auth.user.userid;
      if (props.userProfile._id !== userId){
        getUserProfile(userId);
      }
      setUserId(userId);
      timeLogFunction(userId);
    }  
    },[props.auth.user.userid]
  )

  useEffect(()=>{
    generateAllTimeEntries().then((response)=>{
      setCurrentWeekEntries(response[0]);
      setLastWeekEntries(response[1]);
      setBeforeLastEntries(response[2]);
      setPeriodEntries(response[3]);
    });
  },[state.projectsSelected])
  
  const { role } = props.auth.user;
  const userPermissions = props.auth.user?.permissions?.frontPermissions;
  const isOwner = props.auth.user.userid === userId;
  const leaderData = [{ personId: userId, tangibletime: state.currentWeekEffort }];
  const fullName = `${props.userProfile.firstName} ${props.userProfile.lastName}`;

  return (
    
    <div>
      {!props.isDashboard ? (
        <Container fluid>
            <SummaryBar
              asUser={userId}
              toggleSubmitForm={() => showSummary(isOwner)}
              role={role}
              leaderData={leaderData}
            />
            <br />
          </Container>
      ) : (
        ''
      )}
      {state.isTimeEntriesLoading ? (
        <Loading />
      ) : (
        <Container className="right-padding-temp-fix">
          {state.summary ? (
            <div className="my-2">
              <div id="weeklySum">
                <WeeklySummary asUser={userId} />
              </div>
            </div>
          ) : null}
          <Row className="right-padding-temp-fix">
            <Col className="right-padding-temp-fix" md={12}>
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
                        <ActiveCell
                          isActive={props.userProfile.isActive}
                          user={props.userProfile}
                          onClick={() => {
                            updateUserProfile(userId, {
                              ...props.userProfile,
                              isActive: !props.userProfile.isActive,
                              endDate:
                                !props.userProfile.isActive === false
                                  ? moment(new Date()).format('YYYY-MM-DD')
                                  : undefined,
                            });
                          }}
                        />
                        <ProfileNavDot
                          userId={
                            props.match?.params?.userId ||
                            props.asUser ||
                            props.auth.user.userid
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
                            <Button color="success" onClick={toggle}>
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
                              Clicking this button only allows for “Intangible Time” to be added
                              to your time log.{' '}
                              <u>
                                You can manually log Intangible Time but it doesn’t <br />
                                count towards your weekly time commitment.
                              </u>
                              <br />
                              <br />
                              “Tangible Time” is the default for logging time using the timer at
                              the top of the app. It represents all work done on assigned action
                              items <br />
                              and is what counts towards a person’s weekly volunteer time
                              commitment. The only way for a volunteer to log Tangible Time is by
                              using the clock
                              <br />
                              in/out timer. <br />
                              <br />
                              Intangible Time is almost always used only by the management team.
                              It is used for weekly Monday night management team calls, monthly
                              management
                              <br />
                              team reviews and Welcome Team Calls, and non-action-item related
                              research, classes, and other learning, meetings, etc. that benefit
                              or relate to <br />
                              the project but aren’t related to a specific action item on the{' '}
                              <a href="https://www.tinyurl.com/oc-os-wbs">
                                One Community Work Breakdown Structure.
                              </a>
                              <br />
                              <br />
                              Intangible Time may also be logged by a volunteer when in the field
                              or for other reasons when the timer wasn’t able to be used. In these
                              cases, the <br />
                              volunteer will use this button to log time as “intangible time” and
                              then request that an Admin manually change the log from Intangible
                              to Tangible.
                              <br />
                              <br />
                            </ReactTooltip>
                          </div>
                        </div>
                      ) : (
                        hasPermission(
                          role,
                          'addTimeEntryOthers',
                          props.role.roles,
                          userPermissions,
                        ) && (
                          <div className="float-right">
                            <div>
                              <Button color="warning" onClick={toggle}>
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
                          <Button onClick={openInfo} color="primary">
                            Close
                          </Button>
                          {hasPermission(
                            role,
                            'editTimelogInfo',
                            props.role.roles,
                            userPermissions,
                          ) ? (
                            <Button onClick={openInfo} color="secondary">
                              Edit
                            </Button>
                          ) : null}
                        </ModalFooter>
                      </Modal>
                      <TimeEntryForm
                        userId={userId}
                        data={data}
                        edit={false}
                        toggle={toggle}
                        isOpen={state.modal}
                        userProfile={props.userProfile}
                        roles={props.role.roles}
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
                        <Button color="primary" onClick={handleSearch} className="ml-2">
                          Search
                        </Button>
                      </Form>
                    )}
                    {state.activeTab === 0 ? (
                      <></>
                    ) : (
                      <Form className="mb-2">
                        <FormGroup>
                          <Label for="projectSelected" className="mr-1 ml-1 mb-1 align-top">
                            Filter Entries by Project and Task:
                          </Label>
                          <Input
                            type="select"
                            name="projectSelected"
                            id="projectSelected"
                            value={state.projectsSelected}
                            title="Ctrl + Click to select multiple projects and tasks to filter."
                            onChange={e =>{
                              setState({...state,
                                projectsSelected: Array.from(
                                  e.target.selectedOptions,
                                  option => option.value,
                                ),
                              })
                            }
                              
                            }
                            multiple
                          >
                            {projectOrTaskOptions}
                          </Input>
                        </FormGroup>
                      </Form>
                    )}

                    {state.activeTab === 0 ? (
                      <></>
                    ) : (
                      <EffortBar
                        activeTab={state.activeTab}
                        projectsSelected={state.projectsSelected}
                      />
                    )}
                    <TabPane tabId={0}>
                      <TeamMemberTasks asUser={props.asUser} />
                    </TabPane>
                    <TabPane tabId={1}>{currentWeekEntries}</TabPane>
                    <TabPane tabId={2}>{lastWeekEntries}</TabPane>
                    <TabPane tabId={3}>{beforeLastEntries}</TabPane>
                    <TabPane tabId={4}>{periodEntries}</TabPane>
                  </TabContent>
                </CardBody>
              </Card>
            </Col>
            <Col md={4} />
          </Row>
        </Container>
      )}
    </div>

  );

}


const mapStateToProps = state => ({
  auth: state.auth,
  userProfile: state.userProfile,
  timeEntries: state.timeEntries,
  userProjects: state.userProjects,
  role: state.role,
  userTask: state.userTask,
});

export default connect(mapStateToProps, {
  getTimeEntriesForWeek,
  getTimeEntriesForPeriod,
  getUserProjects,
  getUserProfile,
  getUserTask,
  updateUserProfile,
  getAllRoles,
})(Timelog);
