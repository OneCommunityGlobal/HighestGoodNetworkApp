import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Modal } from 'react-bootstrap';
import { boxStyle, boxStyleDark } from 'styles';
import ScheduleExplanationModal from './ScheduleExplanationModal/ScheduleExplanationModal';
import ScheduleReasonModal from './ScheduleReasonModal/ScheduleReasonModal';
import TimeOffRequestsTable from './TimeOffRequestsTable/TimeOffRequestsTable';
import hasPermission from '../../utils/permissions';
import BlueSquaresTable from './BlueSquaresTable/BlueSquaresTable';
import BluequareEmailAssignmentPopUp from './BluequareEmailBBCPopUp';
import './UserProfile.scss';
import './UserProfileEdit/UserProfileEdit.scss';


const BlueSquareLayout = ({
  userProfile,
  handleUserProfile,
  handleBlueSquare,
  canEdit,
  user,
  darkMode,
}) => {
  const dispatch = useDispatch();
  const allRequests = useSelector(state => state.timeOffRequests.requests);
  const canManageTimeOffRequests = dispatch(hasPermission('manageTimeOffRequests'));

  const { privacySettings } = userProfile;
  const [show, setShow] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showEmailBCCModal, setShowEmailBCCModal] = useState(false);
  const hasBlueSquareEmailBCCRolePermission = user.role === 'Owner';

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

  const toggleEmailBCCModal = () => setShowEmailBCCModal(false);

  const checkIfUserCanScheduleTimeOff = () => {
    let scheduledVacation = 0;
    allRequests[userProfile._id]?.forEach(element => {
      scheduledVacation += Number(element.duration);
    });
    const blueSquares = Number(userProfile.infringements?.length) || 0;
    const infringementAndTimeOff = scheduledVacation + blueSquares;
    const hasRolePermission = user.role === 'Administrator' || user.role === 'Owner';
    if (infringementAndTimeOff >= 4 && !hasRolePermission && !canManageTimeOffRequests) {
      return false;
    }
    return true;
  };

  // ===============================================================
  if (canEdit) {
    return (
      <div data-testid="blueSqaure-field" className="user-profile-blue-square-time-off-section">
        <BlueSquaresTable
          userProfile={userProfile}
          canEdit={canEdit}
          isPrivate={privacySettings?.blueSquares}
          handleUserProfile={handleUserProfile}
          handleBlueSquare={handleBlueSquare}
          darkMode={darkMode}
        />
        <TimeOffRequestsTable
          requests={allRequests[userProfile._id]}
          openModal={handleOpen}
          darkMode={darkMode}
        />
        {/* Replaces Schedule Blue Square button when there are more than 5 blue squares or scheduled reasons - by Sucheta */}
        <div className="mt-4 w-100">
          {!checkIfUserCanScheduleTimeOff() ? (
            <>
              <Button
                onClick={openExplanationModal}
                className="w-100 text-success-emphasis"
                size="md"
                style={darkMode ? boxStyleDark : boxStyle}
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
                  style={darkMode ? boxStyleDark : boxStyle}
                >
                  View scheduled Blue Square Reasons
                </Button>
              )}
            </>
          ) : (
            <>
              <Button
                variant="primary"
                onClick={handleOpen}
                className="w-100"
                size="md"
                style={darkMode ? boxStyleDark : boxStyle}
              >
                Schedule Blue Square Reason
              </Button>
              {hasBlueSquareEmailBCCRolePermission && (
                <div className="Blue-Square-Email-BCC-div">
                  <Button
                    variant="primary"
                    onClick={() => setShowEmailBCCModal(true)}
                    className="mt-3 w-100 Blue-Square-Email-BCC-button"
                    size="md"
                    style={darkMode ? boxStyleDark : boxStyle}
                  >
                    Blue Square Email BCCs
                  </Button>
                  <div className="Blue-Square-Email-BCC-tooltip">
                    This designates who gets a copy of the blue square emails. It includes ONLY
                    sending to active team members, so we don’t have to remove people from the list
                    if they are made inactive. It doesn’t include getting copies of the time-off
                    requests, those already go to any Managers for the teams they are on.
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <BluequareEmailAssignmentPopUp
          isOpen={showEmailBCCModal}
          onClose={toggleEmailBCCModal}
          darkMode={darkMode}
        />
        <Modal show={showExplanation} onHide={closeExplanationModal}>
          <ScheduleExplanationModal
            onHide={closeExplanationModal}
            handleClose={closeExplanationModal}
            infringementsNum={userProfile.infringements?.length || 0}
            timeOffRequests={allRequests[userProfile._id]}
            infringements={userProfile.infringements}
            darkMode={darkMode}
          />
        </Modal>
        {show && (
          <Modal show={show} onHide={handleClose} className={darkMode ? 'text-light dark-mode' : ''}>
            <ScheduleReasonModal
              handleClose={handleClose}
              userId={userProfile._id}
              user={user}
              infringements={userProfile.infringements}
              canManageTimeOffRequests={canManageTimeOffRequests}
              checkIfUserCanScheduleTimeOff={checkIfUserCanScheduleTimeOff}
              darkMode={darkMode}
            />
          </Modal>
        )}
      </div>
    );

  }
  return (
    <div data-testid="blueSqaure-field" className="user-profile-blue-square-time-off-section">
      <BlueSquaresTable
        userProfile={userProfile}
        canEdit={canEdit}
        isPrivate={privacySettings?.blueSquares}
        handleUserProfile={handleUserProfile}
        handleBlueSquare={handleBlueSquare}
      />
      <TimeOffRequestsTable requests={allRequests[userProfile._id]} />
    </div>
  );
};

export default BlueSquareLayout;
