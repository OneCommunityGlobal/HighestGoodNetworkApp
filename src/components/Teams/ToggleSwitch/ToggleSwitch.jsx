import { useState } from 'react';
import style from './ToggleSwitch.module.scss';

function ToggleSwitch({ switchType, UpdateTeamMembersVisiblity, userId, choice }) {
  const [visiblity, setVisiblity] = useState(choice);
  switch (switchType) {
    case 'limit-visiblity':
      return (
        <div className={style.switchSection}>
          <div className={style.switchContainer}>
            <input
              id="teamVisiblity"
              type="checkbox"
              className={style.toggleTeamsVisibility}
              checked={visiblity} // Assuming visiblity is a string
              onChange={event => {
                const isChecked = !visiblity;
                setVisiblity(isChecked);
                console.log('new value', isChecked);

                UpdateTeamMembersVisiblity(userId, isChecked);
              }}
            />
          </div>
        </div>
      );

    default:
      break;
  }
  return <div>ERROR: Toggle Switch.</div>;
}

export default ToggleSwitch;
