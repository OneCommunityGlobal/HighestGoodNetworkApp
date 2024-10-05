// // eslint-disable-next-line no-unused-vars
// import React, { useEffect, useState, useMemo} from 'react';
// import { useDispatch } from 'react-redux';
// import { ENDPOINTS } from 'utils/URL';
// import axios from 'axios';
// import './TotalReport.css';
// import { Button } from 'reactstrap';
// import ReactTooltip from 'react-tooltip';
// import TotalReportBarGraph from './TotalReportBarGraph';
// import { getTeamMembers } from '../../../actions/allTeamsAction';
// import Loading from '../../common/Loading';

// function TotalTeamReport(props) {
//   const dispatch = useDispatch();
//   const [totalTeamReportDataLoading, setTotalTeamReportDataLoading] = useState(true);
//   const [totalTeamReportDataReady, setTotalTeamReportDataReady] = useState(false);
//   const [showTotalTeamTable, setShowTotalTeamTable] = useState(false);
//   const [allTimeEntries, setAllTimeEntries] = useState([]);
//   const [teamTimeEntries, setTeamTimeEntries] = useState([]);
//   const [allTeams, setAllTeams] = useState([]);
//   const [teamInMonth, setTeamInMonth] = useState([]);
//   const [teamInYear, setTeamInYear] = useState([]);
//   const [showMonthly, setShowMonthly] = useState(false);
//   const [showYearly, setShowYearly] = useState(false);
//   const [allTeamsMembers, setAllTeamsMembers] = useState([]);
//   const [userNameList, setUserNameList] = useState({});

//   const { startDate, endDate, userProfiles, allTeamsData, darkMode } = props;
//   const fromDate = useMemo(() => startDate.toLocaleDateString('en-CA'), [startDate]);
//   const toDate = useMemo(() => endDate.toLocaleDateString('en-CA'), [endDate]);
//   const userList = useMemo(() => userProfiles.map(user => user._id), [userProfiles]);
//   const teamList = useMemo(() => allTeamsData.map(team => team._id), [allTeamsData]);

//   const filterTeamByEndDate = (teams, endDateTime) => {
//     const filteredTeams = teams
//       .filter(team => new Date(Date.parse(team.createdDatetime)) < endDateTime)
//       .map(entry => {
//         return { teamId: entry.teamId, teamName: entry.teamName, members: entry.members };
//       });
//     return filteredTeams;
//   };

//   const matchTeamUser = async teamList => {
//     // get the members of each team in the team list
//     // console.log('Load team-members list');
//     const allTeamMembersPromises = teamList.map(team => dispatch(getTeamMembers(team._id)));
//     const allTeamMembers = await Promise.all(allTeamMembersPromises);
//     const teamUserList = allTeamMembers.map((team, i) => {
//       const users = team.map(user => {
//         return user._id;
//       });
//       if (users) {
//         return {
//           teamId: teamList[i]._id,
//           teamName: teamList[i].teamName,
//           createdDatetime: teamList[i].createdDatetime,
//           members: users,
//         };
//       }
//       return null;
//     });
//     setAllTeamsMembers(teamUserList);
//   };

//   const groupByTeam = (userTimeSum, teamList) => {
//     const accTeam = {};
//     teamList.forEach(team => {
//       const key = team.teamId;
//       if (!accTeam[key]) {
//         accTeam[key] = {
//           teamId: key,
//           teamName: team.teamName,
//           hours: 0,
//           minutes: 0,
//           tangibleHours: 0,
//           tangibleMinutes: 0,
//         };
//       }
//       team.members.forEach(teamUser => {
//         const matchedUser = userTimeSum.filter(user => user.userId === teamUser)[0];
//         if (matchedUser) {
//           accTeam[key].tangibleHours += matchedUser.tangibleHours;
//           accTeam[key].tangibleMinutes += matchedUser.tangibleMinutes;
//           accTeam[key].hours += matchedUser.hours;
//           accTeam[key].minutes += matchedUser.minutes;
//         }
//       });
//     });
//     teamTimeEntries?.forEach(entry => {
//       const key = entry.teamId;
//       if (!accTeam[key]) {
//         accTeam[key] = {
//           teamId: key,
//           teamName: entry.teamName,
//           hours: 0,
//           minutes: 0,
//           tangibleHours: 0,
//           tangibleMinutes: 0,
//         };
//       }
//       const hours = parseInt(entry.hours);
//       const minutes = parseInt(entry.minutes);
//       accTeam[key].hours += hours;
//       accTeam[key].minutes += minutes;
//       if(entry.isTangible){
//         accTeam[key].tangibleHours += hours;
//         accTeam[key].tangibleMinutes += minutes;
//       }
//     });
//     return accTeam;
//   };

