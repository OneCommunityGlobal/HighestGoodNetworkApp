/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-shadow */
/* eslint-disable react/require-default-props */
/* eslint-disable react/forbid-prop-types */
import { Component } from 'react';
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
import moment from 'moment';
import { boxStyle, boxStyleDark } from 'styles';
import 'moment-timezone';
import axios from 'axios';
import cn from 'classnames';

import { ENDPOINTS } from 'utils/URL';
import EditableInfoModal from 'components/UserProfile/EditableModal/EditableInfoModal';
import { getAllUserTeams, getAllTeamCode } from '../../actions/allTeamsAction';
import TeamChart from './TeamChart';
import SkeletonLoading from '../common/SkeletonLoading';
import { getWeeklySummariesReport } from '../../actions/weeklySummariesReport';
import FormattedReport from './FormattedReport';
import GeneratePdfReport from './GeneratePdfReport';
import hasPermission from '../../utils/permissions';
import { getInfoCollections } from '../../actions/information';
import { fetchAllBadges } from '../../actions/badgeManagement';
import PasswordInputModal from './PasswordInputModal';
import WeeklySummaryRecipientsPopup from './WeeklySummaryRecepientsPopup';

import { showTrophyIcon } from '../../utils/anniversaryPermissions';
import SelectTeamPieChart from './SelectTeamPieChart';
import { setTeamCodes } from '../../actions/teamCodes';

import styles from './WeeklySummariesReport.module.scss';
import { SlideToggle } from './components';

