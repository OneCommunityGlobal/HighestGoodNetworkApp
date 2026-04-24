import styles from './TwoWayToggleSwitch.module.css'; // Asegúrate de crear este archivo CSS

function TwoWayToggleSwitch({ isOn, handleToggle }) {
  return (
    <div className={styles['two-way-toggle-switch']}>
      <input
        checked={isOn}
        onChange={handleToggle}
        className={styles['toggle-switch-checkbox']}
        id="toggle-switch-new"
        type="checkbox"
      />
      <label
        className={styles['toggle-switch-label']}
        htmlFor="toggle-switch-new"
        aria-label="Toggle setting"
      >
        <span className={styles['toggle-switch-inner']} />
        <span className={styles['toggle-switch-switch']} />
      </label>
    </div>
  );
}

export default TwoWayToggleSwitch;
