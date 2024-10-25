import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useDispatch } from 'react-redux';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';
import './TotalReport.css';
import { Button } from 'reactstrap';
import ReactTooltip from 'react-tooltip';
import { getTeamMembers } from '../../../actions/allTeamsAction';
import Loading from '../../common/Loading';

const LazyTotalReportBarGraph = React.lazy(() => import('./TotalReportBarGraph'));

function TotalTeamReport(props) {
  const [totalTeamReportDataLoading, setTotalTeamReportDataLoading] = useState(true);
  const [totalTeamReportDataReady, setTotalTeamReportDataReady] = useState(false);
  const [showTotalTeamTable, setShowTotalTeamTable] = useState(false);
  const [allTimeEntries, setAllTimeEntries] = useState([]);
  const [teamTimeEntries, setTeamTimeEntries] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [teamInMonth, setTeamInMonth] = useState([]);
  const [teamInYear, setTeamInYear] = useState([]);
  const [showMonthly, setShowMonthly] = useState(false);
  const [showYearly, setShowYearly] = useState(false);
  const [allTeamsMembers, setAllTeamsMembers] = useState([]);
  const [userNameList, setUserNameList] = useState({});

  const { startDate, endDate, userProfiles, allTeamsData, darkMode } = props;
  const fromDate = useMemo(() => startDate.toLocaleDateString('en-CA'), [startDate]);
  const toDate = useMemo(() => endDate.toLocaleDateString('en-CA'), [endDate]);
  const userList = useMemo(() => userProfiles.map(user => user._id), [userProfiles]);
  const teamList = useMemo(() => allTeamsData.map(team => team._id), [allTeamsData]);


  // Fetch and cache team members
  const matchTeamUser = async teamList => {
    const cachedTeamMembers = localStorage.getItem('teamMembers');
    if (cachedTeamMembers) {
      setAllTeamsMembers(JSON.parse(cachedTeamMembers));
    } else {
      // const allTeamMembersPromises = teamList.map(team => dispatch(getTeamMembers(team._id)));
      // const allTeamMembers = await Promise.all(allTeamMembersPromises);
      try {
        const allTeamsMembers=await axios.post(process.env.REACT_APP_APIENDPOINT+'/team/reports',teamList);
        const teamUserList = allTeamsMembers.data.map((team) => ({
          teamId: team._id,
          teamName: team.teamName,
          createdDatetime: team.createdDatetime,
          members: team.members.map(user => user.userId),
        }));
        // const teamUserList = allTeamMembers.map((team, i) => ({
          //   teamId: teamList[i]._id,
          //   teamName: teamList[i].teamName,
          //   createdDatetime: teamList[i].createdDatetime,
          //   members: team.map(user => user._id),
          // }));
          setAllTeamsMembers(teamUserList);
          localStorage.setItem('teamMembers', JSON.stringify(teamUserList));
        } catch (error) {
          console.log(error);
        }
    }
  };

  // Filter teams and fetch time entries in parallel
  const loadTimeEntriesForPeriod = async () => {
    // i think we need to cache timeentries data
    try{
    let tientry = localStorage.getItem('TimeEntry')
    let tmentry = localStorage.getItem("TeamEntry")
    if(tientry && tmentry && JSON.parse(tientry).length!==0 && JSON.parse(tientry).length!==0){
      setAllTimeEntries(JSON.parse(tientry))
      setTeamTimeEntries(JSON.parse(tmentry))
      return;
    }
    const [timeEntries, teamEntries] = await Promise.all([
      axios.post(ENDPOINTS.TIME_ENTRIES_REPORTS, { users: userList, fromDate, toDate }),
      axios.post(ENDPOINTS.TIME_ENTRIES_LOST_TEAM_LIST, { teams: teamList, fromDate, toDate }),
    ]);
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    // Ensure that only data from within the date range is included
    const filteredTimeEntries = timeEntries.data.filter(entry => {
      const entryDate = new Date(entry.dateOfWork); 
      return entryDate >= startDateObj && entryDate <= endDateObj;  // Filter to only include entries within the range
    });
    var filteredTime=filteredTimeEntries.map(entry => ({
      userId: entry.personId,
      hours: entry.hours,
      minutes: entry.minutes,
      isTangible: entry.isTangible,
      date: entry.dateOfWork,
    }))
    setAllTimeEntries(filteredTime);
    localStorage.setItem('TimeEntry',JSON.stringify(filteredTime))
    const filteredTeamEntries = teamEntries.data.filter(entry => {
      const entryDate = new Date(entry.dateOfWork);  
      return entryDate >= startDateObj && entryDate <= endDateObj;  // Filter to only include entries within the range
    });
    var filteredTeam=filteredTeamEntries.map(entry => ({
      teamId: entry.teamId,
      hours: entry.hours,
      minutes: entry.minutes,
      isTangible: entry.isTangible,
      date: entry.dateOfWork,
      teamName: entry.teamName,
    }))
    localStorage.setItem('TeamEntry',JSON.stringify(filteredTeam))
    setTeamTimeEntries(filteredTeam);
  }catch(error){
    console.log(error)
  }
  };
  
  // Function to sum time entries by user
  const sumByUser = (objectArray, property) => {
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
  };

  // Group time entries by team
  const groupByTeam = (userTimeSum, teamList) => {
    const accTeam = {};
    
    teamList.forEach(team => {
      const key = team.teamId;
      if (!accTeam[key]) {
        accTeam[key] = {
          teamId: key,
          teamName: team.teamName,
          hours: 0,
          minutes: 0,
          tangibleHours: 0,
          tangibleMinutes: 0,
        };
      }
      team.members.forEach(teamUser => {
        const matchedUser = userTimeSum.find(user => user.userId === teamUser);
        if (matchedUser) {
          accTeam[key].tangibleHours += matchedUser.tangibleHours;
          accTeam[key].tangibleMinutes += matchedUser.tangibleMinutes;
          accTeam[key].hours += matchedUser.hours;
          accTeam[key].minutes += matchedUser.minutes;
        }
      });
    });
    return accTeam;
  };
  
  const filterTenHourTeam = teamTimeList => {
    const filteredTeams = [];
    teamTimeList.forEach(element => {
      const allTimeLogged = element.hours + element.minutes / 60.0;
      const allTangibleTimeLogged = element.tangibleHours + element.tangibleMinutes / 60.0;
      if (allTimeLogged >= 10) {
        filteredTeams.push({
          teamId: element.teamId,
          teamName: element.teamName,
          totalTime: allTimeLogged.toFixed(2),
          tangibleTime: allTangibleTimeLogged.toFixed(2),
        });
      }
    });
    return filteredTeams;
  };

// Group time entries by time range (month or year)
const groupByTimeRange = (objectArray, timeRange) => {
  // Limit how much we log for large datasets
  const maxLogs = 10;  // Change this to control how many entries to log
  let logCount = 0;

  return objectArray.reduce((acc, obj) => {
    const entryDate = new Date(obj.date);
    
    if (isNaN(entryDate.getTime())) {
      return acc;  // Skip invalid dates
    }

    // Limit logging to prevent browser freeze
    if (logCount < maxLogs) {
      logCount++;
    }

    const entryYear = entryDate.getFullYear();
    const entryMonth = `${entryYear}-${String(entryDate.getMonth() + 1).padStart(2, '0')}`;

    // Group by year or month depending on the timeRange argument
    const key = timeRange === 'month' ? entryMonth : String(entryYear);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(obj);
    return acc;
  }, {});
};
const groupedDate = useMemo(() => {
  return groupByTimeRange(allTimeEntries, 'month'); // or 'year' based on your condition
}, [allTimeEntries]); // Dependency array ensures recalculation only when allTimeEntries changes
 
  const summaryOfTimeRange = (timeRange, validTeams, startDateObj, endDateObj) => {
    const groupedEntries = Object.entries(groupedDate);
  
    // Filter entries based on the time range (month or year) and date boundaries
    const filteredGroupedEntries = groupedEntries.filter(([date]) => {
      const entryYear = parseInt(date.substring(0, 4), 10); // Parse the year from the date string
  
      // Filter based on whether the date is within the start and end dates
      if (entryYear === startDateObj.getFullYear()) {
        // Only include months after the start date in the start year for 'month'
        return timeRange === 'month' ? new Date(date) >= startDateObj : true;
      } else if (entryYear === endDateObj.getFullYear()) {
        // Only include months before the end date in the end year for 'month'
        return timeRange === 'month' ? new Date(date) <= endDateObj : true;
      } else {
        // Include whole years between start and end year
        return entryYear > startDateObj.getFullYear() && entryYear < endDateObj.getFullYear();
      }
    });
  
    return filteredGroupedEntries.reduce((acc, [date, entries]) => {
      const groupedUsers = Object.values(sumByUser(entries, 'userId'));
      const groupedTeams = Object.values(groupByTeam(groupedUsers, validTeams));
  
      const contributingTeams = filterTenHourTeam(groupedTeams);
      if (contributingTeams.length > 0) {
        acc.push({ timeRange: date, teamsOfTime: contributingTeams });
      }
      return acc;
    }, []);
  };
  
  const generateBarData = (groupedDate, isYear = false) => {
    return groupedDate.map(range => ({
      label:  `${range.timeRange}`,
      value: range.teamsOfTime.length,
    }));

  };
  // Filter teams by end date to remove those created after the selected period
  const filterTeamByEndDate = (teams, endDateTime) => {
    return teams.filter(team => new Date(Date.parse(team.createdDatetime)) < endDateTime)
      .map(team => ({
        teamId: team.teamId,
        teamName: team.teamName,
        members: team.members,
      }));
  };

  const summaryOfTimeRangeForMultipleYears = (timeRange, validTeams, startDateObj, endDateObj) => {
    const groupedEntries = Object.entries(groupByTimeRange(allTimeEntries, timeRange));
    // Filter grouped entries to include only those within the date range
    
    const filteredGroupedEntries = groupedEntries.filter(([date]) => {
      const entryYear = parseInt(date, 10);
      if (entryYear === startDateObj.getFullYear()) {
        // Only include months after the start date in the start year
        return new Date(date) >= startDateObj;
      } else if (entryYear === endDateObj.getFullYear()) {
        // Only include months before the end date in the end year
        return new Date(date) <= endDateObj;
      } else {
        // Include whole years between start and end year
        return entryYear > startDateObj.getFullYear() && entryYear < endDateObj.getFullYear();
      }
    });
    return filteredGroupedEntries.map(([date, entries]) => {
      const groupedUsers = Object.values(sumByUser(entries, 'userId'));
      const groupedTeams = Object.values(groupByTeam(groupedUsers, validTeams));
      const contributingTeams = filterTenHourTeam(groupedTeams);
      return { timeRange: date, teamsOfTime: contributingTeams };
    });
  };

  const checkPeriodForSummary = () => {
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const validTeams = filterTeamByEndDate(allTeamsMembers, endDate);
    setTeamInMonth([]);  // Clear monthly data
    setTeamInYear([]);   // Clear yearly data
    setShowMonthly(false);
    setShowYearly(false);
    // Check if the start and end date are in the same year
    const sameYear = startDateObj.getFullYear() === endDateObj.getFullYear();
  
    if (sameYear) {
      // Use summaryOfTimeRange for date ranges within the same year (monthly data)
      const filteredMonthlyData = summaryOfTimeRange('month', validTeams, startDateObj, endDateObj);
      setTeamInMonth(generateBarData(filteredMonthlyData));
      setShowMonthly(filteredMonthlyData.length > 0);
    } else {
      // Use summaryOfTimeRangeForMultipleYears for date ranges across multiple years (yearly data)
      const filteredYearlyData = summaryOfTimeRangeForMultipleYears('year', validTeams, startDateObj, endDateObj);
      setTeamInYear(generateBarData(filteredYearlyData, true));
      setShowYearly(filteredYearlyData.length > 0);
    }
  };
  
  useEffect(() => {
    // Only process if data is ready and not loading
    if (!totalTeamReportDataLoading && totalTeamReportDataReady) {
      // Clear previous data (reset graph)
      setTeamInMonth([]);  // Clear monthly data
      setTeamInYear([]);   // Clear yearly data
      setShowMonthly(false);
      setShowYearly(false);
  
      const validTeams = filterTeamByEndDate(allTeamsMembers, endDate);
      const groupedUsers = Object.values(sumByUser(allTimeEntries, 'userId'));
      const groupedTeams = Object.values(groupByTeam(groupedUsers, validTeams));
      const contributedTeams = filterTenHourTeam(groupedTeams);
      
      // Set all teams
      setAllTeams(contributedTeams);
  
      // Check and update the graph for summary based on the period
      checkPeriodForSummary();

    }
  }, [totalTeamReportDataLoading, totalTeamReportDataReady, allTeamsMembers, allTimeEntries]);
  
  
  useEffect(() => {    
      const { savedTeamMemberList } = props;
    if (savedTeamMemberList.length > 0) {
      setAllTeamsMembers(savedTeamMemberList).then(()=>{
        loadTimeEntriesForPeriod().then(() => {
          setTotalTeamReportDataLoading(false);
          setTotalTeamReportDataReady(true);
        });
      });
    } else {
      matchTeamUser(allTeamsData).then(()=>{
        loadTimeEntriesForPeriod().then(() => {
          setTotalTeamReportDataLoading(false);
          setTotalTeamReportDataReady(true);
        });
      })
    }
    // Create a usernameList from userProfiles
    const nameList = userProfiles.reduce((acc, user) => {
      acc[user._id] = `${user.firstName} ${user.lastName}`;
      return acc;
    }, {});
    setUserNameList(nameList);
  }, [allTeamsData, userProfiles, startDate, endDate]);  // Ensure startDate and endDate changes trigger this
  
  const totalTeamInfo = totalTeam => {
    const totalTangibleTime = totalTeam.reduce((acc, obj) => acc + Number(obj.tangibleTime), 0);
    return (
      <div className={`total-container ${darkMode ? 'bg-yinmn-blue text-light' : ''}`}>
        <div className={`total-title ${darkMode ? 'text-azure' : ''}`}>Total Team Report</div>
        <div className="total-period">
          From {startDate.toLocaleDateString()} to {endDate.toLocaleDateString()}:
        </div>
        <div className="total-item">
          <div className="total-number">{totalTeam.length}</div>
          <div className="total-text">teams contributed over 10 hours.</div>
        </div>
        <div className="total-item">
          <div className="total-number">{totalTangibleTime.toFixed(2)}</div>
          <div className="total-text">hours of tangible time logged.</div>
        </div>
        <div>
          {showMonthly && teamInMonth.length > 0 && (
            <Suspense fallback={<Loading />}>
              <LazyTotalReportBarGraph 
              key={`${startDate}-${endDate}-month`}
              barData={teamInMonth} range="month" />
            </Suspense>
          )}
          {showYearly && teamInYear.length > 0 && (
            <Suspense fallback={<Loading />}>
              <LazyTotalReportBarGraph 
              key={`${startDate}-${endDate}-year`}
              barData={teamInYear} range="year" />
            </Suspense>
          )}
        </div>
        {totalTeam.length ? (
          <div className="total-detail">
              {/* eslint-disable-next-line no-unused-vars */}
                <Button onClick={e => onClickTotalTeamDetail()}>
                {showTotalTeamTable ? 'Hide Details' : 'Show Details'}
                </Button>
                <i
                className="fa fa-info-circle"
                data-tip
                data-for="totalTeamDetailTip"
                data-delay-hide="0"
                aria-hidden="true"
                style={{ paddingLeft: '.32rem' }}
                />
                <ReactTooltip id="totalTeamDetailTip" place="bottom" effect="solid">
                Click this button to show or hide the list of all the teams and their total hours
                logged.
                </ReactTooltip>
              </div>
          ) : null}
          
      </div>
    );
  };

  const onClickTotalTeamDetail = () => {
    const showDetail = showTotalTeamTable;
    setShowTotalTeamTable(!showDetail);
  };

  const onClickTeamName = teamId => {
    const elem = document.getElementById(`tr_${teamId}_child`);
    if (elem.style.display !== 'table-row') {
      elem.style.display = 'table-row';
    } else {
      elem.style.display = 'none';
    }
  };

  const getMemberName = (teamId, userNames) => {
    const nameList = [];
    allTeamsMembers
      .filter(team => team.teamId === teamId)[0]
      .members.forEach(member => {
        if(userNames[member]!==undefined){
          nameList.push(`${userNames[member]}, `);
        }
      });
    return nameList;
  };

  const totalTeamTable = (totalTeam, userNameList2) => {
    let teamList = [];
    if (totalTeam.length > 0) {
      teamList = totalTeam
        .sort((a, b) => a.teamName.localeCompare(b.teamName))
        .map((team, index) => {
          const nameList = getMemberName(team.teamId, userNameList2);
          return (
            <tbody key={team.teamId} className={darkMode ? 'bg-yinmn-blue text-light' : ''}>
              <tr id={`tr_${team.teamId}`} key={`${team.teamId}_parent`} className={darkMode ? 'hover-effect-reports-page-dark-mode text-light' : ''}>
                <th scope="row">
                  <div>{index + 1}</div>
                </th>
                <td>
                  <button
                    type="button" // Explicit type added here
                    /* eslint-disable-next-line no-unused-vars */
                    onClick={e => {
                      onClickTeamName(team.teamId);
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        onClickTeamName(team.teamId);
                      }
                    }}
                    className={darkMode ? 'text-light' : ''}
                  >
                    {team.teamName}
                  </button>
                </td>
                <td>{team.totalTime}</td>
              </tr>
              <tr
                id={`tr_${team.teamId}_child`}
                className={darkMode ? 'teams_child bg-yinmn-blue text-light' : 'teams_child'}
                key={`${team.teamId}_child`}
              >
                <td className={darkMode ? 'hover-effect-reports-page-dark-mode' : ''} colSpan={3}>Members include: {nameList}</td>
              </tr>
            </tbody>
          );
        });
    }

    return (
      <table className="table table-bordered table-responsive-sm team-table">
        <thead className={darkMode ? 'bg-space-cadet text-light' : ''} style={{pointerEvents: 'none' }}>
          <tr>
            <th scope="col" id="projects__order">
              #
            </th>
            <th scope="col">Team Name</th>
            <th scope="col">Total Logged Time (Hrs)</th>
          </tr>
        </thead>
        {teamList}
      </table>
    );
  };


  return (
    <div>
      {!totalTeamReportDataReady && allTeams!==null && allTeams!==undefined? (
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
          <div>{totalTeamInfo(allTeams)}</div>
          <div>{showTotalTeamTable ? totalTeamTable(allTeams, userNameList) : null}</div>
        </div>
      )}
    </div>
  );
}

export default TotalTeamReport;
