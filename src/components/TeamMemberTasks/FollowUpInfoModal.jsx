import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfo } from '@fortawesome/free-solid-svg-icons';
import './FollowUpInfoModal.css';


const FollowUpInfoModal = () => {

  return (
    <div className="folloup-tooltip-container">
      <button className="folloup-tooltip-button" >
        <FontAwesomeIcon icon={faInfo} />
        <div className="folloup-tooltip">
        This checkbox allows you to track follow-ups. By clicking it, you indicate that you have
        checked <br /> in with a person to ensure they are on track to meet their deadline.
        <br />
        <br />
        The checkbox is visible and accessible to all classes except volunteers. Checking the box
        will modify
        <br /> its appearance for all others who can see it.
        <br />
        <br />
        When a person's task is at 50%, 75%, or 90% of the deadline, the checkbox automatically
        clears and changes to a red outline with a <br />
        light pink filler. This visual cue indicates that the person requires follow-up. <br />
        <br />
        Once checked, the box reverts to a green outline with a light green filler and a check mark
        inside.
        <br />
        <br />
        If a person is followed up with when their progress is between 50-75%, the checkbox will not{' '}
        <br /> automatically clear until the person reaches over 75% progress.
        <br />
        <br /> Similarly, If a person is followed up with when their progress is between 75-90% the
        checkbox remains checked <br /> until the person reaches over 90% progress.
        <br />
        <br />
        if the checkbox is unchecked it resets to initial state.
        <br />
        (If the progress is less than 50%, the checkbox will be unchecked and shown in green.
        <br />
        If the progress is over 50%, the checkbox will be unchecked and shown in red)
        <br />
        <br />
      </div>
      </button>
    </div>
  );
};

export default FollowUpInfoModal;
