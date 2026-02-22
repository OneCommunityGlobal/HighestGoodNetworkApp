import { useState } from 'react';
import ActualVsPlannedCost from '../ActualVsPlannedCost/ActualVsPlannedCost';
import FinancialsTrackingCard from './FinancialsTrackingCard';
import SingleExpenditureCard from './SingleExpenditureCard';
import styles from './FinancialsTrackingSection.module.css';

/**
 * FinancialsTrackingSection
 *
 * Owns the stacked / comparison layout toggle for the Financials
 * Tracking section. Renders different card grids based on viewMode:
 *
 * Stacked (default) — 4 independent cards in a 2×2 grid:
 *   [Actual Expenditure]  [Planned Expenditure]
 *   [Actual vs Planned]   [Placeholder]
 *
 * Comparison — 3 cards (combined card spans full width at top):
 *   [Combined Expenditure Card — shared filter, both pies S-by-S]
 *   [Actual vs Planned]   [Placeholder]
 */
function FinancialsTrackingSection() {
  const [viewMode, setViewMode] = useState('stacked');

  return (
    <div className={styles.section}>
      {/* ── View-mode toggle ─────────────────────────────────────── */}
      <div className={styles.toggleGroup}>
        <button
          type="button"
          className={`${styles.toggleBtn} ${viewMode === 'stacked' ? styles.toggleBtnActive : ''}`}
          aria-pressed={viewMode === 'stacked'}
          onClick={() => setViewMode('stacked')}
        >
          Stacked View (Default)
        </button>
        <button
          type="button"
          className={`${styles.toggleBtn} ${
            viewMode === 'comparison' ? styles.toggleBtnActive : ''
          }`}
          aria-pressed={viewMode === 'comparison'}
          onClick={() => setViewMode('comparison')}
        >
          Comparison View (Side-by-Side)
        </button>
      </div>

      {viewMode === 'stacked' ? (
        /* ── Stacked: 2×2 grid of independent cards ─────────────── */
        <div className={styles.grid}>
          <SingleExpenditureCard pieType="actual" />
          <SingleExpenditureCard pieType="planned" />
          <div className={styles.chartCard}>
            <ActualVsPlannedCost />
          </div>
          <div className={styles.placeholderCard}>
            <p className={styles.placeholderText}>Coming Soon</p>
          </div>
        </div>
      ) : (
        /* ── Comparison: combined card on top, two cards below ───── */
        <div className={styles.comparisonLayout}>
          <FinancialsTrackingCard />
          <div className={styles.bottomRow}>
            <div className={styles.chartCard}>
              <ActualVsPlannedCost />
            </div>
            <div className={styles.placeholderCard}>
              <p className={styles.placeholderText}>Coming Soon</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FinancialsTrackingSection;
