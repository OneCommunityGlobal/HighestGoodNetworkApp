import { useEffect, useState, useRef, useCallback, lazy, Suspense } from 'react';
import './Leaderboard.css';
import { isEqual, debounce } from 'lodash';
import { Link } from 'react-router-dom';
import {
  Table,
  Progress,
  Button,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Spinner,
  Input,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';
import ReactTooltip from 'react-tooltip';
import Alert from 'reactstrap/lib/Alert';
import {
  hasLeaderboardPermissions,
  assignStarDotColors,
  showStar,
  viewZeroHouraMembers,
} from 'utils/leaderboardPermissions';
import { calculateDurationBetweenDates, showTrophyIcon } from 'utils/anniversaryPermissions';
import hasPermission from 'utils/permissions';
// import MouseoverTextTotalTimeEditButton from 'components/mouseoverText/MouseoverTextTotalTimeEditButton';
import { toast } from 'react-toastify';
import moment from 'moment-timezone';
import { Tooltip } from 'reactstrap';
import { boxStyle } from 'styles';
import axios from 'axios';
import { getUserProfile } from 'actions/userProfile';
import { useDispatch } from 'react-redux';
import { boxStyleDark } from '../../styles';
import '../Header/DarkMode.css';
import '../UserProfile/TeamsAndProjects/autoComplete.css';
import { ENDPOINTS } from '../../utils/URL';
import useLeaderboardData from '../../hooks/useLeaderboardData';

const EditableInfoModal = lazy(() => import('../UserProfile/EditableModal/EditableInfoModal'));
const Modal = lazy(() => import('reactstrap/lib/Modal'));



function displayDaysLeft(lastDay) {
  if (lastDay) {
    const today = new Date();
    const endDate = new Date(lastDay);
    const differenceInTime = endDate.getTime() - today.getTime();
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
    return -differenceInDays;
  }
  return null; // or any other appropriate default value
}

function LeaderBoard({
  postLeaderboardData,
  // getMouseoverText,
  loggedInUser,
  timeEntries,
  isVisible,
  displayUserId,
  totalTimeMouseoverText,
  allRequests,
  showTimeOffRequestModal,
  darkMode,
  getWeeklySummaries,
  setFilteredUserTeamIds,
  userOnTimeOff,
  usersOnFutureTimeOff,
}) {
  const { leaderboardData, organizationData, isLoading, error, getLeaderboardData, getOrgData } = useLeaderboardData(displayUserId, timeEntries);
  const userId = displayUserId;
  const hasSummaryIndicatorPermission = hasPermission('seeSummaryIndicator'); // ??? this permission doesn't exist?
  const hasVisibilityIconPermission = hasPermission('seeVisibilityIcon'); // ??? this permission doesn't exist?
  const todaysDate = moment()
    .tz('America/Los_Angeles')
    .endOf('week')
    .format('YYYY-MM-DD');

  useEffect(() => {
    for (let i = 0; i < leaderboardData.length; i += 1) {
      const startDate = leaderboardData[i].startDate?.split('T')[0];
      const showTrophy = showTrophyIcon(todaysDate, startDate);
      if (!showTrophy && leaderboardData[i].trophyFollowedUp) {
        postLeaderboardData(leaderboardData[i].personId, false);
      }
    }
  }, []);

  const isOwner = ['Owner'].includes(loggedInUser.role);
  const allowedRoles = ['Administrator', 'Manager', 'Mentor', 'Core Team', 'Assistant Manager'];
  const isAllowedOtherThanOwner = allowedRoles.includes(loggedInUser.role);
  const [currentTimeOfftooltipOpen, setCurrentTimeOfftooltipOpen] = useState({});
  const [futureTimeOfftooltipOpen, setFutureTimeOfftooltipOpen] = useState({});

  const [mouseoverTextValue, setMouseoverTextValue] = useState(totalTimeMouseoverText);
  const dispatch = useDispatch();

  useEffect(() => {
    // getMouseoverText();
    setMouseoverTextValue(totalTimeMouseoverText);
  }, [totalTimeMouseoverText]);
  const [teams, setTeams] = useState([]);
  const [selectedTeamName, setSelectedTeamName] = useState('Show all');
  const [usersSelectedTeam, setUsersSelectedTeam] = useState('Show all');
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [userRole, setUserRole] = useState();
  const [teamsUsers, setTeamsUsers] = useState([]);
  const [innerWidth, setInnerWidth] = useState();
  const [isAbbreviatedView, setIsAbbreviatedView] = useState(false);

  const [isDisplayAlert, setIsDisplayAlert] = useState(false);
  const [stateOrganizationData, setStateOrganizationData] = useState(organizationData);

  const refTeam = useRef([]);
  const refInput = useRef('');

  const hasTimeOffIndicatorPermission = hasLeaderboardPermissions(loggedInUser.role);

  const [searchInput, setSearchInput] = useState('');
  const [filteredUsers, setFilteredUsers] = useState(teamsUsers);
  const darkModeStyle = darkMode
    ? { backgroundColor: '#3a506b', color: 'white' }
    : { backgroundColor: '#f0f8ff', color: 'black' };
  useEffect(() => {
    const fetchInitial = async () => {
      const url = ENDPOINTS.USER_PROFILE(displayUserId);
      try {
        const response = await axios.get(url);
        refTeam.current = response.data.teams;
        setTeams(response.data.teams);
        setUserRole(response.data.role);
      } catch (error) {
        toast.error(error);
      }
    };

    fetchInitial();
  }, []);

  useEffect(() => {
    if (usersSelectedTeam === 'Show all') setStateOrganizationData(organizationData);
  }, [organizationData, usersSelectedTeam]);

  useEffect(() => {
    //  eslint-disable-next-line
    leaderboardData.length > 0 && teamsUsers.length === 0 && setTeamsUsers(leaderboardData);
  }, [leaderboardData]);
  // prettier-ignore

  useEffect(() => {
    setInnerWidth(window.innerWidth);
  }, [window.innerWidth]);

  useEffect(() => {
    const checkAbbreviatedView = () => {
      const isAbbrev = window.innerWidth < window.screen.width * 0.75;
      setIsAbbreviatedView(isAbbrev);
    };

    checkAbbreviatedView(); // run on mount
    window.addEventListener('resize', checkAbbreviatedView);

    return () => window.removeEventListener('resize', checkAbbreviatedView);
  }, []);

  const updateOrganizationData = (usersTaks, contUsers) => {
    // prettier-ignore
    const newOrganizationData = usersTaks.reduce((accumulator, item) => {
        accumulator.name = `Totals of ${contUsers}  team members`;
        accumulator.tangibletime += item.tangibletime;
        accumulator.totalintangibletime_hrs += item.totalintangibletime_hrs;
        accumulator.totaltangibletime_hrs += item.totaltangibletime_hrs;
        accumulator.totaltime += item.totaltime;
        accumulator.totaltime_hrs += item.totaltime_hrs;
        accumulator.barprogress += item.barprogress;
        accumulator.intangibletime += item.intangibletime;
        accumulator.barcolor = organizationData.barcolor;
        accumulator.totalweeklycommittedHours += item.weeklycommittedHours;
        accumulator.weeklycommittedHours += item.weeklycommittedHours;
        return accumulator;
      },
      // prettier-ignore
      { name: '', totaltime: 0, barprogress: 0, intangibletime: 0,barcolor: '', tangibletime: 0,
      totalintangibletime_hrs: 0, totaltangibletime_hrs: 0,  totaltime_hrs: 0,
      totalweeklycommittedHours: 0, weeklycommittedHours: 0, memberCount: contUsers, _id: 2},
    );
    setStateOrganizationData(newOrganizationData);
  };
  const renderTeamsList = async team => {
    setIsDisplayAlert(false);
    if (!team || team === 'Show all') {
      setIsLoadingTeams(true);
      setFilteredUserTeamIds([]);
      setStateOrganizationData(organizationData);

      setTimeout(() => {
        setTeamsUsers(leaderboardData);
        setIsLoadingTeams(false);
      }, 1000);
    } else {
      try {
        setIsLoadingTeams(true);
        const response = await axios.get(ENDPOINTS.TEAM_MEMBERS(team._id));
        const idUsers = response.data.map(item => item._id);
        const usersTaks = leaderboardData.filter(item => idUsers.includes(item.personId));
        // eslint-disable-next-line no-unused-expressions
        usersTaks.length === 0
          ? // eslint-disable-next-line no-unused-expressions
            (setIsDisplayAlert(true), setIsLoadingTeams(false), null)
          : // eslint-disable-next-line no-unused-expressions
            (setTeamsUsers(usersTaks),
            setIsLoadingTeams(false),
            setFilteredUserTeamIds(idUsers),
            updateOrganizationData(usersTaks, usersTaks.length));
      } catch (error) {
        toast.error('Error fetching team members');
        setIsLoadingTeams(false);
      }
    }
  };

  const handleToggleButtonClick = () => {
    // prettier-ignore
    if (usersSelectedTeam === 'Show all') {renderTeamsList(null)}
     else if (usersSelectedTeam.length === 0) {
      toast.error(`You have not selected a team or the selected team does not have any members.`);
    } else renderTeamsList(usersSelectedTeam);
  };

  // const handleMouseoverTextUpdate = text => {
  //   setMouseoverTextValue(text);
  // };
  

  useEffect(() => {
    try {
      if (window.screen.width < 540) {
        const scrollWindow = document.getElementById('leaderboard');
        if (scrollWindow) {
          const elem = document.getElementById(`id${userId}`);
          if (elem) {
            const topPos = elem.offsetTop;
            scrollWindow.scrollTo(0, topPos - 100 < 100 ? 0 : topPos - 100);
          }
        }
      }
    } catch (error) {
      throw new Error(error);
    }
  }, [leaderboardData]);

  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const dashboardToggle = item => setIsDashboardOpen(item.personId);
  const dashboardClose = () => setIsDashboardOpen(false);

  const showDashboard = item => {
    getWeeklySummaries(item.personId);
    dispatch(getUserProfile(item.personId)).then(user => {
      const { _id, role, firstName, lastName, profilePic, email } = user;
      const viewingUser = {
        userId: _id,
        role,
        firstName,
        lastName,
        email,
        profilePic: profilePic || '/pfp-default-header.png',
      };
      sessionStorage.setItem('viewingUser', JSON.stringify(viewingUser));
      window.dispatchEvent(new Event('storage'));
      dashboardClose();
    });
  };

  const updateLeaderboardHandler = async () => {
    setIsLoading(true);
    if (isEqual(leaderboardData, teamsUsers)) {
      await getLeaderboardData(userId);
      setTeamsUsers(leaderboardData);
    } else {
      await getLeaderboardData(userId);
      renderTeamsList(usersSelectedTeam);
    }
    setIsLoading(false);
    toast.success('Successfuly updated leaderboard');
  };

  const handleTimeOffModalOpen = request => {
    showTimeOffRequestModal(request);
  };

  // For Monthly and yearly anniversaries
  const [modalOpen, setModalOpen] = useState(false);

  // opening the modal
  const trophyIconToggle = item => {
    if (loggedInUser.role === 'Owner' || loggedInUser.role === 'Administrator') {
      setModalOpen(item.personId);
    }
  };

  // deleting the icon from only that user
  const handleChangingTrophyIcon = async (item, trophyFollowedUp) => {
    setModalOpen(false);
    await postLeaderboardData(item.personId, trophyFollowedUp);
    // Update leaderboard data after posting
    await getLeaderboardData(displayUserId);
  };

  const handleIconContent = durationSinceStarted => {
    if (durationSinceStarted.months >= 5.8 && durationSinceStarted.months <= 6.2) {
      return '6M';
    }
    if (durationSinceStarted.years >= 0.9) {
      return `${Math.round(durationSinceStarted.years)}Y`;
    }
    return 'N/A';
  };

  const getTimeOffStatus = personId => {
    if (!allRequests || !allRequests[personId] || allRequests[personId].length === 0) {
      return { hasTimeOff: false, isCurrentlyOff: false, additionalWeeks: 0 };
    }

    const hasTimeOff = true;
    const sortedRequests = allRequests[personId].sort((a, b) =>
      moment(a.startingDate).diff(moment(b.startingDate)),
    );

    const mostRecentRequest =
      sortedRequests.find(request => moment().isBefore(moment(request.endingDate), 'day')) ||
      sortedRequests[0];

    const startOfWeek = moment().startOf('week');
    const endOfWeek = moment().endOf('week');

    const isCurrentlyOff =
      moment(mostRecentRequest.startingDate).isBefore(endOfWeek) &&
      moment(mostRecentRequest.endingDate).isSameOrAfter(startOfWeek);

    let additionalWeeks = 0;
    if (isCurrentlyOff) {
      additionalWeeks = moment(mostRecentRequest.endingDate).diff(
        moment(moment().startOf('week')),
        'weeks',
      );
    } else if (moment().isBefore(moment(mostRecentRequest.startingDate))) {
      additionalWeeks = moment(mostRecentRequest.startingDate).diff(moment(), 'weeks') + 1;
    }
    return { hasTimeOff, isCurrentlyOff, additionalWeeks };
  };

  const currentTimeOfftoggle = personId => {
    setCurrentTimeOfftooltipOpen(prevState => ({
      ...prevState,
      [personId]: !prevState[personId],
    }));
  };

  const futureTimeOfftoggle = personId => {
    setFutureTimeOfftooltipOpen(prevState => ({
      ...prevState,
      [personId]: !prevState[personId],
    }));
  };

  const timeOffIndicator = personId => {
    if (userOnTimeOff[personId]?.isInTimeOff === true) {
      if (userOnTimeOff[personId]?.weeks > 0) {
        return (
          <>
            <sup style={{ color: 'rgba(128, 128, 128, 0.5)' }} id={`currentTimeOff-${personId}`}>
              {' '}
              +{userOnTimeOff[personId].weeks}
            </sup>
            <Tooltip
              placement="top"
              isOpen={currentTimeOfftooltipOpen[personId]}
              target={`currentTimeOff-${personId}`}
              toggle={() => currentTimeOfftoggle(personId)}
            >
              Number with + indicates additional weeks the user will be on a time off excluding the
              current week.
            </Tooltip>
          </>
        );
      }

      return null;
    }

    if (usersOnFutureTimeOff[personId]?.weeks > 0) {
      return (
        <>
          <sup style={{ color: '#007bff' }} id={`futureTimeOff-${personId}`}>
            {' '}
            {usersOnFutureTimeOff[personId].weeks}
          </sup>
          <Tooltip
            placement="top"
            isOpen={futureTimeOfftooltipOpen[personId]}
            target={`futureTimeOff-${personId}`}
            toggle={() => futureTimeOfftoggle(personId)}
          >
            This number indicates number of weeks from now user has scheduled a time off.
          </Tooltip>
        </>
      );
    }

    return null;
  };

  const teamName = (name, maxLength) =>
    setSelectedTeamName(maxLength > 15 ? `${name.substring(0, 15)}...` : name);

  const dropdownName = (name, maxLength) => {
    if (innerWidth > 457) {
      return maxLength > 50 ? `${name.substring(0, 50)}...` : name;
    }
    return maxLength > 27 ? `${name.substring(0, 27)}...` : name;
  };

  const TeamSelected = team => {
    setTeams(refTeam.current);
    refInput.current = '';
    if (team === 'Show all') {
      setUsersSelectedTeam(team);
      teamName('Show all', 7);
    } else if (team.teamName.length !== undefined) teamName(team.teamName, team.teamName.length);
    setUsersSelectedTeam(team);
  };

  const formatSearchInput = result => {
    return result
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '');
  };

  const handleInputSearchTeams = e => {
    refInput.current = e.target.value;
    // prettier-ignore
    const obj = {_id: 1, teamName: `This team is not found: ${e.target.value}`,}
    const searchTeam = formatSearchInput(e.target.value);
    if (searchTeam === '') setTeams(refTeam.current);
    else {
      // prettier-ignore
      const filteredTeams = refTeam.current.filter(item => formatSearchInput(item.teamName).includes(searchTeam));
      // prettier-ignore
      (() => filteredTeams.length === 0 ? setTeams([obj]) : setTeams(filteredTeams))();
    }
  };

  const toastError = () =>
    toast.error('Please wait for the users to appear in the Leaderboard table.');

  useEffect(() => {
    setFilteredUsers(leaderboardData);
    return () => {
      setSearchInput('');
    };
  }, [leaderboardData]);

  const debouncedFilterUsers = useCallback(
    debounce(query => {
      setFilteredUsers(
        teamsUsers.filter(user => user.name.toLowerCase().includes(query.toLowerCase())),
      );
    }, 1000),
    [teamsUsers],
  );

  const handleSearch = e => {
    setSearchInput(e.target.value);
    debouncedFilterUsers(e.target.value);
  };

  return (
    <div>
      <h3>
        <div className="d-flex align-items-center">
          <span className="mr-2">Leaderboard</span>
          <i
            data-toggle="tooltip"
            data-placement="right"
            title="Click to refresh the leaderboard"
            style={{ fontSize: 24, cursor: 'pointer' }}
            aria-hidden="true"
            className={`fa fa-refresh ${isLoading ? 'animation' : ''}`}
            onClick={updateLeaderboardHandler}
          />
          &nbsp;
          <Suspense fallback={<div>Loading...</div>}>
            <EditableInfoModal
              areaName="LeaderboardOrigin"
              areaTitle="Leaderboard"
              role={loggedInUser.role}
              fontSize={24}
              darkMode={darkMode}
              isPermissionPage
            />
          </Suspense>
        </div>
      </h3>
      {userRole === 'Administrator' ||
        (userRole === 'Owner' && (
          <section className="d-flex flex-row flex-wrap mb-3">
            <UncontrolledDropdown className=" mr-3">
              {/* Display selected team or default text */}
              <DropdownToggle caret>{selectedTeamName} </DropdownToggle>

              {/* prettier-ignore */}
              <DropdownMenu  style={{   width: '27rem'}} className={darkMode ? 'bg-dark' : ''}>

              <div className={`${darkMode ? 'text-white' : ''}`} style={{width: '100%' }}>
                {teams.length === 0 ? (
                  <p className={`${darkMode ? 'text-white' : ''}  text-center`}>
                    Please, create a team to use the filter.
                  </p>
                ) : (
                  <>

                  <div className='align-items-center d-flex flex-column'>
                    <Input
                      onChange={e => handleInputSearchTeams(e)}
                      style={{ width: '90%', marginBottom: '1rem', backgroundColor: darkMode? '#e0e0e0' : 'white' }}
                      placeholder="Search teams"
                      autoFocus
                      value={refInput.current}
                    />
                  </div>

                    <div className='overflow-auto scrollAutoComplete border-bottom border-top border-light-subtle'
                     style={{ height: teams.length > 8? '30rem' : 'auto', width: '100%' }}
                     >
                    <h5 className="text-center">My Teams</h5>

                    {teams.map(team => {
                      return (
                        <div key={team._id}>
                       { team._id !== 1?
                       <DropdownItem key={`dropdown-${team._id}`} className={`${darkMode ? ' dropdown-item-hover' : ''}`}
                        onClick={() => TeamSelected(team)}
                       >
                        <ul
                          className={`${darkMode ? '  text-light' : ''}`}
                        >
                           <li>{dropdownName(team.teamName, team.teamName.length)}</li>
                        </ul>
                        </DropdownItem>
                        :
                        <div className='align-items-center d-flex flex-column'>
                        <Alert color="danger"style={{ width: '90%' }} >
                          {dropdownName(team.teamName, team.teamName.length)}
                         </Alert>
                        </div>
                        }
                        </div>
                      );
                    })}
                    </div>

                    <h5 className="ml-4 text-center">All users</h5>
                    <DropdownItem className={`${darkMode ? ' dropdown-item-hover' : ''}`}
                      onClick={() => TeamSelected('Show all')}>
                    <ul
                      className={`${darkMode ? '  text-light' : ''}`}
                    >
                        <li>Show all</li>
                    </ul>
                    </DropdownItem>
                  </>
                )}
              </div>
            </DropdownMenu>
            </UncontrolledDropdown>

            {teams.length === 0 ? (
              <Link to="/teams">
                <Button color="success" className="fw-bold" boxstyle={boxStyle}>
                  Create Team
                </Button>
              </Link>
            ) : (
              <Button
                color="primary"
                onClick={filteredUsers.length > 0 ? handleToggleButtonClick : toastError}
                disabled={isLoadingTeams}
                boxstyle={boxStyle}
              >
                {isLoadingTeams ? <Spinner animation="border" size="sm" /> : 'My Team'}
              </Button>
            )}
          </section>
        ))}
      {leaderboardData.length !== 0 ? (
        <div>
          {isDisplayAlert && (
            <Alert color="danger">
              This team has no members, please add members to this team by clicking{' '}
              <Link to="/teams">here</Link>.
            </Alert>
          )}

          {!isVisible && (
            <Alert color="warning">
              <div className="d-flex align-items-center">
                Note: You are currently invisible to the team(s) you are on.{' '}
                <Suspense fallback={<div>Loading...</div>}>
                  <EditableInfoModal
                    areaName="LeaderboardInvisibleInfoPoint"
                    areaTitle="Leaderboard settings"
                    role={loggedInUser.role}
                    fontSize={24}
                    darkMode={darkMode}
                    isPermissionPage
                  />
                </Suspense>
              </div>
            </Alert>
          )}
          <div id="leaderboard" className="my-custom-scrollbar table-wrapper-scroll-y">
            <div className="search-container mx-1">
              <input
                className={`form-control col-12 mb-2 ${
                  darkMode ? 'text-light bg-darkmode-liblack' : ''
                }`}
                type="text"
                placeholder="Search users..."
                value={searchInput}
                onChange={handleSearch}
              />
            </div>
            <Table
              className={`leaderboard table-fixed ${
                darkMode ? 'text-light dark-mode bg-yinmn-blue' : ''
              } ${isAbbreviatedView ? 'abbreviated-mode' : ''}`}
            >
              <thead className="responsive-font-size">
                <tr className={darkMode ? 'bg-space-cadet' : ''} style={darkModeStyle}>
                  <th style={darkModeStyle}>
                    <span>{isAbbreviatedView ? 'Stat.' : 'Status'}</span>
                  </th>
                  <th style={darkModeStyle}>
                    <div className="d-flex align-items-center">
                      <span>{isAbbreviatedView ? 'Name' : 'Name'}</span>
                      <Suspense fallback={<div>Loading...</div>}>
                        <EditableInfoModal
                          areaName="Leaderboard"
                          areaTitle="Team Members Navigation"
                          role={loggedInUser.role}
                          fontSize={18}
                          isPermissionPage
                          darkMode={darkMode}
                          className="p-2"
                        />
                      </Suspense>
                    </div>
                  </th>
                  <th style={darkModeStyle}>
                    <span>{isAbbreviatedView ? 'Days Lft.' : 'Days Left'}</span>
                  </th>
                  <th style={darkModeStyle}>
                    <span>{isAbbreviatedView ? 'Time Off' : 'Time Off'}</span>
                  </th>
                  <th style={darkModeStyle}>
                    <span>{isAbbreviatedView ? 'Tan. Time' : 'Tangible Time'}</span>
                  </th>
                  <th style={darkModeStyle}>
                    <span>{isAbbreviatedView ? 'Prog.' : 'Progress'}</span>
                  </th>

                  <th
                    style={
                      darkMode
                        ? { backgroundColor: '#3a506b', color: 'white', textAlign: 'right' }
                        : { backgroundColor: '#f0f8ff', color: 'black', textAlign: 'right' }
                    }
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ textAlign: 'left' }}>
                        <span>{isAbbreviatedView ? 'Tot. Time' : 'Total Time'}</span>
                      </div>
                      {/*    {isOwner && (
                        <MouseoverTextTotalTimeEditButton onUpdate={handleMouseoverTextUpdate} />
                      )} */}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="my-custome-scrollbar responsive-font-size">
                <tr className={darkMode ? 'dark-leaderboard-row' : 'light-leaderboard-row'}>
                  {isAbbreviatedView ? (
                    <td colSpan={2}>
                      <div className="leaderboard-totals-container text-center">
                        <span>{stateOrganizationData.name}</span>
                        {viewZeroHouraMembers(loggedInUser.role) && (
                          <span className="leaderboard-totals-title">
                            0 hrs Totals:{' '}
                            {filteredUsers.filter(user => user.weeklycommittedHours === 0).length}{' '}
                            Members
                          </span>
                        )}
                      </div>
                    </td>
                  ) : (
                    <>
                      <td aria-label="Placeholder" />
                      <td className="leaderboard-totals-container">
                        <span>{stateOrganizationData.name}</span>
                        {viewZeroHouraMembers(loggedInUser.role) && (
                          <span className="leaderboard-totals-title">
                            0 hrs Totals:{' '}
                            {filteredUsers.filter(user => user.weeklycommittedHours === 0).length}{' '}
                            Members
                          </span>
                        )}
                      </td>
                    </>
                  )}

                  <td className="align-middle" aria-label="Description" />
                  <td className="align-middle">
                    <span title="Tangible time">
                      {filteredUsers
                        .reduce((total, user) => total + user.tangibletime, 0)
                        .toFixed(2)}
                    </span>
                  </td>
                  <td className="align-middle" aria-label="Description">
                    <Progress
                      title={`TangibleEffort: ${filteredUsers
                        .reduce((total, user) => total + user.tangibletime, 0)
                        .toFixed(2)} hours`}
                      value={
                        (filteredUsers.reduce((total, user) => total + user.tangibletime, 0) /
                          filteredUsers.reduce(
                            (total, user) => total + user.weeklycommittedHours,
                            0,
                          )) *
                        100
                      }
                      color="primary"
                    />
                  </td>
                  <td className="align-middle">
                    <span title="Tangible + Intangible time = Total time">
                      {filteredUsers
                        .reduce((total, user) => total + parseFloat(user.totaltime), 0)
                        .toFixed(2)}{' '}
                      of{' '}
                      {filteredUsers.reduce((total, user) => total + user.weeklycommittedHours, 0)}
                    </span>
                  </td>
                  <td aria-label="Placeholder" />
                </tr>
                {filteredUsers.map(item => {
                  const { hasTimeOff, isCurrentlyOff, additionalWeeks } = getTimeOffStatus(
                    item.personId,
                  );
                  const startDate = item?.startDate?.split('T')[0];
                  const durationSinceStarted = calculateDurationBetweenDates(todaysDate, startDate);
                  const iconContent = handleIconContent(durationSinceStarted);
                  const showTrophy = showTrophyIcon(todaysDate, startDate);

                  return (
                    <tr
                      key={item.personId}
                      className={darkMode ? 'dark-leaderboard-row' : 'light-leaderboard-row'}
                    >
                      <td className="align-middle">
                        <div>
                          <Suspense fallback={<div>Loading...</div>}>
                            <Modal
                              isOpen={isDashboardOpen === item.personId}
                              toggle={dashboardToggle}
                              className={darkMode ? 'text-light dark-mode' : ''}
                              style={darkMode ? boxStyleDark : {}}
                            >
                              <ModalHeader
                                toggle={dashboardToggle}
                                className={darkMode ? 'bg-space-cadet' : ''}
                              >
                                Jump to personal Dashboard
                              </ModalHeader>
                              <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
                                <p className={darkMode ? 'text-light' : ''}>
                                  Are you sure you wish to view this {item.name} dashboard?
                                </p>
                              </ModalBody>
                              <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
                                <Button variant="primary" onClick={() => showDashboard(item)}>
                                  Ok
                                </Button>{' '}
                                <Button variant="secondary" onClick={dashboardToggle}>
                                  Cancel
                                </Button>
                              </ModalFooter>
                            </Modal>
                          </Suspense>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: hasSummaryIndicatorPermission
                              ? 'space-between'
                              : 'center',
                          }}
                        >
                          {/* <Link to={`/dashboard/${item.personId}`}> */}
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                              dashboardToggle(item);
                            }}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                dashboardToggle(item);
                              }
                            }}
                          >
                            {hasLeaderboardPermissions(item.role) &&
                            showStar(item.tangibletime, item.weeklycommittedHours) ? (
                              <i
                                className="fa fa-star"
                                title={`Weekly Committed: ${item.weeklycommittedHours} hours ${
                                  item.role === 'Core Team' && item.missedHours > 0
                                    ? `\n Additional make-up hours this week: ${item.missedHours}`
                                    : ''
                                } \n Click to view their Dashboard`}
                                style={{
                                  color: assignStarDotColors(
                                    item.tangibletime,
                                    item.weeklycommittedHours + item.missedHours,
                                  ),
                                  fontSize: '20px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              />
                            ) : (
                              <div
                                title={`Weekly Committed: ${item.weeklycommittedHours} hours ${
                                  item.role === 'Core Team' && item.missedHours > 0
                                    ? `\n Additional make-up hours this week: ${item.missedHours}`
                                    : ''
                                } \n Click to view their Dashboard`}
                                style={{
                                  backgroundColor:
                                    item.tangibletime >=
                                    item.weeklycommittedHours + item.missedHours
                                      ? '#32CD32'
                                      : 'red',
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
                              title="Weekly Summary Submitted"
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
                      <td className="align-middle">
                        <Link
                          to={`/userprofile/${item.personId}`}
                          title="View Profile"
                          style={{
                            color:
                              isCurrentlyOff ||
                              ((isAllowedOtherThanOwner || isOwner || item.personId === userId) &&
                                userOnTimeOff[item.personId]?.isInTimeOff === true)
                                ? `${darkMode ? '#9499a4' : 'rgba(128, 128, 128, 0.5)'}` // Gray out the name if on time off
                                : '#007BFF', // Default color
                          }}
                        >
                          {item.name}
                        </Link>
                        {isAllowedOtherThanOwner || isOwner || item.personId === userId
                          ? timeOffIndicator(item.personId)
                          : null}
                        &nbsp;&nbsp;&nbsp;
                        {hasVisibilityIconPermission && !item.isVisible && (
                          <i className="fa fa-eye-slash" title="User is invisible" />
                        )}
                        &nbsp;&nbsp;&nbsp;
                        {hasLeaderboardPermissions(loggedInUser.role) && showTrophy && (
                          <i
                            role="button"
                            tabIndex={0}
                            className="fa fa-trophy"
                            style={{
                              fontSize: '18px',
                              color: item?.trophyFollowedUp === false ? '#FF0800' : '#ffbb00',
                            }}
                            onClick={() => trophyIconToggle(item)}
                            onKeyDown={() => trophyIconToggle(item)}
                          >
                            <p style={{ fontSize: '10px', marginLeft: '1px' }}>
                              <strong>{iconContent}</strong>
                            </p>
                          </i>
                        )}
                        <div>
                          <Suspense fallback={<div>Loading...</div>}>
                            <Modal isOpen={modalOpen === item.personId} toggle={trophyIconToggle}>
                              <ModalHeader toggle={trophyIconToggle}>Followed Up?</ModalHeader>
                              <ModalBody>
                                <p>Are you sure you have followed up this icon?</p>
                              </ModalBody>
                              <ModalFooter>
                                <Button variant="secondary" onClick={trophyIconToggle}>
                                  Cancel
                                </Button>{' '}
                                <Button
                                  color="primary"
                                  onClick={() => {
                                    handleChangingTrophyIcon(item, true);
                                  }}
                                >
                                  Confirm
                                </Button>
                              </ModalFooter>
                            </Modal>
                          </Suspense>
                        </div>
                        {hasTimeOffIndicatorPermission && additionalWeeks > 0 && (
                          <span
                            style={{
                              marginLeft: '20px',
                              color: '#17a2b8',
                              fontSize: '15px',
                              justifyItems: 'center',
                            }}
                          >
                            {isCurrentlyOff ? `+${additionalWeeks}` : additionalWeeks}
                            <i
                              className="fa fa-info-circle"
                              style={{ marginLeft: '5px', cursor: 'pointer' }}
                              data-tip={
                                isCurrentlyOff
                                  ? `${additionalWeeks} additional weeks off`
                                  : `${additionalWeeks} weeks until next time off`
                              }
                            />
                            <ReactTooltip place="top" type="dark" effect="solid" />
                          </span>
                        )}
                      </td>
                      <td className="align-middle">
                        <span title={mouseoverTextValue} id="Days left" style={{ color: 'red' }}>
                          {displayDaysLeft(item.endDate)}
                        </span>
                      </td>
                      <td className="align-middle">
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {hasTimeOff && (
                            <button
                              type="button"
                              onClick={() => {
                                const data = {
                                  requests: [...allRequests[item.personId]],
                                  name: item.name,
                                  leaderboard: true,
                                };
                                handleTimeOffModalOpen(data);
                              }}
                              style={{ width: '35px', height: 'auto' }}
                              aria-label="View Time Off Requests"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="22"
                                height="19"
                                viewBox="0 0 448 512"
                                className="show-time-off-calender-svg"
                              >
                                <path d="M128 0c17.7 0 32 14.3 32 32V64H288V32c0-17.7 14.3-32 32-32s32 14.3 32 32V64h48c26.5 0 48 21.5 48 48v48H0V112C0 85.5 21.5 64 48 64H96V32c0-17.7 14.3-32 32-32zM0 192H448V464c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V192zm64 80v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16zm128 0v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H208c-8.8 0-16 7.2-16 16zm144-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H336zM64 400v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16zm144-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H208zm112 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H336c-8.8 0-16 7.2-16 16z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="align-middle" id={`id${item.personId}`}>
                        <span title="Tangible time">{item.tangibletime}</span>
                      </td>
                      <td className="align-middle" aria-label="Description or purpose of the cell">
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
                          className={
                            item.totalintangibletime_hrs > 0 ? 'leaderboard-totals-title' : null
                          }
                        >
                          {item.totaltime}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </div>
      ) : (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: '200px' }}
        >
          <Spinner color="primary" style={{ width: '3rem', height: '3rem' }} />
        </div>
      )}
    </div>
  );
}

export default LeaderBoard;