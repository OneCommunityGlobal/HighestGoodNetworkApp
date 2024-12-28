import './TriStateToggleSwitch.css';
import React, { useState, useEffect } from 'react';

function TriStateToggleSwitch({ pos, onChange }) {
  const [position, setPosition] = useState(pos);
  const [bgColor, setBgColor] = useState('');

  const handleClick = pos => {
    setPosition(pos);

    if (onChange) {
      onChange(pos);
    }

    if (pos === 'posted') {
      setBgColor('blue');
    } else if (pos === 'default') {
      setBgColor('darkgray');
    } else {
      setBgColor('green');
    }
  };

  useEffect(() => {
    if (pos) {
      setPosition(pos);
    }

    if (pos === 'posted') {
      setBgColor('blue');
    } else if (pos === 'default') {
      setBgColor('darkgray');
    } else {
      setBgColor('green');
    }
  }, [pos]);

  return (
    <div className={`toggle-switch bg-${bgColor}`}>
      <div className="knob-area">
        <div onClick={() => handleClick('posted')} />
        <div onClick={() => handleClick('default')} />
        <div onClick={() => handleClick('requested')} />
      </div>
      <div className={`knob ${position}`} />
    </div>
  );
}

export default TriStateToggleSwitch;
