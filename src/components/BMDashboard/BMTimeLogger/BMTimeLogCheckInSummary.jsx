import { useSelector } from 'react-redux';
import { groupMembers, GROUP_BY_OPTIONS } from './groupMembers';
import styles from './BMTimeLogCard.module.css';

const ACTIVE_STATUSES = ['ongoing', 'paused'];

function BMTimeLogCheckInSummary({ projectId, members }) {
  const allProjectTimeLogs = useSelector(
    state => state.bmTimeLogger?.allProjectTimeLogs?.[projectId] || [],
  );

  // Any active log counts, whatever its age, because the backend treats that member as checked in
  const checkedInIds = new Set(
    allProjectTimeLogs
      .filter(log => ACTIVE_STATUSES.includes(log.status))
      .map(log => log.member?._id),
  );
  const isCheckedIn = member => checkedInIds.has(member.user._id);
  const checkedInCount = members.filter(isCheckedIn).length;

  return (
    <div className={`${styles.checkInSummary}`} data-testid="check-in-summary">
      <div className={`${styles.checkInSummaryTotals}`}>
        <span>
          Checked in: <strong>{checkedInCount}</strong>
        </span>
        <span>
          Remaining: <strong>{members.length - checkedInCount}</strong>
        </span>
      </div>
      {Object.values(GROUP_BY_OPTIONS).map(({ label, getGroups }) => (
        <div key={label} className={`${styles.checkInSummaryBreakdown}`}>
          <strong>By {label.toLowerCase()}:</strong>
          <ul className={`${styles.checkInSummaryGroups}`}>
            {groupMembers(members, getGroups).map(group => (
              <li key={group.key}>
                {group.label}: {group.members.filter(isCheckedIn).length}/{group.members.length}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default BMTimeLogCheckInSummary;
