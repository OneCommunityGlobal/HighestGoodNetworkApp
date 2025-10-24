import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import './DarkMode.css';
import { Tooltip } from 'reactstrap';
import sunIcon from './images/sunIcon.png';
import nightIcon from './images/nightIcon.png';

function DarkModeButton() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [updatingTheme, setUpdatingTheme] = useState(false);
  const dispatch = useDispatch();

  const toggleDarkMode = () => {
    dispatch({ type: 'TOGGLE_THEME' });
  };

  // Listen for localStorage changes from other tabs
  useEffect(() => {
    const handleStorageChange = event => {
      if (event.key === 'darkMode' && !updatingTheme) {
        const isDarkMode = event.newValue === 'true';
        if (isDarkMode !== darkMode) {
          dispatch({ type: 'SET_THEME', payload: isDarkMode });
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [darkMode, dispatch]);

  useEffect(() => {
    setUpdatingTheme(true);
    localStorage.setItem('darkMode', darkMode);
    // Reset the flag after a small delay (to ensure the storage event won't fire in the same tab)
    setTimeout(() => {
      setUpdatingTheme(false);
    }, 100);
  }, [darkMode]);

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
