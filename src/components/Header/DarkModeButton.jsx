import {useState} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import './DarkModeButton.css';
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
        className={`dark-mode-button ${darkMode ? 'dark-mode' : ''}`} 
        onClick={toggleDarkMode}
        id="darkModeTooltip">
      <span className="icon">{darkMode ? '🌞' : '🌜'}</span>
      </button>

    </>

  );
};

export default DarkModeButton;