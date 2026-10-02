import { useMemo } from 'react';
import PropTypes from 'prop-types';
import Loading from '~/components/common/Loading';
import DonutChart from '../DonutChart/DonutChart';
import styles from './VolunteerStatusChart.module.css';

const VOLUNTEER_COLORS = ['#4C4AF5', '#2CCCF8', '#FF00C3'];
const MENTOR_COLORS = ['#287D5A', '#2D9DA6', '#F26B38'];

function VolunteerStatusChart({
  isLoading,
  volunteerNumberStats,
  mentorNumberStats,
  comparisonType,
  darkMode,
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

    const {
      donutChartData,
      activeMentors,
      deactivatedMentors,
      newMentors,
      totalMentors,
    } = mentorNumberStats;

    let chartDataValues;
    if (donutChartData && donutChartData.existingActive !== undefined) {
      chartDataValues = [
        { label: 'Existing Active', value: donutChartData.existingActive.count },
        { label: 'New Active', value: donutChartData.newActive.count },
        { label: 'Deactivated', value: donutChartData.deactivated.count },
      ];
    } else {
      chartDataValues = [
        { label: 'Active', value: activeMentors.count },
        { label: 'New', value: newMentors.count },
        { label: 'Deactivated This Week', value: deactivatedMentors.count },
      ];
    }

    return {
      totalMentors: totalMentors.count,
      percentageChange: Number(totalMentors.comparisonPercentage) || 0,
      data: chartDataValues,
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
            {volunteerChartData && (
              <div className={styles.chartSection} data-chart="volunteer-status">
                <DonutChart
                  title="TOTAL VOLUNTEERS*"
                  totalCount={volunteerChartData.totalVolunteers}
                  percentageChange={volunteerChartData.percentageChange}
                  data={volunteerChartData.data}
                  colors={VOLUNTEER_COLORS}
                  comparisonType={comparisonType}
                  darkMode={darkMode}
                />
              </div>
            )}
            {mentorChartData && (
              <div className={styles.chartSection} data-chart="mentor-status">
                <DonutChart
                  title="TOTAL MENTORS"
                  totalCount={mentorChartData.totalMentors}
                  percentageChange={mentorChartData.percentageChange}
                  data={mentorChartData.data}
                  colors={MENTOR_COLORS}
                  comparisonType={comparisonType}
                  darkMode={darkMode}
                />
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
  darkMode: PropTypes.bool,
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
  mentorNumberStats: PropTypes.shape({
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
    activeMentors: PropTypes.shape({
      count: PropTypes.number,
    }),
    newMentors: PropTypes.shape({
      count: PropTypes.number,
    }),
    deactivatedMentors: PropTypes.shape({
      count: PropTypes.number,
    }),
    totalMentors: PropTypes.shape({
      count: PropTypes.number,
      comparisonPercentage: PropTypes.number,
    }),
  }),
};

export default VolunteerStatusChart;
