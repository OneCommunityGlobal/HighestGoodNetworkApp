/* eslint-disable no-console */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
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
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import ReactTooltip from 'react-tooltip';
import { MultiSelect } from 'react-multi-select-component';
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
import CreateFilterModal from './components/CreateFilterModal';
import UpdateFilterModal from './components/UpdateFilterModal';
import SelectFilterModal from './components/SelectFilterModal';
import styles from './WeeklySummariesReport.module.css';
// Keeping this block commented intentionally for future reference
// import { setField, toggleField, removeItemFromField, setChildField } from '~/utils/stateHelper';
import { setField } from '~/utils/stateHelper';
import WeeklySummariesToggleFilter from './components/WeeklySummariesToggleFilter';
// Keeping this block commented intentionally for future reference —
import { SlideToggle } from './components';
import cn from 'classnames';
import {
  useGetWeeklySummariesFiltersQuery,
  useDeleteWeeklySummariesFilterMutation,
  useUpdateFiltersWithIndividualCodesChangeMutation,
  useUpdateFiltersWithReplacedTeamCodesMutation,
} from '../../actions/weeklySummariesFilterAction';
import { getCustomStyles } from '~/utils/reactSelectStyles'; //  Import Styles

const navItems = ['This Week', 'Last Week', 'Week Before Last', 'Three Weeks Ago'];
const fullCodeRegex = /^.{5,7}$/;

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