//   const loadTimeEntriesForPeriod = async () => {
//     // get the time entries of every user in the selected time range.
//     // console.log('Load time entries within the time range');
//     let url = ENDPOINTS.TIME_ENTRIES_REPORTS;
//     const timeEntries = await axios
//       .post(url, { users: userList, fromDate, toDate })
//       .then(res => {
//         return res.data.map(entry => {
//           return {
//             userId: entry.personId,
//             hours: entry.hours,
//             minutes: entry.minutes,
//             isTangible: entry.isTangible,
//             date: entry.dateOfWork,
//           };
//         });
//       })
//       .catch(err => {
//         // eslint-disable-next-line no-console
//         console.log(err.message);
//       });
//       setAllTimeEntries(timeEntries);

//     url = ENDPOINTS.TIME_ENTRIES_LOST_TEAM_LIST;
//     const teamTimeEntries = await axios
//       .post(url, { teams: teamList, fromDate, toDate })
//       .then(res => {
//         return res.data.map(entry => {
//           return {
//             teamId: entry.teamId,
//             hours: entry.hours,
//             minutes: entry.minutes,
//             isTangible: entry.isTangible,
//             date: entry.dateOfWork,
//             teamName: entry.teamName,
//           };
//         });
//       })
//       .catch(err => {
//         console.log(err.message);
//       });
//     setTeamTimeEntries(teamTimeEntries);
//   };

//   const sumByUser = (objectArray, property) => {
//     return objectArray.reduce((acc, obj) => {
//       const key = obj[property];
//       if (!acc[key]) {
//         acc[key] = {
//           userId: key,
//           hours: 0,
//           minutes: 0,
//           tangibleHours: 0,
//           tangibleMinutes: 0,
//         };
//       }
//       if (obj.isTangible) {
//         acc[key].tangibleHours += Number(obj.hours);
//         acc[key].tangibleMinutes += Number(obj.minutes);
//       }
//       acc[key].hours += Number(obj.hours);
//       acc[key].minutes += Number(obj.minutes);
//       return acc;
//     }, {});
//   };

