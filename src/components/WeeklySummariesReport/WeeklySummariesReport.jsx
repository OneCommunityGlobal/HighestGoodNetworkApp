/* eslint-disable no-console */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { useEffect, useMemo, useState, useCallback } from 'react';
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

const initialState = {
  tableData: [],
  structuredTableData: [],
  chartData: [],
  total: 0,
  COLORS: [],
  loading: true,
  refreshing: false,

  summaries: [],
  filteredSummaries: [],

  activeTab: navItems[1],
  loadedTabs: [navItems[1]],
  summariesByTab: {},
  tabsLoading: { [navItems[1]]: false },

  passwordModalOpen: false,
  summaryRecepientsPopupOpen: false,
  isValidPwd: true,

  badges: [],
  loadBadges: false,
  loadTrophies: false,

  selectedCodes: [],
  selectedColors: [],
  selectedLoggedHoursRange: '',
  selectedOverTime: false,
  selectedBioStatus: false,
  selectedTrophies: false,
  chartShow: false,

  replaceCode: '',
  replaceCodeError: null,
  replaceCodeLoading: false,

  allRoleInfo: [],
  teamCodes: [],
  colorOptions: [],
  teamCodeWarningUsers: [],
  auth: [],
  memberDict: {},

  selectedSpecialColors: { purple: false, green: false, navy: false },
  bulkSelectedColors: { purple: false, green: false, navy: false },

  selectedExtraMembers: [],
  membersFromUnselectedTeam: [],

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

// ------------------------------
// Shared helpers to remove duplication
// ------------------------------
const normalizeFilterColor = raw => {
  let filterColor = [];
  if (Array.isArray(raw)) {
    // 1. Filter out junk data (like 'null')
    // 2. Convert all strings to lowercase (good practice)
    filterColor = raw.filter(c => typeof c === 'string').map(c => c.toLowerCase());
  } else if (typeof raw === 'string') {
    // Handles cases where DB stores '["purple"]' or just 'Purple'
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        filterColor = parsed.filter(c => typeof c === 'string').map(c => c.toLowerCase());
      } else if (typeof parsed === 'string') {
        filterColor = [parsed.toLowerCase()];
      }
    } catch {
      filterColor = [raw.toLowerCase()];
    }
  }
  return filterColor;
};

