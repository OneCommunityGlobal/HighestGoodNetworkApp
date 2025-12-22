import { Link } from 'react-router-dom';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { ENDPOINTS } from '~/utils/URL';
import axios from 'axios';
import './TotalReport.css';
import { Button } from 'reactstrap';
import ReactTooltip from 'react-tooltip';
import TotalReportBarGraph from './TotalReportBarGraph';
import Loading from '../../common/Loading';
import { generateBarData as generateBarDataUtil } from './generateBarData';
import {
  getCachedDataLength,
  setCachedData,
  validateUserList,
  logApiRequest,
  logApiResponse,
  compareWithCache,
} from './cacheUtils';

function TotalProjectReport(props) {
  const { startDate, endDate, userProfiles, projects, darkMode } = props;
  const [totalProjectReportDataLoading, setTotalProjectReportDataLoading] = useState(true);
  const [totalProjectReportDataReady, setTotalProjectReportDataReady] = useState(false);
  const [showTotalProjectTable, setShowTotalProjectTable] = useState(false);
  const [allTimeEntries, setAllTimeEntries] = useState([]);
  const [allProject, setAllProject] = useState([]);
  const [projectInMonth, setProjectInMonth] = useState([]);
  const [projectInYear, setProjectInYear] = useState([]);
  const [showMonthly, setShowMonthly] = useState(false);
  const [showYearly, setShowYearly] = useState(false);
  // Added state to show warning if month gap is less than one month
  const [showWarning, setShowWarning] = useState(false);

  const fromDate = useMemo(() => startDate.toLocaleDateString('en-CA'), [startDate]);
  const toDate = useMemo(() => endDate.toLocaleDateString('en-CA'), [endDate]);
  const userList = useMemo(() => {
    const list = userProfiles?.map(user => user._id) || [];
    // eslint-disable-next-line no-console
    console.log('TotalProjectReport userList created:', {
      userProfilesLength: userProfiles?.length,
      userListLength: list.length,
    });
    return list;
  }, [userProfiles]);
  const projectList = useMemo(() => {
    const list = projects?.map(proj => proj._id) || [];
    // eslint-disable-next-line no-console
    console.log('TotalProjectReport projectList created:', {
      projectsLength: projects?.length,
      projectListLength: list.length,
    });
    return list;
  }, [projects]);

  const loadTimeEntriesForPeriod = useCallback(
    async controller => {
      const reportName = 'TotalProjectReport';
      const url = ENDPOINTS.TIME_ENTRIES_REPORTS;

      // Validate userList
      if (!validateUserList(userList, userProfiles, reportName)) {
        setTotalProjectReportDataLoading(false);
        setAllTimeEntries([]);
        return;
      }

      // Check cache length for comparison (but always fetch fresh data)
      const cacheKey = `${reportName}_${fromDate}_${toDate}`;
      const cachedDataLength = getCachedDataLength(cacheKey, reportName);

      try {
        logApiRequest(reportName, url, { users: userList, fromDate, toDate }, {
          usersCount: userList?.length,
          projectsCount: projectList?.length,
        });

        const timeEntries = await axios
          .post(url, { users: userList, fromDate, toDate }, { signal: controller.signal })
          .then(res => {
            logApiResponse(`${reportName} (timeEntries)`, res.data?.length);
            return res.data.map(entry => ({
              projectId: entry.projectId,
              projectName: entry.projectName,
              hours: entry.hours,
              minutes: entry.minutes,
              isTangible: entry.isTangible,
              date: entry.dateOfWork,
            }));
          });

        logApiRequest(`${reportName} (lost projects)`, ENDPOINTS.TIME_ENTRIES_LOST_PROJ_LIST, {
          projects: projectList,
          fromDate,
          toDate,
        });

        const projTimeEntries = await axios
          .post(
            ENDPOINTS.TIME_ENTRIES_LOST_PROJ_LIST,
            { projects: projectList, fromDate, toDate },
            { signal: controller.signal },
          )
          .then(res => {
            logApiResponse(`${reportName} (lost projects)`, res.data?.length);
            return res.data.map(entry => ({
              projectId: entry.projectId,
              projectName: entry.projectName,
              hours: entry.hours,
              minutes: entry.minutes,
              isTangible: entry.isTangible,
              date: entry.dateOfWork,
            }));
          });

        if (!controller.signal.aborted) {
          const allEntries = [...timeEntries, ...projTimeEntries];
          compareWithCache(reportName, allEntries.length, cachedDataLength);
          setAllTimeEntries(allEntries);
          setCachedData(cacheKey, allEntries, reportName, cachedDataLength);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`${reportName} API Error:`, err);
        setTotalProjectReportDataLoading(false);
      }
    },
    [fromDate, toDate, userList, projectList, userProfiles],
  );

  const sumByProject = useCallback((objectArray, property) => {
    return objectArray.reduce((acc, obj) => {
      const key = obj[property];
      if (!acc[key]) {
        acc[key] = {
          projectId: key,
          projectName: obj.projectName,
          hours: 0,
          minutes: 0,
          tangibleHours: 0,
          tangibleMinutes: 0,
        };
      }
      if (obj.isTangible) {
        acc[key].tangibleHours += Number(obj.hours);
        acc[key].tangibleMinutes += Number(obj.minutes);
      }
      acc[key].hours += Number(obj.hours);
      acc[key].minutes += Number(obj.minutes);
      return acc;
    }, {});
  }, []);

  const groupByTimeRange = useCallback((objectArray, timeRange) => {
    const range = timeRange === 'month' ? 7 : 4;
    return objectArray.reduce((acc, obj) => {
      const key = obj.date.substring(0, range);
      acc[key] = acc[key] || [];
      acc[key].push(obj);
      return acc;
    }, {});
  }, []);

  const filterOneHourProject = useCallback(projectTimeList => {
    return projectTimeList
      .filter(element => element.hours + element.minutes / 60.0 >= 1)
      .map(element => ({
        projectId: element.projectId,
        projectName: element.projectName,
        totalTime: (element.hours + element.minutes / 60.0).toFixed(2),
        tangibleTime: (element.tangibleHours + element.tangibleMinutes / 60.0).toFixed(2),
      }));
  }, []);

  const summaryOfTimeRange = useCallback(
    timeRange => {
      const groupedEntries = Object.entries(groupByTimeRange(allTimeEntries, timeRange));
      return groupedEntries.map(([key, entries]) => {
        const groupedProjectsOfTime = Object.values(sumByProject(entries, 'projectId'));
        return { timeRange: key, projectsOfTime: filterOneHourProject(groupedProjectsOfTime) };
      });
    },
    [allTimeEntries, groupByTimeRange, sumByProject, filterOneHourProject],
  );

  const generateBarData = useCallback(
    (groupedDate, isYear = false) => {
      return generateBarDataUtil(groupedDate, isYear, startDate, endDate, 'projectsOfTime');
    },
    [startDate, endDate],
  );

  const checkPeriodForSummary = useCallback(() => {
    const oneMonth = 1000 * 60 * 60 * 24 * 31;
    const diffDate = endDate - startDate;
    if (diffDate > oneMonth) {
      setProjectInMonth(generateBarData(summaryOfTimeRange('month')));
      setProjectInYear(generateBarData(summaryOfTimeRange('year'), true));
      if (diffDate <= oneMonth * 12) { setShowMonthly(true); setShowWarning(false);}
      if (startDate.getFullYear() !== endDate.getFullYear()) {setShowYearly(true);setShowWarning(false);}
    }
     // if timedifference is one month
     if (diffDate <= oneMonth) {
        setShowWarning(true);
      }
  }, [endDate, startDate, generateBarData, summaryOfTimeRange]);

  useEffect(() => {
    // Only make API call if userList has data
    if (!userList || userList.length === 0) {
      // eslint-disable-next-line no-console
      console.log('TotalProjectReport: Waiting for userProfiles to load...', {
        userProfilesLength: userProfiles?.length,
        userListLength: userList?.length,
      });
      return;
    }

    setTotalProjectReportDataReady(false);
    const controller = new AbortController();

    loadTimeEntriesForPeriod(controller).then(() => {
      if (!controller.signal.aborted) {
        setTotalProjectReportDataLoading(false);
        setTotalProjectReportDataReady(true);
      }
    });

    return () => {
      controller.abort();
    };
  }, [loadTimeEntriesForPeriod, startDate, endDate, userList]);

  useEffect(() => {
    if (!totalProjectReportDataLoading && totalProjectReportDataReady) {
      setShowMonthly(false);
      setShowYearly(false);
      const groupedProjects = Object.values(sumByProject(allTimeEntries, 'projectId'));
      setAllProject(filterOneHourProject(groupedProjects));
      checkPeriodForSummary();
    }
  }, [
    totalProjectReportDataLoading,
    totalProjectReportDataReady,
    sumByProject,
    filterOneHourProject,
    allTimeEntries,
    checkPeriodForSummary,
  ]);

  const onClickTotalProjectDetail = () => setShowTotalProjectTable(prevState => !prevState);

  const totalProjectTable = totalProject => (
    <table className="details-table table table-bordered table-responsive-sm">
      <thead className={darkMode ? 'bg-space-cadet text-light' : ''} style={{ pointerEvents: 'none' }}>
        <tr>
          <th scope="col" id="projects__order">
            #
          </th>
          <th scope="col">Project Name</th>
          <th scope="col">Total Tangible Logged Time (Hrs)</th>
        </tr>
      </thead>
      <tbody className={darkMode ? 'bg-yinmn-blue text-light' : ''}>
        {totalProject
          .sort((a, b) => a.projectName.localeCompare(b.projectName))
          .filter(project => project.tangibleTime > 0) // Filters out projects that have 0 tangible time
          .map((project, index) => (
            <tr
              className={
                darkMode ? 'teams__tr hover-effect-reports-page-dark-mode text-light' : 'teams__tr'
              }
              id={`tr_${project.projectId}`}
              key={project.projectId}
            >
              <th className="teams__order--input" scope="row">
                <div>{index + 1}</div>
              </th>
              <td>
                {project.projectId ? (
                  <Link
                    to={`/projectReport/${project.projectId}`}
                    className={darkMode ? 'text-light' : ''}
                  >
                    {project.projectName}
                  </Link>
                ) : (
                  'Unrecorded Project'
                )}
              </td>
              <td>{project.tangibleTime}</td>
            </tr>
          ))}
      </tbody>
    </table>
  );

  const totalProjectInfo = totalProject => {
    const totalTangibleTime = totalProject.reduce((acc, obj) => {
      return acc + Number(obj.tangibleTime);
    }, 0);
    return (
      <div className={`total-container ${darkMode ? 'bg-yinmn-blue text-light' : ''}`}>
        <div className={`total-title ${darkMode ? 'text-azure' : ''}`}>Total Project Report</div>
        <div className="total-period">
          In the period from{' '}
          {startDate.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
          })}{' '}
          to{' '}
          {endDate.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
          })}
          :
        </div>
        <div className="total-item">
          <span className="total-number">{allProject.length}</span>
          <span className="total-text">projects have been worked on more than 1 hours.</span>
        </div>
        <div className="total-item">
          <span className="total-number">{totalTangibleTime.toFixed(2)}</span>
          <span className="total-text">hours of tangible time have been logged.</span>
        </div>
        <div>
          {showMonthly && projectInMonth.length > 0 ? (
            <TotalReportBarGraph barData={projectInMonth} range="month" />
          ) : null}
          {showYearly && projectInYear.length > 0 ? (
            <TotalReportBarGraph barData={projectInYear} range="year" />
          ) : null}
          {showWarning && <div className='total-warning'>Graphs are shown only if the selected date range is greater than one month.</div>}
        </div>
        {allProject.length ? (
          <div className="total-detail">
            {/* eslint-disable-next-line no-unused-vars */}
            <Button onClick={e => onClickTotalProjectDetail()}>
              {showTotalProjectTable ? 'Hide Details' : 'Show Details'}
            </Button>
            <i
              className="fa fa-info-circle"
              data-tip
              data-for="totalProjectDetailTip"
              data-delay-hide="0"
              aria-hidden="true"
              style={{ paddingLeft: '.32rem' }}
            />
            <ReactTooltip id="totalProjectDetailTip" place="bottom" effect="solid">
              Click this button to show or hide the list of all the projects and their total hours
              logged.
            </ReactTooltip>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div>
      {!totalProjectReportDataReady ? (
        <div style={{ textAlign: 'center' }}>
          <Loading align="center" darkMode={darkMode} />
          <div
            style={{
              width: '50%',
              height: '2px',
              backgroundColor: 'gray',
              margin: '10px auto',
            }}
          />
          <div style={{ marginTop: '10px', fontStyle: 'italic', color: 'gray' }}>
            🚀 Data is on a secret mission! 📊 Report is being generated. ✨
            <br />
            Please hang tight while we work our magic! 🧙‍♂️🔮
          </div>
        </div>
      ) : (
        <div>
          <div>{totalProjectInfo(allProject)}</div>
          <div className='tables'>{showTotalProjectTable ? totalProjectTable(allProject) : null}</div>
        </div>
      )}
    </div>
  );
}
export default TotalProjectReport;
