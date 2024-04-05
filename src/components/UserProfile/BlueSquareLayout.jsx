import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Modal } from 'react-bootstrap';
import { boxStyle } from 'styles';
import BlueSquare from './BlueSquares';
import ToggleSwitch from './UserProfileEdit/ToggleSwitch';
import ScheduleExplanationModal from './ScheduleExplanationModal/ScheduleExplanationModal';
import ScheduleReasonModal from './ScheduleReasonModal/ScheduleReasonModal';
import hasPermission from '../../utils/permissions';
import './UserProfile.scss';
import './UserProfileEdit/UserProfileEdit.scss';

const BlueSquareLayout = ({ userProfile, handleUserProfile, handleBlueSquare, canEdit, user }) => {
  const dispatch = useDispatch();
  const allRequests = useSelector(state => state.timeOffRequests.requests);
  const canManageTimeOffRequests = dispatch(hasPermission('manageTimeOffRequests'));

  const { privacySettings } = userProfile;
  const [show, setShow] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleOpen = () => {
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
  };

  // This handler is used for Explanation Modal, that open when <a>Click to learn why </a> is clicked
  const openExplanationModal = () => {
    setShowExplanation(true);
  };
  // This handler is used to close Info Modal, -
  const closeExplanationModal = () => {
    setShowExplanation(false);
  };

  const checkIfUserCanScheduleTimeOff = () => {
    let scheduledVacation = 0;
    allRequests[userProfile._id]?.forEach(element => {
      scheduledVacation += Number(element.duration);
    });
    const blueSquares = Number(userProfile.infringements?.length) || 0;
    const infringementAndTimeOff = scheduledVacation + blueSquares;
    const hasRolePermission = user.role === 'Administrator' || user.role === 'Owner';
    if (infringementAndTimeOff >= 5 && !hasRolePermission && !canManageTimeOffRequests) {
      return false;
    }
    return true;
  };

  // ===============================================================
  if (canEdit) {
    return (
      <div data-testid="blueSqaure-field" className="user-profile-blue-square-time-off-section">
        <div className="user-profile-blue-square-section">
          <div className="user-profile-blue-square-div-header">
            <div className="user-profile-blue-square-div-header-title">BLUE SQUARES</div>
            {canEdit ? (
              <ToggleSwitch
                toggleClass="user-profile-blue-square-header-toggle"
                switchType="bluesquares"
                state={privacySettings?.blueSquares}
                handleUserProfile={handleUserProfile}
              />
            ) : null}
          </div>

          <BlueSquare
            blueSquares={userProfile?.infringements}
            handleBlueSquare={handleBlueSquare}
          />
        </div>
        <div className="user-profile-time-off-section">
          <div className="user-profile-time-off-div-header">
            <div className="user-profile-time-off-div-header-title">SCHEDULED TIME OFF</div>
          </div>
          {/* {allRequests[userProfile._id]?.length > 0  */}
          {true ? (
            <>
              <div className="user-profile-time-off-div-table-header">
                <div className="user-profile-time-off-div-table-date">Date</div>
                <div className="user-profile-time-off-div-table-duration">Duration</div>
              </div>
              <div className="user-profile-time-off-div-table-data">
                <div className="user-profile-time-off-div-table-entry">
                  <div className='user-profile-time-off-div-table-entry-icon'>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="22"
                      height="19"
                      viewBox="0 0 448 512"
                    >
                      <path d="M128 0c17.7 0 32 14.3 32 32V64H288V32c0-17.7 14.3-32 32-32s32 14.3 32 32V64h48c26.5 0 48 21.5 48 48v48H0V112C0 85.5 21.5 64 48 64H96V32c0-17.7 14.3-32 32-32zM0 192H448V464c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V192zm64 80v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16zm128 0v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H208c-8.8 0-16 7.2-16 16zm144-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H336zM64 400v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16zm144-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H208zm112 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H336c-8.8 0-16 7.2-16 16z" />
                    </svg>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 512 512"
                    >
                      <path d="M464 256A208 208 0 1 1 48 256a208 208 0 1 1 416 0zM0 256a256 256 0 1 0 512 0A256 256 0 1 0 0 256zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z" />
                    </svg>
                  </div>
                  <div className="user-profile-time-off-div-table-entry-date">11/15/2222</div>
                  <div className="user-profile-time-off-div-table-entry-duration">2</div>
                </div>
              </div>
            </>
          ) : (
            <div className="pl-1">No time off scheduled.</div>
          )}
        </div>

        {/* Replaces Schedule Blue Square button when there are more than 5 blue squares or scheduled reasons - by Sucheta */}
        <div className="mt-4 w-100">
          {!checkIfUserCanScheduleTimeOff() ? (
            <>
              <Button
                onClick={openExplanationModal}
                className="w-100 text-success-emphasis"
                size="md"
                style={boxStyle}
                id="stopSchedulerButton"
              >
                <span>{`Can't Schedule Time Off`}</span>
                <br />
                <span className="mt-0" style={{ fontSize: '.8em' }}>
                  Click to learn why
                </span>
              </Button>
              {allRequests[userProfile._id]?.length > 0 && (
                <Button
                  variant="primary"
                  onClick={handleOpen}
                  className="w-100 mt-3"
                  size="md"
                  style={boxStyle}
                >
                  View scheduled Blue Square Reasons
                </Button>
              )}
            </>
          ) : (
            <Button
              variant="primary"
              onClick={handleOpen}
              className="w-100"
              size="md"
              style={boxStyle}
            >
              Schedule Blue Square Reason
            </Button>
          )}
        </div>
        <Modal show={showExplanation} onHide={closeExplanationModal}>
          <ScheduleExplanationModal
            onHide={closeExplanationModal}
            handleClose={closeExplanationModal}
            infringementsNum={userProfile.infringements?.length || 0}
            timeOffRequests={allRequests[userProfile._id]}
            infringements={userProfile.infringements}
          />
        </Modal>
        {show && (
          <Modal show={show} onHide={handleClose}>
            <ScheduleReasonModal
              handleClose={handleClose}
              userId={userProfile._id}
              user={user}
              infringements={userProfile.infringements}
              canManageTimeOffRequests={canManageTimeOffRequests}
              checkIfUserCanScheduleTimeOff={checkIfUserCanScheduleTimeOff}
            />
          </Modal>
        )}
      </div>
    );
  }
  return (
    <div>
      {!privacySettings?.blueSquares ? (
        <p>Blue Square Info is Private</p>
      ) : (
        <div>
          <p>BLUE SQUARES</p>
          <BlueSquare
            blueSquares={userProfile?.infringements}
            handleBlueSquare={handleBlueSquare}
          />
        </div>
      )}
    </div>
  );
};

export default BlueSquareLayout;
