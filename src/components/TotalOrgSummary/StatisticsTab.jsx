import React from 'react';
import './StatisticsTab.css';

function StatisticsTab(props) {
  const { title, number, percentageChange, type, isIncreased } = props;

  const tabClass = `${type}-tab-bg-color`;
  const shapeClass = `${type}-shape-bg-color`;

  return (
    <div
      className={`statistics-tab-holder ${tabClass}`}
      role="region"
      aria-labelledby={`${type}-title`}
    >
      <h3 className="statistics-title" id={`${type}-title`}>
        {title}
      </h3>
      <div
        className={`statistics-number-shape ${shapeClass}`}
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
