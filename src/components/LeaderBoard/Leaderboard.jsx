import React, { useEffect, useState, useRef, useCallback } from 'react';
import './Leaderboard.css';
import { isEqual, debounce } from 'lodash';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from 'reselect';
import {
  Table,
  Progress,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Button,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Spinner,
  Input,
  Tooltip,
} from 'reactstrap';
import ReactTooltip from 'react-tooltip';
import Alert from 'reactstrap/lib/Alert';
import {
  hasLeaderboardPermissions,
  assignStarDotColors,
  showStar,
  viewZeroHouraMembers,
} from '~/utils/leaderboardPermissions';
import { calculateDurationBetweenDates, showTrophyIcon } from '~/utils/anniversaryPermissions';
import hasPermission from '~/utils/permissions';
import { toast } from 'react-toastify';
import EditableInfoModal from '~/components/UserProfile/EditableModal/EditableInfoModal';
import moment from 'moment-timezone';
import { boxStyle } from '~/styles';
import axios from 'axios';
import { getUserProfile } from '~/actions/userProfile';
import { boxStyleDark } from '../../styles';
import '../Header/DarkMode.css';
import '../UserProfile/TeamsAndProjects/autoComplete.css';
import { ENDPOINTS } from '~/utils/URL';
import { getLeaderboardData, postLeaderboardData, getOrgData } from '../../actions/leaderBoardData';
import { getWeeklySummaries } from '../../actions/weeklySummaries';
import { showTimeOffRequestModal, getAllTimeOffRequests } from '../../actions/timeOffRequestAction';
import { getcolor, getprogress, getProgressValue } from '../../utils/effortColors';

// Create memoized selectors for efficient data transformation
const selectLeaderboardData = state => state.leaderBoardData || [];
const selectUserProfile = state => state.userProfile || {};
const selectOrgData = state => state.orgData || {};
const selectTimeEntries = state => state.timeEntries || {};
const selectAllRequests = state => state.timeOffRequests?.requests;
const selectUserOnTimeOff = state => state.timeOffRequests?.onTimeOff || {};
const selectUsersOnFutureTimeOff = state => state.timeOffRequests?.futureTimeOff || {};

// Transform leaderboard data with memoization
const transformedLeaderboardSelector = createSelector(
  [selectLeaderboardData, selectUserProfile],
  (leaderBoardData, userProfile) => {
    if (!leaderBoardData.length) return [];

    // Filter data based on role permissions
    let filteredData = [...leaderBoardData];
    if (
      userProfile.role !== 'Administrator' &&
      userProfile.role !== 'Owner' &&
      userProfile.role !== 'Core Team'
    ) {
      filteredData = filteredData.filter(
        element => element.weeklycommittedHours > 0 || userProfile._id === element.personId,
      );
    }

    // Find max total for percentage calculations
    const maxTotal = Math.max(...filteredData.map(item => item.totaltime_hrs || 0), 10);

    // Transform each element with calculations
    return filteredData.map(element => ({
      ...element,
      didMeetWeeklyCommitment: element.totaltangibletime_hrs >= element.weeklycommittedHours,
      weeklycommitted: Math.round(element.weeklycommittedHours * 100) / 100,
      tangibletime: Math.round(element.totaltangibletime_hrs * 100) / 100,
      intangibletime: Math.round(element.totalintangibletime_hrs * 100) / 100,
      tangibletimewidth: Math.round((element.totaltangibletime_hrs * 100) / maxTotal),
      intangibletimewidth: Math.round((element.totalintangibletime_hrs * 100) / maxTotal),
      barcolor: getcolor(element.totaltangibletime_hrs),
      barprogress: getProgressValue(element.totaltangibletime_hrs, 40),
      totaltime: Math.round(element.totaltime_hrs * 100) / 100,
    }));
  },
);

