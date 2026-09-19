import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { UncontrolledTooltip } from 'reactstrap';
import { FaInfoCircle } from 'react-icons/fa';
import {
  getPromotionEligibility,
  getPrRatings,
  getPrEntriesForReviewers,
  getPrEntries,
  addPrEntry,
  updatePrEntryRating,
  importPrEntriesFromSummary,
} from '../../actions/promotionActions';
import styles from './ReviewForThisWeekModal.module.css';

const RATING_CLASSES = {
  red: 'ratingRed',
  blue: 'ratingBlue',
  black: 'ratingBlack',
  'black-yellow-highlight': 'ratingExceptional',
  strikethrough: 'ratingNoImage',
};

// Mirrors HGNRest's src/helpers/promotionEligibilityHelper.js mongoWeekOf exactly, so
// "this week" agrees with the backend, which is what a new PR entry defaults to when
// no year/week is sent. Needed because `weeks[0]` (most recent) is not reliably "this
// week" — a reviewer's most recent entries can be from a prior week.
const mongoWeekOf = date => {
  const year = date.getUTCFullYear();
  const startOfYear = Date.UTC(year, 0, 1);
  const dayOfYear = Math.floor(
    (Date.UTC(year, date.getUTCMonth(), date.getUTCDate()) - startOfYear) / 86400000,
  );
  const firstSunday = (7 - new Date(startOfYear).getUTCDay()) % 7;
  return { year, week: Math.floor((dayOfYear - firstSunday + 7) / 7) };
};

