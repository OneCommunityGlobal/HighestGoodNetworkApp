import './StatisticsTab.css';

function StatisticsTab(props) {
  const {
    title,
    number,
    percentageChange,
    type,
    isIncreased,
    tabBackgroundColor,
    shapeBackgroundColor,
  } = props;

  return (
    <div
      className="statistics-tab-holder"
      style={{ backgroundColor: tabBackgroundColor }}
      role="region"
      aria-labelledby={`${type}-title`}
    >
      <h3 className="statistics-title" id={`${type}-title`}>
        {title}
      </h3>
      <div
        className="statistics-number-shape"
        style={{ backgroundColor: shapeBackgroundColor }}
        role="figure"
        aria-labelledby={`${type}-number`}
      >
        <h3 className="statistics-number" id={`${type}-number`}>
          {number}
        </h3>
      </div>
      <h4
        className={`statistics-percentage ${
          isIncreased ? 'statistics-percentage-increase' : 'statistics-percentage-decrease'
        }`}
        aria-live="polite"
      >
        {isIncreased ? '+' : '-'}
        {percentageChange}% week over week
      </h4>
    </div>
  );
}

export default StatisticsTab;