//   const groupByTimeRange = (objectArray, timeRange) => {
//     let range = 0;
//     if (timeRange === 'month') {
//       range = 7;
//     } else if (timeRange === 'year') {
//       range = 4;
//     } else {
//       // eslint-disable-next-line no-console
//       console.log('The time range should be month or year.');
//     }
//     return objectArray.reduce((acc, obj) => {
//       const key = obj.date.substring(0, range);
//       const month = acc[key] || [];
//       month.push(obj);
//       acc[key] = month;
//       return acc;
//     }, {});
//   };
//   const filterTenHourTeam = teamTimeList => {
//     const filteredTeams = [];
//     teamTimeList.forEach(element => {
//       const allTimeLogged = element.hours + element.minutes / 60.0;
//       const allTangibleTimeLogged = element.tangibleHours + element.tangibleMinutes / 60.0;
//       if (allTimeLogged >= 10) {
//         filteredTeams.push({
//           teamId: element.teamId,
//           teamName: element.teamName,
//           totalTime: allTimeLogged.toFixed(2),
//           tangibleTime: allTangibleTimeLogged.toFixed(2),
//         });
//       }
//     });
//     return filteredTeams;
//   };
//   const summaryOfTimeRange = (timeRange, valid) => {
//     const groupedEntries = Object.entries(groupByTimeRange(allTimeEntries, timeRange));
//     const summaryOfTime = [];
//     groupedEntries.forEach(element => {
//       const groupedUsersOfTime = Object.values(sumByUser(element[1], 'userId'));
//       const groupedTeamsOfTime = Object.values(groupByTeam(groupedUsersOfTime, valid));
//       const contributedTEamsOfTime = filterTenHourTeam(groupedTeamsOfTime);
//       summaryOfTime.push({ timeRange: element[0], teamsOfTime: contributedTEamsOfTime });
//     });
//     return summaryOfTime;
//   };
//   const generateBarData = (groupedDate, isYear = false) => {
//     if (isYear) {
//       const startMonth = startDate.getMonth();
//       const endMonth = endDate.getMonth();
//       const sumData = groupedDate.map(range => {
//         return {
//           label: range.timeRange,
//           value: range.teamsOfTime.length,
//           months: 12,
//         };
//       });
//       if (sumData.length > 1) {
//         sumData[0].months = 12 - startMonth;
//         sumData[sumData.length - 1].months = endMonth + 1;
//       }
//       return sumData;
//     }
//     const sumData = groupedDate.map(range => {
//       return {
//         label: range.timeRange,
//         value: range.teamsOfTime.length,
//       };
//     });
//     return sumData;
//   };
//   const checkPeriodForSummary = () => {
//     const oneMonth = 1000 * 60 * 60 * 24 * 31;
//     const diffDate = endDate - startDate;
//     const valid = filterTeamByEndDate(allTeamsMembers, endDate);
//     if (diffDate > oneMonth) {
//       setTeamInMonth(generateBarData(summaryOfTimeRange('month', valid)));
//       setTeamInYear(generateBarData(summaryOfTimeRange('year', valid), true));
//       if (diffDate <= oneMonth * 12) {
//         setShowMonthly(true);
//       }
//       if (startDate.getFullYear() !== endDate.getFullYear()) {
//         setShowYearly(true);
//       }
//     }
//   };

//   useEffect(() => {
//     console.log("This is useeffect 1")
//     const { savedTeamMemberList } = props;
//     if (savedTeamMemberList.length > 0) {
//       setAllTeamsMembers(savedTeamMemberList);
//     } else {
//       matchTeamUser(allTeamsData);
//     }
//     loadTimeEntriesForPeriod().then(() => {
//       setTotalTeamReportDataLoading(false);
//       setTotalTeamReportDataReady(true);
//     });
//     const nameList = {};
//     userProfiles.forEach(user => {
//       nameList[user._id] = `${user.firstName} ${user.lastName}`;
//     });
//     setUserNameList(nameList);
//     console.log("Useffect 1 ends")
//   }, []);


//   useEffect(() => {
//     console.log("This is useeffect 2")
//     const { savedTeamMemberList, passTeamMemberList } = props;

//     if (!totalTeamReportDataLoading && totalTeamReportDataReady) {
//       if (!savedTeamMemberList.length) {
//         passTeamMemberList(allTeamsMembers);
//       }
//       const valid = filterTeamByEndDate(allTeamsMembers, endDate);
//       setShowMonthly(false);
//       setShowYearly(false);
//       const groupedUsers = Object.values(sumByUser(allTimeEntries, 'userId'));
//       const groupedTeam = Object.values(groupByTeam(groupedUsers, valid));
//       const contributedTeams = filterTenHourTeam(groupedTeam);
//       setAllTeams(contributedTeams);
//       checkPeriodForSummary();
//     }
//     console.log("UseEffect 2 ends")
//   }, [totalTeamReportDataLoading, totalTeamReportDataReady, allTeamsMembers, allTimeEntries, teamTimeEntries]);

//   useEffect(() => {
//     console.log("This is use Effect 3")
//     setTotalTeamReportDataReady(false);
//     const controller = new AbortController();
//     loadTimeEntriesForPeriod(controller).then(() => {
//       setTotalTeamReportDataReady(true);
//     });
//     console.log("UseEffect 3 ends")
//     return () => {
//       controller.abort();
//     }
//   }, [startDate, endDate]);

//   const onClickTotalTeamDetail = () => {
//     const showDetail = showTotalTeamTable;
//     setShowTotalTeamTable(!showDetail);
//   };

