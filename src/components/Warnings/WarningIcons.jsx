/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

import { v4 as uuidv4 } from 'uuid';
import WarningIcon from './WarningIcon';

function WarningIcons({
  userId,
  handleWarningIconClicked,
  warnings,
  warningText,
  handleModalTriggered,
  numberOfWarnings,
}) {
  const filledWarnings = warnings.concat(Array.from({ length: Math.max(8 - warnings.length, 0) }));

  return (
    <div className="warning-icons">
      {filledWarnings.slice(0, 8).map(warning => {
        if (warning) {
          return (
            <WarningIcon
              key={warning._id}
              id={warning._id}
              handleWarningIconClicked={handleWarningIconClicked}
              {...warning}
              warningText={warningText}
              handleModalTriggered={handleModalTriggered}
              numberOfWarnings={numberOfWarnings}
            />
          );
        }
        return (
          <WarningIcon
            id={uuidv4()}
            key={uuidv4()}
            handleWarningIconClicked={handleWarningIconClicked}
            warningText={warningText}
            handleModalTriggered={handleModalTriggered}
            numberOfWarnings={numberOfWarnings}
          />
        );
      })}
    </div>
  );
}

export default WarningIcons;
