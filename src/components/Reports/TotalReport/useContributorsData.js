import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ENDPOINTS } from '~/utils/URL';
import {
  getCachedData,
  logApiRequest,
  logApiResponse,
  setCachedData,
  validateUserList,
} from './cacheUtils';
import { generateBarData as generateBarDataUtil } from './generateBarData';

const REPORT_NAME = 'TotalContributorsReport';
const ONE_MONTH = 1000 * 60 * 60 * 24 * 31;

// Group time entries by user and calculate total hours
const sumByUser = entries => {
  return entries.reduce((acc, { userId, hours = 0, minutes = 0, isTangible = false }) => {
    if (!acc[userId]) {
      acc[userId] = { userId, hours: 0, minutes: 0, tangibleTime: 0 };
    }
    const numHours = parseFloat(hours) || 0;
    const numMinutes = parseFloat(minutes) || 0;
    acc[userId].hours += numHours;
    acc[userId].minutes += numMinutes;
    if (isTangible) {
      acc[userId].tangibleTime += numHours + numMinutes / 60;
    }
    return acc;
  }, {});
};

// Filter users who have contributed more than 10 hours
const filterContributors = users => users.filter(user => user.hours + user.minutes / 60 >= 10);

// Group entries by time range (month/year)
const groupByTimeRange = (entries, timeRange) => {
  return entries.reduce((acc, entry) => {
    const date = new Date(entry.date);
    const key =
      timeRange === 'month'
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        : `${date.getFullYear()}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(entry);
    return acc;
  }, {});
};

// Generate summary data for the specified time range
const summaryOfTimeRange = (entries, timeRange) => {
  const groupedEntries = Object.entries(groupByTimeRange(entries, timeRange));
  return groupedEntries.map(([key, rangeEntries]) => {
    const groupedUsers = Object.values(sumByUser(rangeEntries));
    const contributedUsers = filterContributors(groupedUsers);
    return { timeRange: key, usersOfTime: contributedUsers };
  });
};

/**
 * Encapsulates fetching + processing the Contributors Report data for a single
 * date range. Returns the computed summary so it can be rendered for both the
 * primary period and an optional comparison period.
 *
 * @param {Object} params
 * @param {Date} params.startDate
 * @param {Date} params.endDate
 * @param {Array} params.userProfiles
 * @param {boolean} params.enabled - When false, no fetching/processing happens
 *   (used to skip work for the comparison period until the user enables it).
 */
export default function useContributorsData({ startDate, endDate, userProfiles, enabled = true }) {
  const [loading, setLoading] = useState(true);
  const [timeEntries, setTimeEntries] = useState([]);
  const [contributors, setContributors] = useState([]);
  const [showMonthly, setShowMonthly] = useState(false);
  const [showYearly, setShowYearly] = useState(false);
  const [contributorsInMonth, setContributorsInMonth] = useState([]);
  const [contributorsInYear, setContributorsInYear] = useState([]);

  const fromDate = useMemo(() => startDate.toLocaleDateString('en-CA'), [startDate]);
  const toDate = useMemo(() => endDate.toLocaleDateString('en-CA'), [endDate]);
  const userList = useMemo(() => userProfiles?.map(({ _id }) => _id) || [], [userProfiles]);

  // Fetch time entries for the selected period
  const loadTimeEntriesForPeriod = useCallback(
    async controller => {
      const url = ENDPOINTS.TIME_ENTRIES_REPORTS;
      if (!url) {
        return;
      }

      if (!validateUserList(userList, userProfiles, REPORT_NAME)) {
        setTimeEntries([]);
        setLoading(false);
        return;
      }

      const cacheKey = `${REPORT_NAME}_${fromDate}_${toDate}`;
      const cached = getCachedData(cacheKey, REPORT_NAME);
      if (cached.data) {
        setTimeEntries(cached.data);
        setLoading(false);
        return;
      }

      try {
        logApiRequest(
          REPORT_NAME,
          url,
          { users: userList, fromDate, toDate },
          { usersCount: userList?.length },
        );

        const response = await axios.post(
          url,
          { users: userList, fromDate, toDate },
          { signal: controller.signal },
        );

        logApiResponse(REPORT_NAME, response.data?.length);

        const mappedTimeEntries = response.data.map(entry => ({
          userId: entry.personId,
          hours: entry.hours,
          minutes: entry.minutes,
          isTangible: entry.isTangible,
          date: entry.dateOfWork,
        }));

        setTimeEntries(mappedTimeEntries);
        setCachedData(cacheKey, mappedTimeEntries, REPORT_NAME);
      } catch (error) {
        // eslint-disable-next-line import/no-named-as-default-member
        if (!axios.isCancel(error)) {
          // eslint-disable-next-line no-console
          console.error(`${REPORT_NAME} API Error:`, error);
          setTimeEntries([]);
        }
      }
    },
    [fromDate, toDate, userList, userProfiles],
  );

  // Load data when the date range changes
  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return undefined;
    }
    if (!userList || userList.length === 0) {
      return undefined;
    }

    setLoading(true);
    const controller = new AbortController();
    loadTimeEntriesForPeriod(controller).then(() => {
      setLoading(false);
    });
    return () => controller.abort();
  }, [enabled, loadTimeEntriesForPeriod, userList]);

  // Process data when time entries are loaded
  useEffect(() => {
    if (!enabled || loading) {
      return;
    }

    if (timeEntries.length === 0) {
      setContributors([]);
      setShowMonthly(false);
      setShowYearly(false);
      setContributorsInMonth([]);
      setContributorsInYear([]);
      return;
    }

    const groupedUsers = Object.values(sumByUser(timeEntries));
    setContributors(filterContributors(groupedUsers));

    const diffDate = endDate - startDate;
    let monthly = false;
    let yearly = false;
    let monthData = [];
    let yearData = [];
    if (diffDate > ONE_MONTH) {
      monthData = generateBarDataUtil(
        summaryOfTimeRange(timeEntries, 'month'),
        false,
        startDate,
        endDate,
        'usersOfTime',
      );
      yearData = generateBarDataUtil(
        summaryOfTimeRange(timeEntries, 'year'),
        true,
        startDate,
        endDate,
        'usersOfTime',
      );
      if (diffDate <= ONE_MONTH * 12) {
        monthly = true;
      }
      if (startDate.getFullYear() !== endDate.getFullYear()) {
        yearly = true;
      }
    }
    setShowMonthly(monthly);
    setShowYearly(yearly);
    setContributorsInMonth(monthData);
    setContributorsInYear(yearData);
  }, [enabled, loading, timeEntries, startDate, endDate]);

  const totalTangibleTime = contributors.reduce((acc, obj) => acc + Number(obj.tangibleTime), 0);

  return {
    loading,
    contributors,
    totalTangibleTime,
    showMonthly,
    showYearly,
    contributorsInMonth,
    contributorsInYear,
  };
}
