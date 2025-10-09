import { useMemo } from 'react';
import PropTypes from 'prop-types';
import Loading from '~/components/common/Loading';
import VolunteerStatusPieChart from './VolunteerStatusPieChart';

function VolunteerStatusChart({ isLoading, volunteerNumberStats, comparisonType }) {
  const chartData = useMemo(() => {
    if (!volunteerNumberStats) {
      return null;
    }

    const {
      donutChartData,
      activeVolunteers,
      deactivatedVolunteers,
      newVolunteers,
      totalVolunteers,
    } = volunteerNumberStats;

    // Use donutChartData if available, otherwise fall back to original structure
    let chartDataValues;
    if (donutChartData && donutChartData.existingActive !== undefined) {
      // donutChartData properties are objects with 'count' property
      chartDataValues = [
        { label: 'Existing Active', value: donutChartData.existingActive.count },
        { label: 'New Active', value: donutChartData.newActive.count },
        { label: 'Deactivated', value: donutChartData.deactivated.count },
      ];
    } else {
      // Fallback to original structure with updated labels
      chartDataValues = [
        { label: 'Existing Active', value: activeVolunteers?.count || 0 },
        { label: 'New Active', value: newVolunteers?.count || 0 },
        { label: 'Deactivated', value: deactivatedVolunteers?.count || 0 },
      ];
    }

    return {
      totalVolunteers: totalVolunteers.count,
      percentageChange: Number(totalVolunteers.comparisonPercentage) || 0,
      data: chartDataValues,
    };
  }, [volunteerNumberStats]);

  return (
    <section className="mt-4">
      {isLoading ? (
        <div className="d-flex justify-content-center align-items-center">
          <div className="w-100vh">
            <Loading />
          </div>
        </div>
      ) : (
        <VolunteerStatusPieChart data={chartData} comparisonType={comparisonType} />
      )}
    </section>
  );
}

VolunteerStatusChart.propTypes = {
  isLoading: PropTypes.bool,
  comparisonType: PropTypes.string,
  volunteerNumberStats: PropTypes.shape({
    donutChartData: PropTypes.shape({
      existingActive: PropTypes.shape({
        count: PropTypes.number,
      }),
      newActive: PropTypes.shape({
        count: PropTypes.number,
      }),
      deactivated: PropTypes.shape({
        count: PropTypes.number,
      }),
    }),
    activeVolunteers: PropTypes.shape({
      count: PropTypes.number,
    }),
    newVolunteers: PropTypes.shape({
      count: PropTypes.number,
    }),
    deactivatedVolunteers: PropTypes.shape({
      count: PropTypes.number,
    }),
    totalVolunteers: PropTypes.shape({
      count: PropTypes.number,
      comparisonPercentage: PropTypes.number,
    }),
  }),
};

export default VolunteerStatusChart;