const buildTeamCodeAndColorOptions = summariesCopy => {
  const teamCodeGroup = {};
  const teamCodes = [];
  const colorOptionGroup = new Set();
  const colorOptions = [];
  const memberDict = {};

  summariesCopy.forEach(summary => {
    const code = summary.teamCode || 'noCodeLabel';
    if (!teamCodeGroup[code]) teamCodeGroup[code] = [];
    teamCodeGroup[code].push(summary);

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

  // Add "No Code" Option
  teamCodes.sort((a, b) => `${a.label}`.localeCompare(`${b.label}`));
  teamCodes.push({
    value: '',
    label: `Select All With NO Code (${teamCodeGroup.noCodeLabel?.length || 0})`,
    _ids: teamCodeGroup?.noCodeLabel?.map(item => item._id) || [],
  });

  colorOptionGroup.forEach(option => {
    colorOptions.push({ value: option, label: option });
  });
  colorOptions.sort((a, b) => `${a.label}`.localeCompare(`${b.label}`));

  return { teamCodeGroup, teamCodes, colorOptions, memberDict };
};

/* eslint-disable react/function-component-definition */
const WeeklySummariesReport = props => {
  const { loading, getInfoCollections } = props;
  const weekDates = useMemo(() => getWeekDates(), []);
  const [state, setState] = useState(initialState);
  const [permissionState, setPermissionState] = useState(intialPermissionState);

  // Create filters including toggle and extra members
  const [createFilterModalOpen, setCreateFilterModalOpen] = useState(false);
  const [updateFilterModalOpen, setUpdateFilterModalOpen] = useState(false);
  const [selectFilterModalOpen, setSelectFilterModalOpen] = useState(false);
  const [saveFilterDropdownOpen, setSaveFilterDropdownOpen] = useState(false);

  // Saved filters functionality
  const [currentAppliedFilter, setCurrentAppliedFilter] = useState(null);

  // Keeping this state in case you want a "modification modal" later —
  // (it existed in older versions and avoids undefined references)
  const [showModificationModal, setShowModificationModal] = useState(false);

  const toggleSaveFilterDropdown = () => setSaveFilterDropdownOpen(prev => !prev);
  const toggleCreateFilterModal = () => setCreateFilterModalOpen(prev => !prev);
  const toggleUpdateFilterModal = () => setUpdateFilterModalOpen(prev => !prev);
  const toggleSelectFilterModal = () => setSelectFilterModalOpen(prev => !prev);

  // Filters state (RTK)
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

  /**
   * Sort the summaries in alphabetixal order
   * @param {*} summaries
   * @returns
   */
  const alphabetize = useCallback(summaries => {
    const temp = [...summaries];
    return temp.sort((a, b) =>
      `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
    );
  }, []);

  const doesSummaryBelongToWeek = useCallback((startDateStr, endDateStr, weekIndex) => {
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
  }, []);

  /**
   * Get the roleNames
   * @param {*} summaries
   * @returns
   */
  const getAllRoles = useCallback(summaries => {
    const roleNames = summaries.map(summary => `${summary.role}Info`);
    const uniqueRoleNames = [...new Set(roleNames)];
    return uniqueRoleNames;
  }, []);

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
  const getPromisedHours = useCallback((weekToDateX, weeklycommittedHoursHistory) => {
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
      // As soon as the weekToDate is greater or equal than current history date
      if (weekToDateReformat >= historyDateX) {
        // return the promised hour
        return weeklycommittedHoursHistory[i].hours;
      }
    }

    // 3. at this date when the week ends, the person has not even join the team
    // so it promised 0 hours
    return 0;
  }, []);

  const intialInfoCollections = useCallback(
    async summariesCopy => {
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
    },
    [getAllRoles, getInfoCollections, props.role],
  );

  // Keeping this block commented intentionally for future reference —
  // Initial data loading
  const fetchAndProcessWeek = useCallback(
    async weekIndex => {
      const response = await axios.get(ENDPOINTS.WEEKLY_SUMMARIES_REPORT(), {
        params: { week: weekIndex, forceRefresh: true, _ts: Date.now() },
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      });

      const summaries = Array.isArray(response?.data) ? response.data : [];

      // Shallow copy and sort
      let summariesCopy = [...summaries];
      summariesCopy = alphabetize(summariesCopy);

      // Keep inactive only if overlapping the selected week (handled later in filtering too)
      // You also filter isActive in older init code; keep as-is here for safety:
      // summariesCopy = summariesCopy.filter(summary => summary?.isActive !== false);

      // Add promised hours + normalized colors
      summariesCopy = summariesCopy.map(summary => {
        const promisedHoursByWeek = weekDates.map(weekDate =>
          getPromisedHours(weekDate.toDate, summary.weeklycommittedHoursHistory),
        );

        // Keeping this block commented intentionally for future reference —
        // ... older filterColor logic lived here ...

        const filterColor = normalizeFilterColor(summary.filterColor);
        return { ...summary, promisedHoursByWeek, filterColor };
      });

      return summariesCopy;
    },
    [alphabetize, getPromisedHours, weekDates],
  );

  const applyProcessedDataToState = useCallback(
    (activeTab, summariesCopy, prevState) => {
      const { teamCodeGroup, teamCodes, colorOptions, memberDict } = buildTeamCodeAndColorOptions(
        summariesCopy,
      );

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

      // Update redux team codes (keeps your existing behavior)
      props.setTeamCodes(teamCodes);

      return {
        ...prevState,
        loading: false,
        summaries: summariesCopy,
        filteredSummaries: summariesCopy,
        tableData: teamCodeGroup,
        teamCodes,
        colorOptions,
        COLORS,
        teamCodeWarningUsers: summariesCopy.filter(s => s.teamCodeWarning),
        memberDict,
        loadedTabs: [...new Set([...(prevState.loadedTabs || []), activeTab])],
        summariesByTab: {
          ...prevState.summariesByTab,
          [activeTab]: summariesCopy,
        },
        tabsLoading: {
          ...prevState.tabsLoading,
          [activeTab]: false,
        },
      };
    },
    [props],
  );

  const fetchAndSetTab = useCallback(
    async (tab, { force = false } = {}) => {
      const weekIndex = navItems.indexOf(tab);

      // Use cached when allowed
      if (!force && state.summariesByTab?.[tab] && state.summariesByTab[tab].length > 0) {
        setState(prev => ({
          ...prev,
          activeTab: tab,
          summaries: prev.summariesByTab[tab],
          filteredSummaries: prev.summariesByTab[tab],
          tabsLoading: { ...prev.tabsLoading, [tab]: false },
        }));
        return;
      }

      setState(prev => ({
        ...prev,
        activeTab: tab,
        tabsLoading: { ...prev.tabsLoading, [tab]: true },
      }));

      try {
        const summariesCopy = await fetchAndProcessWeek(weekIndex);
        setState(prev => applyProcessedDataToState(tab, summariesCopy, prev));
        await intialInfoCollections(summariesCopy);
      } catch (e) {
        setState(prev => ({
          ...prev,
          tabsLoading: { ...prev.tabsLoading, [tab]: false },
          loading: false,
        }));
      }
    },
    [applyProcessedDataToState, fetchAndProcessWeek, intialInfoCollections, state.summariesByTab],
  );

  const createIntialSummaries = useCallback(async () => {
    try {
      const { fetchAllBadges, auth } = props;

      // Get the active tab from session storage or use default
      const activeTab =
        sessionStorage.getItem('tabSelection') === null
          ? navItems[1]
          : sessionStorage.getItem('tabSelection');

      // Set initial loading and active tab state
      setState(prevState => ({
        ...prevState,
        loading: true,
        activeTab,
        tabsLoading: { ...prevState.tabsLoading, [activeTab]: true },
        auth,
      }));

      // Get permissions (badge fetch first)
      const badgeStatusCode = await fetchAllBadges();

      setPermissionState(prev => ({
        ...prev,
        bioEditPermission: props.hasPermission('putUserProfileImportantInfo'),
        canEditSummaryCount: props.hasPermission('putUserProfileImportantInfo'),
        codeEditPermission:
          props.hasPermission('editTeamCode') ||
          auth.user.role === 'Owner' ||
          auth.user.role === 'Administrator',
        canSeeBioHighlight: props.hasPermission('highlightEligibleBios'),
        canManageFilter:
          props.hasPermission('manageSummariesFilters') ||
          auth.user.role === 'Owner' ||
          auth.user.role === 'Administrator',
        hasSeeBadgePermission: props.hasPermission('seeBadges') && badgeStatusCode === 200,
      }));

      // Force refresh on initial load (keeps your “late submissions show up” intent)
      await fetchAndSetTab(activeTab, { force: true });
      return null;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        tabsLoading: { ...prev.tabsLoading, [prev.activeTab]: false },
      }));
      return null;
    }
  }, [fetchAndSetTab, props]);

  const updateMembersFromUnselectedTeam = useCallback(() => {
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
  }, [state.selectedCodes, state.summaries, state.tableData, state.selectedExtraMembers]);

  // Update members of membersFromUnselectedTeam dropdown
  useEffect(() => {
    updateMembersFromUnselectedTeam();
  }, [updateMembersFromUnselectedTeam]);

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

  const filterWeeklySummaries = useCallback(() => {
    try {
      const {
        selectedCodes,
        selectedColors,
        selectedLoggedHoursRange,
        summaries,
        selectedOverTime,
        selectedBioStatus,
        selectedTrophies,
        COLORS,
        selectedSpecialColors,
        selectedExtraMembers,
      } = state;

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

      const temp = (Array.isArray(summaries) ? summaries : [])
        .map(s => ({ ...s }))
        .filter(summary => {
          const { activeTab } = state;
          const hoursLogged = (summary.totalSeconds?.[navItems.indexOf(activeTab)] || 0) / 3600;

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
              hoursLogged >= summary.promisedHoursByWeek?.[navItems.indexOf(activeTab)]);

          // Add trophy filter logic
          const summarySubmissionDate = moment()
            .tz('America/Los_Angeles')
            .endOf('week')
            .subtract(weekIndex, 'week')
            .format('YYYY-MM-DD');

          const hasTrophy =
            !selectedTrophies ||
            showTrophyIcon(summarySubmissionDate, summary?.startDate?.split?.('T')?.[0]);

          const matchesSpecialColor =
            activeFilterColors.length === 0 ||
            activeFilterColors.some(color => summary.filterColor?.includes?.(color));

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
            });
            const team = filteredTeamDict[code.value] || [];
            const index = selectedCodesArray.indexOf(code.value);
            const color = COLORS[index % COLORS.length];
            const members = team.map(member => ({
              name: `${member.firstName} ${member.lastName}`,
              role: member.role,
              id: member._id,
            }));
            structuredTeamTableData.push({ team: code.value, color, members });
          });
        } else {
          chartData.push({
            name: 'All With NO Code',
            value: '' in filteredTeamDict ? filteredTeamDict[''].length : 0,
          });
          const team = filteredTeamDict[''] || [];
          const index = selectedCodesArray.indexOf('noCodeLabel');
          const color = COLORS[index % COLORS.length];
          const members = team.map(member => ({
            name: `${member.firstName} ${member.lastName}`,
            role: member.role,
            id: member._id,
          }));
          structuredTeamTableData.push({ team: 'noCodeLabel', color, members });
        }
      } else {
        selectedCodes.forEach(code => {
          const team = filteredTeamDict[code.value];
          const val = team ? team.length : 0;
          if (val > 0) {
            chartData.push({ name: code.label, value: val });
          }
          if (team !== undefined) {
            const index = selectedCodesArray.indexOf(code.value);
            const color = COLORS[index % COLORS.length];
            const members = team.map(member => ({
              name: `${member.firstName} ${member.lastName}`,
              role: member.role,
              id: member._id,
            }));
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
          chartData.push({ name: 'Extra Members', value: members.length });
        }
        structuredTeamTableData.push({ team: 'Extra Members', color, members });
      }

      chartData.sort();
      temptotal = chartData.reduce((acc, entry) => acc + entry.value, 0);
      structuredTeamTableData.sort();

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
  }, [doesSummaryBelongToWeek, state]);

  /**
   * Refresh the current tab data
   */
  const refreshCurrentTab = async () => {
    const { activeTab } = state;
    setState(prev => ({ ...prev, refreshing: true }));

    try {
      const weekIndex = navItems.indexOf(activeTab);
      const summariesCopy = await fetchAndProcessWeek(weekIndex);

      setState(prev => ({
        ...prev,
        refreshing: false,
        summaries: summariesCopy,
        filteredSummaries: summariesCopy,
        badges: props.allBadgeData || prev.badges,
        summariesByTab: {
          ...prev.summariesByTab,
          [activeTab]: summariesCopy,
        },
      }));

      await intialInfoCollections(summariesCopy);
    } catch (error) {
      setState(prev => ({ ...prev, refreshing: false }));
    }
  };

  /**
   * Handle tab switching
   */
  const toggleTab = tab => {
    if (state.activeTab === tab) return;

    // Save in session storage
    sessionStorage.setItem('tabSelection', tab);

    // Always refetch for "Last Week" so late submissions show up
    const shouldForceFetch = tab === 'Last Week';
    fetchAndSetTab(tab, { force: shouldForceFetch });
  };

  const handleSelectCodeChange = event => {
    const selectedValues = event.map(e => e.value);

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

  const handleChartStatusToggleChange = () => {
    setState(prevState => ({
      ...prevState,
      chartShow: !prevState.chartShow,
    }));
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

  const handleSelectExtraMembersChange = event => {
    setState(prev => ({
      ...prev,
      selectedExtraMembers: event,
    }));
  };

  const handleDeleteFilter = async filter => {
    try {
      await deleteFilter({ id: filter.value }).unwrap();
      toast.success(`Successfully deleted filter ${filter.label}`);

      if (currentAppliedFilter && currentAppliedFilter._id === filter.value) {
        setCurrentAppliedFilter(null);
      }

      refetch();
    } catch (error) {
      toast.error(`Failed to delete filter. Error: ${JSON.stringify(error)}`);
    }
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

  const handleTeamCodeChange = async (oldTeamCode, newTeamCode, userIdObj) => {
    try {
      setState(prevState => {
        let { teamCodes, summaries, selectedCodes } = prevState;
        const { tableData } = prevState;

        // Find and update the user's team code in summaries
        summaries = summaries.map(summary => {
          if (userIdObj[summary._id]) {
            // Update tableData
            if (tableData?.[summary.teamCode]) {
              tableData[summary.teamCode] = tableData[summary.teamCode].filter(
                member => member._id !== summary._id,
              );
            }
            if (newTeamCode in tableData) {
              tableData[newTeamCode].push({ ...summary, teamCode: newTeamCode });
            } else {
              tableData[newTeamCode] = [{ ...summary, teamCode: newTeamCode }];
            }
            return { ...summary, teamCode: newTeamCode };
          }
          return summary;
        });

        let noTeamCodeCount = 0;
        summaries.forEach(summary => {
          if ((summary.teamCode || '').length <= 0) noTeamCodeCount += 1;
        });

        const teamCodeCounts = summaries.reduce((acc, { teamCode }) => {
          acc[teamCode] = (acc[teamCode] || 0) + 1;
          return acc;
        }, {});

        const teamCodeWithUserId = summaries.reduce((acc, { _id, teamCode }) => {
          if (acc && acc[teamCode]) acc[teamCode].push(_id);
          else acc[teamCode] = [_id];
          return acc;
        }, {});

        teamCodes = Object.entries(teamCodeCounts)
          .filter(([code, count]) => code.length > 0 && count > 0)
          .map(([code, count]) => ({
            label: `${code} (${count})`,
            value: code,
            _ids: teamCodeWithUserId[code],
          }));

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

        teamCodes
          .sort((a, b) => a.label.localeCompare(b.label))
          .push({
            value: '',
            label: `Select All With NO Code (${noTeamCodeCount || 0})`,
            _ids: teamCodeWithUserId[''],
          });

        return { ...prevState, summaries, teamCodes, selectedCodes, tableData };
      });

      // Update filters in DB that contain userId
      if (oldTeamCode && newTeamCode && oldTeamCode !== newTeamCode) {
        try {
          await updateFilterWithIndividualCodesChange({
            oldTeamCode,
            newTeamCode,
            userId: Object.keys(userIdObj)[0],
          }).unwrap();

          toast.success(`Successfully update all filters with new team code ${newTeamCode}`);
          refetch();
        } catch (error) {
          toast.error(
            `Failed to update filters with the new team code. Error: ${JSON.stringify(error)}`,
          );
        }
      }

      // Update saved filters (legacy redux slice)
      if (oldTeamCode && newTeamCode && oldTeamCode !== newTeamCode) {
        const userId = Object.keys(userIdObj)[0];
        props.updateSavedFiltersForIndividualTeamCodeChange(oldTeamCode, newTeamCode, userId);

        setTimeout(() => {
          props.getSavedFilters();
        }, 1000);
      }

      return null;
    } catch (error) {
      return null;
    }
  };

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

      setState(prev => ({ ...prev, replaceCodeLoading: true }));

      const isValidCode = fullCodeRegex.test(replaceCode);
      if (!isValidCode) {
        setState(prev => ({
          ...prev,
          replaceCodeError: 'NOT SAVED! The code must be between 5 and 7 characters long.',
          replaceCodeLoading: false,
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

        const updatedTableData = { ...tableData };
        updatedTableData[replaceCode] = updatedSummaries.filter(s => s.teamCode === replaceCode);
        oldTeamCodes.forEach(code => {
          updatedTableData[code] = updatedSummaries.filter(s => s.teamCode === code);
        });

        // Update big filters
        try {
          await updateFilterWithReplacedTeamCodes({
            oldTeamCodes,
            newTeamCode: replaceCode,
          }).unwrap();
          toast.success(`Successfully replace codes in all filters`);
          refetch();
        } catch (error) {
          toast.error(`Failed to replace codes in filters. Status ${error.status}`);
        }

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
      setState(prev => ({ ...prev, replaceCodeError: 'Something went wrong. Please try again!' }));
    } finally {
      setState(prev => ({ ...prev, replaceCodeLoading: false }));
    }
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
      console.log('Result of find:', updatedUser);
      if (!updatedUser) {
        console.error(`❌ Could not find user with ID ${userId} in updatedSummaries.`);
        toast.error('Could not find user data to update. Please refresh.');
        return;
      }

      setState(prev => ({
        ...prev,
        summaries: updatedSummaries,
        summariesByTab: { ...prev.summariesByTab, [prev.activeTab]: updatedSummaries },
      }));

      // Step 2: Preparing the full payload to send to backend
      const currentRequestorId = props.auth?.user?.userid;
      if (!currentRequestorId) return;

      const payloadToSend = {
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

      console.log('SENDING PAYLOAD:', JSON.stringify(payloadToSend, null, 2));

      try {
        const res = await props.updateOneSummaryReport(userId, payloadToSend);
        console.log('✅ Successfully updated user on backend:', res?.data);
      } catch (err) {
        console.error('❌ Update action failed:', err.response?.data || err.message || err);
        toast.error('Failed to update filterColor. Please try again.');
      }
    } catch (err) {
      console.error('❌ Failed to update filterColor:', err);
      toast.error('Failed to update filterColor. Please try again.');
    }
  };

  const handleBulkDotClick = async color => {
    try {
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
      console.log('✅ handleBulkDotClick - selectedTeamCodes:', selectedTeamCodes);

      const matchingUsers = Array.isArray(state.summaries)
        ? state.summaries.filter(user => user && selectedTeamCodesSet.has(user.teamCode))
        : [];

      if (matchingUsers.length === 0) {
        console.warn('No matching users found for selected team codes!');
        toast.warn('No users match the selected team codes.');
        return;
      }

      const usersMissingId = matchingUsers.filter(u => !u?._id);
      if (usersMissingId.length > 0) {
        console.warn(
          `⚠️ BULK UPDATE PRE-CHECK: ${usersMissingId.length} users are missing an _id and will be skipped!`,
          usersMissingId,
        );
        toast.warn(
          `Warning: ${usersMissingId.length} users have incomplete data and will be skipped.`,
        );
      }

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

              return {
                ...prev,
                summaries: updatedSummaries,
                filteredSummaries: updatedFilteredSummaries,
                summariesByTab: {
                  ...prev.summariesByTab,
                  [prev.activeTab]: updatedSummaries,
                },
              };
            });

            return { status: 'fulfilled', value: res };
          })
          .catch(err => {
            failCount++;
            const status = err?.response?.status;
            const msg = err?.response?.data?.message || err.message;
            console.warn(`⚠️ Skipped user ${user._id} (${status}): ${msg}`);
            return { status: 'rejected', reason: err };
          });
      });

      await Promise.allSettled(updatePromises);

      if (failCount > 0)
        toast.error(`Bulk update finished. ${successCount} succeeded, ${failCount} failed.`);
      else toast.success(`Bulk "${color}" applied successfully to ${successCount} users!`);
    } catch (err) {
      console.error('❌ handleBulkDotClick failed:', err);
      toast.error('Bulk update failed unexpectedly. See console for details.');
    }
  };

  // ------------------------------
  // Effects (deduped)
  // ------------------------------
  useEffect(() => {
    let isMounted = true;
    window._isMounted = isMounted;

    // Reset bulk colors
    setState(prev => ({
      ...prev,
      bulkSelectedColors: { purple: false, green: false, navy: false },
    }));

    createIntialSummaries();

    return () => {
      isMounted = false;
      window._isMounted = false;
      sessionStorage.removeItem('tabSelection');
    };
  }, [createIntialSummaries]);

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
    filterWeeklySummaries,
  ]);

  useEffect(() => {
    // On mount: fetch all badges before deriving permissions
    const fetchInitialPermissions = async () => {
      try {
        await props.fetchAllBadges();
        setPermissionState(prev => ({
          ...prev,
          bioEditPermission: props.hasPermission('putUserProfileImportantInfo'),
          codeEditPermission:
            props.hasPermission('editTeamCode') ||
            props.auth?.user?.role === 'Owner' ||
            props.auth?.user?.role === 'Administrator',
          canEditSummaryCount: props.hasPermission('editSummaryHoursCount'),
          canSeeBioHighlight: props.hasPermission('highlightEligibleBios'),
          hasSeeBadgePermission: props.hasPermission('seeBadges'),
        }));
      } catch (error) {
        console.error('Failed to fetch badges or permissions', error);
      }
    };

    fetchInitialPermissions();
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

    setState(prev => ({ ...prev, colorOptions: allColors }));
  }, []);

  // ------------------------------
  // Render helpers (deduped)
  // ------------------------------
  const renderSavedFilters = () => {
    // Saved Filter Buttons
    // Saved Filter Buttons List
    if (!filterChoices || filterChoices.length === 0) return null;

    return (
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
              props.darkMode ? styles['dark-mode'] : ''
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
    );
  };

  // ------------------------------
  // Early returns
  // ------------------------------
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

  // ------------------------------
  // Main render
  // ------------------------------
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
                className="p-2"
                darkMode={darkMode}
              />
            </div>
          </h3>
        </Col>
      </Row>

      <Row className="mb-2">
        <Col lg={{ size: 10, offset: 1 }}>
          <div className="d-flex justify-content-end">
            {(authEmailWeeklySummaryRecipient === authorizedUser1 ||
              authEmailWeeklySummaryRecipient === authorizedUser2) && (
              <Button
                color="primary"
                className="permissions-management__button text-nowrap mx-1"
                type="button"
                onClick={() => onClickRecepients()}
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
                return { ...item, label: `${code.padEnd(10, ' ')} (${count}` };
              })}
              value={state.selectedCodes}
              onChange={handleSelectCodeChange}
              components={{ Option: CheckboxOption, MenuList: CustomMenuList }}
              placeholder="Search and select team codes..."
              classNamePrefix="custom-select"
              className={`custom-select-container ${darkMode ? 'dark-mode' : ''} ${
                state.teamCodeWarningUsers.length > 0 ? 'warning-border' : ''
              }`}
              styles={{
                menuList: base => ({ ...base, maxHeight: '700px', overflowY: 'auto' }),
                option: (base, st) => ({
                  ...base,
                  fontSize: '13px',
                  backgroundColor: st.isFocused ? '#eee' : 'white',
                }),
              }}
            />

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

          {renderSavedFilters()}
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
            components={{ Option: CheckboxOption, MenuList: CustomMenuList }}
            placeholder="Select color filters..."
            classNamePrefix="custom-select"
            className={`${styles.multiSelectFilter} text-dark ${darkMode ? 'dark-mode' : ''}`}
            styles={{
              menuList: base => ({ ...base, maxHeight: '700px', overflowY: 'auto' }),
              option: (base, st) => ({
                ...base,
                fontSize: '13px',
                backgroundColor: st.isFocused ? '#eee' : 'white',
              }),
            }}
          />

          <div className={`${styles.filterContainer}`}>
            {hasPermissionToFilter && (
              <>
                <div className={`${styles.filterStyle} ${styles.marginRight}`}>
                  <span>Filter by Special Colors:</span>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}
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
            )}
          </div>

          <WeeklySummariesToggleFilter
            state={state}
            setState={setState}
            hasPermissionToFilter={hasPermissionToFilter}
            editable
            formId="report"
          />
        </Col>
      </Row>

      <Row className={styles['mx-max-sm-0']}>
        <Col lg={{ size: 5, offset: 1 }} md={{ size: 6 }} xs={{ size: 12 }}>
          <div>Select Extra Members</div>
          <MultiSelect
            className={`${styles['report-multi-select-filter']} ${styles.textDark} ${
              darkMode ? 'dark-mode' : ''
            }`}
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
            components={{ Option: CheckboxOption, MenuList: CustomMenuList }}
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
              menuList: base => ({ ...base, maxHeight: '700px', overflowY: 'auto' }),
              option: (base, st) => ({
                ...base,
                fontSize: '13px',
                backgroundColor: st.isFocused ? '#eee' : 'white',
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
                              getWeeklySummariesReport={props.getWeeklySummariesReport}
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
  getInfoCollections: PropTypes.func.isRequired,
  getSavedFilters: PropTypes.func.isRequired,
  updateSavedFiltersForIndividualTeamCodeChange: PropTypes.func.isRequired,
  setTeamCodes: PropTypes.func.isRequired,
  role: PropTypes.string,
  darkMode: PropTypes.bool,
  allBadgeData: PropTypes.array,
  authEmailWeeklySummaryRecipient: PropTypes.string,
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

WeeklySummariesReportTab.propTypes = {
  tabId: PropTypes.string,
  hidden: PropTypes.bool,
  children: PropTypes.node,
};

export default connect(mapStateToProps, mapDispatchToProps)(WeeklySummariesReport);