// Transform organization data with memoization
const transformedOrgDataSelector = createSelector([selectOrgData], orgData => {
  if (!orgData) return {};

  const transformedData = { ...orgData };

  transformedData.name = `HGN Totals: ${orgData.memberCount} Members`;
  transformedData.tangibletime = Math.round(orgData.totaltangibletime_hrs * 100) / 100;
  transformedData.totaltime = Math.round(orgData.totaltime_hrs * 100) / 100;
  transformedData.intangibletime = Math.round(orgData.totalintangibletime_hrs * 100) / 100;
  transformedData.weeklycommittedHours = Math.round(orgData.totalweeklycommittedHours * 100) / 100;

  const tenPTotalOrgTime = orgData.weeklycommittedHours * 0.1;
  const orgTangibleColorTime = orgData.totaltime < tenPTotalOrgTime * 2 ? 0 : 5;

  transformedData.barcolor = getcolor(orgTangibleColorTime);
  transformedData.barprogress = getprogress(orgTangibleColorTime);

  return transformedData;
});

// Helper function for days left calculation
function displayDaysLeft(lastDay) {
  if (lastDay) {
    const today = new Date();
    const endDate = new Date(lastDay);
    const differenceInTime = endDate.getTime() - today.getTime();
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
    return -differenceInDays;
  }
  return null;
}

// Custom hook for deep comparison to avoid unnecessary API calls
function useDeepCompareEffect(callback, dependencies) {
  const previousDeps = useRef(dependencies);

  useEffect(() => {
    // Only run effect if dependencies have actually changed
    const isSame = dependencies.every((dep, index) => isEqual(dep, previousDeps.current[index]));

    if (!isSame) {
      callback();
      previousDeps.current = dependencies;
    }
  }, dependencies);
}

