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
  const dispatch = useDispatch();
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
      const allTeamMembersPromises = teamList.map(team => dispatch(getTeamMembers(team._id)));
      const allTeamMembers = await Promise.all(allTeamMembersPromises);
      const teamUserList = allTeamMembers.map((team, i) => ({
        teamId: teamList[i]._id,
        teamName: teamList[i].teamName,
        createdDatetime: teamList[i].createdDatetime,
        members: team.map(user => user._id),
      }));
      setAllTeamsMembers(teamUserList);
      localStorage.setItem('teamMembers', JSON.stringify(teamUserList));
    }
  };

  // Filter teams and fetch time entries in parallel
  const loadTimeEntriesForPeriod = async () => {
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
    console.log(filteredTimeEntries)

    setAllTimeEntries(filteredTimeEntries.map(entry => ({
      userId: entry.personId,
      hours: entry.hours,
      minutes: entry.minutes,
      isTangible: entry.isTangible,
      date: entry.dateOfWork,
    })));
  
    const filteredTeamEntries = teamEntries.data.filter(entry => {
      const entryDate = new Date(entry.dateOfWork);
      // console.log("Entry Date:", entryDate, "From Team Entries", entry.dateOfWork);
  
      return entryDate >= startDateObj && entryDate <= endDateObj;  // Filter to only include entries within the range
    });
    setTeamTimeEntries(filteredTeamEntries.map(entry => ({
      teamId: entry.teamId,
      hours: entry.hours,
      minutes: entry.minutes,
      isTangible: entry.isTangible,
      date: entry.dateOfWork,
      teamName: entry.teamName,
    })));
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

  // Filter teams that have contributed more than 10 hours
  const filterTenHourTeam = teamTimeList => {
    return teamTimeList.filter(team => {
      const totalTimeLogged = team.hours + team.minutes / 60.0;
      return totalTimeLogged >= 10;
    }).map(team => ({
      teamId: team.teamId,
      teamName: team.teamName,
      totalTime: (team.hours + team.minutes / 60.0).toFixed(2),
      tangibleTime: (team.tangibleHours + team.tangibleMinutes / 60.0).toFixed(2),
    }));
  };

// Group time entries by time range (month or year)
const groupByTimeRange = (objectArray, timeRange) => {
  // console.log(`Grouping ${objectArray.length} entries by ${timeRange}`);  // Log the size of the dataset

  // Limit how much we log for large datasets
  const maxLogs = 10;  // Change this to control how many entries to log
  let logCount = 0;

  return objectArray.reduce((acc, obj) => {
    const entryDate = new Date(obj.date);

    if (isNaN(entryDate.getTime())) {
      // console.warn("Invalid date detected:", obj.date);  // Log any invalid date
      return acc;  // Skip invalid dates
    }

    // Limit logging to prevent browser freeze
    if (logCount < maxLogs) {
      // console.log("Processing Entry Date:", entryDate);
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

  // Summarize time entries by month or year
  const summaryOfTimeRange = (timeRange, validTeams) => {
    const groupedEntries = Object.entries(groupByTimeRange(allTimeEntries, timeRange));
  
    // Map and filter in the same pass to improve efficiency
    return groupedEntries.reduce((acc, [date, entries]) => {
      const groupedUsers = Object.values(sumByUser(entries, 'userId'));
      const groupedTeams = Object.values(groupByTeam(groupedUsers, validTeams));
  
      // Skip teams with no contributions over 10 hours directly
      const contributingTeams = filterTenHourTeam(groupedTeams);
      if (contributingTeams.length > 0) {
        acc.push({ timeRange: date, teamsOfTime: contributingTeams });
      }
      return acc;
    }, []);
  };
  
  

  const generateBarData = (groupedDate, isYear = false) => {
    // console.log("Grouped Data for Bar Graph (Before Filtering):", groupedDate);
    // console.log(groupedDate)
    const filteredData = groupedDate.filter(range => range.teamsOfTime.length > 0);
  
    // Log filtered data to ensure non-empty groups are passed to the graph
    // console.log("Filtered Data for Bar Graph:", filteredData);
  
    return filteredData.map(range => ({
      label: isYear ? range.timeRange : `${range.timeRange}`,
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
      const filteredMonthlyData = summaryOfTimeRange('month', validTeams);
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
    console.log("I am called");
    
    const { savedTeamMemberList } = props;
  
    // Add loading state management
    setTotalTeamReportDataLoading(true);
    setTotalTeamReportDataReady(false);
  
    // Set allTeamsMembers only once savedTeamMemberList is checked
    if (savedTeamMemberList.length > 0) {
      setAllTeamsMembers(savedTeamMemberList);
    } else {
      matchTeamUser(allTeamsData).then(() => {
        // Ensure loading finishes only after all teams are matched
        loadTimeEntriesForPeriod().then(() => {
          setTotalTeamReportDataLoading(false);
          setTotalTeamReportDataReady(true);
        });
      });
    }
  
    // Create a userNameList from userProfiles
    const nameList = userProfiles.reduce((acc, user) => {
      acc[user._id] = `${user.firstName} ${user.lastName}`;
      return acc;
    }, {});
    setUserNameList(nameList);
  }, [allTeamsData, userProfiles, startDate, endDate]);  // Ensure startDate and endDate changes trigger this
  

  useEffect(() => {
    if (!totalTeamReportDataLoading && totalTeamReportDataReady) {
      setTeamInMonth([]);  // Clear monthly data
      setTeamInYear([]);   // Clear yearly data
      setShowMonthly(false);
      setShowYearly(false);
      const validTeams = filterTeamByEndDate(allTeamsMembers, endDate);
      const groupedUsers = Object.values(sumByUser(allTimeEntries, 'userId'));
      const groupedTeams = Object.values(groupByTeam(groupedUsers, validTeams));
      const contributedTeams = filterTenHourTeam(groupedTeams);
      setAllTeams(contributedTeams);
      checkPeriodForSummary();
    }
  }, [totalTeamReportDataLoading, totalTeamReportDataReady, allTeamsMembers, allTimeEntries, teamTimeEntries,startDate,endDate]);

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
              key={`${startDate}-${endDate}-month`}
              barData={teamInYear} range="year" />
            </Suspense>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      {!totalTeamReportDataReady ? (
        <Loading align="center" darkMode={darkMode} />
      ) : (
        <div>{totalTeamInfo(allTeams)}</div>
      )}
    </div>
  );
}

export default TotalTeamReport;
