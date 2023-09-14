import { Link } from 'react-router-dom';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';
import Loading from '../../common/Loading';
import './TotalReport.css';
import { Button } from 'reactstrap';
import ReactTooltip from 'react-tooltip';
import TotalReportBarGraph from './TotalReportBarGraph';

const TotalProjectReport = props => {
  const [dataLoading, setDataLoading] = useState(true);
  const [dataRefresh, setDataRefresh] = useState(false);
  const [showTotalProjectTable, setShowTotalProjectTable] = useState(false);
  const [allTimeEntries, setAllTimeEntries] = useState([]);
  const [allProject, setAllProject] = useState([]);
  const [projectInMonth, setProjectInMonth] = useState([]);
  const [projectInYear, setProjectInYear] = useState([]);
  const [showMonthly, setShowMonthly] = useState(false);
  const [showYearly, setShowYearly] = useState(false);

  const fromDate = props.startDate.toLocaleDateString('en-CA');
  const toDate = props.endDate.toLocaleDateString('en-CA');

  const userList = props.userProfiles.map(user => user._id);

  const loadTimeEntriesForPeriod = async () => {
    const url = ENDPOINTS.TIME_ENTRIES_USER_LIST;
    const timeEntries = await axios
      .post(url, { users: userList, fromDate, toDate })
      .then(res => {
        return res.data.map(entry => {
          return {
            projectId: entry.projectId,
            projectName: entry.projectName,
            hours: entry.hours,
            minutes: entry.minutes,
            isTangible: entry.isTangible,
            date: entry.dateOfWork,
          };
        });
      })
      .catch(err => {
        console.log(err.message);
      });
    setAllTimeEntries(timeEntries);
  };

  const sumByProject = (objectArray, property) => {
    return objectArray.reduce((acc, obj) => {
      var key = obj[property];
      if (!acc[key]) {
        acc[key] = {
          projectId: key,
          projectName: obj['projectName'],
          hours: 0,
          minutes: 0,
          tangibleHours: 0,
          tangibleMinutes: 0,
        };
      }
      if (obj['isTangible']) {
        acc[key]['tangibleHours'] += Number(obj['hours']);
        acc[key]['tangibleMinutes'] += Number(obj['minutes']);
      }
      acc[key]['hours'] += Number(obj['hours']);
      acc[key]['minutes'] += Number(obj['minutes']);
      return acc;
    }, {});
  };

  const groupByTimeRange = (objectArray, timeRange) => {
    let range = 0;
    if (timeRange === 'month') {
      range = 7;
    } else if (timeRange === 'year') {
      range = 4;
    } else {
      console.log('The time range should be month or year.');
    }
    return objectArray.reduce((acc, obj) => {
      const key = obj['date'].substring(0, range);
      const month = acc[key] || [];
      month.push(obj);
      acc[key] = month;
      return acc;
    }, {});
  };

  const summaryOfTimeRange = timeRange => {
    const groupedEntries = Object.entries(groupByTimeRange(allTimeEntries, timeRange));
    let summaryOfTime = [];
    groupedEntries.forEach(element => {
      const groupedProjectsOfTime = Object.values(sumByProject(element[1], 'projectId'));
      const contributedProjectsOfTime = filterOneHourProject(groupedProjectsOfTime);
      summaryOfTime.push({ timeRange: element[0], projectsOfTime: contributedProjectsOfTime });
    });
    return summaryOfTime;
  };

  const filterOneHourProject = projectTimeList => {
    let filteredProjects = [];
    projectTimeList.forEach(element => {
      const allTimeLogged = element.hours + element.minutes / 60.0;
      const allTangibleTimeLogged = element.tangibleHours + element.tangibleMinutes / 60.0;
      if (allTimeLogged >= 1) {
        filteredProjects.push({
          projectId: element.projectId,
          projectName: element.projectName,
          totalTime: allTimeLogged.toFixed(2),
          tangibleTime: allTangibleTimeLogged.toFixed(2),
        });
      }
    });
    return filteredProjects;
  };

  const checkPeriodForSummary = () => {
    const oneMonth = 1000 * 60 * 60 * 24 * 31;
    const diffDate = props.endDate - props.startDate;
    if (diffDate > oneMonth) {
      setProjectInMonth(generateBarData(summaryOfTimeRange('month')));
      setProjectInYear(generateBarData(summaryOfTimeRange('year'), true));
      if (diffDate <= oneMonth * 12) {
        setShowMonthly(true);
      }
      if (props.startDate.getFullYear() !== props.endDate.getFullYear()) {
        setShowYearly(true);
      }
    }
  };

  useEffect(() => {
    loadTimeEntriesForPeriod().then(() => {
      setDataLoading(false);
      setDataRefresh(true);
    });
  }, [props.startDate, props.endDate]);

  useEffect(() => {
    if (!dataLoading && dataRefresh) {
      setShowMonthly(false);
      setShowYearly(false);
      const groupedProjects = Object.values(sumByProject(allTimeEntries, 'projectId'));
      const contributedProjects = filterOneHourProject(groupedProjects);
      setAllProject(contributedProjects);
      checkPeriodForSummary();
      setDataRefresh(false);
    }
  }, [dataRefresh]);

  const onClickTotalProjectDetail = () => {
    const showDetail = showTotalProjectTable;
    setShowTotalProjectTable(!showDetail);
  };

  const totalProjectTable = totalProject => {
    let ProjectList = [];
    if (totalProject.length > 0) {
      ProjectList = totalProject
        .sort((a, b) => a.projectName.localeCompare(b.projectName))
        .map((project, index) => (
          <tr className="teams__tr" id={`tr_${project.projectId}`} key={project.projectId}>
            <th className="teams__order--input" scope="row">
              <div>{index + 1}</div>
            </th>
            <td>
              {project.projectId ? (
                <Link to={`/projectReport/${project.projectId}`}>{project.projectName}</Link>
              ) : (
                'Unrecorded Project'
              )}
            </td>
            <td>{project.totalTime}</td>
          </tr>
        ));
    }

    return (
      <table className="table table-bordered table-responsive-sm">
        <thead>
          <tr>
            <th scope="col" id="projects__order">
              #
            </th>
            <th scope="col">Project Name</th>
            <th scope="col">Total Logged Time (Hrs) </th>
          </tr>
        </thead>
        <tbody>{ProjectList}</tbody>
      </table>
    );
  };

  const generateBarData = (groupedDate, isYear = false) => {
    if (isYear) {
      const startMonth = props.startDate.getMonth();
      const endMonth = props.endDate.getMonth();
      const sumData = groupedDate.map(range => {
        return {
          label: range.timeRange,
          value: range.projectsOfTime.length,
          months: 12,
        };
      });
      if (sumData.length > 1) {
        sumData[0].months = 12 - startMonth;
        sumData[sumData.length - 1].months = endMonth + 1;
      }
      return sumData;
    } else {
      const sumData = groupedDate.map(range => {
        return {
          label: range.timeRange,
          value: range.projectsOfTime.length,
        };
      });
      return sumData;
    }
  };

  const totalProjectInfo = totalProject => {
    const totalTangibleTime = totalProject.reduce((acc, obj) => {
      return acc + Number(obj.tangibleTime);
    }, 0);
    return (
      <div className="total-container">
        <div className="total-title">Total Project Report</div>
        <div className="total-period">
          In the period from {fromDate} to {toDate}:
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
      {dataLoading ? (
        <Loading />
      ) : (
        <div>
          <div>{totalProjectInfo(allProject)}</div>
          <div>{showTotalProjectTable ? totalProjectTable(allProject) : null}</div>
        </div>
      )}
    </div>
  );
};
export default TotalProjectReport;
