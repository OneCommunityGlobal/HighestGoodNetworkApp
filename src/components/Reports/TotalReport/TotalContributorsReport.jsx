import { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import styles from './TotalReport.module.css';
import TotalReportBarGraph from './TotalReportBarGraph';
import Loading from '../../common/Loading';
import EditableInfoModal from '../../UserProfile/EditableModal/EditableInfoModal';
import { generateBarData as generateBarDataUtil } from './generateBarData';
import {
  getCachedData,
  setCachedData,
  validateUserList,
  logApiRequest,
  logApiResponse,
} from './cacheUtils';

function TotalContributorsReport({ startDate, endDate, userProfiles, darkMode, userRole }) {
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeEntries, setTimeEntries] = useState([]);
  const [showMonthly, setShowMonthly] = useState(false);
  const [showYearly, setShowYearly] = useState(false);
  const [contributorsInMonth, setContributorsInMonth] = useState([]);
  const [contributorsInYear, setContributorsInYear] = useState([]);

  const fromDate = useMemo(() => startDate.toLocaleDateString('en-CA'), [startDate]);
  const toDate = useMemo(() => endDate.toLocaleDateString('en-CA'), [endDate]);
  const userList = useMemo(() => {
    const list = userProfiles?.map(({ _id }) => _id) || [];
    // eslint-disable-next-line no-console
    console.log('TotalContributorsReport userList created:', {
      userProfilesLength: userProfiles?.length,
      userListLength: list.length,
    });
    return list;
  }, [userProfiles]);

  // Fetch time entries for the selected period
  const loadTimeEntriesForPeriod = useCallback(async (controller) => {
    const reportName = 'TotalContributorsReport';
    const url = ENDPOINTS.TIME_ENTRIES_REPORTS;

    if (!url) {
      return;
    }

    // Validate userList
    if (!validateUserList(userList, userProfiles, reportName)) {
      setTimeEntries([]);
      setLoading(false);
      return;
    }

    // Check cache with date range key
    const cacheKey = `${reportName}_${fromDate}_${toDate}`;
    const cached = getCachedData(cacheKey, reportName);
    if (cached.data) {
      setTimeEntries(cached.data);
      setLoading(false);
      return;
    }

    try {
      logApiRequest(reportName, url, { users: userList, fromDate, toDate }, {
        usersCount: userList?.length,
      });

      const response = await axios.post(
        url,
        { users: userList, fromDate, toDate },
        { signal: controller.signal }
      );

      logApiResponse(reportName, response.data?.length);

      const mappedTimeEntries = response.data.map(entry => ({
        userId: entry.personId,
        hours: entry.hours,
        minutes: entry.minutes,
        isTangible: entry.isTangible,
        date: entry.dateOfWork,
      }));

      setTimeEntries(mappedTimeEntries);
      setCachedData(cacheKey, mappedTimeEntries, reportName);
    } catch (error) {
      // eslint-disable-next-line import/no-named-as-default-member
      if (!axios.isCancel(error)) {
        // eslint-disable-next-line no-console
        console.error(`${reportName} API Error:`, error);
        setTimeEntries([]);
      }
    }
  }, [fromDate, toDate, userList, userProfiles]);

  // Group time entries by user and calculate total hours
  const sumByUser = useCallback((entries) => {
    return entries.reduce((acc, { userId, hours = 0, minutes = 0, tangibleTime = 0 }) => {
      if (!acc[userId]) {
        acc[userId] = {
          userId,
          hours: 0,
          minutes: 0,
          tangibleTime: 0,
        };
      }
      acc[userId].hours += hours;
      acc[userId].minutes += minutes;
      acc[userId].tangibleTime += tangibleTime;
      return acc;
    }, {});
  }, []);

  // Filter users who have contributed more than 10 hours
  const filterContributors = useCallback((users) => {
    return users.filter(user => 
      (user.hours + user.minutes/60) >= 10
    );
  }, []);

  // Group entries by time range (month/year)
  const groupByTimeRange = useCallback((entries, timeRange) => {
    return entries.reduce((acc, entry) => {
      const date = new Date(entry.date);
      const key = timeRange === 'month' 
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        : `${date.getFullYear()}`;
      
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(entry);
      return acc;
    }, {});
  }, []);

  // Generate summary data for the specified time range
  const summaryOfTimeRange = useCallback((timeRange) => {
    const groupedEntries = Object.entries(groupByTimeRange(timeEntries, timeRange));
    return groupedEntries.map(([key, entries]) => {
      const groupedUsers = Object.values(sumByUser(entries));
      const contributedUsers = filterContributors(groupedUsers);
      return { timeRange: key, usersOfTime: contributedUsers };
    });
  }, [timeEntries, groupByTimeRange, sumByUser, filterContributors]);

  // Generate bar chart data
  const generateBarData = useCallback((groupedDate, isYear = false) => {
    return generateBarDataUtil(groupedDate, isYear, startDate, endDate, 'usersOfTime');
  }, [startDate, endDate]);

  // Check if we should show monthly/yearly summaries
  const checkPeriodForSummary = useCallback(() => {
    const oneMonth = 1000 * 60 * 60 * 24 * 31;
    const diffDate = endDate - startDate;
    if (diffDate > oneMonth) {
      setContributorsInMonth(generateBarData(summaryOfTimeRange('month')));
      setContributorsInYear(generateBarData(summaryOfTimeRange('year'), true));
      if (diffDate <= oneMonth * 12) {
        setShowMonthly(true);
      }
      if (startDate.getFullYear() !== endDate.getFullYear()) {
        setShowYearly(true);
      }
    }
  }, [endDate, startDate, generateBarData, summaryOfTimeRange]);

  // Load data when date range changes
  useEffect(() => {
    // Only make API call if userList has data
    if (!userList || userList.length === 0) {
      // eslint-disable-next-line no-console
      console.log('TotalContributorsReport: Waiting for userProfiles to load...', {
        userProfilesLength: userProfiles?.length,
        userListLength: userList?.length,
      });
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    loadTimeEntriesForPeriod(controller).then(() => {
      setLoading(false);
    });
    return () => controller.abort();
  }, [loadTimeEntriesForPeriod, userList]);

  // Process data when time entries are loaded
  useEffect(() => {
    if (!loading && timeEntries.length > 0) {
      setShowMonthly(false);
      setShowYearly(false);
      const groupedUsers = Object.values(sumByUser(timeEntries));
      const contributedUsers = filterContributors(groupedUsers);
      setContributors(contributedUsers);
      checkPeriodForSummary();
    }
  }, [loading, timeEntries, sumByUser, filterContributors, checkPeriodForSummary]);

  if (loading) {
    return <Loading darkMode={darkMode} />;
  }

  const totalTangibleTime = contributors.reduce((acc, obj) => acc + Number(obj.tangibleTime), 0);

  return (
    <div className={`${styles.totalContainer} ${darkMode ? 'bg-yinmn-blue text-light' : ''}`}>
      <div className="d-flex align-items-center">
        <h2 className={`${styles.totalTitle} ${darkMode ? 'text-azure' : ''}`}>Contributors Report</h2>
        <EditableInfoModal
          areaName="contributorsReportInfo"
          areaTitle="Contributors Report"
          role={userRole}
          fontSize={15}
          defaultText="Click this to see only people who logged/contributed a minimum of 10 tangible hours..."
          isPermissionPage
          darkMode={darkMode}
        />
      </div>
      <div className={styles.totalPeriod}>
        In the period from {startDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })} to {endDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}:
      </div>
      <div className={styles.totalItem}>
        <div className={styles.totalNumber}>{contributors.length}</div>
        <div className={styles.totalText}>members have contributed more than 10 hours.</div>
      </div>
      <div className={styles.totalItem}>
        <div className={styles.totalNumber}>{totalTangibleTime.toFixed(2)}</div>
        <div className={styles.totalText}>hours of tangible time have been logged.</div>
      </div>
      <div>
        {showMonthly && contributorsInMonth.length > 0 && (
          <TotalReportBarGraph barData={contributorsInMonth} range="month" />
        )}
        {showYearly && contributorsInYear.length > 0 && (
          <TotalReportBarGraph barData={contributorsInYear} range="year" />
        )}
      </div>
    </div>
  );
}

export default TotalContributorsReport;