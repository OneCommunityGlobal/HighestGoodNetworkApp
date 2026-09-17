import React, { useState, useEffect } from 'react';

const getBgColor = pos => {
  if (pos === 'posted') return 'blue';
  if (pos === 'default') return 'darkgray';
  return 'green';
};

function TriStateToggleSwitch({ pos, onChange }) {
  const [position, setPosition] = useState(pos);
  const [bgColor, setBgColor] = useState(getBgColor(pos));

  const handleClick = newPos => {
    setPosition(newPos);
    if (onChange) {
      onChange(newPos);
    }
    setBgColor(getBgColor(newPos));
  };

  useEffect(() => {
    if (pos) {
      setPosition(pos);
    }
    setBgColor(getBgColor(pos));
  }, [pos]);

  const toggleClass = `toggle-switch bg-${bgColor}`;

  return (
    <div className={toggleClass}>
      <div className="knob-area">
        <button type="button" onClick={() => handleClick('posted')} aria-label="posted" />
        <button type="button" onClick={() => handleClick('default')} aria-label="default" />
        <button type="button" onClick={() => handleClick('requested')} aria-label="requested" />
      </div>
      <div className={`knob ${position}`} />
    </div>
  );
}

export default TriStateToggleSwitch;
