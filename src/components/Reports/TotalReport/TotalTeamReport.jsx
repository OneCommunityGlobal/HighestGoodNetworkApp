import { Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';
import Loading from '../../common/Loading';
import './TotalReport.css';
import { Button } from 'reactstrap';
import ReactTooltip from 'react-tooltip';
import TotalReportBarGraph from './TotalReportBarGraph';
import { getTeamMembers } from '../../../actions/allTeamsAction';

const TotalTeamReport = props => {
  const dispatch = useDispatch();
  const [dataLoading, setDataLoading] = useState(true);
  const [dataRefresh, setDataRefresh] = useState(false);
  const [teamMemberLoaded, setTeamMemberLoaded] = useState(false);
  const [dataReady, setDataReady] = useState(false);
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

  const fromDate = props.startDate.toLocaleDateString('en-CA');
  const toDate = props.endDate.toLocaleDateString('en-CA');
  const userList = props.userProfiles.map(user => user._id);
  const teamList = props.allTeams.map(team => team._id);

  const filterTeamByEndDate = (teams, endDate) => {
    const filteredTeams = teams
      .filter(team => new Date(Date.parse(team.createdDatetime)) < endDate)
      .map(entry => {
        return { teamId: entry.teamId, teamName: entry.teamName, members: entry.members };
      });
    return filteredTeams;
  };

  const matchTeamUser = async teamList => {
    //get the members of each team in the team list
    //console.log('Load team-members list');
    const allTeamMembersPromises = teamList.map(team => dispatch(getTeamMembers(team._id)));
    const allTeamMembers = await Promise.all(allTeamMembersPromises);
    const teamUserList = allTeamMembers.map((team, i) => {
      const users = team.map(user => {
        return user._id;
      });
      if (users) {
        return {
          teamId: teamList[i]._id,
          teamName: teamList[i].teamName,
          createdDatetime: teamList[i].createdDatetime,
          members: users,
        };
      }
    });
    setAllTeamsMembers(teamUserList);
  };

  const groupByTeam = (userTimeSum, teamList) => {
    let accTeam = {};
    teamList.map(team => {
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
      team.members.map(teamUser => {
        const matchedUser = userTimeSum.filter(user => user.userId === teamUser)[0];
        if (matchedUser) {
          accTeam[key]['tangibleHours'] += matchedUser['tangibleHours'];
          accTeam[key]['tangibleMinutes'] += matchedUser['tangibleMinutes'];
          accTeam[key]['hours'] += matchedUser['hours'];
          accTeam[key]['minutes'] += matchedUser['minutes'];
        }
      });
    });
    teamTimeEntries?.forEach(entry => {
      const key = entry.teamId;
      const hours = parseInt(entry.hours);
      const minutes = parseInt(entry.minutes);
      accTeam[key]['hours'] += hours;
      accTeam[key]['minutes'] += minutes;
      if(entry.isTangible){
        accTeam[key]['tangibleHours'] += hours;
        accTeam[key]['tangibleMinutes'] += minutes;
      }
    });
    return accTeam;
  };

  const loadTimeEntriesForPeriod = async () => {
    //get the time entries of every user in the selected time range.
    //console.log('Load time entries within the time range');
    let url = ENDPOINTS.TIME_ENTRIES_USER_LIST;
    const timeEntries = await axios
      .post(url, { users: userList, fromDate, toDate })
      .then(res => {
        return res.data.map(entry => {
          return {
            userId: entry.personId,
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

    url = ENDPOINTS.TIME_ENTRIES_LOST_TEAM_LIST;
    const teamTimeEntries = await axios
      .post(url, { teams: teamList, fromDate, toDate })
      .then(res => {
        return res.data.map(entry => {
          return {
            teamId: entry.teamId,
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
    setTeamTimeEntries(teamTimeEntries);
  };

  const sumByUser = (objectArray, property) => {
    return objectArray.reduce((acc, obj) => {
      var key = obj[property];
      if (!acc[key]) {
        acc[key] = {
          userId: key,
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

  const summaryOfTimeRange = (timeRange, valid) => {
    const groupedEntries = Object.entries(groupByTimeRange(allTimeEntries, timeRange));
    let summaryOfTime = [];
    groupedEntries.forEach(element => {
      const groupedUsersOfTime = Object.values(sumByUser(element[1], 'userId'));
      const groupedTeamsOfTime = Object.values(groupByTeam(groupedUsersOfTime, valid));
      const contributedTEamsOfTime = filterTenHourTeam(groupedTeamsOfTime);
      summaryOfTime.push({ timeRange: element[0], teamsOfTime: contributedTEamsOfTime });
    });
    return summaryOfTime;
  };

  const filterTenHourTeam = teamTimeList => {
    let filteredTeams = [];
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

  const checkPeriodForSummary = () => {
    const oneMonth = 1000 * 60 * 60 * 24 * 31;
    const diffDate = props.endDate - props.startDate;
    const valid = filterTeamByEndDate(allTeamsMembers, props.endDate);
    if (diffDate > oneMonth) {
      setTeamInMonth(generateBarData(summaryOfTimeRange('month', valid)));
      setTeamInYear(generateBarData(summaryOfTimeRange('year', valid), true));
      if (diffDate <= oneMonth * 12) {
        setShowMonthly(true);
      }
      if (props.startDate.getFullYear() !== props.endDate.getFullYear()) {
        setShowYearly(true);
      }
    }
  };

  useEffect(() => {
    //Load the team-members list (if not loaded), time entries and userId-name list.
    //console.log('First render');
    if (props.savedTeamMemberList.length > 0) {
      setAllTeamsMembers(props.savedTeamMemberList);
      setTeamMemberLoaded(true);
    } else {
      matchTeamUser(props.allTeams).then(() => {
        setTeamMemberLoaded(true);
      });
    }
    loadTimeEntriesForPeriod().then(() => {
      setDataLoading(false);
      setDataRefresh(true);
    });
    let nameList = {};
    props.userProfiles.map(user => {
      nameList[user._id] = user.firstName + ' ' + user.lastName;
    });
    setUserNameList(nameList);
  }, []);

  useEffect(() => {
    setDataReady(false);
    if (teamMemberLoaded) {
      //Re-render: reload the time entries when the date changes
      //console.log('Refresh data');
      loadTimeEntriesForPeriod().then(() => {
        setDataLoading(false);
        setDataRefresh(true);
      });
    }
  }, [props.startDate, props.endDate]);

  useEffect(() => {
    if (!dataLoading && teamMemberLoaded && dataRefresh) {
      //Re-render: action on the reloaded entry data for presentation
      //console.log('Reformat data');
      if (!props.savedTeamMemberList.length) {
        //pass the team-members list to the reports page to avoid loading it again
        props.passTeamMemberList(allTeamsMembers);
      }
      //only consider the team created before the end date
      const valid = filterTeamByEndDate(allTeamsMembers, props.endDate);
      setShowMonthly(false);
      setShowYearly(false);
      const groupedUsers = Object.values(sumByUser(allTimeEntries, 'userId'));
      const groupedTeam = Object.values(groupByTeam(groupedUsers, valid));
      const contributedTeams = filterTenHourTeam(groupedTeam);
      setAllTeams(contributedTeams);
      checkPeriodForSummary();
      setDataRefresh(false);
      setDataReady(true);
    }
  }, [dataRefresh]);

  const onClickTotalTeamDetail = () => {
    const showDetail = showTotalTeamTable;
    setShowTotalTeamTable(!showDetail);
  };

  const onClickTeamName = teamId => {
    const elem = document.getElementById(`tr_${teamId}_child`);
    if (elem.style.display != 'table-row') {
      elem.style.display = 'table-row';
    } else {
      elem.style.display = 'none';
    }
  };

  const getMemberName = (teamId, userNames) => {
    //given a team(id) and the userid-name list,
    //return the list of member names of the team
    let nameList = [];
    allTeamsMembers
      .filter(team => team.teamId === teamId)[0]
      .members.forEach(member => {
        nameList.push(userNames[member] + ', ');
      });
    return nameList;
  };

  const totalTeamTable = (totalTeam, userNameList) => {
    let teamList = [];
    if (totalTeam.length > 0) {
      teamList = totalTeam
        .sort((a, b) => a.teamName.localeCompare(b.teamName))
        .map((team, index) => {
          const nameList = getMemberName(team.teamId, userNameList);
          return (
            <tbody key={team.teamId}>
              <tr id={`tr_${team.teamId}`} key={team.teamId + '_parent'}>
                <td scope="row">
                  <div>{index + 1}</div>
                </td>
                <td
                  onClick={e => {
                    onClickTeamName(team.teamId);
                  }}
                >
                  {team.teamName}
                </td>
                <td>{team.totalTime}</td>
              </tr>
              <tr
                id={`tr_${team.teamId}_child`}
                className="teams_child"
                key={team.teamId + '_child'}
              >
                <td colSpan={3}>Members include: {nameList}</td>
              </tr>
            </tbody>
          );
        });
    }

    return (
      <table className="table table-bordered table-responsive-sm team-table">
        <thead>
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

  const generateBarData = (groupedDate, isYear = false) => {
    if (isYear) {
      const startMonth = props.startDate.getMonth();
      const endMonth = props.endDate.getMonth();
      const sumData = groupedDate.map(range => {
        return {
          label: range.timeRange,
          value: range.teamsOfTime.length,
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
          value: range.teamsOfTime.length,
        };
      });
      return sumData;
    }
  };

  const totalTeamInfo = totalTeam => {
    const totalTangibleTime = totalTeam.reduce((acc, obj) => {
      return acc + Number(obj.tangibleTime);
    }, 0);
    return (
      <div className="total-container">
        <div className="total-title">Total Team Report</div>
        <div className="total-period">
          In the period from {fromDate} to {toDate}:
        </div>
        <div className="total-item">
          <div className="total-number">{totalTeam.length}</div>
          <div className="total-text">teams have contributed more than 10 hours.</div>
        </div>
        <div className="total-item">
          <div className="total-number">{totalTangibleTime.toFixed(2)}</div>
          <div className="total-text">hours of tangible time have been logged.</div>
        </div>
        <div>
          {showMonthly && teamInMonth.length > 0 ? (
            <TotalReportBarGraph barData={teamInMonth} range="month" />
          ) : null}
          {showYearly && teamInYear.length > 0 ? (
            <TotalReportBarGraph barData={teamInYear} range="year" />
          ) : null}
        </div>
        {totalTeam.length ? (
          <div className="total-detail">
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

  return (
    <div>
      {!dataReady ? (
        <div>
          <Loading />
        </div>
      ) : (
        <div>
          <div>{totalTeamInfo(allTeams)}</div>
          <div>{showTotalTeamTable ? totalTeamTable(allTeams, userNameList) : null}</div>
        </div>
      )}
    </div>
  );
};
export default TotalTeamReport;
