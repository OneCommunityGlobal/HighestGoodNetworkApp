import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import BlueSquare from './BlueSquares';
import ToggleSwitch from './UserProfileEdit/ToggleSwitch';
import './UserProfile.scss';
import { Button } from 'react-bootstrap';
import ScheduleExplanationModal from './ScheduleExplanationModal/ScheduleExplanationModal';
import ScheduleReasonModal from './ScheduleReasonModal/ScheduleReasonModal';
import { useState } from 'react';
import hasPermission from '../../utils/permissions';
import { Modal } from 'react-bootstrap';
import { boxStyle } from 'styles';
import './UserProfileEdit/UserProfileEdit.scss';

const BlueSquareLayout = props => {
  const dispatch = useDispatch();
  const allRequests = useSelector(state => state.timeOffRequests.requests);
  const canManageTimeOffRequests = dispatch(hasPermission('manageTimeOffRequests'));

  const { userProfile, handleUserProfile, handleBlueSquare, canEdit, user } = props;
  const { privacySettings } = userProfile;
  const [show, setShow] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const checkIfUserCanScheduleTimeOff = () => {
    let scheduledVacation = 0;
    allRequests[userProfile._id]?.forEach(element => {
      scheduledVacation = scheduledVacation + Number(element.duration);
    });
    const blueSquares = Number(userProfile.infringements?.length) || 0;

    const infringementAndTimeOff = scheduledVacation + blueSquares;
    const hasRolePermission = user.role === 'Administrator' || user.role === 'Owner';

    if (infringementAndTimeOff >= 5 && !hasRolePermission && !canManageTimeOffRequests) {
      return false;
    }
    return true;
  };

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

  if (canEdit) {
    return (
      <div data-testid="blueSqaure-field">
        <div className="blueSquare-toggle">
          <div style={{ display: 'inline-block' }}>BLUE SQUARES</div>
          {canEdit ? (
            <ToggleSwitch
              style={{ display: 'inline-block' }}
              switchType="bluesquares"
              state={privacySettings?.blueSquares}
              handleUserProfile={handleUserProfile}
            />
          ) : null}
        </div>
        <BlueSquare blueSquares={userProfile?.infringements} handleBlueSquare={handleBlueSquare} />
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
                <span>Can't Schedule Time Off</span>
                <br />
                <span className="mt-0" style={{ fontSize: '.8em' }}>
                  Click to learn why
                </span>
              </Button>
              {allRequests[userProfile._id]?.length > 0 &&<Button
                variant="primary"
                onClick={handleOpen}
                className="w-100 mt-3"
                size="md"
                style={boxStyle}
              >
                View scheduled Blue Square Reasons
              </Button>}
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
