/* eslint-disable*/
import { useCallback, useEffect, useState } from 'react';
import styles from './PeopleReport.module.css';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { formatDate } from '../../../utils/formatDate';
import {
  updateUserProfileProperty,
  getUserProfile,
  getUserTasks,
} from '../../../actions/userProfile';
import { getUserProjects } from '../../../actions/userProjects';
import { getWeeklySummaries } from '../../../actions/weeklySummaries';
import { getTimeEntriesForPeriod } from '../../../actions/timeEntries';
import { ReportPage } from '../sharedComponents/ReportPage';
import { getPeopleReportData } from './selectors';
import { PeopleTasksPieChart } from './components';
import { Checkbox } from '../../common/Checkbox';
import { updateRehireableStatus } from '../../../actions/userManagement';
import CompletedTasksPieChart from '~/components/Reports/PeopleReport/CompletedTasksPieChart';
import clsx from 'clsx';

function PeopleReport(props) {
  const {
    match,
    getUserProfile,
    getUserTasks,
    getUserProjects,
    getWeeklySummaries,
    getTimeEntriesForPeriod,
    userProfile,
    timeEntries,
    infringements,
    tangibleHoursReportedThisWeek,
    darkMode,
  } = props;

  const [isRehireable, setIsRehireableState] = useState(true);

  useEffect(() => {
    if (!match) return undefined;
    const { userId } = match.params;

    Promise.all([
      getUserProfile(userId),
      getUserTasks(userId),
      getUserProjects(userId),
      getWeeklySummaries(userId),
      getTimeEntriesForPeriod(userId, '2016-01-01', '3000-12-31'),
    ]).catch(() => {
      // Errors are surfaced by the individual action creators; nothing to do here.
    });

    return undefined;
  }, [
    match,
    getUserProfile,
    getUserTasks,
    getUserProjects,
    getWeeklySummaries,
    getTimeEntriesForPeriod,
  ]);

  const setRehireable = useCallback(
    async rehireValue => {
      setIsRehireableState(rehireValue);
      try {
        await updateRehireableStatus(userProfile, rehireValue);
        toast.success(`You have changed the rehireable status of this user to ${rehireValue}`);
      } catch (err) {
        // eslint-disable-next-line no-alert
        alert('An error occurred while attempting to save the rehireable status of this user.');
      }
    },
    [userProfile],
  );

  const totalTangibleHrsRound = (
    timeEntries.period?.reduce((total, entry) => {
      return total + (entry.hours + (entry.minutes / 60));
    }, 0) || 0
  ).toFixed(2);

  const { firstName, lastName, weeklycommittedHours } = userProfile;
  const { profilePic, role, jobTitle, endDate, _id, startDate } = userProfile;

  return (
    <div className={`${styles.peopleReportPage}`}>
      <div className={styles.peopleReportContainer}>
        <div className={styles.userProfile}>
          <ReportPage.ReportHeader
            src={profilePic}
            avatar={profilePic ? undefined : <FiUser />}
            isActive={userProfile.isActive}
            darkMode={darkMode}
          >
            <div
              className={`${styles.reportStats} ${darkMode ? `${styles.bgYinmnBlue} ${styles.textLight}` : ''}`}
            >
              <p>
                <Link
                  to={`/userProfile/${_id}`}
                  title="View Profile"
                  className={`${darkMode ? `${styles.textLight} ${styles.fontWeightBold}` : ''}`}
                  style={{ fontSize: '24px' }}
                >
                  {firstName} {lastName}
                </Link>
              </p>
              <div className={styles.dateInfo}>
                <div>
                  <p>Role</p>
                  <h4>{role}</h4>
                </div>
              </div>
              <div className={styles.dateInfo}>
                <div>
                  <p>Title</p>
                  <h4>{jobTitle}</h4>
                </div>
              </div>

              <div className={styles.rehireable}>
                <Checkbox
                  value={isRehireable}
                  onChange={() => setRehireable(!isRehireable)}
                  label="Rehireable"
                  darkMode={darkMode}
                  className={`${styles.reportStats} ${darkMode ? `${styles.bgYinmnBlue} ${styles.textLight}` : ''}`}
                  backgroundColorCN={darkMode ? styles.bgYinmnBlue : ''}
                  textColorCN={darkMode ? styles.textLight : ''}
                />
              </div>
              <div className={styles.dateInfo}>
                <div>
                  <p>Start Date</p>
                  <h4>{formatDate(startDate)}</h4>
                </div>
                <div>
                  <p>End Date</p>
                  <h4>{endDate ? formatDate(endDate) : 'N/A'}</h4>
                </div>
              </div>
            </div>
          </ReportPage.ReportHeader>
        </div>

        <div 
         className={styles.stats}>
          <div 
           className={clsx(styles.metrics, userProfile.isActive ? styles.fourMetrics : styles.threeMetrics)}>
            <div style={{backgroundImage: 'linear-gradient(to bottom right, #ff5e82, #e25cb2)'}} className={styles.metricCard}>
              <h3 className={styles.metricCardValue}>{weeklycommittedHours}</h3>
              <p className={styles.metricCardTitle}>Weekly Committed Hours</p>
            </div>
            {userProfile.isActive && (
              <div style={{backgroundImage: 'linear-gradient(to bottom right, #b368d2, #831ec4)'}} className={styles.metricCard}>
                <h3 className={styles.metricCardValue}>{tangibleHoursReportedThisWeek}</h3>
                <p className={styles.metricCardTitle}>Hours Logged This Week</p>
              </div>
            )}
            <div style={{backgroundImage: 'linear-gradient(to bottom right, #64b7ff, #928aef)'}} className={styles.metricCard}>
              <h3 className={styles.metricCardValue}>{(infringements || []).length}</h3>
              <p className={styles.metricCardTitle}>Blue squares</p>
            </div>
            <div style={{backgroundImage: 'linear-gradient(to bottom right, #ffdb56, #ff9145)'}} className={styles.metricCard}>
              <h3 className={styles.metricCardValue}>{totalTangibleHrsRound}</h3>
              <p className={styles.metricCardTitle}>Total Hours Logged</p>
            </div>
          </div>

          <div
           className={styles.peopleTasksPieChartWrapper}>
            <PeopleTasksPieChart darkMode={darkMode} />
          </div>
          <CompletedTasksPieChart darkMode={darkMode} 
           />
        </div>
      </div>
    </div>
  );
}

export default connect(getPeopleReportData, {
  getUserProfile,
  updateUserProfileProperty,
  getWeeklySummaries,
  getUserTasks,
  getUserProjects,
  getTimeEntriesForPeriod,
})(PeopleReport);