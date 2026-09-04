import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import styles from './PRGradingScreen.module.css';

const ReviewerCell = ({ reviewer, isPromoted, onPromote }) => {
  return (
    /* Vertical container anchoring the reviewer name and action button */
    <div
      className={styles['pr-reviewer-cell'] || ''}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}
    >
      {/* Display the reviewer name */}
      <span style={{ fontWeight: 600 }}>{reviewer.reviewer}</span>
      {/* Render the Promote / Promoted button directly beneath the reviewer name */}
      <Button
        variant={isPromoted ? 'secondary' : 'primary'}
        size="sm"
        disabled={isPromoted}
        onClick={() => onPromote(reviewer)}
        style={{
          fontSize: '12px',
          padding: '3px 10px',
          borderRadius: '4px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        {isPromoted ? 'Promoted' : 'Promote'}
      </Button>
    </div>
  );
};

ReviewerCell.propTypes = {
  reviewer: PropTypes.shape({
    id: PropTypes.string.isRequired,
    reviewer: PropTypes.string.isRequired,
  }).isRequired,
  isPromoted: PropTypes.bool.isRequired,
  onPromote: PropTypes.func.isRequired,
};

export default ReviewerCell;
