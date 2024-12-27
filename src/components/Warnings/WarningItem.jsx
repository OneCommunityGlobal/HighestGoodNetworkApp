/* eslint-disable no-shadow */
import { useState } from 'react';

import './Warnings.css';
import WarningIcons from './WarningIcons';
// import WarningsModal from './WarningsModal';
import WarningModal from './modals/WarningModal';

function WarningItem({
  warningText,
  handlePostWarningDetails,
  warnings,
  userProfileModal,
  handleShowWarningModal,
}) {
  return (
    <div className="warning-item-container">
      <div className="warning-wrapper">
        <WarningIcons
          warnings={warnings}
          warningText={warningText}
          handleWarningIconClicked={handlePostWarningDetails}
          handleShowWarningModal={handleShowWarningModal}
          numberOfWarnings={warnings.length}
          userProfileModal={userProfileModal}
        />
        <p className="warning-text"> {warningText}</p>
      </div>
    </div>
  );
}

export default WarningItem;
