/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-shadow */
/* eslint-disable react/require-default-props */
/* eslint-disable react/forbid-prop-types */

// import Select, { components } from 'react-select';
// import { FixedSizeList as List } from 'react-window';
import { useEffect, useMemo } from 'react';
import { useState } from 'react';
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
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import ReactTooltip from 'react-tooltip';
import { MultiSelect } from 'react-multi-select-component';
import moment from 'moment';
import { boxStyle, boxStyleDark } from 'styles';
import 'moment-timezone';
import axios from 'axios';

import { ENDPOINTS } from 'utils/URL';
import EditableInfoModal from 'components/UserProfile/EditableModal/EditableInfoModal';
import { getAllUserTeams, getAllTeamCode } from '../../actions/allTeamsAction';
import TeamChart from './TeamChart';
import SkeletonLoading from '../common/SkeletonLoading';
import { getWeeklySummariesReport } from '../../actions/weeklySummariesReport';
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
import CreateFilterModal from './CreateFilterModal';
import './WeeklySummariesReport.css';

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
  summaries: [],
  activeTab: navItems[1],
  passwordModalOpen: false,
  summaryRecepientsPopupOpen: false,
  isValidPwd: true,
  badges: [],
  loadBadges: false,
  hasSeeBadgePermission: false,
  selectedCodes: [],
  selectedColors: [],
  filteredSummaries: [],
  teamCodes: [],
  colorOptions: [],
  auth: [],
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
};

const intialPermissionState = {
  bioEditPermission: false,
  canEditSummaryCount: false,
  codeEditPermission: false,
  canSeeBioHighlight: false,
};

// Custom option component with checkbox
// function Option(props) {
//   return (
//     <components.Option {...props}>
//       <input
//         type="checkbox"
//         checked={props.isSelected}
//         onChange={() => {}}
//         style={{ marginRight: 10 }}
//       />
//       {props.label}
//     </components.Option>
//   );
// }

// // Virtualized menu list
// function MenuList(props) {
//   const height = 35 * Math.min(8, props.children.length); // up to 8 visible
//   return (
//     <components.MenuList {...props}>
//       <List height={height} itemCount={props.children.length} itemSize={35} width="100%">
//         {({ index, style }) => <div style={style}>{props.children[index]}</div>}
//       </List>
//     </components.MenuList>
//   );
// }

