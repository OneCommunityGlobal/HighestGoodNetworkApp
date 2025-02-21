import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import './DarkMode.css';
import { Tooltip } from 'reactstrap';
import sunIcon from './images/sunIcon.png';
import nightIcon from './images/nightIcon.png';

function DarkModeButton() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const dispatch = useDispatch();

  const toggleDarkMode = () => {
    dispatch({ type: 'TOGGLE_THEME' });
  };

  const toggleTooltip = () => {
    setTooltipOpen(!tooltipOpen);
  };

  return (
    <>
      <Tooltip
        placement="bottom"
        isOpen={tooltipOpen}
        target="darkModeTooltip"
        toggle={toggleTooltip}
      >
        {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      </Tooltip>
      <div
        type="button"
        className={`dark-mode-button ${darkMode ? 'dark-mode' : ''}`}
        onClick={toggleDarkMode}
        id="darkModeTooltip"
      >
        {darkMode ? (
          <div className="darkModeSliderContainer">
            <img src={nightIcon} alt="Night Icon" className="nightIcon" />
            <img src={sunIcon} alt="Sun Icon" className="sunHoverIcon" />
            <span className="darkModeText">Dark Mode</span>
            <span className="lightModeHoverText">Light Mode</span>
          </div>
        ) : (
          <div className="lightModeSliderContainer">
            <img src={sunIcon} alt="Sun Icon" className="sunIcon" />
            <img src={nightIcon} alt="Night Icon" className="nightHoverIcon" />
            <span className="lightModeText">Light Mode</span>
            <span className="darkModeHoverText">Dark Mode</span>
          </div>
        )}
      </div>
    </>
  );
}

export default DarkModeButton;
