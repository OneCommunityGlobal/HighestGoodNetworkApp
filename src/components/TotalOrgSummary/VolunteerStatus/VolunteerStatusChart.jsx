import { useMemo } from 'react';
import Loading from 'components/common/Loading';
import VolunteerStatusPieChart from './VolunteerStatusPieChart';

function VolunteerStatusChart({ isLoading, volunteerNumberStats }) {
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
      percentageChange: totalVolunteers.comparisonPercentage || 0,
      data: [
        { label: 'Active', value: activeVolunteers.count },
        { label: 'New', value: newVolunteers.count },
        { label: 'Deactivated This Week', value: deactivatedVolunteers.count },
      ],
    };
  }, [volunteerNumberStats]);

  return (
    <section>
      <h3 style={{ textAlign: 'center', color: 'black' }}>Volunteer Status</h3>
      {isLoading ? (
        <div className="d-flex justify-content-center align-items-center">
          <div className="w-100vh">
            <Loading />
          </div>
        </div>
      ) : (
        <VolunteerStatusPieChart data={chartData} />
      )}
    </section>
  );
}

export default VolunteerStatusChart;
