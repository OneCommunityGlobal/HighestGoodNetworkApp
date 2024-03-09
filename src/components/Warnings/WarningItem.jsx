/* eslint-disable no-shadow */
import { useState } from 'react';

import './Warnings.css';
import WarningIcons from './WarningIcons';
import WarningsModal from './WarningsModal';
import WarningModal from './modals/WarningModal';

function WarningItem({
  warningText,
  handlePostWarningDetails,
  warnings,
  username,
  handleDeleteWarning,
  submitWarning,
}) {
  const [toggleModal, setToggleModal] = useState(false);
  const [warning, setWarning] = useState(null);
  const [deleteWarning, setDeleteWarning] = useState(false);
  const [warningId, setWarningId] = useState(null);

  const handleIssueWarning = warningDetails => {
    submitWarning({ ...warningDetails });
  };
  const handleModalTriggered = ({ id, deleteWarning, warningDetails }) => {
    setDeleteWarning(deleteWarning);
    setWarning({ ...warningDetails, username });
    setWarningId(id);
    setToggleModal(prev => !prev);
  };
  const deleteWarningTriggered = () => {
    handleDeleteWarning(warningId);
  };

  return (
    <div className="warning-item-container">
      {/* <Button>+/-</Button> */}
      {warning && (
        <WarningModal
          visible={toggleModal}
          setToggleModal={setToggleModal}
          deleteWarning={deleteWarning}
          deleteWarningTriggered={deleteWarningTriggered}
          warning={warning}
          handleIssueWarning={handleIssueWarning}
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
