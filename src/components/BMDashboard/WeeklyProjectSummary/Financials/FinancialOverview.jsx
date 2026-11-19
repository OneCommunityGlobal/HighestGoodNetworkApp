import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import { StatusCardGrid, buildStatusCards, toCardButtons } from '../StatusCards';

// Order and colors follow the "Financials: Overview" row in the HGN Phase 2 Dashboard Figma.
export const financialOverviewButtons = toCardButtons([
  ['Total Projected Cost', 'totalProjectedCost', '#E8E8FF', '#CBCBFE', '#328D1B'],
  ['Predicted Cost Overrun', 'predictedCostOverrun', '#F3FCFF', '#C1EFFB', '#328D1B'],
  ['Total Project Cost', 'totalProjectCost', '#EEF0FF', '#C9CEFB', '#328D1B'],
  ['Total Material Cost', 'totalMaterialCost', '#F3FCFF', '#C1EFFB', '#328D1B'],
  ['Total Labor Cost', 'totalLaborCost', '#FFE9FA', '#FECFF3', '#328D1B'],
  ['Total Equipment Cost', 'totalEquipmentCost', '#F0FFEE', '#BAF0B6', '#328D1B'],
]);

const EMPTY_METRICS = {};

function FinancialOverview({ requestParams, comparisonPeriodFilter }) {
  const [metrics, setMetrics] = useState(EMPTY_METRICS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!requestParams) return undefined;

    // Drop a slower, older response if the filters change while it is still loading.
    let isCurrent = true;
    setLoading(true);
    setError(null);

    axios
      .get(ENDPOINTS.BM_WEEKLY_PROJECT_SUMMARY_FINANCIAL_OVERVIEW, { params: requestParams })
      .then(response => {
        if (isCurrent) setMetrics(response.data?.current?.metrics || EMPTY_METRICS);
      })
      .catch(err => {
        if (!isCurrent) return;
        setMetrics(EMPTY_METRICS);
        setError(
          err?.response?.data?.message ||
            'Unable to load the financial overview. Please try again.',
        );
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [requestParams]);

  const cards = useMemo(
    () => buildStatusCards(financialOverviewButtons, metrics, comparisonPeriodFilter),
    [metrics, comparisonPeriodFilter],
  );

  const showComparison = comparisonPeriodFilter !== 'No Comparison' && !loading && !error;

  return (
    <>
      {loading && (
        <div role="status" aria-live="polite">
          Loading financial overview...
        </div>
      )}
      {error && <div role="alert">{error}</div>}
      <StatusCardGrid cards={cards} showComparison={showComparison} idPrefix="financial-overview" />
    </>
  );
}

FinancialOverview.propTypes = {
  requestParams: PropTypes.shape({
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    projectId: PropTypes.string,
    comparisonStartDate: PropTypes.string,
    comparisonEndDate: PropTypes.string,
  }),
  comparisonPeriodFilter: PropTypes.string.isRequired,
};

FinancialOverview.defaultProps = {
  requestParams: null,
};

export default FinancialOverview;
