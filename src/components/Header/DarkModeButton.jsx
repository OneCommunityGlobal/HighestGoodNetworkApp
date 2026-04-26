import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styles from './DarkMode.module.css'; // Access classes via 'styles'
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
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [darkMode, dispatch, updatingTheme]);

  useEffect(() => {
    setUpdatingTheme(true);
    localStorage.setItem('darkMode', darkMode);
    const timer = setTimeout(() => setUpdatingTheme(false), 100);
    return () => clearTimeout(timer);
  }, [darkMode]);

  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);

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
        role="button"
        tabIndex={0}
        className={`${styles.darkModeButton} ${darkMode ? styles.isDarkState : ''}`}
        onClick={toggleDarkMode}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleDarkMode();
          }
        }}
        id="darkModeTooltip"
        style={{ cursor: 'pointer', border: 'none', background: 'none', padding: 0 }}
      >
        {darkMode ? (
          <div className={styles.sliderContainerDark}>
            <img src={nightIcon} alt="Night" className={styles.iconNight} />
            <img src={sunIcon} alt="Sun" className={styles.iconSunHover} />
            <span className={styles.labelDark}>Dark Mode</span>
            <span className={styles.labelLightHover}>Light Mode</span>
          </div>
        ) : (
          <div className={styles.sliderContainerLight}>
            <img src={sunIcon} alt="Sun" className={styles.iconSun} />
            <img src={nightIcon} alt="Night" className={styles.iconNightHover} />
            <span className={styles.labelLight}>Light Mode</span>
            <span className={styles.labelDarkHover}>Dark Mode</span>
          </div>
        )}
      </div>
    </>
  );
}

export default DarkModeButton;