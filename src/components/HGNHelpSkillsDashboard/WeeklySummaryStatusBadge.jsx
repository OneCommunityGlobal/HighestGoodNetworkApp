import PropTypes from 'prop-types';
import { FaExclamationCircle } from 'react-icons/fa';
import styles from './style/UserCard.module.css';

export const INCOMPLETE_SUMMARY_LABEL = 'Weekly summary not submitted';

/**
 * Shown next to a member's name when the backend reports that their weekly summary for the
 * current week is missing. Completed, not-required, and unknown (missing/loading/unavailable)
 * statuses render nothing so the badge never claims something we don't know.
 */
function WeeklySummaryStatusBadge({ status }) {
  if (status !== 'incomplete') return null;

  return (
    <span className={styles.summaryIncompleteBadge} title={INCOMPLETE_SUMMARY_LABEL}>
      <FaExclamationCircle aria-hidden="true" focusable="false" />
      <span>{INCOMPLETE_SUMMARY_LABEL}</span>
    </span>
  );
}

WeeklySummaryStatusBadge.propTypes = {
  status: PropTypes.oneOf(['completed', 'incomplete', 'notRequired', null]),
};

export default WeeklySummaryStatusBadge;
