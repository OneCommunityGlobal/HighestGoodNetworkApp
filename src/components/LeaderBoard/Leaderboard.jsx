import React, { useEffect, useState, useRef } from 'react';
import './Leaderboard.css';
import { isEqual } from 'lodash';
import { Link } from 'react-router-dom';
import { Table, Progress, Modal, ModalBody, ModalFooter, ModalHeader, Button } from 'reactstrap';
import Alert from 'reactstrap/lib/Alert';
import { hasLeaderboardPermissions, assignStarDotColors, showStar } from 'utils/leaderboardPermissions';
import { getTeamMembers} from '../../actions/allTeamsAction';
import {skyblue} from 'constants/colors';
import Loading from '../common/Loading';
import { getLeaderboardData, getOrgData} from '../../actions/leaderBoardData';
import { round, maxBy } from 'lodash';
import { getcolor, getProgressValue } from '../../utils/effortColors';
import {faFrown} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import hasPermission from 'utils/permissions';
import MouseoverTextTotalTimeEditButton from 'components/mouseoverText/MouseoverTextTotalTimeEditButton';
import { toast } from 'react-toastify';

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

const LeaderBoard = ({
  getLeaderboardData,
  getOrgData,
  getMouseoverText,
  leaderBoardData,
  loggedInUser,
  organizationData,
  timeEntries,
  isVisible,
  asUser,
  userTeams,
  userRole,
  dispatch,
  totalTimeMouseoverText,
}) => {



  const [myTeamData,setmyTeamData] = useState(undefined)
  const [leaderboarddata,setleaderboarddata] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState([]);
  const [isTeamTab, setisTeamTab] = useState(false);
  const [isLoadingmember, setisLoadingmember] = useState(false);
 
  const userId = asUser ? asUser : loggedInUser.userId;
  const isAdmin = ['Owner', 'Administrator', 'Core Team'].includes(loggedInUser.role);
 
  const hasSummaryIndicatorPermission = hasPermission('seeSummaryIndicator'); //??? this permission doesn't exist?
  const hasVisibilityIconPermission = hasPermission('seeVisibilityIcon'); //??? this permission doesn't exist?
  const isOwner = ['Owner'].includes(loggedInUser.role);

  const [mouseoverTextValue, setMouseoverTextValue] = useState(totalTimeMouseoverText);

  useEffect(() => {
    getMouseoverText();
    setMouseoverTextValue(totalTimeMouseoverText);
  }, [totalTimeMouseoverText]);

  const handleMouseoverTextUpdate = text => {
    setMouseoverTextValue(text);
  };
  useDeepEffect(() => {
    getLeaderboardData(userId)(dispatch);
    getOrgData()(dispatch);
  }, [timeEntries]);

  //get leaderboard data
  const getdata = async ()=>{
    // const url = ENDPOINTS.LEADER_BOARD(userId);
    // const res = await httpService.get(url);
    // let leaderBoardData = res.data
    let leaderBoardData = await getLeaderboardData(userId)(dispatch)

    if (loggedInUser.role !== 'Administrator' && loggedInUser.role !== 'Owner' && loggedInUser.role !== 'Core Team') {
      leaderBoardData = leaderBoardData.filter(element => {
        return element.weeklycommittedHours > 0 || loggedInUser.userid === element.personId;
      });
    }
  
    if (leaderBoardData.length) {
      let maxTotal = maxBy(leaderBoardData, 'totaltime_hrs').totaltime_hrs || 10;
      leaderBoardData = leaderBoardData.map(element => {
        element.didMeetWeeklyCommitment =
        element.totaltangibletime_hrs >= element.weeklycommittedHours;
        element.weeklycommitted = round(element.weeklycommittedHours, 2);
        element.tangibletime = round(element.totaltangibletime_hrs, 2);
        element.intangibletime = round(element.totalintangibletime_hrs, 2);
        element.tangibletimewidth = round((element.totaltangibletime_hrs * 100) / maxTotal, 0);
        element.intangibletimewidth = round((element.totalintangibletime_hrs * 100) / maxTotal, 0);
        element.barcolor = getcolor(element.totaltangibletime_hrs);
        element.barprogress = getProgressValue(element.totaltangibletime_hrs, 40);
        element.totaltime = round(element.totaltime_hrs, 2);
        element.isVisible = element.role === 'Volunteer' || element.isVisible;
  
        return element;
      });
    }
    setleaderboarddata([...leaderBoardData])
  }

  //set team toggler button state according to logged in user role
  useEffect(()=>{
    if(loggedInUser){
      setisLoadingmember(true)
      getdata()
    }
  },[loggedInUser])

  //if user role is core team or admin or owner instead of showing all members show only team members by default.//loggedInUser.role
  useDeepEffect(() => {
    if(userRole){
      if((userRole === 'Owner' || userRole === 'Administrator' || userRole === 'Core Team') && userTeams?.length > 0){
        setisTeamTab(true)
        getMyTeam();
      }else{
        setShowLeaderboard([...leaderboarddata])
      } 
      try {
        if (window.screen.width < 540) {
          const scrollWindow = document.getElementById('leaderboard');
          if (scrollWindow) {
            const elem = document.getElementById(`id${userId}`); //
  
            if (elem) {
              const topPos = elem.offsetTop;
              scrollWindow.scrollTo(0, topPos - 100 < 100 ? 0 : topPos - 100);
            }
          }
        }
      } catch {} 
    }

  }, [leaderboarddata,userRole]);

  //get user team members
  const getMyTeam = async () => { 
    let member = []
    let res
    if(userTeams){
      for(let i =0; i < userTeams?.length; i++){    
        res = await getTeamMembers(userTeams[i]._id)(dispatch);
        if(member.length > 0){
          member.forEach(user => {
            res = res.filter(item => user._id !== item._id);
          });
        }
        member = member.concat(res);
    }
    const filteredlist = leaderboarddata.filter(user => {
      for(let i = 0; i < member.length; i++){
        if(user.personId === member[i]._id){
          return user;
        }
      }
    })
    setmyTeamData([...filteredlist]);
    setShowLeaderboard([...filteredlist]);
  }
}
//my team toggle button
const toggleTeamView = () =>{
  if(isTeamTab){
    setisTeamTab(false)
    setShowLeaderboard([...leaderboarddata]);
  }else{
    setisTeamTab(true)
    setShowLeaderboard([...myTeamData]);
  }
}

//stop loading on data fetched
useEffect(()=>{
  if(isLoadingmember && showLeaderboard){
    setisLoadingmember(false)
  }
},[showLeaderboard])

  const [isOpen, setOpen] = useState(false);
  const [modalContent, setContent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const toggle = () => setOpen(isOpen => !isOpen);

  const modalInfos = [
    <>
      <p>
        This is the One Community Leaderboard! It is used to show how much tangible and total time
        you’ve contributed, whether or not you’ve achieved your total committed hours for the week,
        and (in the case of teams) where your completed hours for the week rank you compared to
        other team members. It can also be used to access key areas of this application.
      </p>
      <ul>
        <li>
          The HGN Totals at the top shows how many volunteers are currently active in the system,
          how many volunteer hours they are collectively committed to, and how many tangible and
          total hours they have completed.
          {/*The color and length of that bar
          changes based on what percentage of the total committed hours for the week have been
          completed: 0-20%: Red, 20-40%: Orange, 40-60% hrs: Green, 60-80%: Blue, 80-100%:Indigo,
          and Equal or More than 100%: Purple.*/}
        </li>
        <li>
          The red/green dot shows whether or not a person has completed their “tangible” hours
          commitment for the week. Green = yes (Great job!), Red = no. Clicking this dot will take
          you to a person’s tasks section on their/your dashboard.{' '}
        </li>
        <li>
          The time bar shows how much tangible and total (tangible + intangible) time you’ve
          completed so far this week. In the case of teams, it also shows you where your completed
          hours for the week rank you compared to other people on your team. Clicking a person’s
          time bar will take you to the time log section on their/your dashboard. This bar also
          changes color based on how many tangible hours you have completed: 0-5 hrs: Red, 5-10 hrs:
          Orange, 10-20 hrs: Green, 20-30 hrs: Blue, 30-40 hrs: Indigo, 40-50 hrs: Violet, and 50+
          hrs: Purple
        </li>
        <li>Clicking a person’s name will lead to their/your profile page.</li>
      </ul>
      <p>Hovering over any of these areas will tell you how they function too. </p>
    </>,
    <>
      <p>
        An Admin has made it so you can see your team but they can&apos;t see you. We recommend you
        keep this setting as it is.
      </p>
      <p>
        If you want to change this setting so your team/everyone can see and access your time log
        though, you can do so by going to&nbsp;
        <Link to={`/userprofile/${userId}`} title="View Profile">
          Your Profile&nbsp;
        </Link>
        --&gt; Teams Tab --&gt; toggle the “Visibility” switch to “Visible”.
      </p>
      <p>Note: Admins and Core Team can always see all team members. This cannot be changed.</p>
    </>,
  ];

  const handleModalOpen = idx => {
    setContent(modalInfos[idx]);
    setOpen(true);
  };
  // add state hook for the popup the personal's dashboard from leaderboard
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const dashboardToggle = item => setIsDashboardOpen(item.personId);
  const dashboardClose = () => setIsDashboardOpen(false);

  const showDashboard = item => {
    dashboardClose();
    window.open(
      `/dashboard/${item.personId}`,
      'Popup',
      'toolbar=no, location=no, statusbar=no, menubar=no, scrollbars=1, resizable=0, width=580, height=600, top=30',
    );
  };
  const updateLeaderboardHandler = async () => {
    setIsLoading(true);
    await getLeaderboardData(userId);
    setIsLoading(false);
    toast.success('Successfuly updated leaderboard');
  };

  return (
    <div>
      <div className='leader-head'>
      <h3>
        Leaderboard&nbsp;&nbsp;
        <i
          data-toggle="tooltip"
          data-placement="right"
          title="Click to refresh the leaderboard"
          style={{ fontSize: 24, cursor: 'pointer' }}
          aria-hidden="true"
          className={`fa fa-refresh ${isLoading ? 'animation' : ''}`}
          onClick={updateLeaderboardHandler}
        />
        &nbsp;&nbsp;
        <i
          data-toggle="tooltip"
          data-placement="right"
          title="Click for more information"
          style={{ fontSize: 24, cursor: 'pointer' }}
          aria-hidden="true"
          className="fa fa-info-circle"
          onClick={() => {
            handleModalOpen(0);
          }}
        />
      </h3>
      {(loggedInUser.role === 'Owner' || loggedInUser.role === 'Administrator' || loggedInUser.role == 'Core Team') && userTeams?.length > 0 && <button className='circle-border my-team' style={{ 
                backgroundColor: isTeamTab ? skyblue : 'slategray',
                cursor: isLoadingmember ? 'not-allowed': 'pointer',
                }} onClick={toggleTeamView}
                disabled={isLoadingmember}>
                {isTeamTab ? 'View All' : 'My Teams'}
      </button>}
      </div>
      {!isVisible && (
        <Alert color="warning">
          Note: You are currently invisible to the team(s) you are on.&nbsp;&nbsp;
          <i
            data-toggle="tooltip"
            data-placement="right"
            title="Click for more information"
            style={{ fontSize: 20, cursor: 'pointer' }}
            aria-hidden="true"
            className="fa fa-info-circle"
            onClick={() => {
              handleModalOpen(1);
            }}
          />
        </Alert>
      )}
      <span className="leaderboard">
        <Modal isOpen={isOpen} toggle={toggle}>
          <ModalHeader toggle={toggle}>Leaderboard Info</ModalHeader>
          <ModalBody>{modalContent}</ModalBody>
          <ModalFooter>
            <Button onClick={toggle} color="secondary" className="float-left">
              {' '}
              Ok{' '}
            </Button>
          </ModalFooter>
        </Modal>
      </span>
      <div id="leaderboard" className="my-custom-scrollbar table-wrapper-scroll-y">
        <Table className="leaderboard table-fixed">
          <thead>
            <tr>
              <th>Status</th>
              <th>Name</th>
              <th>
                <span className="d-sm-none">Tan. Time</span>
                <span className="d-none d-sm-block">Tangible Time</span>
              </th>
              <th>Progress</th>

              <th style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ textAlign: 'left' }}>
                    <span className="d-sm-none">Tot. Time</span>
                    <span className="d-none d-sm-inline-block" title={mouseoverTextValue}>
                      Total Time{' '}
                    </span>
                  </div>
                  {isOwner && (
                    <MouseoverTextTotalTimeEditButton onUpdate={handleMouseoverTextUpdate} />
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="my-custome-scrollbar">
            <tr>
              <td />
              <th scope="row">{organizationData.name}</th>
              <td className="align-middle">
                <span title="Tangible time">{organizationData.tangibletime || ''}</span>
              </td>
              <td className="align-middle">
                <Progress
                  title={`TangibleEffort: ${organizationData.tangibletime} hours`}
                  value={organizationData.barprogress}
                  color={organizationData.barcolor}
                />
              </td>
              <td className="align-middle">
                <span title="Tangible + Intangible time = Total time">
                  {organizationData.totaltime} of {organizationData.weeklycommittedHours}
                </span>
              </td>
            </tr>
            {isLoadingmember ? <Loading/>: (
            showLeaderboard.map((item, key) => (
              <tr key={key}>
                <td className="align-middle">
                  <div>
                    <Modal isOpen={isDashboardOpen === item.personId} toggle={dashboardToggle}>
                      <ModalHeader toggle={dashboardToggle}>Jump to personal Dashboard</ModalHeader>
                      <ModalBody>
                        <p>Are you sure you wish to view this {item.name} dashboard?</p>
                      </ModalBody>
                      <ModalFooter>
                        <Button variant="primary" onClick={() => showDashboard(item)}>
                          Ok
                        </Button>{' '}
                        <Button variant="secondary" onClick={dashboardToggle}>
                          Cancel
                        </Button>
                      </ModalFooter>
                    </Modal>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: hasSummaryIndicatorPermission ? 'space-between' : 'center',
                    }}
                  >
                    {/* <Link to={`/dashboard/${item.personId}`}> */}
                    <div onClick={() => dashboardToggle(item)}>
                      {hasLeaderboardPermissions(loggedInUser.role) &&
                      showStar(item.tangibletime, item.weeklycommittedHours) ? (
                        <i
                          className="fa fa-star"
                          title={`Weekly Committed: ${item.weeklycommittedHours} hours`}
                          style={{
                            color: assignStarDotColors(
                              item.tangibletime,
                              item.weeklycommittedHours,
                            ),
                            fontSize: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        />
                      ) : (
                        <div
                          title={`Weekly Committed: ${item.weeklycommittedHours} hours`}
                          style={{
                            backgroundColor:
                              item.tangibletime >= item.weeklycommittedHours ? '#32CD32' : 'red',
                            width: 15,
                            height: 15,
                            borderRadius: 7.5,
                            margin: 'auto',
                            verticalAlign: 'middle',
                          }}
                        />
                      )}
                    </div>
                    {hasSummaryIndicatorPermission && item.hasSummary && (
                      <div
                        title={`Weekly Summary Submitted`}
                        style={{
                          color: '#32a518',
                          cursor: 'default',
                        }}
                      >
                        <strong>✓</strong>
                      </div>
                    )}
                  </div>
                  {/* </Link> */}
                </td>
                <th scope="row">
                  <Link to={`/userprofile/${item.personId}`} title="View Profile">
                    {item.name}
                  </Link>
                  &nbsp;&nbsp;&nbsp;
                  {hasVisibilityIconPermission && !item.isVisible && (
                    <i className="fa fa-eye-slash" title="User is invisible"></i>
                  )}
                </th>
                <td className="align-middle" id={`id${item.personId}`}>
                  <span title="Tangible time">{item.tangibletime}</span>
                </td>
                <td className="align-middle">
                  <Link
                    to={`/timelog/${item.personId}`}
                    title={`TangibleEffort: ${item.tangibletime} hours`}
                  >
                    <Progress value={item.barprogress} color={item.barcolor} />
                  </Link>
                </td>
                <td className="align-middle">
                  <span
                    title={mouseoverTextValue}
                    id="Total time"
                    className={item.totalintangibletime_hrs > 0 ? 'boldClass' : null}
                  >
                    {item.totaltime}
                  </span>
                </td>
              </tr>
            )))}
          </tbody>
        </Table>
        {isTeamTab && myTeamData?.length === 1 && <p className='noMember'>Great, you are on a team! Unfortunately though, your team has only you in it 
         <FontAwesomeIcon icon={faFrown} size='lg' style={{color: "#ffd22e", marginLeft:'2px'}} />. Contact an Administrator or your Manager to fix this so you are not so lonely here!</p>}
      </div>
    </div>
  );
};

export default LeaderBoard;