function LeaderBoard({ displayUserId, darkMode, isNotAllowedToEdit, setFilteredUserTeamIds }) {
  const dispatch = useDispatch();

  // Use memoized selectors for transformed data
  const leaderBoardData = useSelector(transformedLeaderboardSelector);
  const loggedInUser = useSelector(state => state.auth.user);
  const organizationData = useSelector(transformedOrgDataSelector);
  const timeEntries = useSelector(selectTimeEntries);
  const allRequests = useSelector(selectAllRequests);
  const userOnTimeOff = useSelector(selectUserOnTimeOff);
  const usersOnFutureTimeOff = useSelector(selectUsersOnFutureTimeOff);
  const isVisible = useSelector(state => state.userProfile?.isVisible);

  // Cache control
  const lastFetchRef = useRef({});
  const cacheTimeout = 60000; // 1 minute cache

  // Check if we need to fetch data based on cache
  const shouldFetchData = useCallback(
    key => {
      const now = Date.now();
      const lastFetch = lastFetchRef.current[key];
      return !lastFetch || now - lastFetch > cacheTimeout;
    },
    [cacheTimeout],
  );

  // Date constants for calculations
  const todaysDate = moment()
    .tz('America/Los_Angeles')
    .endOf('week')
    .format('YYYY-MM-DD');

  // Permission checks
  const hasSummaryIndicatorPermission = hasPermission('seeSummaryIndicator');
  const hasVisibilityIconPermission = hasPermission('seeVisibilityIcon');
  const hasTimeOffIndicatorPermission = hasLeaderboardPermissions(loggedInUser.role);

  const isOwner = ['Owner'].includes(loggedInUser.role);
  const allowedRoles = ['Administrator', 'Manager', 'Mentor', 'Core Team', 'Assistant Manager'];
  const isAllowedOtherThanOwner = allowedRoles.includes(loggedInUser.role);

  // Component state
  const [currentTimeOfftooltipOpen, setCurrentTimeOfftooltipOpen] = useState({});
  const [futureTimeOfftooltipOpen, setFutureTimeOfftooltipOpen] = useState({});
  const [mouseoverTextValue, setMouseoverTextValue] = useState('');
  const [teams, setTeams] = useState([]);
  const [selectedTeamName, setSelectedTeamName] = useState('Show all');
  const [usersSelectedTeam, setUsersSelectedTeam] = useState('Show all');
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [userRole, setUserRole] = useState();
  const [teamsUsers, setTeamsUsers] = useState([]);
  const [innerWidth, setInnerWidth] = useState(window.innerWidth);
  const [isAbbreviatedView, setIsAbbreviatedView] = useState(false);
  const [isDisplayAlert, setIsDisplayAlert] = useState(false);
  const [stateOrganizationData, setStateOrganizationData] = useState(organizationData);
  const [isLoading, setIsLoading] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Refs for caching and data persistence
  const refTeam = useRef([]);
  const refInput = useRef('');
  const dataFetchedRef = useRef(false);

  // Style for dark mode
  const darkModeStyle = darkMode
    ? { backgroundColor: '#3a506b', color: 'white' }
    : { backgroundColor: '#f0f8ff', color: 'black' };

  // Load initial data with cache awareness
  useEffect(() => {
    if (dataFetchedRef.current) return;

    const fetchInitialData = async () => {
      try {
        // Only fetch if cache is expired
        if (shouldFetchData('leaderboard')) {
          await dispatch(getLeaderboardData(displayUserId));
          await dispatch(getOrgData());
          lastFetchRef.current.leaderboard = Date.now();
        }

        // Get user profile data - also with cache
        if (shouldFetchData(`profile_${displayUserId}`)) {
          const url = ENDPOINTS.USER_PROFILE(displayUserId);
          const response = await axios.get(url);
          refTeam.current = response.data.teams;
          setTeams(response.data.teams);
          setUserRole(response.data.role);
          lastFetchRef.current[`profile_${displayUserId}`] = Date.now();
        }

        dataFetchedRef.current = true;
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();
  }, [dispatch, displayUserId, shouldFetchData]);

  // Update trophy status when leaderboard data changes
  useEffect(() => {
    const updateTrophyStatus = async () => {
      for (let i = 0; i < leaderBoardData.length; i += 1) {
        const startDate = leaderBoardData[i].startDate?.split('T')[0];
        const showTrophy = showTrophyIcon(todaysDate, startDate);
        if (!showTrophy && leaderBoardData[i].trophyFollowedUp) {
          await dispatch(postLeaderboardData(leaderBoardData[i].personId, false));
        }
      }
    };

    if (leaderBoardData.length > 0) {
      updateTrophyStatus();
    }
  }, [dispatch, leaderBoardData, todaysDate]);

  // Update organization data when it changes
  useEffect(() => {
    if (usersSelectedTeam === 'Show all') {
      setStateOrganizationData(organizationData);
    }
  }, [organizationData, usersSelectedTeam]);

  // Update teamsUsers when leaderboardData changes
  useEffect(() => {
    if (leaderBoardData.length > 0 && teamsUsers.length === 0) {
      setTeamsUsers(leaderBoardData);
      setFilteredUsers(leaderBoardData);
    }
  }, [leaderBoardData, teamsUsers.length]);

  // Handle window resize for responsive layout
  useEffect(() => {
    const handleResize = () => {
      setInnerWidth(window.innerWidth);
      setIsAbbreviatedView(window.innerWidth < window.screen.width * 0.75);
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Memoized function to fetch leaderboard data with cache
  const fetchLeaderboardData = useCallback(async () => {
    if (shouldFetchData('leaderboard')) {
      await dispatch(getLeaderboardData(displayUserId));
      await dispatch(getOrgData());
      lastFetchRef.current.leaderboard = Date.now();
    }
  }, [dispatch, displayUserId, shouldFetchData]);

  // Use deep comparison to avoid unnecessary fetches
  useDeepCompareEffect(() => {
    fetchLeaderboardData();
  }, [timeEntries, displayUserId, fetchLeaderboardData]);

  // Scroll to user's position in mobile view
  useDeepCompareEffect(() => {
    try {
      if (window.screen.width < 540) {
        const scrollWindow = document.getElementById('leaderboard');
        if (scrollWindow) {
          const elem = document.getElementById(`id${displayUserId}`);
          if (elem) {
            const topPos = elem.offsetTop;
            scrollWindow.scrollTo(0, topPos - 100 < 100 ? 0 : topPos - 100);
          }
        }
      }
    } catch (error) {
      console.error('Error scrolling to user position:', error);
    }
  }, [leaderBoardData, displayUserId]);

  // Reset search when leaderBoardData changes
  useEffect(() => {
    setFilteredUsers(leaderBoardData);
    return () => {
      setSearchInput('');
    };
  }, [leaderBoardData]);

  // Memoized function for team organization data
  const updateOrganizationData = useCallback(
    (usersTaks, contUsers) => {
      const newOrganizationData = usersTaks.reduce(
        (accumulator, item) => {
          accumulator.name = `Totals of ${contUsers} team members`;
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
        {
          name: '',
          totaltime: 0,
          barprogress: 0,
          intangibletime: 0,
          barcolor: '',
          tangibletime: 0,
          totalintangibletime_hrs: 0,
          totaltangibletime_hrs: 0,
          totaltime_hrs: 0,
          totalweeklycommittedHours: 0,
          weeklycommittedHours: 0,
          memberCount: contUsers,
          _id: 2,
        },
      );
      setStateOrganizationData(newOrganizationData);
    },
    [organizationData.barcolor],
  );

  // Memoized function to render teams list
  const renderTeamsList = useCallback(
    async team => {
      setIsDisplayAlert(false);

      if (!team || team === 'Show all') {
        setIsLoadingTeams(true);
        setFilteredUserTeamIds([]);
        setStateOrganizationData(organizationData);

        setTimeout(() => {
          setTeamsUsers(leaderBoardData);
          setFilteredUsers(leaderBoardData);
          setIsLoadingTeams(false);
        }, 500);
      } else {
        try {
          setIsLoadingTeams(true);
          const response = await axios.get(ENDPOINTS.TEAM_MEMBERS(team._id));
          const idUsers = response.data.map(item => item._id);
          const usersTaks = leaderBoardData.filter(item => idUsers.includes(item.personId));

          if (usersTaks.length === 0) {
            setIsDisplayAlert(true);
            setIsLoadingTeams(false);
          } else {
            setTeamsUsers(usersTaks);
            setFilteredUsers(usersTaks);
            setIsLoadingTeams(false);
            setFilteredUserTeamIds(idUsers);
            updateOrganizationData(usersTaks, usersTaks.length);
          }
        } catch (error) {
          toast.error('Error fetching team members');
          setIsLoadingTeams(false);
        }
      }
    },
    [leaderBoardData, organizationData, setFilteredUserTeamIds, updateOrganizationData],
  );

  // Handle team toggle button click
  const handleToggleButtonClick = useCallback(() => {
    if (usersSelectedTeam === 'Show all') {
      renderTeamsList(null);
    } else if (usersSelectedTeam.length === 0) {
      toast.error(`You have not selected a team or the selected team does not have any members.`);
    } else {
      renderTeamsList(usersSelectedTeam);
    }
  }, [renderTeamsList, usersSelectedTeam]);

  // Update leaderboard - with debounce and cache
  const updateLeaderboardHandler = useCallback(async () => {
    setIsLoading(true);

    try {
      // Only update if cache expired
      if (shouldFetchData('leaderboard')) {
        await dispatch(getAllTimeOffRequests());
        await dispatch(getLeaderboardData(displayUserId));
        await dispatch(getOrgData());
        lastFetchRef.current.leaderboard = Date.now();

        // Handle view updates
        if (!isEqual(leaderBoardData, teamsUsers)) {
          await renderTeamsList(usersSelectedTeam);
        } else {
          setTeamsUsers(leaderBoardData);
          setFilteredUsers(leaderBoardData);
        }

        toast.success('Successfully updated leaderboard');
      } else {
        toast.info('Data is already up to date');
      }
    } catch (error) {
      toast.error('Failed to update leaderboard');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [
    dispatch,
    displayUserId,
    leaderBoardData,
    renderTeamsList,
    shouldFetchData,
    teamsUsers,
    usersSelectedTeam,
  ]);

  // Dashboard modal controls
  const dashboardToggle = item => setIsDashboardOpen(item.personId);
  const dashboardClose = () => setIsDashboardOpen(false);
  const trophyIconToggle = item => {
    if (loggedInUser.role === 'Owner' || loggedInUser.role === 'Administrator') {
      setModalOpen(item.personId);
    }
  };

  // Show dashboard for a specific user
  const showDashboard = useCallback(
    item => {
      dispatch(getWeeklySummaries(item.personId));
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
    },
    [dispatch],
  );

  // Handle trophy icon update
  const handleChangingTrophyIcon = useCallback(
    async (item, trophyFollowedUp) => {
      setModalOpen(false);
      await dispatch(postLeaderboardData(item.personId, trophyFollowedUp));

      // Update leaderboard data after posting
      if (shouldFetchData('leaderboard')) {
        await dispatch(getLeaderboardData(displayUserId));
        lastFetchRef.current.leaderboard = Date.now();
      }
    },
    [dispatch, displayUserId, shouldFetchData],
  );

  // Generate icon content for trophy
  const handleIconContent = useCallback(durationSinceStarted => {
    if (durationSinceStarted.months >= 5.8 && durationSinceStarted.months <= 6.2) {
      return '6M';
    }
    if (durationSinceStarted.years >= 0.9) {
      return `${Math.round(durationSinceStarted.years)}Y`;
    }
    return 'N/A';
  }, []);

  // Get time off status for a user
  const getTimeOffStatus = useCallback(
    personId => {
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
    },
    [allRequests],
  );

  // Tooltip controls
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

  // Time off indicator display
  const timeOffIndicator = useCallback(
    personId => {
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
                Number with + indicates additional weeks the user will be on a time off excluding
                the current week.
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
    },
    [currentTimeOfftooltipOpen, futureTimeOfftooltipOpen, userOnTimeOff, usersOnFutureTimeOff],
  );

  // Format team name for dropdown
  const teamName = useCallback(
    (name, maxLength) => setSelectedTeamName(maxLength > 15 ? `${name.substring(0, 15)}...` : name),
    [],
  );

  // Format dropdown name based on width
  const dropdownName = useCallback(
    (name, maxLength) => {
      if (innerWidth > 457) {
        return maxLength > 50 ? `${name.substring(0, 50)}...` : name;
      }
      return maxLength > 27 ? `${name.substring(0, 27)}...` : name;
    },
    [innerWidth],
  );

  // Handle team selection
  const TeamSelected = useCallback(
    team => {
      setTeams(refTeam.current);
      refInput.current = '';
      if (team === 'Show all') {
        setUsersSelectedTeam(team);
        teamName('Show all', 7);
      } else if (team.teamName?.length !== undefined) {
        teamName(team.teamName, team.teamName.length);
      }
      setUsersSelectedTeam(team);
    },
    [teamName],
  );

  // Format search input
  const formatSearchInput = result => {
    return result
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '');
  };

  // Handle search input for teams
  const handleInputSearchTeams = e => {
    refInput.current = e.target.value;
    const obj = { _id: 1, teamName: `This team is not found: ${e.target.value}` };
    const searchTeam = formatSearchInput(e.target.value);

    if (searchTeam === '') {
      setTeams(refTeam.current);
    } else {
      const filteredTeams = refTeam.current.filter(item =>
        formatSearchInput(item.teamName).includes(searchTeam),
      );
      setTeams(filteredTeams.length === 0 ? [obj] : filteredTeams);
    }
  };

  // Debounced function for user filtering
  const debouncedFilterUsers = useCallback(
    debounce(query => {
      setFilteredUsers(
        teamsUsers.filter(user => user.name.toLowerCase().includes(query.toLowerCase())),
      );
    }, 300),
    [teamsUsers],
  );

  // Handle user search input change
  const handleSearch = e => {
    setSearchInput(e.target.value);
    debouncedFilterUsers(e.target.value);
  };

  // Error handling for team button
  const toastError = () =>
    toast.error('Please wait for the users to appear in the Leaderboard table.');

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
          <EditableInfoModal
            areaName="LeaderboardOrigin"
            areaTitle="Leaderboard"
            role={loggedInUser.role}
            fontSize={24}
            darkMode={darkMode}
            isPermissionPage
          />
        </div>
      </h3>

      {(userRole === 'Administrator' || userRole === 'Owner') && (
        <section className="d-flex flex-row flex-wrap mb-3">
          <UncontrolledDropdown className="mr-3">
            <DropdownToggle caret>{selectedTeamName}</DropdownToggle>
            <DropdownMenu style={{ width: '27rem' }} className={darkMode ? 'bg-dark' : ''}>
              <div className={`${darkMode ? 'text-white' : ''}`} style={{ width: '100%' }}>
                {teams.length === 0 ? (
                  <p className={`${darkMode ? 'text-white' : ''}  text-center`}>
                    Please, create a team to use the filter.
                  </p>
                ) : (
                  <>
                    <div className="align-items-center d-flex flex-column">
                      <Input
                        onChange={e => handleInputSearchTeams(e)}
                        style={{
                          width: '90%',
                          marginBottom: '1rem',
                          backgroundColor: darkMode ? '#e0e0e0' : 'white',
                        }}
                        placeholder="Search teams"
                        value={refInput.current}
                      />
                    </div>

                    <div
                      className="overflow-auto scrollAutoComplete border-bottom border-top border-light-subtle"
                      style={{ height: teams.length > 8 ? '30rem' : 'auto', width: '100%' }}
                    >
                      <h5 className="text-center">My Teams</h5>

                      {teams.map(team => (
                        <div key={team._id}>
                          {team._id !== 1 ? (
                            <DropdownItem
                              key={`dropdown-${team._id}`}
                              className={`${darkMode ? ' dropdown-item-hover' : ''}`}
                              onClick={() => TeamSelected(team)}
                            >
                              <ul className={`${darkMode ? 'text-light' : ''}`}>
                                <li>{dropdownName(team.teamName, team.teamName.length)}</li>
                              </ul>
                            </DropdownItem>
                          ) : (
                            <div className="align-items-center d-flex flex-column">
                              <Alert color="danger" style={{ width: '90%' }}>
                                {dropdownName(team.teamName, team.teamName.length)}
                              </Alert>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <h5 className="ml-4 text-center">All users</h5>
                    <DropdownItem
                      className={`${darkMode ? ' dropdown-item-hover' : ''}`}
                      onClick={() => TeamSelected('Show all')}
                    >
                      <ul className={`${darkMode ? 'text-light' : ''}`}>
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
      )}

      {leaderBoardData.length !== 0 ? (
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
                <EditableInfoModal
                  areaName="LeaderboardInvisibleInfoPoint"
                  areaTitle="Leaderboard settings"
                  role={loggedInUser.role}
                  fontSize={24}
                  darkMode={darkMode}
                  isPermissionPage
                />
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
              data-testid="dark-mode-table"
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
                      <EditableInfoModal
                        areaName="Leaderboard"
                        areaTitle="Team Members Navigation"
                        role={loggedInUser.role}
                        fontSize={18}
                        isPermissionPage
                        darkMode={darkMode}
                        className="p-2"
                      />
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
                      {filteredUsers
                        .reduce((total, user) => total + (user.weeklycommittedHours || 0), 0)
                        .toFixed(2)}
                    </span>
                  </td>
                  <td aria-label="Placeholder" />
                </tr>

                {/* User rows */}
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
                      </td>
                      <td className="align-middle">
                        <Link
                          to={`/userprofile/${item.personId}`}
                          title="View Profile"
                          style={{
                            color:
                              isCurrentlyOff ||
                              ((isAllowedOtherThanOwner ||
                                isOwner ||
                                item.personId === displayUserId) &&
                                userOnTimeOff[item.personId]?.isInTimeOff === true)
                                ? `${darkMode ? '#9499a4' : 'rgba(128, 128, 128, 0.5)'}` // Gray out the name if on time off
                                : '#007BFF', // Default color
                          }}
                        >
                          {item.name}
                        </Link>
                        {isAllowedOtherThanOwner || isOwner || item.personId === displayUserId
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
                                dispatch(showTimeOffRequestModal(data));
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
