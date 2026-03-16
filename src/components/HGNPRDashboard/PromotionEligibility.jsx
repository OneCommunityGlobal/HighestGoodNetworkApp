import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { FaCheck } from 'react-icons/fa';
import styles from './PromotionEligibility.module.css';
import { useSelector } from 'react-redux';

const AUTHORIZED_ROLES = ['Administrator', 'Owner'];
const STORAGE_KEY = 'promotionEligibilitySelections';

const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Edward', 'Fiona', 'Grace'];

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const dummyReviewers = Array.from({ length: 45 }, (_, i) => ({
  id: i + 1,
  reviewerName: names[i % names.length],
  weeklyRequirementsMet: i % 2 === 0,
  requiredPRs: 5,
  totalReviews: Math.floor(seededRandom(i) * 10),
  remainingWeeks: Math.max(0, 4 - Math.floor(seededRandom(i + 1) * 4)),
  promoteEligible: Math.max(0, 4 - Math.floor(seededRandom(i + 1) * 4)) <= 0,
  isNewMember: i < 15,
}));

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

function PromotionEligibility() {
  const [loading, setLoading] = useState(true);
  const [reviewers, setReviewers] = useState([]);

  const [selectedForPromotion, setSelectedForPromotion] = useState(() => loadPersistedSelections());
  const [processing, setProcessing] = useState(false);

  const [showNew, setShowNew] = useState(true);
  const [showExisting, setShowExisting] = useState(true);

  const darkMode = useSelector(state => state.theme.darkMode);
  const authUser = useSelector(state => state.auth.user);

  const userRole = authUser?.role || '';
  const canModifyPromotion = AUTHORIZED_ROLES.includes(userRole);

  useEffect(() => {
    // Simulate loading with dummy data
    const timer = setTimeout(() => {
      setReviewers(dummyReviewers);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const newMembers = reviewers.filter(r => r.isNewMember);
  const existingMembers = reviewers.filter(r => !r.isNewMember);

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

  const handleProcessPromotions = () => {
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
      const selectedReviewers = reviewers.filter(r => selectedIds.includes(r.id));

      const ineligible = selectedReviewers.filter(r => !r.promoteEligible);
      const eligible = selectedReviewers.filter(r => r.promoteEligible);

      if (ineligible.length > 0) {
        toast.warn(
          `The following users are not eligible and were skipped: ${ineligible
            .map(r => r.reviewerName)
            .join(', ')}`,
        );
      }

      if (eligible.length === 0) {
        toast.info('No eligible reviewers to promote.');
        setProcessing(false);
        return;
      }

      toast.success(`Successfully promoted ${eligible.length} reviewer(s).`);

      // Remove promoted reviewers from list and clear their selections
      const promotedIds = eligible.map(e => e.id);
      setReviewers(prev => prev.filter(r => !promotedIds.includes(r.id)));

      const newSelections = new Set(selectedForPromotion);
      promotedIds.forEach(id => newSelections.delete(id));
      setSelectedForPromotion(newSelections);

      setProcessing(false);
    }, 1000);
  };

  const renderRow = ({
    id,
    reviewerName,
    weeklyRequirementsMet,
    requiredPRs,
    totalReviews,
    remainingWeeks,
  }) => {
    const isDisabled = processing || !canModifyPromotion;

    return (
      <tr key={id}>
        <td data-label="Reviewer Name">{reviewerName}</td>
        <td
          data-label="Weekly Requirements"
          className={weeklyRequirementsMet ? styles['status-met'] : styles['status-not-met']}
        >
          {weeklyRequirementsMet ? '✓ Has Met' : '✗ Has not Met'}
        </td>
        <td data-label="Required PRs">{requiredPRs}</td>
        <td data-label="Total Reviews Done">{totalReviews}</td>
        <td data-label="Remaining Weeks">{remainingWeeks}</td>
        <td data-label="Promote?">
          <div
            role="checkbox"
            tabIndex={!isDisabled ? 0 : -1}
            aria-checked={selectedForPromotion.has(id)}
            aria-disabled={isDisabled}
            onClick={() => !isDisabled && toggleSelectPromotion(id)}
            onKeyDown={e => {
              if ((e.key === 'Enter' || e.key === ' ') && !isDisabled) {
                e.preventDefault();
                toggleSelectPromotion(id);
              }
            }}
            className={`${styles['custom-circular-checkbox-wrapper']} ${
              isDisabled ? styles.disabled : ''
            }`}
            style={{
              cursor: !isDisabled ? 'pointer' : 'not-allowed',
            }}
            title={
              !canModifyPromotion ? 'Only Administrators and Owners can modify selections' : ''
            }
          >
            <div
              className={`${styles['custom-circular-checkbox']} ${
                selectedForPromotion.has(id) ? styles.checked : ''
              }`}
            >
              {selectedForPromotion.has(id) && <FaCheck className={styles['check-icon']} />}
            </div>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className={`${styles['page-wrapper']} ${darkMode ? styles.dark : ''}`}>
      <div className={`${styles['promo-table-container']} ${darkMode ? styles.dark : ''}`}>
        <div className={styles['promo-table-header']}>
          Promotion Eligibility
          <div>
            <button
              type="button"
              onClick={() => toast.info('Review Weekly clicked. Logic not implemented yet.')}
              disabled={processing || !canModifyPromotion}
              className={styles['review-btn']}
              title={
                !canModifyPromotion ? 'Only Administrators and Owners can perform this action' : ''
              }
            >
              Review for this week
            </button>
            <button
              type="button"
              onClick={handleProcessPromotions}
              disabled={processing || !canModifyPromotion}
              className={styles['process-promo-btn']}
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

        <table className={styles['promo-table']}>
          <thead>
            <tr>
              <th>Reviewer Name</th>
              <th>Weekly Requirements</th>
              <th>Required PRs</th>
              <th>Total Reviews Done</th>
              <th>Remaining Weeks</th>
              <th>Promote?</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>
                  Loading...
                </td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: 'red' }}>
                  {error}
                </td>
              </tr>
            )}

            {!loading && !error && reviewers.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>
                  No reviewers found.
                </td>
              </tr>
            )}

            {!loading && !error && (
              <>
                {newMembers.length > 0 && (
                  <>
                    <tr
                      className={styles['section-row']}
                      onClick={() => setShowNew(prev => !prev)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td colSpan="6">New Members {showNew ? '▲' : '▼'}</td>
                    </tr>
                    {showNew && newMembers.map(renderRow)}
                  </>
                )}

                {existingMembers.length > 0 && (
                  <>
                    <tr
                      className={styles['section-row']}
                      onClick={() => setShowExisting(prev => !prev)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td colSpan="6">Existing Members{showExisting ? '▲' : '▼'}</td>
                    </tr>
                    {showExisting && existingMembers.map(renderRow)}
                  </>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PromotionEligibility;
