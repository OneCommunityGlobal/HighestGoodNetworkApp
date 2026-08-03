/* eslint-disable*/
import { useCallback, useEffect, useState } from 'react';
import styles from './PeopleReport.module.css';
import { Link } from 'react-router-dom';
import { Spinner, Alert } from 'reactstrap';
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
import InfringementsViz from '../InfringementsViz';
import TimeEntriesViz from '../TimeEntriesViz';
import BadgeSummaryViz from '../BadgeSummaryViz';
import BadgeSummaryPreview from '../BadgeSummaryPreview';
import PeopleTableDetails from '../PeopleTableDetails';
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
    userProjects,
    auth,
    userTask
  } = props;

  const [isRehireable, setIsRehireableState] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [fromDate, setFromDate] = useState('2016-01-01')
  const [toDate, setToDate] = useState('3000-12-31')
  const [authRole, setAuthRole] = useState('')

  useEffect(() => {
    if (!match) return undefined;
    const { userId } = match.params;

    setIsLoading(true);
    Promise.all([
      getUserProfile(userId),
      getUserTasks(userId),
      getUserProjects(userId),
      getWeeklySummaries(userId),
      getTimeEntriesForPeriod(userId, fromDate, toDate),
    ])
      .catch(() => {
        // Errors are surfaced by the individual action creators; nothing to do here.
      })
      .finally(() => {
        setIsLoading(false);
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

  const totalTangibleHrs = timeEntries.period?.reduce((total, entry) => {
    return total + (entry.hours + (entry.minutes / 60));
  }, 0) || 0;
  const totalTangibleHrsRound = totalTangibleHrs === 0 ? '0' : totalTangibleHrs.toFixed(2);

  const { firstName, lastName, weeklycommittedHours } = userProfile;
  const { profilePic, role, jobTitle, endDate, _id, startDate } = userProfile;

  function UserProject(props) {
    const userProjectList = [];
    return <div>{userProjectList}</div>;
  }

  function Infringements(props) {
    const dict = {};

    // aggregate infringements
    for (let i = 0; i < props.infringements.length; i += 1) {
      if (props.infringements[i].date in dict) {
        dict[props.infringements[i].date].count += 1;
        dict[props.infringements[i].date].des.push(props.infringements[i].description);
      } else {
        dict[props.infringements[i].date] = {
          count: 1,
          des: [props.infringements[i].description],
        };
      }
    }

    const [startdate] = Object.keys(dict);
    if (startdate) {
      startdate.toString();
    }
    if (props.infringements.length > 0) {
      props.infringements.map((current, index) => (
        <tr className={styles.teams__tr} key={index}>
          <td>{index + 1}</td>
          <td>{current.date}</td>
          <td>{current.description}</td>
        </tr>
      ));
    }
    return (
      <div>
        <div />
      </div>
    );
  }

    const PeopleDataTable = () => {
    const peopleData = {
      alertVisible: false,
      taskData: [],
      color: null,
      message: '',
    };

    for (let i = 0; i < (userTask || []).length; i += 1) {
      const task = {
        taskName: '', priority: '', status: '', resources: [], active: '', assign: '',
        estimatedHours: '', _id: '', startDate: '', endDate: '', hoursBest: '',
        hoursMost: '', hoursWorst: '', whyInfo: '', endstateInfo: '', intentInfo: '',
      };
      const resourcesName = [];

      task.active = userTask[i].isActive ? 'Yes' : 'No';
      task.assign = userTask[i].isAssigned ? 'Yes' : 'No';
      task.taskName = userTask[i].taskName;
      task.priority = userTask[i].priority;
      task.status = userTask[i].status;
      const n = userTask[i].estimatedHours || 0;
      task.estimatedHours = n.toFixed(2);

      for (let j = 0; j < (userTask[i].resources || []).length; j += 1) {
        const tempResource = {
          name: userTask[i].resources[j].name,
          profilePic: userTask[i].resources[j].profilePic || '/pfp-default.png',
        };
        resourcesName.push(tempResource);
      }
      task._id = userTask[i]._id;
      task.resources.push(resourcesName);
      task.startDate = userTask[i].startedDatetime ? userTask[i].startedDatetime.split('T')[0] : 'null';
      task.endDate = userTask[i].dueDatetime ? userTask[i].dueDatetime.split('T')[0] : 'null';
      task.hoursBest = userTask[i].hoursBest;
      task.hoursMost = userTask[i].hoursMost;
      task.hoursWorst = userTask[i].hoursWorst;
      task.whyInfo = userTask[i].whyInfo;
      task.intentInfo = userTask[i].intentInfo;
      task.endstateInfo = userTask[i].endstateInfo;
      peopleData.taskData.push(task);
    }

    return (
      <PeopleTableDetails
        taskData={peopleData.taskData}
        showFilter={tangibleHoursReportedThisWeek !== 0}
        darkMode={darkMode}
      />
    );
  };

  const activeTasks = (userTask || []).reduce((accumulator, item) => {
    const incompleteTasks = (item.resources || []).filter(
      task => task.completedTask === false && task.userID === userProfile._id,
    );
    return accumulator.concat(incompleteTasks);
  }, []);

  if(isLoading) {
    return (
        <div className={styles.reportLoading}>
          <div className='fa-3x'>
            <i className={`fa fa-spinner fa-pulse ${darkMode ? 'text-azure' : ''}`}data-testid="loading-spinner"/>
          </div>
        </div>
    )
  }

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

          <PeopleTasksPieChart darkMode={darkMode} />
          <CompletedTasksPieChart darkMode={darkMode} />

          <div className={`${styles.mobilePeopleTable}`}>
            <ReportPage.ReportBlock darkMode={darkMode}>
              {isLoading ? (
                <p
                  className={`${darkMode ? styles.textLight : ''}
                d-flex align-items-center flex-row justify-content-center`}
                >
                  Loading tasks: &nbsp; <Spinner color={`${darkMode ? 'light' : 'dark'}`} />
                </p>
              ) : activeTasks.length > 0 ? (
                <>
                  <div className={`intro_date ${darkMode ? styles.textLight : ''}`}>
                    <h4>Tasks contributed</h4>
                  </div>
                  <PeopleDataTable />
                </>
              ) : (
                <Alert color="danger" style={{ margin: '0 35% ' }}>You have no tasks.</Alert>
              )}
              <div className={`${styles.infringementContainer}`}>
                <div className={`${styles.infringementContainerInner}`}>
                  <UserProject userProjects={userProjects} />
                  <Infringements
                    infringements={infringements}
                    fromDate={fromDate}
                    toDate={toDate}
                    timeEntries={timeEntries}
                  />
                  <div className={`${styles.visualizationDiv}`}>
                    <TimeEntriesViz timeEntries={timeEntries} fromDate={fromDate} toDate={toDate} darkMode={darkMode} />
                  </div>
                  <div className={`${styles.visualizationDiv}`}>
                    <InfringementsViz
                      infringements={infringements}
                      fromDate={fromDate}
                      toDate={toDate}
                      darkMode={darkMode}
                    />
                  </div>
                  <div className={`${styles.visualizationDivRow}`}>
                    <div className={`${styles.badgeSummaryDiv}`}>
                      <BadgeSummaryViz
                        authId={auth.user.userid}
                        userId={match.params.userId}
                        badges={userProfile.badgeCollection}
                      />
                    </div>
                    <div className={`${styles.badgeSummaryPreviewDiv}`}>
                      <BadgeSummaryPreview badges={userProfile.badgeCollection} darkMode={darkMode} />
                    </div>
                  </div>
                </div>
              </div>
            </ReportPage.ReportBlock>
          </div>
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