//   const onClickTeamName = teamId => {
//     const elem = document.getElementById(`tr_${teamId}_child`);
//     if (elem.style.display !== 'table-row') {
//       elem.style.display = 'table-row';
//     } else {
//       elem.style.display = 'none';
//     }
//   };

//   const getMemberName = (teamId, userNames) => {
//     const nameList = [];
//     allTeamsMembers
//       .filter(team => team.teamId === teamId)[0]
//       .members.forEach(member => {
//         nameList.push(`${userNames[member]}, `);
//       });
//     return nameList;
//   };

//   const totalTeamTable = (totalTeam, userNameList2) => {
//     let teamList = [];
//     if (totalTeam.length > 0) {
//       teamList = totalTeam
//         .sort((a, b) => a.teamName.localeCompare(b.teamName))
//         .map((team, index) => {
//           const nameList = getMemberName(team.teamId, userNameList2);
//           return (
//             <tbody key={team.teamId}>
//               <tr id={`tr_${team.teamId}`} key={`${team.teamId}_parent`}>
//                 <th scope="row">
//                   <div>{index + 1}</div>
//                 </th>
//                 <td>
//                   <button
//                     type="button" // Explicit type added here
//                     /* eslint-disable-next-line no-unused-vars */
//                     onClick={e => {
//                       onClickTeamName(team.teamId);
//                     }}
//                     onKeyDown={e => {
//                       if (e.key === 'Enter' || e.key === ' ') {
//                         onClickTeamName(team.teamId);
//                       }
//                     }}
//                   >
//                     {team.teamName}
//                   </button>
//                 </td>
//                 <td>{team.totalTime}</td>
//               </tr>
//               <tr
//                 id={`tr_${team.teamId}_child`}
//                 className="teams_child"
//                 key={`${team.teamId}_child`}
//               >
//                 <td colSpan={3}>Members include: {nameList}</td>
//               </tr>
//             </tbody>
//           );
//         });
//     }

//     return (
//       <table className="table table-bordered table-responsive-sm team-table">
//         <thead>
//           <tr>
//             <th scope="col" id="projects__order">
//               #
//             </th>
//             <th scope="col">Team Name</th>
//             <th scope="col">Total Logged Time (Hrs)</th>
//           </tr>
//         </thead>
//         {teamList}
//       </table>
//     );
//   };

//   const totalTeamInfo = totalTeam => {
//     console.log("Total Team Info Function started")
//     const totalTangibleTime = totalTeam.reduce((acc, obj) => {
//       return acc + Number(obj.tangibleTime);
//     }, 0);
//     console.log("Total team Info Function started")
//     return (
//       <div className={`total-container ${darkMode ? 'bg-yinmn-blue text-light' : ''}`}>
//         <div className={`total-title ${darkMode ? 'text-azure' : ''}`}>Total Team Report</div>
//         <div className="total-period">
//          In the period from {startDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })} to {endDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}:
//         </div>
//         <div className="total-item">
//           <div className="total-number">{totalTeam.length}</div>
//           <div className="total-text">teams have contributed more than 10 hours.</div>
//         </div>
//         <div className="total-item">
//           <div className="total-number">{totalTangibleTime.toFixed(2)}</div>
//           <div className="total-text">hours of tangible time have been logged.</div>
//         </div>
//         <div>
//           {showMonthly && teamInMonth.length > 0 ? (
//             <TotalReportBarGraph barData={teamInMonth} range="month" />
//           ) : null}
//           {showYearly && teamInYear.length > 0 ? (
//             <TotalReportBarGraph barData={teamInYear} range="year" />
//           ) : null}
//         </div>
//         {totalTeam.length ? (
//           <div className="total-detail">
//             {/* eslint-disable-next-line no-unused-vars */}
//             <Button onClick={e => onClickTotalTeamDetail()}>
//               {showTotalTeamTable ? 'Hide Details' : 'Show Details'}
//             </Button>
//             <i
//               className="fa fa-info-circle"
//               data-tip
//               data-for="totalTeamDetailTip"
//               data-delay-hide="0"
//               aria-hidden="true"
//               style={{ paddingLeft: '.32rem' }}
//             />
//             <ReactTooltip id="totalTeamDetailTip" place="bottom" effect="solid">
//               Click this button to show or hide the list of all the teams and their total hours
//               logged.
//             </ReactTooltip>
//           </div>
//         ) : null}
//       </div>
//     );
//   };

