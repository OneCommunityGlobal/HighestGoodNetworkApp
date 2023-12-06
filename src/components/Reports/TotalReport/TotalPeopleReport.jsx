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

const TotalPeopleReport = props => {
  const [dataLoading, setDataLoading] = useState(true);
  const [dataRefresh, setDataRefresh] = useState(false);
  const [showTotalPeopleTable, setShowTotalPeopleTable] = useState(false);
  const [allTimeEntries, setAllTimeEntries] = useState([]);
  const [allPeople, setAllPeople] = useState([]);
  const [peopleInMonth, setPeopleInMonth] = useState([]);
  const [peopleInYear, setPeopleInYear] = useState([]);
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
    setAllTimeEntries(timeEntries);
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

  const summaryOfTimeRange = timeRange => {
    const groupedEntries = Object.entries(groupByTimeRange(allTimeEntries, timeRange));
    let summaryOfTime = [];
    groupedEntries.forEach(element => {
      const groupedUsersOfTime = Object.values(sumByUser(element[1], 'userId'));
      const contributedUsersOfTime = filterTenHourUser(groupedUsersOfTime);
      summaryOfTime.push({ timeRange: element[0], usersOfTime: contributedUsersOfTime });
    });
    return summaryOfTime;
  };

  const filterTenHourUser = userTimeList => {
    let filteredUsers = [];
    userTimeList.forEach(element => {
      const allTimeLogged = element.hours + element.minutes / 60.0;
      const allTangibleTimeLogged = element.tangibleHours + element.tangibleMinutes / 60.0;
      if (allTimeLogged >= 10) {
        const matchedUser = props.userProfiles.filter(user => user._id === element.userId)[0];
        filteredUsers.push({
          userId: element.userId,
          firstName: matchedUser.firstName,
          lastName: matchedUser.lastName,
          totalTime: allTimeLogged.toFixed(2),
          tangibleTime: allTangibleTimeLogged.toFixed(2),
        });
      }
    });
    return filteredUsers;
  };

  const checkPeriodForSummary = () => {
    const oneMonth = 1000 * 60 * 60 * 24 * 31;
    const diffDate = props.endDate - props.startDate;
    if (diffDate > oneMonth) {
      setPeopleInMonth(generateBarData(summaryOfTimeRange('month')));
      setPeopleInYear(generateBarData(summaryOfTimeRange('year'), true));
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
      const groupedUsers = Object.values(sumByUser(allTimeEntries, 'userId'));
      const contributedUsers = filterTenHourUser(groupedUsers);
      setAllPeople(contributedUsers);
      checkPeriodForSummary();
      setDataRefresh(false);
    }
  }, [dataRefresh]);

  const onClickTotalPeopleDetail = () => {
    const showDetail = showTotalPeopleTable;
    setShowTotalPeopleTable(!showDetail);
  };

  const totalPeopleTable = totalPeople => {
    let PeopleList = [];
    if (totalPeople.length > 0) {
      PeopleList = totalPeople
        .sort((a, b) => a.firstName.localeCompare(b.firstName))
        .map((person, index) => (
          <tr className="teams__tr" id={`tr_${person.userId}`} key={person.userId}>
            <th className="teams__order--input" scope="row">
              <div>{index + 1}</div>
            </th>
            <td>
              <Link to={`/userProfile/${person.userId}`}>
                {person.firstName} {person.lastName}
              </Link>
            </td>
            <td>{person.totalTime}</td>
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
            <th scope="col">Person Name</th>
            <th scope="col">Total Logged Time (Hrs) </th>
          </tr>
        </thead>
        <tbody>{PeopleList}</tbody>
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
          value: range.usersOfTime.length,
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
          value: range.usersOfTime.length,
        };
      });
      return sumData;
    }
  };

  const totalPeopleInfo = totalPeople => {
    const totalTangibleTime = totalPeople.reduce((acc, obj) => {
      return acc + Number(obj.tangibleTime);
    }, 0);
    return (
      <div className="total-container">
        <div className="total-title">Total People Report</div>
        <div className="total-period">
          In the period from {fromDate} to {toDate}:
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
            <Button onClick={e => onClickTotalPeopleDetail()}>
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
      {dataLoading ? (
        <Loading />
      ) : (
        <div>
          <div>{totalPeopleInfo(allPeople)}</div>
          <div>{showTotalPeopleTable ? totalPeopleTable(allPeople) : null}</div>
        </div>
      )}
    </div>
  );
};
export default TotalPeopleReport;
