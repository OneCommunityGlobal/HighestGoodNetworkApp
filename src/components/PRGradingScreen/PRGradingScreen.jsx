import PropTypes from 'prop-types';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import {
  addPREntry,
  updatePRRating,
  importPREntries,
  fetchPREntriesBulk,
  updatePRsNeeded,
} from '../../actions/promotionActions';

import styles from './PRGradingScreen.module.css';

const PR_RATINGS = [
  {
    value: 'Did not review',
    label: 'Did not review',
  },
  {
    value: 'Needs more details',
    label: 'Needs more details',
  },
  {
    value: 'Good',
    label: 'Good',
  },
  {
    value: 'Exceptional',
    label: 'Exceptional',
  },
  {
    value: 'No Image',
    label: 'No Image',
  },
];

const getRatingClass = (grade, styles) => {
  switch (grade) {
    case 'Did not review':
      return styles['pr-rating-did-not-review'];

    case 'Needs more details':
      return styles['pr-rating-needs-details'];

    case 'Good':
      return styles['pr-rating-good'];

    case 'Exceptional':
      return styles['pr-rating-exceptional'];

    case 'No Image':
      return styles['pr-rating-no-image'];

    default:
      return '';
  }
};

const PRGradingScreen = ({ teamData, reviewers, currentUser }) => {
  const darkMode = useSelector(state => state.theme.darkMode);

  const [reviewerData, setReviewerData] = useState(reviewers || []);

  const [activeInput, setActiveInput] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');

  const [showGradingModal, setShowGradingModal] = useState(null);

  const [isFinalized, setIsFinalized] = useState(false);

  /*
   * Keeps Owner-edited PRs Needed values locally until
   * the bulk API returns the updated backend data.
   */
  const [prsNeededOverrides, setPrsNeededOverrides] = useState({});

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const [isLoadingEntries, setIsLoadingEntries] = useState(false);

  /*
   * ---------------------------------------------------------
   * BULK LOAD
   * ---------------------------------------------------------
   *
   * This is now the single source of truth for:
   *
   * - PRs
   * - PR count
   * - History
   * - Ratings
   *
   * It is called:
   *
   * 1. When the page opens
   * 2. When reviewers change
   * 3. After Add PR
   * 4. After rating change
   * 5. After Import
   * 6. After PRs Needed change
   */
  const loadAllPREntries = useCallback(async () => {
    if (!reviewers?.length) {
      setReviewerData([]);
      return;
    }

    try {
      setIsLoadingEntries(true);

      const reviewerIds = reviewers.map(reviewer => reviewer.id);

      const response = await fetchPREntriesBulk(reviewerIds, currentUser);

      const reviewerResults = response?.reviewers || {};

      setReviewerData(
        reviewers.map(reviewer => {
          const reviewerResult = reviewerResults[reviewer.id];

          const weeks = reviewerResult?.weeks || [];

          const gradedPrs = weeks.flatMap(week => week.prs || []);

          return {
            ...reviewer,
            weeks,
            gradedPrs,
            prsReviewed: gradedPrs.length,
            history: reviewer.history || [],
          };
        }),
      );
    } catch (error) {
      console.error('Failed to load PR entries:', error);
      toast.error('Failed to load PR grading data.');
    } finally {
      setIsLoadingEntries(false);
    }
  }, [reviewers, currentUser]);

  /*
   * Initial load + reload when reviewer list changes.
   */
  useEffect(() => {
    loadAllPREntries();
  }, [loadAllPREntries]);

  /*
   * ---------------------------------------------------------
   * SEARCH
   * ---------------------------------------------------------
   */

  const availableRoles = useMemo(() => {
    const roles = reviewerData.map(reviewer => reviewer.role).filter(Boolean);

    return [...new Set(roles)];
  }, [reviewerData]);

  const filteredReviewers = useMemo(() => {
    return reviewerData.filter(reviewer => {
      const reviewerName = reviewer.reviewerName || '';

      const nameMatch = reviewerName.toLowerCase().includes(searchTerm.toLowerCase());

      const roleMatch = roleFilter ? reviewer.role === roleFilter : true;

      return nameMatch && roleMatch;
    });
  }, [reviewerData, searchTerm, roleFilter]);

  const handleClearSearch = () => {
    setSearchTerm('');
    setRoleFilter('');
  };

  if (!teamData || !reviewers) {
    return <div>Error: Missing required props</div>;
  }

  /*
   * ---------------------------------------------------------
   * PRS NEEDED
   * ---------------------------------------------------------
   *
   * Backend is the source of truth.
   *
   * We DO NOT calculate PRs Needed from committed hours here.
   */
  const getReviewerPrsNeeded = reviewer => {
    if (Object.hasOwn(prsNeededOverrides, reviewer.id)) {
      return prsNeededOverrides[reviewer.id];
    }

    return reviewer.prsNeeded ?? reviewer.requiredPRs ?? 0;
  };

  const handlePrsNeededChange = async (reviewerId, value) => {
    if (isFinalized) {
      return;
    }

    const numericValue = Number(value);

    if (value === '' || Number.isNaN(numericValue)) {
      return;
    }

    if (numericValue < 0) {
      return;
    }

    try {
      /*
       * Single mutation API.
       */
      await updatePRsNeeded(reviewerId, numericValue, currentUser);

      /*
       * Refresh EVERYTHING from backend.
       */
      await loadAllPREntries();

      setPrsNeededOverrides(prev => ({
        ...prev,
        [reviewerId]: numericValue,
      }));

      toast.success('PRs Needed updated.');
    } catch (error) {
      console.error('Failed to update PRs Needed:', error);

      toast.error('Failed to update PRs Needed.');
    }
  };

  /*
   * ---------------------------------------------------------
   * VALIDATION
   * ---------------------------------------------------------
   */

  const validatePRNumber = value => {
    const trimmed = value.trim();

    const pattern = /^\d+(\s*\+\s*\d+)?$/;

    if (!trimmed) {
      return {
        isValid: false,
        error: 'PR number cannot be empty',
      };
    }

    if (!pattern.test(trimmed)) {
      return {
        isValid: false,
        error: 'Format: 1070 or 1070 + 1256',
      };
    }

    return {
      isValid: true,
      error: '',
    };
  };

  /*
   * ---------------------------------------------------------
   * ADD PR
   * ---------------------------------------------------------
   */

  const handleAddNewClick = async reviewerId => {
    if (isFinalized) return;

    try {
      setInputError('');

      // First populate missing PRs from the reviewer's weekly summary
      await importPREntries(reviewerId, currentUser);

      // Refresh the PR list so imported PRs are visible immediately
      await loadAllPREntries();

      // Then open the manual input for adding another PR
      setActiveInput(reviewerId);
      setInputValue('');
      setInputError('');
    } catch (error) {
      console.error('Failed to import PR entries:', error);
      setInputError('Unable to load PRs from the weekly summary.');
    }
  };

  const handleInputSubmit = async reviewerId => {
    if (isFinalized) {
      return;
    }

    const validation = validatePRNumber(inputValue);

    if (!validation.isValid) {
      setInputError(validation.error);
      return;
    }

    try {
      /*
       * Single mutation API.
       */
      await addPREntry(reviewerId, inputValue.trim(), currentUser);
      /*
       * Refresh the entire table from backend.
       */
      await loadAllPREntries();

      setActiveInput(null);
      setInputValue('');
      setInputError('');

      toast.success('PR added successfully.');
    } catch (error) {
      console.error('Failed to add PR:', error);

      setInputError('Failed to save PR. Please try again.');
    }
  };

  const handleCancel = () => {
    if (isFinalized) {
      return;
    }

    setActiveInput(null);
    setInputValue('');
    setInputError('');
  };

  /*
   * ---------------------------------------------------------
   * PR GRADING
   * ---------------------------------------------------------
   */

  const handlePRNumberClick = reviewerId => {
    if (isFinalized) {
      return;
    }

    setShowGradingModal(reviewerId);
  };

  const handleGradeChange = async (reviewerId, prId, newGrade) => {
    if (isFinalized) {
      return;
    }

    try {
      /*
       * Single mutation API.
       */
      await updatePRRating(prId, newGrade, currentUser);

      /*
       * Refresh all reviewers.
       */
      await loadAllPREntries();

      toast.success('PR rating saved.');
    } catch (error) {
      console.error('Failed to save PR rating:', error);

      toast.error('Failed to save PR rating.');
    }
  };

  const handleCloseGradingModal = () => {
    setShowGradingModal(null);
  };

  /*
   * ---------------------------------------------------------
   * FINALIZE
   * ---------------------------------------------------------
   */

  /*
   * ---------------------------------------------------------
   * HISTORY
   * ---------------------------------------------------------
   */

  const getHistory = reviewer => {
    if (!Array.isArray(reviewer.history)) {
      return [];
    }

    return reviewer.history.map((entry, index) => {
      /*
       * Backward compatibility with old:
       *
       * history: [10, 11, 7]
       */
      if (typeof entry === 'number') {
        return {
          id: index,
          week: '',
          count: entry,

          /*
           * Old history doesn't contain this information.
           * Don't invent it.
           */
          belowRequirement: undefined,
        };
      }

      return {
        id: entry.id || entry.week || index,

        week: entry.week || '',

        count: Number(entry.prsReviewed ?? entry.count ?? 0),

        /*
         * IMPORTANT:
         *
         * Use backend's belowRequirement value.
         * Do not calculate this using the frontend's
         * PRs Needed value.
         */
        belowRequirement: entry.belowRequirement,
      };
    });
  };

  /*
   * ---------------------------------------------------------
   * IMPORT PR ENTRIES
   * ---------------------------------------------------------
   */

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  const dm = darkMode ? styles['dark-mode'] : '';

  return (
    <Container fluid className={`${styles['pr-grading-screen-container']} ${dm}`}>
      <Row>
        <Col md={12}>
          <Card className={`${styles['pr-grading-screen-card']} ${dm}`}>
            {/* <Card.Header className={`${styles['pr-grading-screen-header']} ${dm}`}>
              <div className={styles['pr-grading-screen-header-content']}>
                <div>
                  <h1 className={`${styles['pr-grading-screen-title']} ${dm}`}>
                    Weekly PR grading screen
                  </h1>

                  <div className={`${styles['pr-grading-screen-team-info-badge']} ${dm}`}>
                    {teamData.teamName} - {teamData.dateRange.start} to {teamData.dateRange.end}
                  </div>
                </div>

                <Button
                  variant={isFinalized ? 'secondary' : 'outline-dark'}
                  disabled={isFinalized}
                  onClick={handleFinalize}
                  className={dm}
                >
                  {isFinalized ? 'Finalized' : 'Done'}
                </Button>
              </div>
            </Card.Header> */}

            <Card.Body className={dm}>
              {/* ---------------- SEARCH ---------------- */}

              <div className={`${styles['pr-grading-screen-search-bar']} ${dm}`}>
                <input
                  type="text"
                  placeholder="Search reviewers by name..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className={`${styles['pr-grading-screen-search-input']} ${dm}`}
                />

                {availableRoles.length > 0 && (
                  <select
                    value={roleFilter}
                    onChange={e => setRoleFilter(e.target.value)}
                    className={`${styles['pr-grading-screen-role-select']} ${dm}`}
                  >
                    <option value="">All roles</option>

                    {availableRoles.map(role => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                )}

                {(searchTerm || roleFilter) && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className={`${styles['pr-grading-screen-clear-btn']} ${dm}`}
                  >
                    ✕ Clear
                  </button>
                )}
              </div>

              {/* ---------------- LOADING ---------------- */}

              {isLoadingEntries && (
                <div className={styles['pr-grading-screen-loading']}>
                  Loading PR grading data...
                </div>
              )}

              {/* ---------------- TABLE ---------------- */}

              <table className={`${styles['pr-grading-screen-table']} ${dm}`}>
                <thead>
                  <tr>
                    <th>Reviewer Name</th>
                    <th>PRs Needed</th>
                    <th>History</th>
                    <th>PRs Reviewed</th>
                    <th>PR Numbers</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredReviewers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className={`${styles['pr-grading-screen-no-results']} ${dm}`}>
                        No reviewers found
                      </td>
                    </tr>
                  ) : (
                    filteredReviewers.map(reviewer => {
                      const prsNeeded = getReviewerPrsNeeded(reviewer);

                      const history = getHistory(reviewer);

                      const gradedPrs = reviewer.gradedPrs || [];

                      return (
                        <tr key={reviewer.id}>
                          {/* Reviewer */}

                          <td>{reviewer.reviewerName}</td>

                          {/* PRs Needed */}

                          <td>
                            <input
                              type="number"
                              min="0"
                              value={prsNeeded}
                              disabled={isFinalized}
                              onChange={e => handlePrsNeededChange(reviewer.id, e.target.value)}
                              className={`${styles['pr-grading-screen-pr-needed-input']} ${dm}`}
                              title="Owner can manually edit PRs Needed. A manual value overrides the committed-hours calculation."
                              aria-label={`PRs needed for ${reviewer.reviewerName}`}
                            />

                            {reviewer.committedHours !== undefined && (
                              <div className={styles['pr-grading-screen-committed-hours']}>
                                {reviewer.committedHours} hrs/week
                              </div>
                            )}
                          </td>

                          {/* History */}

                          <td className={styles['pr-grading-screen-history-cell']}>
                            {history.length === 0 ? (
                              <span className={styles['pr-grading-screen-no-history']}>—</span>
                            ) : (
                              <div className={styles['pr-grading-screen-history']}>
                                {history.map(historyItem => {
                                  /*
                                   * Backend is responsible
                                   * for determining whether
                                   * the historical week was
                                   * below requirement.
                                   */
                                  const belowRequirement = historyItem.belowRequirement === true;

                                  return (
                                    <span
                                      key={historyItem.id}
                                      className={
                                        belowRequirement
                                          ? styles['pr-grading-screen-history-below']
                                          : styles['pr-grading-screen-history-met']
                                      }
                                      title={
                                        historyItem.week
                                          ? `${historyItem.week}: ${historyItem.count} PRs reviewed`
                                          : `${historyItem.count} PRs reviewed`
                                      }
                                    >
                                      {historyItem.count}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </td>

                          {/* PRs Reviewed */}

                          <td>
                            <input
                              type="number"
                              value={gradedPrs.length}
                              readOnly
                              disabled={isFinalized}
                              className={`${styles['pr-grading-screen-pr-input']} ${dm}`}
                              aria-label={`PRs reviewed by ${reviewer.reviewerName}`}
                            />
                          </td>

                          {/* PR Numbers */}

                          <td className={styles['pr-grading-screen-td-numbers']}>
                            {gradedPrs.map(pr => (
                              <span
                                key={pr._id || pr.id || pr.prNumber}
                                role="button"
                                tabIndex={0}
                                aria-label={`Grade PR ${pr.prNumber || pr.prNumbers || 'number'}`}
                                className={`${styles['pr-grading-screen-pr-number']} ${
                                  (pr.prNumber || '').includes('+')
                                    ? styles['pr-grading-screen-pair']
                                    : ''
                                } ${getRatingClass(pr.rating, styles)} ${dm}`}
                                onClick={() => handlePRNumberClick(reviewer.id)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();

                                    handlePRNumberClick(reviewer.id);
                                  }
                                }}
                              >
                                {pr.prNumber}
                              </span>
                            ))}

                            {!isFinalized && activeInput !== reviewer.id && (
                              <Button
                                variant="success"
                                size="sm"
                                className={styles['pr-grading-screen-add-btn']}
                                onClick={() => handleAddNewClick(reviewer.id)}
                              >
                                + Add new
                              </Button>
                            )}

                            {!isFinalized && activeInput === reviewer.id && (
                              <div className={styles['pr-grading-screen-input-container']}>
                                <input
                                  type="text"
                                  value={inputValue}
                                  onChange={e => {
                                    setInputValue(e.target.value);
                                    setInputError('');
                                  }}
                                  className={styles['pr-grading-screen-pr-number-input']}
                                  placeholder="1070 or 1070 + 1256"
                                  aria-label="PR number"
                                />

                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleInputSubmit(reviewer.id)}
                                >
                                  Add
                                </Button>

                                <Button variant="secondary" size="sm" onClick={handleCancel}>
                                  Cancel
                                </Button>

                                {inputError && (
                                  <div className={styles['pr-grading-screen-input-error']}>
                                    {inputError}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ---------------- GRADING MODAL ---------------- */}

      {showGradingModal && (
        <div className={`${styles['pr-grading-screen-modal-overlay']} ${dm}`}>
          <dialog
            className={`${styles['pr-grading-screen-modal']} ${dm}`}
            aria-modal="true"
            aria-labelledby="pr-grading-modal-title"
          >
            <div className={`${styles['pr-grading-screen-modal-header']} ${dm}`}>
              <div>
                <h4 id="pr-grading-modal-title">Grade PRs</h4>

                <span
                  className={styles['pr-grading-screen-rating-tooltip']}
                  title="Did not review = red. Needs more details = blue. Good = black. Exceptional = black with yellow highlight. No Image = strikethrough."
                  aria-label="PR rating explanation"
                  role="img"
                >
                  ⓘ
                </span>
              </div>

              <button
                type="button"
                className={styles['pr-grading-screen-modal-close']}
                onClick={handleCloseGradingModal}
                aria-label="Close grading modal"
              >
                ×
              </button>
            </div>

            <div className={`${styles['pr-grading-screen-modal-body']} ${dm}`}>
              <div
                id="pr-rating-guide"
                className={`${styles['pr-grading-screen-rating-help']} ${dm}`}
              >
                <div>
                  <strong>Rating guide:</strong>
                </div>

                <div>
                  <span className={styles['pr-rating-did-not-review']}>Did not review</span>

                  <span className={styles['pr-rating-needs-details']}>Needs more details</span>

                  <span className={styles['pr-rating-good']}>Good</span>

                  <span className={styles['pr-rating-exceptional']}>Exceptional</span>

                  <span className={styles['pr-rating-no-image']}>No Image</span>
                </div>
              </div>

              <table className={`${styles['pr-grading-screen-grading-table']} ${dm}`}>
                <thead>
                  <tr>
                    <th>PR Number</th>
                    <th>Rating</th>
                  </tr>
                </thead>

                <tbody>
                  {reviewerData
                    .find(reviewer => reviewer.id === showGradingModal)
                    ?.gradedPrs?.map(pr => (
                      <tr key={pr._id || pr.id || pr.prNumber}>
                        <td>
                          <span className={getRatingClass(pr.rating, styles)}>
                            {pr.prNumber || pr.prNumbers}
                          </span>
                        </td>

                        <td>
                          <select
                            value={pr.rating || ''}
                            disabled={isFinalized}
                            onChange={e =>
                              handleGradeChange(showGradingModal, pr._id || pr.id, e.target.value)
                            }
                            className={`${
                              styles['pr-grading-screen-rating-select']
                            } ${getRatingClass(pr.rating, styles)} ${dm}`}
                            aria-describedby="pr-rating-guide"
                            aria-label={`Rating for PR ${pr.prNumber || pr.prNumbers || 'number'}`}
                          >
                            <option value="">Select rating</option>

                            {PR_RATINGS.map(rating => (
                              <option key={rating.value} value={rating.value}>
                                {rating.label}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              <div className={`${styles['pr-grading-screen-modal-footer']} ${dm}`}>
                <Button variant="primary" onClick={handleCloseGradingModal}>
                  Done
                </Button>
              </div>
            </div>
          </dialog>
        </div>
      )}
    </Container>
  );
};

PRGradingScreen.propTypes = {
  teamData: PropTypes.shape({
    teamName: PropTypes.string.isRequired,

    dateRange: PropTypes.shape({
      start: PropTypes.string.isRequired,
      end: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,

  reviewers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,

      reviewerName: PropTypes.string,

      role: PropTypes.string,

      prsNeeded: PropTypes.number,

      requiredPRs: PropTypes.number,

      committedHours: PropTypes.number,

      prsNeededOverride: PropTypes.number,

      history: PropTypes.arrayOf(
        PropTypes.oneOfType([
          PropTypes.number,

          PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

            week: PropTypes.string,

            prsReviewed: PropTypes.number,

            count: PropTypes.number,

            belowRequirement: PropTypes.bool,
          }),
        ]),
      ),

      gradedPrs: PropTypes.arrayOf(
        PropTypes.shape({
          _id: PropTypes.string,

          id: PropTypes.string,

          prNumber: PropTypes.string,

          prNumbers: PropTypes.string,

          rating: PropTypes.string,

          source: PropTypes.string,
        }),
      ),
    }),
  ).isRequired,
};

export default PRGradingScreen;
