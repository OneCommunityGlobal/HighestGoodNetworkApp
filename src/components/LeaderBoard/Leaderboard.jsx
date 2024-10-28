import { useEffect, useState, useRef, useCallback } from 'react';
import './Leaderboard.css';
import { isEqual, debounce } from 'lodash';
import { Link } from 'react-router-dom';
import {
  Table,
  Progress,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Button,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Spinner,
} from 'reactstrap';
import Alert from 'reactstrap/lib/Alert';
import {
  hasLeaderboardPermissions,
  assignStarDotColors,
  showStar,
  viewZeroHouraMembers,
} from 'utils/leaderboardPermissions';
import hasPermission from 'utils/permissions';
import MouseoverTextTotalTimeEditButton from 'components/mouseoverText/MouseoverTextTotalTimeEditButton';
import { toast } from 'react-toastify';
import EditableInfoModal from 'components/UserProfile/EditableModal/EditableInfoModal';
import moment from 'moment-timezone';
import { boxStyle } from 'styles';
import axios from 'axios';
import { getUserProfile } from 'actions/userProfile';
import { useDispatch } from 'react-redux';
import { boxStyleDark } from 'styles';
import '../Header/DarkMode.css';
import { ENDPOINTS } from '../../utils/URL';

function useDeepEffect(effectFunc, deps) {
  const isFirst = useRef(true);
  const prevDeps = useRef(deps);
  useEffect(() => {
    const isSame = prevDeps.current.every((obj, index) => {
      const isItEqual = isEqual(obj, deps[index]);
      return isItEqual;
    });
    if (isFirst.current || !isSame) {
      effectFunc();
    }

    isFirst.current = false;
    prevDeps.current = deps;
  }, deps);
}

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
  getLeaderboardData,
  getOrgData,
  getMouseoverText,
  leaderBoardData,
  loggedInUser,
  organizationData,
  timeEntries,
  isVisible,
  displayUserId,
  totalTimeMouseoverText,
  allRequests,
  showTimeOffRequestModal,
  darkMode,
  getWeeklySummaries,
}) {
  const userId = displayUserId;
  const hasSummaryIndicatorPermission = hasPermission('seeSummaryIndicator'); // ??? this permission doesn't exist?
  const hasVisibilityIconPermission = hasPermission('seeVisibilityIcon'); // ??? this permission doesn't exist?
  const isOwner = ['Owner'].includes(loggedInUser.role);

  const [mouseoverTextValue, setMouseoverTextValue] = useState(totalTimeMouseoverText);
  const dispatch = useDispatch();

  useEffect(() => {
    getMouseoverText();
    setMouseoverTextValue(totalTimeMouseoverText);
  }, [totalTimeMouseoverText]);
  const [teams, setTeams] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedTeamName, setSelectedTeamName] = useState('Select a Team');
  const [textButton, setTextButton] = useState('My Team');
  const [usersSelectedTeam, setUsersSelectedTeam] = useState([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [userRole, setUserRole] = useState();
  const [teamsUsers, setTeamsUsers] = useState(leaderBoardData);
  const [innerWidth, setInnerWidth] = useState();
  const hasTimeOffIndicatorPermission = hasLeaderboardPermissions(loggedInUser.role);
  const [searchInput, setSearchInput] = useState('');
  const [filteredUsers, setFilteredUsers] = useState(teamsUsers);

  useEffect(() => {
    const fetchInitial = async () => {
      const url = ENDPOINTS.USER_PROFILE(displayUserId);
      try {
        const response = await axios.get(url);
        setTeams(response.data.teams);
        setUserRole(response.data.role);
      } catch (error) {
        toast.error(error);
      }
    };

    fetchInitial();
  }, []);

  useEffect(() => {
    if (!isEqual(leaderBoardData, teamsUsers)) {
      if (selectedTeamName === 'Select a Team') {
        setTeamsUsers(leaderBoardData);
      }
    }
  }, [leaderBoardData]);

  useEffect(() => {
    setInnerWidth(window.innerWidth);
  }, [window.innerWidth]);

  const toggleDropdown = () => setDropdownOpen(prevState => !prevState);

  const renderTeamsList = async team => {
    if (!team) {
      setIsLoadingTeams(true);

      setTimeout(() => {
        setIsLoadingTeams(false);
        setTeamsUsers(leaderBoardData);
      }, 1000);
    } else {
      try {
        setIsLoadingTeams(true);
        const response = await axios.get(ENDPOINTS.TEAM_MEMBERS(team._id));
        const idUsers = response.data.map(item => item._id);
        const usersTaks = leaderBoardData.filter(item => idUsers.includes(item.personId));
        setTeamsUsers(usersTaks);
        setIsLoadingTeams(false);
      } catch (error) {
        toast.error('Error fetching team members:', error);
        setIsLoadingTeams(false);
      }
    }
  };

  const handleToggleButtonClick = () => {
    if (textButton === 'View All') {
      setTextButton('My Team');
      renderTeamsList(null);
    } else if (usersSelectedTeam.length === 0) {
      toast.error(`You have not selected a team or the selected team does not have any members.`);
    } else {
      setTextButton('View All');
      renderTeamsList(usersSelectedTeam);
    }
  };

  const handleMouseoverTextUpdate = text => {
    setMouseoverTextValue(text);
  };
  useDeepEffect(() => {
    getLeaderboardData(userId);
    getOrgData();
  }, [timeEntries, userId]);

  useDeepEffect(() => {
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
  }, [leaderBoardData]);

  const [isLoading, setIsLoading] = useState(false);

  // add state hook for the popup the personal's dashboard from leaderboard
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
    if (isEqual(leaderBoardData, teamsUsers)) {
      await getLeaderboardData(userId);
      setTeamsUsers(leaderBoardData);
    } else {
      await getLeaderboardData(userId);
      renderTeamsList(usersSelectedTeam);
      setTextButton('View All');
    }
    setIsLoading(false);
    toast.success('Successfuly updated leaderboard');
  };

  const handleTimeOffModalOpen = request => {
    showTimeOffRequestModal(request);
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

    const isCurrentlyOff = moment().isBetween(
      moment(mostRecentRequest.startingDate),
      moment(mostRecentRequest.endingDate),
      null,
      '[]',
    );

    let additionalWeeks = 0;
    // additional weeks until back
    if (isCurrentlyOff) {
      additionalWeeks = moment(mostRecentRequest.endingDate).diff(
        moment(moment().startOf('week')),
        'weeks',
      );
      // weeks before time off
    } else if (moment().isBefore(moment(mostRecentRequest.startingDate))) {
      additionalWeeks = moment(mostRecentRequest.startingDate).diff(moment(), 'weeks') + 1;
    }
    return { hasTimeOff, isCurrentlyOff, additionalWeeks };
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
    if (team.teamName.length !== undefined) {
      teamName(team.teamName, team.teamName.length);
    }
    setUsersSelectedTeam(team);
    setTextButton('My Team');
  };

  useEffect(() => {
    setFilteredUsers(teamsUsers);
    return () => {
      setSearchInput('');
    };
  }, [teamsUsers]);

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
      {userRole === 'Administrator' || userRole === 'Owner' ? (
        <section className="d-flex flex-row flex-wrap mb-3">
          <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown} className=" mr-3">
            <DropdownToggle caret>
              {selectedTeamName} {/* Display selected team or default text */}
            </DropdownToggle>
            <DropdownMenu>
              {teams.length === 0 ? (
                <DropdownItem
                  onClick={() => toast.warning('Please, create a team to use the filter.')}
                >
                  Please, create a team to use the filter.
                </DropdownItem>
              ) : (
                teams.map(team => (
                  <DropdownItem key={team._id} onClick={() => TeamSelected(team)}>
                    {dropdownName(team.teamName, team.teamName.length)}
                  </DropdownItem>
                ))
              )}
            </DropdownMenu>
          </Dropdown>

          {teams.length === 0 ? (
            <Link to="/teams">
              <Button color="success" className="fw-bold" boxstyle={boxStyle}>
                Create Team
              </Button>
            </Link>
          ) : (
            <Button
              color="primary"
              onClick={handleToggleButtonClick}
              disabled={isLoadingTeams}
              boxstyle={boxStyle}
            >
              {isLoadingTeams ? <Spinner animation="border" size="sm" /> : textButton}
            </Button>
          )}
        </section>
      ) : null}
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
            className="form-control col-12 mb-2"
            type="text"
            placeholder="Search users..."
            value={searchInput}
            onChange={handleSearch}
          />
        </div>
        <Table
          className={`leaderboard table-fixed ${
            darkMode ? 'text-light dark-mode bg-yinmn-blue' : ''
          }`}
        >
          <thead className="responsive-font-size">
            <tr className={darkMode ? 'bg-space-cadet' : ''}>
              <th>Status</th>
              <th>
                <div className="d-flex align-items-center">
                  <span className="mr-2">Name</span>
                  <EditableInfoModal
                    areaName="Leaderboard"
                    areaTitle="Team Members Navigation"
                    role={loggedInUser.role}
                    fontSize={18}
                    isPermissionPage
                    darkMode={darkMode}
                    className="p-2" // Add Bootstrap padding class to the EditableInfoModal
                  />
                </div>
              </th>
              <th>Days Left</th>
              <th>Time Off</th>
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
          <tbody className="my-custome-scrollbar responsive-font-size">
            <tr className={darkMode ? 'bg-yinmn-blue' : ''}>
              <td aria-label="Placeholder" />
              <th scope="row" className="leaderboard-totals-container">
                <span>{organizationData.name}</span>
                {viewZeroHouraMembers(loggedInUser.role) && (
                  <span className="leaderboard-totals-title">
                    0 hrs Totals:{' '}
                    {filteredUsers.filter(user => user.weeklycommittedHours === 0).length} Members
                  </span>
                )}
              </th>
              <td className="align-middle" aria-label="Description" />
              <td className="align-middle">
                <span title="Tangible time">
                  {filteredUsers.reduce((total, user) => total + user.tangibletime, 0).toFixed(2)}
                </span>
              </td>
              <td className="align-middle" aria-label="Description">
                <Progress
                  title={`TangibleEffort: ${filteredUsers
                    .reduce((total, user) => total + user.tangibletime, 0)
                    .toFixed(2)} hours`}
                  value={
                    (filteredUsers.reduce((total, user) => total + user.tangibletime, 0) /
                      filteredUsers.reduce((total, user) => total + user.weeklycommittedHours, 0)) *
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
                  of {filteredUsers.reduce((total, user) => total + user.weeklycommittedHours, 0)}
                </span>
              </td>
            </tr>
            {filteredUsers.map(item => {
              const { hasTimeOff, isCurrentlyOff, additionalWeeks } = getTimeOffStatus(
                item.personId,
              );

              return (
                <tr key={item.personId}>
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
                          <p>Are you sure you wish to view this {item.name} dashboard?</p>
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
                        justifyContent: hasSummaryIndicatorPermission ? 'space-between' : 'center',
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
                                item.tangibletime >= item.weeklycommittedHours + item.missedHours
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
                  <th scope="row" className="align-middle">
                    <Link
                      to={`/userprofile/${item.personId}`}
                      title="View Profile"
                      style={{
                        color: isCurrentlyOff
                          ? 'rgba(128, 128, 128, 0.5)' // Gray out the name if on time off
                          : '#007BFF', // Default color
                      }}
                    >
                      {item.name}
                    </Link>
                    &nbsp;&nbsp;&nbsp;
                    {hasVisibilityIconPermission && !item.isVisible && (
                      <i className="fa fa-eye-slash" title="User is invisible" />
                    )}
                    {hasTimeOffIndicatorPermission && additionalWeeks > 0 && (
                      <span
                        style={{
                          marginLeft: '20px',
                          color: '#17a2b8',
                          fontSize: '15px',
                          justifyItems: 'center',
                        }}
                        title={
                          isCurrentlyOff
                            ? `${additionalWeeks} additional weeks off`
                            : `${additionalWeeks} weeks until next time off`
                        }
                      >
                        {isCurrentlyOff ? `+${additionalWeeks}` : additionalWeeks}
                      </span>
                    )}
                  </th>
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

                          <i className="show-time-off-icon">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 512 512"
                              className="show-time-off-icon-svg"
                            >
                              <path d="M464 256A208 208 0 1 1 48 256a208 208 0 1 1 416 0zM0 256a256 256 0 1 0 512 0A256 256 0 1 0 0 256zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z" />
                            </svg>
                          </i>
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
  );
}

export default LeaderBoard;
