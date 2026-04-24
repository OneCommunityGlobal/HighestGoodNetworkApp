import styles from './Switch.module.css'
const Switch = ({ isOn, handleToggle}) => {
  return (
    <div className={styles['switch-container']}>
      <p className={styles['switch-title']}>invisible</p>
      <input
        checked={isOn}
        onChange={handleToggle}
        className={styles['switch-checkbox']}
        id="switch"
        type="checkbox"
      />
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label
        style={{ background: isOn ? "#0062cc" : " " }}
        className={styles['switch-label']}
        htmlFor="switch"
      >
        <span className={styles['switch-button']} />
      </label>
      <p className={styles['switch-title']}>visible</p>
    </div>
  );
}

export default Switch