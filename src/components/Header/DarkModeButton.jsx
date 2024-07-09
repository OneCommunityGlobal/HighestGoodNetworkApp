import {useState} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import './DarkMode.css';
import { Tooltip } from 'reactstrap';

const DarkModeButton = () => {
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
        placement="auto" 
        isOpen={tooltipOpen} 
        target="darkModeTooltip" 
        toggle={toggleTooltip}
      >
        {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      </Tooltip>
      <button 
        className={`dark-mode-button ${darkMode ? 'dark-mode text-light' : ''}`} 
        onClick={toggleDarkMode}
        id="darkModeTooltip">
      <span className="icon">{darkMode ? 'Dark Mode Off' : 'Dark Mode On'}</span>
      </button>

    </>

  );
};

export default DarkModeButton;