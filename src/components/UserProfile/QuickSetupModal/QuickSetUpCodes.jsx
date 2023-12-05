
import React, { useState } from 'react';

const QuickSetupCodes = props => {
  const { titles, setAssignPopup, setTitleOnClick } = props;
  const qsc = titles.map((title) =>
  <div key={title._id} role="button" id="wrapper"  className="role-button bg-warning"
  onClick={()=> {
    setAssignPopup(true);
    setTitleOnClick(title);
    }}
    value="Software Engineer">{title?.shortName}
    <div className="title">
    <div className="summary">{title?.titleName}</div>
    </div>
  </div>
)
  return (
    <div className="blueSquares mt-3">{qsc}</div>
  )
}

export default QuickSetupCodes;