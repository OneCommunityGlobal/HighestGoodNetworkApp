import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import styles from './PromotionTable.module.css';

const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Edward', 'Fiona', 'Grace'];

function seededRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const dummyMembers = Array.from({ length: 45 }, (_, i) => ({
  id: i + 1,
  reviewer: names[i % names.length],
  hasMetWeekly: i % 2 === 0,
  requiredPRs: 5,
  totalReviews: Math.floor(seededRandom(i) * 10),
  remainingWeeks: Math.max(0, 4 - Math.floor(seededRandom(i + 1) * 4)),
  promote: i % 3 === 0,
  isNew: i < 15,
}));

function MemberSection({ title, members, styles }) {
  return (
    <>
      <tr className={styles['sectionHeader']}>
        <td colSpan="7">{title}</td>
      </tr>
      {members.map(user => (
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
    </>
  );
}

function PromotionTable() {
  const [eligibilityData, setEligibilityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [processingLoading, setProcessingLoading] = useState(false);
  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setEligibilityData(dummyMembers);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleReviewForThisWeek = async () => {
    setReviewLoading(true);
    try {
      // Simulate API call to fetch weekly review data
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Refresh the table with current week's data
      setEligibilityData(prevData =>
        prevData.map(member => ({
          ...member,
          hasMetWeekly: Math.random() > 0.5, // Simulate data refresh
        })),
      );

      toast.success('Weekly review initiated. Table data refreshed.');
    } catch (error) {
      toast.error('Failed to initiate weekly review.');
      console.error('Review error:', error);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleProcessPromotions = async () => {
    setProcessingLoading(true);
    try {
      // Get selected members for promotion
      const selectedMembers = eligibilityData.filter(m => m.promote);

      if (selectedMembers.length === 0) {
        toast.warning('No members selected for promotion.');
        setProcessingLoading(false);
        return;
      }

      // Simulate API call to process promotions
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Show success message
      toast.success(`Promotions processed successfully for ${selectedMembers.length} member(s).`);
    } catch (error) {
      toast.error('Failed to process promotions.');
      console.error('Promotion error:', error);
    } finally {
      setProcessingLoading(false);
    }
  };

  const newMembers = eligibilityData.filter(u => u.isNew);
  const existingMembers = eligibilityData.filter(u => !u.isNew);

  if (loading) return <div>Loading promotions...</div>;

  return (
    <div className={styles.container} data-theme={darkMode ? 'dark' : 'light'}>
      <div className={styles.header}>
        <h1>Promotion Eligibility</h1>
        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.btn} ${styles['btnPrimary']}`}
            onClick={handleReviewForThisWeek}
            disabled={reviewLoading || loading}
          >
            {reviewLoading ? 'Reviewing...' : 'Review for This Week'}
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles['btnSecondary']}`}
            onClick={handleProcessPromotions}
            disabled={processingLoading || loading}
          >
            {processingLoading ? 'Processing...' : 'Process Promotions'}
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
            <MemberSection title="New Members" members={newMembers} styles={styles} />
            <MemberSection title="Existing Members" members={existingMembers} styles={styles} />
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PromotionTable;
