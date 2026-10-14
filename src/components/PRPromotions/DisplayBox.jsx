/* eslint-disable jsx-a11y/no-static-element-interactions */
import { useEffect, useRef, useState } from 'react';
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

  const masterCheckboxRef = useRef(null);

  const allChecked =
    promotions.length > 0 && checkedItems.length > 0 && checkedItems.every(Boolean);
  const someChecked = checkedItems.some(Boolean);
  const confirmDisabled = isConfirming || !someChecked;

  useEffect(() => {
    if (masterCheckboxRef.current) {
      masterCheckboxRef.current.indeterminate = someChecked && !allChecked;
    }
  }, [someChecked, allChecked]);

  useEffect(() => {
    const handleKeyDown = event => {
      if (event.key === 'Escape' && !isConfirming) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isConfirming, onClose]);

  const handleCheckedBoxChange = index => {
    setCheckedItems(currentItems =>
      currentItems.map((checked, itemIndex) => (itemIndex === index ? !checked : checked)),
    );
  };

  const handleSelectAll = event => {
    const shouldSelectAll = event.target.checked;

    setCheckedItems(currentItems => currentItems.map(() => shouldSelectAll));
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

  const handleOverlayMouseDown = event => {
    if (event.target === event.currentTarget && !isConfirming) {
      onClose();
    }
  };

  const tableClassName = [styles.popupTable, darkMode ? styles.popupTableDark : '']
    .filter(Boolean)
    .join(' ');

  const getBadgeClassName = index =>
    [styles.prCountBadge, styles[`color-${index % VIBGYOR_COLOR_COUNT}`]].filter(Boolean).join(' ');

  return (
    <div className={styles.overlay} onMouseDown={handleOverlayMouseDown}>
      <dialog
        open
        className={`${styles.popup} ${darkMode ? styles.popupDark : ''}`}
        aria-labelledby="promotion-dialog-heading"
        aria-busy={isConfirming}
      >
        <h2
          id="promotion-dialog-heading"
          className={`${styles.popupHeading} ${darkMode ? styles.popupHeadingDark : ''}`}
        >
          Are you sure you want to promote these PR reviewers?
        </h2>

        {statusMessage && (
          <p className={styles.statusMessage} role="status">
            {statusMessage}
          </p>
        )}

        <table className={tableClassName}>
          <thead>
            <tr>
              <th>
                <input
                  ref={masterCheckboxRef}
                  className={styles.checkbox}
                  type="checkbox"
                  checked={allChecked}
                  onChange={handleSelectAll}
                  disabled={promotions.length === 0 || isConfirming}
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
              <tr key={promotion.id || `${promotion.prReviewer}-${promotion.teamCode}-${index}`}>
                <td>
                  <input
                    className={styles.checkbox}
                    type="checkbox"
                    checked={Boolean(checkedItems[index])}
                    onChange={() => handleCheckedBoxChange(index)}
                    disabled={isConfirming}
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
      </dialog>
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
