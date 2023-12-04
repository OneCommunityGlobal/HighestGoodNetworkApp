import React from 'react';

import WarningIcon from './WarningIcon';

import { v4 as uuidv4 } from 'uuid';

//lift state from warning icon to here to manage it here instead
//crerate an overlay from react-boostrap for hovering over an icon
//displayu the date it was assinged when clicking and assinging it

const WarningIcons = ({ userId, handleWarningIconClicked }) => {
  const arr = Array(8).fill(uuidv4());

  // console.log(arr);
  return (
    <div className="warning-icons">
      {arr.map(item => (
        <WarningIcon id={item} handleWarningIconClicked={handleWarningIconClicked} />
      ))}
    </div>
  );
};

export default WarningIcons;
