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

import WarningItem from './WarningItem';
import { Button } from 'react-bootstrap';
import './Warnings.css';
// Better Descriptions (“i” = ,ltd = Please be more specific in your time log descriptions.)
// Log Time to Tasks (“i” = ,lttt = Please log all time working on specific tasks to those tasks rather than the general category. )
// Log Time as You Go (“i” = ,ltayg = Reminder to please log your time as you go. At a minimum, please log daily any time you work.)
// Log Time to Action Items (“i” = ,ltayg = Reminder to please log your time as you go. At a minimum, please log daily any time you work.)
// Intangible Time Log w/o Reason (“i” = ,itlr = The timer should be used for all time logged, so any time logged as intangible must also include in the time log description an explanation for why you didn’t use the timer.

//admins and owners should see it by default using userRole
// the wanring button is only visiable to owners and admins

export default function Warning({ personId }) {
  const dispatch = useDispatch();

  // const { userid } = useSelector(state => state.auth.user);

  const [usersWarnings, setUsersWarnings] = useState([]);

  console.log('users warnins', usersWarnings);
  const [toggle, setToggle] = useState(false);

  const [warningOptions, setWarningOptions] = useState([
    'Better Descriptions',
    'Log Time to Tasks',
    'Log Time as You Go',
    'Log Time to Action Items',
    'Intangible Time Log w/o Reason',
  ]);

  const handleToggle = () => {
    setToggle(prev => !prev);
    //when fetch its an array of objects
    dispatch(getWarningsByUserId(personId)).then(res => {
      setUsersWarnings(res);
    });
  };

  const handleDeleteWarnings = async () => {
    console.log('hgandle delete called');
    dispatch(deleteWarningsById(personId));
    // setCurWarnings([]);
  };
  const handlePostWarningDetails = async (id, color, dateAssigned, warningText) => {
    const data = {
      userId: personId,
      iconId: id,
      color,
      date: dateAssigned,
      description: warningText,
    };

    dispatch(postWarningByUserId(data)).then(res => {
      console.log('res after posting', res);
      // being posted as a single an array with all the objects inside
      setUsersWarnings(res.warnings);
    });
  };
  // each warnign will have 8 circles
  // store warnings in an array
  //looop through each wanring rendering 8 circles and the text below inside of warnings component

  const warnings = !toggle
    ? null
    : usersWarnings.map(warning => (
        <WarningItem
          warnings={warning.warnings}
          warningText={warning.title}
          handlePostWarningDetails={handlePostWarningDetails}
        />
      ));

  // const warnings = !toggle ? null : (
  //   <WarningItem
  //     // warningText={warning}
  //     handleDeleteWarnings={handleDeleteWarnings}
  //     handlePostWarningDetails={handlePostWarningDetails}
  //     warningOptions={warningOptions}
  //     // curWarnings={curWarnings}
  //   />
  // );

  return (
    <div className="warnings-container">
      <Button className="btn btn-warning warning-btn" size="sm" onClick={handleToggle}>
        {toggle ? 'Hide' : 'Tracking'}
      </Button>
      <Button onClick={handleDeleteWarnings}>Delete</Button>

      <div className="warning-wrapper"> {warnings}</div>
    </div>
  );
}

//   <FontAwesomeIcon
//     style={{
//       color: 'white',
//       border: '1px solid black',
//       borderRadius: '50%',
//     }}
//     icon={faCircle}
//     data-testid="icon"
//   />
// </div>
// <div className="committed-hours-circle">
//   <FontAwesomeIcon
//     style={{
//       color: 'green',
//     }}
//     icon={faCircle}
//     data-testid="icon"
//   />
// </div>
// <div className="committed-hours-circle">
//   <FontAwesomeIcon
//     style={{
//       color: 'green',
//     }}
//     icon={faCircle}
//     data-testid="icon"
//   />
// </div>
// <div className="committed-hours-circle">
//   <FontAwesomeIcon
//     style={{
//       color: 'green',
//     }}
//     icon={faCircle}
//     data-testid="icon"
//   />
// </div>
// <div className="committed-hours-circle">
//   <FontAwesomeIcon
//     style={{
//       color: 'green',
//     }}
//     icon={faCircle}
//     data-testid="icon"
//   />

{
  /* <Radio name="warning" value="warning" />
      <Radio name="warning" value="warning" />
      <Radio name="warning" value="warning" />
      <Radio name="warning" value="warning" />
      <Radio name="warning" value="warning" />
      <Dropdown value="warning" name="warning" options={options} /> */
}
