/* eslint-disable react/sort-comp */
/* eslint-disable react/no-unused-class-component-methods */
/* eslint-disable react/no-unused-state */
import { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Button } from 'reactstrap';
import { boxStyle, boxStyleDark } from 'styles';
import EditableInfoModal from 'components/UserProfile/EditableModal/EditableInfoModal';
import { searchWithAccent } from 'utils/search';
import moment from 'moment-timezone';
import { fetchAllProjects } from '../../actions/projects';
import { getAllUserTeams } from '../../actions/allTeamsAction';
import TeamTable from './TeamTable';
import PeopleTable from './PeopleTable';
import ProjectTable from './ProjectTable';
import { getUserProfileBasicInfo } from '../../actions/userManagement';
import { fetchAllTasks } from '../../actions/task';
import 'react-datepicker/dist/react-datepicker.css';
import './reportsPage.css';
import projectsImage from './images/Projects.svg';
import peopleImage from './images/People.svg';
import teamsImage from './images/Teams.svg';
import TotalPeopleReport from './TotalReport/TotalPeopleReport';
import TotalTeamReport from './TotalReport/TotalTeamReport';
import TotalProjectReport from './TotalReport/TotalProjectReport';
import TotalContributorsReport from './TotalReport/TotalContributorsReport';
import AddLostTime from './LostTime/AddLostTime';
import LostTimeHistory from './LostTime/LostTimeHistory';
import '../Header/DarkMode.css';
import ViewReportByDate from './ViewReportsByDate/ViewReportsByDate';
import ReportFilter from './ReportFilter/ReportFilter';
import Loading from '../common/Loading';
import { getUsersTotalHoursForSpecifiedPeriod } from '../../actions/timeEntries';

const DATE_PICKER_MIN_DATE = '01/01/2010';

class ReportsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showCharts: false,
      showProjects: false,
      showPeople: false,
      showTeams: false,
      showTotalPeople: false,
      showTotalTeam: false,
      showTotalProject: false,
      showAddTimeForm: false,
      showAddPersonHistory: false,
      showAddTeamHistory: false,
      showAddProjHistory: false,
      showContributorsReport: false,
      teamNameSearchText: '',
      wildCardSearchText: '',
      selectedTeamId: 0,
      selectedTeam: '',
      filterStatus: 'all',
      formElements: {
        summary: '',
        summaryLastWeek: '',
        summaryBeforeLast: '',
        mediaUrl: '',
        weeklySummariesCount: 0,
        mediaConfirm: false,
      },
      dueDate: moment()
        .tz('America/Los_Angeles')
        .endOf('week')
        .toISOString(),
      dueDateLastWeek: moment()
        .tz('America/Los_Angeles')
        .endOf('week')
        .subtract(1, 'week')
        .toISOString(),
      dueDateBeforeLast: moment()
        .tz('America/Los_Angeles')
        .endOf('week')
        .subtract(2, 'week')
        .toISOString(),
      activeTab: '1',
      errors: {},
      fetchError: null,
      checkActive: '',
      loading: false,
      teamSearchData: {},
      peopleSearchData: [],
      projectSearchData: {},
      users: {},
      startDate: new Date(DATE_PICKER_MIN_DATE),
      endDate: new Date(),
      teamMemberList: {},
      remainedTeams: [],
      userProfilesWithHours: [],
    };
    this.showProjectTable = this.showProjectTable.bind(this);
    this.showPeopleTable = this.showPeopleTable.bind(this);
    this.showTeamsTable = this.showTeamsTable.bind(this);
    this.showTotalPeople = this.showTotalPeople.bind(this);
    this.showTotalTeam = this.showTotalTeam.bind(this);
    this.showTotalProject = this.showTotalProject.bind(this);
    this.showAddPersonHistory = this.showAddPersonHistory.bind(this);
    this.showAddTeamHistory = this.showAddTeamHistory.bind(this);
    this.showAddProjHistory = this.showAddProjHistory.bind(this);
    this.setTeamMemberList = this.setTeamMemberList.bind(this);
    this.setAddTime = this.setAddTime.bind(this);
    this.setFilterStatus = this.setFilterStatus.bind(this);
    this.onWildCardSearch = this.onWildCardSearch.bind(this);
    this.onDateChange = this.onDateChange.bind(this);
    this.handleClearFilters = this.handleClearFilters.bind(this);
    this.showContributorsReport = this.showContributorsReport.bind(this);
  }

  async componentDidMount() {
    const fetchProjects = this.props.fetchAllProjects();
    const fetchTeams = this.props.getAllUserTeams();
    const fetchUserProfile = this.props.getUserProfileBasicInfo();

    // parallel api calls
    await Promise.all([fetchProjects, fetchTeams, fetchUserProfile]);

    const userIds = this.props.state.allUserProfilesBasicInfo.userProfilesBasicInfo.map(
      userProfile => userProfile._id,
    );

    const timeEntriesHours = await this.props.getUsersTotalHoursForSpecifiedPeriod(
      userIds,
      new Date(DATE_PICKER_MIN_DATE),
      new Date(),
    );

    const userProfilesMappedWithHours = timeEntriesHours.map(entry => ({
      id: entry.userId,
      totalHours: Math.round(entry.totalHours * 10) / 10,
    }));

    this.setState({ userProfilesWithHours: userProfilesMappedWithHours, loading: false });
  }

  onWildCardSearch(searchText) {
    this.setState({ wildCardSearchText: searchText });
  }

  onDateChange(dates) {
    this.setState({
      startDate: dates.startDate,
      endDate: dates.endDate,
    });
  }

  setFilterStatus(status) {
    this.setState({ filterStatus: status });
  }

  handleClearFilters() {
    this.setState({
      startDate: new Date(DATE_PICKER_MIN_DATE),
      endDate: new Date(),
      wildCardSearchText: '',
      filterStatus: 'all',
    });
  }

  setActive() {
    this.setState(() => ({
      checkActive: 'true',
    }));
  }

  setAll() {
    this.setState(() => ({
      checkActive: '',
    }));
  }

  setInActive() {
    this.setState(() => ({
      checkActive: 'false',
    }));
  }

  setTeamMemberList(list) {
    this.setState(() => ({
      teamMemberList: list,
    }));
  }

  setAddTime() {
    this.setState(prevState => ({
      showProjects: false,
      showPeople: false,
      showTeams: false,
      showTotalProject: false,
      showTotalTeam: false,
      showTotalPeople: false,
      showAddTimeForm: !prevState.showAddTimeForm,
      showAddProjHistory: false,
      showAddPersonHistory: false,
      showAddTeamHistory: false,
    }));
  }

  filteredProjectList = projects => {
    const filteredList = projects.filter(project => {
      // Applying the search filters before creating each team table data element
      if (
        (project.projectName &&
          searchWithAccent(project.projectName, this.state.teamNameSearchText) &&
          this.state.wildCardSearchText === '') ||
        // the wild card search, the search text can be match with any item
        (this.state.wildCardSearchText !== '' &&
          searchWithAccent(project.projectName, this.state.wildCardSearchText))
      ) {
        return project;
      }
      return false;
    });

    return filteredList;
  };

  filteredTeamList = allTeams => {
    const filteredList = allTeams?.filter(team => {
      // Applying the search filters before creating each team table data element
      if (
        (team.teamName &&
          searchWithAccent(team.teamName, this.state.teamNameSearchText) &&
          this.state.wildCardSearchText === '') ||
        // the wild card search, the search text can be match with any item
        (this.state.wildCardSearchText !== '' &&
          searchWithAccent(team.teamName, this.state.wildCardSearchText))
      ) {
        return team;
      }
      return false;
    });

    return filteredList;
  };

  filteredPeopleList = userProfiles => {
    const filteredList = userProfiles.filter(userProfile => {
      // Applying the search filters before creating each team table data element
      if (
        (userProfile.firstName &&
          searchWithAccent(userProfile.firstName, this.state.teamNameSearchText) &&
          this.state.wildCardSearchText === '') ||
        // the wild card search, the search text can be match with any item
        (this.state.wildCardSearchText !== '' &&
          searchWithAccent(userProfile.firstName, this.state.wildCardSearchText)) ||
        (this.state.wildCardSearchText !== '' &&
          userProfile.lastName &&
          searchWithAccent(userProfile.lastName, this.state.wildCardSearchText))
      ) {
        return (
          new Date(Date.parse(userProfile.startDate)) >= this.state.startDate &&
          this.state.startDate <= new Date(Date.parse(userProfile?.endDate)) <= this.state.endDate
        );
      }
      return false;
    });

    return filteredList;
  };

  setRemainedTeams(teams) {
    this.setState(() => ({
      remainedTeams: teams,
    }));
  }

  showProjectTable() {
    this.setState(prevState => ({
      showProjects: !prevState.showProjects,
      showPeople: false,
      showTeams: false,
      showTotalProject: false,
      showTotalTeam: false,
      showTotalPeople: false,
      showAddTimeForm: false,
      showAddProjHistory: false,
      showAddPersonHistory: false,
      showAddTeamHistory: false,
      showCharts: !prevState.showProjects,
      showContributorsReport: false
    }));
  }

  showTeamsTable() {
    this.setState(prevState => ({
      showProjects: false,
      showPeople: false,
      showTeams: !prevState.showTeams,
      showTotalProject: false,
      showTotalTeam: false,
      showTotalPeople: false,
      showAddTimeForm: false,
      showAddProjHistory: false,
      showAddPersonHistory: false,
      showAddTeamHistory: false,
      showCharts: !prevState.showTeams,
      showContributorsReport: false
    }));
  }

  showPeopleTable() {
    this.setState(prevState => ({
      showProjects: false,
      showPeople: !prevState.showPeople,
      showTeams: false,
      showTotalProject: false,
      showTotalTeam: false,
      showTotalPeople: false,
      showAddTimeForm: false,
      showAddProjHistory: false,
      showAddPersonHistory: false,
      showAddTeamHistory: false,
      showCharts: !prevState.showPeople,
      showContributorsReport: false
    }));
  }

  showTotalPeople() {
    this.setState(prevState => ({
      showProjects: false,
      showPeople: false,
      showTeams: false,
      showTotalProject: false,
      showTotalPeople: !prevState.showTotalPeople,
      showTotalTeam: false,
      showAddTimeForm: false,
      showAddProjHistory: false,
      showAddPersonHistory: false,
      showAddTeamHistory: false,
      showCharts: !prevState.showTotalPeople,
      showContributorsReport: false
    }));
  }

  showTotalTeam() {
    this.setState(prevState => ({
      showProjects: false,
      showPeople: false,
      showTeams: false,
      showTotalProject: false,
      showTotalTeam: !prevState.showTotalTeam,
      showTotalPeople: false,
      showAddTimeForm: false,
      showAddProjHistory: false,
      showAddPersonHistory: false,
      showAddTeamHistory: false,
      showCharts: !prevState.showTotalTeam,
      showContributorsReport: false
    }));
  }

  showTotalProject() {
    if (this.state.showTotalProject) {
      this.setState({
        showTotalProject: false,
        showCharts: false,
        loading: false,
      });
      return;
    }

    this.setState(
      {
        loading: true,
        showProjects: false,
        showPeople: false,
        showTeams: false,
        showTotalTeam: false,
        showTotalPeople: false,
        showTotalProject: false,
        showAddTimeForm: false,
        showAddProjHistory: false,
        showAddPersonHistory: false,
        showAddTeamHistory: false,
        showContributorsReport: false
      },
      () => {
        setTimeout(() => {
          this.setState({
            loading: false,
            showTotalProject: true, // Show the report after loading completes
            showCharts: true,
        });
        }, 2000); // Adjust the delay as needed
      },
    );
  }

  showAddProjHistory() {
    this.setState(prevState => ({
      showProjects: false,
      showPeople: false,
      showTeams: false,
      showTotalProject: false,
      showTotalTeam: false,
      showTotalPeople: false,
      showAddTimeForm: false,
      showAddProjHistory: !prevState.showAddProjHistory,
      showAddPersonHistory: false,
      showAddTeamHistory: false,
      showContributorsReport: false
    }));
  }

  showAddPersonHistory() {
    this.setState(prevState => ({
      showProjects: false,
      showPeople: false,
      showTeams: false,
      showTotalProject: false,
      showTotalTeam: false,
      showTotalPeople: false,
      showAddTimeForm: false,
      showAddProjHistory: false,
      showAddPersonHistory: !prevState.showAddPersonHistory,
      showAddTeamHistory: false,
      showContributorsReport: false
    }));
  }

  showAddTeamHistory() {
    this.setState(prevState => ({
      showProjects: false,
      showPeople: false,
      showTeams: false,
      showTotalProject: false,
      showTotalTeam: false,
      showTotalPeople: false,
      showAddTimeForm: false,
      showAddProjHistory: false,
      showAddPersonHistory: false,
      showAddTeamHistory: !prevState.showAddTeamHistory,
      showContributorsReport: false
    }));
  }

  showContributorsReport() {
    this.setState(prevState => ({
      showContributorsReport: !prevState.showContributorsReport,
      showProjects: false,
      showPeople: false,
      showTeams: false,
      showTotalProject: false,
      showTotalPeople: false,
      showTotalTeam: false,
      showAddTimeForm: false,
      showAddProjHistory: false,
      showAddPersonHistory: false,
      showAddTeamHistory: false
    }));
  }

  render() {
    const { darkMode } = this.props.state.theme;
    const userRole = this.props.state.userProfile.role;
    const myRole = this.props.state.auth.user.role;
    const { projects } = this.props.state.allProjects;
    const { allTeams } = this.props.state.allTeamsData;
    const { userProfilesBasicInfo } = this.props.state.allUserProfilesBasicInfo;
    this.state.teamSearchData = this.filteredTeamList(allTeams);
    this.state.peopleSearchData = this.filteredPeopleList(userProfilesBasicInfo);
    this.state.projectSearchData = this.filteredProjectList(projects);
    if (this.state.filterStatus === 'active') {
      this.state.teamSearchData = allTeams.filter(team => team.isActive === true);
      this.state.projectSearchData = projects.filter(project => project.isActive === true);
      this.state.peopleSearchData = userProfilesBasicInfo.filter(user => user.isActive === true);
      this.state.teamSearchData = this.filteredTeamList(this.state.teamSearchData);
      this.state.peopleSearchData = this.filteredPeopleList(this.state.peopleSearchData);
      this.state.projectSearchData = this.filteredProjectList(this.state.projectSearchData);
    } else if (this.state.filterStatus === 'inactive') {
      this.state.teamSearchData = allTeams.filter(team => team.isActive === false);
      this.state.projectSearchData = projects.filter(project => project.isActive === false);
      this.state.peopleSearchData = userProfilesBasicInfo.filter(user => user.isActive === false);
      this.state.teamSearchData = this.filteredTeamList(this.state.teamSearchData);
      this.state.peopleSearchData = this.filteredPeopleList(this.state.peopleSearchData);
      this.state.projectSearchData = this.filteredProjectList(this.state.projectSearchData);
    }
    if (this.state.filterStatus === 'tenHour') {
      const filteredIds = this.state.userProfilesWithHours
        .filter(user => user.totalHours > 10)
        .map(user => user.id);

      this.state.peopleSearchData = this.props.state.allUserProfilesBasicInfo.userProfilesBasicInfo.filter(
        userProfile => filteredIds.includes(userProfile._id),
      );
    }

    if (this.state.startDate != null && this.state.endDate != null) {
      this.state.peopleSearchData = this.filteredPeopleList(this.state.peopleSearchData);
    }

    const isOxfordBlue = darkMode ? 'bg-oxford-blue' : '';
    const isYinmnBlue = darkMode ? 'bg-yinmn-blue' : '';
    const textColor = darkMode ? 'text-blue-400' : 'text-dark';
    const boxStyling = darkMode ? boxStyleDark : boxStyle;

    return (
      <Container fluid className={`mb-5 container-component-wrapper ${isOxfordBlue}`}>
        <div
          className={`category-data-container ${isOxfordBlue} ${isYinmnBlue} ${
            this.state.showPeople ||
            this.state.showProjects ||
            this.state.showTeams ||
            this.state.showTotalProject ||
            this.state.showTotalPeople ||
            this.state.showTotalTeam ||
            this.state.showAddTimeForm ||
            this.state.showAddPersonHistory ||
            this.state.showAddTeamHistory ||
            this.state.showAddProjHistory ||
            this.state.showContributorsReport
              ? ''
              : 'no-active-selection'
          }`}
          type="button"
        >
          <div className="container-component-category">
            <h2 className="mt-3 mb-5">
              {/* Loading spinner at the top */}
              {this.state.loading && (
                <div className="loading-spinner-top">
                  <Loading align="center" darkMode={darkMode} />
                </div>
              )}
              <div className="d-flex align-items-center">
                <span className={`mr-2 ${textColor}`}>Reports Page</span>
                <EditableInfoModal
                  areaName="ReportsPage"
                  areaTitle="Reports Page"
                  role={userRole}
                  fontSize={26}
                  isPermissionPage
                  className="p-2" // Add Bootstrap padding class to the EditableInfoModal
                  darkMode={darkMode}
                />
              </div>
            </h2>
            <div>
              <div className={darkMode ? `text-white` : ``}>Select a Category</div>
            </div>
            <div className='report-container-data'>
              <div className='data-container' style={this.state.showCharts ? {width: '50%'} : {width: '100%'}}>
                <div className="category-container">
                  <button
                    type="button"
                    className={`card-category-item ${this.state.showProjects ? 'selected' : ''
                      } ${isYinmnBlue}`}
                    style={boxStyling}
                    onClick={this.showProjectTable}
                  >
                    <h3 className="card-category-item-title"> Projects</h3>
                    <h3 className="card-category-item-number">
                      {this.state.projectSearchData.length}{' '}
                    </h3>
                    <img src={projectsImage} alt="Projects" />
                  </button>
                  <button
                    type="button"
                    className={`card-category-item ${this.state.showPeople ? 'selected' : ''
                      } ${isYinmnBlue}`}
                    style={boxStyling}
                    onClick={this.showPeopleTable}
                  >
                    <h3 className="card-category-item-title"> People </h3>
                    <h3 className="card-category-item-number">
                      {this.state.peopleSearchData.length}
                    </h3>
                    <img src={peopleImage} alt="that representes the people" />
                  </button>
                  <button
                    type="button"
                    className={`card-category-item ${this.state.showTeams ? 'selected' : ''
                      } ${isYinmnBlue}`}
                    style={boxStyling}
                    onClick={this.showTeamsTable}
                  >
                    <h3 className="card-category-item-title"> Teams </h3>
                    <h3 className="card-category-item-number">{this.state.teamSearchData?.length}</h3>
                    <img src={teamsImage} alt="that representes the teams" />
                  </button>
                </div>
                <div
                  className={`mt-3 p-3 rounded-lg ${darkMode ? 'bg-yinmn-blue text-light' : 'bg-white'
                    }`}
                  style={darkMode ? boxStyleDark : boxStyle}
                >
                  <ReportFilter
                    setFilterStatus={this.setFilterStatus}
                    onWildCardSearch={this.onWildCardSearch}
                    onCreateNewTeamShow={this.onCreateNewTeamShow}
                  />
                  <ViewReportByDate
                    minDate={new Date(DATE_PICKER_MIN_DATE)}
                    maxDate={new Date()}
                    textColor={textColor}
                    onDateChange={this.onDateChange}
                    darkMode={darkMode}
                  />
                  <div className="total-report-container">
                    <div className="total-report-item">
                      <Button type="button" color="info" onClick={this.showTotalProject}>
                        {this.state.showTotalProject
                          ? 'Hide Total Project Report'
                          : 'Show Total Project Report'}
                      </Button>
                      <div style={{ display: 'inline-block', marginLeft: 10 }}>
                        <EditableInfoModal
                          areaName="totalProjectReportInfoPoint"
                          areaTitle="Total Project Report"
                          role={myRole}
                          fontSize={15}
                          isPermissionPage
                          darkMode={darkMode}
                        />
                      </div>
                    </div>
                    <div className="total-report-item">
                      <Button type="button" color="info" onClick={this.showTotalPeople}>
                        {this.state.showTotalPeople
                          ? 'Hide Total People Report'
                          : 'Show Total People Report'}
                      </Button>
                      <div style={{ display: 'inline-block', marginLeft: 10 }}>
                        <EditableInfoModal
                          areaName="totalPeopleReportInfoPoint"
                          areaTitle="Total People Report"
                          role={myRole}
                          fontSize={15}
                          isPermissionPage
                          darkMode={darkMode}
                        />
                      </div>
                    </div>
                      <div className="total-report-item">
                      <Button color="info" onClick={this.showTotalTeam}>
                        {this.state.showTotalTeam
                          ? 'Hide Total Team Report'
                          : 'Show Total Team Report'}
                      </Button>
                      <div style={{ display: 'inline-block', marginLeft: 10 }}>
                        <EditableInfoModal
                          areaName="totalTeamReportInfoPoint"
                          areaTitle="Total Team Report"
                          role={userRole}
                          fontSize={15}
                          isPermissionPage
                          darkMode={darkMode}
                        />
                      </div>

                    </div>
                  <div className="total-report-item">
                    <Button 
                      type="button" 
                      color="info" 
                      onClick={this.showContributorsReport}
                    >
                      {this.state.showContributorsReport
                        ? 'Hide Contributors Report'
                        : 'Show Contributors Report'}
                    </Button>
                    <div style={{ display: 'inline-block', marginLeft: 10 }}>
                      <EditableInfoModal
                        areaName="contributorsReportInfoPoint"
                        areaTitle="Contributors Report"
                        role={myRole}
                        fontSize={15}
                        isPermissionPage
                        darkMode={darkMode}
                        defaultText="Click this to see only people who logged/contributed a minimum of 10 tangible hours. This is used for identifying actual contributors vs. people who never started, were immediately terminated, etc."
                      />
                    </div>
                    </div>
                  </div>
                  {myRole !== 'Owner' && (
                    <div className="lost-time-container">
                      <div className="lost-time-item">
                        <Button color="info" onClick={this.showAddProjHistory}>
                          {this.state.showAddProjHistory
                            ? 'Hide Project Lost Time'
                            : 'Show Project Lost Time'}
                        </Button>
                        <div style={{ display: 'inline-block', marginLeft: 10 }}>
                          <EditableInfoModal
                            areaName="projectLostTimeInfoPoint"
                            areaTitle="Project Lost Time"
                            role={myRole}
                            fontSize={15}
                            isPermissionPage
                            darkMode={darkMode}
                          />
                        </div>
                      </div>
                      <div className="lost-time-item">
                        <Button color="info" onClick={this.showAddPersonHistory}>
                          {this.state.showAddPersonHistory
                            ? 'Hide Person Lost Time'
                            : 'Show Person Lost Time'}
                        </Button>
                        <div style={{ display: 'inline-block', marginLeft: 10 }}>
                          <EditableInfoModal
                            areaName="personLostTimeInfoPoint"
                            areaTitle="Person Lost Time"
                            role={myRole}
                            fontSize={15}
                            isPermissionPage
                            darkMode={darkMode}
                          />
                        </div>
                      </div>
                      <div className="lost-time-item">
                        <Button color="info" onClick={this.showAddTeamHistory}>
                          {this.state.showAddTeamHistory
                            ? 'Hide Team Lost Time'
                            : 'Show Team Lost Time'}
                        </Button>
                        <div style={{ display: 'inline-block', marginLeft: 10 }}>
                          <EditableInfoModal
                            areaName="teamLostTimeInfoPoint"
                            areaTitle="Team Lost Time"
                            role={myRole}
                            fontSize={15}
                            isPermissionPage
                            darkMode={darkMode}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {myRole === 'Owner' && (
                  <div
                    className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-yinmn-blue' : 'bg-white'}`}
                    style={darkMode ? boxStyleDark : boxStyle}
                  >
                    <div className="lost-time-container">
                      <div className="lost-time-item">
                        <Button color="success" onClick={this.setAddTime}>
                          Add Lost Time
                        </Button>
                        <div style={{ display: 'inline-block', marginLeft: 10 }}>
                          <EditableInfoModal
                            areaName="addLostTimeInfoPoint"
                            areaTitle="Add Lost Time"
                            role={myRole}
                            fontSize={15}
                            isPermissionPage
                            darkMode={darkMode}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="lost-time-container">
                      <div className="lost-time-item">
                        <Button color="info" onClick={this.showAddProjHistory}>
                          {this.state.showAddProjHistory
                            ? 'Hide Project Lost Time'
                            : 'Show Project Lost Time'}
                        </Button>
                        <div style={{ display: 'inline-block', marginLeft: 10 }}>
                          <EditableInfoModal
                            areaName="projectLostTimeInfoPoint"
                            areaTitle="Project Lost Time"
                            role={myRole}
                            fontSize={15}
                            isPermissionPage
                            darkMode={darkMode}
                          />
                        </div>
                      </div>
                      <div className="lost-time-item">
                        <Button color="info" onClick={this.showAddPersonHistory}>
                          {this.state.showAddPersonHistory
                            ? 'Hide Person Lost Time'
                            : 'Show Person Lost Time'}
                        </Button>
                        <div style={{ display: 'inline-block', marginLeft: 10 }}>
                          <EditableInfoModal
                            areaName="personLostTimeInfoPoint"
                            areaTitle="Person Lost Time"
                            role={myRole}
                            fontSize={15}
                            isPermissionPage
                            darkMode={darkMode}
                          />
                        </div>
                      </div>
                      <div className="lost-time-item">
                        <Button color="info" onClick={this.showAddTeamHistory}>
                          {this.state.showAddTeamHistory
                            ? 'Hide Team Lost Time'
                            : 'Show Team Lost Time'}
                        </Button>
                        <div style={{ display: 'inline-block', marginLeft: 10 }}>
                          <EditableInfoModal
                            areaName="teamLostTimeInfoPoint"
                            areaTitle="Team Lost Time"
                            role={myRole}
                            fontSize={15}
                            isPermissionPage
                            darkMode={darkMode}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {this.state.showCharts && (
                <div className="table-data-container" style={(this.state.showPeople || this.state.showProjects || this.state.showTeams) ? { overflowY: 'auto' } : {overflowY: 'none'}}>
                  {this.state.showPeople && (
                    <PeopleTable userProfiles={this.state.peopleSearchData} darkMode={darkMode} />
                  )}
                  {this.state.showProjects && (
                    <ProjectTable projects={this.state.projectSearchData} darkMode={darkMode} />
                  )}
                  {this.state.showTeams && (
                    <TeamTable allTeams={this.state.teamSearchData} darkMode={darkMode} />
                  )}
                  {this.state.showTotalPeople && (
                    <TotalPeopleReport
                      startDate={this.state.startDate}
                      endDate={this.state.endDate}
                      userProfiles={userProfilesBasicInfo}
                      darkMode={darkMode}
                    />
                  )}
                  {this.state.showTotalTeam && (
                    <TotalTeamReport
                      startDate={this.state.startDate}
                      endDate={this.state.endDate}
                      userProfiles={userProfilesBasicInfo}
                      allTeamsData={this.props.state.allTeamsData.allTeams}
                      passTeamMemberList={this.setTeamMemberList}
                      savedTeamMemberList={this.state.teamMemberList}
                      darkMode={darkMode}
                    />
                  )}
                  {!this.state.loading && this.state.showTotalProject && (
                    <TotalProjectReport
                      startDate={this.state.startDate}
                      endDate={this.state.endDate}
                      userProfiles={userProfilesBasicInfo}
                      projects={projects}
                      darkMode={darkMode}
                    />
                  )}
                  {this.state.showContributorsReport && (
              <TotalContributorsReport
                startDate={this.state.startDate}
                endDate={this.state.endDate}
                userProfiles={userProfilesBasicInfo}
                darkMode={darkMode}
                userRole={userRole}
              />
            )}
            {this.state.showAddTimeForm && myRole === 'Owner' && (
                    <AddLostTime
                      isOpen={this.state.showAddTimeForm}
                      toggle={this.setAddTime}
                      projects={projects}
                      teams={allTeams}
                      users={userProfilesBasicInfo}
                    />
                  )}
                  {this.state.showAddPersonHistory && (
                    <LostTimeHistory
                      type="person"
                      isOpen={this.state.showAddPersonHistory}
                      startDate={this.state.startDate}
                      endDate={this.state.endDate}
                      allData={userProfilesBasicInfo}
                      darkMode={darkMode}
                    />
                  )}
                  {this.state.showAddTeamHistory && (
                    <LostTimeHistory
                      type="team"
                      isOpen={this.state.showAddTeamHistory}
                      startDate={this.state.startDate}
                      endDate={this.state.endDate}
                      allData={allTeams}
                      darkMode={darkMode}
                    />
                  )}
                  {this.state.showAddProjHistory && (
                    <LostTimeHistory
                      type="project"
                      isOpen={this.state.showAddProjHistory}
                      startDate={this.state.startDate}
                      endDate={this.state.endDate}
                      allData={projects}
                      darkMode={darkMode}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    );
  }
}

const mapStateToProps = state => ({ state });

export default connect(mapStateToProps, {
  fetchAllProjects,
  getAllUserTeams,
  getUserProfileBasicInfo,
  getUsersTotalHoursForSpecifiedPeriod,
  fetchAllTasks,
})(ReportsPage);
