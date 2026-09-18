import PropTypes from 'prop-types';
import { calculateSummaryMetrics } from '../../../utils/materialInsights';
import styles from './MaterialSummaryPanel.module.css';

/**
 * MaterialSummaryPanel Component
 * Displays key material metrics in a responsive grid of cards:
 * - Total materials count
 * - Percentage and count of items at low/critical stock
 * - Percentage and count of items over usage threshold (80%)
 * - Count of items on hold
 * Uses materialInsights utility for centralized calculations
 * Supports light/dark mode with responsive design
 */
export default function MaterialSummaryPanel({ materials, darkMode = false }) {
  const metrics = calculateSummaryMetrics(materials);

  return (
    <div className={`${styles.summaryPanel} ${darkMode ? styles.darkMode : ''}`}>
      <div className={`${styles.summaryGrid}`}>
        {/* Total Materials Card */}
        <div className={`${styles.summaryCard}`}>
          <div className={`${styles.cardLabel}`}>Total Materials</div>
          <div className={`${styles.cardValue}`}>{metrics.totalMaterials}</div>
        </div>

        {/* Low Stock Card */}
        <div className={`${styles.summaryCard}`}>
          <div className={`${styles.cardLabel}`}>% at Low Stock</div>
          <div className={`${styles.cardValue}`}>
            {metrics.lowStockPercentage}%
            <span className={`${styles.cardCount}`}>({metrics.lowStockCount})</span>
          </div>
        </div>

        {/* Over Usage Card */}
        <div className={`${styles.summaryCard}`}>
          <div className={`${styles.cardLabel}`}>% Over Usage Threshold</div>
          <div className={`${styles.cardValue}`}>
            {metrics.overUsagePercentage}%
            <span className={`${styles.cardCount}`}>({metrics.overUsageCount})</span>
          </div>
        </div>

        {/* On Hold Card */}
        <div className={`${styles.summaryCard}`}>
          <div className={`${styles.cardLabel}`}>Items on Hold</div>
          <div className={`${styles.cardValue}`}>{metrics.onHoldCount}</div>
        </div>
      </div>
    </div>
  );
}

MaterialSummaryPanel.propTypes = {
  materials: PropTypes.arrayOf(
    PropTypes.shape({
      stockBought: PropTypes.number,
      stockUsed: PropTypes.number,
      stockAvailable: PropTypes.number,
      stockHold: PropTypes.number,
    }),
  ),
  darkMode: PropTypes.bool,
};

MaterialSummaryPanel.defaultProps = {
  materials: [],
  darkMode: false,
};
