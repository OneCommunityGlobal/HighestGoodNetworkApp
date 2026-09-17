import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { FaCheck } from 'react-icons/fa';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import {
  getPromotionEligibility,
  postPromotionEligibility,
  getReviewerGroups,
  createReviewerGroup,
  updateReviewerGroup,
  updatePrsNeeded,
} from '../../actions/promotionActions';
import ReviewForThisWeekModal from './ReviewForThisWeekModal';
import styles from './PromotionEligibility.module.css';
import { useSelector } from 'react-redux';

function PromotionEligibility({ currentUser: currentUserProp }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewers, setReviewers] = useState([]);

  const [selectedForPromotion, setSelectedForPromotion] = useState(new Set());
  const [processing, setProcessing] = useState(false);

  const [selectGroup, setSelectedGroup] = useState('new');

  const [reviewDropdownOpen, setReviewDropdownOpen] = useState(false);
  const [reviewerGroups, setReviewerGroups] = useState([]);
  const [activeReviewGroup, setActiveReviewGroup] = useState(null);
  const [editingGroupKey, setEditingGroupKey] = useState(null);
  const [groupForm, setGroupForm] = useState({ label: '', rangeStart: '', rangeEnd: '' });
  const [addingGroup, setAddingGroup] = useState(false);

  const [editingPrsNeededId, setEditingPrsNeededId] = useState(null);
  const [prsNeededDraft, setPrsNeededDraft] = useState('');

  const darkMode = useSelector(state => state.theme.darkMode);
  // `routes.jsx` never passes a `currentUser` prop to this route, so this falls back
  // to the logged-in user from Redux. The backend derives the real requestor from the
  // auth token regardless of what is sent, but the frontend still needs the real role
  // to decide whether to show Owner-only controls (group edit/add, PRs Needed edit).
  const authUser = useSelector(state => state.auth?.user);
  // Memoized on the primitive fields, not the whole authUser object, so this stays
  // referentially stable across renders — an inline object literal here would change
  // identity every render and re-trigger every effect keyed on `currentUser`.
  const derivedUser = useMemo(
    () => ({
      requestorId: authUser?.userid,
      role: authUser?.role,
      email: authUser?.email,
    }),
    [authUser?.userid, authUser?.role, authUser?.email],
  );
  const currentUser = currentUserProp || derivedUser;

  const isOwner = currentUser && currentUser.role === 'Owner';

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
    (async () => {
      try {
        const res = await getReviewerGroups(currentUser);
        setReviewerGroups(res.groups || []);
      } catch (e) {
        toast.error('Failed to load reviewer groups.');
      }
    })();
  }, [currentUser]);

  const newMembers = reviewers.filter(r => r.isNewMember);
  const existingMembers = reviewers.filter(r => !r.isNewMember);
  const filteredMemebers = selectGroup === 'new' ? newMembers : existingMembers;

  const handleSelectReviewGroup = group => {
    setActiveReviewGroup(group);
    setReviewDropdownOpen(false);
  };

  const startEditGroup = group => {
    setEditingGroupKey(group.key);
    setAddingGroup(false);
    setGroupForm({
      label: group.label,
      rangeStart: group.rangeStart || '',
      rangeEnd: group.rangeEnd || '',
    });
  };

  const startAddGroup = () => {
    setAddingGroup(true);
    setEditingGroupKey(null);
    setGroupForm({ label: '', rangeStart: '', rangeEnd: '' });
  };

  const cancelGroupForm = () => {
    setEditingGroupKey(null);
    setAddingGroup(false);
  };

  const submitGroupForm = async e => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (addingGroup) {
        const res = await createReviewerGroup(currentUser, groupForm);
        setReviewerGroups(prev => [...prev, res.group]);
        toast.success(`Added group ${res.group.label}.`);
      } else if (editingGroupKey) {
        const res = await updateReviewerGroup(currentUser, editingGroupKey, groupForm);
        setReviewerGroups(prev =>
          prev.map(group => (group.key === editingGroupKey ? res.group : group)),
        );
        toast.success(`Updated group ${res.group.label}.`);
      }
      cancelGroupForm();
    } catch (err) {
      const message = err && err.response && err.response.data;
      toast.error(typeof message === 'string' ? message : 'Failed to save reviewer group.');
    }
  };

  const startEditPrsNeeded = (id, currentValue) => {
    setEditingPrsNeededId(id);
    setPrsNeededDraft(String(currentValue));
  };

  const cancelEditPrsNeeded = () => {
    setEditingPrsNeededId(null);
    setPrsNeededDraft('');
  };

  const prsNeededErrorMessage = (err, fallback) => {
    const message = err && err.response && err.response.data;
    return typeof message === 'string' ? message : fallback;
  };

  const handleSavePrsNeeded = async id => {
    const value = Number(prsNeededDraft);
    if (!Number.isInteger(value) || value < 0) {
      toast.error('PRs Needed must be a non-negative whole number.');
      return;
    }

    try {
      const updated = await updatePrsNeeded(currentUser, id, value);
      setReviewers(prev =>
        prev.map(r =>
          r.id === id
            ? {
                ...r,
                requiredPRs: updated.requiredPRs ?? value,
                prsNeeded: updated.prsNeeded ?? value,
                prsNeededSource: updated.prsNeededSource,
                committedHoursChanged: updated.committedHoursChanged,
              }
            : r,
        ),
      );
      cancelEditPrsNeeded();
      toast.success('Updated PRs Needed.');
    } catch (err) {
      toast.error(prsNeededErrorMessage(err, 'Failed to update PRs Needed.'));
    }
  };

  // Per the spec, an override replaces the committed-hours check entirely. Clearing it
  // hands the reviewer back to the bands, but the backend deliberately leaves the stored
  // figure alone ("leaves prsNeeded alone so the next load recalculates it from committed
  // hours") rather than recomputing it here, so the displayed number only updates on the
  // next full reload — reflected honestly rather than guessed at.
  const handleResetPrsNeeded = async id => {
    try {
      const updated = await updatePrsNeeded(currentUser, id, null);
      setReviewers(prev =>
        prev.map(r =>
          r.id === id
            ? { ...r, prsNeededSource: updated.prsNeededSource, committedHoursChanged: false }
            : r,
        ),
      );
      toast.success('Reset to automatic. Reload the page to see the recalculated figure.');
    } catch (err) {
      toast.error(prsNeededErrorMessage(err, 'Failed to reset PRs Needed.'));
    }
  };

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
    prsNeededSource,
    committedHoursChanged,
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
      <td data-label="Required PRs">
        {isOwner && editingPrsNeededId === id ? (
          <span className={styles.prsNeededEditRow}>
            <input
              type="number"
              min="0"
              value={prsNeededDraft}
              onChange={e => setPrsNeededDraft(e.target.value)}
              className={styles.prsNeededInput}
            />
            <button
              type="button"
              onClick={() => handleSavePrsNeeded(id)}
              className={styles.prsNeededSave}
            >
              Save
            </button>
            <button type="button" onClick={cancelEditPrsNeeded} className={styles.prsNeededCancel}>
              Cancel
            </button>
          </span>
        ) : (
          <span className={styles.prsNeededDisplay}>
            {isOwner ? (
              <button
                type="button"
                className={styles.prsNeededEditTrigger}
                onClick={() => startEditPrsNeeded(id, requiredPRs)}
                title="Edit PRs Needed"
              >
                {requiredPRs}
              </button>
            ) : (
              requiredPRs
            )}
            {isOwner && prsNeededSource === 'ownerOverride' && (
              <button
                type="button"
                className={styles.prsNeededReset}
                onClick={() => handleResetPrsNeeded(id)}
                title="Reset to automatic (based on committed hours)"
              >
                ↺
              </button>
            )}
            {committedHoursChanged && (
              <span
                className={styles.committedHoursIndicator}
                title="Committed hours changed since this was last calculated"
              >
                ●
              </span>
            )}
          </span>
        )}
      </td>
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
            <Dropdown
              isOpen={reviewDropdownOpen}
              toggle={() => setReviewDropdownOpen(prev => !prev)}
              className={styles.reviewDropdown}
            >
              <DropdownToggle disabled={processing} className={styles.review_btn} caret>
                Review for This Week
              </DropdownToggle>
              <DropdownMenu className={darkMode ? styles.darkDropdownMenu : ''}>
                {reviewerGroups.map(group => (
                  <div key={group.key} className={styles.groupMenuRow}>
                    <DropdownItem onClick={() => handleSelectReviewGroup(group)}>
                      {group.label}
                    </DropdownItem>
                    {isOwner && group.editable !== false && (
                      <button
                        type="button"
                        className={styles.editGroupButton}
                        onClick={e => {
                          e.stopPropagation();
                          startEditGroup(group);
                        }}
                      >
                        Edit
                      </button>
                    )}
                  </div>
                ))}

                {isOwner && (editingGroupKey || addingGroup) && (
                  <form className={styles.groupForm} onSubmit={submitGroupForm}>
                    <input
                      type="text"
                      placeholder="Group label"
                      value={groupForm.label}
                      onChange={e => setGroupForm(prev => ({ ...prev, label: e.target.value }))}
                      className={styles.groupFormInput}
                    />
                    <input
                      type="text"
                      placeholder="A"
                      maxLength={1}
                      value={groupForm.rangeStart}
                      onChange={e =>
                        setGroupForm(prev => ({ ...prev, rangeStart: e.target.value }))
                      }
                      className={styles.groupFormLetterInput}
                    />
                    <input
                      type="text"
                      placeholder="Z"
                      maxLength={1}
                      value={groupForm.rangeEnd}
                      onChange={e => setGroupForm(prev => ({ ...prev, rangeEnd: e.target.value }))}
                      className={styles.groupFormLetterInput}
                    />
                    <button type="submit" className={styles.groupFormSave}>
                      Save
                    </button>
                    <button
                      type="button"
                      className={styles.groupFormCancel}
                      onClick={cancelGroupForm}
                    >
                      Cancel
                    </button>
                  </form>
                )}

                {isOwner && !editingGroupKey && !addingGroup && (
                  // Plain button, not DropdownItem: reactstrap's DropdownItem always closes
                  // the menu on click via its own internal context, regardless of
                  // stopPropagation on this handler, which was closing the menu before the
                  // add-group form ever got a chance to render.
                  <button type="button" className={styles.addGroupButton} onClick={startAddGroup}>
                    + Add Group
                  </button>
                )}
              </DropdownMenu>
            </Dropdown>
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

      {activeReviewGroup && (
        <ReviewForThisWeekModal
          groupKey={activeReviewGroup.key}
          groupLabel={activeReviewGroup.label}
          currentUser={currentUser}
          darkMode={darkMode}
          onClose={() => setActiveReviewGroup(null)}
        />
      )}
    </div>
  );
}

export default PromotionEligibility;
