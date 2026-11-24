import PropTypes from 'prop-types';
import { faCheck, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useDispatch, useSelector } from 'react-redux';
import { setUserFollowUp } from '../../actions/followUpActions';
import styles from './FollowUpCheckButton.module.css';
import { getFollowUpUpdate, getTaskProgress, needsFollowUp } from './followUpStatus';

function FollowupCheckButton({ mouseoverText, user, task }) {
  const dispatch = useDispatch();
  const userFollowUps = useSelector(state => state.userFollowUp?.followUps[user.personId] || []);
  const followUp = userFollowUps.find(ele => ele.taskId === task._id);
  const isChecked = followUp?.followUpCheck || false;
  const acceptedPercentage = followUp?.acceptedPercentage || 0;

  const currentPercentage = getTaskProgress(task.hoursLogged, task.estimatedHours);
  const needFollowUp = needsFollowUp(currentPercentage, followUp);

  // Was accepted as done but more time was logged after acceptance
  const violatedAfterAcceptance =
    isChecked && acceptedPercentage > 0 && currentPercentage > acceptedPercentage;

  const handleCheckboxFollowUp = () => {
    const data = getFollowUpUpdate(currentPercentage, isChecked, needFollowUp);
    dispatch(setUserFollowUp(user.personId, task._id, data));
  };

  return (
    <div className={styles['followup-box']}>
      <input
        type="checkbox"
        title={
          violatedAfterAcceptance
            ? '⚠️ Time was logged after this task was accepted as complete!'
            : mouseoverText
        }
        className={`${styles['team-task-progress-follow-up']} ${
          needFollowUp ? styles['team-task-progress-follow-up-red'] : ''
        } ${violatedAfterAcceptance ? styles['team-task-progress-follow-up-violated'] : ''}`}
        checked={isChecked && !needFollowUp}
        onChange={handleCheckboxFollowUp}
      />
      {isChecked && !needFollowUp && !violatedAfterAcceptance && (
        <FontAwesomeIcon
          icon={faCheck}
          title="Accepted as complete"
          className={styles['team-task-progress-follow-up-check']}
          onClick={handleCheckboxFollowUp}
        />
      )}
      {violatedAfterAcceptance && (
        <FontAwesomeIcon
          icon={faExclamationTriangle}
          title="⚠️ Time was logged after this task was accepted as complete!"
          className={styles['team-task-progress-follow-up-violated-icon']}
          onClick={handleCheckboxFollowUp}
        />
      )}
    </div>
  );
}

FollowupCheckButton.propTypes = {
  mouseoverText: PropTypes.string,
  user: PropTypes.shape({
    personId: PropTypes.string.isRequired,
  }).isRequired,
  task: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    hoursLogged: PropTypes.number,
    estimatedHours: PropTypes.number,
  }).isRequired,
};

FollowupCheckButton.defaultProps = {
  mouseoverText: '',
};

export default FollowupCheckButton;
