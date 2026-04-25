import PropTypes from 'prop-types';
import { useState } from 'react';
import { Tooltip } from 'reactstrap';
import {
  calculateUsagePercentage,
  getClampedUsagePercentage,
  getUsagePercentageTooltip,
} from '../../../utils/materialInsights';
import styles from './UsagePercentageBar.module.css';

export default function UsagePercentageBar({ material, darkMode = false }) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const tooltipId = `usage-pct-${material._id}`;

  const bought = material?.stockBought || 0;
  const used = material?.stockUsed || 0;

  const usagePct = calculateUsagePercentage(used, bought);
  const usagePctClamped = getClampedUsagePercentage(usagePct);
  const tooltipText = getUsagePercentageTooltip(material);

  // Determine color based on usage percentage
  const getUsageColor = () => {
    if (usagePct === null) return 'gray';
    if (usagePct >= 80) return 'red';
    if (usagePct >= 50) return 'yellow';
    return 'green';
  };

  const usageColor = getUsageColor();

  if (!bought || bought <= 0) {
    return (
      <>
        <div id={tooltipId} className={`${styles.usageContainer}`}>
          <span className={`${styles.usageLabel}`}>N/A</span>
        </div>
        <Tooltip
          placement="top"
          isOpen={tooltipOpen}
          target={tooltipId}
          toggle={() => setTooltipOpen(!tooltipOpen)}
          className={darkMode ? styles.darkTooltip : ''}
        >
          {tooltipText}
        </Tooltip>
      </>
    );
  }

  return (
    <>
      <div id={tooltipId} className={`${styles.usageContainer}`}>
        <div className={`${styles.barWrapper}`}>
          <div
            className={`${styles.progressBar} ${styles[usageColor]}`}
            style={{ width: `${usagePctClamped}%` }}
            role="progressbar"
            aria-valuenow={usagePctClamped}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Usage: ${usagePct}%`}
          />
        </div>
        <span className={`${styles.usageLabel}`}>
          {used} / {bought} ({usagePct}%)
        </span>
      </div>
      <Tooltip
        placement="top"
        isOpen={tooltipOpen}
        target={tooltipId}
        toggle={() => setTooltipOpen(!tooltipOpen)}
        className={darkMode ? styles.darkTooltip : ''}
      >
        {tooltipText}
      </Tooltip>
    </>
  );
}

UsagePercentageBar.propTypes = {
  material: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    stockBought: PropTypes.number,
    stockUsed: PropTypes.number,
  }).isRequired,
  darkMode: PropTypes.bool,
};

UsagePercentageBar.defaultProps = {
  darkMode: false,
};
