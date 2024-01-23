import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCircle, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import hasPermission from 'utils/permissions';
import { useDispatch, useSelector } from 'react-redux';
import {
  getWarningsByUserId,
  postWarningByUserId,
  deleteWarningsById,
} from '../../actions/warnings';

//yellow colro #ffc107
import WarningItem from './WarningItem';
import { Button, Alert } from 'react-bootstrap';
import './Warnings.css';
import { set } from 'lodash';
// Better Descriptions (“i” = ,ltd = Please be more specific in your time log descriptions.)
// Log Time to Tasks (“i” = ,lttt = Please log all time working on specific tasks to those tasks rather than the general category. )
// Log Time as You Go (“i” = ,ltayg = Reminder to please log your time as you go. At a minimum, please log daily any time you work.)
// Log Time to Action Items (“i” = ,ltayg = Reminder to please log your time as you go. At a minimum, please log daily any time you work.)
// Intangible Time Log w/o Reason (“i” = ,itlr = The timer should be used for all time logged, so any time logged as intangible must also include in the time log description an explanation for why you didn’t use the timer.

//admins and owners should see it by default using userRole
// the wanring button is only visiable to owners and admins

export default function Warning({ personId, username, userRole }) {
  const dispatch = useDispatch();

  const [usersWarnings, setUsersWarnings] = useState([]);

  const [toggle, setToggle] = useState(false);
  const [error, setError] = useState(null);

  const handleToggle = () => {
    setToggle(prev => !prev);
    dispatch(getWarningsByUserId(personId)).then(res => {
      if (res.error) {
        setError(res);
        setUsersWarnings([]);
        return;
      }
      setUsersWarnings(res);
    });
  };

  const handleDeleteWarning = async warningId => {
    dispatch(deleteWarningsById(warningId, personId)).then(res => {
      if (res.error) {
        setError(res);
        setUsersWarnings([]);
        return;
      }
      setUsersWarnings(res);
    });
  };
  const handlePostWarningDetails = async ({
    id,
    colorAssigned: color,
    todaysDate: dateAssigned,
    username,
    warningText,
  }) => {
    const data = {
      userId: personId,
      iconId: id,
      color,
      date: dateAssigned,
      description: warningText,
    };

    dispatch(postWarningByUserId(data)).then(res => {
      if (res.error) {
        setError(res);
        setUsersWarnings([]);
        return;
      }
      setUsersWarnings(res);
    });
  };

  const warnings = !toggle
    ? null
    : usersWarnings.map(warning => (
        <WarningItem
          warnings={warning.warnings}
          warningText={warning.title}
          handlePostWarningDetails={handlePostWarningDetails}
          username={username}
          submitWarning={handlePostWarningDetails}
          handleDeleteWarning={handleDeleteWarning}
        />
      ));

  return (
    (userRole === 'Administrator' || userRole === 'Owner') && (
      <div className="warnings-container">
        <Button className="btn btn-warning warning-btn" size="sm" onClick={handleToggle}>
          {toggle ? 'Hide' : 'Tracking'}
        </Button>

        <div className="warning-wrapper"> {warnings}</div>
        <div className="error-container">
          {error && (
            <Alert key="warning" variant="warning">
              {error.error}
            </Alert>
          )}
        </div>
      </div>
    )
  );
}

//log warning will be blue
//issue warning will be yellow email can be sent
//issue blue square will be red

//issuing a warning or blue square color should change
//issuing a warnig will be yellow
//issuing a blue square will be red
//log a warning will be blue

/*

3rd warning issue warnign will be yellow should appear as an option 

at 4th warning if blue square issue red 
after 4th issue warning will appear

after 3rd warning it should be issue warning or log warning or blue square

after 4th warning it should be issue wanring or issue blue sqaure or cancel
issue blue square will be red
issue warning will be yellow

//sort by dates isntead of color


//wants yellow to tell him they've been warned 3 times and an emial will be sent
//unlikely for them to not get an email after the 3rd warning but just in case
*/

// so to clarify a bit when issuing the 3rd warning, you’ll have the option of
// log warning or issue warning. log warning will be blue normal warning.
//  When selecting issue warning, it will be yellow.
// // After their 3rd warning, it will be issue blue square or cancel as the options?
// And it will always bed red when issuing a warning after 3 warnings.
// // I can have another color but seems a bit much if its only for a specific case.
// Maybe issue warning will  still be blue but send an email? For a future PR?
// // Since if you do log the warning it’ll be blue, then by the 4th one it will be red and issue a blue square.
// // Let me know.

//at 3 log warning issuing warning will appear
// jae can issue a warning => will be yellow
//or log the warning which will simply be blue
//or issue blue square

//at 4th can be issuing warning ,or log as an otpion or issue blue square

//at 5th choice of yellow or red for blue square
//

//for yellow color see if it needs to be a darker color, than reguar yellow
//can change the css for a daker yellow but pass yellwo to the backend
//since the enum is expecting yellow as teh value
