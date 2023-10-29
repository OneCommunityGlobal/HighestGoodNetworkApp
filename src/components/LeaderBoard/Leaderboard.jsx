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
import { useSelector, useDispatch } from 'react-redux';
import { showTimeOffRequestModal } from '../../actions/timeOffRequestAction';

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

function LeaderBoard({
  getLeaderboardData,
  getOrgData,
  getMouseoverText,
  leaderBoardData,
  loggedInUser,
  organizationData,
  timeEntries,
  isVisible,
  asUser,
  totalTimeMouseoverText,
}) {
  const userId = asUser || loggedInUser.userId;
  const hasSummaryIndicatorPermission = hasPermission('seeSummaryIndicator'); // ??? this permission doesn't exist?
  const hasVisibilityIconPermission = hasPermission('seeVisibilityIcon'); // ??? this permission doesn't exist?
  const isOwner = ['Owner'].includes(loggedInUser.role);
  const userOnTimeOff = useSelector(state => state.timeOffRequests.onTimeOff);
  const userGoingOnTimeOff = useSelector(state => state.timeOffRequests.goingOnTimeOff);
  const [mouseoverTextValue, setMouseoverTextValue] = useState(totalTimeMouseoverText);
  const dispatch = useDispatch();

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

  const [isOpen, setOpen] = useState(false);
  const [modalContent, setContent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const toggle = () => setOpen(isOpenState => !isOpenState);

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
          {/* The color and length of that bar
          changes based on what percentage of the total committed hours for the week have been
          completed: 0-20%: Red, 20-40%: Orange, 40-60% hrs: Green, 60-80%: Blue, 80-100%:Indigo,
          and Equal or More than 100%: Purple. */}
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

  const handleTimeOffModalOpen = request => {
    dispatch(showTimeOffRequestModal(request));
  };

  return (
    <div>
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
              <td className="align-middle"></td>
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
                <th scope="row">
                  <Link to={`/userprofile/${item.personId}`} title="View Profile">
                    {item.name}
                  </Link>
                  &nbsp;&nbsp;&nbsp;
                  {hasVisibilityIconPermission && !item.isVisible && (
                    <i className="fa fa-eye-slash" title="User is invisible" />
                  )}
                </th>
                <td className="align-middle">
                  {(userOnTimeOff[item.personId] || userGoingOnTimeOff[item.personId]) && (
                    <div>
                      <button
                        onClick={() => {
                          const request = userOnTimeOff[item.personId]
                            ? { ...userOnTimeOff[item.personId], onVacation: true, name: item.name }
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
                          className={`show-time-off-calender-svg`}
                        >
                          <path d="M128 0c17.7 0 32 14.3 32 32V64H288V32c0-17.7 14.3-32 32-32s32 14.3 32 32V64h48c26.5 0 48 21.5 48 48v48H0V112C0 85.5 21.5 64 48 64H96V32c0-17.7 14.3-32 32-32zM0 192H448V464c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V192zm64 80v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16zm128 0v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H208c-8.8 0-16 7.2-16 16zm144-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H336zM64 400v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16zm144-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H208zm112 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H336c-8.8 0-16 7.2-16 16z" />
                        </svg>

                        <i className={`show-time-off-icon`}>
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
