import './SwitchTimer.css';
import React, { useState } from 'react';

const SwitchTimer = ({ message, handleSwitch }) => {
  /*
  Here is the logic for the alert modal
  If the timer is not paused we should show the alert
  If the timer is paused we should show the alert if the timer is a countdown and the time is less than the goal
  or if the timer is a stopwatch and the time is greater than 0
  We do this because we don't want the user to lost progress
  */
  const shouldAlert = () => {
    if (!message.paused) return true;
    return message.countdown ? message.time < message.goal : message.time > 0;
  };

  const [alert, setAlert] = useState(false);

  /*
  Here is the logic for the switch
  If the the should alert function returns true we show the alert modal
  and if the user clicks yes we call the handle switch function
  If the should alert function returns false we call the handle switch function
  */
  return (
    <>
      <div className="toggle-switch">
        <input
          type="checkbox"
          className="toggle-switch-checkbox"
          name="toggleSwitch"
          id="toggleSwitch"
          checked={message ? !message.countdown : true}
          onChange={() => {
            shouldAlert() ? setAlert(true) : handleSwitch();
          }}
        />
        <label className="toggle-switch-label" htmlFor="toggleSwitch">
          <span className="toggle-switch-inner" />
          <span className="toggle-switch-switch" />
        </label>
      </div>
      {alert && (
        <div className="alert">
          <span>Changing the mode will result in lost of your current progress</span>
          <p>Are you sure?</p>
          <div className="actions">
            <button
              type="button"
              className="yes transition-color"
              onClick={() => {
                handleSwitch();
                setAlert(false);
              }}
            >
              Yes
            </button>
            <button type="button" className="no transition-color" onClick={() => setAlert(false)}>
              Nope
            </button>
          </div>
        </div>
      )}
    </>
  );
};
export default SwitchTimer;