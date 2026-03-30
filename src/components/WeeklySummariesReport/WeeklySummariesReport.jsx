/* eslint-disable no-console */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/label-has-associated-control */
import axios from 'axios';
import moment from 'moment';
import 'moment-timezone';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { MultiSelect } from 'react-multi-select-component';
import { connect } from 'react-redux';
import Select, { components } from 'react-select';
import { toast } from 'react-toastify';
import ReactTooltip from 'react-tooltip';
import {
  Alert,
  Button,
  ButtonDropdown,
  Col,
  Container,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  Nav,
  NavItem,
  NavLink,
  Row,
  Spinner,
  TabContent,
  TabPane,
} from 'reactstrap';
import { boxStyle, boxStyleDark } from '~/styles';

import EditableInfoModal from '~/components/UserProfile/EditableModal/EditableInfoModal';
import { ENDPOINTS } from '~/utils/URL';
import { getAllTeamCode, getAllUserTeams } from '../../actions/allTeamsAction';
import {
  updateOneSummaryReport,
  updateSummaryReport,
  updateSummaryReportFromServerAction,
} from '../../actions/weeklySummaries';
import { getWeeklySummariesReport } from '../../actions/weeklySummariesReport';
import SkeletonLoading from '../common/SkeletonLoading';
import TeamChart from './TeamChart';

import {
  createSavedFilter,
  deleteSavedFilter,
  getSavedFilters,
  updateSavedFilter,
  updateSavedFiltersForIndividualTeamCodeChange,
  updateSavedFiltersForTeamCodeChange,
} from '../../actions/savedFilterActions';

import 'react-toastify/dist/ReactToastify.css';
import { fetchAllBadges } from '../../actions/badgeManagement';
import { getInfoCollections } from '../../actions/information';
import { setTeamCodes } from '../../actions/teamCodes';
import { showTrophyIcon } from '../../utils/anniversaryPermissions';
import hasPermission from '../../utils/permissions';
import CreateFilterModal from './components/CreateFilterModal';
import SelectFilterModal from './components/SelectFilterModal';
import UpdateFilterModal from './components/UpdateFilterModal';
import FormattedReport from './FormattedReport';
import GeneratePdfReport from './GeneratePdfReport';
import PasswordInputModal from './PasswordInputModal';
import SelectTeamPieChart from './SelectTeamPieChart';
import styles from './WeeklySummariesReport.module.css';
import WeeklySummaryRecipientsPopup from './WeeklySummaryRecepientsPopup';
// Keeping this block commented intentionally for future reference
// import { setField, toggleField, removeItemFromField, setChildField } from '~/utils/stateHelper';
import { setField } from '~/utils/stateHelper';
import WeeklySummariesToggleFilter from './components/WeeklySummariesToggleFilter';
// Keeping this block commented intentionally for future reference —
import cn from 'classnames';
import { getCustomStyles } from '~/utils/reactSelectStyles';
import {
  useDeleteWeeklySummariesFilterMutation,
  useGetWeeklySummariesFiltersQuery,
  useUpdateFiltersWithIndividualCodesChangeMutation,
  useUpdateFiltersWithReplacedTeamCodesMutation,
} from '../../actions/weeklySummariesFilterAction';
import { SlideToggle } from './components';

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
  loadedTabs: [navItems[1]],
  summariesByTab: {},
  tabsLoading: { [navItems[1]]: false },
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
        onChange={() => null}
        style={{ marginRight: 8 }}
      />
      <label style={{ fontWeight: 'bold' }}>{props.label}</label>
    </components.Option>
  );
};

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

const SaveIndicator = props => {
  const { selectProps } = props;

  if (!selectProps.showFilterButtons) return null;

  return (
    <button
      type="button"
      onMouseDown={e => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        selectProps.onSaveFilter?.();
      }}
      title="Save current filter"
      aria-label="Save current filter"
      className={`${styles.indicatorActionBtn} ${styles.saveIndicatorBtn}`}
    >
      <i className="fa fa-save" />
    </button>
  );
};

const ClearSelectionIndicator = props => {
  const { selectProps } = props;

  if (!selectProps.showFilterButtons) return null;

  return (
    <button
      type="button"
      onMouseDown={e => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        selectProps.onClearSelection?.();
      }}
      title="Clear selection"
      aria-label="Clear selection"
      className={`${styles.indicatorActionBtn} ${styles.clearIndicatorBtn}`}
    >
      <i className="fa fa-times" />
    </button>
  );
};

