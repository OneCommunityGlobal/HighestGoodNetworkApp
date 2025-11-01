import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import styles from './PromotionTable.module.css';

// Using Math.random() safely here for dummy data generation.
// sonarjs/security/detect-non-secure-random: off
const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Edward', 'Fiona', 'Grace'];
const dummyMembers = Array.from({ length: 45 }, (_, i) => ({
  id: i + 1,
  reviewer: names[i % names.length],
  hasMetWeekly: i % 2 === 0,
  requiredPRs: 5,
  totalReviews: Math.floor(Math.random() * 10),
  remainingWeeks: Math.max(0, 4 - Math.floor(Math.random() * 4)),
  promote: i % 3 === 0,
  isNew: i < 15,
}));

function PromotionTable() {
  const [eligibilityData, setEligibilityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setEligibilityData(dummyMembers);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const newMembers = eligibilityData.filter(u => u.isNew);
  const existingMembers = eligibilityData.filter(u => !u.isNew);

  if (loading) return <div>Loading promotions...</div>;

  return (
    <div className={styles.container} data-theme={darkMode ? 'dark' : 'light'}>
      <div className={styles.header}>
        <h1>Promotion Eligibility</h1>
        <div className={styles.actions}>
          <button type="button" className={`${styles.btn} ${styles['btnPrimary']}`}>
            Review for This Week
          </button>
          <button type="button" className={`${styles.btn} ${styles['btnSecondary']}`}>
            Process Promotions
          </button>
        </div>
      </div>

      <div className={styles['promotionTableWrapper']}>
        <table className={styles['promotionTable']}>
          <thead>
            <tr>
              <th style={{ width: '15%' }}>Existing/New</th>
              <th>Reviewer</th>
              <th>Weekly Requirements</th>
              <th>Required PRs</th>
              <th>Total Reviews</th>
              <th>Remaining Weeks</th>
              <th>Promote?</th>
            </tr>
          </thead>
          <tbody>
            {/* --- New Members Section --- */}
            <tr className={styles['sectionHeader']}>
              <td colSpan="7">New Members</td>
            </tr>
            {newMembers.map(user => (
              <tr key={user.id}>
                <td />
                <td>{user.reviewer}</td>
                <td className={user.hasMetWeekly ? styles['statusMet'] : styles['statusNotMet']}>
                  <span className={styles['statusIcon']}>{user.hasMetWeekly ? '✓' : '✗'}</span>
                  {user.hasMetWeekly ? 'Has Met' : 'Has not Met'}
                </td>
                <td>{user.requiredPRs}</td>
                <td>{user.totalReviews}</td>
                <td>{user.remainingWeeks}</td>
                <td>
                  <input
                    className={styles['promoteCheckbox']}
                    type="checkbox"
                    defaultChecked={user.promote}
                  />
                </td>
              </tr>
            ))}

            {/* --- Existing Members Section --- */}
            <tr className={styles['sectionHeader']}>
              <td colSpan="7">Existing Members</td>
            </tr>
            {existingMembers.map(user => (
              <tr key={user.id}>
                <td />
                <td>{user.reviewer}</td>
                <td className={user.hasMetWeekly ? styles['statusMet'] : styles['statusNotMet']}>
                  <span className={styles['statusIcon']}>{user.hasMetWeekly ? '✓' : '✗'}</span>
                  {user.hasMetWeekly ? 'Has Met' : 'Has not Met'}
                </td>
                <td>{user.requiredPRs}</td>
                <td>{user.totalReviews}</td>
                <td>{user.remainingWeeks}</td>
                <td>
                  <input
                    className={styles['promoteCheckbox']}
                    type="checkbox"
                    defaultChecked={user.promote}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PromotionTable;
