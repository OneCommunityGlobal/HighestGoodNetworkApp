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
} from 'reactstrap';
import { MultiSelect } from 'react-multi-select-component';
import './WeeklySummariesReport.css';
import moment from 'moment';
import 'moment-timezone';
import { permissions } from 'utils/constants';
import { boxStyle, boxStyleDark } from 'styles';
import EditableInfoModal from 'components/UserProfile/EditableModal/EditableInfoModal';
import SkeletonLoading from '../common/SkeletonLoading';
import { getWeeklySummariesReport } from '../../actions/weeklySummariesReport';
import FormattedReport from './FormattedReport';
import GeneratePdfReport from './GeneratePdfReport';
import hasPermission from '../../utils/permissions';
import { getInfoCollections } from '../../actions/information';
import { fetchAllBadges } from '../../actions/badgeManagement';
import PasswordInputModal from './PasswordInputModal';
import WeeklySummaryRecipientsPopup from './WeeklySummaryRecepientsPopup';

const navItems = ['This Week', 'Last Week', 'Week Before Last', 'Three Weeks Ago'];

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
      // weeklyRecipientAuthPass: '',
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
    } = this.props;
    // 1. fetch report
    const res = await getWeeklySummariesReport();
    // eslint-disable-next-line react/destructuring-assignment
    const summaries = res?.data ?? this.props.summaries;
    const badgeStatusCode = await fetchAllBadges();
    this.canPutUserProfileImportantInfo = hasPermission(
      permissions.userManagement.putUserProfileImportantInfo,
    );
    this.bioEditPermission = this.canPutUserProfileImportantInfo;
    this.canEditSummaryCount = this.canPutUserProfileImportantInfo;
    this.codeEditPermission =
      hasPermission(permissions.teams.editTeamCode) ||
      auth.user.role === 'Owner' ||
      auth.user.role === 'Administrator';
    this.canSeeBioHighlight = hasPermission(permissions.highlightEligibleBios);

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
    const teamCodeGroup = {};
    const teamCodes = [];
    const colorOptionGroup = new Set();
    const colorOptions = [];

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
      });
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
    } = this.state;

    const selectedCodesArray = selectedCodes.map(e => e.value);
    const selectedColorsArray = selectedColors.map(e => e.value);

    const temp = summaries.filter(summary => {
      const { activeTab } = this.state;
      const hoursLogged = (summary.totalSeconds[navItems.indexOf(activeTab)] || 0) / 3600;

      const isMeetCriteria =
        summary.totalTangibleHrs > 80 && summary.daysInTeam > 60 && summary.bioPosted !== 'posted';

      const isBio = !selectedBioStatus || isMeetCriteria;

      const isOverHours =
        !selectedOverTime ||
        (hoursLogged > 0 &&
          hoursLogged >= summary.promisedHoursByWeek[navItems.indexOf(activeTab)] * 1.25);

      return (
        (selectedCodesArray.length === 0 || selectedCodesArray.includes(summary.teamCode)) &&
        (selectedColorsArray.length === 0 ||
          selectedColorsArray.includes(summary.weeklySummaryOption)) &&
        isOverHours &&
        isBio
      );
    });
    this.setState({ filteredSummaries: temp });
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

  handleTeamCodeChange = (oldTeamCode, newTeamCode, userId) => {
    this.setState(prevState => {
      let { teamCodes, summaries, selectedCodes } = prevState;

      // Find and update the user's team code in summaries
      summaries = summaries.map(summary => {
        if (summary._id === userId) {
          return { ...summary, teamCode: newTeamCode };
        }
        return summary;
      });

      // Count the occurrences of each team code
      const teamCodeCounts = summaries.reduce((acc, { teamCode }) => {
        acc[teamCode] = (acc[teamCode] || 0) + 1;
        return acc;
      }, {});

      // Update teamCodes by filtering out those with zero count
      teamCodes = Object.entries(teamCodeCounts)
        .filter(([count]) => count > 0)
        .map(([code, count]) => ({
          label: `${code} (${count})`,
          value: code,
        }));

      // Update selectedCodes labels and filter out those with zero count
      selectedCodes = selectedCodes
        .map(selected => {
          const count = teamCodeCounts[selected.value];
          if (count !== undefined && count > 0) {
            return { ...selected, label: `${selected.value} (${count})` };
          }
          return null;
        })
        .filter(Boolean);

      if (!selectedCodes.find(code => code.value === newTeamCode)) {
        selectedCodes.push({
          label: `${newTeamCode} (${teamCodeCounts[newTeamCode]})`,
          value: newTeamCode,
        });
      }

      // Sort teamCodes by label
      teamCodes.sort((a, b) => a.label.localeCompare(b.label));

      return { summaries, teamCodes, selectedCodes };
    });
  };

  render() {
    const { role, darkMode } = this.props;
    const {
      loading,
      activeTab,
      allRoleInfo,
      badges,
      loadBadges,
      hasSeeBadgePermission,
      selectedCodes,
      selectedColors,
      filteredSummaries,
      colorOptions,
      teamCodes,
      auth,
    } = this.state;
    const { error } = this.props;
    const hasPermissionToFilter = role === 'Owner' || role === 'Administrator';
    const { authEmailWeeklySummaryRecipient } = this.props;
    const authorizedUser1 = 'jae@onecommunityglobal.org';
    const authorizedUser2 = 'sucheta_mu@test.com'; // To test please include your email here

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
        className={`container-wsr-wrapper py-3 mb-5 ${
          darkMode ? 'bg-oxford-blue text-light' : 'bg--white-smoke'
        }`}
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
        <Row style={{ marginBottom: '10px' }}>
          <Col lg={{ size: 5, offset: 1 }} xs={{ size: 5, offset: 1 }}>
            Select Team Code
            <MultiSelect
              className="multi-select-filter"
              options={teamCodes}
              value={selectedCodes}
              onChange={e => {
                this.handleSelectCodeChange(e);
              }}
            />
          </Col>
          <Col lg={{ size: 5 }} xs={{ size: 5 }}>
            Select Color
            <MultiSelect
              className="multi-select-filter"
              options={colorOptions}
              value={selectedColors}
              onChange={e => {
                this.handleSelectColorChange(e);
              }}
            />
          </Col>
        </Row>
        <Row style={{ marginBottom: '10px' }}>
          <Col g={{ size: 10, offset: 1 }} xs={{ size: 10, offset: 1 }}>
            <div className="filter-container">
              {(hasPermissionToFilter || this.canSeeBioHighlight) && (
                <div className="filter-style margin-right">
                  <span>Filter by Bio Status</span>
                  <div className="custom-control custom-switch custom-control-smaller">
                    <input
                      type="checkbox"
                      className="custom-control-input"
                      id="bio-status-toggle"
                      onChange={this.handleBioStatusToggleChange}
                    />
                    <label className="custom-control-label" htmlFor="bio-status-toggle">
                      {}
                    </label>
                  </div>
                </div>
              )}
              {hasPermissionToFilter && (
                <div className="filter-style">
                  <span>Filter by Over Hours</span>
                  <div className="custom-control custom-switch custom-control-smaller">
                    <input
                      type="checkbox"
                      className="custom-control-input"
                      id="over-hours-toggle"
                      onChange={this.handleOverHoursToggleChange}
                    />
                    <label className="custom-control-label" htmlFor="over-hours-toggle">
                      {}
                    </label>
                  </div>
                </div>
              )}
            </div>
          </Col>
        </Row>
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
                      >
                        Load Trophies
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
                        bioCanEdit={this.bioEditPermission}
                        canEditSummaryCount={this.canEditSummaryCount}
                        allRoleInfo={allRoleInfo}
                        badges={badges}
                        loadBadges={loadBadges}
                        canEditTeamCode={this.codeEditPermission}
                        auth={auth}
                        canSeeBioHighlight={this.canSeeBioHighlight}
                        darkMode={darkMode}
                        handleTeamCodeChange={this.handleTeamCodeChange}
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
  authEmailWeeklySummaryRecipient: state.auth.user.email, // capturing the user email through Redux store - Sucheta
});

const mapDispatchToProps = dispatch => ({
  fetchAllBadges: () => dispatch(fetchAllBadges()),
  getWeeklySummariesReport: () => dispatch(getWeeklySummariesReport()),
  hasPermission: permission => dispatch(hasPermission(permission)),
  getInfoCollections: () => getInfoCollections(),
});

function WeeklySummariesReportTab({ tabId, hidden, children }) {
  return <TabPane tabId={tabId}>{!hidden && children}</TabPane>;
}

export default connect(mapStateToProps, mapDispatchToProps)(WeeklySummariesReport);
