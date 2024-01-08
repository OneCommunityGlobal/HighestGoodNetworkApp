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

//breaking warning item apart and each one will have its on state
//when an icon is clicked
// i ende to know which was clicked as I'll need to save it in the parent componet when i push to the database

//next

//figure out why placement of tooltip displays at the top of the page
//next add a date when clicking and turning the icon to blue
function WarningItem({
  warningText,
  handlePostWarningDetails,
  warnings,
  handleDeleteWarnings,
  // warningOptions,
}) {
  // const usersWarnings = useSelector(state => state.userProfile.warnings);
  //

  // const [btnColor, setBtnColor] = useState('white');
  // const clicked = e => {
  //   setBtnColor(prev => {
  //     if (prev === 'white') {
  //       return 'blue';
  //     } else if (prev === 'blue') {
  //       return 'red';
  //     } else return 'white';
  //   });

  const handleWarningIconClicked = async (id, color, dateAssigned) => {
    handlePostWarningDetails(id, color, dateAssigned);
  };

  // const warningTitles = warningOptions.map(warning => {
  //   return (
  //     <WarningIcons
  //       handleWarningIconClicked={handlePostWarningDetails}
  //       usersWarnings={usersWarnings}
  //       warning={warning}
  //     />
  //   );
  // });
  return (
    <div className="warning-item-container">
      {/* <OverlayExample /> */}
      <div className="warning-wrapper">
        {/* {warningTitles} */}
        <WarningIcons
          warnings={warnings}
          warningText={warningText}
          handleWarningIconClicked={handlePostWarningDetails}
          // usersWarnings={usersWarnings}
        />
        <p className="warning-text"> {warningText}</p>
      </div>
    </div>
  );
}

export default WarningItem;

// {
/* <div className="icons-wrapper">
        <div className="warning-icon" id={uuidv4()} onClick={id => clicked(id)}>
          <FontAwesomeIcon
            style={{
              color: 'white',
              border: '1px solid black',
              borderRadius: '50%',
              width: '10px',
              height: '10px',
            }}
            icon={faCircle}
            data-testid="icon"
          />
        </div>
        <div className="warning-icon">
          <FontAwesomeIcon
            style={{
              color: 'white',
              border: '1px solid black',
              borderRadius: '50%',
              width: '10px',
              height: '10px',
            }}
            id={uuidv4()}
            onClick={id => clicked(id)}
            icon={faCircle}
            data-testid="icon"
          />
        </div>
        <div className="warning-icon">
          <FontAwesomeIcon
            style={{
              color: 'white',
              border: '1px solid black',
              borderRadius: '50%',
              width: '10px',
              height: '10px',
            }}
            id={uuidv4()}
            // onClick={clicked}
            icon={faCircle}
            data-testid="icon"
          />
        </div>
        <div className="warning-icon">
          <FontAwesomeIcon
            style={{
              color: 'white',
              border: '1px solid black',
              borderRadius: '50%',
              width: '10px',
              height: '10px',
            }}
            id={uuidv4()}
            onClick={id => clicked(id)}
            icon={faCircle}
            data-testid="icon"
          />
        </div>
        <div className="warning-icon">
          <FontAwesomeIcon
            style={{
              color: 'white',
              border: '1px solid black',
              borderRadius: '50%',
              width: '10px',
              height: '10px',
            }}
            id={uuidv4()}
            onClick={id => clicked(id)}
            icon={faCircle}
            data-testid="icon"
          />
        </div>
        <div className="warning-icon">
          <FontAwesomeIcon
            style={{
              color: 'white',
              border: '1px solid black',
              borderRadius: '50%',
              width: '10px',
              height: '10px',
            }}
            id={uuidv4()}
            onClick={id => clicked(id)}
            icon={faCircle}
            data-testid="icon"
          />
        </div>
        <div className="warning-icon">
          <FontAwesomeIcon
            style={{
              color: 'white',
              border: '1px solid black',
              borderRadius: '50%',
              width: '10px',
              height: '10px',
            }}
            id={uuidv4()}
            onClick={id => clicked(id)}
            icon={faCircle}
            data-testid="icon"
          />
        </div>
        <div className="warning-icon">
          <FontAwesomeIcon
            style={{
              color: 'white',
              border: '1px solid black',
              borderRadius: '50%',
              width: '10px',
              height: '10px',
            }}
            id={uuidv4()}
            onClick={id => clicked(id)}
            icon={faCircle}
            data-testid="icon"
          />
        </div>
      </div>
      <p className="warning-text"> {warningText}</p> */
