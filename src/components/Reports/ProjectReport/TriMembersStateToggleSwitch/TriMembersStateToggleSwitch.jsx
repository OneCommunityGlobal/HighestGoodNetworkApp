import React, { useState, useEffect } from 'react';
import './TriMembersStateToggleSwitch.css';

function TriMembersStateToggleSwitch({ onChange }) {
  const [position, setPosition] = useState('default');
  const [bgColor, setBgColor] = useState('darkgray');

  const handleClick = pos => {
    setPosition(pos);
    switch (pos) {
      case 'posted':
        setBgColor('blue');
        onChange({ showInactive: true, showActive: false });
        break;
      case 'default':
        setBgColor('darkgray');
        onChange({ showInactive: false, showActive: false });
        break;
      case 'requested':
        setBgColor('green');
        onChange({ showInactive: false, showActive: true });
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    handleClick('default');
  }, []);

  return (
    <div className={`toggle-switch bg-${bgColor}`}>
      <div className="knob-area">
        <div onClick={() => handleClick('posted')}></div>
        <div onClick={() => handleClick('default')}></div>
        <div onClick={() => handleClick('requested')}></div>
      </div>
      <div className={`knob ${position}`}></div>
    </div>
  );
}

export default TriMembersStateToggleSwitch;