/* eslint-disable react/function-component-definition */
const WeeklySummariesReport = props => {
  const { loading, infoCollections, getInfoCollections } = props;
  const weekDates = getWeekDates();
  const [state, setState] = useState(initialState);
  const [permissionState, setPermissionState] = useState(intialPermissionState);
  const [saveFilterDropdownOpen, setSaveFilterDropdownOpen] = useState(false);
  const [createFilterModalOpen, setCreateFilterModalOpen] = useState(false);

  const toggleSaveFilterDropdown = () => setSaveFilterDropdownOpen(prev => !prev);
  const toggleCreateFilterModal = () => setCreateFilterModalOpen(prev => !prev);

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
      await getInfoCollections();
      const roleInfoNames = getAllRoles(summariesCopy);
      const allRoleInfo = [];
      if (Array.isArray(infoCollections)) {
        infoCollections.forEach(info => {
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

  // Initial data loading
  const createIntialSummaries = async () => {
    try {
      const {
        allBadgeData,
        getWeeklySummariesReport,
        fetchAllBadges,
        hasPermission,
        auth,
        setTeamCodes,
      } = props;

      // Get the active tab from session storage or use default
      const activeTab =
        sessionStorage.getItem('tabSelection') === null
          ? navItems[1]
          : sessionStorage.getItem('tabSelection');

      // Get the week index for the active tab
      const weekIndex = navItems.indexOf(activeTab);

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
      }));

      // Fetch data for the active tab only
      const res = await getWeeklySummariesReport(weekIndex);
      // console.log('API response:', res);
      // console.log('Response data:', res?.data);
      // console.log('Data is array:', Array.isArray(res?.data));
      // console.log('Data length:', res?.data?.length);
      const summaries = res?.data ?? [];

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

      // Add new key of promised hours by week
      summariesCopy = summariesCopy.map(summary => {
        const promisedHoursByWeek = weekDates.map(weekDate =>
          getPromisedHours(weekDate.toDate, summary.weeklycommittedHoursHistory),
        );

        const filterColor = summary.filterColor || null;

        return { ...summary, promisedHoursByWeek, filterColor };
      });

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

      // Store the data in the tab-specific state
      setState(prevState => ({
        ...prevState,
        loading: false,
        allRoleInfo: [],
        summaries: summariesCopy,
        loadedTabs: [activeTab],
        summariesByTab: {
          [activeTab]: summariesCopy,
        },
        badges: allBadgeData,
        hasSeeBadgePermission: badgeStatusCode === 200,
        filteredSummaries: summariesCopy,
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
        // membersFromUnselectedTeam,
      }));

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

  // Update members of membersFromUnselectedTeam dropdown
  const membersFromUnselectedTeam = useMemo(() => {
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
    const membersFromUnselectedTeam = [];
    state.summaries.forEach(summary => {
      if (!selectedMemberSet.has(summary._id)) {
        membersFromUnselectedTeam.push({
          label: `${summary.firstName} ${summary.lastName}`,
          value: summary._id,
          role: summary.role,
        });
      }
    });
    return membersFromUnselectedTeam;
  }, [state.selectedCodes, state.summaries]);

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

  const filterWeeklySummaries = () => {
    try {
      const {
        selectedCodes,
        selectedColors,
        summaries,
        selectedOverTime,
        selectedBioStatus,
        selectedTrophies,
        tableData,
        COLORS,
        selectedSpecialColors,
        selectedExtraMembers,
      } = state;

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

      const temp = summaries.filter(summary => {
        const { activeTab } = state;
        const hoursLogged = (summary.totalSeconds[navItems.indexOf(activeTab)] || 0) / 3600;
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
        const matchesSpecialColor =
          activeFilterColors.length === 0 || activeFilterColors.includes(summary.filterColor);

        // Filtered by Team Code and Extra Members
        const isInSelectedCode = selectedCodesArray.includes(summary.teamCode);
        const isInSelectedExtraMember = selectedExtraMembersArray.includes(summary._id);
        const noFilterSelected =
          selectedCodesArray.length === 0 && selectedExtraMembersArray.length === 0;

        return (
          (noFilterSelected || isInSelectedCode || isInSelectedExtraMember) &&
          (selectedColorsArray.length === 0 ||
            selectedColorsArray.includes(summary.weeklySummaryOption)) &&
          matchesSpecialColor &&
          isOverHours &&
          isBio &&
          hasTrophy
        );
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

      // Add Extra Members data to chartData and structuredTeamTableData
      if (selectedExtraMembersArray.length > 0) {
        chartData.push({
          name: 'Extra Members',
          value: selectedExtraMembersArray.length,
        });
        const color = COLORS[selectedCodesArray.length % COLORS.length];
        const members = [];
        selectedExtraMembers.forEach(option => {
          members.push({
            name: option.label,
            role: option.role,
            id: option.value,
          });
        });
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
      const url = `${ENDPOINTS.WEEKLY_SUMMARIES_REPORT()}?week=${weekIndex}&forceRefresh=true`;
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

          const filterColor = summary.filterColor || null;

          return { ...summary, promisedHoursByWeek, filterColor };
        });

        // Update state
        setState(prevState => ({
          ...prevState,
          refreshing: false,
          summaries: summariesCopy,
          filteredSummaries: summariesCopy,
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

                const filterColor = summary.filterColor || null;

                return { ...summary, promisedHoursByWeek, filterColor };
              });

              // Update state
              setState(prevState => ({
                ...prevState,
                summaries: summariesCopy,
                filteredSummaries: summariesCopy,
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

  const handleSelectCodeChange = event => {
    setState(prev => ({
      ...prev,
      selectedCodes: event,
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

        if (!selectedCodes.find(code => code.value === newTeamCode)) {
          const ids = teamCodeWithUserId[newTeamCode];
          if (newTeamCode !== undefined && newTeamCode.length > 0) {
            selectedCodes.push({
              label: `${newTeamCode} (${teamCodeCounts[newTeamCode]})`,
              value: newTeamCode,
              _ids: ids,
            });
          }
        }
        // Sort teamCodes by label
        teamCodes
          .sort((a, b) => a.label.localeCompare(b.label))
          .push({
            value: '',
            label: `Select All With NO Code (${noTeamCodeCount || 0})`,
            _ids: teamCodeWithUserId[''],
          });
        return { ...prevState, summaries, teamCodes, selectedCodes };
      });
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

        const updatedTableData = tableData;
        updatedTableData[replaceCode] = updatedSummaries.filter(s => s.teamCode === replaceCode);
        oldTeamCodes.forEach(code => {
          updatedTableData[code] = updatedSummaries.filter(s => s.teamCode === code);
        });

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

  const handleSpecialColorDotClick = (userId, color) => {
    setState(prevState => {
      const updatedSummaries = prevState.summaries.map(summary => {
        if (summary._id === userId) {
          return { ...summary, filterColor: color };
        }
        return summary;
      });

      // Also update the tab-specific cache
      const updatedSummariesByTab = {
        ...prevState.summariesByTab,
        [prevState.activeTab]: updatedSummaries,
      };

      return {
        ...prevState,
        summaries: updatedSummaries,
        summariesByTab: updatedSummariesByTab,
      };
    });
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

  // Setup effect hooks for initial data load
  useEffect(() => {
    let isMounted = true;
    window._isMounted = isMounted;

    // console.log('Initial useEffect running');

    // Only load the initial tab, nothing else
    createIntialSummaries();

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
      filterWeeklySummaries();
    }
  }, [
    state.selectedOverTime,
    state.selectedCodes,
    state.selectedBioStatus,
    state.selectedColors,
    state.selectedTrophies,
    state.selectedSpecialColors,
    state.selectedExtraMembers,
    state.summaries,
    state.activeTab,
  ]);
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
      <Container fluid style={{ backgroundColor: darkMode ? '#1B2A41' : '#f3f4f6' }}>
        <Row className="text-center" data-testid="loading">
          <SkeletonLoading
            template="WeeklySummariesReport"
            className={darkMode ? 'bg-yinmn-blue' : ''}
          />
        </Row>
      </Container>
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
      <Row>
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
              color="primary"
              outline
              className="mx-1"
              type="button"
              style={darkMode ? boxStyleDark : boxStyle}
            >
              Select Filter
            </Button>
            <ButtonDropdown
              className="ml-1"
              style={darkMode ? boxStyleDark : boxStyle}
              isOpen={saveFilterDropdownOpen}
              toggle={toggleSaveFilterDropdown}
            >
              <DropdownToggle caret color="primary">
                Save Filter
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem>Update Existing Filter</DropdownItem>
                <DropdownItem onClick={() => setCreateFilterModalOpen(true)}>
                  Create New Filter
                </DropdownItem>
              </DropdownMenu>
            </ButtonDropdown>
            <CreateFilterModal
              isOpen={createFilterModalOpen}
              toggle={toggleCreateFilterModal}
              initialState={{
                teamCodes: state.teamCodes,
                selectedCodes: state.selectedCodes,
                teamCodeWarningUsers: state.teamCodeWarningUsers,
                colorOptions: state.colorOptions,
                selectedColors: state.selectedColors,
                selectedExtraMembers: state.selectedExtraMembers,
                tableData: state.tableData,
                summaries: state.summaries,
                selectedTrophies: state.selectedTrophies,
                selectedSpecialColors: state.selectedSpecialColors,
                selectedBioStatus: state.selectedBioStatus,
                selectedOverTime: state.selectedOverTime,
              }}
              darkMode={darkMode}
              hasPermissionToFilter={hasPermissionToFilter}
            />
          </div>
        </Col>
      </Row>
      <Row>
        <Col lg={{ size: 5, offset: 1 }} md={{ size: 6 }} xs={{ size: 6 }}>
          <div className="filter-container-teamcode">
            <div>Select Team Code</div>
            <div className="filter-style">
              <span>Show Chart</span>
              <div className="switch-toggle-control">
                <input
                  type="checkbox"
                  className="switch-toggle"
                  id="chart-status-toggle"
                  onChange={handleChartStatusToggleChange}
                />
                <label className="switch-toggle-label" htmlFor="chart-status-toggle">
                  <span className="switch-toggle-inner" />
                  <span className="switch-toggle-switch" />
                </label>
              </div>
            </div>
          </div>
        </Col>
        <Col lg={{ size: 6 }} md={{ size: 6 }} xs={{ size: 6 }}>
          <div>Select Color</div>
        </Col>
      </Row>
      <Row>
        <Col
          lg={{ size: 5, offset: 1 }}
          md={{ size: 6 }}
          xs={{ size: 6 }}
          style={{ position: 'relative' }}
        >
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
          <MultiSelect
            className={`multi-select-filter top-select text-dark ${darkMode ? 'dark-mode' : ''} ${
              state.teamCodeWarningUsers.length > 0 ? 'warning-border' : ''
            }`}
            options={state.teamCodes.map(item => {
              const [code, count] = item.label.split(' (');
              return {
                ...item,
                label: `${code.padEnd(10, ' ')} (${count}`,
              };
            })}
            value={state.selectedCodes}
            onChange={handleSelectCodeChange}
            labelledBy="Select"
          />
        </Col>

        <Col lg={{ size: 5 }} md={{ size: 6, offset: -1 }} xs={{ size: 6, offset: -1 }}>
          <MultiSelect
            className={`multi-select-filter text-dark ${darkMode ? 'dark-mode' : ''}`}
            options={state.colorOptions}
            value={state.selectedColors}
            onChange={handleSelectColorChange}
          />
        </Col>
      </Row>

      <Row>
        <Col lg={{ size: 10, offset: 1 }} xs={{ size: 8, offset: 4 }}>
          <div className="filter-container">
            {hasPermissionToFilter && (
              <div className="filter-style margin-right">
                <span>Filter by Special Colors</span>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}
                >
                  {['purple', 'green', 'navy'].map(color => (
                    <div key={`${color}-toggle`} style={{ display: 'flex', alignItems: 'center' }}>
                      <div className="switch-toggle-control">
                        <input
                          type="checkbox"
                          className="switch-toggle"
                          id={`${color}-toggle`}
                          onChange={e => handleSpecialColorToggleChange(color, e.target.checked)}
                        />
                        <label className="switch-toggle-label" htmlFor={`${color}-toggle`}>
                          <span className="switch-toggle-inner" />
                          <span className="switch-toggle-switch" />
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
              <div className="filter-style margin-right">
                <span>Filter by Bio Status</span>
                <div className="switch-toggle-control">
                  <input
                    type="checkbox"
                    className="switch-toggle"
                    id="bio-status-toggle"
                    onChange={handleBioStatusToggleChange}
                  />
                  <label className="switch-toggle-label" htmlFor="bio-status-toggle">
                    <span className="switch-toggle-inner" />
                    <span className="switch-toggle-switch" />
                  </label>
                </div>
              </div>
            )}
            {hasPermissionToFilter && (
              <div className="filter-style margin-right">
                <span>Filter by Trophies</span>
                <div className="switch-toggle-control">
                  <input
                    type="checkbox"
                    className="switch-toggle"
                    id="trophy-toggle"
                    onChange={handleTrophyToggleChange}
                  />
                  <label className="switch-toggle-label" htmlFor="trophy-toggle">
                    <span className="switch-toggle-inner" />
                    <span className="switch-toggle-switch" />
                  </label>
                </div>
              </div>
            )}
            {hasPermissionToFilter && (
              <div className="filter-style">
                <span>Filter by Over Hours</span>
                <div className="switch-toggle-control">
                  <input
                    type="checkbox"
                    className="switch-toggle"
                    id="over-hours-toggle"
                    onChange={handleOverHoursToggleChange}
                  />
                  <label className="switch-toggle-label" htmlFor="over-hours-toggle">
                    <span className="switch-toggle-inner" />
                    <span className="switch-toggle-switch" />
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
          </div>
        </Col>
      </Row>

      {/* Select individual members */}
      <Row>
        <Col
          lg={{ size: 5, offset: 1 }}
          md={{ size: 6 }}
          xs={{ size: 6 }}
          style={{ position: 'relative' }}
        >
          <div>Select Extra Members</div>
          <MultiSelect
            className={`multi-select-filter text-dark ${darkMode ? 'dark-mode' : ''}`}
            options={membersFromUnselectedTeam}
            value={state.selectedExtraMembers}
            onChange={handleSelectExtraMembersChange}
          />
          {/* <Select
            isMulti
            isSearchable
            options={membersFromUnselectedTeam}
            value={state.selectedExtraMembers}
            onChange={handleSelectExtraMembersChange}
            components={{ Option, MenuList }}
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
            placeholder="Search extra individuals..."
            controlShouldRenderValue={false}
            inputValue={inputValue}
            onInputChange={(newValue, actionMeta) => {
              if (actionMeta.action !== 'set-value') {
                setInputValue(newValue);
              }
            }}
            blurInputOnSelect={false}
          /> */}
        </Col>
        {permissionState.codeEditPermission &&
          state.selectedCodes &&
          state.selectedCodes.length > 0 && (
            <Col lg={{ size: 5 }} md={{ size: 6 }} xs={{ size: 6 }}>
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
                <Alert className="code-alert" color="danger">
                  {state.replaceCodeError}
                </Alert>
              )}
            </Col>
          )}
      </Row>

      {state.chartShow && (
        <Row>
          <Col lg={{ size: 6, offset: 1 }} md={{ size: 12 }} xs={{ size: 11 }}>
            <SelectTeamPieChart
              chartData={state.chartData}
              COLORS={state.COLORS}
              total={state.total}
              style={{ width: '100%' }}
            />
          </Col>
          <Col lg={{ size: 4 }} md={{ size: 12 }} xs={{ size: 11 }} style={{ width: '100%' }}>
            <TeamChart teamData={state.structuredTableData} darkMode={darkMode} />
          </Col>
        </Row>
      )}
      <Row>
        <Col lg={{ size: 10, offset: 1 }}>
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
                  <Row className="text-center py-4">
                    <Col>
                      <Spinner color="primary" />
                      <p>Loading data...</p>
                    </Col>
                  </Row>
                ) : (
                  <>
                    <Row>
                      <Col sm="12" md="6" className="mb-2">
                        From <b>{weekDates[index].fromDate}</b> to <b>{weekDates[index].toDate}</b>
                      </Col>
                      <Col sm="12" md="6" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <GeneratePdfReport
                          summaries={state.filteredSummaries}
                          weekIndex={index}
                          weekDates={weekDates[index]}
                          darkMode={darkMode}
                        />
                        {state.hasSeeBadgePermission && (
                          <Button
                            className="btn--dark-sea-green"
                            style={darkMode ? boxStyleDark : boxStyle}
                            onClick={() =>
                              setState(prev => ({ ...prev, loadTrophies: !state.loadTrophies }))
                            }
                          >
                            {state.loadTrophies ? 'Hide Trophies' : 'Load Trophies'}
                          </Button>
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
};

const mapStateToProps = state => ({
  error: state.weeklySummariesReport?.error || null,
  loading: state.weeklySummariesReport?.loading || false,
  summaries: state.weeklySummariesReport?.summaries || [],
  allBadgeData: state.badge?.allBadgeData || [],
  infoCollections: state.infoCollections?.infos || [],
  role: state?.auth?.user?.role || '',
  auth: state?.auth || {},
  darkMode: state?.theme?.darkMode || false,
  authEmailWeeklySummaryRecipient: state?.auth?.user?.email || '',
});

const mapDispatchToProps = dispatch => ({
  fetchAllBadges: () => dispatch(fetchAllBadges()),
  getWeeklySummariesReport: weekIndex => dispatch(getWeeklySummariesReport(weekIndex)),
  hasPermission: permission => dispatch(hasPermission(permission)),
  getInfoCollections: () => getInfoCollections(),
  getAllUserTeams: () => dispatch(getAllUserTeams()),
  getAllTeamCode: () => dispatch(getAllTeamCode()),
  setTeamCodes: teamCodes => dispatch(setTeamCodes(teamCodes)),
});

function WeeklySummariesReportTab({ tabId, hidden, children }) {
  return <TabPane tabId={tabId}>{!hidden && children}</TabPane>;
}

export default connect(mapStateToProps, mapDispatchToProps)(WeeklySummariesReport);
