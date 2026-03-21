import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { getPromotionEligibility, postPromotionEligibility } from '../../actions/promotionActions';
import styles from './PromotionTable.module.css';

function MemberSection({ title, members, onPromoteChange, styles }) {
  return (
    <>
      <tr className={styles['sectionHeader']}>
        <td colSpan="7">{title}</td>
      </tr>
      {members.map(user => (
        <tr key={user.id}>
          <td />
          <td>{user.reviewer}</td>
          <td className={user.hasMetWeekly ? styles['statusMet'] : styles['statusNotMet']}>
            <span className={styles['statusIcon']}>{user.hasMetWeekly ? '✓' : '✗'}</span>
            {user.hasMetWeekly ? 'Has Met' : 'Has not Met'}
          </td>
          <td>{user.requiredPRs}</td>
          <td>{user.totalReviews}</td>
          <td>{user.remainingWeeks}</td>
          <td>
            <input
              className={styles['promoteCheckbox']}
              type="checkbox"
              checked={user.promote}
              onChange={() => onPromoteChange(user.id)}
            />
          </td>
        </tr>
      ))}
    </>
  );
}

MemberSection.propTypes = {
  title: PropTypes.string.isRequired,
  members: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      reviewer: PropTypes.string,
      hasMetWeekly: PropTypes.bool,
      requiredPRs: PropTypes.number,
      totalReviews: PropTypes.number,
      remainingWeeks: PropTypes.number,
      promote: PropTypes.bool,
    }),
  ).isRequired,
  onPromoteChange: PropTypes.func.isRequired,
  styles: PropTypes.objectOf(PropTypes.string).isRequired,
};

function PromotionTable() {
  const [eligibilityData, setEligibilityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [processingLoading, setProcessingLoading] = useState(false);
  const darkMode = useSelector(state => state.theme.darkMode);
  const requestor = useSelector(state => state.auth.user);

  const fetchEligibilityData = async () => {
    const data = await getPromotionEligibility();
    setEligibilityData(data);
  };

  useEffect(() => {
    setLoading(true);
    fetchEligibilityData()
      .catch(() => {
        toast.error('Failed to fetch promotion eligibility data.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handlePromoteChange = memberId => {
    setEligibilityData(prevData =>
      prevData.map(member =>
        member.id === memberId ? { ...member, promote: !member.promote } : member,
      ),
    );
  };

  const handleReviewForThisWeek = async () => {
    setReviewLoading(true);
    try {
      // Fetch fresh eligibility data from the backend
      await fetchEligibilityData();
      toast.success('Weekly review initiated. Table data refreshed.');
    } catch {
      toast.error('Failed to initiate weekly review.');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleProcessPromotions = async () => {
    setProcessingLoading(true);
    try {
      // Get selected member IDs for promotion
      const selectedMemberIds = eligibilityData.filter(m => m.promote).map(m => m.id);

      if (selectedMemberIds.length === 0) {
        toast.warning('No members selected for promotion.');
        setProcessingLoading(false);
        return;
      }

      // Call the promote endpoint with selected member IDs
      await postPromotionEligibility(selectedMemberIds, requestor?.userid);

      // Refresh data after processing
      await fetchEligibilityData();

      toast.success(`Promotions processed successfully for ${selectedMemberIds.length} member(s).`);
    } catch {
      toast.error('Failed to process promotions.');
    } finally {
      setProcessingLoading(false);
    }
  };

  const newMembers = eligibilityData.filter(u => u.isNew);
  const existingMembers = eligibilityData.filter(u => !u.isNew);

  if (loading) return <div>Loading promotions...</div>;

  return (
    <div className={styles.container} data-theme={darkMode ? 'dark' : 'light'}>
      <div className={styles.header}>
        <h1>Promotion Eligibility</h1>
        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.btn} ${styles['btnPrimary']}`}
            onClick={handleReviewForThisWeek}
            disabled={reviewLoading || loading}
          >
            {reviewLoading ? 'Reviewing...' : 'Review for This Week'}
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles['btnSecondary']}`}
            onClick={handleProcessPromotions}
            disabled={processingLoading || loading}
          >
            {processingLoading ? 'Processing...' : 'Process Promotions'}
          </button>
        </div>
      </div>

      <div className={styles['promotionTableWrapper']}>
        <table className={styles['promotionTable']}>
          <thead>
            <tr>
              <th style={{ width: '15%' }}>Existing/New</th>
              <th>Reviewer</th>
              <th>Weekly Requirements</th>
              <th>Required PRs</th>
              <th>Total Reviews</th>
              <th>Remaining Weeks</th>
              <th>Promote?</th>
            </tr>
          </thead>
          <tbody>
            <MemberSection
              title="New Members"
              members={newMembers}
              onPromoteChange={handlePromoteChange}
              styles={styles}
            />
            <MemberSection
              title="Existing Members"
              members={existingMembers}
              onPromoteChange={handlePromoteChange}
              styles={styles}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PromotionTable;
