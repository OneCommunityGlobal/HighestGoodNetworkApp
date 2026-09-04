import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FaCheck } from 'react-icons/fa';
import {
  getPromotionEligibility,
  postPromotionEligibility,
  previewPromotionEligibility,
  processPromotions,
  fetchReviewerGroups,
  createReviewerGroup,
  updateReviewerGroup,
} from '../../actions/promotionActions';
import styles from './PromotionEligibility.module.css';
import PRGradingModal from './PRGradingModal';
import { useSelector } from 'react-redux';

function PromotionEligibility({ currentUser }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewers, setReviewers] = useState([]);

  // Kept for UI testing.
  // Remove the hard-coded ID when backend data is ready.
  const [selectedForPromotion, setSelectedForPromotion] = useState(
    new Set(['63bcd4e94de851e04263a5b9']),
  );

  const [processing, setProcessing] = useState(false);

  const [selectGroup, setSelectedGroup] = useState('new');

  const isOwner = true;

  const [showReviewDropdown, setShowReviewDropdown] = useState(false);
  const [showManageOptions, setShowManageOptions] = useState(false);
  const [reviewOptions, setReviewOptions] = useState([]);
  const [loadingReviewOptions, setLoadingReviewOptions] = useState(false);

  const [newOption, setNewOption] = useState({
    label: '',
    rangeStart: '',
    rangeEnd: '',
  });

  const [editOption, setEditOption] = useState({
    label: '',
    rangeStart: '',
    rangeEnd: '',
  });

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReviewGroup, setSelectedReviewGroup] = useState(null);
  const [reviewersForModal, setReviewersForModal] = useState([]);

  const [showEditOption, setShowEditOption] = useState(false);
  const [showAddOption, setShowAddOption] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [promotionPreview, setPromotionPreview] = useState([]);

  const darkMode = useSelector(state => state.theme.darkMode);

  /*
   * Load promotion eligibility data
   */
  useEffect(() => {
    const loadPromotionEligibility = async () => {
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
      } catch (e) {
        const msg = 'Failed to load Reviewers.';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    loadPromotionEligibility();
  }, []);

  /*
   * Load reviewer groups
   */
  useEffect(() => {
    const loadReviewerGroups = async () => {
      try {
        setLoadingReviewOptions(true);

        const data = await fetchReviewerGroups();

        const groups = [...(data.groups || [])].sort((a, b) => a.sortOrder - b.sortOrder);

        setReviewOptions(groups);
      } catch (error) {
        console.error('Failed to fetch reviewer groups:', error);
        toast.error('Unable to load review groups.');
      } finally {
        setLoadingReviewOptions(false);
      }
    };

    loadReviewerGroups();
  }, []);

  const newMembers = reviewers.filter(r => r.isNewMember);
  const existingMembers = reviewers.filter(r => !r.isNewMember);

  const filteredMembers = selectGroup === 'new' ? newMembers : existingMembers;

  /*
   * Select/deselect reviewer for promotion
   */
  const toggleSelectPromotion = id => {
    setSelectedForPromotion(prev => {
      const newSet = new Set(prev);

      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }

      return newSet;
    });
  };

  /*
   * Process promotions
   */
  const handleProcessPromotions = async () => {
    if (selectedForPromotion.size === 0) {
      toast.info('No reviewers selected for promotion.');
      return;
    }

    setProcessing(true);

    try {
      const selectedIds = Array.from(selectedForPromotion);

      const selectedReviewers = reviewers.filter(reviewer => selectedIds.includes(reviewer.id));

      const ineligible = selectedReviewers.filter(reviewer => !reviewer.promoteEligible);

      const eligible = selectedReviewers.filter(reviewer => reviewer.promoteEligible);

      if (ineligible.length > 0) {
        toast.warn(
          `The following users are not eligible and were skipped: ${ineligible
            .map(reviewer => reviewer.reviewerName)
            .join(', ')}`,
        );
      }

      if (eligible.length === 0) {
        toast.info('No eligible reviewers to promote.');
        return;
      }

      const eligibleIds = eligible.map(reviewer => reviewer.id);

      /*
       * Ask backend where each reviewer should be placed.
       * This does NOT promote anyone.
       */
      const response = await previewPromotionEligibility(eligibleIds, currentUser);
      console.log(response);
      const placements = response.placements || [];

      setPromotionPreview(placements);
      setShowPromotionModal(true);
    } catch (err) {
      console.error('Failed to preview promotions:', err);
      toast.error('Failed to prepare promotion preview.');
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmPromotions = async () => {
    if (promotionPreview.length === 0) {
      toast.error('No promotion information available.');
      return;
    }

    setProcessing(true);

    try {
      const memberIds = promotionPreview.map(item => item.reviewerId);

      const placements = promotionPreview.map(item => ({
        reviewerId: item.reviewerId,
        teamId: item.teamId || null,
      }));

      await processPromotions(memberIds, currentUser, placements);

      toast.success(`Successfully promoted ${memberIds.length} reviewer(s).`);

      /*
       * Do NOT remove promoted users from reviewers.
       */
      setReviewers(prev =>
        prev.map(reviewer =>
          memberIds.includes(reviewer.id)
            ? {
                ...reviewer,
                isPromoted: true,
              }
            : reviewer,
        ),
      );

      setSelectedForPromotion(new Set());
      setPromotionPreview([]);
      setShowPromotionModal(false);
    } catch (err) {
      console.error('Failed to process promotions:', err);
      toast.error('Failed to process promotions.');
    } finally {
      setProcessing(false);
    }
  };

  /*
   * Render reviewer table row
   */
  const renderRow = ({
    id,
    reviewerName,
    weeklyRequirementsMet,
    requiredPRs,
    totalReviews,
    remainingWeeks,
    promoteEligible,
  }) => {
    const isSelected = selectedForPromotion.has(id);

    return (
      <tr key={id}>
        <td data-label="Reviewer Name">{reviewerName}</td>

        <td
          data-label="Weekly Requirements"
          className={weeklyRequirementsMet ? styles.status_met : styles.status_not_met}
        >
          {weeklyRequirementsMet ? '✓ Has Met' : '✗ Has not Met'}
        </td>

        <td data-label="Required PRs">{requiredPRs}</td>

        <td data-label="Total Reviews Done">{totalReviews}</td>

        <td data-label="Remaining Weeks">{remainingWeeks}</td>

        <td data-label="Promote?">
          <button
            type="button"
            role="checkbox"
            aria-checked={isSelected}
            aria-label={
              promoteEligible
                ? `${isSelected ? 'Deselect' : 'Select'} ${reviewerName} for promotion`
                : `${reviewerName} is not eligible for promotion`
            }
            disabled={!promoteEligible || processing}
            onClick={() => toggleSelectPromotion(id)}
            className={`${styles.custom_circular_checkbox_wrapper} ${
              !promoteEligible || processing ? styles.disabled : ''
            }`}
          >
            <span
              className={`${styles.custom_circular_checkbox} ${isSelected ? styles.checked : ''}`}
              aria-hidden="true"
            >
              {isSelected && <FaCheck className={styles.check_icon} aria-hidden="true" />}
            </span>
          </button>
        </td>
      </tr>
    );
  };

  /*
   * Map promotion eligibility reviewer data into the format
   * expected by PRGradingModal / PRGradingScreen.
   */
  const mapReviewerForGrading = reviewer => ({
    id: reviewer.id || reviewer.reviewerId,
    reviewer: reviewer.reviewerName || reviewer.reviewer || '',
    reviewerName: reviewer.reviewerName || reviewer.reviewer || '',
    role: reviewer.role || '',
    prsNeeded: reviewer.prsNeeded ?? reviewer.requiredPRs ?? 0,
    prsNeededOverride: reviewer.prsNeededOverride ?? null,
    committedHours: Number(reviewer.committedHours ?? reviewer.pledgedHours ?? 0),
    history: reviewer.history || [],
    gradedPrs: reviewer.gradedPrs || [],
  });

  /*
   * Get reviewers belonging to selected review group.
   */
  const getReviewersForGroup = group => {
    if (!group || group.key === 'all') {
      return reviewers.map(mapReviewerForGrading);
    }

    const start = group.rangeStart?.trim().toUpperCase();
    const end = group.rangeEnd?.trim().toUpperCase();

    if (!start || !end) {
      return [];
    }

    return reviewers
      .filter(reviewer => {
        const reviewerName = reviewer.reviewerName || reviewer.reviewer || '';

        const firstName = reviewerName.trim().split(/\s+/)[0];

        if (!firstName) {
          return false;
        }

        const firstLetter = firstName[0].toUpperCase();

        return firstLetter >= start && firstLetter <= end;
      })
      .map(mapReviewerForGrading);
  };

  /*
   * Select Review for This Week option
   */
  const handleReviewOptionSelect = option => {
    const filteredReviewers = getReviewersForGroup(option);

    setSelectedReviewGroup(option);
    setReviewersForModal(filteredReviewers);
    setShowReviewDropdown(false);
    setShowReviewModal(true);
  };

  /*
   * Open Edit modal
   */
  const handleEditClick = option => {
    setSelectedOption(option);

    setEditOption({
      label: option.label || '',
      rangeStart: option.rangeStart || '',
      rangeEnd: option.rangeEnd || '',
    });

    setShowManageOptions(false);
    setShowEditOption(true);
  };

  /*
   * Update reviewer group
   */
  const handleUpdateOption = async () => {
    if (!selectedOption) {
      return;
    }

    if (!editOption.label.trim()) {
      toast.error('Please enter a name.');
      return;
    }

    if (!editOption.rangeStart || !editOption.rangeEnd) {
      toast.error('Please enter both range values.');
      return;
    }

    try {
      const response = await updateReviewerGroup(selectedOption.key, editOption);

      const updatedGroup = response.group || response;

      setReviewOptions(prev =>
        prev
          .map(option => (option.key === selectedOption.key ? updatedGroup : option))
          .sort((a, b) => a.sortOrder - b.sortOrder),
      );

      setShowEditOption(false);
      setSelectedOption(null);

      setEditOption({
        label: '',
        rangeStart: '',
        rangeEnd: '',
      });

      toast.success('Review option updated successfully.');
    } catch (error) {
      console.error('Failed to update review option:', error);
      toast.error('Unable to update review option.');
    }
  };

  /*
   * Add reviewer group
   */
  const handleAddOption = async () => {
    if (!newOption.label.trim()) {
      toast.error('Please enter a name.');
      return;
    }

    if (!newOption.rangeStart || !newOption.rangeEnd) {
      toast.error('Please enter both range values.');
      return;
    }

    try {
      const response = await createReviewerGroup(newOption);

      const createdGroup = response.group || response;

      setReviewOptions(prev => [...prev, createdGroup].sort((a, b) => a.sortOrder - b.sortOrder));

      setNewOption({
        label: '',
        rangeStart: '',
        rangeEnd: '',
      });

      setShowAddOption(false);

      toast.success('Review option added successfully.');
    } catch (error) {
      console.error('Failed to add review option:', error);
      toast.error('Unable to add review option.');
    }
  };

  /*
   * Close Edit modal
   */
  const handleCloseEditOption = () => {
    setShowEditOption(false);
    setSelectedOption(null);

    setEditOption({
      label: '',
      rangeStart: '',
      rangeEnd: '',
    });
  };

  /*
   * Close Add modal
   */
  const handleCloseAddOption = () => {
    setShowAddOption(false);

    setNewOption({
      label: '',
      rangeStart: '',
      rangeEnd: '',
    });
  };

  return (
    <>
      <div className={`${styles.pageWrapper} ${darkMode ? styles.dark : ''}`}>
        <div className={`${styles.promo_table_container} ${darkMode ? styles.dark : ''}`}>
          <div className={styles.promo_table_header}>
            <h1 className={styles.pageTitle}>Promotion Eligibility</h1>

            <div className={styles.headerActions}>
              <label htmlFor="member-group" className={styles.srOnly}>
                Select member group
              </label>

              <select
                id="member-group"
                className={`${styles.selectGroup} ${darkMode ? styles.dark : ''}`}
                value={selectGroup}
                onChange={e => setSelectedGroup(e.target.value)}
                aria-label="Select member group"
              >
                <option value="new">New Member</option>
                <option value="existing">Existing Member</option>
              </select>

              {/* Review dropdown */}
              <div className={styles.review_dropdown}>
                <button
                  type="button"
                  onClick={() => setShowReviewDropdown(prev => !prev)}
                  disabled={processing || loadingReviewOptions}
                  className={styles.review_btn}
                  aria-haspopup="menu"
                  aria-expanded={showReviewDropdown}
                  aria-controls="review-options-menu"
                >
                  {loadingReviewOptions ? 'Loading Review Options...' : 'Review for This Week'}
                </button>

                {showReviewDropdown && (
                  <div
                    id="review-options-menu"
                    className={styles.dropdown_menu}
                    role="menu"
                    aria-label="Review options"
                  >
                    {reviewOptions.map(option => (
                      <button
                        key={option._id || option.key}
                        type="button"
                        role="menuitem"
                        className={styles.dropdown_item}
                        onClick={() => handleReviewOptionSelect(option)}
                      >
                        {option.label}
                      </button>
                    ))}

                    {isOwner && (
                      <>
                        <div className={styles.dropdown_divider} role="separator" />

                        <button
                          type="button"
                          className={styles.manage_options}
                          onClick={() => {
                            setShowReviewDropdown(false);
                            setShowManageOptions(true);
                          }}
                        >
                          Manage Review Options
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Manage Review Options Modal */}
              {showManageOptions && (
                <div className={styles.modal_overlay}>
                  <div
                    className={styles.modal}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="manage-review-options-title"
                  >
                    <h2 id="manage-review-options-title">Manage Review Options</h2>

                    <div className={styles.options_list}>
                      {[...reviewOptions]
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map(option => (
                          <div key={option._id || option.key} className={styles.option_row}>
                            <div>
                              <strong>{option.label}</strong>

                              <span className={styles.option_range}>
                                {option.rangeStart && option.rangeEnd
                                  ? `${option.rangeStart} - ${option.rangeEnd}`
                                  : 'All Members'}
                              </span>
                            </div>

                            {option.editable && (
                              <button
                                type="button"
                                onClick={() => handleEditClick(option)}
                                className={styles.modal_secondary_btn}
                              >
                                Edit
                              </button>
                            )}
                          </div>
                        ))}
                    </div>

                    <button
                      type="button"
                      className={styles.add_option_btn}
                      onClick={() => {
                        setShowManageOptions(false);

                        setNewOption({
                          label: '',
                          rangeStart: '',
                          rangeEnd: '',
                        });

                        setShowAddOption(true);
                      }}
                    >
                      + Add Option
                    </button>

                    <div className={styles.modal_actions}>
                      <button type="button" onClick={() => setShowManageOptions(false)}>
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Edit Review Option Modal */}
              {showEditOption && selectedOption && (
                <div className={styles.modal_overlay}>
                  <div
                    className={styles.modal}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="edit-review-option-title"
                  >
                    <h2 id="edit-review-option-title">Edit Review Option</h2>

                    <label htmlFor="edit-review-label">Name</label>

                    <input
                      id="edit-review-label"
                      type="text"
                      value={editOption.label}
                      onChange={e =>
                        setEditOption(prev => ({
                          ...prev,
                          label: e.target.value,
                        }))
                      }
                    />

                    <label htmlFor="edit-review-range-start">Range Start</label>

                    <input
                      id="edit-review-range-start"
                      type="text"
                      value={editOption.rangeStart}
                      maxLength={1}
                      onChange={e =>
                        setEditOption(prev => ({
                          ...prev,
                          rangeStart: e.target.value.toUpperCase(),
                        }))
                      }
                    />

                    <label htmlFor="edit-review-range-end">Range End</label>

                    <input
                      id="edit-review-range-end"
                      type="text"
                      value={editOption.rangeEnd}
                      maxLength={1}
                      onChange={e =>
                        setEditOption(prev => ({
                          ...prev,
                          rangeEnd: e.target.value.toUpperCase(),
                        }))
                      }
                    />

                    <div className={styles.modal_actions}>
                      <button type="button" className={styles.save} onClick={handleUpdateOption}>
                        Save
                      </button>

                      <button
                        type="button"
                        className={styles.cancel}
                        onClick={handleCloseEditOption}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Add Review Option Modal */}
              {showAddOption && (
                <div className={styles.modal_overlay}>
                  <div
                    className={styles.modal}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="add-review-option-title"
                  >
                    <h2 id="add-review-option-title">Add Review Option</h2>

                    <label htmlFor="new-review-label">Name</label>

                    <input
                      id="new-review-label"
                      type="text"
                      value={newOption.label}
                      onChange={e =>
                        setNewOption(prev => ({
                          ...prev,
                          label: e.target.value,
                        }))
                      }
                    />

                    <label htmlFor="new-review-range-start">Range Start</label>

                    <input
                      id="new-review-range-start"
                      type="text"
                      value={newOption.rangeStart}
                      maxLength={1}
                      onChange={e =>
                        setNewOption(prev => ({
                          ...prev,
                          rangeStart: e.target.value.toUpperCase(),
                        }))
                      }
                    />

                    <label htmlFor="new-review-range-end">Range End</label>

                    <input
                      id="new-review-range-end"
                      type="text"
                      value={newOption.rangeEnd}
                      maxLength={1}
                      onChange={e =>
                        setNewOption(prev => ({
                          ...prev,
                          rangeEnd: e.target.value.toUpperCase(),
                        }))
                      }
                    />

                    <div className={styles.modal_actions}>
                      <button type="button" onClick={handleAddOption}>
                        Add
                      </button>

                      <button type="button" onClick={handleCloseAddOption}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Process Promotions */}
              <button
                type="button"
                onClick={handleProcessPromotions}
                disabled={processing}
                className={styles.process_promo_btn}
              >
                {processing ? 'Processing...' : 'Process Promotions'}
              </button>
            </div>
          </div>

          {/* Promotion Eligibility Table */}
          <div className={styles.tableWrapper}>
            <table className={styles.promo_table} aria-label="Promotion eligibility">
              <thead>
                <tr>
                  <th scope="col">Reviewer Name</th>
                  <th scope="col">Weekly Requirements</th>
                  <th scope="col">Required PRs</th>
                  <th scope="col">Total Reviews Done</th>
                  <th scope="col">Remaining Weeks</th>
                  <th scope="col">Promote?</th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="6" className={styles.table_message}>
                      Loading...
                    </td>
                  </tr>
                )}

                {!loading && error && (
                  <tr>
                    <td colSpan="6" className={`${styles.table_message} ${styles.error_message}`}>
                      {error}
                    </td>
                  </tr>
                )}

                {!loading && !error && reviewers.length === 0 && (
                  <tr>
                    <td colSpan="6" className={styles.table_message}>
                      No reviewers found.
                    </td>
                  </tr>
                )}

                {!loading && !error && (
                  <>{filteredMembers.length > 0 && filteredMembers.map(renderRow)}</>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* PR Grading Modal */}
      <PRGradingModal
        isOpen={showReviewModal}
        reviewGroup={selectedReviewGroup}
        reviewers={reviewersForModal}
        darkMode={darkMode}
        teamData={{
          teamName: selectedReviewGroup?.label || 'Reviewers',
          dateRange: {
            start: '',
            end: '',
          },
        }}
        onClose={() => {
          setShowReviewModal(false);
          setSelectedReviewGroup(null);
          setReviewersForModal([]);
        }}
      />

      {/* Promotion Confirmation Modal */}
      {showPromotionModal && (
        <div className={styles.modal_overlay}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="promotion-confirmation-title"
          >
            <h2 id="promotion-confirmation-title">Confirm Promotions</h2>

            <p>Review the proposed team assignments before processing the promotions.</p>

            {promotionPreview.some(item => item.needsReview) && (
              <div className={styles.promotion_warning} role="alert">
                Some reviewers could not be matched exactly to their standup availability. Please
                review those assignments.
              </div>
            )}

            <div className={styles.promotion_preview}>
              {promotionPreview.map(item => (
                <div key={item.reviewerId} className={styles.promotion_preview_row}>
                  <div className={styles.promotion_reviewer}>
                    <strong>{item.reviewerName}</strong>

                    <span>{item.committedHours} hours/week</span>

                    {item.band && <span>Required band: {item.band}</span>}
                  </div>

                  <div className={styles.promotion_team}>
                    <strong>{item.teamName || 'No team assigned'}</strong>

                    {item.standupDay && item.standupTime && (
                      <span>
                        Standup: {item.standupDay} at {item.standupTime}
                      </span>
                    )}

                    <span>Reason: {item.reason || 'No reason provided'}</span>

                    {item.needsReview && <span className={styles.needs_review}>Needs Review</span>}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.modal_actions}>
              <button type="button" onClick={handleConfirmPromotions} disabled={processing}>
                {processing ? 'Processing...' : 'Confirm Promotions'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowPromotionModal(false);
                  setPromotionPreview([]);
                }}
                disabled={processing}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PromotionEligibility;
