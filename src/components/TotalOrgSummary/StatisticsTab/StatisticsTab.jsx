import styles from './StatisticsTab.module.css';

function StatisticsTab(props) {
  const {
    title,
    number,
    percentageChange,
    type,
    isIncreased,
    tabBackgroundColor,
    shapeBackgroundColor,
    comparisonType,
  } = props;

  return (
    <div
      className={styles.statisticsTabHolder}
      style={{ backgroundColor: tabBackgroundColor }}
      role="region"
      aria-labelledby={`${type}-title`}
    >
      <h3 className={styles.statisticsTitle} id={`${type}-title`}>
        {title}
      </h3>
      <div
        className={styles.statisticsNumberShape}
        style={{ backgroundColor: shapeBackgroundColor }}
        role="figure"
        aria-labelledby={`${type}-number`}
      >
        <h3 className={styles.statisticsNumber} id={`${type}-number`}>
          {number}
        </h3>
      </div>
      {comparisonType !== 'No Comparison' && (
        <h4
          className={`${styles.statisticsPercentage} ${
            isIncreased ? styles.statisticsPercentageIncrease : styles.statisticsPercentageDecrease
          }`}
          aria-live="polite"
        >
          {isIncreased ? '+' : '-'}
          {percentageChange}% {comparisonType.toLowerCase()}
        </h4>
      )}
    </div>
  );
}

export default StatisticsTab;
