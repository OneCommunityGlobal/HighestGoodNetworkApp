import { useEffect, useState, useRef } from 'react';
import './Leaderboard.css';
import { isEqual } from 'lodash';
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
import { calculateDurationBetweenDates, showTrophyIcon } from 'utils/anniversaryPermissions';
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
  postLeaderboardData,
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
  const currentDate = moment.tz('America/Los_Angeles').startOf('day');
  const todaysDate = moment()
    .tz('America/Los_Angeles')
    .endOf('week')
    .format('YYYY-MM-DD');

  useEffect(() => {
    for (let i = 0; i < leaderBoardData.length; i += 1) {
      const startDate = leaderBoardData[i].startDate?.split('T')[0];
      const showTrophy = showTrophyIcon(todaysDate, startDate);
      if (!showTrophy && leaderBoardData[i].trophyFollowedUp) {
        postLeaderboardData(leaderBoardData[i].personId, false);
      }
    }
  }, []);

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
  const individualsWithZeroHours = leaderBoardData.filter(
    individuals => individuals.weeklycommittedHours === 0,
  );

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
    await getLeaderboardData(userId);
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
                    0 hrs Totals: {individualsWithZeroHours.length} Members
                  </span>
                )}
              </th>
              <td className="align-middle" aria-label="Description" />
              <td className="align-middle">
                <span title="Tangible time">{organizationData.tangibletime || ''}</span>
              </td>
              <td className="align-middle" aria-label="Description">
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
            {teamsUsers.map(item => {
              const startDate = item?.startDate?.split('T')[0];
              const durationSinceStarted = calculateDurationBetweenDates(todaysDate, startDate);
              const iconContent = handleIconContent(durationSinceStarted, item);
              const showTrophy = showTrophyIcon(todaysDate, startDate);
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
                            title={`Weekly Committed: ${item.weeklycommittedHours} hours\nClick to view their Dashboard`}
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
                            title={`Weekly Committed: ${item.weeklycommittedHours} hours\nClick to view their Dashboard`}
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
                        color:
                          currentDate.isSameOrAfter(
                            moment(item.timeOffFrom, 'YYYY-MM-DDTHH:mm:ss.SSSZ'),
                          ) &&
                          currentDate.isBefore(moment(item.timeOffTill, 'YYYY-MM-DDTHH:mm:ss.SSSZ'))
                            ? 'rgba(128, 128, 128, 0.5)'
                            : '#007BFF',
                      }}
                    >
                      {item.name}
                      {currentDate.isSameOrAfter(
                        moment(item.timeOffFrom, 'YYYY-MM-DDTHH:mm:ss.SSSZ'),
                      ) &&
                      currentDate.isBefore(moment(item.timeOffTill, 'YYYY-MM-DDTHH:mm:ss.SSSZ')) &&
                      Math.floor(
                        moment(item.timeOffTill, 'YYYY-MM-DDTHH:mm:ss.SSSZ')
                          .subtract(1, 'day')
                          .diff(moment(item.timeOffFrom, 'YYYY-MM-DDTHH:mm:ss.SSSZ'), 'weeks'),
                      ) > 0 ? (
                        <sup>
                          {' '}
                          +
                          {Math.floor(
                            moment(item.timeOffTill, 'YYYY-MM-DDTHH:mm:ss.SSSZ')
                              .subtract(1, 'day')
                              .diff(moment(item.timeOffFrom, 'YYYY-MM-DDTHH:mm:ss.SSSZ'), 'weeks'),
                          )}
                        </sup>
                      ) : null}
                    </Link>
                    &nbsp;&nbsp;&nbsp;
                    {hasVisibilityIconPermission && !item.isVisible && (
                      <i className="fa fa-eye-slash" title="User is invisible" />
                    )}
                    {/* Model for trophy */}
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
                  </th>
                  <td className="align-middle">
                    <span title={mouseoverTextValue} id="Days left" style={{ color: 'red' }}>
                      {displayDaysLeft(item.endDate)}
                    </span>
                  </td>
                  <td className="align-middle">
                    {allRequests && allRequests[item.personId]?.length > 0 && (
                      <div>
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
                      </div>
                    )}
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
