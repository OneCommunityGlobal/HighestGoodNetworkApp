import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FaCheck } from 'react-icons/fa';
import { getPromotionEligibility, postPromotionEligibility } from '../../actions/promotionActions';
import './PromotionEligibility.module.css';
import { useSelector } from 'react-redux';

function PromotionEligibility({ currentUser }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewers, setReviewers] = useState([]);

  const [selectedForPromotion, setSelectedForPromotion] = useState(new Set());
  const [processing, setProcessing] = useState(false);

  const [showNew, setShowNew] = useState(true);
  const [showExisting, setShowExisting] = useState(true);

  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    (async () => {
      try {
        const data = await getPromotionEligibility();

        const mappedData = data.map(r => ({
          ...r,
          requiredPRs: r.requiredPRs ?? r.pledgedHours / 2,
          promoteEligible: r.remainingWeeks <= 0,
          id: r.reviewerId,
          reviewerName: r.reviewerName,
          isNewMember: r.isNewMember,
        }));

        setReviewers(mappedData);
        setLoading(false);
      } catch (e) {
        const msg = 'Failed to load Reviewers.';
        setError(msg);
        toast.error(msg);
        setLoading(false);
      }
    })();
  }, []);

  const newMembers = reviewers.filter(r => r.isNewMember);
  const existingMembers = reviewers.filter(r => !r.isNewMember);

  const toggleSelectPromotion = id => {
    setSelectedForPromotion(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleProcessPromotions = async () => {
    if (selectedForPromotion.size === 0) {
      toast.info('No reviewers selected for promotion.');
      return;
    }

    setProcessing(true);

    try {
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
        return;
      }

      await postPromotionEligibility(
        eligible.map(r => r.id),
        currentUser,
      );
      toast.success(`Successfully promoted ${eligible.length} reviewer(s).`);

      setReviewers(prev => prev.filter(r => !eligible.map(e => e.id).includes(r.id)));
      setSelectedForPromotion(new Set());
    } catch (err) {
      toast.error('Failed to process promotions.');
    } finally {
      setProcessing(false);
    }
  };

  const renderRow = ({
    id,
    reviewerName,
    weeklyRequirementsMet,
    requiredPRs,
    totalReviews,
    remainingWeeks,
    promoteEligible,
  }) => (
    <tr key={id}>
      <td data-label="Reviewer Name">{reviewerName}</td>
      <td
        data-label="Weekly Requirements"
        className={weeklyRequirementsMet ? 'status-met' : 'status-not-met'}
      >
        {weeklyRequirementsMet ? '✓ Has Met' : '✗ Has not Met'}
      </td>
      <td data-label="Required PRs">{requiredPRs}</td>
      <td data-label="Total Reviews Done">{totalReviews}</td>
      <td data-label="Remaining Weeks">{remainingWeeks}</td>
      <td data-label="Promote?">
        <div
          role="checkbox"
          tabIndex={promoteEligible ? 0 : -1}
          aria-checked={selectedForPromotion.has(id)}
          onClick={() => !processing && toggleSelectPromotion(id)}
          onKeyDown={e => {
            if ((e.key === 'Enter' || e.key === ' ') && !processing) {
              e.preventDefault();
              toggleSelectPromotion(id);
            }
          }}
          className={`custom-circular-checkbox-wrapper ${processing ? 'disabled' : ''}`}
          style={{
            cursor: !processing ? 'pointer' : 'not-allowed',
          }}
        >
          <div
            className={`custom-circular-checkbox ${selectedForPromotion.has(id) ? 'checked' : ''}`}
          >
            {selectedForPromotion.has(id) && <FaCheck className="check-icon" />}
          </div>
        </div>
      </td>
    </tr>
  );

  return (
    <div className={`page-wrapper ${darkMode ? 'dark' : ''}`}>
      <div className={`promo-table-container ${darkMode ? 'dark' : ''}`}>
        <div className="promo-table-header">
          Promotion Eligibility
          <div>
            <button
              type="button"
              onClick={() => toast.info('Review Weekly clicked. Logic not implemented yet.')}
              disabled={processing}
              className="review-btn"
            >
              Review for this week
            </button>
            <button
              type="button"
              onClick={handleProcessPromotions}
              disabled={processing}
              className="process-promo-btn"
            >
              {processing ? 'Processing...' : 'Process Promotions'}
            </button>
          </div>
        </div>

        <table className="promo-table">
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
                      className="section-row"
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
                      className="section-row"
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
