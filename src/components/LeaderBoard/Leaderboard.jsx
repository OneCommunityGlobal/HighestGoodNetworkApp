import { useEffect, useState, useRef } from 'react';
import './Leaderboard.css';
import { isEqual } from 'lodash';
import { Link } from 'react-router-dom';
import { Table, Progress, Modal, ModalBody, ModalFooter, ModalHeader, Button } from 'reactstrap';
import Alert from 'reactstrap/lib/Alert';
import {
  hasLeaderboardPermissions,
  assignStarDotColors,
  showStar,
} from 'utils/leaderboardPermissions';
import hasPermission from 'utils/permissions';
import MouseoverTextTotalTimeEditButton from 'components/mouseoverText/MouseoverTextTotalTimeEditButton';
import { toast } from 'react-toastify';
import EditableInfoModal from 'components/UserProfile/EditableModal/EditableInfoModal';
import moment from 'moment-timezone';

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
  } else {
      return null; // or any other appropriate default value
  }
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
  userOnTimeOff,
  userGoingOnTimeOff,
  showTimeOffRequestModal,
}) {
  const userId = displayUserId || loggedInUser.userId;
  const hasSummaryIndicatorPermission = hasPermission('seeSummaryIndicator'); // ??? this permission doesn't exist?
  const hasVisibilityIconPermission = hasPermission('seeVisibilityIcon'); // ??? this permission doesn't exist?
  const isOwner = ['Owner'].includes(loggedInUser.role);
  const currentDate = moment.tz('America/Los_Angeles').startOf('day');

  const [mouseoverTextValue, setMouseoverTextValue] = useState(totalTimeMouseoverText);

  useEffect(() => {
    getMouseoverText();
    setMouseoverTextValue(totalTimeMouseoverText);
  }, [totalTimeMouseoverText]);

  const handleMouseoverTextUpdate = text => {
    setMouseoverTextValue(text);
  };
  useDeepEffect(() => {
    getLeaderboardData(userId);
    getOrgData();
    
  }, [timeEntries]);

  useDeepEffect(() => {
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

  const handleTimeOffModalOpen = request => {
    showTimeOffRequestModal(request);
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
            isPermissionPage
          />
        </div>
      </h3>
      {!isVisible && (
        <Alert color="warning">
          <div className="d-flex align-items-center">
            Note: You are currently invisible to the team(s) you are on.{' '}
            <EditableInfoModal
              areaName="LeaderboardInvisibleInfoPoint"
              areaTitle="Leaderboard settings"
              role={loggedInUser.role}
              fontSize={24}
              isPermissionPage
            />
          </div>
        </Alert>
      )}
      <div id="leaderboard" className="my-custom-scrollbar table-wrapper-scroll-y">
        <Table className="leaderboard table-fixed">
          <thead>
            <tr>
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
          <tbody className="my-custome-scrollbar">
            <tr>
              <td />
              <th scope="row">{organizationData.name}</th>
              <td className="align-middle" />
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
            {leaderBoardData.map(item => (
              <tr key={item.personId}>
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
                <th scope="row" className="align-middle name">
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
                          : undefined,
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
                </th>
                <td className="align-middle">
                  <span
                    title={mouseoverTextValue}
                    id="Days left"
                    
                    style={{color:"red"}}
                  >
                    {displayDaysLeft(item.endDate)}
                  </span>
                </td>
                <td className="align-middle">
                  {(userOnTimeOff || userGoingOnTimeOff) &&
                    (userOnTimeOff[item.personId] || userGoingOnTimeOff[item.personId]) && (
                      <div>
                        <button
                          type="button"
                          onClick={() => {
                            const request = userOnTimeOff[item.personId]
                              ? {
                                  ...userOnTimeOff[item.personId],
                                  onVacation: true,
                                  name: item.name,
                                }
                              : {
                                  ...userGoingOnTimeOff[item.personId],
                                  onVacation: false,
                                  name: item.name,
                                };

                            handleTimeOffModalOpen(request);
                          }}
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
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

export default LeaderBoard;
