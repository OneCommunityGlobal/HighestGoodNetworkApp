import React from 'react';
import './TwoWayToggleSwitch.css'; // Asegúrate de crear este archivo CSS

const TwoWayToggleSwitch = ({ isOn, handleToggle }) => {
  return (
    <div className="toggle-switch">
      <input
        checked={isOn}
        onChange={handleToggle}
        className="toggle-switch-checkbox"
        id={`toggle-switch-new`}
        type="checkbox"
      />
      <label
        className="toggle-switch-label"
        htmlFor={`toggle-switch-new`}
      >
        <span className={`toggle-switch-inner`} />
        <span className={`toggle-switch-switch`} />
      </label>
    </div>
  );
};

export default TwoWayToggleSwitch;
