import { useState } from 'react';
import ActualVsPlannedCost from '../ActualVsPlannedCost/ActualVsPlannedCost';
import CostPredictionChart from '../CostPredictionChart';
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
 *   [Actual vs Planned]   [Planned vs Actual costs tracking]
 *
 * Comparison — 3 cards (combined card spans full width at top):
 *   [Combined Expenditure Card — shared filter, both pies S-by-S]
 *   [Actual vs Planned]   [Planned vs Actual costs tracking]
 */
function FinancialsTrackingSection() {
  const [viewMode, setViewMode] = useState('stacked');
  const [selectedProjectId, setSelectedProjectId] = useState(
    () => localStorage.getItem('bm_avsp_project') || '',
  );
  const [selectedCategory, setSelectedCategory] = useState(
    () => localStorage.getItem('bm_avsp_category') || 'Overall',
  );

  const renderCostCharts = () => (
    <>
      <div className={styles.chartCard}>
        <ActualVsPlannedCost
          onProjectChange={setSelectedProjectId}
          onCategoryChange={setSelectedCategory}
        />
      </div>
      <div className={styles.chartCard}>
        {selectedProjectId ? (
          <CostPredictionChart projectId={selectedProjectId} category={selectedCategory} />
        ) : (
          <p>Select a project to view cost tracking.</p>
        )}
      </div>
    </>
  );

  return (
    <div className={styles.section}>
      {/* ── View-mode toggle ─────────────────────────────────────── */}
      <div className={styles.toggleGroup}>
        <button
          type="button"
          className={`${styles.toggleBtn} ${viewMode === 'stacked' ? styles.toggleBtnActive : ''}`}
          aria-pressed={viewMode === 'stacked'}
          aria-label="Stacked View (Default)"
          onClick={() => setViewMode('stacked')}
        >
          <span className={styles.labelFull}>Stacked View (Default)</span>
          <span className={styles.labelMed}>Stacked View</span>
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
            Stacked
          </span>
        </button>
        <button
          type="button"
          className={`${styles.toggleBtn} ${
            viewMode === 'comparison' ? styles.toggleBtnActive : ''
          }`}
          aria-pressed={viewMode === 'comparison'}
          aria-label="Comparison View (Side-by-Side)"
          onClick={() => setViewMode('comparison')}
        >
          <span className={styles.labelFull}>Comparison View (Side-by-Side)</span>
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
        /* ── Stacked: 2×2 grid of independent cards ─────────────── */
        <div className={styles.grid}>
          <SingleExpenditureCard pieType="actual" />
          <SingleExpenditureCard pieType="planned" />
          {renderCostCharts()}
        </div>
      ) : (
        /* ── Comparison: combined card on top, two cards below ───── */
        <div className={styles.comparisonLayout}>
          <FinancialsTrackingCard />
          <div className={styles.bottomRow}>{renderCostCharts()}</div>
        </div>
      )}
    </div>
  );
}

export default FinancialsTrackingSection;
