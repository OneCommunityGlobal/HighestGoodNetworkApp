import { useState } from 'react';
import styles from './DisplayBox.module.css';

export default function DisplayBox({ onClose }) {
  const mockPromotionData = [
    {
      prReviewer: 'Akshay - Jayram',
      teamCode: '123',
      teamReviewerName: '""',
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
      teamReviewerName: '""',
      weeklyPRs: [
        { week: '2024-06-01', prCount: 12 },
        { week: '2024-06-08', prCount: 15 },
        { week: '2024-06-15', prCount: 10 },
        { week: '2024-06-22', prCount: 18 },
        { week: '2024-06-29', prCount: 14 },
      ],
    },
  ];

  const [checkedItems, setCheckedItems] = useState(new Array(mockPromotionData.length).fill(true));
  const allChecked = checkedItems.every(Boolean);

  const handleCheckedBoxChange = index => {
    const newChecked = [...checkedItems];
    newChecked[index] = !newChecked[index];
    setCheckedItems(newChecked);
  };

  const handleSelectAll = () => {
    setCheckedItems(new Array(mockPromotionData.length).fill(!allChecked));
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <h2 className={styles['popup-heading']}>
          Are you sure you want to promote these PR reviewers?
        </h2>
        <table className={styles['popup-table']}>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={handleSelectAll}
                  aria-label="Select all reviewers"
                />
              </th>
              <th>PR Reviewer</th>
              <th>Team Code</th>
              <th>Team Reviewer Name</th>
              <th>Weekly PR Counts</th>
            </tr>
          </thead>
          <tbody>
            {mockPromotionData.map((promotion, index) => (
              <tr key={`${promotion.prReviewer}-${promotion.teamCode}`}>
                <td>
                  <input
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
                  {promotion.weeklyPRs.map((pr, prIndex) => {
                    const colorClass = styles[`color-${prIndex % 5}`] || '';
                    return (
                      <span
                        key={`${promotion.prReviewer}-${pr.week}`}
                        className={`${styles['pr-count-badge']} ${colorClass}`}
                      >
                        {pr.prCount}
                      </span>
                    );
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles['button-row']}>
          <button type="button" className={styles.button} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={styles.button} disabled={!checkedItems.some(Boolean)}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
