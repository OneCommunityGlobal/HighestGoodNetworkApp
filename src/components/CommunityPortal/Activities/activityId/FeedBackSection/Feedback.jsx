import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import styles from './Feedback.module.css';
import { FaSearch } from 'react-icons/fa';
import { MdArrowUpward, MdArrowDownward } from 'react-icons/md';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import FeedbackModal from './FeedbackModal';

const nowISO = () => new Date().toISOString();

function Feedback({
  reviewsEnabled = true,
  suggestionsOnly = false,
  isHost = false,
  eventCreatedAt = null,
  showModal = false,
  setShowModal = null,
  feedbackList,
  setFeedbackList,
}) {
  // local list (in real app you'd fetch)
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [showSuggestionsOnly, setShowSuggestionsOnly] = useState(false);

  // modal form state (participant)
  const [modalOpen, setModalOpen] = useState(showModal);
  const [modalRating, setModalRating] = useState(0);
  const [modalComment, setModalComment] = useState('');
  const [modalSuggestionText, setModalSuggestionText] = useState('');
  const [modalPrivate, setModalPrivate] = useState(false);
  const [visibleCount, setVisibleCount] = useState(2);

  // reflect incoming modal prop
  useEffect(() => {
    if (typeof showModal === 'boolean') setModalOpen(showModal);
  }, [showModal]);

  useEffect(() => {
    // If parent gave setShowModal, keep synchronized
    if (setShowModal) {
      setShowModal(modalOpen);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen]);

  useEffect(() => {
    // Placeholder for API call to fetch feedback data
    // For now we use dummyFeedback above.
  }, []);

  // dark mode for styling
  const darkMode = useSelector(state => state.theme?.darkMode);

  // helper: determine if event was created within one month
  const eventWithinFirstMonth = useMemo(() => {
    if (!eventCreatedAt) return false;
    const created = new Date(eventCreatedAt);
    const oneMonthLater = new Date(created);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
    return new Date() <= oneMonthLater;
  }, [eventCreatedAt]);

  const handleSearch = e => setSearchTerm(e.target.value);
  const handleFilterChange = e => setFilterBy(e.target.value);
  const handleSortChange = () => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');

  const renderStars = feedback =>
    Array.from({ length: 5 }, (_, i) => (
      <span key={`star-${feedback.id}-${i}`} className={styles.star}>
        {i < (feedback.rating || 0) ? <AiFillStar /> : <AiOutlineStar />}
      </span>
    ));

  // Filtering & sorting for host view
  const filteredFeedback = feedbackList
    .filter(fb => {
      // visibility filter
      if (visibilityFilter !== 'all' && fb.visibility !== visibilityFilter) return false;
      // search match
      const q = searchTerm.trim().toLowerCase();
      if (!q) return true;
      return (
        (fb.comment || '').toLowerCase().includes(q) ||
        (fb.name || '').toLowerCase().includes(q) ||
        (fb.rating !== null && String(fb.rating).includes(q))
      );
    })
    .sort((a, b) => {
      if (filterBy === 'date') {
        return sortOrder === 'asc'
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      }
      if (filterBy === 'rating') {
        return sortOrder === 'asc'
          ? (a.rating || 0) - (b.rating || 0)
          : (b.rating || 0) - (a.rating || 0);
      }
      return 0;
    });

  // Participant submit handlers (local only)
  const handleSubmitFeedback = () => {
    if (!reviewsEnabled && !suggestionsOnly) return; // can't submit
    const isSuggestion = suggestionsOnly;
    const visibility = eventWithinFirstMonth ? 'host-only' : modalPrivate ? 'host-only' : 'public';
    const newItem = {
      id: feedbackList.length + 1,
      name: 'You',
      rating: isSuggestion ? null : modalRating,
      comment: isSuggestion ? modalSuggestionText || modalComment : modalComment,
      date: nowISO().slice(0, 10),
      visibility: isSuggestion ? 'suggestion' : visibility,
    };
    setFeedbackList(prev => [newItem, ...prev]);
    // reset modal
    setModalComment('');
    setModalSuggestionText('');
    setModalRating(5);
    setModalPrivate(false);
    setModalOpen(false);
    if (setShowModal) setShowModal(false);
  };

  const handleOpenModal = () => {
    setModalOpen(true);
    if (setShowModal) setShowModal(true);
  };

  // Host-only and suggestion lists
  const suggestionList = feedbackList.filter(fb => fb.visibility === 'suggestion');

  return (
    <div className={`${styles.feedbackContainer} ${darkMode ? styles.feedbackContainerDark : ''}`}>
      {/* Host view (management) */}
      {isHost && (
        <>
          <div className={styles.feedbackHeader}>
            <div className={styles.searchContainer}>
              <FaSearch className={styles.icon} />
              <input
                type="text"
                placeholder="Search comments, names..."
                value={searchTerm}
                onChange={handleSearch}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.sortOptions}>
              <label className={`${styles.filter} ${darkMode ? styles.filterDark : ''}`}>
                Filter by:
                <select
                  value={filterBy}
                  onChange={handleFilterChange}
                  className={styles.filterDropdown}
                >
                  <option value="date">Date</option>
                  <option value="rating">Rating</option>
                </select>
              </label>

              <label className={`${styles.filter} ${darkMode ? styles.filterDark : ''}`}>
                Visibility:
                <select
                  value={visibilityFilter}
                  onChange={e => setVisibilityFilter(e.target.value)}
                  className={styles.filterDropdown}
                >
                  <option value="all">All</option>
                  <option value="public">Public</option>
                  <option value="host-only">Private: Host Only</option>
                  <option value="suggestion">Suggestions</option>
                </select>
              </label>

              <button type="button" className={styles.sortBtn} onClick={handleSortChange}>
                Sort {sortOrder === 'asc' ? <MdArrowUpward /> : <MdArrowDownward />}
              </button>
            </div>
          </div>

          {/* Toggle between Reviews and Suggestions view */}
          <div
            className={`${styles.hostViewToggles} ${darkMode ? styles.hostViewTogglesDark : ''}`}
          >
            <button
              type="button"
              className={showSuggestionsOnly ? '' : styles.toggleActive}
              onClick={() => setShowSuggestionsOnly(false)}
            >
              Reviews
            </button>
            <button
              type="button"
              className={showSuggestionsOnly ? styles.toggleActive : ''}
              onClick={() => setShowSuggestionsOnly(true)}
            >
              Suggestions ({suggestionList.length})
            </button>
          </div>

          {showSuggestionsOnly ? (
            <div className={styles.suggestionsList}>
              {suggestionList.length === 0 ? (
                <div className={styles.emptyState}>No suggestions yet.</div>
              ) : (
                suggestionList.map(s => (
                  <div
                    key={s.id}
                    className={`${styles.feedbackCard} ${darkMode ? styles.feedbackCardDark : ''}`}
                  >
                    <img alt="User" className={styles.avatar} />
                    <div className={styles.feedbackContent}>
                      <div className={styles.feedbackHeader}>
                        <strong>{s.name}</strong>
                        <span className={styles.feedbackDate}>{s.date}</span>
                      </div>
                      <p
                        className={`${styles.feedbackText} ${
                          darkMode ? styles.feedbackTextDark : ''
                        }`}
                      >
                        {s.comment}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div>
              {filteredFeedback.length === 0 ? (
                <div className={styles.emptyState}>No feedback matches your filters.</div>
              ) : (
                filteredFeedback.slice(0, visibleCount).map(feedback => (
                  <div
                    key={feedback.id}
                    className={`${styles.feedbackCard} ${darkMode ? styles.feedbackCardDark : ''}`}
                  >
                    <img alt="User" className={styles.avatar} />
                    <div className={styles.feedbackContent}>
                      <div className={styles.feedbackHeader}>
                        <strong>{feedback.name}</strong>
                        <span className={styles.feedbackDate}>{feedback.date}</span>
                        {/* Visibility badge */}
                        <span
                          className={
                            feedback.visibility === 'host-only'
                              ? styles.badgePrivate
                              : feedback.visibility === 'suggestion'
                              ? styles.badgeSuggestion
                              : styles.badgePublic
                          }
                          title={
                            feedback.visibility === 'host-only'
                              ? 'Private: Visible to host only'
                              : feedback.visibility === 'suggestion'
                              ? 'Suggestion'
                              : 'Public'
                          }
                        >
                          {feedback.visibility === 'host-only'
                            ? 'Private'
                            : feedback.visibility === 'suggestion'
                            ? 'Suggestion'
                            : 'Public'}
                        </span>
                      </div>

                      {/* rating */}
                      {feedback.rating !== null && (
                        <div className={styles.feedbackRating}>{renderStars(feedback)}</div>
                      )}

                      <p
                        className={`${styles.feedbackText} ${
                          darkMode ? styles.feedbackTextDark : ''
                        }`}
                      >
                        {feedback.comment}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          {visibleCount < feedbackList.length && (
            <div className={darkMode ? styles.loadMoreDark : styles.loadMore}>
              <button
                className={styles.loadMoreBtn}
                onClick={() => setVisibleCount(visibleCount + 2)}
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}

      {/* Participant view / modal */}
      {!isHost && (
        <>
          {/* Notice if reviews disabled */}
          {!reviewsEnabled && !suggestionsOnly && (
            <div className={styles.notice}>Reviews are currently disabled for this event.</div>
          )}

          {/* Button to open modal if parent didn't provide one */}
          {!modalOpen && (reviewsEnabled || suggestionsOnly) && (
            <div style={{ marginTop: 12 }}>
              <button
                type="button"
                className={
                  darkMode ? styles.participateFeedbackBtnDark : styles.participateFeedbackBtn
                }
                onClick={handleOpenModal}
                disabled={!reviewsEnabled && !suggestionsOnly}
                title={!reviewsEnabled && !suggestionsOnly ? 'Reviews disabled' : ''}
              >
                {suggestionsOnly ? 'Share a suggestion' : 'Leave feedback'}
              </button>
            </div>
          )}

          {/* Modal-like simple panel (replace with your modal component if you have one) */}
          {modalOpen && (
            <FeedbackModal
              title={suggestionsOnly ? 'Share Your Ideas' : 'Leave Feedback'}
              onClose={() => {
                setModalOpen(false);
                if (setShowModal) setShowModal(false);
              }}
              onSubmit={handleSubmitFeedback}
              show={modalOpen}
              importantLabel={
                eventWithinFirstMonth
                  ? 'Your feedback is only visible to the host for the first month.'
                  : null
              }
              disableSubmit={
                (!suggestionsOnly && !modalComment && !modalRating) ||
                (suggestionsOnly && !modalSuggestionText) ||
                (!reviewsEnabled && !suggestionsOnly)
              }
            >
              {suggestionsOnly ? (
                <div className={darkMode ? styles.formGroupDark : styles.formGroup}>
                  <label htmlFor="suggestions" className={styles.label}>
                    Share Your Ideas
                  </label>
                  <textarea
                    id="suggestions"
                    placeholder="Write your idea here…"
                    value={modalSuggestionText}
                    onChange={e => setModalSuggestionText(e.target.value)}
                    rows={5}
                    className={styles.textarea}
                  />
                </div>
              ) : (
                <>
                  <div className={darkMode ? styles.formGroupDark : styles.formGroup}>
                    <label htmlFor="rating" className={styles.label}>
                      Rating
                    </label>
                    <div id="rating" className={styles.ratingRow}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <button
                          key={i}
                          type="button"
                          className={i < modalRating ? styles.starBtnActive : styles.starBtn}
                          onClick={() => setModalRating(i + 1)}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={darkMode ? styles.formGroupDark : styles.formGroup}>
                    <label htmlFor="feedback" className={styles.label}>
                      Comments
                    </label>
                    <textarea
                      id="feedback"
                      placeholder="Write your feedback here…"
                      value={modalComment}
                      onChange={e => setModalComment(e.target.value)}
                      rows={4}
                      className={styles.textarea}
                    />
                  </div>

                  <div className={darkMode ? styles.formGroupRowDark : styles.formGroupRow}>
                    <label>
                      <input
                        type="checkbox"
                        checked={modalPrivate || eventWithinFirstMonth}
                        onChange={e => setModalPrivate(e.target.checked)}
                        disabled={eventWithinFirstMonth}
                      />
                      <span style={{ marginLeft: 8 }}>
                        Private (Visible to host only){' '}
                        {eventWithinFirstMonth && (
                          <em style={{ fontSize: 12 }}>(required for new events)</em>
                        )}
                      </span>
                    </label>
                  </div>
                </>
              )}
            </FeedbackModal>
          )}
        </>
      )}
    </div>
  );
}

export default Feedback;
