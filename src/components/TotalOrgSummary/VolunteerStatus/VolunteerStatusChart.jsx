import { useMemo } from 'react';
import PropTypes from 'prop-types';
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
