import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { postPromotionEligibility } from '../../actions/promotionActions';
import {
  getPendingPromotionReviewers,
  setPendingPromotionReviewers,
} from './pendingPromotionReviewers';
import styles from './DisplayBox.module.css';

const VIBGYOR_COLOR_COUNT = 7;
const MONGO_ID_PATTERN = /^[a-fA-F0-9]{24}$/;

function normalizeId(value) {
  if (value == null || value === '') {
    return undefined;
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'object') {
    if (value.$oid) {
      return String(value.$oid);
    }
    if (value._id) {
      return normalizeId(value._id);
    }
  }
  return String(value);
}

function getPromotableIds(promotions, checkedItems) {
  return promotions
    .filter((_, index) => checkedItems[index])
    .map(promotion => normalizeId(promotion.id))
    .filter(id => id && MONGO_ID_PATTERN.test(id));
}

export default function DisplayBox({ onClose, darkMode = false }) {
  const requestor = useSelector(state => state.auth?.user);
  const [promotions, setPromotions] = useState(getPendingPromotionReviewers);
  const [checkedItems, setCheckedItems] = useState(() =>
    getPendingPromotionReviewers().map(() => true),
  );
  const [isConfirming, setIsConfirming] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const handleEscape = event => {
      if (event.key === 'Escape' && !isConfirming) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isConfirming, onClose]);

  const allChecked =
    promotions.length > 0 && checkedItems.length > 0 && checkedItems.every(Boolean);
  const someChecked = checkedItems.some(Boolean);
  const confirmDisabled = isConfirming || !someChecked;

  const handleCheckedBoxChange = index => {
    setCheckedItems(prev => {
      const updated = [...prev];
      updated[index] = !updated[index];
      return updated;
    });
  };

  const handleSelectAll = () => {
    setCheckedItems(new Array(promotions.length).fill(!allChecked));
  };

  const handleRowClick = (index, event) => {
    if (event.target.closest('input[type="checkbox"]')) {
      return;
    }
    handleCheckedBoxChange(index);
  };

  const handleOverlayClick = event => {
    if (event.target === event.currentTarget && !isConfirming) {
      onClose();
    }
  };

  const handleConfirm = async () => {
    const selectedCount = checkedItems.filter(Boolean).length;
    const selectedIds = getPromotableIds(promotions, checkedItems);

    setIsConfirming(true);
    setStatusMessage('');

    try {
      if (selectedIds.length > 0) {
        await postPromotionEligibility(selectedIds, requestor?.userid);
      }

      const remaining = promotions.filter((_, index) => !checkedItems[index]);
      setPendingPromotionReviewers(remaining);
      const nextPromotions = getPendingPromotionReviewers();
      setPromotions(nextPromotions);
      setCheckedItems(nextPromotions.map(() => true));

      const message = `Successfully promoted ${selectedCount} reviewer(s).`;
      setStatusMessage(message);
      toast.success(message);

      if (remaining.length === 0) {
        onClose();
      }
    } catch (error) {
      const message = 'Failed to process promotions.';
      setStatusMessage(message);
      toast.error(message);
    } finally {
      setIsConfirming(false);
    }
  };

  const getBadgeClassName = index =>
    `${styles.prCountBadge} ${styles[`color${index % VIBGYOR_COLOR_COUNT}`] || ''}`.trim();

  return (
    // Overlay click closes the dialog; Escape is handled on document keydown.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div
        className={`${styles.popup} ${darkMode ? styles.popupDark : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="promotion-confirm-title"
        aria-busy={isConfirming}
      >
        <h2
          id="promotion-confirm-title"
          className={`${styles.popupHeading} ${darkMode ? styles.popupHeadingDark : ''}`}
        >
          Are you sure you want to promote these PR reviewers?
        </h2>

        {statusMessage && (
          <p className={styles.statusMessage} role="status">
            {statusMessage}
          </p>
        )}

        <div className={styles.tableWrapper}>
          <table className={styles.popupTable}>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={allChecked}
                    onChange={handleSelectAll}
                    disabled={promotions.length === 0}
                    aria-label="Select all reviewers"
                  />
                </th>
                <th>PR Reviewer</th>
                <th>Team Code</th>
                <th>Team Leader Name</th>
                <th>Weekly PRs</th>
              </tr>
            </thead>
            <tbody>
              {promotions.length === 0 && (
                <tr>
                  <td colSpan="5" className={styles.messageCell}>
                    No PR reviewers left to promote.
                  </td>
                </tr>
              )}
              {promotions.map((promotion, index) => (
                <tr
                  key={promotion.id || `${promotion.prReviewer}-${promotion.teamCode}-${index}`}
                  onClick={event => handleRowClick(index, event)}
                >
                  <td>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={Boolean(checkedItems[index])}
                      onChange={() => handleCheckedBoxChange(index)}
                      aria-label={`Select reviewer ${promotion.prReviewer}`}
                    />
                  </td>
                  <td>{promotion.prReviewer}</td>
                  <td>{promotion.teamCode}</td>
                  <td>{promotion.teamLeaderName}</td>
                  <td>
                    <div
                      className={styles.prBadgeRow}
                      aria-label={`Weekly PRs for ${promotion.prReviewer}`}
                    >
                      {promotion.weeklyPRs.map((pr, prIndex) => (
                        <span
                          key={`${promotion.id || promotion.prReviewer}-${pr.week}-${prIndex}`}
                          className={getBadgeClassName(prIndex)}
                          title={`Week ${pr.week}: ${pr.prCount} PRs`}
                        >
                          {pr.prCount}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.buttonRow}>
          <button
            type="button"
            className={`${styles.button} ${styles.cancelButton}`}
            onClick={onClose}
            disabled={isConfirming}
          >
            Cancel
          </button>

          <button
            type="button"
            className={`${styles.button} ${styles.confirmButton}`}
            disabled={confirmDisabled}
            onClick={handleConfirm}
          >
            {isConfirming ? 'Confirming...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

DisplayBox.propTypes = {
  onClose: PropTypes.func.isRequired,
  darkMode: PropTypes.bool,
};

DisplayBox.defaultProps = {
  darkMode: false,
};
