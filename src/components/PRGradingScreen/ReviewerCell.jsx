import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import styles from './PRGradingScreen.module.css';

const ReviewerCell = ({ reviewer, isPromoted, promoted, onPromoteClick }) => {
  // Compatibility fallback for promotion status props
  const promotedState = isPromoted !== undefined ? isPromoted : promoted;

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
        variant={promotedState ? 'secondary' : 'primary'}
        size="sm"
        disabled={promotedState}
        onClick={() => onPromoteClick(reviewer)}
        style={{
          fontSize: '12px',
          padding: '3px 10px',
          borderRadius: '4px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        {promotedState ? 'Promoted' : 'Promote'}
      </Button>
    </div>
  );
};

ReviewerCell.propTypes = {
  reviewer: PropTypes.shape({
    id: PropTypes.string.isRequired,
    reviewer: PropTypes.string.isRequired,
  }).isRequired,
  isPromoted: PropTypes.bool,
  promoted: PropTypes.bool,
  onPromoteClick: PropTypes.func.isRequired,
};

export default ReviewerCell;