const updateUserInList = (list, userId, newColors) => {
  if (!Array.isArray(list)) return list;
  return list.map(u => (u && u._id === userId ? { ...u, filterColor: newColors } : u));
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
  selectedExtraMembers: [],
  membersFromUnselectedTeam: [],
  filterChoices: [],
  memberDict: {},
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
  canManageFilter: false,
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

// Keeping this block commented for future reference
// Helper: Process raw summaries into State Data (Team Codes, Colors, Tables)
// -----------------------------------------------------------------------------
// const processDashboardData = summaries => {
//   // 1. Sort Summaries (Alphabetical)
//   const sortedSummaries = [...summaries].sort((a, b) =>
//     `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
//   );
//   // 2. Process Filters & Promises
//   const processedSummaries = sortedSummaries.map(summary => {
//     // Calculate Promised Hours
//     const promisedHoursByWeek = getWeekDates().map(weekDate =>
//       getPromisedHours(weekDate.toDate, summary.weeklycommittedHoursHistory || []),
//     );
//     // Clean Filter Colors
//     let filterColor = [];
//     if (Array.isArray(summary.filterColor)) {
//       filterColor = summary.filterColor
//         .filter(c => typeof c === 'string')
//         .map(c => c.toLowerCase());
//     } else if (typeof summary.filterColor === 'string') {
//       try {
//         const parsed = JSON.parse(summary.filterColor);
//         if (Array.isArray(parsed)) {
//           filterColor = parsed.filter(c => typeof c === 'string').map(c => c.toLowerCase());
//         } else {
//           filterColor = [parsed.toLowerCase()];
//         }
//       } catch {
//         filterColor = [summary.filterColor.toLowerCase()];
//       }
//     }
//     return { ...summary, promisedHoursByWeek, filterColor };
//   });
//   // 3. Generate Team Codes & Table Data
//   const teamCodeGroup = {};
//   const teamCodes = [];
//   const colorOptionGroup = new Set();
//   const colorOptions = [];
//   processedSummaries.forEach(summary => {
//     const code = summary.teamCode || 'noCodeLabel';
//     // Group by Code
//     if (!teamCodeGroup[code]) teamCodeGroup[code] = [];
//     teamCodeGroup[code].push(summary);
//     // Collect Colors
//     if (summary.weeklySummaryOption) colorOptionGroup.add(summary.weeklySummaryOption);
//   });
//   // 4. Build Team Code Options
//   Object.keys(teamCodeGroup).forEach(code => {
//     if (code !== 'noCodeLabel') {
//       teamCodes.push({
//         value: code,
//         label: `${code} (${teamCodeGroup[code].length})`,
//         _ids: teamCodeGroup[code].map(item => item._id),
//       });
//     }
//   });
//   // Add "No Code" Option
//   const noCodeCount = teamCodeGroup.noCodeLabel?.length || 0;
//   teamCodes.sort((a, b) => a.label.localeCompare(b.label));
//   teamCodes.push({
//     value: '',
//     label: `Select All With NO Code (${noCodeCount})`,
//     _ids: teamCodeGroup.noCodeLabel?.map(item => item._id) || [],
//   });
//   // 5. Build Color Options
//   colorOptionGroup.forEach(option => {
//     colorOptions.push({ value: option, label: option });
//   });
//   colorOptions.sort((a, b) => a.label.localeCompare(b.label));
//   return {
//     summaries: processedSummaries,
//     teamCodes,
//     colorOptions,
//     tableData: teamCodeGroup,
//   };
// };

/* eslint-disable react/function-component-definition */
const WeeklySummariesReport = props => {
  const { loading, getInfoCollections } = props;
  const weekDates = getWeekDates();
  const [state, setState] = useState(initialState);
  const [permissionState, setPermissionState] = useState(intialPermissionState);

  // Create filters including toggle and extra members
  const [createFilterModalOpen, setCreateFilterModalOpen] = useState(false);
  const [updateFilterModalOpen, setUpdateFilterModalOpen] = useState(false);
  const [selectFilterModalOpen, setSelectFilterModalOpen] = useState(false);
  const [saveFilterDropdownOpen, setSaveFilterDropdownOpen] = useState(false);

  const toggleSaveFilterDropdown = () => setSaveFilterDropdownOpen(prev => !prev);
  const toggleCreateFilterModal = () => setCreateFilterModalOpen(prev => !prev);
  const toggleUpdateFilterModal = () => setUpdateFilterModalOpen(prev => !prev);
  const toggleSelectFilterModal = () => setSelectFilterModalOpen(prev => !prev);
  // Filters state
  const {
    data: filterChoices = [],
    isLoading: filtersLoading,
    refetch,
  } = useGetWeeklySummariesFiltersQuery();
  const [deleteFilter] = useDeleteWeeklySummariesFilterMutation();
  const [
    updateFilterWithIndividualCodesChange,
  ] = useUpdateFiltersWithIndividualCodesChangeMutation();
  const [updateFilterWithReplacedTeamCodes] = useUpdateFiltersWithReplacedTeamCodesMutation();

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

  // Misc functionalities
  /**
   * Sort the summaries in alphabetixal order
   * @param {*} summaries
   * @returns
   */

  // Keeping this block commented for future reference
  // const alphabetize = summaries => {
  //   const temp = [...summaries];
  //   return temp.sort((a, b) =>
  //     `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
  //   );
  // };

  const processRawSummaries = rawSummaries => {
    // 1. Alphabetize
    const summariesCopy = [...rawSummaries].sort((a, b) =>
      `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
    );

    // 2. Process Hours & Colors
    const processedSummaries = summariesCopy.map(summary => {
      const promisedHoursByWeek = weekDates.map(weekDate =>
        // Assuming getPromisedHours is defined in component scope or imported
        getPromisedHours(weekDate.toDate, summary.weeklycommittedHoursHistory || []),
      );

      let filterColor = [];
      if (Array.isArray(summary.filterColor)) {
        filterColor = summary.filterColor
          .filter(c => typeof c === 'string')
          .map(c => c.toLowerCase());
      } else if (typeof summary.filterColor === 'string') {
        try {
          const parsed = JSON.parse(summary.filterColor);
          filterColor = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          filterColor = [summary.filterColor.toLowerCase()];
        }
      }
      return { ...summary, promisedHoursByWeek, filterColor };
    });

    // 3. Generate Team Codes & Colors
    const teamCodeGroup = {};
    const newTeamCodes = [];
    const colorOptionGroup = new Set();
    const newColorOptions = [];

    processedSummaries.forEach(summary => {
      const code = summary.teamCode || 'noCodeLabel';
      if (!teamCodeGroup[code]) teamCodeGroup[code] = [];
      teamCodeGroup[code].push(summary);
      if (summary.weeklySummaryOption) colorOptionGroup.add(summary.weeklySummaryOption);
    });

    Object.keys(teamCodeGroup).forEach(code => {
      if (code !== 'noCodeLabel') {
        newTeamCodes.push({
          value: code,
          label: `${code} (${teamCodeGroup[code].length})`,
          _ids: teamCodeGroup[code].map(item => item._id),
        });
      }
    });

    newTeamCodes.sort((a, b) => a.label.localeCompare(b.label));
    const noCodeCount = teamCodeGroup.noCodeLabel?.length || 0;
    newTeamCodes.push({
      value: '',
      label: `Select All With NO Code (${noCodeCount})`,
      _ids: teamCodeGroup.noCodeLabel?.map(item => item._id) || [],
    });

    colorOptionGroup.forEach(option => {
      newColorOptions.push({ value: option, label: option });
    });
    newColorOptions.sort((a, b) => a.label.localeCompare(b.label));

    return {
      summaries: processedSummaries,
      teamCodes: newTeamCodes,
      colorOptions: newColorOptions,
      tableData: teamCodeGroup,
    };
  };

  const doesSummaryBelongToWeek = (startDateStr, endDateStr, weekIndex) => {
    // keeping this block commented for future reference
    // weekIndex: 0 = This Week, 1 = Last Week, 2 = Week Before Last, 3 = Three Weeks Ago
    const weekStartLA = moment()
      .tz('America/Los_Angeles')
      .startOf('week')
      .subtract(weekIndex, 'week')
      .toDate();

    const weekEndLA = moment()
      .tz('America/Los_Angeles')
      .endOf('week')
      .subtract(weekIndex, 'week')
      .toDate();

    const summaryStart = new Date(startDateStr);
    const summaryEnd = new Date(endDateStr);

    // keep if it overlaps that week
    return summaryStart <= weekEndLA && summaryEnd >= weekStartLA;
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

  // keeping this block commented for future reference
  // const fetchFilters = async () => {
  //   // Get all filters
  //   let filterList = [];
  //   try {
  //     const filterResponse = await axios.get(ENDPOINTS.WEEKLY_SUMMARIES_FILTERS);
  //     if (filterResponse.status < 200 || filterResponse.status >= 300) {
  //       toast.error(`API request to get filter list failed with status ${filterResponse.status}`);
  //     } else {
  //       filterList = filterResponse.data;
  //     }
  //   } catch (e) {
  //     toast.error(`API request to get filter list failed with error ${e}`);
  //   }
  //   const updatedFilterChoices = [];
  //   filterList.forEach(filter => {
  //     updatedFilterChoices.push({
  //       label: filter.filterName,
  //       value: filter._id,
  //       filterData: {
  //         filterName: filter.filterName,
  //         selectedCodes: new Set(filter.selectedCodes),
  //         selectedColors: new Set(filter.selectedColors),
  //         selectedExtraMembers: new Set(filter.selectedExtraMembers),
  //         selectedTrophies: filter.selectedTrophies,
  //         selectedSpecialColors: filter.selectedSpecialColors,
  //         selectedBioStatus: filter.selectedBioStatus,
  //         selectedOverTime: filter.selectedOverTime,
  //       },
  //     });
  //   });
  //   setState(prevState => ({
  //     ...prevState,
  //     filterChoices: [...updatedFilterChoices],
  //   }));
  // };
  // const fetchFilters = async () => {
  //   // Get all filters
  //   let filterList = [];
  //   try {
  //     const filterResponse = await axios.get(ENDPOINTS.WEEKLY_SUMMARIES_FILTERS);
  //     if (filterResponse.status < 200 || filterResponse.status >= 300) {
  //       toast.error(`API request to get filter list failed with status ${filterResponse.status}`);
  //     } else {
  //       filterList = filterResponse.data;
  //     }
  //   } catch (e) {
  //     toast.error(`API request to get filter list failed with error ${e}`);
  //   }
  //   const updatedFilterChoices = [];
  //   filterList.forEach(filter => {
  //     updatedFilterChoices.push({
  //       label: filter.filterName,
  //       value: filter._id,
  //       filterData: {
  //         filterName: filter.filterName,
  //         selectedCodes: new Set(filter.selectedCodes),
  //         selectedColors: new Set(filter.selectedColors),
  //         selectedExtraMembers: new Set(filter.selectedExtraMembers),
  //         selectedTrophies: filter.selectedTrophies,
  //         selectedSpecialColors: filter.selectedSpecialColors,
  //         selectedBioStatus: filter.selectedBioStatus,
  //         selectedOverTime: filter.selectedOverTime,
  //       },
  //     });
  //   });
  //   setState(prevState => ({
  //     ...prevState,
  //     filterChoices: [...updatedFilterChoices],
  //   }));
  // };

  // Keeping this block commented intentionally for future reference —
  // Initial data loading
  const createIntialSummaries = async () => {
    try {
      const { fetchAllBadges, hasPermission, auth, setTeamCodes } = props;

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
        canManageFilter:
          hasPermission('manageSummariesFilters') ||
          auth.user.role === 'Owner' ||
          auth.user.role === 'Administrator',
        hasSeeBadgePermission: hasPermission('seeBadges') && badgeStatusCode === 200,
      }));

      //   const res = await getWeeklySummariesReport(weekIndex); // old working code
      // const summaries = res?.data ?? []; // old working code
      // Fetch data for the active tab only with cache-busting
      const response = await axios.get(ENDPOINTS.WEEKLY_SUMMARIES_REPORT(), {
        params: { week: weekIndex, forceRefresh: true, _ts: Date.now() },
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      });
      // console.log('API response:', response);
      const summaries = response?.data ?? [];

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

      const processedData = processRawSummaries(summaries);

      const { summaries: summariesCopy, teamCodes, colorOptions } = processedData;

      setTeamCodes(teamCodes);
      // keeping this block commented for future reference
      // Process the data
      // const teamCodeGroup = {};
      // const teamCodes = [];
      // // Shallow copy and sort
      // let summariesCopy = [...summaries];
      // summariesCopy = alphabetize(summariesCopy);
      // summariesCopy = summariesCopy.filter(summary => summary?.isActive !== false);
      // // Add new key of promised hours by week
      // summariesCopy = summariesCopy.map(summary => {
      //   const promisedHoursByWeek = weekDates.map(weekDate =>
      //     getPromisedHours(weekDate.toDate, summary.weeklycommittedHoursHistory),
      //   );
      //   // // Keeping this block commented intentionally for future reference —
      //   // let filterColor = [];
      //   // // Keeping this block commented intentionally for future reference —
      //   // // const filterColor = summary.filterColor || null; // old working code
      //   // if (Array.isArray(summary.filterColor)) {
      //   //   filterColor = summary.filterColor;
      //   // } else if (typeof summary.filterColor === 'string') {
      //   //   try {
      //   //     const parsed = JSON.parse(summary.filterColor);
      //   //     filterColor = Array.isArray(parsed) ? parsed : [summary.filterColor];
      //   //   } catch {
      //   //     filterColor = [summary.filterColor];
      //   //   }
      //   // }
      //   let filterColor = [];
      //   if (Array.isArray(summary.filterColor)) {
      //     // 1. Filter out junk data (like 'null')
      //     // 2. Convert all strings to lowercase (good practice)
      //     filterColor = summary.filterColor
      //       .filter(c => typeof c === 'string') // Keep only strings
      //       .map(c => c.toLowerCase()); // Ensure lowercase
      //   } else if (typeof summary.filterColor === 'string') {
      //     // Handles cases where DB stores '["purple"]' or just 'Purple'
      //     try {
      //       const parsed = JSON.parse(summary.filterColor);
      //       if (Array.isArray(parsed)) {
      //         // It was a stringified array, clean it
      //         filterColor = parsed.filter(c => typeof c === 'string').map(c => c.toLowerCase());
      //       } else if (typeof parsed === 'string') {
      //         // It was a single string like '"purple"'
      //         filterColor = [parsed.toLowerCase()];
      //       }
      //     } catch {
      //       // It was just a plain string like 'Purple'
      //       filterColor = [summary.filterColor.toLowerCase()];
      //     }
      //   }
      //   return { ...summary, promisedHoursByWeek, filterColor };
      // });
      // const colorOptionGroup = new Set();
      // const colorOptions = [];
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

      const memberDict = {};
      // Process team codes and colors
      summariesCopy.forEach(summary => {
        const code = summary.teamCode || 'noCodeLabel';
        if (teamCodeGroup[code]) {
          teamCodeGroup[code].push(summary);
        } else {
          teamCodeGroup[code] = [summary];
        }
        memberDict[summary._id] = `${summary.firstName} ${summary.lastName}`;

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
      // keeping this block commented for future reference
      // setTeamCodes(teamCodes);
      // colorOptionGroup.forEach(option => {
      //   colorOptions.push({
      //     value: option,
      //     label: option,
      //   });
      // });
      // colorOptions.sort((a, b) => `${a.label}`.localeCompare(`${b.label}`));
      // teamCodes
      //   .sort((a, b) => `${a.label}`.localeCompare(`${b.label}`))
      //   .push({
      //     value: '',
      //     label: `Select All With NO Code (${teamCodeGroup.noCodeLabel?.length || 0})`,
      //     _ids: teamCodeGroup?.noCodeLabel?.map(item => item._id),
      //   });
      // const chartData = [];
      // // Get all filters
      // // fetchFilters();
      // // eslint-disable-next-line no-console
      // // 🟢 NEW: Final debug log before setting state
      // // eslint-disable-next-line no-console
      // console.log('🏁 Final processed summaries with filterColors:');
      // for (const summary of summariesCopy.slice(0, 3)) {
      //   // eslint-disable-next-line no-console
      //   console.log(
      //     `  - ${summary.firstName} ${summary.lastName}: ${JSON.stringify(summary.filterColor)}`,
      //   );
      // }
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
        memberDict,
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

  const updateMembersFromUnselectedTeam = () => {
    // Add all selected member in a Set
    const selectedMemberSet = new Set();
    state.selectedCodes.forEach(code => {
      if (code.value === '') return;
      if (code.value in state.tableData) {
        const team = state.tableData[code.value];
        team.forEach(member => {
          selectedMemberSet.add(member._id);
        });
      }
    });

    // Filter members from unselected set
    const newMembersFromUnselectedTeam = [];
    state.summaries.forEach(summary => {
      if (!selectedMemberSet.has(summary._id)) {
        newMembersFromUnselectedTeam.push({
          label: `${summary.firstName} ${summary.lastName}`,
          value: summary._id,
          role: summary.role,
        });
      }
    });
    setState(prev => ({
      ...prev,
      membersFromUnselectedTeam: newMembersFromUnselectedTeam,
      // Remove individuals that is in selected team
      selectedExtraMembers: prev.selectedExtraMembers.filter(
        member => !selectedMemberSet.has(member.value),
      ),
    }));
  };

  // Update members of membersFromUnselectedTeam dropdown
  useEffect(() => {
    updateMembersFromUnselectedTeam();
  }, [state.selectedCodes, state.summaries]);

  const onSummaryRecepientsPopupClose = () => {
    setField(setState, 'summaryRecepientsPopupOpen', false);
  };

  const setSummaryRecepientsPopup = val => {
    setField(setState, 'summaryRecepientsPopupOpen', val);
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
    setField(setState, 'passwordModalOpen', false);
  };

  const checkForValidPwd = booleanVal => {
    setField(setState, 'isValidPwd', booleanVal);
  };

  // Authorization for the weeklySummary Recipients is required once
  const setAuthpassword = authPass => {
    setField(setState, 'weeklyRecipientAuthPass', authPass);
  };

  const onClickRecepients = () => {
    if (state.weeklyRecipientAuthPass) {
      setField(setState, 'summaryRecepientsPopupOpen', true);
    } else {
      setField(setState, 'passwordModalOpen', true);
      checkForValidPwd(true);
    }
  };

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
        // tableData,
        COLORS,
        selectedSpecialColors,
        selectedExtraMembers,
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
      const selectedExtraMembersArray = selectedExtraMembers
        ? selectedExtraMembers.map(e => e.value)
        : [];
      const weekIndex = navItems.indexOf(state.activeTab);
      const activeFilterColors = Object.entries(selectedSpecialColors || {})
        .filter(([, isSelected]) => isSelected)
        .map(([color]) => color);

      const temp = summaries
        .map(s => ({ ...s }))
        .filter(summary => {
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
          if (
            summary?.isActive === false &&
            !doesSummaryBelongToWeek(summary.startDate, summary.endDate, weekIndex)
          ) {
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

          // keeping this block commented out for future reference
          // Add special color filter logic
          // const matchesSpecialColor =
          //   activeFilterColors.length === 0 || activeFilterColors.includes(summary.filterColor);
          // const matchesSpecialColor =
          //   // activeFilterColors.length === 0 ||
          //   // activeFilterColors.some(color => summary.filterColor?.includes?.(color));
          //   activeFilterColors.length === 0 || activeFilterColors.includes(summary.filterColor); // old one

          const matchesSpecialColor =
            activeFilterColors.length === 0 ||
            activeFilterColors.some(color => summary.filterColor?.includes(color));

          // Filtered by Team Code and Extra Members
          const isInSelectedCode = selectedCodesArray.includes(summary.teamCode);
          const isInSelectedExtraMember = selectedExtraMembersArray.includes(summary._id);
          const noFilterSelected =
            selectedCodesArray.length === 0 && selectedExtraMembersArray.length === 0;

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
            (noFilterSelected || isInSelectedCode || isInSelectedExtraMember) &&
            (selectedColorsArray.length === 0 ||
              selectedColorsArray.includes(summary.weeklySummaryOption)) &&
            matchesSpecialColor &&
            isOverHours &&
            isBio &&
            hasTrophy &&
            matchesLoggedHoursRange
          );
        });

      // Use Dict and Set for quick access
      const filteredTeamDict = {};
      const filteredIdSet = new Set();
      filteredTeamDict[''] = [];

      temp.forEach(summary => {
        if (summary.teamCode) {
          if (!(summary.teamCode in filteredTeamDict)) {
            filteredTeamDict[summary.teamCode] = [];
          }
          filteredTeamDict[summary.teamCode].push(summary);
        } else {
          filteredTeamDict[''].push(summary);
        }
        filteredIdSet.add(summary._id);
      });

      // Get chartData and structuredTeamTableData
      if (selectedCodes[0]?.value === '' || selectedCodes.length >= 52) {
        if (selectedCodes.length >= 52) {
          selectedCodes.forEach(code => {
            if (code.value === '') return;
            chartData.push({
              name: code.label,
              value: code.value in filteredTeamDict ? filteredTeamDict[code.value].length : 0,
              // value: temp.filter(summary => summary.teamCode === code.value).length,
            });
            const team = filteredTeamDict[code.value];
            // const team = tableData[code.value];
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
            value: '' in filteredTeamDict ? filteredTeamDict[''].length : 0,
            // value: temp.filter(summary => summary.teamCode === '').length,
          });
          // const team = tableData.noCodeLabel;
          const team = filteredTeamDict[''];
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
          const val = code.value in filteredTeamDict ? filteredTeamDict[code.value].length : 0;
          // const val = temp.filter(summary => summary.teamCode === code.value).length;
          if (val > 0) {
            chartData.push({
              name: code.label,
              value: val,
            });
          }
          // const team = tableData[code.value];
          const team = filteredTeamDict[code.value];
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

      // Add Extra Members data to chartData and structuredTeamTableData
      if (selectedExtraMembersArray.length > 0) {
        const color = COLORS[selectedCodesArray.length % COLORS.length];
        const members = [];
        selectedExtraMembers.forEach(option => {
          if (filteredIdSet.has(option.value)) {
            members.push({
              name: option.label,
              role: option.role,
              id: option.value,
            });
          }
        });
        if (members.length > 0) {
          chartData.push({
            name: 'Extra Members',
            value: members.length,
          });
        }
        structuredTeamTableData.push({ team: 'Extra Members', color, members });
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
      // Use the force refresh parameter and cache-busting timestamp
      const weekIndex = navItems.indexOf(activeTab);
      const response = await axios.get(ENDPOINTS.WEEKLY_SUMMARIES_REPORT(), {
        params: { week: weekIndex, forceRefresh: true, _ts: Date.now() },
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      });

      if (response.status === 200) {
        // keeping this block commented out for future reference
        // Process the data
        // let summariesCopy = [...response.data];
        // summariesCopy = alphabetize(summariesCopy);
        // // Add promised hours data
        // summariesCopy = summariesCopy.map(summary => {
        //   const promisedHoursByWeek = weekDates.map(weekDate =>
        //     getPromisedHours(weekDate.toDate, summary.weeklycommittedHoursHistory || []),
        //   );
        //   // Keeping this block commented intentionally for future reference —
        //   // const filterColor = summary.filterColor || null;
        //   // return { ...summary, promisedHoursByWeek, filterColor }; // both lines old working code
        //   let filterColor = [];
        //   if (Array.isArray(summary.filterColor)) {
        //     filterColor = summary.filterColor;
        //   } else if (typeof summary.filterColor === 'string') {
        //     filterColor = [summary.filterColor];
        //   }
        //   return {
        //     ...summary,
        //     promisedHoursByWeek,
        //     filterColor,
        //   };
        // });
        const processedData = processRawSummaries(response.data);
        const { summaries: summariesCopy } = processedData;

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

      const weekIndex = navItems.indexOf(tab);

      // Always refetch for "Last Week" so late submissions show up
      const shouldForceFetch = tab === 'Last Week';

      if (!shouldForceFetch && state.summariesByTab[tab] && state.summariesByTab[tab].length > 0) {
        // use cache
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
        // fetch fresh
        props
          .getWeeklySummariesReport(weekIndex)
          .then(res => {
            if (res && res.data) {
              // keeping this block commented for future reference
              // let summariesCopy = [...res.data];
              // summariesCopy = alphabetize(summariesCopy);
              // summariesCopy = summariesCopy.map(summary => {
              //   const promisedHoursByWeek = weekDates.map(weekDate =>
              //     getPromisedHours(weekDate.toDate, summary.weeklycommittedHoursHistory || []),
              //   );
              //   // Keeping this block commented intentionally for future reference —
              //   // const filterColor = summary.filterColor || null;
              //   // return { ...summary, promisedHoursByWeek, filterColor }; old working code
              //   let filterColor = [];
              //   if (Array.isArray(summary.filterColor)) {
              //     filterColor = summary.filterColor;
              //   } else if (typeof summary.filterColor === 'string') {
              //     filterColor = [summary.filterColor];
              //   }
              //   return {
              //     ...summary,
              //     promisedHoursByWeek,
              //     filterColor,
              //   };
              // });
              const processedData = processRawSummaries(response.data);
              const { summaries: summariesCopy } = processedData;

              setState(prevState => ({
                ...prevState,
                summaries: summariesCopy,
                filteredSummaries: summariesCopy,
                badges: props.allBadgeData || prevState.badges,
                loadedTabs: [...new Set([...prevState.loadedTabs, tab])],
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
  };

  // keeping this block commented out for future use
  // const handleOverHoursToggleChange = () => {
  //   setState(prev => ({
  //     ...prev,
  //     selectedOverTime: !prev.selectedOverTime,
  //   }));
  // };
  // const handleBioStatusToggleChange = () => {
  //   setState(prev => ({
  //     ...prev,
  //     selectedBioStatus: !prev.selectedBioStatus,
  //   }));
  // };

  const handleChartStatusToggleChange = () => {
    setState(prevState => ({
      ...prevState,
      chartShow: !prevState.chartShow,
    }));
  };

  const handleTeamCodeChange = async (oldTeamCode, newTeamCode, userIdObj) => {
    try {
      setState(prevState => {
        let { teamCodes, summaries, selectedCodes } = prevState;
        const { tableData } = prevState;
        // Find and update the user's team code in summaries
        summaries = summaries.map(summary => {
          if (userIdObj[summary._id]) {
            // Update tableData
            tableData[summary.teamCode] = tableData[summary.teamCode].filter(
              member => member._id !== summary._id,
            );
            if (newTeamCode in tableData) {
              tableData[newTeamCode].push(summary);
            } else {
              tableData[newTeamCode] = [summary];
            }
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
          tableData,
        };
      });

      // Update the filters in the database that contains userId
      if (oldTeamCode && newTeamCode && oldTeamCode !== newTeamCode) {
        try {
          const res = await updateFilterWithIndividualCodesChange({
            oldTeamCode,
            newTeamCode,
            userId: Object.keys(userIdObj)[0],
          }).unwrap(); // unwrap = throw exception if error

          toast.success(`Successfully update all filters with new team code ${newTeamCode}`);
        } catch (error) {
          toast.error(
            `Failed to update filters with the new team code. Error: ${JSON.stringify(error)}`,
          );
        }
      }
      // keeping this block commented for future reference
      // Update saved filters for team codes only in the database with the new team code
      // if (oldTeamCode && newTeamCode && oldTeamCode !== newTeamCode) {
      //   // Get the user ID from the userIdObj
      //   const userId = Object.keys(userIdObj)[0];
      //   props.updateSavedFiltersForIndividualTeamCodeChange(oldTeamCode, newTeamCode, userId);
      //   // Refresh saved filters after the update
      //   setTimeout(() => {
      //     props.getSavedFilters();
      //   }, 1000);
      // }
      // Update the big filters in the database that contains userId
      if (oldTeamCode && newTeamCode && oldTeamCode !== newTeamCode) {
        const res = await axios.post(ENDPOINTS.WEEKLY_SUMMARIES_FILTER_REPLACE_INDIVIDUAL_CODES, {
          oldTeamCode,
          newTeamCode,
          userId: Object.keys(userIdObj)[0],
        });
        await fetchFilters();
      }

      // Update saved filters for team codes only in the database with the new team code
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

  const handleDeleteFilter = async filter => {
    try {
      const res = await deleteFilter({
        id: filter.value,
      }).unwrap(); // unwrap = throw exception if error

      toast.success(`Successfully deleted filter ${filter.label}`);
      // Clear current applied filter if it was deleted
      if (currentAppliedFilter && currentAppliedFilter._id === filter.value) {
        setCurrentAppliedFilter(null);
      }
      //   // Refresh the saved filters list
      //   props.getSavedFilters();
      // }
    } catch (error) {
      toast.error(`Failed to delete filter. Error: ${JSON.stringify(error)}`);
    }
  };
  // keeping this block commented for future reference
  // const handleOpenSaveFilterModal = () => {
  //   // If no current filter is applied, always create a new filter
  //   if (!currentAppliedFilter) {
  //     setState(prevState => ({
  //       ...prevState,
  //       saveFilterModalOpen: true,
  //     }));
  //     return;
  //   }
  //   // If there's a current filter applied, always show modification modal
  //   // regardless of whether the selection has changed or not
  //   setShowModificationModal(true);
  // };
  // const handleCloseSaveFilterModal = () => {
  //   setState(prevState => ({
  //     ...prevState,
  //     saveFilterModalOpen: false,
  //   }));
  // };
  // const handleCloseModificationModal = () => {
  //   setShowModificationModal(false);
  // };
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
      const {
        replaceCode,
        selectedCodes,
        summaries,
        teamCodes,
        teamCodeWarningUsers,
        tableData,
      } = state;

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
          .filter(
            teamCode => !oldTeamCodes.includes(teamCode.value) && teamCode.value !== replaceCode,
          )
          .concat({
            value: replaceCode,
            label: `${replaceCode} (${
              updatedSummaries.filter(s => s.teamCode === replaceCode).length
            })`,
            _ids: updatedSummaries.filter(s => s.teamCode === replaceCode).map(s => s._id),
          });

        const updatedSelectedCodes = selectedCodes
          .filter(code => !oldTeamCodes.includes(code.value) && code.value !== replaceCode)
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

        const updatedTableData = tableData;
        updatedTableData[replaceCode] = updatedSummaries.filter(s => s.teamCode === replaceCode);
        oldTeamCodes.forEach(code => {
          updatedTableData[code] = updatedSummaries.filter(s => s.teamCode === code);
        });

        // Update big filters
        try {
          const res = await updateFilterWithReplacedTeamCodes({
            oldTeamCodes,
            newTeamCode: replaceCode,
          }).unwrap(); // unwrap = throw exception if error

          toast.success(`Successfully replace codes in all filters`);
        } catch (error) {
          toast.error(`Failed to replace codes in filters. Status ${error.status}`);
        }

        // Update saved filters for team code only in the database with the new team code
        // await props.updateSavedFiltersForTeamCodeChange(oldTeamCodes, replaceCode);

        setState(prev => ({
          ...prev,
          summaries: updatedSummaries,
          teamCodes: updatedTeamCodes,
          selectedCodes: updatedSelectedCodes,
          replaceCode: '',
          replaceCodeError: null,
          teamCodeWarningUsers: updatedWarningUsers,
          tableData: updatedTableData,
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

  // Keeping the block commented for future reference
  // const handleTrophyToggleChange = () => {
  //   setState(prevState => ({
  //     ...prevState,
  //     selectedTrophies: !prevState.selectedTrophies,
  //   }));
  // };

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

  const handleBulkDotClick = async color => {
    try {
      // 1. Validation
      if (
        !state?.selectedCodes ||
        (Array.isArray(state.selectedCodes) && state.selectedCodes.length === 0)
      ) {
        toast.warning('Please, select team codes first');
        return;
      }

      const safeSelectedCodes = Array.isArray(state.selectedCodes)
        ? state.selectedCodes
        : state.selectedCodes
        ? [state.selectedCodes]
        : [];

      const selectedTeamCodes = safeSelectedCodes
        .map(e => (e && e.value ? e.value : typeof e === 'string' ? e : null))
        .filter(Boolean);

      const selectedTeamCodesSet = new Set(selectedTeamCodes);

      // 2. Find Users
      const matchingUsers = Array.isArray(state.summaries)
        ? state.summaries.filter(user => user && selectedTeamCodesSet.has(user.teamCode))
        : [];

      if (matchingUsers.length === 0) {
        toast.warn('No users match the selected team codes.');
        return;
      }

      // 3. UI Update
      setState(prev => ({
        ...prev,
        bulkSelectedColors: {
          purple: color === 'purple',
          green: color === 'green',
          navy: color === 'navy',
        },
      }));
      toast.success(`Applying bulk "${color}"...`);

      let successCount = 0;
      let failCount = 0;

      // 4. Process Updates
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
            const newColors = res?.data?.filterColor || [color];

            // 🟢 Refactored: Uses external helper to avoid deep nesting
            setState(prev => ({
              ...prev,
              summaries: updateUserInList(prev.summaries, user._id, newColors),
              filteredSummaries: updateUserInList(prev.filteredSummaries, user._id, newColors),
              summariesByTab: {
                ...prev.summariesByTab,
                [prev.activeTab]: updateUserInList(prev.summaries, user._id, newColors),
              },
            }));

            return { status: 'fulfilled', value: res };
          })
          .catch(err => {
            failCount++;
            const msg = err?.response?.data?.message || err.message;
            console.warn(`⚠️ Skipped user ${user._id}: ${msg}`);
            return { status: 'rejected', reason: err };
          });
      });

      await Promise.allSettled(updatePromises);

      if (failCount > 0) {
        toast.error(`Bulk update finished. ${successCount} succeeded, ${failCount} failed.`);
      } else {
        toast.success(`Bulk "${color}" applied successfully to ${successCount} users!`);
      }
    } catch (err) {
      console.error('❌ handleBulkDotClick failed:', err);
      toast.error('Bulk update failed unexpectedly.');
    }
  };

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

  const handleSelectExtraMembersChange = event => {
    setState(prev => ({
      ...prev,
      selectedExtraMembers: event,
    }));
  };

  const applyFilter = selectedFilter => {
    const filter = selectedFilter.filterData;
    const selectedCodesChoice = state.teamCodes.filter(code =>
      filter.selectedCodes.has(code.value),
    );
    const selectedColorsChoice = state.colorOptions.filter(color =>
      filter.selectedColors.has(color.value),
    );
    const selectedExtraMembersChoice = state.summaries
      .filter(summary => filter.selectedExtraMembers.has(summary._id))
      .map(summary => ({
        label: `${summary.firstName} ${summary.lastName}`,
        value: summary._id,
        role: summary.role,
      }));

    setState(prevState => ({
      ...prevState,
      selectedCodes: selectedCodesChoice,
      selectedColors: selectedColorsChoice,
      selectedExtraMembers: selectedExtraMembersChoice,
      selectedTrophies: filter.selectedTrophies,
      selectedSpecialColors: filter.selectedSpecialColors,
      selectedBioStatus: filter.selectedBioStatus,
      selectedOverTime: filter.selectedOverTime,
    }));
    setCurrentAppliedFilter(selectedFilter);
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

    createIntialSummaries();

    // createIntialSummaries().then(() => {
    //   if (!window._isMounted) return;
    //   refreshCurrentTab();
    // });

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
    state.selectedExtraMembers,
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

  // 🟢 CONSOLIDATED useEffect for Tab Changes
  // This replaces the duplicate one. It handles caching AND fresh fetching using the helper.
  useEffect(() => {
    let isMounted = true;

    if (state.summariesByTab[state.activeTab] && state.summariesByTab[state.activeTab].length > 0) {
      setState(prev => ({
        ...prev,
        summaries: state.summariesByTab[state.activeTab],
      }));
      return;
    }

    const weekIndex = navItems.indexOf(state.activeTab);
    setState(prev => ({ ...prev, loading: true }));

    axios
      .get(ENDPOINTS.WEEKLY_SUMMARIES_REPORT(), {
        params: { week: weekIndex, forceRefresh: true, _ts: Date.now() },
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      })
      .then(res => {
        if (!isMounted) return;
        const rawSummaries = Array.isArray(res?.data) ? res.data : [];

        if (rawSummaries.length > 0) {
          // Use the helper to process everything uniformly
          const processedData = processRawSummaries(rawSummaries);
          const { summaries: summariesCopy, teamCodes, colorOptions, tableData } = processedData;

          setState(prev => ({
            ...prev,
            loading: false,
            summaries: summariesCopy,
            teamCodes,
            colorOptions,
            tableData,
            summariesByTab: {
              ...prev.summariesByTab,
              [state.activeTab]: summariesCopy,
            },
          }));
        } else {
          setState(prev => ({
            ...prev,
            loading: false,
            summaries: [],
            summariesByTab: { ...prev.summariesByTab, [state.activeTab]: [] },
          }));
        }
      })
      .catch(err => {
        if (!isMounted) return;
        console.error(`❌ Failed to fetch data`, err);
        setState(prev => ({ ...prev, loading: false }));
      });

    return () => {
      isMounted = false;
    };
  }, [state.activeTab]);

  const { role, darkMode } = props;
  const { error } = props;
  const hasPermissionToFilter = role === 'Owner' || role === 'Administrator';
  const { authEmailWeeklySummaryRecipient } = props;

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

  const customStyles = getCustomStyles(darkMode);

  return (
    <Container
      fluid
      className={`container-wsr-wrapper py-3 mb-5 ${
        darkMode ? 'bg-oxford-blue text-light' : 'bg--white-smoke'
      }`}
    >
      {passwordInputModalToggle()}
      {popUpElements()}
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
      <Row className="mb-2">
        <Col lg={{ size: 10, offset: 1 }}>
          <div className="d-flex justify-content-end">
            {authEmailWeeklySummaryRecipient === 'jae@onecommunityglobal.org' && (
              <Button
                color="primary"
                className="permissions-management__button text-nowrap mx-1"
                type="button"
                onClick={onClickRecepients}
                style={darkMode ? boxStyleDark : boxStyle}
              >
                Weekly Summary Report Recipients
              </Button>
            )}

            <Button
              color={darkMode ? 'light' : 'primary'}
              outline
              className="mx-1"
              type="button"
              onClick={() => setSelectFilterModalOpen(true)}
            >
              Select Filter
            </Button>
            {permissionState.canManageFilter && (
              <ButtonDropdown
                className="ml-1"
                isOpen={saveFilterDropdownOpen}
                toggle={toggleSaveFilterDropdown}
              >
                <DropdownToggle caret color="primary">
                  Manage Filters
                </DropdownToggle>
                <DropdownMenu right className={`${darkMode ? styles['darkMode'] : ''}`}>
                  <DropdownItem
                    className={`${darkMode ? styles.filterItemDarkMode : ''}`}
                    onClick={() => setCreateFilterModalOpen(true)}
                  >
                    Create New Filter
                  </DropdownItem>
                  <DropdownItem
                    className={`${darkMode ? styles.filterItemDarkMode : ''}`}
                    onClick={() => setUpdateFilterModalOpen(true)}
                  >
                    Update/Delete Filter
                  </DropdownItem>
                </DropdownMenu>
              </ButtonDropdown>
            )}

            <SelectFilterModal
              isOpen={selectFilterModalOpen}
              toggle={toggleSelectFilterModal}
              filters={filterChoices}
              applyFilter={applyFilter}
              memberDict={state.memberDict}
              darkMode={darkMode}
              styles={customStyles}
            />
            {permissionState.canManageFilter && (
              <UpdateFilterModal
                isOpen={updateFilterModalOpen}
                toggle={toggleUpdateFilterModal}
                filters={filterChoices}
                refetchFilters={refetch}
                darkMode={darkMode}
                hasPermissionToFilter={hasPermissionToFilter}
                canSeeBioHighlight={permissionState.canSeeBioHighlight}
                teamCodes={state.teamCodes}
                colorOptions={state.colorOptions}
                tableData={state.tableData}
                summaries={state.summaries}
                teamCodeWarningUsers={state.teamCodeWarningUsers}
                memberDict={state.memberDict}
                currentAppliedFilter={currentAppliedFilter}
                applyFilter={applyFilter}
              />
            )}
            {permissionState.canManageFilter && (
              <CreateFilterModal
                isOpen={createFilterModalOpen}
                toggle={toggleCreateFilterModal}
                refetchFilters={refetch}
                initialState={{
                  filterName: '',
                  selectedCodes: state.selectedCodes,
                  selectedColors: state.selectedColors,
                  selectedExtraMembers: state.selectedExtraMembers,
                  selectedTrophies: state.selectedTrophies,
                  selectedSpecialColors: state.selectedSpecialColors,
                  selectedBioStatus: state.selectedBioStatus,
                  selectedOverTime: state.selectedOverTime,
                  selectedCodesInvalid: [],
                  selectedColorsInvalid: [],
                  selectedExtraMembersInvalid: [],
                  membersFromUnselectedTeam: state.membersFromUnselectedTeam,
                }}
                darkMode={darkMode}
                hasPermissionToFilter={hasPermissionToFilter}
                canSeeBioHighlight={permissionState.canSeeBioHighlight}
                filters={filterChoices}
                teamCodes={state.teamCodes}
                colorOptions={state.colorOptions}
                tableData={state.tableData}
                summaries={state.summaries}
                teamCodeWarningUsers={state.teamCodeWarningUsers}
                currentAppliedFilter={currentAppliedFilter}
                applyFilter={applyFilter}
              />
            )}
          </div>
        </Col>
      </Row>
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
                styles={customStyles}
              />

              {/* Save/Delete Buttons - only visible when codes are selected */}
              {state.selectedCodes.length > 0 && permissionState.canManageFilter && (
                <div className={styles['filter-save-buttons']}>
                  <button
                    type="button"
                    className={`${styles['filter-save-btn']} ${styles.save}`}
                    onClick={() => setCreateFilterModalOpen(true)}
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

          {hasPermissionToFilter && <></>}
          {/* Saved Filter Buttons List */}
          {filterChoices && filterChoices.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '5px',
                alignItems: 'center',
                maxHeight: '100px',
                overflowY: 'auto',
              }}
              className="my-3"
            >
              {filterChoices.map(filter => (
                <div
                  key={filter.value}
                  className={`${styles['saved-filter-button']} ${
                    darkMode ? styles['dark-mode'] : ''
                  } ${
                    currentAppliedFilter && currentAppliedFilter.value === filter.value
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
                        currentAppliedFilter && currentAppliedFilter.value === filter.value
                          ? 'bold'
                          : 'normal',
                    }}
                    onClick={() => applyFilter(filter)}
                    title={`Apply filter: ${filter.label}`}
                  >
                    {filter.label}
                  </button>
                  <button
                    type="button"
                    className={styles['saved-filter-delete-btn']}
                    onClick={() => handleDeleteFilter(filter)}
                    title="Delete filter"
                    aria-label={`Delete filter ${filter.label}`}
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
            styles={customStyles}
          />
          <div className={`${styles.filterContainer}`}>
            {hasPermissionToFilter && (
              <>
                <div className={`${styles.filterStyle} ${styles.marginRight}`}>
                  <span style={{ marginRight: '5px' }}>Filter by Special Colors: </span>
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
                        purple: 'Purple',
                        green: 'Green',
                        navy: 'Navy',
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
            )}
          </div>
          <WeeklySummariesToggleFilter
            state={state}
            setState={setState}
            hasPermissionToFilter={hasPermissionToFilter}
            editable={true}
            formId="report"
            darkMode={darkMode}
          />
        </Col>
      </Row>
      <Row className={styles['mx-max-sm-0']}>
        <Col lg={{ size: 5, offset: 1 }} md={{ size: 6 }} xs={{ size: 12 }}>
          <div>Select Extra Members</div>
          <MultiSelect
            className={`${styles['report-multi-select-filter']} ${styles.textDark} 
              ${darkMode ? 'dark-mode' : ''}`}
            options={state.membersFromUnselectedTeam}
            value={state.selectedExtraMembers}
            onChange={handleSelectExtraMembersChange}
          />
        </Col>
        <Col lg={{ size: 5 }} md={{ size: 6 }} xs={{ size: 12 }}>
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
            styles={customStyles}
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
  fetchAllBadges: PropTypes.func.isRequired,
  hasPermission: PropTypes.func.isRequired,
  setTeamCodes: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
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
