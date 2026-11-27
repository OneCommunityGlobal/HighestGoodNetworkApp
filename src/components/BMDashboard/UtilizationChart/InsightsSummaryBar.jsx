import styles from './UtilizationChart.module.css';
import PropTypes from 'prop-types';

function InsightsSummaryBar({ summary }) {
  if (!summary) return null;

  return (
    <section className={styles.summaryBar} aria-label="Utilization summary">
      <div className={styles.summaryCard}>
        <span className={styles.summaryValue}>{summary.totalToolTypes}</span>
        <span className={styles.summaryLabel}>Tool Types</span>
      </div>
      <div className={styles.summaryCard}>
        <span className={styles.summaryValue}>{summary.averageUtilization}%</span>
        <span className={styles.summaryLabel}>Avg Utilization</span>
      </div>
      <div className={`${styles.summaryCard} ${styles.summaryCardGreen}`}>
        <span className={styles.summaryValue}>{summary.normal}</span>
        <span className={styles.summaryLabel}>Normal</span>
      </div>
      <div className={`${styles.summaryCard} ${styles.summaryCardYellow}`}>
        <span className={styles.summaryValue}>{summary.underUtilized}</span>
        <span className={styles.summaryLabel}>Under-utilized</span>
      </div>
      <div className={`${styles.summaryCard} ${styles.summaryCardRed}`}>
        <span className={styles.summaryValue}>{summary.overUtilized}</span>
        <span className={styles.summaryLabel}>Over-utilized</span>
      </div>
    </section>
  );
}

InsightsSummaryBar.propTypes = {
  summary: PropTypes.shape({
    totalToolTypes: PropTypes.number,
    averageUtilization: PropTypes.number,
    normal: PropTypes.number,
    underUtilized: PropTypes.number,
    overUtilized: PropTypes.number,
  }),
};

InsightsSummaryBar.defaultProps = {
  summary: null,
};

export default InsightsSummaryBar;
