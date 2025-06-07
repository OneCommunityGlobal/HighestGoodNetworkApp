import styles from './TwoWayToggleSwitch.module.css'; // Asegúrate de crear este archivo CSS

function TwoWayToggleSwitch({ isOn, handleToggle }) {
  return (
    <div className={`${styles.twoWayToggleSwitch}`}>
      <input
        checked={isOn}
        onChange={handleToggle}
        className={`${styles.toggleSwitchCheckbox}`}
        id="toggle-switch-new"
        type="checkbox"
      />
      <label className={`${styles.toggleSwitchLabel}`} htmlFor="toggle-switch-new">
        <span className={`${styles.toggleSwitchInner}`} />
        <span className={`${styles.toggleSwitchSwitch}`} />
      </label>
    </div>
  );
}

export default TwoWayToggleSwitch;
