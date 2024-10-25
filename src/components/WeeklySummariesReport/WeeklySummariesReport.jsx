/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-shadow */
/* eslint-disable react/require-default-props */
/* eslint-disable react/forbid-prop-types */
import { useEffect } from 'react';
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
} from 'reactstrap';
import ReactTooltip from 'react-tooltip';
import { MultiSelect } from 'react-multi-select-component';
import './WeeklySummariesReport.css';
import moment from 'moment';
import 'moment-timezone';
import { boxStyle, boxStyleDark } from 'styles';
import EditableInfoModal from 'components/UserProfile/EditableModal/EditableInfoModal';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';
import { getAllUserTeams } from '../../actions/allTeamsAction';
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
import SelectTeamPieChart from './SelectTeamPieChart';

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
  chartShow: false,
  replaceCode: '',
  replaceCodeError: null,
  replaceCodeLoading: false,
  allRoleInfo: [],
};

const intialPermissionState = {
  bioEditPermission: false,
  canEditSummaryCount: false,
  codeEditPermission: false,
  canSeeBioHighlight: false,
};
/* eslint-disable react/function-component-definition */
const WeeklySummariesReport = props => {
  const { loading, infoCollections, getInfoCollections } = props;

  const weekDates = getWeekDates();
  const [state, setState] = useState(initialState);
  const [permissionState, setPermissionState] = useState(intialPermissionState);
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
  const createIntialSummaries = async () => {
    try {
      const {
        loading,
        allBadgeData,
        getWeeklySummariesReport,
        fetchAllBadges,
        hasPermission,
        auth,
      } = props;
      // 1. fetch report
      const res = await getWeeklySummariesReport();
      // eslint-disable-next-line react/destructuring-assignment
      const summaries = res?.data ?? props.summaries;
      const badgeStatusCode = await fetchAllBadges();
      const canPutUserProfileImportantInfo = hasPermission('putUserProfileImportantInfo');
      setPermissionState(prev => ({
        ...prev,
        bioEditPermission: canPutUserProfileImportantInfo,
        canEditSummaryCount: canPutUserProfileImportantInfo,
        codeEditPermission: hasPermission('editTeamCode'),
        canSeeBioHighlight: hasPermission('highlightEligibleBios'),
      }));

      // 2. shallow copy and sort
      let summariesCopy = [...summaries];
      summariesCopy = alphabetize(summariesCopy);

      // 3. add new key of promised hours by week
      summariesCopy = summariesCopy.map(summary => {
        // append the promised hours starting from the latest week (this week)
        const promisedHoursByWeek = weekDates.map(weekDate =>
          getPromisedHours(weekDate.toDate, summary.weeklycommittedHoursHistory),
        );
        return { ...summary, promisedHoursByWeek };
      });

      const teamCodeGroup = {};
      const teamCodes = [];
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
      setState(prev => ({
        ...prev,
        loading,
        allRoleInfo: [],
        summaries: summariesCopy,
        activeTab:
          sessionStorage.getItem('tabSelection') === null
            ? navItems[1]
            : sessionStorage.getItem('tabSelection'),
        badges: allBadgeData,
        hasSeeBadgePermission: badgeStatusCode === 200,
        filteredSummaries: summariesCopy,
        tableData: teamCodeGroup,
        colorOptions,
        COLORS,
        teamCodes,
        auth,
        chartData,
      }));
      return summariesCopy;
    } catch (error) {
      return null;
    }
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

  const toggleTab = tab => {
    const { activeTab } = state;
    if (activeTab !== tab) {
      setState(prev => ({
        ...prev,
        activeTab: tab,
      }));
      sessionStorage.setItem('tabSelection', tab);
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
        tableData,
        COLORS,
      } = state;
      const chartData = [];
      let temptotal = 0;
      const structuredTeamTableData = [];

      const selectedCodesArray = selectedCodes.map(e => e.value);
      const selectedColorsArray = selectedColors.map(e => e.value);

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

        return (
          (selectedCodesArray.length === 0 || selectedCodesArray.includes(summary.teamCode)) &&
          (selectedColorsArray.length === 0 ||
            selectedColorsArray.includes(summary.weeklySummaryOption)) &&
          isOverHours &&
          isBio
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
        // console.log(Object.entries(teamCodeCounts), 'teamCodecounts');
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
      const { replaceCode } = state;
      setState(prevState => ({
        ...prevState,
        replaceCodeLoading: true,
      }));
      const boolean = fullCodeRegex.test(replaceCode);
      if (boolean) {
        const userIds = state.selectedCodes.flatMap(item => item._ids);
        const url = ENDPOINTS.USERS_ALLTEAMCODE_CHANGE;
        const payload = {
          userIds,
          replaceCode,
        };
        try {
          const data = await axios.patch(url, payload);
          const userObjs = userIds.reduce((acc, curr) => {
            acc[curr] = true;
            return acc;
          }, {});
          if (data?.data?.isUpdated) {
            handleTeamCodeChange('', replaceCode, userObjs);
            setState(prev => ({
              ...prev,
              replaceCode: '',
              replaceCodeError: null,
            }));
          } else {
            setState(prev => ({
              ...prev,
              replaceCode: '',
              replaceCodeError: 'Update failed Please try again with another code!',
            }));
          }
        } catch (err) {
          setState(prev => ({
            ...prev,
            replaceCode: '',
            replaceCodeError: err.toJSON().message,
          }));
        }
      } else {
        setState(prev => ({
          ...prev,
          replaceCodeError: 'NOT SAVED! The code must be between 5 and 7 characters long.',
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        replaceCode: '',
        replaceCodeError: 'Something went wrong please try again!',
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
  useEffect(() => {
    let isMounted = true; // Track whether the component is still mounted

    const fetchData = async () => {
      const summaryCopy = createIntialSummaries();
      if (summaryCopy && isMounted) {
        await intialInfoCollections(summaryCopy);
      }
    };

    fetchData(); // Call the async function

    return () => {
      isMounted = false; // Set to false when component unmounts
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
    filterWeeklySummaries();
  }, [state.selectedOverTime, state.selectedCodes, state.selectedBioStatus, state.selectedColors]);
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
        <Col lg={{ size: 5, offset: 1 }} md={{ size: 6 }} xs={{ size: 6 }}>
          <MultiSelect
            className="multi-select-filter text-dark"
            options={state.teamCodes}
            value={state.selectedCodes}
            onChange={e => {
              handleSelectCodeChange(e);
            }}
            labelledBy="Select"
          />
        </Col>
        <Col lg={{ size: 5 }} md={{ size: 6, offset: -1 }} xs={{ size: 6, offset: -1 }}>
          <MultiSelect
            className="multi-select-filter text-dark"
            options={state.colorOptions}
            value={state.selectedColors}
            onChange={e => {
              handleSelectColorChange(e);
            }}
          />
        </Col>
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
      <Row style={{ marginBottom: '10px' }}>
        <Col lg={{ size: 10, offset: 1 }} xs={{ size: 8, offset: 4 }}>
          <div className="filter-container">
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
              <div className="filter-style">
                <span>Filter by Over Hours {}</span>
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
      {permissionState.codeEditPermission && state.selectedCodes.length > 0 && (
        <Row style={{ marginBottom: '10px' }}>
          <Col lg={{ size: 5, offset: 1 }} xs={{ size: 5, offset: 1 }}>
            Replace With
            <Input
              type="string"
              placeholder="replace"
              value={state.replaceCode}
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
                    {permissionState.hasSeeBadgePermission && (
                      <Button
                        className="btn--dark-sea-green"
                        style={darkMode ? boxStyleDark : boxStyle}
                        onClick={() =>
                          setState(prev => ({ ...prev, loadBadges: !state.loadBadges }))
                        }
                      >
                        {state.loadBadges ? 'Hide Badges' : 'Load Badges'}
                      </Button>
                    )}
                    <Button
                      className="btn--dark-sea-green"
                      style={darkMode ? boxStyleDark : boxStyle}
                    >
                      Load Trophies
                    </Button>
                  </Col>
                </Row>
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
                    />
                  </Col>
                </Row>
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
  loading: state.weeklySummariesReport?.loading || null,
  summaries: state.weeklySummariesReport?.summaries,
  allBadgeData: state.badge?.allBadgeData,
  infoCollections: state.infoCollections?.infos,
  role: state?.auth?.user?.role,
  auth: state?.auth,
  darkMode: state?.theme?.darkMode,
  authEmailWeeklySummaryRecipient: state?.auth?.user?.email,
});

const mapDispatchToProps = dispatch => ({
  fetchAllBadges: () => dispatch(fetchAllBadges()),
  getWeeklySummariesReport: () => dispatch(getWeeklySummariesReport()),
  hasPermission: permission => dispatch(hasPermission(permission)),
  getInfoCollections: () => getInfoCollections(),
  getAllUserTeams: () => dispatch(getAllUserTeams()),
});

function WeeklySummariesReportTab({ tabId, hidden, children }) {
  return <TabPane tabId={tabId}>{!hidden && children}</TabPane>;
}

export default connect(mapStateToProps, mapDispatchToProps)(WeeklySummariesReport);
