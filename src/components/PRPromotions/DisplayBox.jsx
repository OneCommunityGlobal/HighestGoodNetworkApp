/* eslint-disable jsx-a11y/no-static-element-interactions */
import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './DisplayBox.module.css';

const VIBGYOR_COLOR_COUNT = 7;

const MOCK_PROMOTION_DATA = [
  {
    prReviewer: 'Akshay - Jayram',
    teamCode: '123',
    teamReviewerName: 'Team Leader 1',
    weeklyPRs: [
      { week: '2024-06-01', prCount: 12 },
      { week: '2024-06-08', prCount: 15 },
      { week: '2024-06-15', prCount: 10 },
      { week: '2024-06-22', prCount: 18 },
      { week: '2024-06-29', prCount: 14 },
      { week: '2024-07-06', prCount: 16 },
      { week: '2024-07-13', prCount: 20 },
    ],
  },
  {
    prReviewer: 'Ghazi1212',
    teamCode: '456',
    teamReviewerName: 'Team Leader 2',
    weeklyPRs: [
      { week: '2024-06-01', prCount: 12 },
      { week: '2024-06-08', prCount: 15 },
      { week: '2024-06-15', prCount: 10 },
      { week: '2024-06-22', prCount: 18 },
      { week: '2024-06-29', prCount: 14 },
    ],
  },
];

export default function DisplayBox({ onClose, darkMode = false }) {
  const [checkedItems, setCheckedItems] = useState(() => MOCK_PROMOTION_DATA.map(() => true));

  const masterCheckboxRef = useRef(null);

  const allChecked = checkedItems.length > 0 && checkedItems.every(Boolean);

  const someChecked = checkedItems.some(Boolean);

  useEffect(() => {
    if (masterCheckboxRef.current) {
      masterCheckboxRef.current.indeterminate = someChecked && !allChecked;
    }
  }, [someChecked, allChecked]);

  useEffect(() => {
    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleCheckedBoxChange = index => {
    setCheckedItems(currentItems =>
      currentItems.map((checked, itemIndex) => (itemIndex === index ? !checked : checked)),
    );
  };

  const handleSelectAll = event => {
    const shouldSelectAll = event.target.checked;

    setCheckedItems(currentItems => currentItems.map(() => shouldSelectAll));
  };

  const handleConfirm = () => {
    const selectedReviewers = MOCK_PROMOTION_DATA.filter((_, index) => checkedItems[index]);

    console.log('Selected reviewers:', selectedReviewers);

    onClose();
  };

  const handleOverlayMouseDown = event => {
    if (event.target === event.currentTarget) {
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
      <div
        className={`${styles.popup} ${darkMode ? styles.popupDark : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="promotion-dialog-heading"
      >
        <h2
          id="promotion-dialog-heading"
          className={`${styles.popupHeading} ${darkMode ? styles.popupHeadingDark : ''}`}
        >
          Are you sure you want to promote these PR reviewers?
        </h2>

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
                  aria-label="Select all reviewers"
                />
              </th>

              <th>PR Reviewer</th>
              <th>Team Code</th>
              <th>Team Leader Name</th>
              <th>Weekly PR Counts</th>
            </tr>
          </thead>

          <tbody>
            {MOCK_PROMOTION_DATA.map((promotion, index) => (
              <tr key={`${promotion.prReviewer}-${promotion.teamCode}`}>
                <td>
                  <input
                    className={styles.checkbox}
                    type="checkbox"
                    checked={checkedItems[index]}
                    onChange={() => handleCheckedBoxChange(index)}
                    aria-label={`Select reviewer ${promotion.prReviewer}`}
                  />
                </td>

                <td>{promotion.prReviewer}</td>
                <td>{promotion.teamCode}</td>
                <td>{promotion.teamReviewerName}</td>

                <td>
                  <div className={styles.prBadgeRow}>
                    {promotion.weeklyPRs.map((pr, prIndex) => (
                      <span
                        key={`${promotion.prReviewer}-${pr.week}`}
                        className={getBadgeClassName(prIndex)}
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
          >
            Cancel
          </button>

          <button
            type="button"
            className={`${styles.button} ${styles.confirmButton}`}
            disabled={!someChecked}
            onClick={handleConfirm}
          >
            Confirm
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
