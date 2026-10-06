import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { FiMoon, FiSun } from 'react-icons/fi';

function ThemeIconToggle({ buttonClassName, iconClassName }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const dispatch = useDispatch();

  const toggleDarkMode = () => {
    dispatch({ type: 'TOGGLE_THEME' });
  };

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const label = darkMode ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      type="button"
      className={buttonClassName}
      onClick={toggleDarkMode}
      aria-label={label}
      title={label}
    >
      {darkMode ? (
        <FiSun className={iconClassName} aria-hidden="true" />
      ) : (
        <FiMoon className={iconClassName} aria-hidden="true" />
      )}
    </button>
  );
}

ThemeIconToggle.propTypes = {
  buttonClassName: PropTypes.string,
  iconClassName: PropTypes.string,
};

ThemeIconToggle.defaultProps = {
  buttonClassName: '',
  iconClassName: '',
};

export default ThemeIconToggle;
