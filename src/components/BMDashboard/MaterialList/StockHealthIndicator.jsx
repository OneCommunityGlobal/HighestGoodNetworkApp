import PropTypes from 'prop-types';
import { useState } from 'react';
import { Tooltip } from 'reactstrap';
import {
  calculateMaterialInsights,
  getStockHealthTooltip,
  getStockHealthColor,
  getStockHealthIcon,
} from '../../../utils/materialInsights';
import styles from './StockHealthIndicator.module.css';

export default function StockHealthIndicator({ material, darkMode = false }) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const tooltipId = `stock-health-${material._id}`;

  const insights = calculateMaterialInsights(material);
  const color = getStockHealthColor(insights.stockHealth);
  const icon = getStockHealthIcon(insights.stockHealth);
  const label = insights.stockHealthLabel;
  const tooltipText = getStockHealthTooltip(material);

  return (
    <>
      <div
        id={tooltipId}
        className={`${styles.indicator} ${styles[color]} ${darkMode ? styles.darkMode : ''}`}
      >
        <span className={`${styles.icon}`} aria-label={`Stock health: ${label}`}>
          {icon}
        </span>
        <span className={`${styles.label}`}>{label}</span>
      </div>
      <Tooltip
        placement="top"
        isOpen={tooltipOpen}
        target={tooltipId}
        toggle={() => setTooltipOpen(!tooltipOpen)}
        className={darkMode ? styles.darkTooltip : ''}
      >
        {tooltipText.split('\n').map((line, idx) => (
          <div key={idx}>{line}</div>
        ))}
      </Tooltip>
    </>
  );
}

StockHealthIndicator.propTypes = {
  material: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    stockBought: PropTypes.number,
    stockUsed: PropTypes.number,
    stockAvailable: PropTypes.number,
    stockWasted: PropTypes.number,
    stockHold: PropTypes.number,
  }).isRequired,
  darkMode: PropTypes.bool,
};

StockHealthIndicator.defaultProps = {
  darkMode: false,
};
