import { useState } from 'react';
import style from './ToggleSwitch.module.scss';

const DEFAULT_VISIBILITY = true;

function ToggleSwitch({ switchType, UpdateTeamMembersVisibility, userId, choice }) {
  const [visibility, setVisibility] = useState(choice !== undefined ? choice : DEFAULT_VISIBILITY);

  const toggleVisibility = () => {
    const isChecked = !visibility;
    setVisibility(isChecked);
    UpdateTeamMembersVisibility(userId, isChecked);
  };

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
              onChange={toggleVisibility}
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
