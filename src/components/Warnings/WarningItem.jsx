import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import { v4 as uuidv4 } from 'uuid';
import WarningIcon from './WarningIcon';
import './Warnings.css';
import WarningIcons from './WarningIcons';
import OverlayExample from './OverlayExample';
import { Button } from 'react-bootstrap';
import WarningsModal from './WarningsModal';

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
      {warning && (
        <WarningsModal
          visible={toggleModal}
          setToggleModal={setToggleModal}
          deleteWarning={deleteWarning}
          deleteWarningTriggered={deleteWarningTriggered}
          warning={warning}
          numberOfWarnings={warnings.length}
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
