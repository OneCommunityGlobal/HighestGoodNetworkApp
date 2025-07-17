import './TwoWayToggleSwitch.css'; // Asegúrate de crear este archivo CSS

function TwoWayToggleSwitch({ isOn, handleToggle }) {
  return (
    <div className="two-way-toggle-switch">
      <input
        checked={isOn}
        onChange={handleToggle}
        className="toggle-switch-checkbox"
        id="toggle-switch-new"
        type="checkbox"
      />
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label className="toggle-switch-label" htmlFor="toggle-switch-new">
        <span className="toggle-switch-inner" />
        <span className="toggle-switch-switch" />
      </label>
    </div>
  );
}

export default TwoWayToggleSwitch;
