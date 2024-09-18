/* eslint-disable no-shadow */
import { useState, useEffect } from 'react';

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
}) {
  useEffect(() => {
    const containsBlueSquare = warnings.some(warning => warning.color === 'red');
    setContainsRedWarning(containsBlueSquare);
  }, [warnings]);

  const [toggleModal, setToggleModal] = useState(false);
  const [warning, setWarning] = useState(null);
  const [deleteWarning, setDeleteWarning] = useState(false);
  const [warningId, setWarningId] = useState(null);
  const [containsRedWarning, setContainsRedWarning] = useState(false);

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
      {warning && (
        <WarningModal
          visible={toggleModal}
          setToggleModal={setToggleModal}
          deleteWarning={deleteWarning}
          deleteWarningTriggered={deleteWarningTriggered}
          warning={warning}
          numberOfWarnings={warnings.length}
          handleIssueWarning={handleIssueWarning}
          containsRedWarning={containsRedWarning}
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
