import { Link } from 'react-router-dom';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';
import './TotalReport.css';
import { Button } from 'reactstrap';
import ReactTooltip from 'react-tooltip';
import TotalReportBarGraph from './TotalReportBarGraph';
import Loading from '../../common/Loading';
import { set } from 'lodash';

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

  const fromDate = useMemo(() => startDate.toLocaleDateString('en-CA'), [startDate]);
  const toDate = useMemo(() => endDate.toLocaleDateString('en-CA'), [endDate]);
  const userList = useMemo(() => userProfiles.map(user => user._id), [userProfiles]);
  const projectList = useMemo(() => projects.map(proj => proj._id), [projects]);

  const loadTimeEntriesForPeriod = useCallback(async () => {
    try {
      const url = ENDPOINTS.TIME_ENTRIES_REPORTS_TOTAL_PROJECT_REPORT;
      const timeEntries = await axios.post(url, { users: userList, fromDate, toDate }).then(res => res.data.map(entry => ({
        projectId: entry.projectId,
        projectName: entry.projectName,
        hours: entry.hours,
        minutes: entry.minutes,
        isTangible: entry.isTangible,
        date: entry.dateOfWork,
      })));

      const projUrl = ENDPOINTS.TIME_ENTRIES_LOST_PROJ_LIST;
      const projTimeEntries = await axios.post(projUrl, { projects: projectList, fromDate, toDate }).then(res => res.data.map(entry => ({
        projectId: entry.projectId,
        projectName: entry.projectName,
        hours: entry.hours,
        minutes: entry.minutes,
        isTangible: entry.isTangible,
        date: entry.dateOfWork,
      })));

      setAllTimeEntries([...timeEntries, ...projTimeEntries]);
    } catch (err) {
      console.error("API error:", err.message);
    }
  }, [fromDate, toDate, userList, projectList]);

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
      .filter(element => (element.hours + element.minutes / 60.0) >= 1)
      .map(element => ({
        projectId: element.projectId,
        projectName: element.projectName,
        totalTime: (element.hours + element.minutes / 60.0).toFixed(2),
        tangibleTime: (element.tangibleHours + element.tangibleMinutes / 60.0).toFixed(2),
      }));
  }, []);

  const summaryOfTimeRange = useCallback(timeRange => {
    const groupedEntries = Object.entries(groupByTimeRange(allTimeEntries, timeRange));
    return groupedEntries.map(([key, entries]) => {
      const groupedProjectsOfTime = Object.values(sumByProject(entries, 'projectId'));
      return { timeRange: key, projectsOfTime: filterOneHourProject(groupedProjectsOfTime) };
    });
  }, [allTimeEntries, groupByTimeRange, sumByProject, filterOneHourProject]);

  const generateBarData = useCallback((groupedDate, isYear = false) => {
    if (isYear) {
      const startMonth = startDate.getMonth();
      const endMonth = endDate.getMonth();
      const sumData = groupedDate.map(range => ({
        label: range.timeRange,
        value: range.projectsOfTime.length,
        months: 12,
      }));
      if (sumData.length > 1) {
        sumData[0].months = 12 - startMonth;
        sumData[sumData.length - 1].months = endMonth + 1;
      }
      const filteredData = sumData.filter(data => data.value > 0);
      return filteredData;
    }
    return groupedDate.map(range => ({
      label: range.timeRange,
      value: range.projectsOfTime.length,
    }));
  }, [startDate, endDate]);

  const checkPeriodForSummary = useCallback(() => {
    const oneMonth = 1000 * 60 * 60 * 24 * 31;
    const diffDate = endDate - startDate;
    if (diffDate > oneMonth) {
      setProjectInMonth(generateBarData(summaryOfTimeRange('month')));
      setProjectInYear(generateBarData(summaryOfTimeRange('year'), true));
      if (diffDate <= oneMonth * 12) setShowMonthly(true);
      if (startDate.getFullYear() !== endDate.getFullYear()) setShowYearly(true);
    }
  }, [endDate, startDate, generateBarData, summaryOfTimeRange]);


  useEffect(() => {
    setTotalProjectReportDataReady(false);
    const controller = new AbortController();
    loadTimeEntriesForPeriod(controller).then(() => {
      setTotalProjectReportDataLoading(false);
      setTotalProjectReportDataReady(true);
    });
    return () => controller.abort();
  }, [loadTimeEntriesForPeriod, startDate, endDate]);

  useEffect(() => {
    if (!totalProjectReportDataLoading && totalProjectReportDataReady) {
      setShowMonthly(false);
      setShowYearly(false);
      const groupedProjects = Object.values(sumByProject(allTimeEntries, 'projectId'));
      setAllProject(filterOneHourProject(groupedProjects));
      checkPeriodForSummary();
    }
  }, [totalProjectReportDataLoading,totalProjectReportDataReady,sumByProject, filterOneHourProject, allTimeEntries, checkPeriodForSummary]);

  const onClickTotalProjectDetail = () => setShowTotalProjectTable(prevState => !prevState);

  const totalProjectTable = totalProject => (
    <table className="table table-bordered table-responsive-sm">
      <thead className={darkMode ? 'bg-space-cadet text-light' : ''} style={{pointerEvents: 'none' }}>
        <tr>
          <th scope="col" id="projects__order">#</th>
          <th scope="col">Project Name</th>
          <th scope="col">Total Logged Time (Hrs)</th>
        </tr>
      </thead>
      <tbody className={darkMode ? 'bg-yinmn-blue text-light' : ''}>
        {totalProject.sort((a, b) => a.projectName.localeCompare(b.projectName)).map((project, index) => (
          <tr className={darkMode ? 'teams__tr hover-effect-reports-page-dark-mode text-light' : 'teams__tr'} id={`tr_${project.projectId}`} key={project.projectId}>
            <th className="teams__order--input" scope="row">
              <div>{index + 1}</div>
            </th>
            <td>
              {project.projectId ? (
                <Link to={`/projectReport/${project.projectId}`} className={darkMode ? 'text-light' : ''}>
                  {project.projectName}
                </Link>
              ) : 'Unrecorded Project'}
            </td>
            <td>{project.totalTime}</td>
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
        In the period from {startDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })} to {endDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}:
        </div>
        <div className="total-item">
          <div className="total-number">{allProject.length}</div>
          <div className="total-text">projects have been worked on more than 1 hours.</div>
        </div>
        <div className="total-item">
          <div className="total-number">{totalTangibleTime.toFixed(2)}</div>
          <div className="total-text">hours of tangible time have been logged.</div>
        </div>
        <div>
          {showMonthly && projectInMonth.length > 0 ? (
            <TotalReportBarGraph barData={projectInMonth} range="month" />
          ) : null}
          {showYearly && projectInYear.length > 0 ? (
            <TotalReportBarGraph barData={projectInYear} range="year" />
          ) : null}
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
          ""
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
          <div>{showTotalProjectTable ? totalProjectTable(allProject) : null}</div>
        </div>
      )}
    </div>
  );
}
export default TotalProjectReport;
