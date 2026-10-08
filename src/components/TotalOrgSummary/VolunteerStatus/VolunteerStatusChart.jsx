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

    let chartDataValues;
    let computedTotal;

    if (donutChartData && donutChartData.existingActive !== undefined) {
      const existingActive = donutChartData.existingActive.count || 0;
      const newActive = donutChartData.newActive.count || 0;
      const deactivated = donutChartData.deactivated.count || 0;

      chartDataValues = [
        { label: 'Existing Active', value: existingActive },
        { label: 'New Active', value: newActive },
        { label: 'Deactivated', value: deactivated },
      ];

      // Sum exact non-overlapping segments to prevent any inflation
      computedTotal = existingActive + newActive + deactivated;
    } else {
      const existing = activeVolunteers?.count || 0;
      const newV = newVolunteers?.count || 0;
      const deact = deactivatedVolunteers?.count || 0;

      chartDataValues = [
        { label: 'Existing Active', value: existing },
        { label: 'New Active', value: newV },
        { label: 'Deactivated', value: deact },
      ];

      computedTotal = existing + newV + deact;
    }

    return {
      totalVolunteers: computedTotal,
      percentageChange: Number(totalVolunteers?.comparisonPercentage) || 0,
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
    let computedTotal;

    if (donutChartData && donutChartData.existingActive !== undefined) {
      const existingActive = donutChartData.existingActive.count || 0;
      const newActive = donutChartData.newActive.count || 0;
      const deactivated = donutChartData.deactivated.count || 0;

      chartDataValues = [
        { label: 'Existing Active', value: existingActive },
        { label: 'New Active', value: newActive },
        { label: 'Deactivated', value: deactivated },
      ];

      computedTotal = existingActive + newActive + deactivated;
    } else {
      const active = activeMentors?.count || 0;
      const newM = newMentors?.count || 0;
      const deactM = deactivatedMentors?.count || 0;

      chartDataValues = [
        { label: 'Active', value: active },
        { label: 'New', value: newM },
        { label: 'Deactivated This Week', value: deactM },
      ];

      computedTotal = active + newM + deactM;
    }

    return {
      totalMentors: computedTotal,
      percentageChange: Number(totalMentors?.comparisonPercentage) || 0,
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
      comparisonPercentage: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
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
      comparisonPercentage: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    }),
  }),
};

export default VolunteerStatusChart;
