/* eslint-disable no-shadow */
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import hasPermission from 'utils/permissions';
import './Warnings.css';
import WarningIcons from './WarningIcons';
// import WarningsModal from './WarningsModal';
import WarningModal from './modals/WarningModal';

function WarningItem({
  warningText,
  handlePostWarningDetails,
  warnings,
  username,
  handleDeleteWarning,
  submitWarning,
  userRole,
}) {
  const dispatch = useDispatch();

  const rolesAllowedToTracking = ['Administrator', 'Owner'];

  const canIssueTrackingWarnings =
    rolesAllowedToTracking.includes(userRole) || dispatch(hasPermission('issueTrackingWarnings'));
  const canIssueBlueSquare =
    rolesAllowedToTracking.includes(userRole) || dispatch(hasPermission('issueBlueSquare'));
  const canDeleteWarning =
    rolesAllowedToTracking.includes(userRole) || dispatch(hasPermission('deleteWarning'));

  const [toggleModal, setToggleModal] = useState(false);
  const [warning, setWarning] = useState(null);
  const [deleteWarning, setDeleteWarning] = useState(false);
  const [warningId, setWarningId] = useState(null);

  const handleIssueWarning = warningDetails => {
    submitWarning({ ...warningDetails });
  };
  const handleModalTriggered = ({ id, deleteWarning, warningDetails }) => {
    if (canIssueTrackingWarnings || canIssueBlueSquare) {
      setDeleteWarning(deleteWarning);
      setWarning({ ...warningDetails, username });
      setWarningId(id);
      setToggleModal(prev => !prev);
    }
  };

  const deleteWarningTriggered = () => {
    handleDeleteWarning(warningId);
  };

  return (
    <div className="warning-item-container">
      {warning && (
        <WarningModal
          visible={toggleModal}
          setToggleModal={setToggleModal}
          deleteWarning={deleteWarning}
          deleteWarningTriggered={deleteWarningTriggered}
          warning={warning}
          numberOfWarnings={warnings.length}
          handleIssueWarning={handleIssueWarning}
          canIssueTrackingWarnings={canIssueTrackingWarnings}
          canIssueBlueSquare={canIssueBlueSquare}
          canDeleteWarning={canDeleteWarning}
        />
      )}

      <div className="warning-wrapper">
        <WarningIcons
          warnings={warnings}
          warningText={warningText}
          handleWarningIconClicked={handlePostWarningDetails}
          handleModalTriggered={handleModalTriggered}
          numberOfWarnings={warnings.length}
        />
        <p className="warning-text"> {warningText}</p>
      </div>
    </div>
  );
}

export default WarningItem;
