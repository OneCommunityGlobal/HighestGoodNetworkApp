import React from 'react'
import style from './ToggleSwitch.module.scss'

/**
 * 
 * @param {boolean} props.state Value of the toggle switch 
 * @param {func} props.setState function that assigns a value to state
 * @param {string} props.onLabel Label to the right side of the switch indicating the value of the toggle when turned on
 * @param {string} props.onLabel Label to the left side of the switch indicating the value of the toggle when turned off
 * @returns 
 */
const ToggleSwitch = (props) => {

  const { state, setState } = props
  const onLabel = props.onLabel;
  const offLabel = props.offLabel;

  return (
    <div className={style.switchSection}>
      <div className={style.switchContainer}>
        {onLabel}
        <input
          type="checkbox"
          className={style.toggle}
          onChange={() => setState(!state)}
          checked={state}
        />
        {offLabel}
      </div>
    </div>
  )

}

export default ToggleSwitch
