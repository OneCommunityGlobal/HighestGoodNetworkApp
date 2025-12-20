/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/function-component-definition */

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
  getSavedFilters,
  createSavedFilter,
  deleteSavedFilter,
  updateSavedFilter,
  updateSavedFiltersForTeamCodeChange,
  updateSavedFiltersForIndividualTeamCodeChange,
} from '../../actions/savedFilterActions';
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
import UpdateFilterModal from './UpdateFilterModal';
import SelectFilterModal from './SelectFilterModal';
import SaveFilterModal from './SaveFilterModal';
import styles from './WeeklySummariesReport.module.css';
import { setField } from '~/utils/stateHelper';
import WeeklySummariesToggleFilter from './WeeklySummariesToggleFilter';

const navItems = ['This Week', 'Last Week', 'Week Before Last', 'Three Weeks Ago'];
const fullCodeRegex = /^.{5,7}$/;

const getWeekDates = () =>
  Array.from({ length: 4 }).map((_, index) => ({
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

/**
 * Shared react-select styles (removes Sonar duplicated-lines issue)
 */
const getMultiSelectStyles = ({ darkMode, warning = false }) => ({
  menuPortal: base => ({
    ...base,
    zIndex: 9999,
  }),

  control: (base, s) => ({
    ...base,
    minHeight: 42,
    backgroundColor: darkMode ? '#0f1b2b' : '#ffffff',
    borderColor: warning
      ? '#e22a2a'
      : s.isFocused
      ? darkMode
        ? '#60a5fa'
        : '#2563eb'
      : darkMode
      ? '#334155'
      : '#cbd5e1',
    boxShadow: 'none',
    ':hover': {
      borderColor: warning ? '#e22a2a' : darkMode ? '#60a5fa' : '#2563eb',
    },
  }),

  valueContainer: base => ({
    ...base,
    padding: '2px 10px',
  }),

  input: base => ({
    ...base,
    color: darkMode ? '#f5f7fb' : '#111827',
  }),

  placeholder: base => ({
    ...base,
    color: darkMode ? '#94a3b8' : '#6b7280',
  }),

  singleValue: base => ({
    ...base,
    color: darkMode ? '#f5f7fb' : '#111827',
  }),

  menu: base => ({
    ...base,
    backgroundColor: darkMode ? '#0b1422' : '#ffffff',
    border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`,
  }),

  menuList: base => ({
    ...base,
    maxHeight: 700,
    overflowY: 'auto',
    backgroundColor: darkMode ? '#0b1422' : '#ffffff',
  }),

  option: (base, s) => ({
    ...base,
    fontSize: '13px',
    backgroundColor: s.isSelected
      ? darkMode
        ? '#1f2a44'
        : '#dbeafe'
      : s.isFocused
      ? darkMode
        ? '#16233a'
        : '#eee'
      : darkMode
      ? '#0b1422'
      : '#ffffff',
    color: darkMode ? '#f5f7fb' : '#111827',
    ':active': {
      backgroundColor: darkMode ? '#1f2a44' : '#bfdbfe',
    },
  }),

  multiValue: base => ({
    ...base,
    backgroundColor: darkMode ? '#1f2a44' : '#e5e7eb',
  }),

  multiValueLabel: base => ({
    ...base,
    color: darkMode ? '#f5f7fb' : '#111827',
  }),

  multiValueRemove: base => ({
    ...base,
    color: darkMode ? '#f5f7fb' : '#111827',
    ':hover': {
      backgroundColor: darkMode ? '#334155' : '#cbd5e1',
    },
  }),

  indicatorSeparator: base => ({
    ...base,
    backgroundColor: darkMode ? '#334155' : '#d1d5db',
  }),

  dropdownIndicator: base => ({
    ...base,
    color: darkMode ? '#cbd5e1' : '#6b7280',
    ':hover': { color: darkMode ? '#f5f7fb' : '#111827' },
  }),

  clearIndicator: base => ({
    ...base,
    color: darkMode ? '#cbd5e1' : '#6b7280',
    ':hover': { color: darkMode ? '#f5f7fb' : '#111827' },
  }),
});

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
  saveFilterModalOpen: false,
  refreshing: false,
};

const intialPermissionState = {
  bioEditPermission: false,
  canEditSummaryCount: false,
  codeEditPermission: false,
  canSeeBioHighlight: false,
  canManageFilter: false,
  hasSeeBadgePermission: false,
};

const CheckboxOption = props => (
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

const WeeklySummariesReport = props => {
                                         const { loading, getInfoCollections } = props;
                                         const weekDates = getWeekDates();
                                         const [state, setState] = useState(initialState);
                                         const [permissionState, setPermissionState] = useState(
                                           intialPermissionState,
                                         );

                                         // Modals / dropdowns
                                         const [
                                           createFilterModalOpen,
                                           setCreateFilterModalOpen,
                                         ] = useState(false);
                                         const [
                                           updateFilterModalOpen,
                                           setUpdateFilterModalOpen,
                                         ] = useState(false);
                                         const [
                                           selectFilterModalOpen,
                                           setSelectFilterModalOpen,
                                         ] = useState(false);
                                         const [
                                           saveFilterDropdownOpen,
                                           setSaveFilterDropdownOpen,
                                         ] = useState(false);

                                         const toggleSaveFilterDropdown = () =>
                                           setSaveFilterDropdownOpen(prev => !prev);
                                         const toggleCreateFilterModal = () =>
                                           setCreateFilterModalOpen(prev => !prev);
                                         const toggleUpdateFilterModal = () =>
                                           setUpdateFilterModalOpen(prev => !prev);
                                         const toggleSelectFilterModal = () =>
                                           setSelectFilterModalOpen(prev => !prev);

                                         // Saved filters
                                         const [
                                           currentAppliedFilter,
                                           setCurrentAppliedFilter,
                                         ] = useState(null);
                                         const [
                                           showModificationModal,
                                           setShowModificationModal,
                                         ] = useState(false);

                                         const { role, darkMode } = props;
                                         const hasPermissionToFilter =
                                           role === 'Owner' || role === 'Administrator';

                                         // Shared react-select props (reduces duplicated lines)
                                         const commonMultiSelectProps = {
                                           isMulti: true,
                                           isSearchable: true,
                                           closeMenuOnSelect: false,
                                           hideSelectedOptions: false,
                                           blurInputOnSelect: false,
                                           classNamePrefix: 'custom-select',
                                           menuPortalTarget: document.body,
                                           components: {
                                             Option: CheckboxOption,
                                             MenuList: CustomMenuList,
                                           },
                                         };

                                         useEffect(() => {
                                           if (
                                             props.allBadgeData &&
                                             props.allBadgeData.length > 0
                                           ) {
                                             setState(prevState => ({
                                               ...prevState,
                                               badges: props.allBadgeData,
                                             }));
                                           }
                                         }, [props.allBadgeData]);

                                         /**
                                          * Sort summaries alphabetically (fix: b.lastName)
                                          */
                                         const alphabetize = summaries => {
                                           const temp = [...summaries];
                                           return temp.sort((a, b) =>
                                             `${a.firstName} ${a.lastName}`.localeCompare(
                                               `${b.firstName} ${b.lastName}`,
                                             ),
                                           );
                                         };

                                         const doesSummaryBelongToWeek = (
                                           startDateStr,
                                           endDateStr,
                                           weekIndex,
                                         ) => {
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

                                           return (
                                             summaryStart <= weekEndLA && summaryEnd >= weekStartLA
                                           );
                                         };

                                         const getAllRoles = summaries => {
                                           const roleNames = summaries.map(
                                             summary => `${summary.role}Info`,
                                           );
                                           return [...new Set(roleNames)];
                                         };

                                         const getPromisedHours = (
                                           weekToDateX,
                                           weeklycommittedHoursHistory,
                                         ) => {
                                           if (!weeklycommittedHoursHistory) return -1;
                                           if (weeklycommittedHoursHistory.length === 0) return 10;

                                           const weekToDateReformat = new Date(
                                             weekToDateX,
                                           ).setHours(23, 59, 59, 999);
                                           for (
                                             let i = weeklycommittedHoursHistory.length - 1;
                                             i >= 0;
                                             i -= 1
                                           ) {
                                             const historyDateX = new Date(
                                               weeklycommittedHoursHistory[i].dateChanged,
                                             );
                                             if (weekToDateReformat >= historyDateX)
                                               return weeklycommittedHoursHistory[i].hours;
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
                                                       (props.role === 'Owner' ||
                                                         props.role === 'Administrator')) ||
                                                     (info.visibility === '2' &&
                                                       props.role !== 'Volunteer');
                                                   info.CanRead = visible;
                                                   allRoleInfo.push(info);
                                                 }
                                               });
                                             }

                                             setState(prev => ({ ...prev, allRoleInfo }));
                                             return allRoleInfo;
                                           } catch (error) {
                                             return null;
                                           }
                                         };

                                         const fetchFilters = async () => {
                                           let filterList = [];
                                           try {
                                             const filterResponse = await axios.get(
                                               ENDPOINTS.WEEKLY_SUMMARIES_FILTERS,
                                             );
                                             if (
                                               filterResponse.status < 200 ||
                                               filterResponse.status >= 300
                                             ) {
                                               toast.error(
                                                 `API request to get filter list failed with status ${filterResponse.status}`,
                                               );
                                             } else {
                                               filterList = filterResponse.data;
                                             }
                                           } catch (e) {
                                             toast.error(
                                               `API request to get filter list failed with error ${e}`,
                                             );
                                           }

                                           const updatedFilterChoices = filterList.map(filter => ({
                                             label: filter.filterName,
                                             value: filter._id,
                                             filterData: {
                                               filterName: filter.filterName,
                                               selectedCodes: new Set(filter.selectedCodes),
                                               selectedColors: new Set(filter.selectedColors),
                                               selectedExtraMembers: new Set(
                                                 filter.selectedExtraMembers,
                                               ),
                                               selectedTrophies: filter.selectedTrophies,
                                               selectedSpecialColors: filter.selectedSpecialColors,
                                               selectedBioStatus: filter.selectedBioStatus,
                                               selectedOverTime: filter.selectedOverTime,
                                             },
                                           }));

                                           setState(prevState => ({
                                             ...prevState,
                                             filterChoices: [...updatedFilterChoices],
                                           }));
                                         };

                                         const createIntialSummaries = async () => {
                                           try {
                                             const {
                                               fetchAllBadges,
                                               hasPermission: hasPermissionAction,
                                               auth,
                                               setTeamCodes: setTeamCodesAction,
                                             } = props;

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
                                               bioEditPermission: hasPermissionAction(
                                                 'putUserProfileImportantInfo',
                                               ),
                                               canEditSummaryCount: hasPermissionAction(
                                                 'putUserProfileImportantInfo',
                                               ),
                                               codeEditPermission:
                                                 hasPermissionAction('editTeamCode') ||
                                                 auth.user.role === 'Owner' ||
                                                 auth.user.role === 'Administrator',
                                               canSeeBioHighlight: hasPermissionAction(
                                                 'highlightEligibleBios',
                                               ),
                                               canManageFilter:
                                                 hasPermissionAction('manageSummariesFilters') ||
                                                 auth.user.role === 'Owner' ||
                                                 auth.user.role === 'Administrator',
                                               hasSeeBadgePermission:
                                                 hasPermissionAction('seeBadges') &&
                                                 badgeStatusCode === 200,
                                             }));

                                             const response = await axios.get(
                                               ENDPOINTS.WEEKLY_SUMMARIES_REPORT(),
                                               {
                                                 params: {
                                                   week: weekIndex,
                                                   forceRefresh: true,
                                                   _ts: Date.now(),
                                                 },
                                                 headers: {
                                                   'Cache-Control': 'no-cache',
                                                   Pragma: 'no-cache',
                                                 },
                                               },
                                             );

                                             const summaries = response?.data ?? [];
                                             if (
                                               !Array.isArray(summaries) ||
                                               summaries.length === 0
                                             ) {
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

                                             const teamCodeGroup = {};
                                             const teamCodes = [];

                                             let summariesCopy = [...summaries];
                                             summariesCopy = alphabetize(summariesCopy);
                                             summariesCopy = summariesCopy.filter(
                                               summary => summary?.isActive !== false,
                                             );

                                             summariesCopy = summariesCopy.map(summary => {
                                               const promisedHoursByWeek = weekDates.map(weekDate =>
                                                 getPromisedHours(
                                                   weekDate.toDate,
                                                   summary.weeklycommittedHoursHistory,
                                                 ),
                                               );
                                               const filterColor = summary.filterColor || null;
                                               return {
                                                 ...summary,
                                                 promisedHoursByWeek,
                                                 filterColor,
                                               };
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

                                             const memberDict = {};
                                             summariesCopy.forEach(summary => {
                                               const code = summary.teamCode || 'noCodeLabel';
                                               if (teamCodeGroup[code])
                                                 teamCodeGroup[code].push(summary);
                                               else teamCodeGroup[code] = [summary];

                                               memberDict[
                                                 summary._id
                                               ] = `${summary.firstName} ${summary.lastName}`;

                                               if (summary.weeklySummaryOption)
                                                 colorOptionGroup.add(summary.weeklySummaryOption);
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

                                             setTeamCodesAction(teamCodes);

                                             colorOptionGroup.forEach(option =>
                                               colorOptions.push({ value: option, label: option }),
                                             );
                                             colorOptions.sort((a, b) =>
                                               `${a.label}`.localeCompare(`${b.label}`),
                                             );

                                             teamCodes
                                               .sort((a, b) =>
                                                 `${a.label}`.localeCompare(`${b.label}`),
                                               )
                                               .push({
                                                 value: '',
                                                 label: `Select All With NO Code (${teamCodeGroup
                                                   .noCodeLabel?.length || 0})`,
                                                 _ids: teamCodeGroup?.noCodeLabel?.map(
                                                   item => item._id,
                                                 ),
                                               });

                                             fetchFilters();

                                             setState(prevState => ({
                                               ...prevState,
                                               loading: false,
                                               allRoleInfo: [],
                                               summaries: summariesCopy,
                                               loadedTabs: [activeTab],
                                               summariesByTab: { [activeTab]: summariesCopy },
                                               badges: props.allBadgeData || [],
                                               filteredSummaries: summariesCopy,
                                               tableData: teamCodeGroup,
                                               chartData: [],
                                               COLORS,
                                               colorOptions,
                                               teamCodes,
                                               teamCodeWarningUsers: summariesCopy.filter(
                                                 s => s.teamCodeWarning,
                                               ),
                                               auth,
                                               tabsLoading: { [activeTab]: false },
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
                                               team.forEach(member =>
                                                 selectedMemberSet.add(member._id),
                                               );
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
                                           // eslint-disable-next-line react-hooks/exhaustive-deps
                                         }, [state.selectedCodes, state.summaries]);

                                         const onSummaryRecepientsPopupClose = () =>
                                           setField(setState, 'summaryRecepientsPopupOpen', false);
                                         const setSummaryRecepientsPopup = val =>
                                           setField(setState, 'summaryRecepientsPopupOpen', val);
                                         const onpasswordModalClose = () =>
                                           setField(setState, 'passwordModalOpen', false);
                                         const checkForValidPwd = booleanVal =>
                                           setField(setState, 'isValidPwd', booleanVal);
                                         const setAuthpassword = authPass =>
                                           setField(setState, 'weeklyRecipientAuthPass', authPass);

                                         const onClickRecepients = () => {
                                           if (state.weeklyRecipientAuthPass) {
                                             setField(setState, 'summaryRecepientsPopupOpen', true);
                                           } else {
                                             setField(setState, 'passwordModalOpen', true);
                                             checkForValidPwd(true);
                                           }
                                         };

                                         const passwordInputModalToggle = () => (
                                           <PasswordInputModal
                                             open={state.passwordModalOpen}
                                             onClose={onpasswordModalClose}
                                             checkForValidPwd={checkForValidPwd}
                                             isValidPwd={state.isValidPwd}
                                             setSummaryRecepientsPopup={setSummaryRecepientsPopup}
                                             setAuthpassword={setAuthpassword}
                                             authEmailWeeklySummaryRecipient={
                                               props.authEmailWeeklySummaryRecipient
                                             }
                                           />
                                         );

                                         const popUpElements = () => (
                                           <WeeklySummaryRecipientsPopup
                                             open={state.summaryRecepientsPopupOpen}
                                             onClose={onSummaryRecepientsPopupClose}
                                             summaries={props.summaries}
                                             password={state.weeklyRecipientAuthPass}
                                             authEmailWeeklySummaryRecipient={
                                               props.authEmailWeeklySummaryRecipient
                                             }
                                           />
                                         );

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
                                             const structuredTeamTableData = [];
                                             const selectedCodesArray = selectedCodes
                                               ? selectedCodes.map(e => e.value)
                                               : [];
                                             const selectedColorsArray = selectedColors
                                               ? selectedColors.map(e => e.value)
                                               : [];
                                             const selectedExtraMembersArray = selectedExtraMembers
                                               ? selectedExtraMembers.map(e => e.value)
                                               : [];

                                             const weekIndex = navItems.indexOf(state.activeTab);

                                             const activeFilterColors = Object.entries(
                                               selectedSpecialColors || {},
                                             )
                                               .filter(([, isSelected]) => isSelected)
                                               .map(([color]) => color);

                                             const temp = summaries
                                               .map(s => ({ ...s }))
                                               .filter(summary => {
                                                 const { activeTab } = state;
                                                 const hoursLogged =
                                                   (summary.totalSeconds[
                                                     navItems.indexOf(activeTab)
                                                   ] || 0) / 3600;

                                                 if (
                                                   summary?.isActive === false &&
                                                   !doesSummaryBelongToWeek(
                                                     summary.startDate,
                                                     summary.endDate,
                                                     weekIndex,
                                                   )
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
                                                     hoursLogged >=
                                                       summary.promisedHoursByWeek[
                                                         navItems.indexOf(activeTab)
                                                       ]);

                                                 const summarySubmissionDate = moment()
                                                   .tz('America/Los_Angeles')
                                                   .endOf('week')
                                                   .subtract(weekIndex, 'week')
                                                   .format('YYYY-MM-DD');

                                                 const hasTrophy =
                                                   !selectedTrophies ||
                                                   showTrophyIcon(
                                                     summarySubmissionDate,
                                                     summary?.startDate?.split('T')[0],
                                                   );

                                                 const matchesSpecialColor =
                                                   activeFilterColors.length === 0 ||
                                                   activeFilterColors.includes(summary.filterColor);

                                                 const isInSelectedCode = selectedCodesArray.includes(
                                                   summary.teamCode,
                                                 );
                                                 const isInSelectedExtraMember = selectedExtraMembersArray.includes(
                                                   summary._id,
                                                 );

                                                 const noFilterSelected =
                                                   selectedCodesArray.length === 0 &&
                                                   selectedExtraMembersArray.length === 0;

                                                 let matchesLoggedHoursRange = true;
                                                 if (
                                                   selectedLoggedHoursRange &&
                                                   selectedLoggedHoursRange.length > 0
                                                 ) {
                                                   matchesLoggedHoursRange = selectedLoggedHoursRange.some(
                                                     range => {
                                                       switch (range.value) {
                                                         case '=0':
                                                           return hoursLogged === 0;
                                                         case '0-10':
                                                           return (
                                                             hoursLogged > 0 && hoursLogged <= 10
                                                           );
                                                         case '10-20':
                                                           return (
                                                             hoursLogged > 10 && hoursLogged <= 20
                                                           );
                                                         case '20-40':
                                                           return (
                                                             hoursLogged > 20 && hoursLogged <= 40
                                                           );
                                                         case '>40':
                                                           return hoursLogged > 40;
                                                         default:
                                                           return true;
                                                       }
                                                     },
                                                   );
                                                 }

                                                 return (
                                                   (noFilterSelected ||
                                                     isInSelectedCode ||
                                                     isInSelectedExtraMember) &&
                                                   (selectedColorsArray.length === 0 ||
                                                     selectedColorsArray.includes(
                                                       summary.weeklySummaryOption,
                                                     )) &&
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
                                                 if (!(summary.teamCode in filteredTeamDict))
                                                   filteredTeamDict[summary.teamCode] = [];
                                                 filteredTeamDict[summary.teamCode].push(summary);
                                               } else {
                                                 filteredTeamDict[''].push(summary);
                                               }
                                               filteredIdSet.add(summary._id);
                                             });

                                             if (
                                               selectedCodes[0]?.value === '' ||
                                               selectedCodes.length >= 52
                                             ) {
                                               if (selectedCodes.length >= 52) {
                                                 selectedCodes.forEach(code => {
                                                   if (code.value === '') return;
                                                   chartData.push({
                                                     name: code.label,
                                                     value:
                                                       code.value in filteredTeamDict
                                                         ? filteredTeamDict[code.value].length
                                                         : 0,
                                                   });

                                                   const team = filteredTeamDict[code.value];
                                                   const index = selectedCodesArray.indexOf(
                                                     code.value,
                                                   );
                                                   const color = COLORS[index % COLORS.length];
                                                   const members = (team || []).map(member => ({
                                                     name: `${member.firstName} ${member.lastName}`,
                                                     role: member.role,
                                                     id: member._id,
                                                   }));

                                                   structuredTeamTableData.push({
                                                     team: code.value,
                                                     color,
                                                     members,
                                                   });
                                                 });
                                               } else {
                                                 chartData.push({
                                                   name: 'All With NO Code',
                                                   value:
                                                     '' in filteredTeamDict
                                                       ? filteredTeamDict[''].length
                                                       : 0,
                                                 });

                                                 const team = filteredTeamDict[''];
                                                 const index = selectedCodesArray.indexOf(
                                                   'noCodeLabel',
                                                 );
                                                 const color = COLORS[index % COLORS.length];
                                                 const members = (team || []).map(member => ({
                                                   name: `${member.firstName} ${member.lastName}`,
                                                   role: member.role,
                                                   id: member._id,
                                                 }));

                                                 structuredTeamTableData.push({
                                                   team: 'noCodeLabel',
                                                   color,
                                                   members,
                                                 });
                                               }
                                             } else {
                                               selectedCodes.forEach(code => {
                                                 const val =
                                                   code.value in filteredTeamDict
                                                     ? filteredTeamDict[code.value].length
                                                     : 0;
                                                 if (val > 0)
                                                   chartData.push({ name: code.label, value: val });

                                                 const team = filteredTeamDict[code.value];
                                                 const index = selectedCodesArray.indexOf(
                                                   code.value,
                                                 );
                                                 const color = COLORS[index % COLORS.length];

                                                 if (team !== undefined) {
                                                   const members = team.map(member => ({
                                                     name: `${member.firstName} ${member.lastName}`,
                                                     role: member.role,
                                                     id: member._id,
                                                   }));
                                                   structuredTeamTableData.push({
                                                     team: code.value,
                                                     color,
                                                     members,
                                                   });
                                                 }
                                               });
                                             }

                                             if (selectedExtraMembersArray.length > 0) {
                                               const color =
                                                 COLORS[selectedCodesArray.length % COLORS.length];
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
                                               if (members.length > 0)
                                                 chartData.push({
                                                   name: 'Extra Members',
                                                   value: members.length,
                                                 });
                                               structuredTeamTableData.push({
                                                 team: 'Extra Members',
                                                 color,
                                                 members,
                                               });
                                             }

                                             const temptotal = chartData.reduce(
                                               (acc, entry) => acc + entry.value,
                                               0,
                                             );

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

                                         const refreshCurrentTab = async () => {
                                           const { activeTab } = state;
                                           setState(prev => ({ ...prev, refreshing: true }));

                                           try {
                                             const weekIndex = navItems.indexOf(activeTab);
                                             const response = await axios.get(
                                               ENDPOINTS.WEEKLY_SUMMARIES_REPORT(),
                                               {
                                                 params: {
                                                   week: weekIndex,
                                                   forceRefresh: true,
                                                   _ts: Date.now(),
                                                 },
                                                 headers: {
                                                   'Cache-Control': 'no-cache',
                                                   Pragma: 'no-cache',
                                                 },
                                               },
                                             );

                                             if (response.status === 200) {
                                               let summariesCopy = [...response.data];
                                               summariesCopy = alphabetize(summariesCopy);

                                               summariesCopy = summariesCopy.map(summary => {
                                                 const promisedHoursByWeek = weekDates.map(
                                                   weekDate =>
                                                     getPromisedHours(
                                                       weekDate.toDate,
                                                       summary.weeklycommittedHoursHistory || [],
                                                     ),
                                                 );
                                                 const filterColor = summary.filterColor || null;
                                                 return {
                                                   ...summary,
                                                   promisedHoursByWeek,
                                                   filterColor,
                                                 };
                                               });

                                               setState(prevState => ({
                                                 ...prevState,
                                                 refreshing: false,
                                                 summaries: summariesCopy,
                                                 filteredSummaries: summariesCopy,
                                                 badges: props.allBadgeData || prevState.badges,
                                                 summariesByTab: {
                                                   ...prevState.summariesByTab,
                                                   [activeTab]: summariesCopy,
                                                 },
                                               }));
                                             }
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
                                             tabsLoading: { ...prevState.tabsLoading, [tab]: true },
                                           }));

                                           sessionStorage.setItem('tabSelection', tab);

                                           const weekIndex = navItems.indexOf(tab);
                                           const shouldForceFetch = tab === 'Last Week';

                                           if (
                                             !shouldForceFetch &&
                                             state.summariesByTab[tab] &&
                                             state.summariesByTab[tab].length > 0
                                           ) {
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
                                             return;
                                           }

                                           props
                                             .getWeeklySummariesReport(weekIndex)
                                             .then(res => {
                                               if (res && res.data) {
                                                 let summariesCopy = [...res.data];
                                                 summariesCopy = alphabetize(summariesCopy);
                                                 summariesCopy = summariesCopy.map(summary => {
                                                   const promisedHoursByWeek = weekDates.map(
                                                     weekDate =>
                                                       getPromisedHours(
                                                         weekDate.toDate,
                                                         summary.weeklycommittedHoursHistory || [],
                                                       ),
                                                   );
                                                   const filterColor = summary.filterColor || null;
                                                   return {
                                                     ...summary,
                                                     promisedHoursByWeek,
                                                     filterColor,
                                                   };
                                                 });

                                                 setState(prevState => ({
                                                   ...prevState,
                                                   summaries: summariesCopy,
                                                   filteredSummaries: summariesCopy,
                                                   badges: props.allBadgeData || prevState.badges,
                                                   loadedTabs: [
                                                     ...new Set([...prevState.loadedTabs, tab]),
                                                   ],
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
                                         };

                                         const handleSelectCodeChange = event => {
                                           setState(prev => {
                                             const selectedValues = event.map(e => e.value);

                                             const reorderedTeamCodes = [
                                               ...prev.teamCodes.filter(code =>
                                                 selectedValues.includes(code.value),
                                               ),
                                               ...prev.teamCodes.filter(
                                                 code => !selectedValues.includes(code.value),
                                               ),
                                             ];

                                             return {
                                               ...prev,
                                               selectedCodes: event,
                                               teamCodes: reorderedTeamCodes,
                                             };
                                           });

                                           if (currentAppliedFilter && event.length === 0) {
                                             setCurrentAppliedFilter(null);
                                           }
                                         };

                                         const handleSelectColorChange = event => {
                                           setState(prevState => ({
                                             ...prevState,
                                             selectedColors: event,
                                           }));
                                         };

                                         const handleSelectExtraMembersChange = event => {
                                           setState(prev => ({
                                             ...prev,
                                             selectedExtraMembers: event,
                                           }));
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

                                         const handleSpecialColorToggleChange = (
                                           color,
                                           isEnabled,
                                         ) => {
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
                                             const updatedSummaries = prevState.summaries.map(
                                               summary =>
                                                 summary._id === userId
                                                   ? { ...summary, filterColor: color }
                                                   : summary,
                                             );

                                             return {
                                               ...prevState,
                                               summaries: updatedSummaries,
                                               summariesByTab: {
                                                 ...prevState.summariesByTab,
                                                 [prevState.activeTab]: updatedSummaries,
                                               },
                                             };
                                           });
                                         };

                                         const handleReplaceCode = e => {
                                           e.persist();
                                           setState(prevState => ({
                                             ...prevState,
                                             replaceCode: e.target?.value,
                                           }));
                                         };

                                         const handleOpenSaveFilterModal = () => {
                                           if (!currentAppliedFilter) {
                                             setState(prevState => ({
                                               ...prevState,
                                               saveFilterModalOpen: true,
                                             }));
                                             return;
                                           }
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

                                         const handleSaveFilter = async filterName => {
                                           const filterConfig = {
                                             selectedCodes: state.selectedCodes.map(
                                               code => code.value,
                                             ),
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
                                             props.getSavedFilters();
                                           }
                                         };

                                         const handleUpdateFilter = async filterName => {
                                           if (!currentAppliedFilter) return;

                                           const filterConfig = {
                                             selectedCodes: state.selectedCodes.map(
                                               code => code.value,
                                             ),
                                           };

                                           const result = await props.updateSavedFilter(
                                             currentAppliedFilter._id,
                                             {
                                               name: filterName,
                                               filterConfig,
                                             },
                                           );

                                           if (result.status === 200) {
                                             setShowModificationModal(false);
                                             setCurrentAppliedFilter(result.data);
                                             props.getSavedFilters();
                                           }
                                         };

                                         const handleApplyFilter = filter => {
                                           const validCodes = filter.filterConfig.selectedCodes
                                             .map(codeValue =>
                                               state.teamCodes.find(
                                                 currentCode => currentCode.value === codeValue,
                                               ),
                                             )
                                             .filter(Boolean);

                                           setState(prevState => ({
                                             ...prevState,
                                             selectedCodes: validCodes,
                                           }));
                                           setCurrentAppliedFilter(filter);
                                         };

                                         const handleDeleteFilter = async filterId => {
                                           const result = await props.deleteSavedFilter(filterId);
                                           if (result.status === 200) {
                                             if (
                                               currentAppliedFilter &&
                                               currentAppliedFilter._id === filterId
                                             )
                                               setCurrentAppliedFilter(null);
                                             props.getSavedFilters();
                                           }
                                         };

                                         const handleAllTeamCodeReplace = async () => {
                                           const newCode = (state.replaceCode ?? '').trim();

                                           // Validate
                                           if (!newCode || !fullCodeRegex.test(newCode)) {
                                             setState(prev => ({
                                               ...prev,
                                               replaceCodeError:
                                                 'Replace code must be 5 to 7 characters.',
                                             }));
                                             return;
                                           }

                                           const selectedCodes =
                                             state.selectedCodes
                                               ?.map(c => c.value)
                                               .filter(v => v !== '') || [];
                                           if (selectedCodes.length === 0) {
                                             setState(prev => ({
                                               ...prev,
                                               replaceCodeError:
                                                 'Select at least one team code to replace.',
                                             }));
                                             return;
                                           }

                                           try {
                                             setState(prev => ({
                                               ...prev,
                                               replaceCodeLoading: true,
                                               replaceCodeError: null,
                                             }));

                                             // ✅ Call backend to replace codes in bulk
                                             // NOTE: Replace this endpoint/payload to match your API
                                             await axios.put(ENDPOINTS.REPLACE_TEAM_CODES, {
                                               oldTeamCodes: selectedCodes,
                                               newTeamCode: newCode,
                                             });

                                             // ✅ Update local summaries optimistically
                                             setState(prev => {
                                               const updatedSummaries = prev.summaries.map(s => {
                                                 if (selectedCodes.includes(s.teamCode))
                                                   return { ...s, teamCode: newCode };
                                                 return s;
                                               });

                                               return {
                                                 ...prev,
                                                 summaries: updatedSummaries,
                                                 summariesByTab: {
                                                   ...prev.summariesByTab,
                                                   [prev.activeTab]: updatedSummaries,
                                                 },
                                                 replaceCodeLoading: false,
                                               };
                                             });

                                             // ✅ Update saved filters that reference old codes
                                             if (props.updateSavedFiltersForTeamCodeChange) {
                                               props.updateSavedFiltersForTeamCodeChange(
                                                 selectedCodes,
                                                 newCode,
                                               );
                                             }

                                             toast.success('Team codes replaced.');
                                           } catch (err) {
                                             setState(prev => ({
                                               ...prev,
                                               replaceCodeLoading: false,
                                               replaceCodeError: 'Failed to replace team codes.',
                                             }));
                                           }
                                         };

                                         // Update a single user's team code (called from FormattedReport)
                                         const handleTeamCodeChange = async (
                                           userId,
                                           newTeamCode,
                                         ) => {
                                           const trimmedCode = (newTeamCode ?? '').trim();

                                           // Allow clearing code (empty), but validate non-empty codes
                                           if (trimmedCode && !fullCodeRegex.test(trimmedCode)) {
                                             toast.error('Team code must be 5 to 7 characters.');
                                             return;
                                           }

                                           try {
                                             // Optional: show per-user loading if you have it. Otherwise just do optimistic UI.
                                             setState(prev => ({
                                               ...prev,
                                               // clear any previous errors
                                               replaceCodeError: null,
                                             }));

                                             // ✅ Call backend to update user's team code
                                             // NOTE: Replace this endpoint if your project uses a different one
                                             await axios.put(
                                               ENDPOINTS.UPDATE_USER_TEAM_CODE(userId),
                                               { teamCode: trimmedCode },
                                             );

                                             // ✅ Update local summaries (so UI updates immediately)
                                             setState(prev => {
                                               const updatedSummaries = prev.summaries.map(s =>
                                                 s._id === userId
                                                   ? { ...s, teamCode: trimmedCode }
                                                   : s,
                                               );

                                               const updatedByTab = {
                                                 ...prev.summariesByTab,
                                                 [prev.activeTab]: updatedSummaries,
                                               };

                                               return {
                                                 ...prev,
                                                 summaries: updatedSummaries,
                                                 summariesByTab: updatedByTab,
                                               };
                                             });

                                             // ✅ Keep saved filters consistent (if you use these actions)
                                             // (We need the old code to update saved filters correctly)
                                             const oldTeamCode =
                                               state.summaries.find(s => s._id === userId)
                                                 ?.teamCode ?? '';

                                             if (
                                               props.updateSavedFiltersForIndividualTeamCodeChange
                                             ) {
                                               props.updateSavedFiltersForIndividualTeamCodeChange(
                                                 oldTeamCode,
                                                 trimmedCode,
                                                 userId,
                                               );
                                             }
                                           } catch (err) {
                                             toast.error('Failed to update team code.');
                                           }
                                         };

                                         const applyFilter = selectedFilter => {
                                           const filter = selectedFilter.filterData;

                                           const selectedCodesChoice = state.teamCodes.filter(
                                             code => filter.selectedCodes.has(code.value),
                                           );
                                           const selectedColorsChoice = state.colorOptions.filter(
                                             color => filter.selectedColors.has(color.value),
                                           );

                                           const selectedExtraMembersChoice = state.summaries
                                             .filter(summary =>
                                               filter.selectedExtraMembers.has(summary._id),
                                             )
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
                                         };

                                         // Setup effect hooks for initial data load
                                         useEffect(() => {
                                           let isMounted = true;
                                           window._isMounted = isMounted;

                                           createIntialSummaries().then(() => {
                                             if (!window._isMounted) return;
                                             refreshCurrentTab();
                                           });

                                           return () => {
                                             isMounted = false;
                                             window._isMounted = false;
                                             sessionStorage.removeItem('tabSelection');
                                           };
                                           // eslint-disable-next-line react-hooks/exhaustive-deps
                                         }, []);

                                         useEffect(() => {
                                           if (state.loading !== loading) {
                                             setState(prev => ({ ...prev, loading }));
                                           }
                                         }, [loading, state.loading]);

                                         useEffect(() => {
                                           if (state.summaries && state.summaries.length > 0) {
                                             filterWeeklySummaries();
                                           }
                                           // eslint-disable-next-line react-hooks/exhaustive-deps
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
                                                 bioEditPermission: props.hasPermission(
                                                   'putUserProfileImportantInfo',
                                                 ),
                                                 codeEditPermission:
                                                   props.hasPermission('editTeamCode') ||
                                                   props.auth?.user?.role === 'Owner' ||
                                                   props.auth?.user?.role === 'Administrator',
                                                 canEditSummaryCount: props.hasPermission(
                                                   'editSummaryHoursCount',
                                                 ),
                                                 canSeeBioHighlight: props.hasPermission(
                                                   'highlightEligibleBios',
                                                 ),
                                                 hasSeeBadgePermission: props.hasPermission(
                                                   'seeBadges',
                                                 ),
                                               }));
                                             } catch (error) {
                                               // eslint-disable-next-line no-console
                                               console.error(
                                                 'Failed to fetch badges or permissions',
                                                 error,
                                               );
                                             }
                                           };

                                           fetchInitialPermissions();
                                           props.getSavedFilters();
                                           // eslint-disable-next-line react-hooks/exhaustive-deps
                                         }, []);

                                         const { error, authEmailWeeklySummaryRecipient } = props;
                                         const authorizedUser1 = 'jae@onecommunityglobal.org';
                                         const authorizedUser2 = 'sucheta_mu@test.com';

                                         if (error) {
                                           return (
                                             <Container
                                               className={`container-wsr-wrapper ${
                                                 darkMode ? 'bg-oxford-blue' : ''
                                               }`}
                                             >
                                               <Row
                                                 className="align-self-center pt-2"
                                                 data-testid="error"
                                                 style={{ width: '30%', margin: '0 auto' }}
                                               >
                                                 <Col>
                                                   <Alert color="danger">
                                                     Error! {error.message}
                                                   </Alert>
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
                                               darkMode
                                                 ? 'bg-oxford-blue text-light'
                                                 : 'bg--white-smoke'
                                             }`}
                                           >
                                             {passwordInputModalToggle()}
                                             {popUpElements()}

                                             {/* Single modal instance for both create/update modes */}
                                             <SaveFilterModal
                                               isOpen={
                                                 state.saveFilterModalOpen || showModificationModal
                                               }
                                               onClose={
                                                 showModificationModal
                                                   ? handleCloseModificationModal
                                                   : handleCloseSaveFilterModal
                                               }
                                               onSave={handleSaveFilter}
                                               onUpdate={
                                                 showModificationModal
                                                   ? handleUpdateFilter
                                                   : undefined
                                               }
                                               selectedCodes={state.selectedCodes}
                                               darkMode={darkMode}
                                               existingFilterNames={props.savedFilters.map(
                                                 filter => filter.name,
                                               )}
                                               currentFilter={
                                                 showModificationModal
                                                   ? currentAppliedFilter
                                                   : undefined
                                               }
                                               isModification={showModificationModal}
                                             />

                                             <Row className={styles['mx-max-sm-0']}>
                                               <Col lg={{ size: 10, offset: 1 }}>
                                                 <h3 className="mt-3 mb-5">
                                                   <div className="d-flex align-items-center">
                                                     <span className="mr-2">
                                                       Weekly Summaries Reports page
                                                     </span>
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
                                                   {(authEmailWeeklySummaryRecipient ===
                                                     authorizedUser1 ||
                                                     authEmailWeeklySummaryRecipient ===
                                                       authorizedUser2) && (
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
                                                     style={darkMode ? boxStyleDark : boxStyle}
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
                                                       <DropdownMenu
                                                         right
                                                         className={`${
                                                           darkMode ? styles['darkMode'] : ''
                                                         }`}
                                                       >
                                                         <DropdownItem
                                                           className={`${
                                                             darkMode
                                                               ? styles.filterItemDarkMode
                                                               : ''
                                                           }`}
                                                           onClick={() =>
                                                             setCreateFilterModalOpen(true)
                                                           }
                                                         >
                                                           Create New Filter
                                                         </DropdownItem>
                                                         <DropdownItem
                                                           className={`${
                                                             darkMode
                                                               ? styles.filterItemDarkMode
                                                               : ''
                                                           }`}
                                                           onClick={() =>
                                                             setUpdateFilterModalOpen(true)
                                                           }
                                                         >
                                                           Update/Delete Filter
                                                         </DropdownItem>
                                                       </DropdownMenu>
                                                     </ButtonDropdown>
                                                   )}

                                                   <SelectFilterModal
                                                     isOpen={selectFilterModalOpen}
                                                     toggle={toggleSelectFilterModal}
                                                     filters={state.filterChoices}
                                                     applyFilter={applyFilter}
                                                     memberDict={state.memberDict}
                                                     darkMode={darkMode}
                                                   />

                                                   {permissionState.canManageFilter && (
                                                     <UpdateFilterModal
                                                       isOpen={updateFilterModalOpen}
                                                       toggle={toggleUpdateFilterModal}
                                                       filters={state.filterChoices}
                                                       darkMode={darkMode}
                                                       hasPermissionToFilter={hasPermissionToFilter}
                                                       canSeeBioHighlight={
                                                         permissionState.canSeeBioHighlight
                                                       }
                                                       refetchFilters={fetchFilters}
                                                       teamCodes={state.teamCodes}
                                                       colorOptions={state.colorOptions}
                                                       tableData={state.tableData}
                                                       summaries={state.summaries}
                                                       teamCodeWarningUsers={
                                                         state.teamCodeWarningUsers
                                                       }
                                                       memberDict={state.memberDict}
                                                     />
                                                   )}

                                                   {permissionState.canManageFilter && (
                                                     <CreateFilterModal
                                                       isOpen={createFilterModalOpen}
                                                       toggle={toggleCreateFilterModal}
                                                       initialState={{
                                                         filterName: '',
                                                         selectedCodes: state.selectedCodes,
                                                         selectedColors: state.selectedColors,
                                                         selectedExtraMembers:
                                                           state.selectedExtraMembers,
                                                         selectedTrophies: state.selectedTrophies,
                                                         selectedSpecialColors:
                                                           state.selectedSpecialColors,
                                                         selectedBioStatus: state.selectedBioStatus,
                                                         selectedOverTime: state.selectedOverTime,
                                                         selectedCodesInvalid: [],
                                                         selectedColorsInvalid: [],
                                                         selectedExtraMembersInvalid: [],
                                                         membersFromUnselectedTeam:
                                                           state.membersFromUnselectedTeam,
                                                       }}
                                                       darkMode={darkMode}
                                                       hasPermissionToFilter={hasPermissionToFilter}
                                                       canSeeBioHighlight={
                                                         permissionState.canSeeBioHighlight
                                                       }
                                                       filters={state.filterChoices}
                                                       refetchFilters={fetchFilters}
                                                       teamCodes={state.teamCodes}
                                                       colorOptions={state.colorOptions}
                                                       tableData={state.tableData}
                                                       summaries={state.summaries}
                                                       teamCodeWarningUsers={
                                                         state.teamCodeWarningUsers
                                                       }
                                                     />
                                                   )}
                                                 </div>
                                               </Col>
                                             </Row>

                                             <Row className={styles['mx-max-sm-0']}>
                                               <Col
                                                 lg={{ size: 5, offset: 1 }}
                                                 md={{ size: 6 }}
                                                 xs={{ size: 12 }}
                                               >
                                                 <div
                                                   className={`${styles.filterContainerTeamcode}`}
                                                 >
                                                   <div>Select Team Code</div>
                                                   <div className={`${styles.filterStyle}`}>
                                                     <span>Show Chart</span>
                                                     <div
                                                       className={`${styles.switchToggleControl}`}
                                                     >
                                                       <input
                                                         type="checkbox"
                                                         className={`${styles.switchToggle}`}
                                                         id="chart-status-toggle"
                                                         onChange={handleChartStatusToggleChange}
                                                       />
                                                       <label
                                                         className={`${styles.switchToggleLabel}`}
                                                         htmlFor="chart-status-toggle"
                                                       >
                                                         <span
                                                           className={`${styles.switchToggleInner}`}
                                                         />
                                                         <span
                                                           className={`${styles.switchToggleSwitch}`}
                                                         />
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
                                                       <ReactTooltip
                                                         id="teamCodeWarningTooltip"
                                                         place="top"
                                                         effect="solid"
                                                       >
                                                         {state.teamCodeWarningUsers.length} users
                                                         have mismatched team codes!
                                                       </ReactTooltip>
                                                     </>
                                                   )}

                                                   <Select
                                                     {...commonMultiSelectProps}
                                                     options={state.teamCodes.map(item => {
                                                       const [code, count] = item.label.split(' (');
                                                       return {
                                                         ...item,
                                                         label: `${code.padEnd(10, ' ')} (${count}`,
                                                       };
                                                     })}
                                                     value={state.selectedCodes}
                                                     onChange={handleSelectCodeChange}
                                                     placeholder="Search and select team codes..."
                                                     styles={getMultiSelectStyles({
                                                       darkMode,
                                                       warning:
                                                         state.teamCodeWarningUsers.length > 0,
                                                     })}
                                                   />

                                                   {state.selectedCodes.length > 0 &&
                                                     hasPermissionToFilter && (
                                                       <div
                                                         className={styles['filter-save-buttons']}
                                                       >
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
                                                           onClick={() =>
                                                             handleSelectCodeChange([])
                                                           }
                                                           title="Clear selection"
                                                           aria-label="Clear selection"
                                                         >
                                                           <i className="fa fa-times" />
                                                         </button>
                                                       </div>
                                                     )}
                                                 </div>

                                                 {props.savedFilters &&
                                                   props.savedFilters.length > 0 && (
                                                     <div
                                                       style={{
                                                         display: 'flex',
                                                         flexWrap: 'wrap',
                                                         gap: '5px',
                                                         alignItems: 'center',
                                                       }}
                                                       className="my-3"
                                                     >
                                                       {props.savedFilters.map(filter => (
                                                         <div
                                                           key={filter._id}
                                                           className={`${
                                                             styles['saved-filter-button']
                                                           } ${
                                                             darkMode ? styles['dark-mode'] : ''
                                                           } ${
                                                             currentAppliedFilter &&
                                                             currentAppliedFilter._id === filter._id
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
                                                                 currentAppliedFilter &&
                                                                 currentAppliedFilter._id ===
                                                                   filter._id
                                                                   ? 'bold'
                                                                   : 'normal',
                                                             }}
                                                             onClick={() =>
                                                               handleApplyFilter(filter)
                                                             }
                                                             title={`Apply filter: ${filter.name}`}
                                                           >
                                                             {filter.name}
                                                           </button>
                                                           <button
                                                             type="button"
                                                             className={
                                                               styles['saved-filter-delete-btn']
                                                             }
                                                             onClick={() =>
                                                               handleDeleteFilter(filter._id)
                                                             }
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

                                               <Col
                                                 lg={{ size: 5 }}
                                                 md={{ size: 6 }}
                                                 xs={{ size: 12 }}
                                               >
                                                 <div>Select Color</div>
                                                 <Select
                                                   {...commonMultiSelectProps}
                                                   options={state.colorOptions}
                                                   value={state.selectedColors}
                                                   onChange={handleSelectColorChange}
                                                   placeholder="Select color filters..."
                                                   styles={getMultiSelectStyles({ darkMode })}
                                                 />

                                                 <WeeklySummariesToggleFilter
                                                   state={state}
                                                   setState={setState}
                                                   hasPermissionToFilter={hasPermissionToFilter}
                                                   editable
                                                   formId="report"
                                                   handleOverHoursToggleChange={
                                                     handleOverHoursToggleChange
                                                   }
                                                   handleBioStatusToggleChange={
                                                     handleBioStatusToggleChange
                                                   }
                                                   handleTrophyToggleChange={
                                                     handleTrophyToggleChange
                                                   }
                                                   handleSpecialColorToggleChange={
                                                     handleSpecialColorToggleChange
                                                   }
                                                 />
                                               </Col>
                                             </Row>

                                             <Row className={styles['mx-max-sm-0']}>
                                               <Col
                                                 lg={{ size: 5, offset: 1 }}
                                                 md={{ size: 6 }}
                                                 xs={{ size: 12 }}
                                               >
                                                 <div>Select Extra Members</div>
                                                 <MultiSelect
                                                   className={`${styles.extraMembersSelect} ${
                                                     darkMode ? styles.extraMembersDark : ''
                                                   }`}
                                                   options={state.membersFromUnselectedTeam}
                                                   value={state.selectedExtraMembers}
                                                   onChange={handleSelectExtraMembersChange}
                                                 />
                                               </Col>

                                               <Col
                                                 lg={{ size: 5 }}
                                                 md={{ size: 6 }}
                                                 xs={{ size: 12 }}
                                               >
                                                 <div>Logged Hours Range</div>
                                                 <Select
                                                   {...commonMultiSelectProps}
                                                   placeholder="Select range..."
                                                   options={[
                                                     { value: '=0', label: '=0' },
                                                     { value: '0-10', label: '0-10' },
                                                     { value: '10-20', label: '10-20' },
                                                     { value: '20-40', label: '20-40' },
                                                     { value: '>40', label: '>40' },
                                                   ]}
                                                   value={state.selectedLoggedHoursRange}
                                                   onChange={selectedOption =>
                                                     setState(prev => ({
                                                       ...prev,
                                                       selectedLoggedHoursRange: selectedOption,
                                                     }))
                                                   }
                                                   styles={getMultiSelectStyles({ darkMode })}
                                                 />
                                               </Col>
                                             </Row>

                                             {state.chartShow && (
                                               <Row className={styles['mx-max-sm-0']}>
                                                 <Col
                                                   lg={{ size: 6, offset: 1 }}
                                                   md={{ size: 12 }}
                                                   xs={{ size: 12 }}
                                                 >
                                                   <SelectTeamPieChart
                                                     chartData={state.chartData}
                                                     COLORS={state.COLORS}
                                                     total={state.total}
                                                     style={{ width: '100%' }}
                                                   />
                                                 </Col>
                                                 <Col
                                                   lg={{ size: 4 }}
                                                   md={{ size: 12 }}
                                                   xs={{ size: 12 }}
                                                   style={{ width: '100%' }}
                                                 >
                                                   <TeamChart
                                                     teamData={state.structuredTableData}
                                                     darkMode={darkMode}
                                                   />
                                                 </Col>
                                               </Row>
                                             )}

                                             {permissionState.codeEditPermission &&
                                               state.selectedCodes &&
                                               state.selectedCodes.length > 0 && (
                                                 <Row className={styles['mx-max-sm-0']}>
                                                   <Col
                                                     lg={{ size: 5, offset: 1 }}
                                                     md={{ size: 6 }}
                                                     xs={{ size: 12 }}
                                                   >
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
                                                       <Spinner
                                                         className="mt-3 mr-1"
                                                         color="primary"
                                                       />
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
                                                       <Alert
                                                         className={`${styles.codeAlert}`}
                                                         color="danger"
                                                       >
                                                         {state.replaceCodeError}
                                                       </Alert>
                                                     )}
                                                   </Col>
                                                 </Row>
                                               )}
                                             <Row className={styles['mx-max-sm-0']}>
                                               <Col lg={{ size: 10, offset: 1 }} xs={{ size: 12 }}>
                                                 <Nav className={styles['table-container']} tabs>
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
                                                   className={`p-4 ${
                                                     darkMode ? 'bg-yinmn-blue border-0' : ''
                                                   }`}
                                                 >
                                                   {navItems.map((item, index) => (
                                                     <WeeklySummariesReportTab
                                                       tabId={item}
                                                       key={item}
                                                       hidden={item !== state.activeTab}
                                                     >
                                                       {state.tabsLoading[item] ? (
                                                         <Row
                                                           className={`text-center py-4 ${styles['mx-max-sm-0']}`}
                                                         >
                                                           <Col>
                                                             <Spinner color="primary" />
                                                             <p>Loading data...</p>
                                                           </Col>
                                                         </Row>
                                                       ) : (
                                                         <>
                                                           <Row className={styles['mx-max-sm-0']}>
                                                             <Col sm="12" md="6" className="mb-2">
                                                               From{' '}
                                                               <b>{weekDates[index].fromDate}</b> to{' '}
                                                               <b>{weekDates[index].toDate}</b>
                                                             </Col>
                                                             <Col
                                                               sm="12"
                                                               md="6"
                                                               style={{
                                                                 display: 'flex',
                                                                 justifyContent: 'flex-end',
                                                                 gap: '8px',
                                                               }}
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
                                                                     type="button"
                                                                     className="mx-1"
                                                                     style={
                                                                       darkMode
                                                                         ? boxStyleDark
                                                                         : boxStyle
                                                                     }
                                                                     onClick={() =>
                                                                       setState(prev => ({
                                                                         ...prev,
                                                                         loadBadges: !state.loadBadges,
                                                                       }))
                                                                     }
                                                                   >
                                                                     {state.loadBadges
                                                                       ? 'Hide Badges'
                                                                       : 'Load Badges'}
                                                                   </Button>
                                                                   <Button
                                                                     className="mr-2"
                                                                     style={
                                                                       darkMode
                                                                         ? boxStyleDark
                                                                         : boxStyle
                                                                     }
                                                                     onClick={() =>
                                                                       setState(prev => ({
                                                                         ...prev,
                                                                         loadTrophies: !state.loadTrophies,
                                                                       }))
                                                                     }
                                                                   >
                                                                     {state.loadTrophies
                                                                       ? 'Hide Trophies'
                                                                       : 'Load Trophies'}
                                                                   </Button>
                                                                 </>
                                                               )}
                                                               <Button
                                                                 className="mr-2"
                                                                 style={
                                                                   darkMode
                                                                     ? boxStyleDark
                                                                     : boxStyle
                                                                 }
                                                                 onClick={refreshCurrentTab}
                                                                 disabled={state.refreshing}
                                                               >
                                                                 {state.refreshing ? (
                                                                   <Spinner size="sm" />
                                                                 ) : null}{' '}
                                                                 Refresh
                                                               </Button>
                                                             </Col>
                                                           </Row>
                                                           {state.filteredSummaries &&
                                                           state.filteredSummaries.length > 0 ? (
                                                             <>
                                                               <Row>
                                                                 <Col>
                                                                   <b>Total Team Members:</b>{' '}
                                                                   {state.filteredSummaries.length}
                                                                 </Col>
                                                               </Row>
                                                               <Row>
                                                                 <Col>
                                                                   <FormattedReport
                                                                     summaries={
                                                                       state.filteredSummaries
                                                                     }
                                                                     weekIndex={index}
                                                                     bioCanEdit={
                                                                       permissionState.bioEditPermission
                                                                     }
                                                                     canEditSummaryCount={
                                                                       permissionState.canEditSummaryCount
                                                                     }
                                                                     allRoleInfo={state.allRoleInfo}
                                                                     badges={state.badges}
                                                                     loadBadges={state.loadBadges}
                                                                     canEditTeamCode={
                                                                       permissionState.codeEditPermission
                                                                     }
                                                                     auth={state.auth}
                                                                     canSeeBioHighlight={
                                                                       permissionState.canSeeBioHighlight
                                                                     }
                                                                     darkMode={darkMode}
                                                                     handleTeamCodeChange={
                                                                       handleTeamCodeChange
                                                                     }
                                                                     loadTrophies={
                                                                       state.loadTrophies
                                                                     }
                                                                     getWeeklySummariesReport={
                                                                       getWeeklySummariesReport
                                                                     }
                                                                     handleSpecialColorDotClick={
                                                                       handleSpecialColorDotClick
                                                                     }
                                                                   />
                                                                 </Col>
                                                               </Row>
                                                             </>
                                                           ) : (
                                                             <Row>
                                                               <Col>
                                                                 <Alert color="info">
                                                                   No data available for this tab.
                                                                 </Alert>
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
  savedFilters: state.savedFilters?.savedFilters || [],
  savedFiltersLoading: state.savedFilters?.loading || false,
  savedFiltersError: state.savedFilters?.error || null,
  auth: state?.auth || {},
  darkMode: state?.theme?.darkMode || false,
  authEmailWeeklySummaryRecipient: state?.auth?.user?.email || '',
});

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
});

function WeeklySummariesReportTab({ tabId, hidden, children }) {
  return <TabPane tabId={tabId}>{!hidden && children}</TabPane>;
}

WeeklySummariesReportTab.propTypes = {
  tabId: PropTypes.string.isRequired,
  hidden: PropTypes.bool,
  children: PropTypes.node,
};

WeeklySummariesReportTab.defaultProps = {
  hidden: false,
  children: null,
};

export default connect(mapStateToProps, mapDispatchToProps)(WeeklySummariesReport);
