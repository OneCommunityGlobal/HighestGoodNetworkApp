import { useState } from 'react';
import style from './ToggleSwitch.module.scss';

function ToggleSwitch({ switchType, UpdateTeamMembersVisibility, userId, choice }) {    
  const [visibility, setVisibility] = useState(choice); 
  
  switch (switchType) {
    case 'limit-visibility':
      return (
        <div className={style.switchSection}>
          <div className={style.switchContainer}>
            <input
              id="teamVisibility"
              type="checkbox"
              className={style.toggleTeamsVisibility}
              checked={visibility} // Assuming visibility is a string
              onChange={event => {
                const isChecked = !visibility;
                setVisibility(isChecked);
                UpdateTeamMembersVisibility(userId, isChecked);
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