function ReviewForThisWeekModal({ groupKey, groupLabel, currentUser, darkMode, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewers, setReviewers] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [entriesByReviewer, setEntriesByReviewer] = useState({});
  const [newPrDrafts, setNewPrDrafts] = useState({});
  const [busyReviewerId, setBusyReviewerId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const [eligibilityData, ratingsRes] = await Promise.all([
          getPromotionEligibility(currentUser, groupKey),
          getPrRatings(currentUser),
        ]);
        if (!isMounted) return;

        setReviewers(eligibilityData);
        setRatings(ratingsRes.ratings || []);

        const reviewerIds = eligibilityData.map(r => r.reviewerId);
        if (reviewerIds.length > 0) {
          const entriesRes = await getPrEntriesForReviewers(currentUser, reviewerIds);
          if (!isMounted) return;
          setEntriesByReviewer(entriesRes.reviewers || {});
        }
        setLoading(false);
      } catch (e) {
        // The failure reason isn't shown to the user; a generic error message is enough here.
        if (!isMounted) return;
        setError('Failed to load weekly review data.');
        setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [groupKey, currentUser]);

  const ratingClassFor = value => {
    const rating = ratings.find(r => r.value === value);
    const key = rating ? RATING_CLASSES[rating.display] : null;
    return key ? styles[key] : '';
  };

  const currentWeekEntries = reviewerId => {
    const weeks = entriesByReviewer[reviewerId]?.weeks || [];
    const { year, week } = mongoWeekOf(new Date());
    const match = weeks.find(w => w.year === year && w.week === week);
    return match ? match.prs : [];
  };

  const errorMessageFrom = (e, fallback) => {
    const message = e?.response?.data;
    return typeof message === 'string' ? message : fallback;
  };

  const handleAddPr = async reviewerId => {
    const value = (newPrDrafts[reviewerId] || '').trim();
    if (!value) return;

    setBusyReviewerId(reviewerId);
    try {
      const entry = await addPrEntry(currentUser, reviewerId, { prNumber: value });
      setEntriesByReviewer(prev => {
        const existing = prev[reviewerId] || { weeks: [] };
        const idx = existing.weeks.findIndex(w => w.year === entry.year && w.week === entry.week);
        const weeks =
          idx >= 0
            ? existing.weeks.map((w, i) => (i === idx ? { ...w, prs: [...w.prs, entry] } : w))
            : [{ year: entry.year, week: entry.week, prs: [entry] }, ...existing.weeks].sort(
                (a, b) => b.year - a.year || b.week - a.week,
              );
        return { ...prev, [reviewerId]: { weeks } };
      });
      setNewPrDrafts(prev => ({ ...prev, [reviewerId]: '' }));
    } catch (e) {
      toast.error(errorMessageFrom(e, 'Failed to add PR entry.'));
    } finally {
      setBusyReviewerId(null);
    }
  };

  const handleRatingChange = async (reviewerId, entryId, rating) => {
    try {
      await updatePrEntryRating(currentUser, entryId, rating || null);
      setEntriesByReviewer(prev => {
        const existing = prev[reviewerId];
        if (!existing) return prev;
        const weeks = existing.weeks.map(w => ({
          ...w,
          prs: w.prs.map(pr => (pr._id === entryId ? { ...pr, rating: rating || null } : pr)),
        }));
        return { ...prev, [reviewerId]: { weeks } };
      });
    } catch (e) {
      toast.error(errorMessageFrom(e, 'Failed to update rating.'));
    }
  };

  const handleImport = async reviewerId => {
    setBusyReviewerId(reviewerId);
    try {
      const res = await importPrEntriesFromSummary(currentUser, reviewerId);
      const fresh = await getPrEntries(currentUser, reviewerId);
      setEntriesByReviewer(prev => ({ ...prev, [reviewerId]: fresh }));
      (res.warnings || []).forEach(warning => toast.info(warning));
    } catch (e) {
      toast.error(errorMessageFrom(e, 'Failed to import PR entries from weekly summary.'));
    } finally {
      setBusyReviewerId(null);
    }
  };

  return (
    <div className={styles.overlay}>
      <dialog
        open
        className={`${styles.modal} ${darkMode ? styles.dark : ''}`}
        aria-labelledby="review-week-modal-title"
      >
        <div className={styles.modalHeader}>
          <h3 id="review-week-modal-title" className={styles.modalTitle}>
            Review for This Week — {groupLabel}
          </h3>
          <button type="button" onClick={onClose} className={styles.closeButton} aria-label="Close">
            &times;
          </button>
        </div>

        <div className={styles.modalBody}>
          {loading && <p>Loading...</p>}
          {!loading && error && <p className={styles.errorText}>{error}</p>}
          {!loading && !error && reviewers.length === 0 && <p>No reviewers in this group.</p>}

          {!loading && !error && reviewers.length > 0 && (
            <div className={styles.tableWrapper}>
              <table className={styles.weekTable}>
                <thead>
                  <tr>
                    <th>Reviewer Name</th>
                    <th>History</th>
                    <th>PRs Reviewed</th>
                    <th>PRs Needed</th>
                    <th>
                      PR Numbers <FaInfoCircle id="pr-rating-info" className={styles.infoIcon} />
                      <UncontrolledTooltip target="pr-rating-info" placement="top">
                        Did not review (red), Needs more details (blue), Good (black), Exceptional
                        (black, highlighted), No Image (strikethrough)
                      </UncontrolledTooltip>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reviewers.map(reviewer => (
                    <tr key={reviewer.reviewerId}>
                      <td>{reviewer.reviewerName}</td>
                      <td>
                        {(reviewer.history || []).length === 0 && '—'}
                        {(reviewer.history || []).map((week, index) => (
                          <span
                            key={`${week.year}-${week.week}`}
                            className={
                              week.belowRequirement ? styles.historyBelow : styles.historyOk
                            }
                          >
                            {index > 0 && ', '}
                            {week.reviewCount}
                          </span>
                        ))}
                      </td>
                      <td>{reviewer.totalReviews}</td>
                      <td>{reviewer.prsNeeded ?? reviewer.requiredPRs}</td>
                      <td>
                        <div className={styles.prNumbersCell}>
                          {currentWeekEntries(reviewer.reviewerId).map(entry => (
                            <div key={entry._id} className={styles.prEntryChip}>
                              <span className={ratingClassFor(entry.rating)}>{entry.prNumber}</span>
                              <select
                                value={entry.rating || ''}
                                onChange={e =>
                                  handleRatingChange(
                                    reviewer.reviewerId,
                                    entry._id,
                                    e.target.value || null,
                                  )
                                }
                                className={styles.ratingSelect}
                              >
                                <option value="">Unrated</option>
                                {ratings.map(rating => (
                                  <option key={rating.value} value={rating.value}>
                                    {rating.value}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ))}

                          <div className={styles.addPrRow}>
                            <input
                              type="text"
                              placeholder="+ Add new PR"
                              value={newPrDrafts[reviewer.reviewerId] || ''}
                              onChange={e =>
                                setNewPrDrafts(prev => ({
                                  ...prev,
                                  [reviewer.reviewerId]: e.target.value,
                                }))
                              }
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleAddPr(reviewer.reviewerId);
                              }}
                              className={styles.addPrInput}
                              disabled={busyReviewerId === reviewer.reviewerId}
                            />
                            <button
                              type="button"
                              onClick={() => handleAddPr(reviewer.reviewerId)}
                              disabled={busyReviewerId === reviewer.reviewerId}
                              className={styles.addPrButton}
                            >
                              Done
                            </button>
                            <button
                              type="button"
                              onClick={() => handleImport(reviewer.reviewerId)}
                              disabled={busyReviewerId === reviewer.reviewerId}
                              className={styles.importButton}
                            >
                              Import from summary
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button type="button" onClick={onClose} className={styles.closeFooterButton}>
            Close
          </button>
        </div>
      </dialog>
    </div>
  );
}

export default ReviewForThisWeekModal;