const navItems = ['This Week', 'Last Week', 'Week Before Last', 'Three Weeks Ago'];
const fullCodeRegex = /^.{5,7}$/;
export class WeeklySummariesReport extends Component {
  weekDates = Array.from({ length: 4 }).map((_, index) => ({
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

  constructor(props) {
    super(props);

    this.state = {
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
      loadTrophies: false,
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
      // weeklyRecipientAuthPass: '',
      selectedSpecialColors: {
        purple: false,
        green: false,
        navy: false,
      },
    };
  }

  async componentDidMount() {
    const {
      loading,
      allBadgeData,
      authUser,
      infoCollections,
      getWeeklySummariesReport,
      fetchAllBadges,
      getInfoCollections,
      hasPermission,
      auth,
      setTeamCodes,
      getAllTeamCode,
    } = this.props;
    await getAllTeamCode();
    // 1. fetch report
    const res = await getWeeklySummariesReport();
    // eslint-disable-next-line react/destructuring-assignment
    const summaries = res?.data ?? this.props.summaries;
    const badgeStatusCode = await fetchAllBadges();
    this.canPutUserProfileImportantInfo = hasPermission('putUserProfileImportantInfo');
    this.canRequestBio = hasPermission('requestBio');
    this.canEditSummaryCount = this.canPutUserProfileImportantInfo;
    this.codeEditPermission =
      hasPermission('editTeamCode') ||
      auth.user.role === 'Owner' ||
      auth.user.role === 'Administrator';
    this.canSeeBioHighlight = hasPermission('highlightEligibleBios');

    const teamCodeGroup = {};
    const teamCodes = [];

    // 2. shallow copy and sort
    let summariesCopy = [...summaries];
    summariesCopy = this.alphabetize(summariesCopy);

    // 3. add new key of promised hours by week
    summariesCopy = summariesCopy.map(summary => {
      // append the promised hours starting from the latest week (this week)
      const promisedHoursByWeek = this.weekDates.map(weekDate =>
        this.getPromisedHours(weekDate.toDate, summary.weeklycommittedHoursHistory),
      );
      return { ...summary, promisedHoursByWeek };
    });

    /*
     * refactor logic of commentted codes above
     */
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
    this.setState({
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
      chartData,
      COLORS,
      colorOptions,
      teamCodes,
      auth,
    });

    await getInfoCollections();
    const role = authUser?.role;
    const roleInfoNames = this.getAllRoles(summariesCopy);
    const allRoleInfo = [];
    if (Array.isArray(infoCollections)) {
      infoCollections.forEach(info => {
        if (roleInfoNames?.includes(info.infoName)) {
          const visible =
            info.visibility === '0' ||
            (info.visibility === '1' && (role === 'Owner' || role === 'Administrator')) ||
            (info.visibility === '2' && role !== 'Volunteer');
          // eslint-disable-next-line no-param-reassign
          info.CanRead = visible;
          allRoleInfo.push(info);
        }
      });
    }
    this.setState({ allRoleInfo });
  }

  componentDidUpdate(preProps, preState) {
    const { loading } = this.props;
    if (loading !== preState.loading) {
      this.setState({ loading });
    }
  }

  componentWillUnmount() {
    sessionStorage.removeItem('tabSelection');
  }

  onSummaryRecepientsPopupClose = () => {
    this.setState({ summaryRecepientsPopupOpen: false });
  };

  setSummaryRecepientsPopup = val => {
    this.setState({ summaryRecepientsPopupOpen: val });
  };

  popUpElements = () => {
    return (
      <WeeklySummaryRecipientsPopup
        open={this.state.summaryRecepientsPopupOpen}
        onClose={this.onSummaryRecepientsPopupClose}
        summaries={this.props.summaries}
        password={this.state.weeklyRecipientAuthPass}
        authEmailWeeklySummaryRecipient={this.props.authEmailWeeklySummaryRecipient}
      />
    );
  };

  onpasswordModalClose = () => {
    this.setState({
      passwordModalOpen: false,
    });
  };

  checkForValidPwd = booleanVal => {
    this.setState({ isValidPwd: booleanVal });
  };

  passwordInputModalToggle = () => {
    return (
      <PasswordInputModal
        open={this.state.passwordModalOpen}
        onClose={this.onpasswordModalClose}
        checkForValidPwd={this.checkForValidPwd}
        isValidPwd={this.state.isValidPwd}
        setSummaryRecepientsPopup={this.setSummaryRecepientsPopup}
        setAuthpassword={this.setAuthpassword}
        authEmailWeeklySummaryRecipient={this.props.authEmailWeeklySummaryRecipient}
      />
    );
  };

  // Authorization for the weeklySummary Recipients is required once
  setAuthpassword = authPass => {
    this.setState({
      weeklyRecipientAuthPass: authPass,
    });
  };

  onClickRecepients = () => {
    if (this.state.weeklyRecipientAuthPass) {
      this.setState({
        summaryRecepientsPopupOpen: true,
      });
    } else {
      this.setState({
        passwordModalOpen: true,
      });
      this.checkForValidPwd(true);
    }
  };

  /**
   * Sort the summaries in alphabetixal order
   * @param {*} summaries
   * @returns
   */
  alphabetize = summaries => {
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
  getAllRoles = summaries => {
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
  getPromisedHours = (weekToDateX, weeklycommittedHoursHistory) => {
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

  toggleTab = tab => {
    const { activeTab } = this.state;
    if (activeTab !== tab) {
      this.setState({ activeTab: tab }, () => this.filterWeeklySummaries());
      sessionStorage.setItem('tabSelection', tab);
    }
  };

  filterWeeklySummaries = () => {
    const {
      selectedCodes,
      selectedColors,
      summaries,
      selectedOverTime,
      selectedBioStatus,
      selectedTrophies,
      activeTab,
      tableData,
      COLORS,
      selectedSpecialColors,
    } = this.state;
    const chartData = [];
    let temptotal = 0;
    const structuredTeamTableData = [];

    const selectedCodesArray = selectedCodes.map(e => e.value);
    const selectedColorsArray = selectedColors.map(e => e.value);

    const weekIndex = navItems.indexOf(activeTab);
    const activeFilterColors = Object.entries(selectedSpecialColors)
      .filter(([, isSelected]) => isSelected)
      .map(([color]) => color);

    const temp = summaries.filter(summary => {
      const { activeTab } = this.state;
      const hoursLogged = (summary.totalSeconds[navItems.indexOf(activeTab)] || 0) / 3600;

      const isMeetCriteria =
        summary.totalTangibleHrs > 80 && summary.daysInTeam > 60 && summary.bioPosted !== 'posted';

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

      // const matchesSelectedUsers = selectedUserIds.size === 0 || selectedUserIds.has(summary._id);
      const matchesSpecialColor =
        activeFilterColors.length === 0 || activeFilterColors.includes(summary.filterColor);

      return (
        (selectedCodesArray.length === 0 || selectedCodesArray.includes(summary.teamCode)) &&
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

    chartData.sort();
    temptotal = chartData.reduce((acc, entry) => acc + entry.value, 0);
    structuredTeamTableData.sort();
    this.setState({ total: temptotal });
    this.setState({ filteredSummaries: temp });
    this.setState({ chartData });
    this.setState({ structuredTableData: structuredTeamTableData });
  };

  handleSelectCodeChange = event => {
    this.setState({ selectedCodes: event }, () => this.filterWeeklySummaries());
  };

  handleSelectColorChange = event => {
    this.setState({ selectedColors: event }, () => this.filterWeeklySummaries());
  };

  handleOverHoursToggleChange = () => {
    this.setState(
      prevState => ({
        selectedOverTime: !prevState.selectedOverTime,
      }),
      () => {
        this.filterWeeklySummaries();
      },
    );
  };

  handleChartStatusToggleChange = () => {
    this.setState(prevState => ({
      chartShow: !prevState.chartShow,
    }));
  };

  handleBioStatusToggleChange = () => {
    this.setState(
      prevState => ({
        selectedBioStatus: !prevState.selectedBioStatus,
      }),
      () => {
        this.filterWeeklySummaries();
      },
    );
  };

  handleTrophyToggleChange = () => {
    this.setState(
      prevState => ({
        selectedTrophies: !prevState.selectedTrophies,
      }),
      () => {
        this.filterWeeklySummaries();
      },
    );
  };
  
  handleColorToggleChange = (color, state) => {
    this.setState(
      prevState => ({
        selectedSpecialColors: {
          ...prevState.selectedSpecialColors,
          [color]: state,
        },
      }),
      this.filterWeeklySummaries,
    );
  };
  
  handleSpecialColorDotClick = (userId, color) => {
    this.setState(prevState => {
      const updatedSummaries = prevState.summaries.map(summary => {
        // Update the summary if the userId matches (using summary._id)
        if (summary._id === userId) {
          return { ...summary, filterColor: color };
        }
        return summary;
      });
      return { summaries: updatedSummaries };
    }, this.filterWeeklySummaries);
  };

  handleTeamCodeChange = (oldTeamCode, newTeamCode, userIdObj) => {
    try {
      this.setState(prevState => {
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
        return { summaries, teamCodes, selectedCodes };
      });
    } catch (error) {
      // console.log(error);
    }
  };

  handleAllTeamCodeReplace = async () => {
    try {
      const { replaceCode } = this.state;
      this.setState({ replaceCodeLoading: true });
      const boolean = fullCodeRegex.test(replaceCode);
      if (boolean) {
        const userIds = this.state.selectedCodes.flatMap(item => item._ids);
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
            this.handleTeamCodeChange('', replaceCode, userObjs);

            await this.props.getAllTeamCode();

            const updatedSummaries = [...this.state.summaries];
            const teamCodeGroup = {};

            updatedSummaries.forEach(summary => {
              const code = summary.teamCode || 'noCodeLabel';
              if (teamCodeGroup[code]) {
                teamCodeGroup[code].push(summary);
              } else {
                teamCodeGroup[code] = [summary];
              }
            });

            const updatedTeamCodes = Object.keys(teamCodeGroup).map(code => ({
              value: code,
              label: `${code} (${teamCodeGroup[code].length})`,
              _ids: teamCodeGroup[code]?.map(item => item._id),
            }));

            this.props.setTeamCodes(updatedTeamCodes);
            this.setState({ replaceCode: '', replaceCodeError: null });
            this.filterWeeklySummaries();
          } else {
            this.setState({
              replaceCode: '',
              replaceCodeError: 'Update failed Please try again with another code!',
            });
          }
        } catch (err) {
          this.setState({ replaceCode: '', replaceCodeError: err.toJSON().message });
        }
      } else {
        this.setState({
          replaceCodeError: 'NOT SAVED! The code must be between 5 and 7 characters long.',
        });
      }
    } catch (error) {
      this.setState({
        replaceCode: '',
        replaceCodeError: 'Something went wrong please try again!',
      });
    } finally {
      this.setState({ replaceCodeLoading: false });
    }
  };

  render() {
    const { role, darkMode } = this.props;
    const {
      loading,
      activeTab,
      allRoleInfo,
      badges,
      loadBadges,
      loadTrophies,
      hasSeeBadgePermission,
      selectedCodes,
      selectedColors,
      filteredSummaries,
      colorOptions,
      teamCodes,
      structuredTableData,
      chartData,
      total,
      COLORS,
      auth,
      chartShow,
      replaceCode,
      replaceCodeError,
      replaceCodeLoading,
    } = this.state;
    const { error } = this.props;
    const hasPermissionToFilter = role === 'Owner' || role === 'Administrator';
    const { authEmailWeeklySummaryRecipient } = this.props;
    const authorizedUser1 = 'jae@onecommunityglobal.org';
    const authorizedUser2 = 'sucheta_mu@test.com'; // To test please include your email here

    if (error) {
      return (
        <Container className={cn(styles.containerWsrWrapper, darkMode ? 'bg-oxford-blue' : '')}>
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

    if (loading) {
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
        className={cn(
          styles.containerWsrWrapper,
          `py-3 mb-5 ${darkMode ? 'bg-oxford-blue text-light' : styles.bgWhiteSmoke}`,
        )}
      >
        {this.passwordInputModalToggle()}
        {this.popUpElements()}
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
              onClick={() => this.onClickRecepients()}
              style={darkMode ? boxStyleDark : boxStyle}
            >
              Weekly Summary Report Recipients
            </Button>
          </Row>
        )}
        <Row>
          <Col lg={{ size: 5, offset: 1 }} md={{ size: 6 }} xs={{ size: 6 }}>
            <div className={styles.filterContainerTeamcode}>
              <div>Select Team Code</div>
              <div className={styles.filterStyle}>
                <span>Show Chart</span>
                <SlideToggle
                  className={styles.slideToggle}
                  onChange={this.handleChartStatusToggleChange}
                />
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
              className={cn(styles.multiSelectFilter, 'text-dark')}
              options={teamCodes}
              value={selectedCodes}
              onChange={e => {
                this.handleSelectCodeChange(e);
              }}
              labelledBy="Select"
            />
          </Col>
          <Col lg={{ size: 5 }} md={{ size: 6, offset: -1 }} xs={{ size: 6, offset: -1 }}>
            <MultiSelect
              className={cn(styles.multiSelectFilter, 'text-dark')}
              options={colorOptions}
              value={selectedColors}
              onChange={e => {
                this.handleSelectColorChange(e);
              }}
            />
          </Col>
        </Row>
        {chartShow && (
          <Row>
            <Col lg={{ size: 6, offset: 1 }} md={{ size: 12 }} xs={{ size: 11 }}>
              <SelectTeamPieChart
                chartData={chartData}
                COLORS={COLORS}
                total={total}
                style={{ width: '100%' }}
              />
            </Col>
            <Col lg={{ size: 4 }} md={{ size: 12 }} xs={{ size: 11 }} style={{ width: '100%' }}>
              <TeamChart teamData={structuredTableData} darkMode={darkMode} />
            </Col>
          </Row>
        )}
        <Row style={{ marginBottom: '10px' }}>
          <Col lg={{ size: 10, offset: 1 }} xs={{ size: 8, offset: 4 }}>
            <div className={styles.filterContainer}>
              {hasPermissionToFilter && (
                <div className={cn(styles.filterStyle, styles.filterMarginRight)}>
                  <span>Filter by Special</span>
                  {['purple', 'green', 'navy'].map(color => (
                    <SlideToggle
                      key={`${color}-toggle`}
                      className={styles.slideToggle}
                      color={color}
                      onChange={this.handleColorToggleChange}
                    />
                  ))}
                </div>
              )}
              {(hasPermissionToFilter || this.canSeeBioHighlight) && (
                <div className={cn(styles.filterStyle, styles.filterMarginRight)}>
                  <span>Filter by Bio Status</span>
                  <SlideToggle
                    className={styles.slideToggle}
                    onChange={this.handleBioStatusToggleChange}
                  />
                </div>
              )}
              {hasPermissionToFilter && (
                <div className={styles.filterStyle}>
                  <span>Filter by Trophies</span>
                  <SlideToggle
                    className={styles.slideToggle}
                    onChange={this.handleTrophyToggleChange}
                  />
                </div>
              )}
              {hasPermissionToFilter && (
                <div className={styles.filterStyle}>
                  <span>Filter by Over Hours</span>
                  <SlideToggle
                    className={styles.slideToggle}
                    onChange={this.handleOverHoursToggleChange}
                  />
                  <ReactTooltip
                    id="filterTooltip"
                    place="top"
                    effect="solid"
                    className="custom-tooltip"
                  >
                    <span
                      style={{ whiteSpace: 'normal', wordWrap: 'break-word', maxWidth: '200px' }}
                    >
                      Filter people who contributed more than 25% of their committed hours
                    </span>
                  </ReactTooltip>
                </div>
              )}
            </div>
          </Col>
        </Row>
        {this.codeEditPermission && selectedCodes.length > 0 && (
          <Row style={{ marginBottom: '10px' }}>
            <Col lg={{ size: 5, offset: 1 }} xs={{ size: 5, offset: 1 }}>
              Replace With
              <Input
                type="string"
                placeholder="replace"
                value={replaceCode}
                onChange={e => {
                  this.setState({ replaceCode: e.target.value });
                }}
              />
              {replaceCodeLoading ? (
                <Spinner className="mt-3 mr-1" color="primary" />
              ) : (
                <Button
                  className="mr-1 mt-3 btn-bottom"
                  color="primary"
                  onClick={this.handleAllTeamCodeReplace}
                >
                  Replace
                </Button>
              )}
              {replaceCodeError && (
                <Alert className={styles.codeAlert} color="danger">
                  {replaceCodeError}
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
                    active={item === activeTab}
                    onClick={() => this.toggleTab(item)}
                  >
                    {item}
                  </NavLink>
                </NavItem>
              ))}
            </Nav>
            <TabContent
              activeTab={activeTab}
              className={`p-4 ${darkMode ? 'bg-yinmn-blue border-0' : ''}`}
            >
              {navItems.map((item, index) => (
                <WeeklySummariesReportTab tabId={item} key={item} hidden={item !== activeTab}>
                  <Row>
                    <Col sm="12" md="6" className="mb-2">
                      From <b>{this.weekDates[index].fromDate}</b> to{' '}
                      <b>{this.weekDates[index].toDate}</b>
                    </Col>
                    <Col sm="12" md="6" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <GeneratePdfReport
                        summaries={filteredSummaries}
                        weekIndex={index}
                        weekDates={this.weekDates[index]}
                        darkMode={darkMode}
                      />
                      {hasSeeBadgePermission && (
                        <Button
                          className="btn--dark-sea-green"
                          style={darkMode ? boxStyleDark : boxStyle}
                          onClick={() => this.setState({ loadBadges: !loadBadges })}
                        >
                          {loadBadges ? 'Hide Badges' : 'Load Badges'}
                        </Button>
                      )}
                      <Button
                        className="btn--dark-sea-green"
                        style={darkMode ? boxStyleDark : boxStyle}
                        onClick={() => this.setState({ loadTrophies: !loadTrophies })}
                      >
                        {loadTrophies ? 'Hide Trophies' : 'Load Trophies'}
                      </Button>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <b>Total Team Members:</b> {filteredSummaries.length}
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <FormattedReport
                        summaries={filteredSummaries}
                        weekIndex={index}
                        bioCanEdit={this.canRequestBio}
                        canEditSummaryCount={this.canEditSummaryCount}
                        allRoleInfo={allRoleInfo}
                        badges={badges}
                        loadBadges={loadBadges}
                        loadTrophies={loadTrophies}
                        canEditTeamCode={this.codeEditPermission}
                        auth={auth}
                        canSeeBioHighlight={this.canSeeBioHighlight}
                        darkMode={darkMode}
                        handleTeamCodeChange={this.handleTeamCodeChange}
                        handleSpecialColorDotClick={this.handleSpecialColorDotClick}
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
  }
}

WeeklySummariesReport.propTypes = {
  error: PropTypes.any,
  loading: PropTypes.bool.isRequired,
  summaries: PropTypes.array.isRequired,
  infoCollections: PropTypes.array,
  setTeamCodes: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  error: state.weeklySummariesReport.error,
  loading: state.weeklySummariesReport.loading,
  summaries: state.weeklySummariesReport.summaries,
  allBadgeData: state.badge.allBadgeData,
  infoCollections: state.infoCollections.infos,
  role: state.auth.user.role,
  auth: state.auth,
  darkMode: state.theme.darkMode,
  teamCodes: state.teamCodes.teamCodes,
  authEmailWeeklySummaryRecipient: state.auth.user.email, // capturing the user email through Redux store - Sucheta
});

const mapDispatchToProps = dispatch => ({
  fetchAllBadges: () => dispatch(fetchAllBadges()),
  getWeeklySummariesReport: () => dispatch(getWeeklySummariesReport()),
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
