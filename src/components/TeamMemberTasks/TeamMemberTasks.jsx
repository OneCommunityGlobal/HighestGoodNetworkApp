
import { faClock, faFrown} from '@fortawesome/free-solid-svg-icons';
import { Table } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fetchTeamMembersTask, deleteTaskNotification } from 'actions/task';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector, connect } from 'react-redux';
import SkeletonLoading from '../common/SkeletonLoading';
import { TaskDifferenceModal } from './components/TaskDifferenceModal';
import { getTeamMemberTasksData } from './selectors';
import { getUserProfile } from '../../actions/userProfile';
import './style.css';
import { fetchAllManagingTeams } from '../../actions/team';
import TaskCompletedModal from './components/TaskCompletedModal';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';
import moment from 'moment';
import TeamMemberTask from './TeamMemberTask';
import FilteredTimeEntries from './FilteredTimeEntries';

import { hrsFilterBtnRed, hrsFilterBtnBlue, skyblue} from 'constants/colors';
import { getTeamMembers, getAllUserTeams} from '../../actions/allTeamsAction';
import { getUserTeamMembers } from '../../actions/team';


const TeamMemberTasks = props => {
  const [showTaskNotificationModal, setTaskNotificationModal] = useState(false);
  const [currentTaskNotifications, setCurrentTaskNotifications] = useState([]);
  const [currentTask, setCurrentTask] = useState();
  const [currentUserId, setCurrentUserId] = useState('');
  const { isLoading, usersWithTasks } = useSelector(getTeamMemberTasksData);
  const [tasks, setTasks] = useState();
  const [updatedTasks, setUpdatedTasks] = useState([]);
  const [showMarkAsDoneModal, setMarkAsDoneModal] = useState(false);
  const [clickedToShowModal, setClickedToShowModal] = useState(false);
  const [allTeamList, setallTeamList] = useState([]);
  const [myTeamList, setmyTeamList] = useState(undefined);
  const [teamList, setTeamList] = useState([]);
  const [isLoadingmember, setisLoadingmember] = useState(false);
  const [isTimeLogActive, setIsTimeLogActive] = useState(false);
  const [timeEntriesList, setTimeEntriesList] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState();
  const [isTeamTab, setisTeamTab] = useState(false);
  const [allTeamtwentyFourHoursTimeEntries, setallTeamTwentyFourHoursTimeEntries] = useState([]);
  const [allTeamfortyEightHoursTimeEntries, setallTeamFortyEightHoursTimeEntries] = useState([]);
  const [allTeamseventyTwoHoursTimeEntries, setallTeamSeventyTwoHoursTimeEntries] = useState([]);
  const [myTeamtwentyFourHoursTimeEntries, setmyTeamTwentyFourHoursTimeEntries] = useState([]);
  const [myTeamfortyEightHoursTimeEntries, setmyTeamFortyEightHoursTimeEntries] = useState([]);
  const [myTeamseventyTwoHoursTimeEntries, setmyTeamSeventyTwoHoursTimeEntries] = useState([]);
  const [finishLoadingTimeData, setFinishLoadingTimeData] = useState(false);
  const [taskModalOption, setTaskModalOption] = useState('');

  //added it to keep track if the renderTeamsList should run
  const [shouldRun, setShouldRun] = useState(false);

  //role state so it's more easily changed, the initial value is empty, so it'll be determinated on the first useEffect
  const [userRole, setUserRole] = useState('');

  //function to get user's role if the current user's id is different from the authenticated user
  function getUserRole(userId) {
    const fetchedUser = axios.get(ENDPOINTS.USER_PROFILE(userId));
    return fetchedUser;
  }

  //moved the userId variable to before the first useEffect so the dispatch function can access it
  //Make so the userId gets the url param. If the url param is not available, it'll get the asUser passed as a props
  //If the asUser is not defined, it'll be equal the auth.user.userid from the store
  const userId = props?.match?.params?.userId || props.asUser || props.auth.user.userid;

  const dispatch = useDispatch();

  useEffect(() => {
    const initialFetching = async () => {
      //Passed the userid as argument to fetchTeamMembersTask
      //the fetchTeamMembersTask has a function inside id that gets the userId from the store, like the last part of the userId variable in this file
      //so, before it gets from the store, it'll see if the userId is provided.
      //It works because the userId first looks for the url param. If it gets the param, it will provide it to the userId
      //after that, fetchTeamMembersTask will look for the team member's tasks of the provided userId
      //fetch current user's role, so it can be displayed. It will only happen if the current user's id is different of the auth user id
      //if it's not differente, it'll attribute the current authenticated user's role.
      //also, the userId is different from the authenticated user, it will call the fetchTeamMmbersTask with the currently authenticated user id
      if (userId !== props.auth.user.userid) {
         dispatch(fetchTeamMembersTask(userId, props.auth.user.userid));
        const currentUserRole = getUserRole(userId)
          .then(resp => resp)
          .then(user => {
            setUserRole(user.data.role);
          });
      } else {
        getUserProfile(userId)(dispatch)
         dispatch(fetchTeamMembersTask(userId, null));
        setUserRole(props.auth.user.role);
      }
      setShouldRun(true);
 
    };
    initialFetching();
  }, []);

  useEffect(() => {
    if (clickedToShowModal) {
      setMarkAsDoneModal(true);
    }
  }, [currentUserId]);

  //if user role is core team instead of showing all members show only team members by default.
  useEffect(()=>{
    if((props.userProfile.role=== 'Owner' || props.userProfile.role === 'Administrator' || props.userProfile.role === 'Core Team') && props.managingTeams.length > 0){
      setisTeamTab(true)
      setisLoadingmember(true)
    }
  },[props.userProfile])

  //which data to show depending on user role
  useEffect(()=>{
    if(userRole){
      if((userRole === 'Owner' || userRole === 'Administrator' || userRole === 'Core Team' || userRole === 'Manager') && props.managingTeams.length > 0){ 
        getMyTeam();
      }else{
        renderTeamsList();
      }
    }

  },[usersWithTasks])

  useEffect(() => {  
    //submitTasks();
    if (userId !== props.auth.user.userid) {
      dispatch(fetchTeamMembersTask(userId, props.auth.user.userid));
      const currentUserRole = getUserRole(userId)
        .then(resp => resp)
        .then(user => {
          setUserRole(user.data.role);
        });
    } else {
      dispatch(fetchTeamMembersTask(userId, null));
      setUserRole(props.auth.user.role);
    }
  }, [updatedTasks]);

  const closeMarkAsDone = () => {
    setClickedToShowModal(false);
    setMarkAsDoneModal(false);
    setCurrentUserId('');
  };

  const onUpdateTask = (taskId, updatedTask) => {
    const newTask = {
      updatedTask,
      taskId,
    };
    submitTasks(newTask);
    dispatch(fetchTeamMembersTask(userId, props.auth.user.userid, false));
    props.handleUpdateTask();
  };

  const submitTasks = async updatedTasks => {
    const url = ENDPOINTS.TASK_UPDATE(updatedTasks.taskId);
    try {
      await axios.put(url, updatedTasks.updatedTask);
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleOpenTaskNotificationModal = (userId, task, taskNotifications = []) => {
    setCurrentUserId(userId);
    setCurrentTask(task);
    setCurrentTaskNotifications(taskNotifications);
    setTaskNotificationModal(!showTaskNotificationModal);
  };

  const handleMarkAsDoneModal = (userId, task) => {
    setCurrentUserId(userId);
    setCurrentTask(task);
    setClickedToShowModal(true);
  };

  const handleRemoveFromTaskModal = (userId, task) => {
    setCurrentUserId(userId);
    setCurrentTask(task);
    setClickedToShowModal(true);
  };

  const handleTaskModalOption = option => {
    setTaskModalOption(option);
  };

  const handleTaskNotificationRead = (userId, taskId, taskNotificationId) => {
    //if the authentitated user is seeing it's own notification
    if (currentUserId === props.auth.user.userid) {
      dispatch(deleteTaskNotification(userId, taskId, taskNotificationId));
    }
    handleOpenTaskNotificationModal();
  };

  //if called from getTeamMember it will set team member's time data, from renderTeamList it will set all member's data according to the parameters
  const getTimeEntriesForPeriod = async (member, SeventyTwoHours, setSeventyTwoHours, setFortyEightHours,setTwentyFourHours )=> {
    
    
    let twentyFourList = [];
    let fortyEightList = [];

    //1, fetch data of past 72hrs timelogs
    const fromDate = moment()
      .tz('America/Los_Angeles')
      .subtract(72, 'hours')
      .format('YYYY-MM-DD');
    const toDate = moment()
      .tz('America/Los_Angeles')
      .format('YYYY-MM-DD');

    const userIds = member.map(user => user.personId);

    const userListTasksRequest = async userList => {
      const url = ENDPOINTS.TIME_ENTRIES_USER_LIST;
      return axios.post(url, { users: userList, fromDate, toDate });
    };

    const taskResponse = await userListTasksRequest(userIds);
    const usersListTasks = taskResponse.data;

    //2. Generate array of past 24/48 hrs timelogs
    usersListTasks.map(entry => {
      const threeDaysAgo = moment()
        .tz('America/Los_Angeles')
        .subtract(72, 'hours')
        .format('YYYY-MM-DD');

      const twoDaysAgo = moment()
        .tz('America/Los_Angeles')
        .subtract(48, 'hours')
        .format('YYYY-MM-DD');

      const isFortyEight = moment(entry.dateOfWork).isAfter(threeDaysAgo);
      if (isFortyEight) fortyEightList.push(entry);
      const isTwentyFour = moment(entry.dateOfWork).isAfter(twoDaysAgo);
      if (isTwentyFour) twentyFourList.push(entry);
    });

    //3. set three array of time logs
    setSeventyTwoHours([...usersListTasks]);
    setFortyEightHours([...fortyEightList]);
    setTwentyFourHours([...twentyFourList]);

    if (twentyFourList && fortyEightList) {
      setFinishLoadingTimeData(true);
      setisLoadingmember(false)

    }
  };

  //Display timelogs based on selected period and team members
  const selectPeriod = period => {
    if(!finishLoadingTimeData){
      setisLoadingmember(true)
      return
    }
    if (period === selectedPeriod) {
      setIsTimeLogActive(!isTimeLogActive);
    } else {
      setIsTimeLogActive(true);
    }
    setSelectedPeriod(period);
   
    if (period === 24) {
      if(isTeamTab){
        setTimeEntriesList([...myTeamtwentyFourHoursTimeEntries]);
      }else{
        setTimeEntriesList([...allTeamtwentyFourHoursTimeEntries]);
      }
      
    } else if (period === 48) {
      if(isTeamTab){
        setTimeEntriesList([...myTeamfortyEightHoursTimeEntries]);
      }else{
        setTimeEntriesList([...allTeamfortyEightHoursTimeEntries]);
      }
      
    } else {
    
      if(isTeamTab){
        setTimeEntriesList([...myTeamseventyTwoHoursTimeEntries]);
      }else{
        setTimeEntriesList([...allTeamseventyTwoHoursTimeEntries]);
      }
     
    }
  };

  //get user's tems member data
  const getMyTeam = async () => { 

    let member = []
    let res
    for(let i = 0; i < props.userProfile.teams.length; i++){    
        res = await getTeamMembers(props.userProfile.teams[i]._id)(dispatch);
        if(member.length > 0){
          member.forEach(user => {
            res = res.filter(item => user._id !== item._id)
          });
        }
        member = member.concat(res)
    }
    const filteredlist = usersWithTasks.filter(user => {
      for(let i = 0; i < member.length; i++){
        if(user.personId === member[i]._id){
          return user
        }
      }
    })
    arrangeMembers(filteredlist,setmyTeamList, true)
  
  }

//short members and place current members on top if has any task assigned.
  const arrangeMembers = async (filteredMembers,setTeam,isteamtab)=>{
          //sort all users by their name
          filteredMembers.sort((a, b) => {
            let filteredMembersA = a.name.toLowerCase();
            let filteredMembersB = b.name.toLowerCase();
    
            if (filteredMembersA < filteredMembersB) {
              return -1;
            }
            if (filteredMembersA > filteredMembersB) {
              return 1;
            }
            return 0;
          });
    
          //find currentUser
          const currentUser = filteredMembers.find(user => user.personId === userId);
          // if current user doesn't have any task, the currentUser cannot be found
    
          if (currentUser) {
            //conditional variable for moving current user up front.
            let moveCurrentUserFront = false;
    
            //Does the user has at least one task with project Id and task id assigned. Then set the current user up front.
            for (const task of currentUser.tasks) {
              if (task.wbsId && task.projectId) {
                moveCurrentUserFront = true;
                break;
              }
            }
            //if needs to move current user up front, first remove current user from filterMembers. Then put the current user on top of the list.
            if (moveCurrentUserFront) {
              //removed currentUser
              filteredMembers = filteredMembers.filter(user => user.personId !== userId);
              //push currentUser on top of the array.
              filteredMembers.unshift(currentUser);
            }
          }
            if(isteamtab){
              await getTimeEntriesForPeriod(filteredMembers,myTeamseventyTwoHoursTimeEntries, setmyTeamSeventyTwoHoursTimeEntries, setmyTeamFortyEightHoursTimeEntries, setmyTeamTwentyFourHoursTimeEntries);
            }else{
              await getTimeEntriesForPeriod(filteredMembers,allTeamseventyTwoHoursTimeEntries ,setallTeamSeventyTwoHoursTimeEntries, setallTeamFortyEightHoursTimeEntries, setallTeamTwentyFourHoursTimeEntries);
            }
            setTeam([...filteredMembers])
            setTeamList([...filteredMembers]);           
}

//set all memmers
const renderTeamsList = async () => {
    
    setisLoadingmember(true)
    let filteredMembers
    if (usersWithTasks && usersWithTasks.length > 0) {
      filteredMembers = usersWithTasks.filter(member => {
          return member;
      });  
    }
    
    arrangeMembers(filteredMembers,setallTeamList, false)
  }

 //stop loading on data fetched 
  useEffect(()=>{
    if(isLoadingmember){
      setisLoadingmember(false)
    }
  },[teamList])

//Toggle members view
  const toggleTeamView = () =>{
    if(isTimeLogActive){
      setIsTimeLogActive(false)
    }
    if(isTeamTab){
      setisTeamTab(false)
      if(allTeamList.length > 0){
        setTeamList([...allTeamList]);
      }else{
        renderTeamsList();
      }
    }else{
      setisTeamTab(true)
      if(myTeamList.length > 0){
        setTeamList([...myTeamList]);
      }else{
        getMyTeam();
      }
    }
  };

  return (
    <div className="container team-member-tasks">
      <header className="header-box">
        <h1>Team Member Tasks</h1>
        {(props.userProfile?.role == 'Owner' || props.userProfile?.role === 'Administrator' || props.userProfile?.role === 'Core Team') &&  props.managingTeams.length > 0 &&<button className='circle-border my-team' style={{ 
                backgroundColor: isTeamTab ? skyblue : 'slategray',
                cursor: isLoadingmember ? 'not-allowed' : 'pointer'
                }} onClick={toggleTeamView}
                disabled={isLoadingmember}>
               {isTeamTab ? 'View All' : 'My Teams'}
        </button>}
        
        { finishLoadingTimeData ? (
          <div className="hours-btn-container">
            <button
              type="button"
              className="circle-border 24h"
              title="Timelogs submitted in the past 24 hours"
              style={{
                color: selectedPeriod === 24 && isTimeLogActive ? 'white' : hrsFilterBtnRed,
                backgroundColor:
                  selectedPeriod === 24 && isTimeLogActive ? hrsFilterBtnRed : 'white',
                border: '1px solid #DC143C',
              }}
              onClick={() => selectPeriod(24)}
            >
              24h
            </button>
            <button
              type="button"
              className="circle-border 48h"
              title="Timelogs submitted in the past 48 hours"
              style={{
                color: selectedPeriod === 48 && isTimeLogActive ? 'white' : hrsFilterBtnBlue,
                backgroundColor:
                  selectedPeriod === 48 && isTimeLogActive ? hrsFilterBtnBlue : 'white',
                border: '1px solid #6495ED',
              }}
              onClick={() => selectPeriod(48)}
            >
              48h
            </button>
            <button
              type="button"
              className="circle-border 72h"
              title="Timelogs submitted in the past 72 hours"
              style={{
                color: selectedPeriod === 72 && isTimeLogActive ? 'white' : '#228B22',
                backgroundColor: selectedPeriod === 72 && isTimeLogActive ? '#228B22' : 'white',
                border: '1px solid #228B22',
              }}
              onClick={() => selectPeriod(72)}
            >
              72h
            </button>
          </div>
        ) : (
          <SkeletonLoading template="TimelogFilter" />
        )}
      </header>
      <TaskDifferenceModal
        isOpen={showTaskNotificationModal}
        taskNotifications={currentTaskNotifications}
        task={currentTask}
        userId={currentUserId}
        toggle={handleOpenTaskNotificationModal}
        onApprove={handleTaskNotificationRead}
        loggedInUserId={props.auth.user.userid}
      />
      {currentUserId != '' && (
        <TaskCompletedModal
          isOpen={showMarkAsDoneModal}
          updatedTasks={updatedTasks}
          setUpdatedTasks={setUpdatedTasks}
          setTasks={setTasks}
          tasks={tasks}
          submitTasks={submitTasks}
          popupClose={closeMarkAsDone}
          updateTask={onUpdateTask}
          userId={currentUserId}
          task={currentTask}
          setCurrentUserId={setCurrentUserId}
          setClickedToShowModal={setClickedToShowModal}
          taskModalOption={taskModalOption}
        />
      )}
      <div className="table-container">
        <Table>
          <thead className="pc-component">
            <tr>
              {/* Empty column header for hours completed icon */}
              <th />
              <th className="team-member-tasks-headers">
                <Table borderless className="team-member-tasks-subtable">
                  <thead>
                    <tr>
                      <th className="team-member-tasks-headers team-member-tasks-user-name">
                        Team Member
                      </th>
                      <th className="team-member-tasks-headers team-clocks team-clocks-header">
                        <FontAwesomeIcon icon={faClock} title="Weekly Committed Hours" />
                        /
                        <FontAwesomeIcon
                          style={{ color: 'green' }}
                          icon={faClock}
                          title="Total Hours Completed this Week"
                        />
                        /
                        <FontAwesomeIcon
                          style={{ color: 'red' }}
                          icon={faClock}
                          title="Total Remaining Hours"
                        />
                      </th>
                    </tr>
                  </thead>
                </Table>
              </th>
              <th className="team-member-tasks-headers">
                <Table borderless className="team-member-tasks-subtable">
                  <thead>
                    <tr>
                      <th>Tasks(s)</th>
                      <th className="team-task-progress">Progress</th>
                      {userRole === 'Administrator' ? <th>Status</th> : null}
                    </tr>
                  </thead>
                </Table>
              </th>
            </tr>
          </thead>

          <tbody>

            {isLoadingmember? (
              <SkeletonLoading template="TeamMemberTasks" />

            ) : (
              teamList.map(user => {
                if (!isTimeLogActive) {
                  return (
                    <TeamMemberTask
                      user={user}
                      key={user.personId}
                      handleOpenTaskNotificationModal={handleOpenTaskNotificationModal}
                      handleMarkAsDoneModal={handleMarkAsDoneModal}
                      handleRemoveFromTaskModal={handleRemoveFromTaskModal}
                      handleTaskModalOption={handleTaskModalOption}
                      userRole={userRole}
                      updateTask={onUpdateTask}
                      roles={props.roles}
                      userPermissions={props.userPermissions}
                    />
                  );
                } else {
                  return (
                    <>
                      <TeamMemberTask
                        user={user}
                        key={user.personId}
                        handleOpenTaskNotificationModal={handleOpenTaskNotificationModal}
                        handleMarkAsDoneModal={handleMarkAsDoneModal}
                        handleRemoveFromTaskModal={handleRemoveFromTaskModal}
                        handleTaskModalOption={handleTaskModalOption}
                        userRole={userRole}
                        updateTask={onUpdateTask}
                        roles={props.roles}
                        userPermissions={props.userPermissions}
                      />
                      {timeEntriesList.length > 0 &&
                        timeEntriesList
                          .filter(timeEntry => timeEntry.personId === user.personId)
                          .map(timeEntry => (
                            <tr className="table-row">
                              <td colSpan={3} style={{ padding: 0 }}>
                                <FilteredTimeEntries data={timeEntry} key={timeEntry._id} />
                              </td>
                            </tr>
                          ))}
                    </>
                  );
                }
              })
            ) }
          </tbody>
          
        </Table>
        {isTeamTab && myTeamList?.length === 1 && <p className='noMember'>Great, you are on a team! Unfortunately though, your team has only you in it 
         <FontAwesomeIcon icon={faFrown} size='lg' style={{color: "#ffd22e", marginLeft:'2px'}} />. Contact an Administrator or your Manager to fix this so you are not so lonely here!</p>}
      </div>
    </div>
  );
};

const mapStateToProps = state => ({
  auth: state.auth,
  userId: state.userProfile.id,
  managingTeams: state.userProfile.teams,
  teamsInfo: state.managingTeams,
});

export default connect(mapStateToProps, {
  getUserProfile,
  fetchAllManagingTeams,
})(TeamMemberTasks);

