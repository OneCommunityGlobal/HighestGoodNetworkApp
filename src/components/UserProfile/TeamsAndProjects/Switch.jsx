import "./Switch.css"
const Switch = ({ isOn, handleToggle}) => {
  return (
    <div className='switch-container'>
      <p className='switch-title'>invisible</p>
      <input
        checked={isOn}
        onChange={handleToggle}
        className="switch-checkbox"
        id="switch"
        type="checkbox"
      />
      <label
        style={{ background: isOn ? "#0062cc" : " " }}
        className="switch-label"
        htmlFor="switch"
      >
        <span className="switch-button" />
      </label>
      <p className='switch-title'>visible</p>
    </div>
  );
}

export default Switch