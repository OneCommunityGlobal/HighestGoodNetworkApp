import { useMemo } from 'react';
import Loading from '~/components/common/Loading';
import VolunteerStatusPieChart from './VolunteerStatusPieChart';

function VolunteerStatusChart({ isLoading, volunteerNumberStats, comparisonType }) {
  const chartData = useMemo(() => {
    if (!volunteerNumberStats) {
      return null;
    }

    const {
      activeVolunteers,
      deactivatedVolunteers,
      newVolunteers,
      totalVolunteers,
    } = volunteerNumberStats;

    return {
      totalVolunteers: totalVolunteers.count,
      percentageChange: Number(totalVolunteers.comparisonPercentage) || 0,
      data: [
        { label: 'Active', value: activeVolunteers.count },
        { label: 'New', value: newVolunteers.count },
        { label: 'Deactivated This Week', value: deactivatedVolunteers.count },
      ],
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

export default VolunteerStatusChart;
