import { useState } from 'react';
import ActualVsPlannedCost from '../ActualVsPlannedCost/ActualVsPlannedCost';
import CostPredictionChart from '../CostPredictionChart';
import FinancialsTrackingCard from './FinancialsTrackingCard';
import SingleExpenditureCard from './SingleExpenditureCard';
import styles from './FinancialsTrackingSection.module.css';

/**
 * FinancialsTrackingSection
 *
 * Owns the view toggle for the Financials Tracking section. Both views show
 * the Actual and Planned pies side by side; they differ in the Project filter.
 * (The internal viewMode key 'stacked' is kept for the Individual view.)
 *
 * Individual View (default, viewMode 'stacked') — 4 independent cards in a
 * 2×2 grid, each pie with its own Project filter:
 *   [Actual Expenditure]  [Planned Expenditure]
 *   [Actual vs Planned]   [Placeholder]
 *
 * Comparison View (Shared Project) — 3 cards, one Project filter drives both
 * pies (combined card spans full width at top):
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
          aria-label="Individual View (Default)"
          title="Each pie has its own Project filter"
          onClick={() => setViewMode('stacked')}
        >
          <span className={styles.labelFull}>Individual View (Default)</span>
          <span className={styles.labelMed}>Individual View</span>
          <span className={styles.labelMin} aria-hidden="true">
            <svg
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="currentColor"
              className={styles.btnIcon}
              aria-hidden="true"
            >
              <rect x="0" y="0" width="5.5" height="5.5" rx="1" />
              <rect x="7.5" y="0" width="5.5" height="5.5" rx="1" />
              <rect x="0" y="7.5" width="5.5" height="5.5" rx="1" />
              <rect x="7.5" y="7.5" width="5.5" height="5.5" rx="1" />
            </svg>
            Individual
          </span>
        </button>
        <button
          type="button"
          className={`${styles.toggleBtn} ${
            viewMode === 'comparison' ? styles.toggleBtnActive : ''
          }`}
          aria-pressed={viewMode === 'comparison'}
          aria-label="Comparison View (Shared Project)"
          title="One Project filter drives both pies"
          onClick={() => setViewMode('comparison')}
        >
          <span className={styles.labelFull}>Comparison View (Shared Project)</span>
          <span className={styles.labelMed}>Comparison View</span>
          <span className={styles.labelMin} aria-hidden="true">
            <svg
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="currentColor"
              className={styles.btnIcon}
              aria-hidden="true"
            >
              <rect x="0" y="0" width="5.5" height="13" rx="1" />
              <rect x="7.5" y="0" width="5.5" height="13" rx="1" />
            </svg>
            Compare
          </span>
        </button>
      </div>

      {viewMode === 'stacked' ? (
        /* ── Individual: 2×2 grid of independent cards ──────────── */
        <div className={styles.grid}>
          <SingleExpenditureCard pieType="actual" />
          <SingleExpenditureCard pieType="planned" />
          <div className={styles.chartCard}>
            <ActualVsPlannedCost />
          </div>
          <div className={styles.chartCard}>
            <CostPredictionChart projectId={1} />
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
            <div className={styles.chartCard}>
              <CostPredictionChart projectId={1} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FinancialsTrackingSection;
