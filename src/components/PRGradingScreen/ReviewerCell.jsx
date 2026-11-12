import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import styles from './PRGradingScreen.module.css';

const ReviewerCell = ({
  reviewer,
  isPromoted,
  promoted,
  onPromoteClick,
  onSelectReviewer,
  darkMode,
}) => {
  // Compatibility fallback for promotion status props
  const promotedState = isPromoted !== undefined ? isPromoted : promoted;
  const dm = darkMode ? styles['dark-mode'] : '';

  return (
    /* Vertical container anchoring the reviewer name and action button */
    <div
      className={`${styles['reviewer-cell']} ${styles['pr-grading-screen-reviewer-info']} ${dm}`}
    >
      {/* Display the reviewer name: Use a semantic <button> when clickable, or a <span> otherwise */}
      {onSelectReviewer ? (
        <button
          type="button"
          onClick={() => onSelectReviewer(reviewer.id)}
          className={`${styles['pr-grading-screen-reviewer-name']} ${styles['reviewer-name-button']} ${dm}`}
        >
          {reviewer.reviewer}
        </button>
      ) : (
        <span className={`${styles['pr-grading-screen-reviewer-name']} ${dm}`}>
          {reviewer.reviewer}
        </span>
      )}

      {reviewer.role && (
        <span className={`${styles['pr-grading-screen-reviewer-role']} ${dm}`}>
          {reviewer.role}
        </span>
      )}

      {/* Render the Promote / Promoted button directly beneath the reviewer name */}
      <Button
        variant={promotedState ? 'success' : 'outline-warning'}
        size="sm"
        disabled={promotedState}
        onClick={() => onPromoteClick(reviewer)}
        className={`${styles['pr-grading-screen-promote-btn']} ${dm}`}
      >
        {promotedState ? '✅ Promoted' : 'Promote'}
      </Button>
    </div>
  );
};

ReviewerCell.propTypes = {
  reviewer: PropTypes.shape({
    id: PropTypes.string.isRequired,
    reviewer: PropTypes.string.isRequired,
    role: PropTypes.string,
  }).isRequired,
  isPromoted: PropTypes.bool,
  promoted: PropTypes.bool,
  onPromoteClick: PropTypes.func.isRequired,
  onSelectReviewer: PropTypes.func,
  darkMode: PropTypes.bool,
};

ReviewerCell.defaultProps = {
  isPromoted: undefined,
  promoted: false,
  onSelectReviewer: undefined,
  darkMode: false,
};

export default ReviewerCell;
