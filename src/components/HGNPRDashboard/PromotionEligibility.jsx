import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FaCheck } from 'react-icons/fa';
import {
  getPromotionEligibility,
  postPromotionEligibility,
  fetchReviewerGroups,
} from '../../actions/promotionActions';
import styles from './PromotionEligibility.module.css';
import { useSelector } from 'react-redux';

function PromotionEligibility({ currentUser }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewers, setReviewers] = useState([]);

  const [selectedForPromotion, setSelectedForPromotion] = useState(new Set());
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

  useEffect(() => {
    const loadReviewerGroups = async () => {
      try {
        setLoadingReviewOptions(true);

        const data = await fetchReviewerGroups();

        setReviewOptions(data.groups || []);
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
  const filteredMemebers = selectGroup === 'new' ? newMembers : existingMembers;

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
        className={weeklyRequirementsMet ? styles.status_met : styles.status_not_met}
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
          className={`${styles.custom_circular_checkbox_wrapper} ${processing ? 'disabled' : ''}`}
          style={{
            cursor: !processing ? 'pointer' : 'not_allowed',
          }}
        >
          <div
            className={`${styles.custom_circular_checkbox} ${
              selectedForPromotion.has(id) ? 'checked' : ''
            }`}
          >
            {selectedForPromotion.has(id) && <FaCheck className={styles.check_icon} />}
          </div>
        </div>
      </td>
    </tr>
  );

  const handleReviewOptionSelect = option => {
    setShowReviewDropdown(false);

    // Keep this selected option for the modal
    setSelectedOption(option);

    // TODO: Open the required review modal
    console.log('Selected reviewer group:', option);
  };

  const handleEditClick = option => {
    setSelectedOption(option);

    setEditOption({
      label: option.label || '',
      rangeStart: option.rangeStart || '',
      rangeEnd: option.rangeEnd || '',
    });

    setShowEditOption(true);
  };

  const handleUpdateOption = async () => {
    if (!selectedOption) return;

    if (!editOption.label.trim()) {
      toast.error('Please enter a name.');
      return;
    }

    if (!editOption.rangeStart || !editOption.rangeEnd) {
      toast.error('Please enter both range values.');
      return;
    }

    try {
      await updateReviewerGroup(selectedOption.key, editOption);

      setReviewOptions(prev =>
        prev.map(option =>
          option.key === selectedOption.key
            ? {
                ...option,
                ...editOption,
              }
            : option,
        ),
      );

      setShowEditOption(false);
      setSelectedOption(null);

      toast.success('Reviewer group updated successfully.');
    } catch (error) {
      console.error('Failed to update reviewer group:', error);
      toast.error('Unable to update reviewer group.');
    }
  };

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

      setReviewOptions(prev => [...prev, createdGroup]);

      setNewOption({
        label: '',
        rangeStart: '',
        rangeEnd: '',
      });

      setShowAddOption(false);

      toast.success('Reviewer group added successfully.');
    } catch (error) {
      console.error('Failed to add reviewer group:', error);
      toast.error('Unable to add reviewer group.');
    }
  };

  return (
    <div className={`${styles.pageWrapper} ${darkMode ? styles.dark : ''}`}>
      <div className={`${styles.promo_table_container} ${darkMode ? styles.dark : ''}`}>
        <div className={styles.promo_table_header}>
          Promotion Eligibility
          <div>
            <select
              className={`${styles.selectGroup}  ${darkMode ? styles.dark : ''}`}
              value={selectGroup}
              onChange={e => setSelectedGroup(e.target.value)}
            >
              <option value="new">New Member</option>
              <option value="existing">Existing Member</option>
            </select>
            <>
              {/* Review dropdown */}
              <div className={styles.review_dropdown}>
                <button
                  type="button"
                  onClick={() => setShowReviewDropdown(prev => !prev)}
                  disabled={processing || loadingReviewOptions}
                  className={styles.review_btn}
                  aria-haspopup="menu"
                  aria-expanded={showReviewDropdown}
                >
                  Review for This Week
                  <span aria-hidden="true"> ▾</span>
                </button>

                {showReviewDropdown && (
                  <div className={styles.dropdown_menu} role="menu">
                    {[...reviewOptions]
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map(option => (
                        <button
                          key={option._id}
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
                        <div className={styles.dropdown_divider} />

                        <button
                          type="button"
                          role="menuitem"
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

              {/* Owner Manage Options Modal */}
              {showManageOptions && (
                <div className={styles.modal_overlay}>
                  <div className={styles.modal} role="dialog" aria-modal="true">
                    <h2>Manage Review Options</h2>

                    {[...reviewOptions]
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map(option => (
                        <div key={option._id} className={styles.option_row}>
                          <div>
                            <strong>{option.label}</strong>

                            <span className={styles.option_range}>
                              {option.rangeStart && option.rangeEnd
                                ? `${option.rangeStart} - ${option.rangeEnd}`
                                : 'All Members'}
                            </span>
                          </div>

                          {option.editable && (
                            <button type="button" onClick={() => handleEditClick(option)}>
                              Edit
                            </button>
                          )}
                        </div>
                      ))}

                    <button
                      type="button"
                      className={styles.add_option_btn}
                      onClick={() => {
                        setShowManageOptions(false);
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
            </>
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
        <div className={styles.tableWrapper}>
          <table className={styles.promo_table}>
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
                <>{filteredMemebers.length > 0 && filteredMemebers.map(renderRow)}</>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PromotionEligibility;
