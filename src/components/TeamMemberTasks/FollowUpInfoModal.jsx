import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import './FollowUpInfoModal.css';
import { useSelector } from 'react-redux';

function FollowUpInfoModal() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [isTooltipVisible, setTooltipVisible] = useState(false);

  const handleMouseEnter = () => {
    setTooltipVisible(true);
  };

  const handleMouseLeave = () => {
    setTooltipVisible(false);
  };

  return (
    <div
      className="followup-tooltip-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button className="followup-tooltip-button" aria-label="Tooltip button" type="button">
        <FontAwesomeIcon
          className="followup-tooltip-button-icon"
          icon={faCircleInfo}
          style={{ color: darkMode ? 'silver' : 'black' }}
        />
      </button>
      {isTooltipVisible && (
        <div className="followup-tooltip">
          <div className="mb-3">
            This checkbox allows you to track follow-ups. By clicking it, you indicate that you have
            checked in with a person to ensure they are on track to meet their deadline.
          </div>
          <div className="mb-3">
            The checkbox is visible and accessible to all classes except volunteers. Checking the
            box will modify its appearance for all others who can see it.
          </div>
          <div className="mb-3">
            When a person&apos;s task is at 50%, 75%, or 90% of the deadline, the checkbox
            automatically clears and changes to a red outline with a light pink filler. This visual
            cue indicates that the person requires follow-up.
          </div>
          <div className="mb-3">
            Once checked, the box reverts to a green outline with a light green filler and a check
            mark inside.
          </div>
          <div className="mb-3">
            If a person is followed up with when their progress is between 50-75%, the checkbox will
            not automatically clear until the person reaches over 75% progress.
          </div>
          <div className="mb-3">
            Similarly, If a person is followed up with when their progress is between 75-90% the
            checkbox remains checked until the person reaches over 90% progress.
          </div>
          <div className="mb-3">
            if the checkbox is unchecked it resets to initial state. (If the progress is less than
            50%, the checkbox will be unchecked and shown in green. If the progress is over 50%, the
            checkbox will be unchecked and shown in red)
          </div>
        </div>
      )}
    </div>
  );
}

export default FollowUpInfoModal;
