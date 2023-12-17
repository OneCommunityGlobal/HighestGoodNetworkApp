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
  const currentDateInLosAngeles = moment
    .tz('America/Los_Angeles')
    .startOf('day')
    .toISOString();

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
                  <Link
                    to={`/userprofile/${item.personId}`}
                    title="View Profile"
                    style={{
                      color:
                        currentDateInLosAngeles >= item.timeOffFrom &&
                        currentDateInLosAngeles < item.timeOffTill
                          ? 'rgba(128, 128, 128, 0.5)'
                          : undefined,
                    }}
                  >
                    {item.name}
                  </Link>
                  &nbsp;&nbsp;&nbsp;
                  {hasVisibilityIconPermission && !item.isVisible && (
                    <i className="fa fa-eye-slash" title="User is invisible" />
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
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

export default LeaderBoard;
