import PropTypes from 'prop-types';
import styles from './TwoWayToggleSwitch.module.css';

function TwoWayToggleSwitch({ isOn, handleToggle, id, className }) {
  const toggleId = id || 'toggle-switch-new';

  return (
    <div
      className={`${styles['two-way-toggle-switch']} ${className}`}
      role="group"
      aria-label="Chart value display"
    >
      <input
        checked={isOn}
        onChange={handleToggle}
        className={styles['toggle-switch-checkbox']}
        id={toggleId}
        type="checkbox"
      />
      <label
        className={styles['toggle-switch-label']}
        htmlFor={toggleId}
        aria-label="Toggle setting"
      >
        <span className={styles['toggle-switch-inner']} />
        <span className={styles['toggle-switch-switch']} />
      </label>
    </div>
  );
}

TwoWayToggleSwitch.propTypes = {
  isOn: PropTypes.bool.isRequired,
  handleToggle: PropTypes.func.isRequired,
  id: PropTypes.string,
  className: PropTypes.string,
};

TwoWayToggleSwitch.defaultProps = {
  id: 'toggle-switch-new',
  className: '',
};

export default TwoWayToggleSwitch;
