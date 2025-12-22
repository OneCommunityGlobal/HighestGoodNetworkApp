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
  // Added state to show warning if month gap is less than one month
  const [showWarning, setShowWarning] = useState(false);

  const fromDate = useMemo(() => startDate.toLocaleDateString('en-CA'), [startDate]);
  const toDate = useMemo(() => endDate.toLocaleDateString('en-CA'), [endDate]);

  const userList = useMemo(() => {
    const list = userProfiles?.map(user => user._id) || [];
    // eslint-disable-next-line no-console
    console.log('TotalPeopleReport userList created:', {
      userProfilesLength: userProfiles?.length,
      userListLength: list.length,
      sampleUserIds: list.slice(0, 5),
    });
    return list;
  }, [userProfiles]);

  const loadTimeEntriesForPeriod = useCallback(
    async controller => {
      const url = ENDPOINTS.TIME_ENTRIES_REPORTS;

      if (!url) {
        setTotalPeopleReportDataLoading(false);
        return;
      }

      // Don't make API call if userList is empty
      if (!userList || userList.length === 0) {
        // eslint-disable-next-line no-console
        console.warn('TotalPeopleReport: Skipping API call - userList is empty', {
          userProfilesLength: userProfiles?.length,
          userListLength: userList?.length,
        });
        setTotalPeopleReportDataLoading(false);
        setAllTimeEntries([]);
        return;
      }

      // Check cache with date range key to ensure cache is valid for current date range
      const cacheKey = `TotalPeopleReport_${fromDate}_${toDate}`;
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        try {
          const parsedData = JSON.parse(cachedData);
          if (parsedData && Array.isArray(parsedData) && parsedData.length > 0) {
            // eslint-disable-next-line no-console
            console.log('TotalPeopleReport: Using cached data', {
              cacheKey,
              dataLength: parsedData.length,
            });
            setAllTimeEntries(parsedData);
            setTotalPeopleReportDataLoading(false);
            setTotalPeopleReportDataReady(true);
            return;
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn('TotalPeopleReport: Failed to parse cached data', e);
        }
      }

      try {
        // eslint-disable-next-line no-console
        console.log('TotalPeopleReport API Request:', {
          url,
          payload: { users: userList, fromDate, toDate },
          usersCount: userList?.length,
          userProfilesCount: userProfiles?.length,
          timestamp: new Date().toISOString(),
        });
        const res = await axios.post(
          url,
          { users: userList, fromDate, toDate },
          { signal: controller.signal },
        );
        // eslint-disable-next-line no-console
        console.log('TotalPeopleReport API Response:', {
          dataLength: res.data?.length,
          sampleData: res.data?.slice(0, 2),
          timestamp: new Date().toISOString(),
          responseTime: new Date().toISOString(),
        });
        
        const timeEntries = res.data.map(entry => ({
          userId: entry.personId,
          hours: entry.hours,
          minutes: entry.minutes,
          isTangible: entry.isTangible,
          date: entry.dateOfWork,
        }));
        
        // Log if response seems incomplete (very few entries for many users)
        if (timeEntries.length > 0 && userList.length > 100 && timeEntries.length < 10) {
          // eslint-disable-next-line no-console
          console.warn('TotalPeopleReport: Response may be incomplete', {
            timeEntriesCount: timeEntries.length,
            usersCount: userList.length,
            ratio: (timeEntries.length / userList.length * 100).toFixed(2) + '%',
            message: 'If data seems incomplete, backend may still be processing. Try refreshing in a few minutes.',
          });
        }
        
        setAllTimeEntries(timeEntries);
        
        // Cache the data with date range key
        if (timeEntries.length > 0) {
          localStorage.setItem(cacheKey, JSON.stringify(timeEntries));
          // eslint-disable-next-line no-console
          console.log('TotalPeopleReport: Data cached', { cacheKey, dataLength: timeEntries.length });
        } else {
          // eslint-disable-next-line no-console
          console.warn('TotalPeopleReport: Empty response - clearing cache', { cacheKey });
          localStorage.removeItem(cacheKey);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('TotalPeopleReport API Error:', error);
        setTotalPeopleReportDataLoading(false);
      }
    },
    [fromDate, toDate, userList, userProfiles],
  );

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

    const hours = Number(obj.hours);
    const minutes = Number(obj.minutes);

    // Sum total
    acc[key].minutes += minutes;
    acc[key].hours += hours;

    // Normalize minutes to hours if >= 60
    if (acc[key].minutes >= 60) {
      const extraHours = Math.floor(acc[key].minutes / 60);
      acc[key].hours += extraHours;
      acc[key].minutes %= 60;
    }

    // Repeat for tangible
    if (obj.isTangible) {
      acc[key].tangibleMinutes += minutes;
      acc[key].tangibleHours += hours;

      if (acc[key].tangibleMinutes >= 60) {
        const extraTangibleHours = Math.floor(acc[key].tangibleMinutes / 60);
        acc[key].tangibleHours += extraTangibleHours;
        acc[key].tangibleMinutes %= 60;
      }
    }

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

  const filterTenHourUser = useCallback(
    userTimeList => {
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
    },
    [userProfiles],
  );

  const summaryOfTimeRange = useCallback(
    timeRange => {
      const groupedEntries = Object.entries(groupByTimeRange(allTimeEntries, timeRange));
      return groupedEntries.map(([key, entries]) => {
        const groupedUsersOfTime = Object.values(sumByUser(entries, 'userId'));
        const contributedUsersOfTime = filterTenHourUser(groupedUsersOfTime);
        return { timeRange: key, usersOfTime: contributedUsersOfTime };
      });
    },
    [allTimeEntries, groupByTimeRange, sumByUser, filterTenHourUser],
  );

  const generateBarData = useCallback(
    (groupedDate, isYear = false) => {
      return generateBarDataUtil(groupedDate, isYear, startDate, endDate, 'usersOfTime');
    },
    [startDate, endDate],
  );

  const checkPeriodForSummary = useCallback(() => {
    const oneMonth = 1000 * 60 * 60 * 24 * 31;
    const diffDate = endDate - startDate;
    if (diffDate > oneMonth) {
      setPeopleInMonth(generateBarData(summaryOfTimeRange('month')));
      setPeopleInYear(generateBarData(summaryOfTimeRange('year'), true));
      if (diffDate <= oneMonth * 12) {
        setShowMonthly(true);
        setShowWarning(false);
      }
      if (startDate.getFullYear() !== endDate.getFullYear()) {
        setShowYearly(true);
        setShowWarning(false);
      }
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
      console.log('TotalPeopleReport: Waiting for userProfiles to load...', {
        userProfilesLength: userProfiles?.length,
        userListLength: userList?.length,
      });
      return;
    }

    setTotalPeopleReportDataReady(false);
    const controller = new AbortController();
    loadTimeEntriesForPeriod(controller).then(() => {
      setTotalPeopleReportDataLoading(false);
      setTotalPeopleReportDataReady(true);
    });
    return () => controller.abort();
  }, [loadTimeEntriesForPeriod, startDate, endDate, userList]);

  useEffect(() => {
    if (!totalPeopleReportDataLoading && totalPeopleReportDataReady) {
      setShowMonthly(false);
      setShowYearly(false);
      const groupedUsers = Object.values(sumByUser(allTimeEntries, 'userId'));
      const contributedUsers = filterTenHourUser(groupedUsers);
      setAllPeople(contributedUsers);
      checkPeriodForSummary();
    }
  }, [
    totalPeopleReportDataLoading,
    totalPeopleReportDataReady,
    sumByUser,
    filterTenHourUser,
    allTimeEntries,
    checkPeriodForSummary,
  ]);

  const onClickTotalPeopleDetail = () => {
    setShowTotalPeopleTable(prevState => !prevState);
  };

  const totalPeopleTable = totalPeople => (
    <table className="table table-bordered table-responsive-sm">
      <thead
        className={darkMode ? 'bg-space-cadet text-light' : ''}
        style={{ pointerEvents: 'none' }}
      >
        <tr>
          <th scope="col" id="projects__order">
            #
          </th>
          <th scope="col">Person Name</th>
          <th scope="col">Total Logged Tangible Time (Hrs)</th>
        </tr>
      </thead>
      <tbody className={darkMode ? 'bg-yinmn-blue text-light' : ''}>
        {totalPeople
          .sort((a, b) => a.firstName.localeCompare(b.firstName))
          .filter(person => person.tangibleTime > 0) // Filters out people that have 0 tangible time
          .map((person, index) => (
            <tr
              className={
                darkMode ? 'teams__tr hover-effect-reports-page-dark-mode text-light' : 'teams__tr'
              }
              id={`tr_${person.userId}`}
              key={person.userId}
            >
              <th className="teams__order--input" scope="row">
                <div>{index + 1}</div>
              </th>
              <td>
                <Link to={`/userProfile/${person.userId}`} className={darkMode ? 'text-light' : ''}>
                  {person.firstName} {person.lastName}
                </Link>
              </td>
              <td>{person.tangibleTime}</td>
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
          <span className="total-number">{allPeople.length}</span>
          <span className="total-text">members have contributed more than 10 hours.</span>
        </div>
        <div className="total-item">
          <span className="total-number">{totalTangibleTime.toFixed(2)}</span>
          <span className="total-text">hours of tangible time have been logged.</span>
        </div>
        <div>
          {showMonthly && peopleInMonth.length > 0 ? (
            <TotalReportBarGraph barData={peopleInMonth} range="month" />
          ) : null}
          {showYearly && peopleInYear.length > 0 ? (
            <TotalReportBarGraph barData={peopleInYear} range="year" />
          ) : null}
          {showWarning && <div className='total-warning'>Graphs are shown only if the selected date range is greater than one month.</div>}
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
          <div>{totalPeopleInfo(allPeople)}</div>
          <div className='tables'>{showTotalPeopleTable ? totalPeopleTable(allPeople) : null}</div>
        </div>
      )}
    </div>
  );
}

export default TotalPeopleReport;