//   return (
//     <div>
//       {!totalTeamReportDataReady ? (
//         <div>
//           <Loading align="center" darkMode={darkMode}/>
//         </div>
//       ) : (
//         <div>
//           <div>{totalTeamInfo(allTeams)}</div>
//           <div>{showTotalTeamTable ? totalTeamTable(allTeams, userNameList) : null}</div>
//         </div>
//       )}
//     </div>
//   );
// }
// export default TotalTeamReport;
// ---------------------------------------------------------------------------------------------

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
    setAllTimeEntries(timeEntries.data.filter(entry => {
      const entryDate = new Date(entry.dateOfWork);
      return entryDate >= startDateObj && entryDate <= endDateObj;  // Filter to only include entries within the range
    }).map(entry => ({
      userId: entry.personId,
      hours: entry.hours,
      minutes: entry.minutes,
      isTangible: entry.isTangible,
      date: entry.dateOfWork,
    })));
  
    setTeamTimeEntries(teamEntries.data.filter(entry => {
      const entryDate = new Date(entry.dateOfWork);
      return entryDate >= startDateObj && entryDate <= endDateObj;  // Filter to only include entries within the range
    }).map(entry => ({
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
  return objectArray.reduce((acc, obj) => {
    const key = timeRange === 'month' ? obj.date.substring(0, 7) : obj.date.substring(0, 4);  // Use YYYY-MM for month, YYYY for year
    const entryYear = obj.date.substring(0, 4);

    // Ensure that no entries from earlier years (like 2023) are included if the range is 2024
    if (parseInt(entryYear, 10) >= startDate.getFullYear()) {
      if (!acc[key]) acc[key] = [];
      acc[key].push(obj);
    }

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
    return groupedDate
      .filter(range => range.teamsOfTime.length > 0)  // Filter out empty data early
      .map(range => ({
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

  const checkPeriodForSummary = () => {
    const validTeams = filterTeamByEndDate(allTeamsMembers, endDate);
  
    const sameYear = startDate.getFullYear() === endDate.getFullYear();
    const filteredMonthlyData = summaryOfTimeRange('month', validTeams);
    const filteredYearlyData = summaryOfTimeRange('year', validTeams);
  
    // Set both monthly and yearly data
    if (sameYear) {
      setTeamInMonth(generateBarData(filteredMonthlyData));
      setShowMonthly(filteredMonthlyData.length > 0);
    } else {
      setTeamInYear(generateBarData(filteredYearlyData, true));
      setShowYearly(filteredYearlyData.length > 0);
    }
  };
  
  

  useEffect(() => {
    const { savedTeamMemberList } = props;
    if (savedTeamMemberList.length > 0) {
      setAllTeamsMembers(savedTeamMemberList);
    } else {
      matchTeamUser(allTeamsData);
    }
    loadTimeEntriesForPeriod().then(() => {
      setTotalTeamReportDataLoading(false);
      setTotalTeamReportDataReady(true);
    });
    const nameList = userProfiles.reduce((acc, user) => {
      acc[user._id] = `${user.firstName} ${user.lastName}`;
      return acc;
    }, {});
    setUserNameList(nameList);
  }, [allTeamsData, userProfiles]);

  useEffect(() => {
    if (!totalTeamReportDataLoading && totalTeamReportDataReady) {
      const validTeams = filterTeamByEndDate(allTeamsMembers, endDate);
      setShowMonthly(false);
      setShowYearly(false);
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
              <LazyTotalReportBarGraph barData={teamInMonth} range="month" />
            </Suspense>
          )}
          {showYearly && teamInYear.length > 0 && (
            <Suspense fallback={<Loading />}>
              <LazyTotalReportBarGraph barData={teamInYear} range="year" />
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
