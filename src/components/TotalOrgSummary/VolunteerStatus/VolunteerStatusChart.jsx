import { useMemo } from 'react';
import Loading from '~/components/common/Loading';
import VolunteerStatusPieChart from './VolunteerStatusPieChart';
import MentorStatusPieChart from './MentorStatusPieChart';
import styles from './VolunteerStatusChart.module.css';

function VolunteerStatusChart({
  isLoading,
  volunteerNumberStats,
  mentorNumberStats,
  comparisonType,
}) {
  const volunteerChartData = useMemo(() => {
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

  const mentorChartData = useMemo(() => {
    if (!mentorNumberStats) {
      return null;
    }

    const { activeMentors, deactivatedMentors, newMentors, totalMentors } = mentorNumberStats;

    return {
      totalMentors: totalMentors.count,
      percentageChange: Number(totalMentors.comparisonPercentage) || 0,
      data: [
        { label: 'Active', value: activeMentors.count },
        { label: 'New', value: newMentors.count },
        { label: 'Deactivated This Week', value: deactivatedMentors.count },
      ],
    };
  }, [mentorNumberStats]);

  return (
    <section className={styles.chartRoot}>
      {isLoading ? (
        <div className="d-flex justify-content-center align-items-center">
          <div className="w-100vh">
            <Loading />
          </div>
        </div>
      ) : (
        <>
          <div className={styles.volunteerMentorChartsWrapper}>
            <div className={styles.volunteerChartSection}>
              {volunteerChartData && (
                <VolunteerStatusPieChart
                  data={volunteerChartData}
                  comparisonType={comparisonType}
                />
              )}
            </div>
            {mentorChartData && (
              <div className={styles.mentorChartSection}>
                <MentorStatusPieChart data={mentorChartData} comparisonType={comparisonType} />
              </div>
            )}
          </div>
          {(volunteerChartData || mentorChartData) && (
            <p className={styles.volunteerMentorFootnote}>
              *Does not include the “Mentor” members shown in the graph to the right.
            </p>
          )}
        </>
      )}
    </section>
  );
}

export default VolunteerStatusChart;
