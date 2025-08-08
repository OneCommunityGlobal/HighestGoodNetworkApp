import { useEffect, useState } from 'react';
import styles from './PromotionTable.module.css';

const names = ['Alice', 'Bob', 'Charlie'];
const dummyMembers = Array.from({ length: 45 }, (_, i) => ({
  id: i + 1,
  reviewer: names[i % names.length],
  hasMetWeekly: i % 2 === 0, // Simulating weekly requirement met
  requiredPRs: 5,
  totalReviews: Math.floor(Math.random() * 10),
  remainingWeeks: Math.max(0, 4 - Math.floor(Math.random() * 4)), // Random remaining weeks between 0 and 4
  promote: i % 3 === 0, // Randomly decide if they should be promoted
  isNew: i < 15, // First 15 are new members
}));

function PromotionTable() {
  const [eligibilityData, setEligibilityData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulating an API call with the dummy data
    setLoading(true);
    const timer = setTimeout(() => {
      setEligibilityData(dummyMembers);
      setLoading(false);
    }, 500); // Simulate network delay

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  const newMembers = eligibilityData.filter(u => u.isNew);
  const existingMembers = eligibilityData.filter(u => !u.isNew);

  if (loading) return <div>Loading promotions...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Promotion Eligibility</h1>
        <div className={styles.actions}>
          <button type="button" className={`${styles.btn} ${styles.btnSecondary}`}>
            Review for this week
          </button>
          <button type="button" className={`${styles.btn} ${styles.btnPrimary}`}>
            Process Promotions
          </button>
        </div>
      </div>

      <table className={styles.promotionTable}>
        <thead>
          <tr>
            <th style={{ width: '15%' }}>Existing member/ New member</th>
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
          <tr className={styles.sectionHeader}>
            <td colSpan="7">New Members</td>
          </tr>
          {newMembers.map(user => (
            <tr key={user.id}>
              <td />
              <td>{user.reviewer}</td>
              <td className={user.hasMetWeekly ? styles.statusMet : styles.statusNotMet}>
                <span className={styles.statusIcon}>{user.hasMetWeekly ? '✓' : '✗'}</span>
                {user.hasMetWeekly ? 'Has Met' : 'Has not Met'}
              </td>
              <td>{user.requiredPRs}</td>
              <td>{user.totalReviews}</td>
              <td>{user.remainingWeeks}</td>
              <td>
                <input
                  className={styles.promoteCheckbox}
                  type="checkbox"
                  defaultChecked={user.promote}
                />
              </td>
            </tr>
          ))}

          {/* --- Existing Members Section --- */}
          <tr className={styles.sectionHeader}>
            <td colSpan="7">Existing Members</td>
          </tr>
          {existingMembers.map(user => (
            <tr key={user.id}>
              <td />
              <td>{user.reviewer}</td>
              <td className={user.hasMetWeekly ? styles.statusMet : styles.statusNotMet}>
                <span className={styles.statusIcon}>{user.hasMetWeekly ? '✓' : '✗'}</span>
                {user.hasMetWeekly ? 'Has Met' : 'Has not Met'}
              </td>
              <td>{user.requiredPRs}</td>
              <td>{user.totalReviews}</td>
              <td>{user.remainingWeeks}</td>
              <td>
                <input
                  className={styles.promoteCheckbox}
                  type="checkbox"
                  defaultChecked={user.promote}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PromotionTable;
