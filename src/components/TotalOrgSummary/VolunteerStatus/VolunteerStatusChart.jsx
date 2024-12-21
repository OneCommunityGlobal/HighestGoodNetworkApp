import { useMemo } from 'react';
import VolunteerStatusPieChart from './VolunteerStatusPieChart';

function VolunteerStatusChart({ volunteerNumberStats }) {
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
        { label: 'Deactivated', value: deactivatedVolunteers.count },
        { label: 'New', value: newVolunteers.count },
      ],
    };
  }, [volunteerNumberStats]);

  if (!chartData) {
    return <div>No volunteer data available</div>;
  }

  return (
    <section>
      <h3 style={{ textAlign: 'center' }}>Volunteer Status</h3>
      <VolunteerStatusPieChart data={chartData} />
    </section>
  );
}

export default VolunteerStatusChart;