const CustomIndicatorsContainer = props => {
  const { children } = props;

  return (
    <components.IndicatorsContainer {...props}>
      {children}
      <SaveIndicator {...props} />
      <ClearSelectionIndicator {...props} />
    </components.IndicatorsContainer>
  );
};

/* eslint-disable react/function-component-definition */
const WeeklySummariesReport = props => {
  const { loading, getInfoCollections } = props;
  const weekDates = getWeekDates();
  const [state, setState] = useState(initialState);
  const [permissionState, setPermissionState] = useState(intialPermissionState);

  const [createFilterModalOpen, setCreateFilterModalOpen] = useState(false);
  const [updateFilterModalOpen, setUpdateFilterModalOpen] = useState(false);
  const [selectFilterModalOpen, setSelectFilterModalOpen] = useState(false);
  const [saveFilterDropdownOpen, setSaveFilterDropdownOpen] = useState(false);

  const toggleSaveFilterDropdown = () => setSaveFilterDropdownOpen(prev => !prev);
  const toggleCreateFilterModal = () => setCreateFilterModalOpen(prev => !prev);
  const toggleUpdateFilterModal = () => setUpdateFilterModalOpen(prev => !prev);
  const toggleSelectFilterModal = () => setSelectFilterModalOpen(prev => !prev);

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
    if (props.allBadgeData && props.allBadgeData.length > 0) {
      setState(prevState => ({
        ...prevState,
        badges: props.allBadgeData,
      }));
    }
  }, [props.allBadgeData]);

  const [currentAppliedFilter, setCurrentAppliedFilter] = useState(null);

  const processRawSummaries = (rawSummaries, activeTab) => {
    const summariesCopy = JSON.parse(JSON.stringify(rawSummaries || []));
    const weekIndex = navItems.indexOf(activeTab);

    const processedSummaries = summariesCopy
      .map(summary => {
        const promisedHoursByWeek = weekDates.map(weekDate =>
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
            filterColor = Array.isArray(parsed)
              ? parsed.map(c => (typeof c === 'string' ? c.toLowerCase() : c))
              : [String(parsed).toLowerCase()];
          } catch {
            filterColor = [summary.filterColor.toLowerCase()];
          }
        }

        return {
          ...summary,
          filterColor,
          promisedHoursByWeek,
        };
      })
      .filter(summary => shouldIncludeSummaryForWeek(summary, weekIndex))
      .sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));

    const teamCodeGroup = {};
    const newTeamCodes = [];
    const colorOptionGroup = new Set();
    const newColorOptions = [];

    processedSummaries.forEach(summary => {
      const normalizedCode = typeof summary.teamCode === 'string' ? summary.teamCode.trim() : '';
      const code = normalizedCode || 'noCodeLabel';

      if (!teamCodeGroup[code]) {
        teamCodeGroup[code] = [];
      }
      teamCodeGroup[code].push(summary);

      if (summary.weeklySummaryOption) {
        colorOptionGroup.add(summary.weeklySummaryOption);
      }
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

    newTeamCodes.sort((a, b) => a.value.localeCompare(b.value));

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

  const shouldIncludeSummaryForWeek = (summary, weekIndex) => {
    if (
      summary?.isActive === false &&
      !doesSummaryBelongToWeek(summary.startDate, summary.endDate, weekIndex)
    ) {
      return false;
    }

    if (summary.endDate && summary.finalWeekIndex !== weekIndex) {
      return false;
    }

    return true;
  };

  const doesSummaryBelongToWeek = (startDateStr, endDateStr, weekIndex) => {
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

    return summaryStart <= weekEndLA && summaryEnd >= weekStartLA;
  };

  const getAllRoles = summaries => {
    const roleNames = summaries.map(summary => `${summary.role}Info`);
    const uniqueRoleNames = [...new Set(roleNames)];
    return uniqueRoleNames;
  };

  const getPromisedHours = (weekToDateX, weeklycommittedHoursHistory) => {
    if (!weeklycommittedHoursHistory) {
      return -1;
    }
    if (weeklycommittedHoursHistory.length === 0) {
      return 10;
    }

    const weekToDateReformat = new Date(weekToDateX).setHours(23, 59, 59, 999);

    for (let i = weeklycommittedHoursHistory.length - 1; i >= 0; i -= 1) {
      const historyDateX = new Date(weeklycommittedHoursHistory[i].dateChanged);
      if (weekToDateReformat >= historyDateX) {
        return weeklycommittedHoursHistory[i].hours;
      }
    }

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

  const createIntialSummaries = async () => {
    try {
      const { fetchAllBadges, hasPermission, auth, setTeamCodes } = props;

      const activeTab =
        sessionStorage.getItem('tabSelection') === null
          ? navItems[1]
          : sessionStorage.getItem('tabSelection');

      const weekIndex = navItems.indexOf(activeTab);

      setState(prevState => ({
        ...prevState,
        loading: true,
        activeTab,
        tabsLoading: {
          ...prevState.tabsLoading,
          [activeTab]: true,
        },
      }));

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

      const response = await axios.get(ENDPOINTS.WEEKLY_SUMMARIES_REPORT(), {
        params: { week: weekIndex, forceRefresh: true, _ts: Date.now() },
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      });

      const summaries = response?.data ?? [];

      if (!Array.isArray(summaries) || summaries.length === 0) {
        setState(prevState => ({
          ...prevState,
          loading: false,
          summaries: [],
          filteredSummaries: [],
          teamCodes: [],
          colorOptions: [],
          tableData: {},
          summariesByTab: {
            ...prevState.summariesByTab,
            [activeTab]: [],
          },
          tabsLoading: {
            ...prevState.tabsLoading,
            [activeTab]: false,
          },
        }));
        return null;
      }

      const processedData = processRawSummaries(summaries, activeTab);
      const { summaries: summariesCopy, teamCodes, colorOptions, tableData } = processedData;

      setTeamCodes(teamCodes);

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

      const chartData = [];
      const memberDict = {};

      summariesCopy.forEach(summary => {
        memberDict[summary._id] = `${summary.firstName} ${summary.lastName}`;
      });

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
        tableData,
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

      await intialInfoCollections(summariesCopy);

      return summariesCopy;
    } catch (error) {
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
      selectedExtraMembers: prev.selectedExtraMembers.filter(
        member => !selectedMemberSet.has(member.value),
      ),
    }));
  };

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
    const summaryStart = new Date(startDateStr);
    const summaryEnd = new Date(endDateStr);

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

      const temp = summaries
        .map(s => ({ ...s }))
        .filter(summary => {
          const { activeTab } = state;
          const hoursLogged = (summary.totalSeconds[navItems.indexOf(activeTab)] || 0) / 3600;

          if (!shouldIncludeSummaryForWeek(summary, weekIndex)) {
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
              hoursLogged >= summary.promisedHoursByWeek[navItems.indexOf(activeTab)] * 1.25);

          const summarySubmissionDate = moment()
            .tz('America/Los_Angeles')
            .endOf('week')
            .subtract(weekIndex, 'week')
            .format('YYYY-MM-DD');

          const hasTrophy =
            !selectedTrophies ||
            showTrophyIcon(summarySubmissionDate, summary?.startDate?.split('T')[0]);

          const matchesSpecialColor =
            activeFilterColors.length === 0 ||
            activeFilterColors.some(color => summary.filterColor?.includes?.(color));

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

      if (selectedCodes[0]?.value === '' || selectedCodes.length >= 52) {
        if (selectedCodes.length >= 52) {
          selectedCodes.forEach(code => {
            if (code.value === '') return;
            chartData.push({
              name: code.label,
              value: code.value in filteredTeamDict ? filteredTeamDict[code.value].length : 0,
            });
            const team = filteredTeamDict[code.value];
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
          });
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
          if (val > 0) {
            chartData.push({
              name: code.label,
              value: val,
            });
          }
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

      chartData.sort((a, b) => (b.value ?? 0) - (a.value ?? 0) || a.name.localeCompare(b.name));
      temptotal = chartData.reduce((acc, entry) => acc + entry.value, 0);
      const teamSortKey = team => {
        if (team === 'Extra Members') return 'zzzz_extra_members';
        if (team === 'noCodeLabel') return 'zzzz_no_code';
        return team ?? '';
      };

      structuredTeamTableData.sort((a, b) =>
        teamSortKey(a.team).localeCompare(teamSortKey(b.team)),
      );

      const selectedTeamCodes = Array.isArray(selectedCodes)
        ? selectedCodes.map(e => e.value)
        : selectedCodes
        ? [selectedCodes.value]
        : [];
      if (selectedTeamCodes.includes('a-BCC')) {
        const filtered = temp.filter(u => u.teamCode === 'a-BCC');
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

  const buildProcessedSummariesState = (prevState, rawSummaries, activeTab) => {
    const processedData = processRawSummaries(rawSummaries, activeTab);
    const { summaries: summariesCopy, teamCodes, colorOptions, tableData } = processedData;

    return {
      ...prevState,
      summaries: summariesCopy,
      filteredSummaries: summariesCopy,
      teamCodes,
      colorOptions,
      tableData,
      badges: props.allBadgeData || prevState.badges,
      summariesByTab: {
        ...prevState.summariesByTab,
        [activeTab]: summariesCopy,
      },
    };
  };

  const buildEmptySummariesState = (prevState, activeTab) => ({
    ...prevState,
    summaries: [],
    filteredSummaries: [],
    teamCodes: [],
    colorOptions: [],
    tableData: {},
    summariesByTab: {
      ...prevState.summariesByTab,
      [activeTab]: [],
    },
  });

  const fetchWeeklySummariesForTab = async activeTab => {
    const weekIndex = navItems.indexOf(activeTab);

    const response = await axios.get(ENDPOINTS.WEEKLY_SUMMARIES_REPORT(), {
      params: { week: weekIndex, forceRefresh: true, _ts: Date.now() },
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
    });

    return Array.isArray(response?.data) ? response.data : [];
  };

  const refreshCurrentTab = async () => {
    const { activeTab } = state;
    setState(prev => ({ ...prev, refreshing: true }));

    try {
      const rawSummaries = await fetchWeeklySummariesForTab(activeTab);

      setState(prevState => ({
        ...(rawSummaries.length > 0
          ? buildProcessedSummariesState(prevState, rawSummaries, activeTab)
          : buildEmptySummariesState(prevState, activeTab)),
        refreshing: false,
      }));
    } catch (error) {
      setState(prevState => ({
        ...prevState,
        refreshing: false,
      }));
    }
  };

  const toggleTab = tab => {
    const { activeTab } = state;

    if (activeTab === tab) return;

    setState(prevState => ({
      ...prevState,
      activeTab: tab,
      tabsLoading: {
        ...prevState.tabsLoading,
        [tab]: true,
      },
    }));

    sessionStorage.setItem('tabSelection', tab);

    if (state.summariesByTab[tab]) {
      setState(prevState => ({
        ...buildProcessedSummariesState(prevState, prevState.summariesByTab[tab], tab),
        tabsLoading: {
          ...prevState.tabsLoading,
          [tab]: false,
        },
      }));
    }
  };

  const handleSelectCodeChange = event => {
    const selectedValues = event.map(e => e.value);

    setState(prev => {
      const reorderedTeamCodes = [
        ...prev.teamCodes.filter(code => selectedValues.includes(code.value)),
        ...prev.teamCodes.filter(code => !selectedValues.includes(code.value)),
      ];

      return {
        ...prev,
        selectedCodes: event,
        teamCodes: reorderedTeamCodes,
        bulkSelectedColors: { purple: false, green: false, navy: false },
      };
    });

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

  const handleTeamCodeChange = (userId, newTeamCode) => {
    setState(prevState => {
      const summaries = prevState.summaries.map(summary => {
        if (summary._id === userId) {
          return { ...summary, teamCode: newTeamCode };
        }
        return summary;
      });

      const weekIndex = navItems.indexOf(prevState.activeTab);

      const validSummariesForWeek = summaries.filter(summary =>
        shouldIncludeSummaryForWeek(summary, weekIndex),
      );

      const teamCodeCounts = {};
      const teamCodeWithUserId = {};
      const updatedTableData = {};
      let noTeamCodeCount = 0;

      validSummariesForWeek.forEach(summary => {
        const normalizedCode = typeof summary.teamCode === 'string' ? summary.teamCode.trim() : '';
        const key = normalizedCode || '';

        if (!normalizedCode) {
          noTeamCodeCount += 1;
        }

        teamCodeCounts[key] = (teamCodeCounts[key] || 0) + 1;

        if (!teamCodeWithUserId[key]) {
          teamCodeWithUserId[key] = [];
        }
        teamCodeWithUserId[key].push(summary._id);

        const tableKey = normalizedCode || 'noCodeLabel';
        if (!updatedTableData[tableKey]) {
          updatedTableData[tableKey] = [];
        }
        updatedTableData[tableKey].push(summary);
      });

      const teamCodes = Object.keys(teamCodeCounts)
        .filter(code => code !== '')
        .map(code => ({
          value: code,
          label: `${code} (${teamCodeCounts[code]})`,
          _ids: teamCodeWithUserId[code] || [],
        }))
        .sort((a, b) => a.value.localeCompare(b.value));

      teamCodes.push({
        value: '',
        label: `Select All With NO Code (${noTeamCodeCount})`,
        _ids: teamCodeWithUserId[''] || [],
      });

      const updatedSelectedCodes = (prevState.selectedCodes || [])
        .map(selected => teamCodes.find(code => code.value === selected.value))
        .filter(Boolean);

      return {
        ...prevState,
        summaries,
        summariesByTab: {
          ...prevState.summariesByTab,
          [prevState.activeTab]: summaries,
        },
        tableData: updatedTableData,
        teamCodes,
        selectedCodes: updatedSelectedCodes,
      };
    });
  };

  const handleDeleteFilter = async filter => {
    try {
      await deleteFilter({
        id: filter.value,
      }).unwrap();

      toast.success(`Successfully deleted filter ${filter.label}`);
      if (currentAppliedFilter && currentAppliedFilter._id === filter.value) {
        setCurrentAppliedFilter(null);
      }
    } catch (error) {
      toast.error(`Failed to delete filter. Error: ${JSON.stringify(error)}`);
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

        props.setTeamCodes(updatedTeamCodes);

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

        try {
          await updateFilterWithReplacedTeamCodes({
            oldTeamCodes,
            newTeamCode: replaceCode,
          }).unwrap();

          toast.success(`Successfully replace codes in all filters`);
        } catch (error) {
          toast.error(`Failed to replace codes in filters. Status ${error.status}`);
        }

        setState(prev => ({
          ...prev,
          summaries: updatedSummaries,
          summariesByTab: {
            ...prev.summariesByTab,
            [prev.activeTab]: updatedSummaries,
          },
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
      console.log('handleSpecialColorDotClick called with:', { userId, color });
      console.log('Current state.summaries (first 5):', state.summaries?.slice(0, 5));

      if (!Array.isArray(state.summaries)) {
        console.error('❌ Cannot update: state.summaries is not an array!');
        toast.error('Data is not ready. Please wait a moment and try again.');
        return;
      }

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
        summariesByTab: {
          ...prev.summariesByTab,
          [state.activeTab]: updatedSummaries,
        },
      }));

      const currentRequestorId = props.auth?.user?.userid;
      if (!currentRequestorId) {
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
        timeOffFrom: updatedUser.timeOffFrom || null,
        timeOffTill: updatedUser.timeOffTill || null,
      };
      console.log('User ID for requestor:', currentRequestorId);
      const payloadToSend = fullPayload;
      console.log('SENDING PAYLOAD:', JSON.stringify(payloadToSend, null, 2));

      try {
        const res = await props.updateOneSummaryReport(userId, payloadToSend);
        console.log('✅ Successfully updated user on backend:', res.data);
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

      const matchingUsers = Array.isArray(state.summaries)
        ? state.summaries.filter(user => user && selectedTeamCodesSet.has(user.teamCode))
        : [];

      if (matchingUsers.length === 0) {
        toast.warn('No users match the selected team codes.');
        return;
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
            const newColors = res?.data?.filterColor || [color];

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

    const savedCodeValues = Array.isArray(filter.selectedCodes)
      ? filter.selectedCodes
      : Array.from(filter.selectedCodes || []);

    const selectedCodesChoice = savedCodeValues
      .map(savedCodeValue => state.teamCodes.find(code => code.value === savedCodeValue))
      .filter(Boolean);

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

  useEffect(() => {
    let isMounted = true;

    const loadTabData = async () => {
      const activeTab = state.activeTab;

      if (state.summariesByTab[activeTab]) {
        setState(prevState => ({
          ...buildProcessedSummariesState(
            prevState,
            prevState.summariesByTab[activeTab],
            activeTab,
          ),
          tabsLoading: {
            ...prevState.tabsLoading,
            [activeTab]: false,
          },
        }));
        return;
      }

      setState(prev => ({ ...prev, loading: true }));

      try {
        const rawSummaries = await fetchWeeklySummariesForTab(activeTab);

        if (!isMounted) return;

        setState(prevState => ({
          ...(rawSummaries.length > 0
            ? buildProcessedSummariesState(prevState, rawSummaries, activeTab)
            : buildEmptySummariesState(prevState, activeTab)),
          loading: false,
          tabsLoading: {
            ...prevState.tabsLoading,
            [activeTab]: false,
          },
        }));
      } catch (err) {
        if (!isMounted) return;

        console.error('❌ Failed to fetch data', err);
        setState(prevState => ({
          ...prevState,
          loading: false,
          tabsLoading: {
            ...prevState.tabsLoading,
            [activeTab]: false,
          },
        }));
      }
    };

    loadTabData();

    return () => {
      isMounted = false;
    };
  }, [state.activeTab]);

  useEffect(() => {
    if (state.loading !== loading) {
      setState(prev => ({
        ...prev,
        loading,
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
  ]);

  useEffect(() => {
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
    if (!Array.isArray(state.teamCodes)) return;
    props.setTeamCodes(state.teamCodes);
  }, [state.teamCodes, props.setTeamCodes]);

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
        <style>
          {`
            .custom-select__input-container {
              grid-template-columns: auto !important;
            }
            .list-group-item.bg-yinmn-blue {
              background-color: #3d5a80 !important;
            }
          `}
        </style>
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
            <div className={styles.teamCodeSelectRow}>
              {state.teamCodeWarningUsers.length > 0 && (
                <>
                  <i
                    className="fa fa-info-circle text-danger"
                    data-tip
                    data-placement="top"
                    data-for="teamCodeWarningTooltip"
                    style={{
                      fontSize: '20px',
                      cursor: 'pointer',
                      marginRight: '8px',
                      alignSelf: 'center',
                    }}
                  />
                  <ReactTooltip id="teamCodeWarningTooltip" place="top" effect="solid">
                    {state.teamCodeWarningUsers.length} users have mismatched team codes!
                  </ReactTooltip>
                </>
              )}

              <div className={styles.teamCodeSelect}>
                <Select
                  isMulti
                  isSearchable
                  isClearable
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
                    IndicatorsContainer: CustomIndicatorsContainer,
                  }}
                  showFilterButtons={
                    state.selectedCodes.length > 0 && permissionState.canManageFilter
                  }
                  onSaveFilter={() => setCreateFilterModalOpen(true)}
                  onClearSelection={() => handleSelectCodeChange([])}
                  placeholder="Search and select team codes..."
                  classNamePrefix="custom-select"
                  className={`custom-select-container ${darkMode ? 'dark-mode' : ''} ${
                    state.teamCodeWarningUsers.length > 0 ? 'warning-border' : ''
                  }`}
                  styles={customStyles}
                />
              </div>
            </div>
          </div>

          {hasPermissionToFilter && <></>}
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
          <div className={styles.filtersPanel}>
            {hasPermissionToFilter && (
              <div className={styles.filterRow}>
                <div className={styles.specialColorsRow}>
                  <span className={styles.filterGroupLabel}>Filter by Special Colors:</span>

                  {['purple', 'green', 'navy'].map(color => {
                    const labelMap = {
                      purple: 'Purple',
                      green: 'Green',
                      navy: 'Navy',
                    };

                    return (
                      <div key={color} className={styles.specialColorsItem}>
                        <span className={styles.filterLabel}>{labelMap[color]}</span>
                        <span className={styles.specialColorsToggleWrap}>
                          <SlideToggle
                            className={styles.specialColorsToggle}
                            color={color}
                            onChange={handleSpecialColorToggleChange}
                          />
                        </span>
                      </div>
                    );
                  })}
                </div>

                {state.selectedCodes.length > 0 && (
                  <div className={styles.filterGroup}>
                    <span className={styles.filterGroupLabel}>Select All (Visible Users):</span>

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
                            backgroundColor: state.bulkSelectedColors[color]
                              ? color
                              : 'transparent',
                            border: `3px solid ${color}`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className={styles.filterRow}>
              <WeeklySummariesToggleFilter
                state={state}
                setState={setState}
                hasPermissionToFilter={hasPermissionToFilter}
                editable={true}
                formId="report"
                hasPermission={props.hasPermission}
                darkMode={darkMode}
              />
            </div>
          </div>
        </Col>
      </Row>
      <Row className={styles['mx-max-sm-0']}>
        <Col lg={{ size: 5, offset: 1 }} md={{ size: 6 }} xs={{ size: 12 }} className="mb-3">
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
            classNamePrefix="custom-select"
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
  updateSummaryReport: payload => dispatch(updateSummaryReport(payload)),
  updateSummaryReportFromServerAction: user => dispatch(updateSummaryReportFromServerAction(user)),
});

function WeeklySummariesReportTab({ tabId, hidden, children }) {
  return <TabPane tabId={tabId}>{!hidden && children}</TabPane>;
}

export default connect(mapStateToProps, mapDispatchToProps)(WeeklySummariesReport);
