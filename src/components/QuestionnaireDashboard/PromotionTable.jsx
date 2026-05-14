import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import styles from './PromotionTable.module.css';

const AUTHORIZED_ROLES = ['Administrator', 'Owner'];
const STORAGE_KEY = 'promotionTableSelections';

const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Edward', 'Fiona', 'Grace'];

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const dummyMembers = Array.from({ length: 45 }, (_, i) => ({
  id: i + 1,
  reviewer: names[i % names.length],
  hasMetWeekly: i % 2 === 0,
  requiredPRs: 5,
  totalReviews: Math.floor(seededRandom(i) * 10),
  remainingWeeks: Math.max(0, 4 - Math.floor(seededRandom(i + 1) * 4)),
  promoteEligible: Math.max(0, 4 - Math.floor(seededRandom(i + 1) * 4)) <= 0,
  isNew: i < 15,
}));

function MemberSection({
  title,
  members,
  styles,
  selectedForPromotion,
  onTogglePromotion,
  canModify,
}) {
  return (
    <>
      <tr className={styles['sectionHeader']}>
        <td colSpan="7">{title}</td>
      </tr>
      {members.map(user => {
        const isDisabled = !canModify;
        return (
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
                checked={selectedForPromotion.has(user.id)}
                onChange={() => onTogglePromotion(user.id)}
                disabled={isDisabled}
                title={!canModify ? 'Only Administrators and Owners can modify selections' : ''}
              />
            </td>
          </tr>
        );
      })}
    </>
  );
}

// Load persisted selections from localStorage
function loadPersistedSelections() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return new Set(parsed);
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to load persisted selections:', e);
  }
  return new Set();
}

// Save selections to localStorage
function saveSelectionsToStorage(selections) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(selections)));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to save selections:', e);
  }
}

function PromotionTable() {
  const [eligibilityData, setEligibilityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedForPromotion, setSelectedForPromotion] = useState(() => loadPersistedSelections());
  const [processing, setProcessing] = useState(false);

  const darkMode = useSelector(state => state.theme.darkMode);
  const authUser = useSelector(state => state.auth.user);

  const userRole = authUser?.role || '';
  const canModifyPromotion = AUTHORIZED_ROLES.includes(userRole);

  useEffect(() => {
    setLoading(true);
    // Simulate loading with dummy data
    const timer = setTimeout(() => {
      setEligibilityData(dummyMembers);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const toggleSelectPromotion = useCallback(
    id => {
      if (!canModifyPromotion) {
        toast.warning('Only Administrators and Owners can modify promotion selections.');
        return;
      }

      setSelectedForPromotion(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        saveSelectionsToStorage(newSet);
        return newSet;
      });

      toast.success('Changes saved successfully.');
    },
    [canModifyPromotion],
  );

  const handleProcessPromotions = useCallback(async () => {
    if (!canModifyPromotion) {
      toast.warning('Only Administrators and Owners can process promotions.');
      return;
    }

    if (selectedForPromotion.size === 0) {
      toast.info('No reviewers selected for promotion.');
      return;
    }

    setProcessing(true);

    // Simulate processing
    setTimeout(() => {
      const selectedIds = Array.from(selectedForPromotion);
      const selectedReviewers = eligibilityData.filter(r => selectedIds.includes(r.id));

      const ineligible = selectedReviewers.filter(r => !r.promoteEligible);
      const eligible = selectedReviewers.filter(r => r.promoteEligible);

      if (ineligible.length > 0) {
        toast.warn(
          `The following users are not eligible and were skipped: ${ineligible
            .map(r => r.reviewer)
            .join(', ')}`,
        );
      }

      if (eligible.length === 0) {
        toast.info('No eligible reviewers to promote.');
        setProcessing(false);
        return;
      }

      toast.success(`Successfully promoted ${eligible.length} reviewer(s).`);

      // Remove promoted reviewers from list
      const promotedIds = eligible.map(e => e.id);
      setEligibilityData(prev => prev.filter(r => !promotedIds.includes(r.id)));

      // Clear selections for promoted users
      const newSelections = new Set(selectedForPromotion);
      promotedIds.forEach(id => newSelections.delete(id));
      setSelectedForPromotion(newSelections);

      setProcessing(false);
    }, 1000);
  }, [canModifyPromotion, selectedForPromotion, eligibilityData]);

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
            onClick={() => toast.info('Review for this week clicked. Logic not implemented yet.')}
            disabled={processing || !canModifyPromotion}
            title={
              !canModifyPromotion ? 'Only Administrators and Owners can perform this action' : ''
            }
          >
            Review for This Week
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles['btnSecondary']}`}
            onClick={handleProcessPromotions}
            disabled={processing || !canModifyPromotion}
            title={
              !canModifyPromotion ? 'Only Administrators and Owners can process promotions' : ''
            }
          >
            {processing ? 'Processing...' : 'Process Promotions'}
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
                styles={styles}
                selectedForPromotion={selectedForPromotion}
                onTogglePromotion={toggleSelectPromotion}
                canModify={canModifyPromotion}
              />
            )}
            {existingMembers.length > 0 && (
              <MemberSection
                title="Existing Members"
                members={existingMembers}
                styles={styles}
                selectedForPromotion={selectedForPromotion}
                onTogglePromotion={toggleSelectPromotion}
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
