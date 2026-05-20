import PropTypes from 'prop-types';
import './TwoWayToggleSwitch.css';

function TwoWayToggleSwitch({ isOn, handleToggle, id }) {
  const toggleId = id || 'toggle-switch-new';

  return (
    <div className="two-way-toggle-switch">
      <input
        checked={isOn}
        onChange={handleToggle}
        className="toggle-switch-checkbox"
        id={toggleId}
        type="checkbox"
      />
      <label className="toggle-switch-label" htmlFor={toggleId} aria-label="Toggle setting">
        <span className="toggle-switch-inner" />
        <span className="toggle-switch-switch" />
      </label>
    </div>
  );
}

TwoWayToggleSwitch.propTypes = {
  isOn: PropTypes.bool.isRequired,
  handleToggle: PropTypes.func.isRequired,
  id: PropTypes.string,
};

TwoWayToggleSwitch.defaultProps = {
  id: 'toggle-switch-new',
};

export default TwoWayToggleSwitch;
