/* eslint-disable no-console */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Alert,
  Container,
  Row,
  Col,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Button,
  Input,
  Spinner,
} from 'reactstrap';
import ReactTooltip from 'react-tooltip';
import Select, { components } from 'react-select';
import moment from 'moment';
import { boxStyle, boxStyleDark } from '~/styles';
import 'moment-timezone';
import axios from 'axios';

import { ENDPOINTS } from '~/utils/URL';
import EditableInfoModal from '~/components/UserProfile/EditableModal/EditableInfoModal';
import { getAllUserTeams, getAllTeamCode } from '../../actions/allTeamsAction';
import TeamChart from './TeamChart';
import SkeletonLoading from '../common/SkeletonLoading';
import { getWeeklySummariesReport } from '../../actions/weeklySummariesReport';
import {
  updateOneSummaryReport,
  updateSummaryReportFromServerAction,
  updateSummaryReport,
} from '../../actions/weeklySummaries';

import {
  getSavedFilters,
  createSavedFilter,
  deleteSavedFilter,
  updateSavedFilter,
  updateSavedFiltersForTeamCodeChange,
  updateSavedFiltersForIndividualTeamCodeChange,
} from '../../actions/savedFilterActions';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import WeeklySummaryRecipientsPopup from './WeeklySummaryRecepientsPopup';
import FormattedReport from './FormattedReport';
import GeneratePdfReport from './GeneratePdfReport';
import hasPermission from '../../utils/permissions';
import { getInfoCollections } from '../../actions/information';
import { fetchAllBadges } from '../../actions/badgeManagement';
import PasswordInputModal from './PasswordInputModal';
import { showTrophyIcon } from '../../utils/anniversaryPermissions';
import SelectTeamPieChart from './SelectTeamPieChart';
import { setTeamCodes } from '../../actions/teamCodes';
import SaveFilterModal from './SaveFilterModal';
import styles from './WeeklySummariesReport.module.css';
// Keeping this block commented intentionally for future reference —
import { SlideToggle } from './components';
import cn from 'classnames';

const navItems = ['This Week', 'Last Week', 'Week Before Last', 'Three Weeks Ago'];
const fullCodeRegex = /^.{5,7}$/;
// Keeping this block commented intentionally for future reference —
// // 🟢 NEW: Enhanced filterColor normalization function
// const normalizeFilterColor = filterColor => {
//   // eslint-disable-next-line no-console
//   console.log('🔧 Normalizing filterColor:', filterColor, 'Type:', typeof filterColor);
//   if (!filterColor) {
//     // eslint-disable-next-line no-console
//     console.log('🔧 FilterColor is null/undefined, returning empty array');
//     return [];
//   }
//   if (Array.isArray(filterColor)) {
//     // eslint-disable-next-line no-console
//     console.log('🔧 FilterColor is already array:', filterColor);
//     return filterColor.filter(Boolean); // Remove any falsy values
//   }
//   if (typeof filterColor === 'string') {
//     // eslint-disable-next-line no-console
//     console.log('🔧 FilterColor is string, attempting to parse:', filterColor);
//     // Try to parse as JSON first
//     try {
//       const parsed = JSON.parse(filterColor);
//       if (Array.isArray(parsed)) {
//         // eslint-disable-next-line no-console
//         console.log('🔧 Successfully parsed string as JSON array:', parsed);
//         return parsed.filter(Boolean);
//       }
//       // eslint-disable-next-line no-console
//       console.log('🔧 Parsed JSON but not array:', parsed);
//       return [filterColor];
//     } catch (error) {
//       // eslint-disable-next-line no-console
//       console.log('🔧 Failed to parse as JSON, treating as single string:', filterColor);
//       return [filterColor];
//     }
//   }
//   // eslint-disable-next-line no-console
//   console.log('🔧 Unknown filterColor type, returning empty array');
//   return [];
// };

const getWeekDates = () => {
  return Array.from({ length: 4 }).map((_, index) => ({
    fromDate: moment()
      .tz('America/Los_Angeles')
      .startOf('week')
      .subtract(index, 'week')
      .format('MMM-DD-YY'),
    toDate: moment()
      .tz('America/Los_Angeles')
      .endOf('week')
      .subtract(index, 'week')
      .format('MMM-DD-YY'),
  }));
};
const initialState = {
  tableData: [],
  structuredTableData: [],
  chartData: [],
  total: 0,
  COLORS: [],
  loading: true,
  summaries: [],
  activeTab: navItems[1],
  passwordModalOpen: false,
  summaryRecepientsPopupOpen: false,
  isValidPwd: true,
  badges: [],
  loadBadges: false,
  selectedCodes: [],
  selectedColors: [],
  filteredSummaries: [],
  teamCodes: [],
  colorOptions: [],
  auth: [],
  selectedLoggedHoursRange: '',
  selectedOverTime: false,
  selectedBioStatus: false,
  selectedTrophies: false,
  chartShow: false,
  replaceCode: '',
  replaceCodeError: null,
  replaceCodeLoading: false,
  allRoleInfo: [],
  teamCodeWarningUsers: [],
  loadedTabs: [navItems[1]], // Initialize with default tab
  summariesByTab: {}, // Store tab-specific data
  tabsLoading: { [navItems[1]]: false }, // Track loading state per tab
  formattedReportLoading: false,
  loadTrophies: false,
  selectedSpecialColors: {
    purple: false,
    green: false,
    navy: false,
  },
  bulkSelectedColors: {
    purple: false,
    green: false,
    navy: false,
  },
  // Saved filters functionality
  saveFilterModalOpen: false,
};

const intialPermissionState = {
  bioEditPermission: false,
  canEditSummaryCount: false,
  codeEditPermission: false,
  canSeeBioHighlight: false,
  hasSeeBadgePermission: false,
};

const CheckboxOption = props => {
  return (
    <components.Option {...props}>
      <input
        type="checkbox"
        checked={props.isSelected}
        onChange={() => null} // react-select handles selection internally
        style={{ marginRight: 8 }}
      />
      <label style={{ fontWeight: 'bold' }}>{props.label}</label>
    </components.Option>
  );
};

