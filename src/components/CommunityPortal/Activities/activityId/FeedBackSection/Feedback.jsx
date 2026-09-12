import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import styles from './Feedback.module.css';
import { FaSearch } from 'react-icons/fa';

import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import FeedbackModal from './FeedbackModal';

const nowISO = () => new Date().toISOString();

const FeedbackCard = ({ feedback, renderStars, getVisibilityBadge }) => (
  <div key={feedback.id} className="feedbackCard">
    <img alt="User" className="avatar" />
    <div className="feedbackContent">
      <div className="feedbackHeader">
        <strong>{feedback.name}</strong>
        <span className="feedbackDate">{feedback.date}</span>
        {(() => {
          const badge = getVisibilityBadge(feedback.visibility);
          return (
            <span className={badge.className} title={badge.title}>
              {badge.label}
            </span>
          );
        })()}
      </div>
      {feedback.rating !== null && <div className="feedbackRating">{renderStars(feedback)}</div>}
      <p className="feedbackText">{feedback.comment}</p>
    </div>
  </div>
);

FeedbackCard.propTypes = {
  feedback: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    rating: PropTypes.number,
    comment: PropTypes.string,
    date: PropTypes.string,
    visibility: PropTypes.string,
  }).isRequired,
  renderStars: PropTypes.func.isRequired,
  getVisibilityBadge: PropTypes.func.isRequired,
};

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
  const [sortOrder] = useState('desc');
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
  const renderStars = feedback =>
    Array.from({ length: 5 }, (_, i) => (
      <span key={`star-${feedback.id}-${i}`} className={`${styles.star}`}>
        {i < (feedback.rating || 0) ? <AiFillStar /> : <AiOutlineStar />}
      </span>
    ));

  const matchesSearch = (fb, term) => {
    if (!term) return true;
    return (
      (fb.comment || '').toLowerCase().includes(term) ||
      (fb.name || '').toLowerCase().includes(term) ||
      (fb.rating !== null && String(fb.rating).includes(term))
    );
  };

  const matchesVisibilityFilter = fb => {
    if (fb.visibility === 'suggestion' && visibilityFilter !== 'suggestion') return false;
    if (visibilityFilter !== 'all' && fb.visibility !== visibilityFilter) return false;
    return true;
  };

  const compareFeedback = (a, b) => {
    const dir = sortOrder === 'asc' ? 1 : -1;
    if (filterBy === 'date') return dir * (new Date(a.date) - new Date(b.date));
    if (filterBy === 'rating') return dir * ((a.rating || 0) - (b.rating || 0));
    return 0;
  };

  // Filtering & sorting for host view
  const filteredFeedback = feedbackList
    .filter(fb => matchesVisibilityFilter(fb) && matchesSearch(fb, searchTerm.trim().toLowerCase()))
    .sort(compareFeedback);

  // Participant submit handlers (local only)
  const handleSubmitFeedback = () => {
    if (!reviewsEnabled && !suggestionsOnly) return; // can't submit
    const isSuggestion = suggestionsOnly;
    const visibility = eventWithinFirstMonth || modalPrivate ? 'host-only' : 'public';
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

  const getVisibilityBadge = visibility => {
    const config = {
      'host-only': {
        className: styles.badgePrivate,
        label: 'Private',
        title: 'Private: Visible to host only',
      },
      suggestion: { className: styles.badgeSuggestion, label: 'Suggestion', title: 'Suggestion' },
    };
    return (
      config[visibility] || { className: styles.badgePublic, label: 'Public', title: 'Public' }
    );
  };

  const isSubmitDisabled =
    (!suggestionsOnly && !modalComment && !modalRating) ||
    (suggestionsOnly && !modalSuggestionText) ||
    (!reviewsEnabled && !suggestionsOnly);

  const buttonLabel = suggestionsOnly ? 'Share a suggestion' : 'Leave feedback';
  const modalTitle = suggestionsOnly ? 'Share Your Ideas' : 'Leave Feedback';
  const disabledTooltip = !reviewsEnabled && !suggestionsOnly ? 'Reviews disabled' : '';
  const importantLabel = eventWithinFirstMonth
    ? 'Your feedback is only visible to the host for the first month.'
    : null;

  const renderSuggestionCard = s => (
    <div key={s.id} className={`${styles.feedbackCard}`}>
      <img alt="User" className={`${styles.avatar}`} />
      <div className={`${styles.feedbackContent}`}>
        <div className={`${styles.feedbackHeader}`}>
          <strong>{s.name}</strong>
          <span className={`${styles.feedbackDate}`}>{s.date}</span>
        </div>
        <p className={`${styles.feedbackText}`}>{s.comment}</p>
      </div>
    </div>
  );

  const renderFeedbackCard = feedback => {
    const badge = getVisibilityBadge(feedback.visibility);
    return (
      <div key={feedback.id} className={`${styles.feedbackCard}`}>
        <img alt="User" className={`${styles.avatar}`} />
        <div className={`${styles.feedbackContent}`}>
          <div className={`${styles.feedbackHeader}`}>
            <strong>{feedback.name}</strong>
            <span className={`${styles.feedbackDate}`}>{feedback.date}</span>
            <span className={badge.className} title={badge.title}>
              {badge.label}
            </span>
          </div>
          {feedback.rating !== null && (
            <div className={`${styles.feedbackRating}`}>{renderStars(feedback)}</div>
          )}
          <p className={`${styles.feedbackText}`}>{feedback.comment}</p>
        </div>
      </div>
    );
  };

  const renderSuggestions = () => (
    <div className={`${styles.suggestionsList}`}>
      {suggestionList.length === 0 ? (
        <div className={`${styles.emptyState}`}>No suggestions yet.</div>
      ) : (
        suggestionList.map(renderSuggestionCard)
      )}
    </div>
  );

  const renderFeedbackList = () => (
    <div>
      {filteredFeedback.length === 0 ? (
        <div className={`${styles.emptyState}`}>No feedback matches your filters.</div>
      ) : (
        filteredFeedback.slice(0, visibleCount).map(renderFeedbackCard)
      )}
    </div>
  );

  const renderHostView = () => (
    <>
      <div className={`${styles.feedbackHeader}`}>
        <div className={`${styles.searchContainer}`}>
          <FaSearch className={`${styles.icon}`} />
          <input
            type="text"
            placeholder="Search comments, names..."
            value={searchTerm}
            onChange={handleSearch}
            className={`${styles.searchInput}`}
          />
        </div>

        <div className={`${styles.sortOptions}`}>
          <label className={`${styles.filter}`}>
            {'Filter by: '}
            <select
              value={filterBy}
              onChange={handleFilterChange}
              className={`${styles.filterDropdown}`}
            >
              <option value="date">Date</option>
              <option value="rating">Rating</option>
            </select>
          </label>

          <label className={`${styles.filter}`}>
            {'Visibility: '}
            <select
              value={visibilityFilter}
              onChange={e => setVisibilityFilter(e.target.value)}
              className={`${styles.filterDropdown}`}
            >
              <option value="all">All</option>
              <option value="public">Public</option>
              <option value="host-only">Private: Host Only</option>
              <option value="suggestion">Suggestions</option>
            </select>
          </label>
        </div>
      </div>

      <div className={`${styles.hostViewToggles}`}>
        <button
          type="button"
          className={`${showSuggestionsOnly ? '' : styles.toggleActive}`}
          onClick={() => setShowSuggestionsOnly(false)}
        >
          Reviews
        </button>
        <button
          type="button"
          className={`${showSuggestionsOnly ? styles.toggleActive : ''}`}
          onClick={() => setShowSuggestionsOnly(true)}
        >
          Suggestions ({suggestionList.length})
        </button>
      </div>

      {showSuggestionsOnly ? renderSuggestions() : renderFeedbackList()}

      {!showSuggestionsOnly && visibleCount < filteredFeedback.length && (
        <div className={`${styles.loadMore}`}>
          <button
            className={`${styles.loadMoreBtn}`}
            onClick={() => setVisibleCount(visibleCount + 2)}
          >
            Load More
          </button>
        </div>
      )}
    </>
  );

  const renderRatingStars = () => (
    <div id="rating" className={`${styles.ratingRow}`}>
      {Array.from({ length: 5 }, (_, i) => (
        <button
          key={i}
          type="button"
          className={`${i < modalRating ? styles.starBtnActive : styles.starBtn}`}
          onClick={() => setModalRating(i + 1)}
        >
          ★
        </button>
      ))}
    </div>
  );

  const renderFeedbackForm = () => (
    <>
      <div className={`${styles.formGroup}`}>
        <label htmlFor="rating" className={`${styles.label}`}>
          Rating
        </label>
        {renderRatingStars()}
      </div>

      <div className={`${styles.formGroup}`}>
        <label htmlFor="feedback" className={`${styles.label}`}>
          Comments
        </label>
        <textarea
          id="feedback"
          placeholder="Write your feedback here…"
          value={modalComment}
          onChange={e => setModalComment(e.target.value)}
          rows={4}
          className={`${styles.textarea}`}
        />
      </div>

      <div className={`${styles.formGroupRow}`}>
        <label>
          <input
            type="checkbox"
            checked={modalPrivate || eventWithinFirstMonth}
            onChange={e => setModalPrivate(e.target.checked)}
            disabled={eventWithinFirstMonth}
          />
          <span style={{ marginLeft: 8 }}>
            Private (Visible to host only){' '}
            {eventWithinFirstMonth && <em style={{ fontSize: 12 }}>(required for new events)</em>}
          </span>
        </label>
      </div>
    </>
  );

  const renderSuggestionForm = () => (
    <div className={`${styles.formGroup}`}>
      <label htmlFor="suggestions" className={`${styles.label}`}>
        Share Your Ideas
      </label>
      <textarea
        id="suggestions"
        placeholder="Write your idea here…"
        value={modalSuggestionText}
        onChange={e => setModalSuggestionText(e.target.value)}
        rows={5}
        className={`${styles.textarea}`}
      />
    </div>
  );

  const renderModalContent = () =>
    suggestionsOnly ? renderSuggestionForm() : renderFeedbackForm();

  const renderParticipantView = () => (
    <>
      {!reviewsEnabled && !suggestionsOnly && (
        <div className={`${styles.notice}`}>Reviews are currently disabled for this event.</div>
      )}

      {!modalOpen && (reviewsEnabled || suggestionsOnly) && (
        <div style={{ marginTop: 12 }}>
          <button
            type="button"
            className={`${styles.participateFeedbackBtn}`}
            onClick={handleOpenModal}
            disabled={!reviewsEnabled && !suggestionsOnly}
            title={disabledTooltip}
          >
            {buttonLabel}
          </button>
        </div>
      )}

      {modalOpen && (
        <FeedbackModal
          title={modalTitle}
          onClose={() => {
            setModalOpen(false);
            if (setShowModal) setShowModal(false);
          }}
          onSubmit={handleSubmitFeedback}
          show={modalOpen}
          importantLabel={importantLabel}
          disableSubmit={isSubmitDisabled}
        >
          {renderModalContent()}
        </FeedbackModal>
      )}
    </>
  );

  return (
    <div className={`${darkMode ? styles.darkMode : ''}`}>
      <div className={`${styles.feedbackContainer}`}>
        {isHost ? renderHostView() : renderParticipantView()}
      </div>
    </div>
  );
}

export default Feedback;

Feedback.propTypes = {
  reviewsEnabled: PropTypes.bool,
  suggestionsOnly: PropTypes.bool,
  isHost: PropTypes.bool,
  eventCreatedAt: PropTypes.string,
  showModal: PropTypes.bool,
  setShowModal: PropTypes.func,
  feedbackList: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      rating: PropTypes.number,
      comment: PropTypes.string,
      date: PropTypes.string,
      visibility: PropTypes.string,
    }),
  ).isRequired,
  setFeedbackList: PropTypes.func.isRequired,
};

Feedback.defaultProps = {
  reviewsEnabled: true,
  suggestionsOnly: false,
  isHost: false,
  eventCreatedAt: null,
  showModal: false,
  setShowModal: null,
};
