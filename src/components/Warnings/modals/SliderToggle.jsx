import React, { useState } from 'react';
import './SliderToggle.css'; // Custom CSS file

const SliderToggle = () => {
  const [isOn, setIsOn] = useState(false);

  const toggleSwitch = () => {
    setIsOn(prevState => !prevState);
  };

  return (
    <div className="slider-container" onClick={toggleSwitch}>
      <div className={`slider ${isOn ? 'slider-on' : ''}`}>
        <div className="slider-circle"></div>
      </div>
    </div>
  );
};

export default SliderToggle;
