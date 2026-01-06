import { useState } from 'react';
import styles from './DisplayBox.module.css';
import { useSelector } from 'react-redux';

export default function DisplayBox({ onClose }) {
  const darkMode = useSelector(state => state.theme.darkMode);

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
      <div className={styles.popup} style={{ backgroundColor: darkMode ? '#1b2a41' : '#ebebeb' }}>
        <h2 className={styles['popup-heading']}>
          Are you sure you want to promote these PR reviewers?
        </h2>
        <table className={styles['popup-table']}>
          <thead>
            <tr>
              <th style={{ backgroundColor: darkMode ? '#0d1521' : 'white' }}>
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={handleSelectAll}
                  aria-label="Select all reviewers"
                />
              </th>
              <th style={{ backgroundColor: darkMode ? '#0d1521' : 'white' }}>PR Reviewer</th>
              <th style={{ backgroundColor: darkMode ? '#0d1521' : 'white' }}>Team Code</th>
              <th style={{ backgroundColor: darkMode ? '#0d1521' : 'white' }}>
                Team Reviewer Name
              </th>
              <th style={{ backgroundColor: darkMode ? '#0d1521' : 'white' }}>Weekly PR Counts</th>
            </tr>
          </thead>
          <tbody>
            {mockPromotionData.map((promotion, index) => (
              <tr key={`${promotion.prReviewer}-${promotion.teamCode}`}>
                <td style={{ backgroundColor: darkMode ? '#0d1521' : 'white' }}>
                  <input
                    type="checkbox"
                    checked={checkedItems[index]}
                    onChange={() => handleCheckedBoxChange(index)}
                    aria-label={`Select reviewer ${promotion.prReviewer}`}
                  />
                </td>
                <td style={{ backgroundColor: darkMode ? '#0d1521' : 'white' }}>
                  {promotion.prReviewer}
                </td>
                <td style={{ backgroundColor: darkMode ? '#0d1521' : 'white' }}>
                  {promotion.teamCode}
                </td>
                <td style={{ backgroundColor: darkMode ? '#0d1521' : 'white' }}>
                  {promotion.teamReviewerName}
                </td>
                <td style={{ backgroundColor: darkMode ? '#0d1521' : 'white' }}>
                  {promotion.weeklyPRs.map((pr, prIndex) => (
                    <span
                      key={`${promotion.prReviewer}-${pr.week}`}
                      className={`${styles['pr-count-badge']} ${styles[`color-${prIndex}`]}`}
                    >
                      {pr.prCount}
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles['button-row']}>
          <button
            type="button"
            className={`${styles.button} ${styles[`color-6`]}`}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles[`color-2`]}`}
            disabled={!checkedItems.some(Boolean)}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
