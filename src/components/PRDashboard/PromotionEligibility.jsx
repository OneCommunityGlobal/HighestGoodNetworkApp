import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FaCheck } from 'react-icons/fa';
import { getPromotionEligibility, postPromotionEligibility } from 'actions/promotionActions';
import './PromotionEligibility.css';

function PromotionEligibility({ currentUser }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewers, setReviewers] = useState([]);

  const [selectedForPromotion, setSelectedForPromotion] = useState(new Set());
  const [processing, setProcessing] = useState(false);

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
      await postPromotionEligibility(Array.from(selectedForPromotion), currentUser);
      toast.success(`Successfully processed promotions for ${selectedForPromotion.size} user(s).`);

      setReviewers(prev => prev.filter(r => !selectedForPromotion.has(r.id)));
      setSelectedForPromotion(new Set());
    } catch (err) {
      const msg = 'Failed to process promotions.';
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="promo-table-container">
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
                  <tr className="section-row">
                    <td colSpan="6">New Members</td>
                  </tr>
                  {newMembers.map(
                    ({
                      id,
                      reviewerName,
                      weeklyRequirementsMet,
                      requiredPRs,
                      totalReviews,
                      remainingWeeks,
                      promoteEligible,
                    }) => (
                      <tr key={id}>
                        <td>{reviewerName}</td>
                        <td>{weeklyRequirementsMet ? '✔️' : '❌'}</td>
                        <td>{requiredPRs}</td>
                        <td>{totalReviews}</td>
                        <td>{remainingWeeks}</td>
                        <td>
                          <div
                            role="checkbox"
                            tabIndex={promoteEligible ? 0 : -1}
                            aria-checked={selectedForPromotion.has(id)}
                            onClick={() =>
                              promoteEligible && !processing && toggleSelectPromotion(id)
                            }
                            onKeyDown={e => {
                              if (
                                (e.key === 'Enter' || e.key === ' ') &&
                                promoteEligible &&
                                !processing
                              ) {
                                e.preventDefault();
                                toggleSelectPromotion(id);
                              }
                            }}
                            className={`custom-circular-checkbox-wrapper ${
                              !promoteEligible || processing ? 'disabled' : ''
                            }`}
                            style={{
                              cursor: promoteEligible && !processing ? 'pointer' : 'not-allowed',
                            }}
                          >
                            <div
                              className={`custom-circular-checkbox ${
                                selectedForPromotion.has(id) ? 'checked' : ''
                              }`}
                            >
                              {selectedForPromotion.has(id) && <FaCheck className="check-icon" />}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                </>
              )}

              {existingMembers.length > 0 && (
                <>
                  <tr className="section-row">
                    <td colSpan="6">Existing Members</td>
                  </tr>
                  {existingMembers.map(
                    ({
                      id,
                      reviewerName,
                      weeklyRequirementsMet,
                      requiredPRs,
                      totalReviews,
                      remainingWeeks,
                      promoteEligible,
                    }) => (
                      <tr key={id}>
                        <td>{reviewerName}</td>
                        <td>{weeklyRequirementsMet ? '✔️' : '❌'}</td>
                        <td>{requiredPRs}</td>
                        <td>{totalReviews}</td>
                        <td>{remainingWeeks}</td>
                        <td>
                          <div
                            role="checkbox"
                            tabIndex={promoteEligible ? 0 : -1}
                            aria-checked={selectedForPromotion.has(id)}
                            onClick={() =>
                              promoteEligible && !processing && toggleSelectPromotion(id)
                            }
                            onKeyDown={e => {
                              if (
                                (e.key === 'Enter' || e.key === ' ') &&
                                promoteEligible &&
                                !processing
                              ) {
                                e.preventDefault();
                                toggleSelectPromotion(id);
                              }
                            }}
                            className={`custom-circular-checkbox-wrapper ${
                              !promoteEligible || processing ? 'disabled' : ''
                            }`}
                            style={{
                              cursor: promoteEligible && !processing ? 'pointer' : 'not-allowed',
                            }}
                          >
                            <div
                              className={`custom-circular-checkbox ${
                                selectedForPromotion.has(id) ? 'checked' : ''
                              }`}
                            >
                              {selectedForPromotion.has(id) && <FaCheck className="check-icon" />}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                </>
              )}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default PromotionEligibility;
