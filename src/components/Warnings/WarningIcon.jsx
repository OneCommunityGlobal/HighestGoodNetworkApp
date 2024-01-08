/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';

function WarningIcon(props) {
  const { id, color, date, warningText } = props;

  const [btnColor, setBtnColor] = useState(color ? color : 'white');
  const [dateAssigned, setDateAssigned] = useState(date ? date : null);
  const [timeAssigned, setTimeAssigned] = useState(date ? date : null);

  const clicked = id => {
    const today = moment().format('MM/DD/YYYY HH:mm:ss a');
    const [todaysDate, todaysTime, todaysTimeOfDay] = today.split(' ');

    const colorAssigned = btnColor === 'white' ? 'blue' : btnColor === 'blue' ? 'red' : 'white';
    // console.log('today formatted', formatDate(today));

    // console.log('id is', id);
    setBtnColor(colorAssigned);
    setDateAssigned(todaysDate);
    setDateAssigned(todaysTime);

    //color needs to be dynically added
    props.handleWarningIconClicked(id, colorAssigned, todaysDate, warningText);
  };

  // console.log('button color', btnColor);

  const popover = (
    <Popover id="popover-basic">
      <Popover.Title as="h4">Date Assigned</Popover.Title>
      <Popover.Content>{dateAssigned}</Popover.Content>
    </Popover>
  );

  return (
    <div className="warning-icon">
      <OverlayTrigger placement="top" delay={{ show: 100, hide: 250 }} overlay={popover}>
        <FontAwesomeIcon
          style={{
            color: btnColor,
            border: '1px solid black',
            borderRadius: '50%',
            width: '10px',
            height: '10px',
          }}
          id={id}
          onClick={() => clicked(id)}
          icon={faCircle}
          data-testid="icon"
        />
      </OverlayTrigger>
    </div>
  );
}

export default WarningIcon;