// Custom MenuList with "Select All / Deselect All" header
const CustomMenuList = props => {
  const { children, selectProps } = props;
  const allSelected = (selectProps.value?.length || 0) === (selectProps.options?.length || 0);

  const toggleSelectAll = () => {
    if (allSelected) {
      selectProps.onChange([]);
    } else {
      selectProps.onChange(selectProps.options);
    }
  };

  return (
    <components.MenuList {...props}>
      <div
        style={{
          padding: '6px 10px',
          borderBottom: '1px solid #ccc',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <input
          type="checkbox"
          checked={allSelected}
          onChange={toggleSelectAll}
          style={{ marginRight: 8 }}
        />
        <label style={{ fontWeight: 'bold' }}>{allSelected ? 'Deselect All' : 'Select All'}</label>
      </div>
      {children}
    </components.MenuList>
  );
};

/* eslint-disable react/function-component-definition */
const WeeklySummariesReport = props => {
  const { loading, getInfoCollections } = props;
  const weekDates = getWeekDates();
  const [state, setState] = useState(initialState);
  const [permissionState, setPermissionState] = useState(intialPermissionState);

  useEffect(() => {
    // Update local state whenever allBadgeData prop changes
    if (props.allBadgeData && props.allBadgeData.length > 0) {
      setState(prevState => ({
        ...prevState,
        badges: props.allBadgeData,
      }));
    }
  }, [props.allBadgeData]);

  // Saved filters functionality
  const [currentAppliedFilter, setCurrentAppliedFilter] = useState(null);
  const [showModificationModal, setShowModificationModal] = useState(false);

  // Misc functionalities
  /**
   * Sort the summaries in alphabetixal order
   * @param {*} summaries
   * @returns
   */
  const alphabetize = summaries => {
    const temp = [...summaries];
    return temp.sort((a, b) =>
      `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastname}`),
    );
  };

  /**
   * Get the roleNames
   * @param {*} summaries
   * @returns
   */
  const getAllRoles = summaries => {
    const roleNames = summaries.map(summary => `${summary.role}Info`);
    const uniqueRoleNames = [...new Set(roleNames)];
    return uniqueRoleNames;
  };

  /**
   * This function calculates the hours promised by a user by a given end date of the week.
   * It goes through the user's committed hours history and returns the last committed hour value that is less than or equal to the given date.
   * If there's no such record in the history, it returns 10 (default value).
   * If the history does not exist at all, it returns -1.
   *
   * @param {string} weekToDateX - The end date of the week in question. It should be a string that can be parsed into a Date object.
   * @param {Array<Object>} weeklycommittedHoursHistory - An array of user's committed hours history records. Each record should be an object that contains at least the properties 'dateChanged' (a string that can be parsed into a Date object) and 'hours' (a number).
   *
   * @returns {number} The hours promised by the user by the given end date.
   */
  const getPromisedHours = (weekToDateX, weeklycommittedHoursHistory) => {
    // 0. Edge case: If the history doesnt even exist
    // only happens if the user is created without the backend changes
    if (!weeklycommittedHoursHistory) {
      return -1;
    }
    // 1. Edge case: If there is none, return 10 (the default value of weeklyComHours)
    if (weeklycommittedHoursHistory.length === 0) {
      return 10;
    }

    const weekToDateReformat = new Date(weekToDateX).setHours(23, 59, 59, 999);
    // 2. Iterate weeklycommittedHoursHistory from the last index (-1) to the beginning
    for (let i = weeklycommittedHoursHistory.length - 1; i >= 0; i -= 1) {
      const historyDateX = new Date(weeklycommittedHoursHistory[i].dateChanged);
      // console.log(`${weekToDateX} >= ${historyDateX} is ${weekToDateX >= historyDateX}`);
      // As soon as the weekToDate is greater or equal than current history date
      if (weekToDateReformat >= historyDateX) {
        // return the promised hour
        return weeklycommittedHoursHistory[i].hours;
      }
    }

    // 3. at this date when the week ends, the person has not even join the team
    // so it promised 0 hours
    return 0;
  };

  const intialInfoCollections = async summariesCopy => {
    try {
      const infoCollectionsData = await getInfoCollections();
      const roleInfoNames = getAllRoles(summariesCopy);
      const allRoleInfo = [];
      if (Array.isArray(infoCollectionsData)) {
        infoCollectionsData.forEach(info => {
          if (roleInfoNames?.includes(info.infoName)) {
            const visible =
              info.visibility === '0' ||
              (info.visibility === '1' &&
                (props.role === 'Owner' || props.role === 'Administrator')) ||
              (info.visibility === '2' && props.role !== 'Volunteer');
            // eslint-disable-next-line no-param-reassign
            info.CanRead = visible;
            allRoleInfo.push(info);
          }
        });
      }
      setState(prev => ({
        ...prev,
        allRoleInfo,
      }));
      return allRoleInfo;
    } catch (error) {
      return null;
    }
  };

  // Keeping this block commented intentionally for future reference —
  // Initial data loading
  const createIntialSummaries = async () => {
    try {
      const { getWeeklySummariesReport, fetchAllBadges, hasPermission, auth, setTeamCodes } = props;

      // Get the active tab from session storage or use default
      const activeTab =
        sessionStorage.getItem('tabSelection') === null
          ? navItems[1]
          : sessionStorage.getItem('tabSelection');

      // Get the week index for the active tab
      const weekIndex = navItems.indexOf(activeTab);

      // eslint-disable-next-line no-console
      // console.log(`Initial load: Fetching data for tab ${activeTab} with weekIndex ${weekIndex}`);

      // Set initial loading and active tab state
      setState(prevState => ({
        ...prevState,
        loading: true,
        activeTab,
        tabsLoading: {
          ...prevState.tabsLoading,
          [activeTab]: true,
        },
      }));

      // Get permissions
      const badgeStatusCode = await fetchAllBadges();
      setPermissionState(prev => ({
        ...prev,
        bioEditPermission: hasPermission('putUserProfileImportantInfo'),
        canEditSummaryCount: hasPermission('putUserProfileImportantInfo'),
        codeEditPermission:
          hasPermission('editTeamCode') ||
          auth.user.role === 'Owner' ||
          auth.user.role === 'Administrator',
        canSeeBioHighlight: hasPermission('highlightEligibleBios'),
        hasSeeBadgePermission: hasPermission('seeBadges') && badgeStatusCode === 200,
      }));

      // Fetch data for the active tab only
      const res = await getWeeklySummariesReport(weekIndex); // old working code
      // const url = `${ENDPOINTS.WEEKLY_SUMMARIES_REPORT()}?week=${weekIndex}&forceRefresh=true`;
      // Keeping this block commented intentionally for future reference —
      // const res = await axios.get(url);
      // eslint-disable-next-line no-console
      // debugging logic
      // console.log('📦 API Response Summaries:', res.data);
      // // console.log('API response:', res);
      // // console.log('Response data:', res?.data);
      // // console.log('Data is array:', Array.isArray(res?.data));
      // // console.log('Data length:', res?.data?.length);
      // // eslint-disable-next-line no-console
      // console.log('API DATA: ', res.data);
      const summaries = res?.data ?? []; // old working code
      // const summaries = Array.isArray(res?.data) ? res.data : [];
      // // eslint-disable-next-line no-console
      // console.log('Backend summary sample:', res?.data?.[0]);

      // Keeping this block commented intentionally for future reference —
      // // eslint-disable-next-line no-console
      // console.log(
      //   '✅ Filtered summaries for teamCode "ABC123"',
      //   summaries
      //     .filter(s => (s.teamCode || 'noCodeLabel') === 'a-BCC')
      //     .map(s => ({
      //       name: `${s.firstName} ${s.lastName}`,
      //       _id: s._id,
      //       teamCode: s.teamCode || 'noCodeLabel',
      //       filterColor: s.filterColor,
      //     })),
      // );
      // // 🟢 ENHANCED: Fetch data with comprehensive filterColor debugging
      // const url = `${ENDPOINTS.WEEKLY_SUMMARIES_REPORT()}?week=${weekIndex}&forceRefresh=true`;
      // // eslint-disable-next-line no-console
      // console.log('🌐 Making API request to:', url);
      // const res = await axios.get(url);
      // // eslint-disable-next-line no-console
      // console.log('📦 Raw API Response:', res.data);
      // // eslint-disable-next-line no-console
      // console.log('📦 API Response length:', res.data?.length);
      // // 🟢 NEW: Debug filterColors in API response
      // if (Array.isArray(res?.data)) {
      //   // eslint-disable-next-line no-console
      //   console.log('🎨 FilterColors in API response:');
      //   res.data.forEach((user, index) => {
      //     if (index < 5) {
      //       // Log first 5 users
      //       // eslint-disable-next-line no-console
      //       console.log(
      //         `  - ${user.firstName} ${user.lastName}: ${JSON.stringify(
      //           user.filterColor,
      //         )} (type: ${typeof user.filterColor})`,
      //       );
      //     }
      //   });
      // }
      if (!Array.isArray(summaries) || summaries.length === 0) {
        setState(prevState => ({
          ...prevState,
          loading: false,
          tabsLoading: {
            ...prevState.tabsLoading,
            [activeTab]: false,
          },
        }));
        return null;
      }

      // Process the data
      const teamCodeGroup = {};
      const teamCodes = [];

      // Shallow copy and sort
      let summariesCopy = [...summaries];
      summariesCopy = alphabetize(summariesCopy);
      summariesCopy = summariesCopy.filter(summary => summary?.isActive !== false);
      // Add new key of promised hours by week
      summariesCopy = summariesCopy.map(summary => {
        const promisedHoursByWeek = weekDates.map(weekDate =>
          getPromisedHours(weekDate.toDate, summary.weeklycommittedHoursHistory),
        );
        // // Keeping this block commented intentionally for future reference —
        // let filterColor = [];
        // // Keeping this block commented intentionally for future reference —
        // // const filterColor = summary.filterColor || null; // old working code
        // if (Array.isArray(summary.filterColor)) {
        //   filterColor = summary.filterColor;
        // } else if (typeof summary.filterColor === 'string') {
        //   try {
        //     const parsed = JSON.parse(summary.filterColor);
        //     filterColor = Array.isArray(parsed) ? parsed : [summary.filterColor];
        //   } catch {
        //     filterColor = [summary.filterColor];
        //   }
        // }
        let filterColor = [];
        if (Array.isArray(summary.filterColor)) {
          // 1. Filter out junk data (like 'null')
          // 2. Convert all strings to lowercase (good practice)
          filterColor = summary.filterColor
            .filter(c => typeof c === 'string') // Keep only strings
            .map(c => c.toLowerCase()); // Ensure lowercase
        } else if (typeof summary.filterColor === 'string') {
          // Handles cases where DB stores '["purple"]' or just 'Purple'
          try {
            const parsed = JSON.parse(summary.filterColor);
            if (Array.isArray(parsed)) {
              // It was a stringified array, clean it
              filterColor = parsed.filter(c => typeof c === 'string').map(c => c.toLowerCase());
            } else if (typeof parsed === 'string') {
              // It was a single string like '"purple"'
              filterColor = [parsed.toLowerCase()];
            }
          } catch {
            // It was just a plain string like 'Purple'
            filterColor = [summary.filterColor.toLowerCase()];
          }
        }

        return { ...summary, promisedHoursByWeek, filterColor };
        // 🟢 ENHANCED: Add new key of promised hours by week AND normalize filterColor
        // summariesCopy = summariesCopy.map(summary => {
        //   const promisedHoursByWeek = weekDates.map(weekDate =>
        //     getPromisedHours(weekDate.toDate, summary.weeklycommittedHoursHistory),
        //   );

        // Keeping this block commented intentionally for future reference —
        //   // 🟢 NEW: Use enhanced filterColor normalization
        //   const normalizedFilterColor = normalizeFilterColor(summary.filterColor);
        //   // eslint-disable-next-line no-console
        //   console.log(`🎨 Processing ${summary.firstName} ${summary.lastName}:`);
        //   // eslint-disable-next-line no-console
        //   console.log(`   Original filterColor:`, summary.filterColor);
        //   // eslint-disable-next-line no-console
        //   console.log(`   Normalized filterColor:`, normalizedFilterColor);
        //   return {
        //     ...summary,
        //     promisedHoursByWeek,
        //     filterColor: normalizedFilterColor,
        //   };
      });
      // });

      const colorOptionGroup = new Set();
      const colorOptions = [];
      const COLORS = [
        '#e8a71c',
        '#0088FE',
        '#43BFC7',
        '#08b493',
        '#c861c8',
        '#FFBB28',
        '#76916a',
        '#ac4f7c',
        '#E2725B',
        '#6B8E23',
        '#253342',
        '#43a5be',
        '#7698B3',
        '#F07857',
        '#87CEEB',
        '#FF8243',
        '#4169E1',
        '#009999',
        '#9ACD32',
        '#C8A2C8',
      ];

      // Process team codes and colors
      summariesCopy.forEach(summary => {
        const code = summary.teamCode || 'noCodeLabel';
        if (teamCodeGroup[code]) {
          teamCodeGroup[code].push(summary);
        } else {
          teamCodeGroup[code] = [summary];
        }

        if (summary.weeklySummaryOption) colorOptionGroup.add(summary.weeklySummaryOption);
      });

      Object.keys(teamCodeGroup).forEach(code => {
        if (code !== 'noCodeLabel') {
          teamCodes.push({
            value: code,
            label: `${code} (${teamCodeGroup[code].length})`,
            _ids: teamCodeGroup[code]?.map(item => item._id),
          });
        }
      });

      setTeamCodes(teamCodes);

      colorOptionGroup.forEach(option => {
        colorOptions.push({
          value: option,
          label: option,
        });
      });

      colorOptions.sort((a, b) => `${a.label}`.localeCompare(`${b.label}`));
      teamCodes
        .sort((a, b) => `${a.label}`.localeCompare(`${b.label}`))
        .push({
          value: '',
          label: `Select All With NO Code (${teamCodeGroup.noCodeLabel?.length || 0})`,
          _ids: teamCodeGroup?.noCodeLabel?.map(item => item._id),
        });

      const chartData = [];
      // eslint-disable-next-line no-console
      // 🟢 NEW: Final debug log before setting state
      // eslint-disable-next-line no-console
      console.log('🏁 Final processed summaries with filterColors:');
      for (const summary of summariesCopy.slice(0, 3)) {
        // eslint-disable-next-line no-console
        console.log(
          `  - ${summary.firstName} ${summary.lastName}: ${JSON.stringify(summary.filterColor)}`,
        );
      }
      // Store the data in the tab-specific state
      setState(prevState => ({
        ...prevState,
        loading: false,
        allRoleInfo: [],
        summaries: summariesCopy,
        filteredSummaries: summariesCopy,
        loadedTabs: [activeTab],
        summariesByTab: {
          ...prevState.summariesByTab,
          [activeTab]: summariesCopy,
        },
        badges: props.allBadgeData || [],
        // filteredSummaries: summariesCopy,
        tableData: teamCodeGroup,
        chartData,
        COLORS,
        colorOptions,
        teamCodes,
        teamCodeWarningUsers: summariesCopy.filter(s => s.teamCodeWarning),
        auth,
        tabsLoading: {
          [activeTab]: false,
        },
      }));

      // eslint-disable-next-line no-console
      console.log(
        '🟡 Initial summaries loaded for a-BCC:',
        summariesCopy.filter(s => s.teamCode === 'a-BCC'),
      );

      // Now load info collections
      await intialInfoCollections(summariesCopy);

      return summariesCopy;
    } catch (error) {
      // console.error('Error in createInitialSummaries:', error);
      setState(prevState => ({
        ...prevState,
        loading: false,
        tabsLoading: {
          ...prevState.tabsLoading,
          [prevState.activeTab]: false,
        },
      }));
      return null;
    }
  };

  const onSummaryRecepientsPopupClose = () => {
    setState(prev => ({
      ...prev,
      summaryRecepientsPopupOpen: false,
    }));
  };

  const setSummaryRecepientsPopup = val => {
    setState(prev => ({
      ...prev,
      summaryRecepientsPopupOpen: val,
    }));
  };

  const popUpElements = () => {
    return (
      <WeeklySummaryRecipientsPopup
        open={state.summaryRecepientsPopupOpen}
        onClose={onSummaryRecepientsPopupClose}
        summaries={props.summaries}
        password={state.weeklyRecipientAuthPass}
        authEmailWeeklySummaryRecipient={props.authEmailWeeklySummaryRecipient}
      />
    );
  };

  const onpasswordModalClose = () => {
    setState(prev => ({
      ...prev,
      passwordModalOpen: false,
    }));
  };

  const checkForValidPwd = booleanVal => {
    setState(prev => ({
      ...prev,
      isValidPwd: booleanVal,
    }));
  };

  // Authorization for the weeklySummary Recipients is required once
  const setAuthpassword = authPass => {
    setState(prev => ({
      ...prev,
      weeklyRecipientAuthPass: authPass,
    }));
  };

  const onClickRecepients = () => {
    if (state.weeklyRecipientAuthPass) {
      setState(prev => ({
        ...prev,
        summaryRecepientsPopupOpen: true,
      }));
    } else {
      setState(prev => ({
        ...prev,
        passwordModalOpen: true,
      }));
      checkForValidPwd(true);
    }
  };

  // const isLastWeekReport = (startDate, endDate) => {
  //   const today = new Date();
  //   const oneWeekAgo = new Date(today);
  //   oneWeekAgo.setDate(today.getDate() - 7);
  //   return new Date(startDate) <= oneWeekAgo && new Date(endDate) >= oneWeekAgo;
  // };
  const isLastWeekReport = (startDateStr, endDateStr) => {
    // Parse the summary’s start and end dates
    const summaryStart = new Date(startDateStr);
    const summaryEnd = new Date(endDateStr);

    // Use the user's timezone: America/Los_Angeles
    const weekStartLA = moment()
      .tz('America/Los_Angeles')
      .startOf('week')
      .subtract(1, 'week')
      .toDate();
    const weekEndLA = moment()
      .tz('America/Los_Angeles')
      .endOf('week')
      .subtract(1, 'week')
      .toDate();

    // Check if the summary overlaps any portion of last week
    return summaryStart <= weekEndLA && summaryEnd >= weekStartLA;
  };

  const filterWeeklySummaries = () => {
    try {
      const {
        selectedCodes,
        selectedColors,
        selectedLoggedHoursRange,
        summaries,
        selectedOverTime,
        selectedBioStatus,
        selectedTrophies,
        tableData,
        COLORS,
        selectedSpecialColors,
      } = state;

      // eslint-disable-next-line no-console
      // console.log('🔍 filterWeeklySummaries called with:', {
      //   summariesLength: summaries?.length,
      //   selectedCodesLength: selectedCodes?.length,
      //   selectedSpecialColors,
      // });
      // console.log('filterWeeklySummaries state:', {
      //   summariesLength: summaries?.length,
      //   tableDataExists: !!tableData,
      //   selectedCodesLength: selectedCodes?.length,
      //   selectedColorsLength: selectedColors?.length,
      // });
      const chartData = [];
      let temptotal = 0;
      const structuredTeamTableData = [];
      const selectedCodesArray = selectedCodes ? selectedCodes.map(e => e.value) : [];
      const selectedColorsArray = selectedColors ? selectedColors.map(e => e.value) : [];
      const weekIndex = navItems.indexOf(state.activeTab);
      const activeFilterColors = Object.entries(selectedSpecialColors || {})
        .filter(([, isSelected]) => isSelected)
        .map(([color]) => color);

      const temp = summaries.filter(summary => {
        const { activeTab } = state;
        const hoursLogged = (summary.totalSeconds[navItems.indexOf(activeTab)] || 0) / 3600;

        // 🛑 Adding this block at the very top inside the filter
        // if (summary?.isActive === false) {
        //   const lastWeekStart = moment()
        //     .tz('America/Los_Angeles')
        //     .startOf('week')
        //     .subtract(1, 'week')
        //     .toDate();
        //   const lastWeekEnd = moment()
        //     .tz('America/Los_Angeles')
        //     .endOf('week')
        //     .subtract(1, 'week')
        //     .toDate();
        //   const summaryStart = new Date(summary.startDate);
        //   const summaryEnd = new Date(summary.endDate);
        //   const isLastWeek = summaryStart <= lastWeekEnd && summaryEnd >= lastWeekStart;

        //   if (!isLastWeek) {
        //     return false; // Skip inactive members unless their summary is from last week
        //   }
        // }
        if (summary?.isActive === false && !isLastWeekReport(summary.startDate, summary.endDate)) {
          return false;
        }
        const isMeetCriteria =
          summary.totalTangibleHrs > 80 &&
          summary.daysInTeam > 60 &&
          summary.bioPosted !== 'posted';
        const isBio = !selectedBioStatus || isMeetCriteria;
        const isOverHours =
          !selectedOverTime ||
          (summary.weeklycommittedHours > 0 &&
            hoursLogged > 0 &&
            hoursLogged >= summary.promisedHoursByWeek[navItems.indexOf(activeTab)]);

        // Add trophy filter logic
        const summarySubmissionDate = moment()
          .tz('America/Los_Angeles')
          .endOf('week')
          .subtract(weekIndex, 'week')
          .format('YYYY-MM-DD');

        const hasTrophy =
          !selectedTrophies ||
          showTrophyIcon(summarySubmissionDate, summary?.startDate?.split('T')[0]);

        // Add special color filter logic
        // const matchesSpecialColor =
        //   activeFilterColors.length === 0 || activeFilterColors.includes(summary.filterColor);
        const matchesSpecialColor =
          activeFilterColors.length === 0 ||
          activeFilterColors.some(color => summary.filterColor?.includes?.(color));

        let matchesLoggedHoursRange = true;
        if (selectedLoggedHoursRange && selectedLoggedHoursRange.length > 0) {
          matchesLoggedHoursRange = selectedLoggedHoursRange.some(range => {
            switch (range.value) {
              case '=0':
                return hoursLogged === 0;
              case '0-10':
                return hoursLogged > 0 && hoursLogged <= 10;
              case '10-20':
                return hoursLogged > 10 && hoursLogged <= 20;
              case '20-40':
                return hoursLogged > 20 && hoursLogged <= 40;
              case '>40':
                return hoursLogged > 40;
              default:
                return true;
            }
          });
        }
        return (
          (selectedCodesArray.length === 0 || selectedCodesArray.includes(summary.teamCode)) &&
          (selectedColorsArray.length === 0 ||
            selectedColorsArray.includes(summary.weeklySummaryOption)) &&
          matchesSpecialColor &&
          isOverHours &&
          isBio &&
          hasTrophy &&
          matchesLoggedHoursRange
        );
        // 🟢 ENHANCED: Special color filter logic with debugging
        // const matchesSpecialColor =
        //   activeFilterColors.length === 0 ||
        //   activeFilterColors.some(color => {
        //     const userColors = Array.isArray(summary.filterColor) ? summary.filterColor : [];
        //     const matches = userColors.includes(color);
        //     if (summary.firstName === 'RahulB' && summary.lastName === 'Test-Dropbox') {
        //       // eslint-disable-next-line no-console
        //       console.log(`🔍 Special color check for ${summary.firstName}:`, {
        //         filterColor: summary.filterColor,
        //         userColors,
        //         checkingColor: color,
        //         matches,
        //       });
        //     }
        //     return matches;
        //   });
        // return (
        //   (selectedCodesArray.length === 0 || selectedCodesArray.includes(summary.teamCode)) &&
        //   (selectedColorsArray.length === 0 ||
        //     selectedColorsArray.includes(summary.weeklySummaryOption)) &&
        //   matchesSpecialColor &&
        //   isOverHours &&
        //   isBio &&
        //   hasTrophy
        // );
      });

      if (selectedCodes[0]?.value === '' || selectedCodes.length >= 52) {
        if (selectedCodes.length >= 52) {
          selectedCodes.forEach(code => {
            if (code.value === '') return;
            chartData.push({
              name: code.label,
              value: temp.filter(summary => summary.teamCode === code.value).length,
            });
            const team = tableData[code.value];
            const index = selectedCodesArray.indexOf(code.value);
            const color = COLORS[index % COLORS.length];
            const members = [];
            team.forEach(member => {
              members.push({
                name: `${member.firstName} ${member.lastName}`,
                role: member.role,
                id: member._id,
              });
            });
            structuredTeamTableData.push({ team: code.value, color, members });
          });
        } else {
          chartData.push({
            name: 'All With NO Code',
            value: temp.filter(summary => summary.teamCode === '').length,
          });
          const team = tableData.noCodeLabel;
          const index = selectedCodesArray.indexOf('noCodeLabel');
          const color = COLORS[index % COLORS.length];
          const members = [];
          team.forEach(member => {
            members.push({
              name: `${member.firstName} ${member.lastName}`,
              role: member.role,
              id: member._id,
            });
          });
          structuredTeamTableData.push({ team: 'noCodeLabel', color, members });
        }
      } else {
        selectedCodes.forEach(code => {
          const val = temp.filter(summary => summary.teamCode === code.value).length;
          if (val > 0) {
            chartData.push({
              name: code.label,
              value: val,
            });
          }
          const team = tableData[code.value];
          const index = selectedCodesArray.indexOf(code.value);
          const color = COLORS[index % COLORS.length];
          const members = [];
          if (team !== undefined) {
            team.forEach(member => {
              members.push({
                name: `${member.firstName} ${member.lastName}`,
                role: member.role,
                id: member._id,
              });
            });
            structuredTeamTableData.push({ team: code.value, color, members });
          }
        });
      }

      chartData.sort();
      temptotal = chartData.reduce((acc, entry) => acc + entry.value, 0);
      structuredTeamTableData.sort();
      // const selectedTeamCodes = selectedCodes.map(e => e.value);
      const selectedTeamCodes = Array.isArray(selectedCodes)
        ? selectedCodes.map(e => e.value)
        : selectedCodes
        ? [selectedCodes.value]
        : [];
      if (selectedTeamCodes.includes('a-BCC')) {
        const filtered = temp.filter(u => u.teamCode === 'a-BCC');
        // eslint-disable-next-line no-console
        console.log(`✅ Filtered summaries for teamCode "a-BCC" (${filtered.length})`, filtered);
      }
      setState(prev => ({
        ...prev,
        total: temptotal,
        filteredSummaries: temp,
        chartData,
        structuredTableData: structuredTeamTableData,
      }));
      return chartData;
    } catch (error) {
      return null;
    }
  };

  /**
   * Refresh the current tab data
   */
  const refreshCurrentTab = async () => {
    const { activeTab } = state;
    setState(prev => ({ ...prev, refreshing: true }));

    try {
      // Use the force refresh parameter
      const weekIndex = navItems.indexOf(activeTab);
      const url = `${ENDPOINTS.WEEKLY_SUMMARIES_REPORT()}?week=${weekIndex}&forceRefresh=true&_=${Date.now()}`;
      // console.log(`Forcing refresh of report section from: ${url}`);

      const response = await axios.get(url);

      if (response.status === 200) {
        // Process the data
        let summariesCopy = [...response.data];
        summariesCopy = alphabetize(summariesCopy);

        // Add promised hours data
        summariesCopy = summariesCopy.map(summary => {
          const promisedHoursByWeek = weekDates.map(weekDate =>
            getPromisedHours(weekDate.toDate, summary.weeklycommittedHoursHistory || []),
          );
          // Keeping this block commented intentionally for future reference —
          // const filterColor = summary.filterColor || null;
          // return { ...summary, promisedHoursByWeek, filterColor }; // both lines old working code
          let filterColor = [];
          if (Array.isArray(summary.filterColor)) {
            filterColor = summary.filterColor;
          } else if (typeof summary.filterColor === 'string') {
            filterColor = [summary.filterColor];
          }
          return {
            ...summary,
            promisedHoursByWeek,
            filterColor,
          };
        });

        // Update state
        setState(prevState => ({
          ...prevState,
          refreshing: false,
          summaries: summariesCopy,
          filteredSummaries: summariesCopy,
          badges: props.allBadgeData || prevState.badges,
          summariesByTab: {
            ...prevState.summariesByTab,
            [activeTab]: summariesCopy, // Also update the cached tab data
          },
        }));
      }
    } catch (error) {
      // console.error('Error refreshing report section:', error);
      setState(prevState => ({
        ...prevState,
        refreshing: false,
      }));
    }
  };
  /**
   * Handle tab switching
   */
  const toggleTab = tab => {
    const { activeTab } = state;

    if (activeTab !== tab) {
      // Switch to the new tab immediately, showing loading state
      setState(prevState => ({
        ...prevState,
        activeTab: tab,
        tabsLoading: {
          ...prevState.tabsLoading,
          [tab]: true,
        },
      }));

      // Save in session storage
      sessionStorage.setItem('tabSelection', tab);

      // Check if we already have data for this tab
      if (state.summariesByTab[tab] && state.summariesByTab[tab].length > 0) {
        // Use cached data
        setState(prevState => ({
          ...prevState,
          summaries: prevState.summariesByTab[tab],
          filteredSummaries: prevState.summariesByTab[tab],
          badges: props.allBadgeData || prevState.badges,
          tabsLoading: {
            ...prevState.tabsLoading,
            [tab]: false,
          },
        }));
      } else {
        // Fetch new data
        const weekIndex = navItems.indexOf(tab);

        props
          .getWeeklySummariesReport(weekIndex)
          .then(res => {
            if (res && res.data) {
              // Process data
              let summariesCopy = [...res.data];
              summariesCopy = alphabetize(summariesCopy);

              // Add promised hours data
              summariesCopy = summariesCopy.map(summary => {
                const promisedHoursByWeek = weekDates.map(weekDate =>
                  getPromisedHours(weekDate.toDate, summary.weeklycommittedHoursHistory || []),
                );
                // Keeping this block commented intentionally for future reference —
                // const filterColor = summary.filterColor || null;
                // return { ...summary, promisedHoursByWeek, filterColor }; old working code
                let filterColor = [];
                if (Array.isArray(summary.filterColor)) {
                  filterColor = summary.filterColor;
                } else if (typeof summary.filterColor === 'string') {
                  filterColor = [summary.filterColor];
                }
                return {
                  ...summary,
                  promisedHoursByWeek,
                  filterColor,
                };
              });

              // Update state
              setState(prevState => ({
                ...prevState,
                summaries: summariesCopy,
                filteredSummaries: summariesCopy,
                badges: props.allBadgeData || prevState.badges,
                loadedTabs: [...prevState.loadedTabs, tab],
                summariesByTab: {
                  ...prevState.summariesByTab,
                  [tab]: summariesCopy,
                },
                tabsLoading: {
                  ...prevState.tabsLoading,
                  [tab]: false,
                },
              }));
            } else {
              setState(prevState => ({
                ...prevState,
                tabsLoading: {
                  ...prevState.tabsLoading,
                  [tab]: false,
                },
              }));
            }
          })
          .catch(() => {
            // console.error('Error loading tab data:', error);
            setState(prevState => ({
              ...prevState,
              tabsLoading: {
                ...prevState.tabsLoading,
                [tab]: false,
              },
            }));
          });
      }
    }
  };
  // Keeping this block commented intentionally for future reference —
  // const handleSelectCodeChange = event => {
  //   setState(prev => ({
  //     ...prev,
  //     selectedCodes: event,
  //   }));
  // }; // old working code
  const handleSelectCodeChange = event => {
    const selectedValues = event.map(e => e.value);

    // Keeping this block commented intentionally for future reference —
    // Filter summaries based on selected codes
    // const selectedSummaries = state.summaries.filter(summary =>
    //   selectedValues.includes(summary.teamCode),
    // );
    // Count how many users have each color selected
    // const colorStates = ['purple', 'green', 'navy'].reduce((acc, color) => {
    //   const allHaveColor =
    //     selectedSummaries.length > 0 &&
    //     selectedSummaries.every(summary => summary.filterColor?.includes?.(color));
    //   acc[color] = allHaveColor;
    //   return acc;
    // }, {});

    setState(prev => {
      // Move selected codes to the front of the dropdown list
      const reorderedTeamCodes = [
        ...prev.teamCodes.filter(code => selectedValues.includes(code.value)), // selected first
        ...prev.teamCodes.filter(code => !selectedValues.includes(code.value)), // then the rest
      ];

      return {
        ...prev,
        selectedCodes: event,
        teamCodes: reorderedTeamCodes,
        bulkSelectedColors: { purple: false, green: false, navy: false }, // always reset on team change
      };
    });

    // Clear current applied filter if selection is cleared
    if (currentAppliedFilter && event.length === 0) {
      setCurrentAppliedFilter(null);
    }

    filterWeeklySummaries(); // apply filtering after state change
  };

  const handleOverHoursToggleChange = () => {
    setState(prev => ({
      ...prev,
      selectedOverTime: !prev.selectedOverTime,
    }));
  };

  const handleBioStatusToggleChange = () => {
    setState(prev => ({
      ...prev,
      selectedBioStatus: !prev.selectedBioStatus,
    }));
  };

  const handleChartStatusToggleChange = () => {
    setState(prevState => ({
      ...prevState,
      chartShow: !prevState.chartShow,
    }));
  };

  const handleTeamCodeChange = (oldTeamCode, newTeamCode, userIdObj) => {
    try {
      setState(prevState => {
        let { teamCodes, summaries, selectedCodes } = prevState;
        // Find and update the user's team code in summaries
        summaries = summaries.map(summary => {
          if (userIdObj[summary._id]) {
            return { ...summary, teamCode: newTeamCode };
          }
          return summary;
        });
        let noTeamCodeCount = 0;
        summaries.forEach(summary => {
          if (summary.teamCode.length <= 0) {
            noTeamCodeCount += 1;
          }
        });
        // Count the occurrences of each team code
        const teamCodeCounts = summaries.reduce((acc, { teamCode }) => {
          acc[teamCode] = (acc[teamCode] || 0) + 1;
          return acc;
        }, {});
        const teamCodeWithUserId = summaries.reduce((acc, { _id, teamCode }) => {
          if (acc && acc[teamCode]) {
            acc[teamCode].push(_id);
          } else {
            acc[teamCode] = [_id];
          }
          return acc;
        }, {});

        // Update teamCodes by filtering out those with zero count
        teamCodes = Object.entries(teamCodeCounts)
          .filter(([code, count]) => code.length > 0 && count > 0)
          .map(([code, count]) => ({
            label: `${code} (${count})`,
            value: code,
            _ids: teamCodeWithUserId[code],
          }));
        // Update selectedCodes labels and filter out those with zero count
        selectedCodes = selectedCodes
          .map(selected => {
            const count = teamCodeCounts[selected.value];
            const ids = teamCodeWithUserId[selected.value];
            if (selected?.label.includes('Select All With NO Code') && noTeamCodeCount > 0) {
              return {
                ...selected,
                label: `Select All With NO Code (${noTeamCodeCount || 0})`,
                _ids: ids,
              };
            }
            if (count !== undefined && count > 0) {
              return { ...selected, label: `${selected.value} (${count})`, _ids: ids };
            }
            return null;
          })
          .filter(Boolean);

        // Sort teamCodes by label
        teamCodes
          .sort((a, b) => a.label.localeCompare(b.label))
          .push({
            value: '',
            label: `Select All With NO Code (${noTeamCodeCount || 0})`,
            _ids: teamCodeWithUserId[''],
          });

        return {
          ...prevState,
          summaries,
          teamCodes,
          selectedCodes,
        };
      });

      // Update saved filters in the database with the new team code
      if (oldTeamCode && newTeamCode && oldTeamCode !== newTeamCode) {
        // Get the user ID from the userIdObj
        const userId = Object.keys(userIdObj)[0];
        props.updateSavedFiltersForIndividualTeamCodeChange(oldTeamCode, newTeamCode, userId);

        // Refresh saved filters after the update
        setTimeout(() => {
          props.getSavedFilters();
        }, 1000);
      }

      return null;
    } catch (error) {
      return null;
    }
  };

  // Keeping this block commented intentionally for future reference —
  // const handleSelectColorChange = event => {
  //   setState(prevState => ({
  //     ...prevState,
  //     selectedColors: event,
  //   }));
  // };
  // const handleReplaceCode = e => {
  //   try {
  //     e.persist();
  //     setState(prevState => ({ ...prevState, replaceCode: e.target?.value }));
  //     return e;
  //   } catch (error) {
  //     return null;
  //   }
  // };
  // const handleTrophyToggleChange = () => {
  //   setState(prevState => ({
  //     ...prevState,
  //     selectedTrophies: !prevState.selectedTrophies,
  //   }));
  // };
  // const handleSpecialColorToggleChange = (color, isEnabled) => {
  //   setState(prevState => ({
  //     ...prevState,
  //     selectedSpecialColors: {
  //       ...prevState.selectedSpecialColors,
  //       [color]: isEnabled,
  //     },
  //   }));
  // };
  // const handleSpecialColorDotClick = (userId, color) => {
  //   setState(prevState => {
  //     const updatedSummaries = prevState.summaries.map(summary => {
  //       if (summary._id === userId) {
  //         return { ...summary, filterColor: color };
  //       }
  //       return summary;
  //     });
  //     // Also update the tab-specific cache
  //     const updatedSummariesByTab = {
  //       ...prevState.summariesByTab,
  //       [prevState.activeTab]: updatedSummaries,
  //     };
  //     return {
  //       ...prevState,
  //       summaries: updatedSummaries,
  //       summariesByTab: updatedSummariesByTab,
  //     };
  //   });
  // };

  // Saved filters functionality
  const handleSaveFilter = async filterName => {
    const filterConfig = {
      selectedCodes: state.selectedCodes.map(code => code.value),
    };

    const result = await props.createSavedFilter({
      name: filterName,
      filterConfig,
    });

    if (result.status === 201) {
      setState(prevState => ({
        ...prevState,
        saveFilterModalOpen: false,
      }));
      // Refresh the saved filters list
      props.getSavedFilters();
    }
  };

  const handleUpdateFilter = async filterName => {
    if (!currentAppliedFilter) return;

    const filterConfig = {
      selectedCodes: state.selectedCodes.map(code => code.value),
    };

    const result = await props.updateSavedFilter(currentAppliedFilter._id, {
      name: filterName,
      filterConfig,
    });

    if (result.status === 200) {
      setShowModificationModal(false);
      // Update the current applied filter with the new data
      setCurrentAppliedFilter(result.data);
      // Refresh the saved filters list
      props.getSavedFilters();
    }
  };

  const handleApplyFilter = filter => {
    // Validate that the saved filter codes still exist in current team codes
    const validCodes = filter.filterConfig.selectedCodes
      .map(codeValue => state.teamCodes.find(currentCode => currentCode.value === codeValue))
      .filter(Boolean);

    setState(prevState => ({
      ...prevState,
      selectedCodes: validCodes,
    }));

    // Set the current applied filter
    setCurrentAppliedFilter(filter);
  };

  const handleDeleteFilter = async filterId => {
    const result = await props.deleteSavedFilter(filterId);
    if (result.status === 200) {
      // Clear current applied filter if it was deleted
      if (currentAppliedFilter && currentAppliedFilter._id === filterId) {
        setCurrentAppliedFilter(null);
      }
      // Refresh the saved filters list
      props.getSavedFilters();
    }
  };

  const handleOpenSaveFilterModal = () => {
    // If no current filter is applied, always create a new filter
    if (!currentAppliedFilter) {
      setState(prevState => ({
        ...prevState,
        saveFilterModalOpen: true,
      }));
      return;
    }

    // If there's a current filter applied, always show modification modal
    // regardless of whether the selection has changed or not
    setShowModificationModal(true);
  };

  const handleCloseSaveFilterModal = () => {
    setState(prevState => ({
      ...prevState,
      saveFilterModalOpen: false,
    }));
  };

  const handleCloseModificationModal = () => {
    setShowModificationModal(false);
  };

  // Keeping this block commented intentionally for future reference —
  // const passwordInputModalToggle = () => {
  //   try {
  //     return (
  //       <PasswordInputModal
  //         open={state.passwordModalOpen}
  //         onClose={onpasswordModalClose}
  //         checkForValidPwd={checkForValidPwd}
  //         isValidPwd={state.isValidPwd}
  //         setSummaryRecepientsPopup={setSummaryRecepientsPopup}
  //         setAuthpassword={setAuthpassword}
  //         authEmailWeeklySummaryRecipient={props.authEmailWeeklySummaryRecipient}
  //       />
  //     );
  //   } catch (error) {
  //     return null;
  //   }
  // };

  const handleAllTeamCodeReplace = async () => {
    try {
      const { replaceCode, selectedCodes, summaries, teamCodes, teamCodeWarningUsers } = state;

      setState(prev => ({
        ...prev,
        replaceCodeLoading: true,
      }));

      const isValidCode = fullCodeRegex.test(replaceCode);
      if (!isValidCode) {
        setState(prev => ({
          ...prev,
          replaceCodeError: 'NOT SAVED! The code must be between 5 and 7 characters long.',
        }));
        return;
      }

      const oldTeamCodes = selectedCodes.map(code => code.value);

      const warningUsersToSend = teamCodeWarningUsers
        .filter(user => oldTeamCodes.includes(user.teamCode))
        .map(user => user._id);

      const response = await axios.post(ENDPOINTS.REPLACE_TEAM_CODE, {
        oldTeamCodes,
        newTeamCode: replaceCode,
        warningUsers: warningUsersToSend,
      });

      if (response.data?.updatedUsers?.length > 0) {
        const { updatedUsers } = response.data;

        const updatedSummaries = summaries.map(summary => {
          const updateInfo = updatedUsers.find(user => user.userId === summary._id);
          if (updateInfo) {
            return {
              ...summary,
              teamCode: replaceCode,
              teamCodeWarning: updateInfo.teamCodeWarning,
            };
          }
          return summary;
        });

        const updatedTeamCodes = teamCodes
          .filter(teamCode => !oldTeamCodes.includes(teamCode.value))
          .concat({
            value: replaceCode,
            label: `${replaceCode} (${
              updatedSummaries.filter(s => s.teamCode === replaceCode).length
            })`,
            _ids: updatedSummaries.filter(s => s.teamCode === replaceCode).map(s => s._id),
          });

        const updatedSelectedCodes = selectedCodes
          .filter(code => !oldTeamCodes.includes(code.value))
          .concat({
            value: replaceCode,
            label: `${replaceCode} (${
              updatedSummaries.filter(s => s.teamCode === replaceCode).length
            })`,
            _ids: updatedSummaries.filter(s => s.teamCode === replaceCode).map(s => s._id),
          });

        const updatedWarningUsers = [...teamCodeWarningUsers];
        updatedUsers.forEach(({ userId, teamCodeWarning }) => {
          const existingIndex = updatedWarningUsers.findIndex(user => user._id === userId);

          if (teamCodeWarning) {
            if (existingIndex !== -1) {
              updatedWarningUsers[existingIndex].teamCodeWarning = true;
            } else {
              const userProfile = summaries.find(summary => summary._id === userId);
              if (userProfile) {
                userProfile.teamCodeWarning = true;
                updatedWarningUsers.push({ ...userProfile });
              }
            }
          } else if (existingIndex !== -1) {
            updatedWarningUsers.splice(existingIndex, 1);
          }
        });

        // Update saved filters in the database with the new team code
        await props.updateSavedFiltersForTeamCodeChange(oldTeamCodes, replaceCode);

        setState(prev => ({
          ...prev,
          summaries: updatedSummaries,
          teamCodes: updatedTeamCodes,
          selectedCodes: updatedSelectedCodes,
          replaceCode: '',
          replaceCodeError: null,
          teamCodeWarningUsers: updatedWarningUsers,
        }));

        filterWeeklySummaries();
      } else {
        setState(prev => ({
          ...prev,
          replaceCodeError: 'No users found with the selected team codes.',
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        replaceCodeError: 'Something went wrong. Please try again!',
      }));
    } finally {
      setState(prev => ({
        ...prev,
        replaceCodeLoading: false,
      }));
    }
  };

  const handleSelectColorChange = event => {
    setState(prevState => ({
      ...prevState,
      selectedColors: event,
    }));
  };

  const handleReplaceCode = e => {
    try {
      e.persist();
      setState(prevState => ({ ...prevState, replaceCode: e.target?.value }));
      return e;
    } catch (error) {
      return null;
    }
  };

  const handleTrophyToggleChange = () => {
    setState(prevState => ({
      ...prevState,
      selectedTrophies: !prevState.selectedTrophies,
    }));
  };

  const handleSpecialColorToggleChange = (color, isEnabled) => {
    setState(prevState => ({
      ...prevState,
      selectedSpecialColors: {
        ...prevState.selectedSpecialColors,
        [color]: isEnabled,
      },
    }));
  };

  const handleSpecialColorDotClick = async (userId, color) => {
    try {
      // const currentRequestorId = props.auth?.user?.userid;
      // if (!currentRequestorId) {
      //   console.error(
      //     '❌ Cannot update filterColor: Requestor ID is missing from props.auth.',
      //     props.auth,
      //   );
      //   toast.error(
      //     'Cannot update color: Your user information seems incomplete. Please try refreshing the page.',
      //   );
      //   return; // Stop the function here if the ID is missing
      // }
      // **********************************
      // Logging inputs and the current state
      console.log('handleSpecialColorDotClick called with:', { userId, color });
      console.log('Current state.summaries (first 5):', state.summaries?.slice(0, 5)); // Logging the array that is being used

      // *** ADDING THE CHECK FOR VALID SUMMARIES ARRAY ***
      if (!Array.isArray(state.summaries)) {
        console.error('❌ Cannot update: state.summaries is not an array!');
        toast.error('Data is not ready. Please wait a moment and try again.');
        return;
      }
      // *******************************************
      // Step 1: Updating local summaries state
      const updatedSummaries = state.summaries.map(summary => {
        if (summary._id !== userId) return { ...summary };

        const currentColors = Array.isArray(summary.filterColor) ? [...summary.filterColor] : [];

        const hasColor = currentColors.includes(color);
        const newColors = hasColor
          ? currentColors.filter(c => c !== color)
          : [...currentColors, color];

        return { ...summary, filterColor: newColors };
      });

      const updatedUser = updatedSummaries.find(u => u._id === userId);

      // *** ADDING LOG AND CHECK FOR updatedUser ***
      console.log('Result of find:', updatedUser);
      if (!updatedUser) {
        console.error(`❌ Could not find user with ID ${userId} in updatedSummaries.`);
        toast.error('Could not find user data to update. Please refresh.');
        return; // let's Stop if user wasn't found
      }
      // ***************************************
      setState(prev => ({
        ...prev,
        summaries: updatedSummaries,
        summariesByTab: {
          ...prev.summariesByTab,
          [state.activeTab]: updatedSummaries,
        },
      }));

      // Step 2: Preparing the full payload to send to backend
      const currentRequestorId = props.auth?.user?.userid; // Use 'userid'
      if (!currentRequestorId) {
        // ... (keeping the existing guard clause for requestorId) ...
        return;
      }

      const fullPayload = {
        ...updatedUser,
        filterColor: updatedUser.filterColor || [],
        weeklySummaries: updatedUser.weeklySummaries || [],
        weeklycommittedHoursHistory: updatedUser.weeklycommittedHoursHistory || [],
        badgeCollection: updatedUser.badgeCollection || [],
        totalSeconds: updatedUser.totalSeconds || [0, 0, 0, 0],
        promisedHoursByWeek: updatedUser.promisedHoursByWeek || [],
        adminLinks: updatedUser.adminLinks || [],
        requestor: {
          requestorId: currentRequestorId,
          role: props.auth?.user?.role,
          permissions: props.auth?.user?.permissions,
          email: props.auth?.user?.email,
        },
        // optional defaults
        timeOffFrom: updatedUser.timeOffFrom || null,
        timeOffTill: updatedUser.timeOffTill || null,
      };
      console.log('User ID for requestor:', currentRequestorId);
      const payloadToSend = fullPayload;
      console.log('SENDING PAYLOAD:', JSON.stringify(payloadToSend, null, 2));
      // Step 3: Calling the Redux action
      // const res = await props.updateOneSummaryReport(userId, fullPayload);
      try {
        // Adding try...catch here for better error details
        const res = await props.updateOneSummaryReport(userId, payloadToSend);
        console.log('✅ Successfully updated user on backend:', res.data);
      } catch (err) {
        // Logging the specific error from the update action
        console.error('❌ Update action failed:', err.response?.data || err.message || err);
        // Existing toast message can stay here too
        toast.error('Failed to update filterColor. Please try again.');
      }

      // Step 4: Optionally, forcing refetch latest summaries from backend
      // const currentWeekIndex = navItems.indexOf(state.activeTab);
      // const freshSummariesRes = await axios.get(
      //   `/api/reports/weeklysummaries?week=${currentWeekIndex}&forceRefresh=true`,
      // );
      // const freshSummaries = Array.isArray(freshSummariesRes.data) ? freshSummariesRes.data : [];

      // Keeping this block commented intentionally for future reference —
      // setState(prev => ({
      //   ...prev,
      //   summaries: freshSummaries,
      //   summariesByTab: {
      //     ...prev.summariesByTab,
      //     [state.activeTab]: freshSummaries,
      //   },
      // }));
    } catch (err) {
      console.error('❌ Failed to update filterColor:', err);
      toast.error('Failed to update filterColor. Please try again.');
    }
  };
  // Keeping this block commented intentionally for future reference —
  // const handleBulkDotClick = async color => {
  //   if (!state.selectedCodes || state.selectedCodes.length === 0) {
  //     toast.warning('Please, select team codes first');
  //     return;
  //   }
  //   const selectedTeamCodes = state.selectedCodes.map(c => c.value);
  //   const newState = true; // always apply color
  //   // 1️⃣ Optimistic UI update
  //   const updatedSummaries = state.summaries.map(user =>
  //     selectedTeamCodes.includes(user.teamCode) ? { ...user, filterColor: [color] } : user,
  //   );
  //   // 1: Get all users matching selected team codes
  //   const matchingUsers = state.summaries.filter(user => selectedTeamCodes.includes(user.teamCode));
  //   if (matchingUsers.length === 0) {
  //     console.warn('No matching users found for selected team codes!');
  //     return;
  //   }
  //   setState(prev => ({
  //     ...prev,
  //     summaries: updatedSummaries,
  //     summariesByTab: {
  //       ...prev.summariesByTab,
  //       [state.activeTab]: updatedSummaries,
  //     },
  //     bulkSelectedColors: {
  //       purple: color === 'purple',
  //       green: color === 'green',
  //       navy: color === 'navy',
  //     }, // reset dots immediately
  //   }));
  //   // 2️⃣ Fire toast immediately
  //   toast.success(`Bulk "${color}" applied!`);
  //   // 3️⃣ Persist to backend asynchronously (no need to wait)
  //   matchingUsers.forEach(user =>
  //     props
  //       .updateOneSummaryReport(user._id, {
  //         ...user,
  //         filterColor: [color],
  //         requestor: {
  //           requestorId: props.auth?.user?._id,
  //           role: props.auth?.user?.role,
  //           permissions: props.auth?.user?.permissions,
  //           email: props.auth?.user?.email,
  //         },
  //       })
  //       .then(() => console.log(`✅ Updated ${user._id}`))
  //       .catch(err => {
  //         // console.error(`Failed to update user ${user._id}`, err)
  //         const status = err?.response?.status;
  //         const msg = err?.response?.data?.message || err.message;
  //         console.warn(`⚠️ Skipped user ${user._id} (${status}): ${msg}`);
  //       }),
  //   );
  //   // matchingUsers.forEach(user => {
  //   //   const payload = {
  //   //     filterColor: [color], // always overwrite
  //   //     requestor: {
  //   //       requestorId: props.auth?.user?._id,
  //   //       role: props.auth?.user?.role,
  //   //       permissions: props.auth?.user?.permissions,
  //   //       email: props.auth?.user?.email,
  //   //     },
  //   //   };
  //   //   props
  //   //     .updateOneSummaryReport(user._id, payload)
  //   //     .then(() => console.log(`✅ Updated ${user._id}`))
  //   //     .catch(err => {
  //   //       const status = err?.response?.status;
  //   //       const msg = err?.response?.data?.message || err.message;
  //   //       console.warn(`⚠️ Skipped user ${user._id} (${status}): ${msg}`);
  //   //     });
  //   // });
  // };
  // const handleBulkDotClick = async (color, selectedUsers = []) => {
  //   if (!Array.isArray(selectedUsers) || selectedUsers.length === 0) {
  //     console.warn('⚠️ No users passed to handleBulkDotClick');
  //     return;
  //   }
  //   try {
  //     await Promise.all(
  //       console.log('selectedUsers in bulk:', selectedUsers),
  //       console.log('typeof:', typeof selectedUsers, Array.isArray(selectedUsers)),
  //       selectedUsers.map(async user => {
  //         const payload = {
  //           firstName: user.firstName || 'Unknown',
  //           lastName: user.lastName || 'Unknown',
  //           personalLinks: Array.isArray(user.personalLinks) ? user.personalLinks : [],
  //           adminLinks: Array.isArray(user.adminLinks) ? user.adminLinks : [],
  //           filterColor: [color],
  //           requestor: {
  //             requestorId: currentUser._id,
  //             role: currentUser.role,
  //             permissions: currentUser.permissions,
  //           },
  //         };
  //         console.log('🚀 Bulk PUT payload:', payload);
  //         await axios.put(`/userProfile/${user._id}`, payload);
  //       }),
  //     );
  //     toast.success('✅ Bulk color update applied!');
  //   } catch (err) {
  //     console.error('❌ Bulk color update failed:', err);
  //     toast.error('Bulk update failed');
  //   }
  // };
  const handleBulkDotClick = async color => {
    try {
      // 1) Guard: ensure we have selected codes in state
      if (
        !state?.selectedCodes ||
        (Array.isArray(state.selectedCodes) && state.selectedCodes.length === 0)
      ) {
        toast.warning('Please, select team codes first');
        return;
      }

      // 2) Normalize selectedCodes -> always an array of { value } or string
      const safeSelectedCodes = Array.isArray(state.selectedCodes)
        ? state.selectedCodes
        : state.selectedCodes
        ? [state.selectedCodes]
        : [];

      // 3) Extract team code strings and filter out falsy values
      const selectedTeamCodes = safeSelectedCodes
        .map(e => (e && e.value ? e.value : typeof e === 'string' ? e : null))
        .filter(Boolean);

      // 4) Use a Set for membership checks (robust & fast)
      const selectedTeamCodesSet = new Set(selectedTeamCodes);

      // Debug logging
      // eslint-disable-next-line no-console
      console.log('✅ handleBulkDotClick - selectedTeamCodes:', selectedTeamCodes);

      // 5) Find matching users from current state.summaries
      const matchingUsers = Array.isArray(state.summaries)
        ? state.summaries.filter(user => user && selectedTeamCodesSet.has(user.teamCode))
        : [];

      if (matchingUsers.length === 0) {
        // eslint-disable-next-line no-console
        console.warn('No matching users found for selected team codes!');
        toast.warn('No users match the selected team codes.');
        return;
      }

      // Warn + skip any users missing _id
      const usersMissingId = matchingUsers.filter(u => !u?._id);
      if (usersMissingId.length > 0) {
        // eslint-disable-next-line no-console
        console.warn(
          `⚠️ BULK UPDATE PRE-CHECK: ${usersMissingId.length} users are missing an _id and will be skipped!`,
          usersMissingId,
        );
        toast.warn(
          `Warning: ${usersMissingId.length} users have incomplete data and will be skipped.`,
        );
      }

      // Immediate UI feedback
      setState(prev => ({
        ...prev,
        bulkSelectedColors: {
          purple: color === 'purple',
          green: color === 'green',
          navy: color === 'navy',
        },
      }));
      toast.success(`Applying bulk "${color}"...`);

      // Track counts
      let successCount = 0;
      let failCount = 0;

      // Convert matchingUsers into update promises (skipping any with missing _id)
      const updatePromises = matchingUsers.map(user => {
        if (!user?._id) {
          failCount++;
          return Promise.resolve({ status: 'skipped', reason: 'Missing user._id' });
        }

        const payloadToSend = {
          filterColor: [color],
          requestor: {
            requestorId: props.auth?.user?.userid || props.auth?.user?._id || null,
            role: props.auth?.user?.role,
            permissions: props.auth?.user?.permissions,
            email: props.auth?.user?.email,
          },
          firstName: user.firstName,
          lastName: user.lastName,
          personalLinks: user.personalLinks || [],
          adminLinks: user.adminLinks || [],
        };

        return props
          .updateOneSummaryReport(user._id, payloadToSend)
          .then(res => {
            successCount++;
            const updatedUserFromServer = res?.data;

            // Update state safely using functional setState
            setState(prev => {
              const updatedSummaries = Array.isArray(prev.summaries)
                ? prev.summaries.map(u =>
                    u && u._id === user._id
                      ? { ...u, filterColor: updatedUserFromServer?.filterColor || [color] }
                      : u,
                  )
                : prev.summaries;

              const updatedFilteredSummaries = Array.isArray(prev.filteredSummaries)
                ? prev.filteredSummaries.map(u =>
                    u && u._id === user._id
                      ? { ...u, filterColor: updatedUserFromServer?.filterColor || [color] }
                      : u,
                  )
                : prev.filteredSummaries;

              const updatedSummariesForTab = {
                ...prev.summariesByTab,
                [prev.activeTab]: updatedSummaries,
              };

              return {
                ...prev,
                summaries: updatedSummaries,
                filteredSummaries: updatedFilteredSummaries,
                summariesByTab: updatedSummariesForTab,
              };
            });

            // return fulfilled info for Promise.allSettled
            return { status: 'fulfilled', value: res };
          })
          .catch(err => {
            failCount++;
            const status = err?.response?.status;
            const msg = err?.response?.data?.message || err.message;
            // eslint-disable-next-line no-console
            console.warn(`⚠️ Skipped user ${user._id} (${status}): ${msg}`);
            return { status: 'rejected', reason: err };
          });
      });

      // Wait for all to finish
      await Promise.allSettled(updatePromises);

      // Final toasts depending on results
      if (failCount > 0) {
        toast.error(`Bulk update finished. ${successCount} succeeded, ${failCount} failed.`);
      } else {
        toast.success(`Bulk "${color}" applied successfully to ${successCount} users!`);
      }
    } catch (err) {
      // Final safety catch
      // eslint-disable-next-line no-console
      console.error('❌ handleBulkDotClick failed:', err);
      toast.error('Bulk update failed unexpectedly. See console for details.');
    }
  };
  // Keeping this block commented intentionally for future reference —
  // const handleBulkDotClick = async color => {
  //   if (!state.selectedCodes || state.selectedCodes.length === 0) {
  //     toast.warning('Please, select team codes first');
  //     return;
  //   }
  //   const safeSelectedCodes = Array.isArray(selectedCodes)
  //     ? selectedCodes
  //     : selectedCodes
  //     ? [selectedCodes]
  //     : [];
  //   const selectedTeamCodes = safeSelectedCodes
  //     .map(e => (e && e.value ? e.value : e))
  //     .filter(Boolean);
  //   console.log('✅ selectedTeamCodes:', selectedTeamCodes);

  //   // Keeping this block commented intentionally for future reference —
  //   // const selectedTeamCodes = new Set(state.selectedCodes.map(c => c.value));
  //   // const newState = true; // always apply color
  //   // // 1️⃣ Optimistic UI updates
  //   // const updatedSummaries = state.summaries.map(user =>
  //   //   selectedTeamCodes.includes(user.teamCode) ? { ...user, filterColor: [color] } : user,
  //   // );
  //   // 1: Getting all users matching selected team codes
  //   const matchingUsers = state.summaries.filter(user => selectedTeamCodes.includes(user.teamCode));
  //   if (matchingUsers.length === 0) {
  //     console.warn('No matching users found for selected team codes!');
  //     return;
  //   }
  //   const usersMissingId = matchingUsers.filter(u => !u?._id);
  //   if (usersMissingId.length > 0) {
  //     console.warn(
  //       `⚠️ BULK UPDATE PRE-CHECK: ${usersMissingId.length} users are missing an _id and will be skipped!`,
  //       usersMissingId,
  //     );
  //     toast.warn(
  //       `Warning: ${usersMissingId.length} users have incomplete data and will be skipped.`,
  //     );
  //   }
  //   // setState(prev => ({
  //   //   ...prev,
  //   //   summaries: updatedSummaries,
  //   //   summariesByTab: {
  //   //     ...prev.summariesByTab,
  //   //     [state.activeTab]: updatedSummaries,
  //   //   },
  //   //   bulkSelectedColors: {
  //   //     purple: color === 'purple',
  //   //     green: color === 'green',
  //   //     navy: color === 'navy',
  //   //   }, // reset dots immediately
  //   // }));
  //   // --- Showing the immediate feedback ---
  //   setState(prev => ({
  //     ...prev,
  //     bulkSelectedColors: {
  //       purple: color === 'purple',
  //       green: color === 'green',
  //       navy: color === 'navy',
  //     },
  //   }));
  //   toast.success(`Applying bulk "${color}"...`);
  //   // -----------------------------
  //   let successCount = 0;
  //   let failCount = 0;
  //   const updatePromises = matchingUsers.map(user => {
  //     // *** ADDING THE GUARD CLAUSE ***
  //     if (!user?._id) {
  //       console.warn('⚠️ Skipping update for user object missing _id:', user);
  //       failCount++;
  //       return Promise.resolve({ status: 'skipped', reason: 'Missing user._id' }); // Resolve promise for skipped user
  //     }
  //     // ************************
  //     // *** SEND REQUIRED PAYLOAD ***
  //     const payloadToSend = {
  //       filterColor: [color], // Always overwriting with the selected bulk color
  //       requestor: {
  //         requestorId: props.auth?.user?.userid,
  //         role: props.auth?.user?.role,
  //         permissions: props.auth?.user?.permissions,
  //         email: props.auth?.user?.email,
  //       },
  //       firstName: user.firstName,
  //       lastName: user.lastName,
  //       personalLinks: user.personalLinks || [], // adding it even though it's optional
  //       adminLinks: user.adminLinks || [], // adding it even though it's optional
  //     };
  //     // **************************
  //     return props
  //       .updateOneSummaryReport(user._id, payloadToSend) // Passing user._id and full payload
  //       .then(res => {
  //         console.log(`✅ Updated ${user._id}`);
  //         successCount++;
  //         const updatedUserFromServer = res?.data;
  //         setState(prev => {
  //           // --- Updating state.summaries ---
  //           const updatedSummaries = prev.summaries.map(u => {
  //             if (u._id === user._id) {
  //               return {
  //                 ...u,
  //                 filterColor: updatedUserFromServer?.filterColor || [color],
  //               };
  //             }
  //             return u;
  //           });
  //           // *** ALSO Updating state.filteredSummaries ***
  //           const updatedFilteredSummaries = prev.filteredSummaries.map(u => {
  //             if (u._id === user._id) {
  //               // This code finds the same user in the filtered list
  //               return {
  //                 ...u,
  //                 filterColor: updatedUserFromServer?.filterColor || [color], // Applying the same update
  //               };
  //             }
  //             return u;
  //           });
  //           // ******************************************
  //           // Updating the specific tab's cache
  //           const updatedSummariesForTab = {
  //             ...prev.summariesByTab,
  //             [prev.activeTab]: updatedSummaries,
  //           };
  //           return {
  //             ...prev,
  //             summaries: updatedSummaries,
  //             filteredSummaries: updatedFilteredSummaries, // Adding updated filtered list here
  //             summariesByTab: updatedSummariesForTab,
  //           };
  //         });
  //         return { status: 'fulfilled', value: res };
  //       })
  //       .catch(err => {
  //         const status = err?.response?.status;
  //         const msg = err?.response?.data?.message || err.message;
  //         console.warn(`⚠️ Skipped user ${user._id} (${status}): ${msg}`);
  //         failCount++;
  //         return { status: 'rejected', reason: err }; // Returns rejected promise info
  //       });
  //   });
  //   // Waiting for all the updates to finish
  //   await Promise.allSettled(updatePromises);
  //   // --- Final Feedback ---
  //   if (failCount > 0) {
  //     toast.error(`Bulk update finished. ${successCount} succeeded, ${failCount} failed.`);
  //   } else {
  //     toast.success(`Bulk "${color}" applied successfully to ${successCount} users!`);
  //   }
  //   // Resets bulk selection UI after completion
  //   // setState(prev => ({
  //   //   ...prev,
  //   //   bulkSelectedColors: { purple: false, green: false, navy: false },
  //   //   // refreshing: true, // Triggers refresh state if there's one
  //   // }));
  //   // If added a refresh state, trigger the refresh function here:
  //   // refreshCurrentTab();
  //   // createIntialSummaries(); // Refetch initial tab data
  //   // 2️⃣ Fires toast immediately
  //   // toast.success(`Bulk "${color}" applied!`);
  //   // // 3️⃣ Persists to backend asynchronously (no need to wait)
  //   // matchingUsers.forEach(user =>
  //   //   props
  //   //     .updateOneSummaryReport(user.userid, {
  //   //       ...user,
  //   //       filterColor: [color],
  //   //       requestor: {
  //   //         requestorId: props.auth?.user?.userid,
  //   //         role: props.auth?.user?.role,
  //   //         permissions: props.auth?.user?.permissions,
  //   //         email: props.auth?.user?.email,
  //   //       },
  //   //     })
  //   //     .then(() => console.log(`✅ Updated ${user.userid}`))
  //   //     .catch(err => {
  //   //       // console.error(`Failed to update user ${user._id}`, err)
  //   //       const status = err?.response?.status;
  //   //       const msg = err?.response?.data?.message || err.message;
  //   //       console.warn(`⚠️ Skipped user ${user.userid} (${status}): ${msg}`);
  //   //     }),
  //   // );
  //   // above is the latest code
  //   // matchingUsers.forEach(user => {
  //   //   const payload = {
  //   //     filterColor: [color], // always overwrite
  //   //     requestor: {
  //   //       requestorId: props.auth?.user?._id,
  //   //       role: props.auth?.user?.role,
  //   //       permissions: props.auth?.user?.permissions,
  //   //       email: props.auth?.user?.email,
  //   //     },
  //   //   };
  //   //   props
  //   //     .updateOneSummaryReport(user._id, payload)
  //   //     .then(() => console.log(`✅ Updated ${user._id}`))
  //   //     .catch(err => {
  //   //       const status = err?.response?.status;
  //   //       const msg = err?.response?.data?.message || err.message;
  //   //       console.warn(`⚠️ Skipped user ${user._id} (${status}): ${msg}`);
  //   //     });
  //   // });
  //   // };
  // };

  const passwordInputModalToggle = () => {
    try {
      return (
        <PasswordInputModal
          open={state.passwordModalOpen}
          onClose={onpasswordModalClose}
          checkForValidPwd={checkForValidPwd}
          isValidPwd={state.isValidPwd}
          setSummaryRecepientsPopup={setSummaryRecepientsPopup}
          setAuthpassword={setAuthpassword}
          authEmailWeeklySummaryRecipient={props.authEmailWeeklySummaryRecipient}
        />
      );
    } catch (error) {
      return null;
    }
  };

  // Setup effect hooks for initial data load
  useEffect(() => {
    let isMounted = true;
    window._isMounted = isMounted;

    // Reset bulk colors
    setState(prev => ({
      ...prev,
      bulkSelectedColors: { purple: false, green: false, navy: false },
    }));

    // console.log('Initial useEffect running');
    // props.getWeeklySummariesReport().then(freshSummaries => {
    //   createIntialSummaries(freshSummaries);
    // }); // ✅ Ensures fresh MongoDB data is loaded
    // props.getWeeklySummariesReport();
    // Only loads the initial tab, nothing else
    createIntialSummaries();
    // props.getWeeklySummariesReport();

    return () => {
      isMounted = false;
      window._isMounted = false;
      sessionStorage.removeItem('tabSelection');
    };
  }, []);

  useEffect(() => {
    if (state.loading !== loading) {
      setState(prev => ({
        ...prev,
        loading, // sync the prop 'loading' to local state only if it's different
      }));
    }
  }, [loading, state.loading]);

  useEffect(() => {
    if (state.summaries && state.summaries.length > 0) {
      // eslint-disable-next-line no-console
      // console.log('Summaries before filtering:', state.summaries);
      filterWeeklySummaries();
    }
  }, [
    state.selectedOverTime,
    state.selectedLoggedHoursRange,
    state.selectedCodes,
    state.selectedBioStatus,
    state.selectedColors,
    state.selectedTrophies,
    state.selectedSpecialColors,
    state.summaries,
    state.activeTab,
  ]);

  useEffect(() => {
    // On mount: fetch all badges before deriving permissions
    const fetchInitialPermissions = async () => {
      try {
        // Fetch all badges first so we can derive up‑to‑date permissions
        await props.fetchAllBadges();
        setPermissionState(prev => ({
          ...prev,
          bioEditPermission: props.hasPermission('putUserProfileImportantInfo'),
          // codeEditPermission: props.hasPermission('replaceTeamCodes'),
          // allow team‑code edits for specific roles or permissions
          codeEditPermission:
            props.hasPermission('editTeamCode') ||
            props.auth?.user?.role === 'Owner' ||
            props.auth?.user?.role === 'Administrator',
          // Permit editing of summary hour counts if the user has that badge
          canEditSummaryCount: props.hasPermission('editSummaryHoursCount'),
          // Show bio highlights only to users with that permission
          canSeeBioHighlight: props.hasPermission('highlightEligibleBios'),
          // Show badges if user has permission and badges loaded successfully
          hasSeeBadgePermission: props.hasPermission('seeBadges'),
        }));
      } catch (error) {
        // log failure fetching badges or permissions
        // eslint-disable-next-line no-console
        console.error('Failed to fetch badges or permissions', error);
      }
    };

    fetchInitialPermissions();

    // Load saved filters when component mounts
    props.getSavedFilters();
  }, []);

  // workingggggggggg
  // When Redux summaries change, store ONLY for current tab
  // useEffect(() => {
  //   if (!props.summaries?.length) return;
  //   // if (props.summaries?.length) {
  //   //   createIntialSummaries(props.summaries);
  //   // }
  //   if (!state.summaries?.length) {
  //     const merged = props.summaries.map(incoming => ({
  //       ...incoming,
  //       filterColor: Array.isArray(incoming.filterColor) ? [...incoming.filterColor] : [],
  //     }));

  //     setState(prev => {
  //       const merged = props.summaries.map(incoming => ({
  //         ...incoming,
  //         filterColor: Array.isArray(incoming.filterColor) ? [...incoming.filterColor] : [],
  //       }));
  //       //   const existing = prev.summaries.find(s => s._id === incoming._id);
  //       //   return {
  //       //     ...incoming,
  //       //     filterColor: Array.isArray(incoming.filterColor)
  //       //       ? [...incoming.filterColor]
  //       //       : existing?.filterColor || [],
  //       //   };
  //       // });
  //       return {
  //         ...prev,
  //         summaries: merged,
  //         summariesByTab: {
  //           ...prev.summariesByTab,
  //           [prev.activeTab]: merged,
  //         },
  //       };
  //     });
  //   }
  // }, [props.summaries]);

  // trying

  // useEffect(() => {
  //   if (!props.summaries?.length) return;

  //   setState(prev => {
  //     // Keep existing summaries (with correct filterColor)
  //     const existingSummaries = prev.summaries?.length ? prev.summaries : props.summaries;

  //     // Build teamCodes fresh from summaries
  //     const teamCodeCounts = existingSummaries.reduce((acc, { teamCode }) => {
  //       acc[teamCode] = (acc[teamCode] || 0) + 1;
  //       return acc;
  //     }, {});
  //     const teamCodeWithUserId = existingSummaries.reduce((acc, { _id, teamCode }) => {
  //       if (acc[teamCode]) acc[teamCode].push(_id);
  //       else acc[teamCode] = [_id];
  //       return acc;
  //     }, {});

  //     let teamCodes = Object.entries(teamCodeCounts)
  //       .filter(([code, count]) => code?.length > 0 && count > 0)
  //       .map(([code, count]) => ({
  //         label: `${code} (${count})`,
  //         value: code,
  //         _ids: teamCodeWithUserId[code],
  //       }));

  //     const noTeamCodeCount = teamCodeCounts[''] || 0;
  //     teamCodes
  //       .sort((a, b) => a.label.localeCompare(b.label))
  //       .push({
  //         value: '',
  //         label: `Select All With NO Code (${noTeamCodeCount})`,
  //         _ids: teamCodeWithUserId[''] || [],
  //       });

  //     return {
  //       ...prev,
  //       summaries: existingSummaries,
  //       teamCodes,
  //     };
  //   });
  // }, [props.summaries]);

  useEffect(() => {
    // Define all possible color options (the ones you mentioned)
    const allColors = [
      { label: 'Select All', value: 'selectAll' },
      { label: 'Not Required', value: 'notRequired' },
      { label: 'Required', value: 'required' },
      { label: 'Team', value: 'team' },
      { label: 'Team Lush', value: 'teamLush' },
      { label: 'Team Sky', value: 'teamSky' },
      { label: 'Team Skye', value: 'teamSkye' },
      // Add more if needed
    ];

    setState(prev => ({
      ...prev,
      colorOptions: allColors,
    }));
  }, []);
  // When active tab changes, load from cache or fetch fresh
  useEffect(() => {
    if (state.summariesByTab[state.activeTab]) {
      setState(prev => ({
        ...prev,
        summaries: state.summariesByTab[state.activeTab],
      }));
    } else {
      //     props
      //       .getWeeklySummariesReport(state.activeTab)
      //       .then(freshSummaries => {
      //         setState(prev => ({
      //           ...prev,
      //           summaries: freshSummaries,
      //           summariesByTab: {
      //             ...prev.summariesByTab,
      //             [state.activeTab]: freshSummaries,
      //           },
      //         }));
      //       })
      //       .catch(err => console.error(`❌ Failed to fetch data for ${state.activeTab}`, err));
      //   }
      // }, [state.activeTab]);
      // Fetch new data using axios
      const weekIndex = navItems.indexOf(state.activeTab);
      const url = `${ENDPOINTS.WEEKLY_SUMMARIES_REPORT()}?week=${weekIndex}&forceRefresh=true`;

      axios
        .get(url)
        .then(res => {
          const summaries = Array.isArray(res?.data) ? res.data : []; // Getting array

          if (summaries.length > 0) {
            // Processing the array
            let summariesCopy = [...summaries];
            summariesCopy = alphabetize(summariesCopy); // Assuming alphabetize is defined

            summariesCopy = summariesCopy.map(summary => {
              const promisedHoursByWeek = weekDates.map(
                weekDate =>
                  getPromisedHours(weekDate.toDate, summary.weeklycommittedHoursHistory || []), // Assuming getPromisedHours is defined
              );

              // **** Applying the filterColor cleaning logic ****
              let filterColor = [];
              if (Array.isArray(summary.filterColor)) {
                filterColor = summary.filterColor
                  .filter(c => typeof c === 'string') // Filtering out null/non-strings
                  .map(c => c.toLowerCase()); // Ensures it's lowercase
              } else if (typeof summary.filterColor === 'string') {
                // Handles stringified arrays or single strings
                try {
                  const parsed = JSON.parse(summary.filterColor);
                  if (Array.isArray(parsed)) {
                    filterColor = parsed
                      .filter(c => typeof c === 'string')
                      .map(c => c.toLowerCase());
                  } else if (typeof parsed === 'string') {
                    filterColor = [parsed.toLowerCase()];
                  }
                } catch {
                  filterColor = [summary.filterColor.toLowerCase()];
                }
              }
              // ************************************************

              return { ...summary, promisedHoursByWeek, filterColor };
            });

            // Sets the PROCESSED ARRAY into state
            setState(prev => ({
              ...prev,
              summaries: summariesCopy, // summaries is now an array
              summariesByTab: {
                ...prev.summariesByTab,
                [state.activeTab]: summariesCopy,
              },
            }));
          } else {
            // Handles empty response
            setState(prev => ({
              ...prev,
              summaries: [], // summaries is an empty array
              summariesByTab: {
                ...prev.summariesByTab,
                [state.activeTab]: [],
              },
            }));
          }
        })
        .catch(err => console.error(`❌ Failed to fetch data for ${state.activeTab}`, err));
    }
  }, [state.activeTab, state.summariesByTab]); // Dependencies might need adjustment

  const { role, darkMode } = props;
  const { error } = props;
  const hasPermissionToFilter = role === 'Owner' || role === 'Administrator';
  const { authEmailWeeklySummaryRecipient } = props;
  const authorizedUser1 = 'jae@onecommunityglobal.org';
  const authorizedUser2 = 'sucheta_mu@test.com';
  if (error) {
    return (
      <Container className={`container-wsr-wrapper ${darkMode ? 'bg-oxford-blue' : ''}`}>
        <Row
          className="align-self-center pt-2"
          data-testid="error"
          style={{ width: '30%', margin: '0 auto' }}
        >
          <Col>
            <Alert color="danger">Error! {error.message}</Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  if (state.loading) {
    return (
      <SkeletonLoading
        template="WeeklySummariesReport"
        className={darkMode ? 'bg-yinmn-blue' : ''}
      />
    );
  }

  return (
    <Container
      fluid
      className={`container-wsr-wrapper py-3 mb-5 ${
        darkMode ? 'bg-oxford-blue text-light' : 'bg--white-smoke'
      }`}
    >
      {passwordInputModalToggle()}
      {popUpElements()}
      <SaveFilterModal
        isOpen={state.saveFilterModalOpen}
        onClose={handleCloseSaveFilterModal}
        onSave={handleSaveFilter}
        selectedCodes={state.selectedCodes}
        darkMode={darkMode}
        existingFilterNames={props.savedFilters.map(filter => filter.name)}
      />
      <SaveFilterModal
        isOpen={showModificationModal}
        onClose={handleCloseModificationModal}
        onSave={handleSaveFilter}
        onUpdate={handleUpdateFilter}
        selectedCodes={state.selectedCodes}
        darkMode={darkMode}
        existingFilterNames={props.savedFilters.map(filter => filter.name)}
        currentFilter={currentAppliedFilter}
        isModification
      />
      <Row className={styles['mx-max-sm-0']}>
        <Col lg={{ size: 10, offset: 1 }}>
          <h3 className="mt-3 mb-5">
            <div className="d-flex align-items-center">
              <span className="mr-2">Weekly Summaries Reports page</span>
              <EditableInfoModal
                areaName="WeeklySummariesReport"
                areaTitle="Weekly Summaries Report"
                role={role}
                fontSize={24}
                isPermissionPage
                className="p-2" // Add Bootstrap padding class to the EditableInfoModal
                darkMode={darkMode}
              />
            </div>
          </h3>
        </Col>
      </Row>
      {(authEmailWeeklySummaryRecipient === authorizedUser1 ||
        authEmailWeeklySummaryRecipient === authorizedUser2) && (
        <Row className="d-flex justify-content-center mb-3">
          <Button
            color="primary"
            className="permissions-management__button"
            type="button"
            onClick={() => onClickRecepients()}
            style={darkMode ? boxStyleDark : boxStyle}
          >
            Weekly Summary Report Recipients
          </Button>
        </Row>
      )}
      <Row className={styles['mx-max-sm-0']}>
        <Col lg={{ size: 5, offset: 1 }} md={{ size: 6 }} xs={{ size: 12 }}>
          <div className={`${styles.filterContainerTeamcode}`}>
            <div>Select Team Code</div>
            <div className={`${styles.filterStyle}`}>
              <span>Show Chart</span>
              <div className={`${styles.switchToggleControl}`}>
                <input
                  type="checkbox"
                  className={`${styles.switchToggle}`}
                  id="chart-status-toggle"
                  onChange={handleChartStatusToggleChange}
                />
                <label className={`${styles.switchToggleLabel}`} htmlFor="chart-status-toggle">
                  <span className={`${styles.switchToggleInner}`} />
                  <span className={`${styles.switchToggleSwitch}`} />
                </label>
              </div>
            </div>
          </div>

          <div>
            {/* MultiSelect with Save/Delete Buttons */}
            <div style={{ position: 'relative' }}>
              {state.teamCodeWarningUsers.length > 0 && (
                <>
                  <i
                    className="fa fa-info-circle text-danger"
                    data-tip
                    data-placement="top"
                    data-for="teamCodeWarningTooltip"
                    style={{
                      position: 'absolute',
                      left: '-25px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '20px',
                      cursor: 'pointer',
                    }}
                  />
                  <ReactTooltip id="teamCodeWarningTooltip" place="top" effect="solid">
                    {state.teamCodeWarningUsers.length} users have mismatched team codes!
                  </ReactTooltip>
                </>
              )}
              <Select
                isMulti
                isSearchable
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                blurInputOnSelect={false}
                options={state.teamCodes.map(item => {
                  const [code, count] = item.label.split(' (');
                  return {
                    ...item,
                    label: `${code.padEnd(10, ' ')} (${count}`,
                  };
                })}
                value={state.selectedCodes}
                onChange={handleSelectCodeChange}
                components={{
                  Option: CheckboxOption,
                  MenuList: CustomMenuList,
                }}
                placeholder="Search and select team codes..."
                classNamePrefix="custom-select"
                className={`custom-select-container ${darkMode ? 'dark-mode' : ''} ${
                  state.teamCodeWarningUsers.length > 0 ? 'warning-border' : ''
                }`}
                styles={{
                  menuList: base => ({
                    ...base,
                    maxHeight: '700px',
                    overflowY: 'auto',
                  }),
                  option: (base, state) => ({
                    ...base,
                    fontSize: '13px',
                    backgroundColor: state.isFocused ? '#eee' : 'white',
                  }),
                }}
              />

              {/* Save/Delete Buttons - only visible when codes are selected */}
              {state.selectedCodes.length > 0 && hasPermissionToFilter && (
                <div className={styles['filter-save-buttons']}>
                  <button
                    type="button"
                    className={`${styles['filter-save-btn']} ${styles.save}`}
                    onClick={handleOpenSaveFilterModal}
                    title="Save current filter"
                    aria-label="Save current filter"
                  >
                    <i className="fa fa-save" />
                  </button>
                  <button
                    type="button"
                    className={`${styles['filter-save-btn']} ${styles.clear}`}
                    onClick={() => handleSelectCodeChange([])}
                    title="Clear selection"
                    aria-label="Clear selection"
                  >
                    <i className="fa fa-times" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {hasPermissionToFilter && (
            <>
              <div className={`${styles.filterStyle} ${styles.marginRight}`}>
                <span>Filter by Special Colors:</span>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '2px',
                  }}
                >
                  {['purple', 'green', 'navy'].map(color => {
                    const labelMap = {
                      purple: 'Admin Team',
                      green: '20 Hour HGN Team',
                      navy: '10 Hour HGN Team',
                    };
                    return (
                      <div
                        key={`${color}-toggle`}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <span className={styles.filterLabel}>{labelMap[color]}</span>
                        <SlideToggle
                          key={`${color}-toggle`}
                          className={styles.slideToggle}
                          color={color}
                          onChange={handleSpecialColorToggleChange}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* {state.selectedCodes.length > 0 && (
                <div className={cn(styles.filterStyle, styles.filterMarginRight)}>
                  <span className={styles.selectAllLabel}>Select All (Visible Users): </span>
                  <div className={styles.dotSelector}>
                    {['purple', 'green', 'navy'].map(color => (
                      <span
                        key={color}
                        onClick={e => {
                          e.preventDefault();
                          handleBulkDotClick(color);
                        }}
                        className={cn(
                          styles.bulkDot,
                          state.bulkSelectedColors[color] && styles.active,
                        )}
                        style={{
                          display: 'inline-block',
                          width: '15px',
                          height: '15px',
                          margin: '0 5px',
                          borderRadius: '50%',
                          backgroundColor: state.bulkSelectedColors[color] ? color : 'transparent',
                          border: `3px solid ${color}`,
                          cursor: 'pointer',
                        }}
                      />
                    ))}
                  </div>
                </div>
              )} */}
            </>
          )}
          {/* Saved Filter Buttons */}
          {props.savedFilters && props.savedFilters.length > 0 && (
            <div
              style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', alignItems: 'center' }}
              className="my-3"
            >
              {props.savedFilters.map(filter => (
                <div
                  key={filter._id}
                  className={`${styles['saved-filter-button']} ${
                    darkMode ? styles['dark-mode'] : ''
                  } ${
                    currentAppliedFilter && currentAppliedFilter._id === filter._id
                      ? styles['active-filter']
                      : ''
                  }`}
                >
                  <button
                    type="button"
                    className="btn btn-link p-0 mr-1"
                    style={{
                      color: 'inherit',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      fontWeight:
                        currentAppliedFilter && currentAppliedFilter._id === filter._id
                          ? 'bold'
                          : 'normal',
                    }}
                    onClick={() => handleApplyFilter(filter)}
                    title={`Apply filter: ${filter.name}`}
                  >
                    {filter.name}
                  </button>
                  <button
                    type="button"
                    className={styles['saved-filter-delete-btn']}
                    onClick={() => handleDeleteFilter(filter._id)}
                    title="Delete filter"
                    aria-label={`Delete filter ${filter.name}`}
                  >
                    <i className="fa fa-times" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Col>
        <Col lg={{ size: 5 }} md={{ size: 6 }} xs={{ size: 12 }}>
          <div>Select Color</div>
          <Select
            isMulti
            isSearchable
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
            blurInputOnSelect={false}
            options={state.colorOptions}
            value={state.selectedColors}
            onChange={handleSelectColorChange}
            components={{
              Option: CheckboxOption,
              MenuList: CustomMenuList,
            }}
            placeholder="Select color filters..."
            classNamePrefix="custom-select"
            className={`${styles.multiSelectFilter} text-dark ${darkMode ? 'dark-mode' : ''}`}
            styles={{
              menuList: base => ({
                ...base,
                maxHeight: '700px',
                overflowY: 'auto',
              }),
              option: (base, state) => ({
                ...base,
                fontSize: '13px',
                backgroundColor: state.isFocused ? '#eee' : 'white',
              }),
            }}
          />
          {/* <div className={`${styles.filterContainer}`}>
            {hasPermissionToFilter && (
              <div className={`${styles.filterStyle}`}>
                <span>Filter by Special Colors</span>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}
                >
                  {['purple', 'green', 'navy'].map(color => (
                    <div key={`${color}-toggle`} style={{ display: 'flex', alignItems: 'center' }}>
                      <div className={`${styles.switchToggleControl}`}>
                        <input
                          type="checkbox"
                          className={`${styles.switchToggle}`}
                          id={`${color}-toggle`}
                          onChange={e => handleSpecialColorToggleChange(color, e.target.checked)}
                        />
                        <label
                          className={`${styles.switchToggleLabel}`}
                          htmlFor={`${color}-toggle`}
                        >
                          <span className={`${styles.switchToggleInner}`} />
                          <span className={`${styles.switchToggleSwitch}`} />
                        </label>
                      </div>
                      <span
                        style={{
                          marginLeft: '3px',
                          fontSize: 'inherit',
                          textTransform: 'capitalize',
                          whiteSpace: 'nowrap',
                          fontWeight: 'normal',
                        }}
                      >
                        {color}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {(hasPermissionToFilter || props.hasPermission('highlightEligibleBios')) && (
              <div className={`${styles.filterStyle} ml-3`} style={{ minWidth: 'max-content' }}>
                <span>Filter by Bio Status</span>
                <div className={styles.switchToggleControl}>
                  <input
                    type="checkbox"
                    className={styles.switchToggle}
                    id="bio-status-toggle"
                    onChange={handleBioStatusToggleChange}
                  />
                  <label className={styles.switchToggleLabel} htmlFor="bio-status-toggle">
                    <span className={styles.switchToggleInner} />
                    <span className={styles.switchToggleSwitch} />
                  </label>
                </div>
              </div>
            )}
            {hasPermissionToFilter && (
              <div className={`${styles.filterStyle} ml-3`} style={{ minWidth: 'max-content' }}>
                <span>Filter by Trophies</span>
                <div className={`${styles.switchToggleControl}`}>
                  <input
                    type="checkbox"
                    className={`${styles.switchToggle}`}
                    id="trophy-toggle"
                    onChange={handleTrophyToggleChange}
                  />
                  <label className={`${styles.switchToggleLabel}`} htmlFor="trophy-toggle">
                    <span className={`${styles.switchToggleInner}`} />
                    <span className={`${styles.switchToggleSwitch}`} />
                  </label>
                </div>
              </div>
            )}
            {hasPermissionToFilter && (
              <div className={`${styles.filterStyle} ml-3`} style={{ minWidth: 'max-content' }}>
                <span>Filter by Over Hours</span>
                <div className={`${styles.switchToggleControl}`}>
                  <input
                    type="checkbox"
                    className={`${styles.switchToggle}`}
                    id="over-hours-toggle"
                    onChange={handleOverHoursToggleChange}
                  />
                  <label className={`${styles.switchToggleLabel}`} htmlFor="over-hours-toggle">
                    <span className={`${styles.switchToggleInner}`} />
                    <span className={`${styles.switchToggleSwitch}`} />
                  </label>
                </div>
                <ReactTooltip
                  id="filterTooltip"
                  place="top"
                  effect="solid"
                  className="custom-tooltip"
                >
                  <span style={{ whiteSpace: 'normal', wordWrap: 'break-word', maxWidth: '200px' }}>
                    Filter people who contributed more than 25% of their committed hours
                  </span>
                </ReactTooltip>
              </div>
            )}
          </div> */}

          {/* This is the new block from my lastWorking file */}
          <Row style={{ marginBottom: '10px' }}>
            <Col lg={{ size: 10, offset: 1 }} xs="12">
              <div className={`${styles.filterContainer}`}>
                {/* {hasPermissionToFilter && (
                  <>
                    <div className={`${styles.filterStyle} ${styles.marginRight}`}>
                      <span>Filter by Special Colors:</span>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginTop: '2px',
                        }}
                      >
                        {['purple', 'green', 'navy'].map(color => {
                          const labelMap = {
                            purple: 'Admin Team',
                            green: '20 Hour HGN Team',
                            navy: '10 Hour HGN Team',
                          };
                          return (
                            <div
                              key={`${color}-toggle`}
                              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                              <span className={styles.filterLabel}>{labelMap[color]}</span>
                              <SlideToggle
                                key={`${color}-toggle`}
                                className={styles.slideToggle}
                                color={color}
                                onChange={handleSpecialColorToggleChange}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {state.selectedCodes.length > 0 && (
                      <div className={cn(styles.filterStyle, styles.filterMarginRight)}>
                        <span className={styles.selectAllLabel}>Select All (Visible Users): </span>
                        <div className={styles.dotSelector}>
                          {['purple', 'green', 'navy'].map(color => (
                            <span
                              key={color}
                              onClick={e => {
                                e.preventDefault();
                                handleBulkDotClick(color);
                              }}
                              className={cn(
                                styles.bulkDot,
                                state.bulkSelectedColors[color] && styles.active,
                              )}
                              style={{
                                display: 'inline-block',
                                width: '15px',
                                height: '15px',
                                margin: '0 5px',
                                borderRadius: '50%',
                                backgroundColor: state.bulkSelectedColors[color]
                                  ? color
                                  : 'transparent',
                                border: `3px solid ${color}`,
                                cursor: 'pointer',
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )} */}
                {hasPermissionToFilter && state.selectedCodes.length > 0 && (
                  <div
                    className={cn(
                      styles.filterStyle,
                      styles.filterMarginRight,
                      'mt-2',
                      'mb-2',
                      'ml-7',
                    )}
                  >
                    <span className={styles.selectAllLabel}>Select All (Visible Users): </span>
                    <div className={styles.dotSelector}>
                      {['purple', 'green', 'navy'].map(color => (
                        <span
                          key={color}
                          onClick={e => {
                            e.preventDefault();
                            handleBulkDotClick(color);
                          }}
                          className={cn(
                            styles.bulkDot,
                            state.bulkSelectedColors[color] && styles.active,
                          )}
                          style={{
                            display: 'inline-block',
                            width: '15px',
                            height: '15px',
                            margin: '0 5px',
                            borderRadius: '50%',
                            backgroundColor: state.bulkSelectedColors[color]
                              ? color
                              : 'transparent',
                            border: `3px solid ${color}`,
                            cursor: 'pointer',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {(hasPermissionToFilter || props.hasPermission('highlightEligibleBios')) && (
                  <div
                    className={`${styles.filterStyle} ${styles.marginRight}`}
                    style={{ minWidth: 'max-content' }}
                  >
                    <span>Filter by Bio Status</span>
                    <div className={styles.switchToggleControl}>
                      <input
                        type="checkbox"
                        className={styles.switchToggle}
                        id="bio-status-toggle"
                        onChange={handleBioStatusToggleChange}
                      />
                      <label className={styles.switchToggleLabel} htmlFor="bio-status-toggle">
                        <span className={styles.switchToggleInner} />
                        <span className={styles.switchToggleSwitch} />
                      </label>
                    </div>
                  </div>
                )}
                {hasPermissionToFilter && (
                  <div
                    className={`${styles.filterStyle} ${styles.marginRight}`}
                    style={{ minWidth: 'max-content' }}
                  >
                    <span>Filter by Trophies</span>
                    <div className={`${styles.switchToggleControl}`}>
                      <input
                        type="checkbox"
                        className={`${styles.switchToggle}`}
                        id="trophy-toggle"
                        onChange={handleTrophyToggleChange}
                      />
                      <label className={`${styles.switchToggleLabel}`} htmlFor="trophy-toggle">
                        <span className={`${styles.switchToggleInner}`} />
                        <span className={`${styles.switchToggleSwitch}`} />
                      </label>
                    </div>
                  </div>
                )}
                {hasPermissionToFilter && (
                  <div className={`${styles.filterStyle}`} style={{ minWidth: 'max-content' }}>
                    <span>Filter by Over Hours</span>
                    <div className={`${styles.switchToggleControl}`}>
                      <input
                        type="checkbox"
                        className={`${styles.switchToggle}`}
                        id="over-hours-toggle"
                        onChange={handleOverHoursToggleChange}
                      />
                      <label className={`${styles.switchToggleLabel}`} htmlFor="over-hours-toggle">
                        <span className={`${styles.switchToggleInner}`} />
                        <span className={`${styles.switchToggleSwitch}`} />
                      </label>
                    </div>
                    <ReactTooltip
                      id="filterTooltip"
                      place="top"
                      effect="solid"
                      className="custom-tooltip"
                    >
                      <span
                        style={{
                          whiteSpace: 'normal',
                          wordWrap: 'break-word',
                          maxWidth: '200px',
                        }}
                      >
                        Filter people who contributed more than 25% of their committed hours
                      </span>
                    </ReactTooltip>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row className={styles['mx-max-sm-0']}>
        <Col lg={{ size: 5, offset: 6 }} md={{ size: 6 }} xs={{ size: 12 }}>
          <div>Logged Hours Range</div>
          <Select
            isMulti
            placeholder="Select range..."
            components={{
              Option: CheckboxOption,
              MenuList: CustomMenuList,
            }}
            options={[
              { value: '0', label: '0' },
              { value: '0-10', label: '0-10' },
              { value: '10-20', label: '10-20' },
              { value: '20-40', label: '20-40' },
              { value: '>40', label: '>40' },
            ]}
            hideSelectedOptions={false}
            blurInputOnSelect={false}
            closeMenuOnSelect={false}
            className={`${styles.multiSelectFilter} text-dark ${darkMode ? 'dark-mode' : ''}`}
            styles={{
              menuList: base => ({
                ...base,
                maxHeight: '700px',
                overflowY: 'auto',
              }),
              option: (base, state) => ({
                ...base,
                fontSize: '13px',
                backgroundColor: state.isFocused ? '#eee' : 'white',
              }),
            }}
            value={state.selectedLoggedHoursRange}
            onChange={selectedOption =>
              setState({ ...state, selectedLoggedHoursRange: selectedOption })
            }
          />
        </Col>
      </Row>

      {state.chartShow && (
        <Row className={styles['mx-max-sm-0']}>
          <Col lg={{ size: 6, offset: 1 }} md={{ size: 12 }} xs={{ size: 12 }}>
            <SelectTeamPieChart
              chartData={state.chartData}
              COLORS={state.COLORS}
              total={state.total}
              style={{ width: '100%' }}
            />
          </Col>
          <Col lg={{ size: 4 }} md={{ size: 12 }} xs={{ size: 12 }} style={{ width: '100%' }}>
            <TeamChart teamData={state.structuredTableData} darkMode={darkMode} />
          </Col>
        </Row>
      )}

      {permissionState.codeEditPermission && state.selectedCodes && state.selectedCodes.length > 0 && (
        <Row className={styles['mx-max-sm-0']} style={{ marginBottom: '10px' }}>
          <Col lg={{ size: 5, offset: 1 }} md={{ size: 6 }} xs={{ size: 12 }}>
            Replace With
            <Input
              type="string"
              placeholder="replace"
              value={state.replaceCode || ''}
              onChange={e => {
                handleReplaceCode(e);
              }}
            />
            {state.replaceCodeLoading ? (
              <Spinner className="mt-3 mr-1" color="primary" />
            ) : (
              <Button
                className="mr-1 mt-3 btn-bottom"
                color="primary"
                onClick={handleAllTeamCodeReplace}
              >
                Replace
              </Button>
            )}
            {state.replaceCodeError && (
              <Alert className={`${styles.codeAlert}`} color="danger">
                {state.replaceCodeError}
              </Alert>
            )}
          </Col>
        </Row>
      )}
      <Row className={styles['mx-max-sm-0']}>
        <Col lg={{ size: 10, offset: 1 }} xs={{ size: 12 }}>
          <Nav tabs>
            {navItems.map(item => (
              <NavItem key={item}>
                <NavLink
                  href="#"
                  data-testid={item}
                  active={item === state.activeTab}
                  onClick={() => toggleTab(item)}
                >
                  {item}
                </NavLink>
              </NavItem>
            ))}
          </Nav>
          <TabContent
            activeTab={state.activeTab}
            className={`p-4 ${darkMode ? 'bg-yinmn-blue border-0' : ''}`}
          >
            {navItems.map((item, index) => (
              <WeeklySummariesReportTab tabId={item} key={item} hidden={item !== state.activeTab}>
                {state.tabsLoading[item] ? (
                  <Row className={`text-center py-4 ${styles['mx-max-sm-0']}`}>
                    <Col>
                      <Spinner color="primary" />
                      <p>Loading data...</p>
                    </Col>
                  </Row>
                ) : (
                  <>
                    <Row className={styles['mx-max-sm-0']}>
                      <Col sm="12" md="6" className="mb-2">
                        From <b>{weekDates[index].fromDate}</b> to <b>{weekDates[index].toDate}</b>
                      </Col>
                      <Col
                        sm="12"
                        md="6"
                        style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}
                      >
                        <GeneratePdfReport
                          summaries={state.filteredSummaries}
                          weekIndex={index}
                          weekDates={weekDates[index]}
                          darkMode={darkMode}
                        />
                        {permissionState.hasSeeBadgePermission && (
                          <>
                            <Button
                              className="btn--dark-sea-green mr-2"
                              style={darkMode ? boxStyleDark : boxStyle}
                              onClick={() =>
                                setState(prev => ({ ...prev, loadBadges: !state.loadBadges }))
                              }
                            >
                              {state.loadBadges ? 'Hide Badges' : 'Load Badges'}
                            </Button>
                            <Button
                              className="btn--dark-sea-green"
                              style={darkMode ? boxStyleDark : boxStyle}
                              onClick={() =>
                                setState(prev => ({ ...prev, loadTrophies: !state.loadTrophies }))
                              }
                            >
                              {state.loadTrophies ? 'Hide Trophies' : 'Load Trophies'}
                            </Button>
                          </>
                        )}
                        <Button
                          className="btn--dark-sea-green mr-2"
                          style={darkMode ? boxStyleDark : boxStyle}
                          onClick={refreshCurrentTab}
                          disabled={state.refreshing}
                        >
                          {state.refreshing ? <Spinner size="sm" /> : null} Refresh
                        </Button>
                      </Col>
                    </Row>
                    {state.filteredSummaries && state.filteredSummaries.length > 0 ? (
                      <>
                        <Row>
                          <Col>
                            <b>Total Team Members:</b> {state.filteredSummaries.length}
                          </Col>
                        </Row>
                        <Row>
                          <Col>
                            <FormattedReport
                              summaries={state.filteredSummaries}
                              weekIndex={index}
                              bioCanEdit={permissionState.bioEditPermission}
                              canEditSummaryCount={permissionState.canEditSummaryCount}
                              allRoleInfo={state.allRoleInfo}
                              badges={state.badges}
                              loadBadges={state.loadBadges}
                              canEditTeamCode={permissionState.codeEditPermission}
                              auth={state.auth}
                              canSeeBioHighlight={permissionState.canSeeBioHighlight}
                              darkMode={darkMode}
                              handleTeamCodeChange={handleTeamCodeChange}
                              loadTrophies={state.loadTrophies}
                              getWeeklySummariesReport={getWeeklySummariesReport}
                              handleSpecialColorDotClick={handleSpecialColorDotClick}
                            />
                          </Col>
                        </Row>
                      </>
                    ) : (
                      <Row>
                        <Col>
                          <Alert color="info">No data available for this tab.</Alert>
                        </Col>
                      </Row>
                    )}
                  </>
                )}
              </WeeklySummariesReportTab>
            ))}
          </TabContent>
        </Col>
      </Row>
    </Container>
  );
};

WeeklySummariesReport.propTypes = {
  error: PropTypes.any,
  loading: PropTypes.bool.isRequired,
  summaries: PropTypes.array.isRequired,
  infoCollections: PropTypes.array,
  auth: PropTypes.shape({
    user: PropTypes.shape({
      _id: PropTypes.string,
      userid: PropTypes.string,
      role: PropTypes.string,
      permissions: PropTypes.arrayOf(PropTypes.string),
      email: PropTypes.string,
    }),
  }).isRequired,
  toast: PropTypes.shape({
    success: PropTypes.func,
    error: PropTypes.func,
    warn: PropTypes.func,
    warning: PropTypes.func,
  }),
  state: PropTypes.object,
  setState: PropTypes.func,
  updateOneSummaryReport: PropTypes.func.isRequired,
  getWeeklySummariesReport: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  // eslint-disable-next-line no-console
  // debug logs
  // console.log(
  //   '🔵 mapStateToProps summaries:',
  //   (state.weeklySummariesReport?.summaries || []).map(u => ({
  //     id: u._id,
  //     name: `${u.firstName} ${u.lastName}`,
  //     filterColor: u.filterColor,
  //   })),
  // );
  return {
    error: state.weeklySummariesReport?.error || null,
    loading: state.weeklySummariesReport?.loading || false,
    summaries: state.weeklySummariesReport?.summaries || [],
    allBadgeData: state.badge?.allBadgeData || [],
    infoCollections: state.infoCollections?.infos || [],
    role: state?.auth?.user?.role || '',
    savedFilters: state.savedFilters?.savedFilters || [],
    savedFiltersLoading: state.savedFilters?.loading || false,
    savedFiltersError: state.savedFilters?.error || null,
    auth: state?.auth || {},
    darkMode: state?.theme?.darkMode || false,
    authEmailWeeklySummaryRecipient: state?.auth?.user?.email || '',
  };
};

const mapDispatchToProps = dispatch => ({
  fetchAllBadges: () => dispatch(fetchAllBadges()),
  getWeeklySummariesReport: weekIndex => dispatch(getWeeklySummariesReport(weekIndex)),
  hasPermission: permission => dispatch(hasPermission(permission)),
  getInfoCollections: () => dispatch(getInfoCollections()),
  getAllUserTeams: () => dispatch(getAllUserTeams()),
  getAllTeamCode: () => dispatch(getAllTeamCode()),
  setTeamCodes: teamCodes => dispatch(setTeamCodes(teamCodes)),
  createSavedFilter: filter => dispatch(createSavedFilter(filter)),
  deleteSavedFilter: filterId => dispatch(deleteSavedFilter(filterId)),
  updateSavedFilter: (filterId, filterData) => dispatch(updateSavedFilter(filterId, filterData)),
  getSavedFilters: () => dispatch(getSavedFilters()),
  updateSavedFiltersForTeamCodeChange: (oldTeamCodes, newTeamCode) =>
    dispatch(updateSavedFiltersForTeamCodeChange(oldTeamCodes, newTeamCode)),
  updateSavedFiltersForIndividualTeamCodeChange: (oldTeamCode, newTeamCode, userId) =>
    dispatch(updateSavedFiltersForIndividualTeamCodeChange(oldTeamCode, newTeamCode, userId)),
  updateOneSummaryReport: (userId, updatedField) =>
    dispatch(updateOneSummaryReport(userId, updatedField)),
  updateSummaryReport: payload => dispatch(updateSummaryReport(payload)), // ✅ added
  updateSummaryReportFromServerAction: user => dispatch(updateSummaryReportFromServerAction(user)),
});

function WeeklySummariesReportTab({ tabId, hidden, children }) {
  return <TabPane tabId={tabId}>{!hidden && children}</TabPane>;
}

export default connect(mapStateToProps, mapDispatchToProps)(WeeklySummariesReport);
