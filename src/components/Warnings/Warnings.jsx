import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCircle, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
// import { Button } from 'reactstrap';
import WarningItem from './WarningItem';
import { Button } from 'react-bootstrap';
import './Warnings.css';
// Better Descriptions (“i” = ,ltd = Please be more specific in your time log descriptions.)
// Log Time to Tasks (“i” = ,lttt = Please log all time working on specific tasks to those tasks rather than the general category. )
// Log Time as You Go (“i” = ,ltayg = Reminder to please log your time as you go. At a minimum, please log daily any time you work.)
// Log Time to Action Items (“i” = ,ltayg = Reminder to please log your time as you go. At a minimum, please log daily any time you work.)
// Intangible Time Log w/o Reason (“i” = ,itlr = The timer should be used for all time logged, so any time logged as intangible must also include in the time log description an explanation for why you didn’t use the timer.

export default function Warning({ userId }) {
  const [toggle, setToggle] = useState(false);

  const [options, setOptions] = useState([
    'Better Descriptions',
    'Log Time to Tasks',
    'Log Time as You Go',
    'Log Time to Action Items',
    'Intangible Time Log w/o Reason ',
  ]);

  const handleToggle = () => {
    setToggle(prev => !prev);
  };

  // each warnign will have 8 circles
  // store warnings in an array
  //looop through each wanring rendering 8 circles and the text below inside of warnings component

  const warnings = options.map(warning => <WarningItem warningText={warning} userId={userId} />);

  // console.log('warnings', warnings);
  // const warnings = !toggle
  //   ? null
  //   : options.map(warning => <WarningItem warningText={warning} userId={userId} />);
  return (
    <div className="warnings-container">
      <Button className="btn btn-warning warning-btn" size="sm" onClick={handleToggle}>
        {toggle ? 'Hide' : 'Tracking'}
      </Button>
      <div className="warning-wrapper">{warnings} </div>
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
