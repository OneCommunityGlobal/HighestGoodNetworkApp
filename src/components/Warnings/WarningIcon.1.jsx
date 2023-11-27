import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import Tooltip from 'react-bootstrap/Tooltip';
import TriggerExample from './Overlay';

export const WarningIcon = ({ id }) => {
  const [btnColor, setBtnColor] = useState('white');
  const [dateAssigned, setDateAssigned] = useState(null);

  const clicked = id => {
    console.log('id is', id);
    setBtnColor(prev => {
      if (prev === 'white') {
        return 'blue';
      } else if (prev === 'blue') {
        return 'red';
      } else return 'white';
    });
  };

  // const handleHover = () => {
  //   console.log('hover!!!');
  // };
  // const handleHoverOut = () => {
  //   console.log('hover removerd!!!');
  // };
  const renderTooltip = props => {
    <Tooltip id="icon-tooltip" {...props}>
      Tool tip hover
    </Tooltip>;
  };

  return (
    <div className="warning-icon">
      {/* <OverlayTrigger placement="right" delay={{ show: 0, hide: 0 }}> */}
      <TriggerExample />
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
    </div>
  );
};
