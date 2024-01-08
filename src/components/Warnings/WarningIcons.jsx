import React from 'react';

import WarningIcon from './WarningIcon';

import { v4 as uuidv4 } from 'uuid';

//lift state from warning icon to here to manage it here instead
//crerate an overlay from react-boostrap for hovering over an icon
//displayu the date it was assinged when clicking and assinging it

const WarningIcons = ({ userId, handleWarningIconClicked, warnings, warningText }) => {
  // const arr = Array(8).fill(uuidv4());
  const filledWarnings = warnings.concat(Array.from({ length: Math.max(8 - warnings.length, 0) }));

  console.log('filed warnings', filledWarnings);
  return (
    <div className="warning-icons">
      {filledWarnings.slice(0, 8).map(warning => {
        if (warning) {
          return (
            <WarningIcon
              id={warning._id}
              handleWarningIconClicked={handleWarningIconClicked}
              {...warning}
              warningText={warningText}
            />
          );
        } else {
          return (
            <WarningIcon
              id={uuidv4()}
              handleWarningIconClicked={handleWarningIconClicked}
              warningText={warningText}
            />
          );
        }
      })}
    </div>
  );
};

export default WarningIcons;
