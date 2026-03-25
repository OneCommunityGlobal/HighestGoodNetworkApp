import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { getPromotionEligibility, postPromotionEligibility } from '../../actions/promotionActions';
import styles from './PromotionTable.module.css';

const AUTHORIZED_ROLES = ['Administrator', 'Owner'];

function MemberSection({ title, members, onPromoteChange, styles: sectionStyles, canModify }) {
  return (
    <>
      <tr className={sectionStyles['sectionHeader']}>
        <td colSpan="7">{title}</td>
      </tr>
      {members.map(user => {
        const isDisabled = !canModify;
        return (
          <tr key={user.id}>
            <td />
            <td>{user.reviewer}</td>
            <td
              className={
                user.hasMetWeekly
                  ? sectionStyles['statusMet']
                  : sectionStyles['statusNotMet']
              }
            >
              <span className={sectionStyles['statusIcon']}>
                {user.hasMetWeekly ? '✓' : '✗'}
              </span>
              {user.hasMetWeekly ? 'Has Met' : 'Has not Met'}
            </td>
            <td>{user.requiredPRs}</td>
            <td>{user.totalReviews}</td>
            <td>{user.remainingWeeks}</td>
            <td>
              <input
                className={sectionStyles['promoteCheckbox']}
                type="checkbox"
                checked={user.promote}
                onChange={() => onPromoteChange(user.id)}
                disabled={isDisabled}
                title={
                  !canModify
                    ? 'Only Administrators and Owners can modify selections'
                    : ''
                }
              />
            </td>
          </tr>
        );
      })}
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
  canModify: PropTypes.bool.isRequired,
};

function PromotionTable() {
  const [eligibilityData, setEligibilityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [processingLoading, setProcessingLoading] = useState(false);
  const darkMode = useSelector(state => state.theme.darkMode);
  const requestor = useSelector(state => state.auth.user);

  const userRole = requestor?.role || '';
  const canModifyPromotion = AUTHORIZED_ROLES.includes(userRole);

  const fetchEligibilityData = useCallback(async () => {
    const data = await getPromotionEligibility();
    setEligibilityData(data);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchEligibilityData()
      .catch(() => {
        toast.error('Failed to fetch promotion eligibility data.');
      })
      .finally(() => setLoading(false));
  }, [fetchEligibilityData]);

  const handlePromoteChange = useCallback(
    memberId => {
      if (!canModifyPromotion) {
        toast.warning('Only Administrators and Owners can modify promotion selections.');
        return;
      }
      setEligibilityData(prevData =>
        prevData.map(member =>
          member.id === memberId ? { ...member, promote: !member.promote } : member,
        ),
      );
    },
    [canModifyPromotion],
  );

  const handleReviewForThisWeek = async () => {
    if (!canModifyPromotion) {
      toast.warning('Only Administrators and Owners can perform this action.');
      return;
    }
    setReviewLoading(true);
    try {
      await fetchEligibilityData();
      toast.success('Weekly review initiated. Table data refreshed.');
    } catch {
      toast.error('Failed to initiate weekly review.');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleProcessPromotions = useCallback(async () => {
    if (!canModifyPromotion) {
      toast.warning('Only Administrators and Owners can process promotions.');
      return;
    }
    setProcessingLoading(true);
    try {
      const selectedMemberIds = eligibilityData.filter(m => m.promote).map(m => m.id);

      if (selectedMemberIds.length === 0) {
        toast.warning('No members selected for promotion.');
        setProcessingLoading(false);
        return;
      }

      await postPromotionEligibility(selectedMemberIds, requestor?.userid);
      await fetchEligibilityData();

      toast.success(`Promotions processed successfully for ${selectedMemberIds.length} member(s).`);
    } catch {
      toast.error('Failed to process promotions.');
    } finally {
      setProcessingLoading(false);
    }
  }, [canModifyPromotion, eligibilityData, requestor?.userid, fetchEligibilityData]);

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
            disabled={reviewLoading || loading || !canModifyPromotion}
            title={
              !canModifyPromotion
                ? 'Only Administrators and Owners can perform this action'
                : ''
            }
          >
            {reviewLoading ? 'Reviewing...' : 'Review for This Week'}
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles['btnSecondary']}`}
            onClick={handleProcessPromotions}
            disabled={processingLoading || loading || !canModifyPromotion}
            title={
              !canModifyPromotion
                ? 'Only Administrators and Owners can process promotions'
                : ''
            }
          >
            {processingLoading ? 'Processing...' : 'Process Promotions'}
          </button>
        </div>
      </div>

      {!canModifyPromotion && (
        <div
          style={{
            padding: '0.5rem 1rem',
            marginBottom: '0.5rem',
            backgroundColor: darkMode ? '#3b3b3b' : '#fef3cd',
            color: darkMode ? '#ffc107' : '#856404',
            borderRadius: '4px',
            fontSize: '0.9rem',
          }}
        >
          View-only mode: Only Administrators and Owners can modify promotion selections.
        </div>
      )}

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
            {newMembers.length > 0 && (
              <MemberSection
                title="New Members"
                members={newMembers}
                onPromoteChange={handlePromoteChange}
                styles={styles}
                canModify={canModifyPromotion}
              />
            )}
            {existingMembers.length > 0 && (
              <MemberSection
                title="Existing Members"
                members={existingMembers}
                onPromoteChange={handlePromoteChange}
                styles={styles}
                canModify={canModifyPromotion}
              />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PromotionTable;
