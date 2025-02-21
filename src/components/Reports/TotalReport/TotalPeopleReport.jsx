import { Link } from 'react-router-dom';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';
import './TotalReport.css';
import { Button } from 'reactstrap';
import ReactTooltip from 'react-tooltip';
import TotalReportBarGraph from './TotalReportBarGraph';
import Loading from '../../common/Loading';

function TotalPeopleReport(props) {
  const { startDate, endDate, userProfiles, darkMode } = props;
  const [totalPeopleReportDataLoading, setTotalPeopleReportDataLoading] = useState(true);
  const [totalPeopleReportDataReady, setTotalPeopleReportDataReady] = useState(false);
  const [showTotalPeopleTable, setShowTotalPeopleTable] = useState(false);
  const [allTimeEntries, setAllTimeEntries] = useState([]);
  const [allPeople, setAllPeople] = useState([]);
  const [peopleInMonth, setPeopleInMonth] = useState([]);
  const [peopleInYear, setPeopleInYear] = useState([]);
  const [showMonthly, setShowMonthly] = useState(false);
  const [showYearly, setShowYearly] = useState(false);

  const fromDate = useMemo(() => startDate.toLocaleDateString('en-CA'), [startDate]);
  const toDate = useMemo(() => endDate.toLocaleDateString('en-CA'), [endDate]);

  const userList = useMemo(() => userProfiles.map(user => user._id), [userProfiles]);

  const loadTimeEntriesForPeriod = useCallback(async (controller) => {
    const url = ENDPOINTS.TIME_ENTRIES_REPORTS_TOTAL_PEOPLE_REPORT;
    const res = await axios.post(url, { users: userList, fromDate, toDate }, { signal: controller.signal });
    const timeEntries = res.data.map(entry => ({
      userId: entry.personId,
      hours: entry.hours,
      minutes: entry.minutes,
      isTangible: entry.isTangible,
      date: entry.dateOfWork,
    }));
    setAllTimeEntries(timeEntries);
  }, [fromDate, toDate, userList]);

  const sumByUser = useCallback((objectArray, property) => {
    return objectArray.reduce((acc, obj) => {
      const key = obj[property];
      if (!acc[key]) {
        acc[key] = {
          userId: key,
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
    let range = 0;
    if (timeRange === 'month') {
      range = 7;
    } else if (timeRange === 'year') {
      range = 4;
    }    
    return objectArray.reduce((acc, obj) => {
      const key = obj.date.substring(0, range);
      const month = acc[key] || [];
      month.push(obj);
      acc[key] = month;
      return acc;
    }, {});
  }, []);

  const filterTenHourUser = useCallback(userTimeList => {
    return userTimeList
      .filter(element => {
        const allTimeLogged = element.hours + element.minutes / 60.0;
        return allTimeLogged >= 10;
      })
      .map(element => {
        const matchedUser = userProfiles.find(user => user._id === element.userId);
        if (matchedUser) {
          const allTangibleTimeLogged = element.tangibleHours + element.tangibleMinutes / 60.0;
          return {
            userId: element.userId,
            firstName: matchedUser.firstName,
            lastName: matchedUser.lastName,
            totalTime: (element.hours + element.minutes / 60.0).toFixed(2),
            tangibleTime: allTangibleTimeLogged.toFixed(2),
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [userProfiles]);

  const summaryOfTimeRange = useCallback(timeRange => {
    const groupedEntries = Object.entries(groupByTimeRange(allTimeEntries, timeRange));
    return groupedEntries.map(([key, entries]) => {
      const groupedUsersOfTime = Object.values(sumByUser(entries, 'userId'));
      const contributedUsersOfTime = filterTenHourUser(groupedUsersOfTime);
      return { timeRange: key, usersOfTime: contributedUsersOfTime };
    });
  }, [allTimeEntries, groupByTimeRange, sumByUser, filterTenHourUser]);

  const generateBarData = useCallback((groupedDate, isYear = false) => {
    if (isYear) {
      const startMonth = startDate.getMonth();
      const endMonth = endDate.getMonth();
      const sumData = groupedDate.map(range => ({
        label: range.timeRange,
        value: range.usersOfTime.length,
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
      value: range.usersOfTime.length,
    }));
  }, [startDate, endDate]);

  const checkPeriodForSummary = useCallback(() => {
    const oneMonth = 1000 * 60 * 60 * 24 * 31;
    const diffDate = endDate - startDate;
    if (diffDate > oneMonth) {
      setPeopleInMonth(generateBarData(summaryOfTimeRange('month')));
      setPeopleInYear(generateBarData(summaryOfTimeRange('year'), true));
      if (diffDate <= oneMonth * 12) {
        setShowMonthly(true);
      }
      if (startDate.getFullYear() !== endDate.getFullYear()) {
        setShowYearly(true);
      }
    }
  }, [endDate, startDate, generateBarData, summaryOfTimeRange]);

  useEffect(() => {
    setTotalPeopleReportDataReady(false);
    const controller = new AbortController();
    loadTimeEntriesForPeriod(controller).then(() => {
      setTotalPeopleReportDataLoading(false);
      setTotalPeopleReportDataReady(true);
    });
    return () => controller.abort();
  }, [loadTimeEntriesForPeriod, startDate, endDate]);

  useEffect(() => {
    if (!totalPeopleReportDataLoading && totalPeopleReportDataReady) {
      setShowMonthly(false);
      setShowYearly(false);
      const groupedUsers = Object.values(sumByUser(allTimeEntries, 'userId'));
      const contributedUsers = filterTenHourUser(groupedUsers);
      setAllPeople(contributedUsers);
      checkPeriodForSummary();
    }
  }, [totalPeopleReportDataLoading, totalPeopleReportDataReady, sumByUser, filterTenHourUser, allTimeEntries, checkPeriodForSummary]);

  const onClickTotalPeopleDetail = () => {
    setShowTotalPeopleTable(prevState => !prevState);
  };

  const totalPeopleTable = totalPeople => (
    <table className="table table-bordered table-responsive-sm">
      <thead className={darkMode ? 'bg-space-cadet text-light' : ''} style={{pointerEvents: 'none' }}>
        <tr>
          <th scope="col" id="projects__order">#</th>
          <th scope="col">Person Name</th>
          <th scope="col">Total Logged Time (Hrs)</th>
        </tr>
      </thead>
      <tbody className={darkMode ? 'bg-yinmn-blue text-light' : ''}>
        {totalPeople
          .sort((a, b) => a.firstName.localeCompare(b.firstName))
          .map((person, index) => (
            <tr className={darkMode ? 'teams__tr hover-effect-reports-page-dark-mode text-light' : 'teams__tr'} id={`tr_${person.userId}`} key={person.userId}>
              <th className="teams__order--input" scope="row">
                <div>{index + 1}</div>
              </th>
              <td>
                <Link to={`/userProfile/${person.userId}`} className={darkMode ? 'text-light' : ''}>
                  {person.firstName} {person.lastName}
                </Link>
              </td>
              <td>{person.totalTime}</td>
            </tr>
          ))}
      </tbody>
    </table>
  );

  const totalPeopleInfo = totalPeople => {
    const totalTangibleTime = totalPeople.reduce((acc, obj) => acc + Number(obj.tangibleTime), 0);
    return (
      <div className={`total-container ${darkMode ? 'bg-yinmn-blue text-light' : ''}`}>
        <div className={`total-title ${darkMode ? 'text-azure' : ''}`}>Total People Report</div>
        <div className="total-period">
        In the period from {startDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })} to {endDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}:
        </div>
        <div className="total-item">
          <div className="total-number">{allPeople.length}</div>
          <div className="total-text">members have contributed more than 10 hours.</div>
        </div>
        <div className="total-item">
          <div className="total-number">{totalTangibleTime.toFixed(2)}</div>
          <div className="total-text">hours of tangible time have been logged.</div>
        </div>
        <div>
          {showMonthly && peopleInMonth.length > 0 ? (
            <TotalReportBarGraph barData={peopleInMonth} range="month" />
          ) : null}
          {showYearly && peopleInYear.length > 0 ? (
            <TotalReportBarGraph barData={peopleInYear} range="year" />
          ) : null}
        </div>
        {allPeople.length ? (
          <div className="total-detail">
            <Button onClick={onClickTotalPeopleDetail}>
              {showTotalPeopleTable ? 'Hide Details' : 'Show Details'}
            </Button>
            <i
              className="fa fa-info-circle"
              data-tip
              data-for="totalPeopleDetailTip"
              data-delay-hide="0"
              aria-hidden="true"
              style={{ paddingLeft: '.32rem' }}
            />
            <ReactTooltip id="totalPeopleDetailTip" place="bottom" effect="solid">
              Click this button to show or hide the list of all the people and their total hours
              logged.
            </ReactTooltip>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div>
      {!totalPeopleReportDataReady ? (
        <div style={{ textAlign: 'center' }}>
        <Loading align="center" darkMode={darkMode}/>
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
          <div>{totalPeopleInfo(allPeople)}</div>
          <div>{showTotalPeopleTable ? totalPeopleTable(allPeople) : null}</div>
        </div>
      )}
    </div>
  );
}

export default TotalPeopleReport;
