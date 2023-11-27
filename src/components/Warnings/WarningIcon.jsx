/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCircle, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { v4 as uuidv4 } from 'uuid';
import 'bootstrap/dist/css/bootstrap.min.css';

function WarningIcon(props) {
  const [btnColor, setBtnColor] = useState('white');
  const [dateAssigned, setDateAssigned] = useState(null);

  const { id } = props;

  const clicked = id => {
    // console.log('id is', id);
    setBtnColor(prev => {
      if (prev === 'white') {
        return 'blue';
      }
      if (prev === 'blue') {
        return 'red';
      }
      return 'white';
    });
  };

  // const handleHover = () => {
  //   console.log('hover!!!');
  // };

  // const handleHoverOut = () => {
  //   console.log('hover removerd!!!');
  // };
  const renderTooltip = props => (
    <Tooltip id="button-tooltip" {...props}>
      Simple tooltip
    </Tooltip>
  );

  return (
    // <OverlayTrigger
    //   placement="top"
    //   delay={{ show: 0, hide: 100000000 }}
    //   overlay={renderTooltip}
    //   // {...props}
    // >
    <div className="warning-icon">
      <OverlayTrigger placement="top" delay={{ show: 250, hide: 250 }} overlay={renderTooltip}>
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
          // onMouseOver={handleHover}
          // onMouseLeave={handleHoverOut}
        />
      </OverlayTrigger>
    </div>
  );
}

export default WarningIcon;
