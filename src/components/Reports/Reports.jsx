import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { Container, Button } from 'reactstrap';
import DatePicker from 'react-datepicker';
import { fetchAllProjects } from '../../actions/projects';
import { getAllUserTeams } from '../../actions/allTeamsAction';
import TeamTable from './TeamTable';
import PeopleTable from './PeopleTable';
import ProjectTable from './ProjectTable';
import { getAllUserProfile } from '../../actions/userManagement';
import { fetchAllTasks } from '../../actions/task';
import ReportTableSearchPanel from './ReportTableSearchPanel';
import 'react-datepicker/dist/react-datepicker.css';
import './reportsPage.css';
import projectsImage from './images/Projects.svg';
import peopleImage from './images/People.svg';
import teamsImage from './images/Teams.svg';
import ReactTooltip from 'react-tooltip';
import TotalPeopleReport from './TotalReport/TotalPeopleReport';
import TotalTeamReport from './TotalReport/TotalTeamReport';
import TotalProjectReport from './TotalReport/TotalProjectReport';
import EditableInfoModal from 'components/UserProfile/EditableModal/EditableInfoModal';

const DATE_PICKER_MIN_DATE = '01/01/2010';

class ReportsPage extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      showProjects: false,
      showPeople: false,
      showTeams: false,
      showTotalPeople: false,
      showTotalTeam: false,
      showTotalProject: false,
      teamNameSearchText: '',
      teamMembersPopupOpen: false,
      deleteTeamPopupOpen: false,
      createNewTeamPopupOpen: false,
      teamStatusPopupOpen: false,
      wildCardSearchText: '',
      selectedTeamId: 0,
      selectedTeam: '',
      checkActive: '',
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
      loading: true,
      teamSearchData: {},
      peopleSearchData: [],
      projectSearchData: {},
      users: {},
      startDate: new Date(DATE_PICKER_MIN_DATE),
      endDate: new Date(),
      teamMemberList: {},
    };
    this.showProjectTable = this.showProjectTable.bind(this);
    this.showPeopleTable = this.showPeopleTable.bind(this);
    this.showTeamsTable = this.showTeamsTable.bind(this);
    this.showTotalPeople = this.showTotalPeople.bind(this);
    this.showTotalTeam = this.showTotalTeam.bind(this);
    this.showTotalProject = this.showTotalProject.bind(this);
    this.setActive = this.setActive.bind(this);
    this.setInActive = this.setInActive.bind(this);
    this.setAll = this.setAll.bind(this);
    this.setTeamMemberList = this.setTeamMemberList.bind(this);
  }

  async componentDidMount() {
    this.props.fetchAllProjects(); // Fetch to get all projects
    this.props.getAllUserTeams();
    this.setState({
      showProjects: false,
      showPeople: false,
      showTeams: false,
      checkActive: '',
    });
    this.props.getAllUserProfile();
  }

  /**
   * callback for search
   */
  onWildCardSearch = searchText => {
    this.setState({
      wildCardSearchText: searchText,
    });
  };

  filteredProjectList = projects => {
    const filteredList = projects.filter(project => {
      // Applying the search filters before creating each team table data element
      if (
        (project.projectName &&
          project.projectName.toLowerCase().indexOf(this.state.teamNameSearchText.toLowerCase()) >
            -1 &&
          this.state.wildCardSearchText === '') ||
        // the wild card search, the search text can be match with any item
        (this.state.wildCardSearchText !== '' &&
          project.projectName.toLowerCase().indexOf(this.state.wildCardSearchText.toLowerCase()) >
            -1)
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
          team.teamName.toLowerCase().indexOf(this.state.teamNameSearchText.toLowerCase()) > -1 &&
          this.state.wildCardSearchText === '') ||
        // the wild card search, the search text can be match with any item
        (this.state.wildCardSearchText !== '' &&
          team.teamName.toLowerCase().indexOf(this.state.wildCardSearchText.toLowerCase()) > -1)
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
          userProfile.firstName.toLowerCase().indexOf(this.state.teamNameSearchText.toLowerCase()) >
            -1 &&
          this.state.wildCardSearchText === '') ||
        // the wild card search, the search text can be match with any item
        (this.state.wildCardSearchText !== '' &&
          userProfile.firstName.toLowerCase().indexOf(this.state.wildCardSearchText.toLowerCase()) >
            -1) ||
        (this.state.wildCardSearchText !== '' &&
          userProfile.lastName &&
          userProfile.lastName.toLowerCase().indexOf(this.state.wildCardSearchText.toLowerCase()) >
            -1)
      ) {
        return (
          new Date(Date.parse(userProfile.createdDate)) >= this.state.startDate &&
          this.state.startDate <= new Date(Date.parse(userProfile?.endDate)) <= this.state.endDate
        );
      }
      return false;
    });

    return filteredList;
  };

  setActive() {
    this.setState(state => ({
      checkActive: 'true',
    }));
  }

  setAll() {
    this.setState(state => ({
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

  showProjectTable() {
    this.setState(prevState => ({
      showProjects: !prevState.showProjects,
      showPeople: false,
      showTeams: false,
      showTotalProject: false,
      showTotalTeam: false,
      showTotalPeople: false,
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
    }));
  }
  showTotalProject() {
    this.setState(prevState => ({
      showProjects: false,
      showPeople: false,
      showTeams: false,
      showTotalProject: !prevState.showTotalProject,
      showTotalTeam: false,
      showTotalPeople: false,
    }));
  }

  render() {
    const userRole = this.props.state.userProfile.role;
    const { projects } = this.props.state.allProjects;
    const { allTeams } = this.props.state.allTeamsData;
    const { userProfiles } = this.props.state.allUserProfiles;
    this.state.teamSearchData = this.filteredTeamList(allTeams);
    this.state.peopleSearchData = this.filteredPeopleList(userProfiles);
    this.state.projectSearchData = this.filteredProjectList(projects);
    if (this.state.checkActive === 'true') {
      this.state.teamSearchData = allTeams.filter(team => team.isActive === true);
      this.state.projectSearchData = projects.filter(project => project.isActive === true);
      this.state.peopleSearchData = userProfiles.filter(user => user.isActive === true);
      this.state.teamSearchData = this.filteredTeamList(this.state.teamSearchData);
      this.state.peopleSearchData = this.filteredPeopleList(this.state.peopleSearchData);
      this.state.projectSearchData = this.filteredProjectList(this.state.projectSearchData);
    } else if (this.state.checkActive === 'false') {
      this.state.teamSearchData = allTeams.filter(team => team.isActive === false);
      this.state.projectSearchData = projects.filter(project => project.isActive === false);
      this.state.peopleSearchData = userProfiles.filter(user => user.isActive === false);
      this.state.teamSearchData = this.filteredTeamList(this.state.teamSearchData);
      this.state.peopleSearchData = this.filteredPeopleList(this.state.peopleSearchData);
      this.state.projectSearchData = this.filteredProjectList(this.state.projectSearchData);
    }
    if (this.state.startDate != null && this.state.endDate != null) {
      this.state.peopleSearchData = this.filteredPeopleList(this.state.peopleSearchData);
    }
    return (
      <Container fluid className="mb-5 container-component-wrapper">
        <div className="container-component-category">
          <h2 className="mt-3 mb-5">
            Reports Page
            <EditableInfoModal
            // Pass any necessary props to EditableInfoModal
            areaName="ReportsPage" // Example areaName
            role={userRole} // Example role
            fontSize={24} // Example fontSize
            isPermissionPage={true} // Example isPermissionPage
            />
          </h2>
          <div>
            <p>Select a Category</p>
          </div>
          <div className="category-container">
            <button
              className={`card-category-item ${this.state.showProjects ? 'selected' : ''}`}
              onClick={this.showProjectTable}
            >
              <h3 className="card-category-item-title"> Projects</h3>
              <h3 className="card-category-item-number">{this.state.projectSearchData.length} </h3>
              <img src={projectsImage} alt="Image that representes the projects" />
            </button>
            <button
              className={`card-category-item ${this.state.showPeople ? 'selected' : ''}`}
              onClick={this.showPeopleTable}
            >
              <h3 className="card-category-item-title"> People </h3>
              <h3 className="card-category-item-number">{this.state.peopleSearchData.length}</h3>
              <img src={peopleImage} alt="Image that representes the people" />
            </button>
            <button
              className={`card-category-item ${this.state.showTeams ? 'selected' : ''}`}
              onClick={this.showTeamsTable}
            >
              <h3 className="card-category-item-title"> Teams </h3>
              <h3 className="card-category-item-number">{this.state.teamSearchData?.length}</h3>
              <img src={teamsImage} alt="Image that representes the teams" />
            </button>
            {/* <button style={{ margin: '5px' }} exact className="btn btn-info btn-bg mt-3" onClick={this.showProjectTable}>
              <i className="fa fa-folder" aria-hidden="true" />
              {' '}
              Projects
              {' '}
              {this.state.projectSearchData.length}
            </button>
            <button style={{ margin: '5px' }} exact className="btn btn-info btn-bg mt-3" onClick={this.showPeopleTable}>
              <i className="fa fa-user" aria-hidden="true" />
              {' '}
              People
              {' '}
              {this.state.peopleSearchData.length}
            </button>
            <button style={{ margin: '5px' }} exact className="btn btn-info btn-bg mt-3" onClick={this.showTeamsTable}>
              <i className="fa fa-users" aria-hidden="true" />
              {' '}
              Teams
              {' '}
              {this.state.teamSearchData?.length}
            </button> */}
          </div>
          <div className="mt-4 bg-white p-3 rounded-5">
            <div>
              <a>Select a Filter</a>
            </div>
            <div>
              <input
                name="radio"
                type="radio"
                style={{ margin: '8px 12px', marginLeft: 0 }}
                value="active"
                onChange={this.setActive}
              />
              Active
              <input
                name="radio"
                type="radio"
                style={{ margin: '8px 12px' }}
                value="inactive"
                onChange={this.setInActive}
              />
              Inactive
              <input
                name="radio"
                type="radio"
                style={{ margin: '8px 12px' }}
                value="all"
                onChange={this.setAll}
                defaultChecked
              />
              All
            </div>
            <div className="mt-4">
              <ReportTableSearchPanel
                onSearch={this.onWildCardSearch}
                onCreateNewTeamClick={this.onCreateNewTeamShow}
              />
            </div>
            <div className="date-picker-container">
              <div id="task_startDate" className="date-picker-item">
                <label htmlFor="task_startDate" className="date-picker-label">
                  {' '}
                  Start Date
                </label>
                <DatePicker
                  selected={this.state.startDate}
                  minDate={new Date(DATE_PICKER_MIN_DATE)}
                  maxDate={new Date()}
                  onChange={date => {
                    if (date > new Date(DATE_PICKER_MIN_DATE) && date <= this.state.endDate) {
                      this.setState({ startDate: date });
                    }
                  }}
                  className="form-control"
                  popperPlacement="top-start"
                />
              </div>
              <div id="task_EndDate" className="date-picker-item">
                <label htmlFor="task_EndDate" className="date-picker-label">
                  {' '}
                  End Date
                </label>
                <DatePicker
                  selected={this.state.endDate}
                  maxDate={new Date()}
                  minDate={new Date(DATE_PICKER_MIN_DATE)}
                  onChange={date => {
                    if (date >= this.state.startDate) {
                      this.setState({ endDate: date });
                    }
                  }}
                  className="form-control"
                  popperPlacement="top"
                />
              </div>
            </div>
            <div className="total-report-container">
              <div className="total-report-item">
                <Button color="info" onClick={this.showTotalProject}>
                  {this.state.showTotalProject
                    ? 'Hide Total Project Report'
                    : 'Show Total Project Report'}
                </Button>
                <i
                  className="fa fa-info-circle"
                  data-tip
                  data-for="totalProjectTip"
                  data-delay-hide="0"
                  aria-hidden="true"
                  title=""
                  style={{ paddingLeft: '.32rem' }}
                />
                <ReactTooltip id="totalProjectTip" place="bottom" effect="solid">
                  Click this button to see exactly how many new projects have been worked on for a
                  designated time period.
                  <br />
                  Projects must have had at least 1 hour logged to them to be included.
                  <br />
                  A 'Total Hours' section will show the total tangible time logged to all projects
                  during the selected period.
                  <br />A detail report will list all the projects and hours contributed by each
                  during that time period.
                </ReactTooltip>
              </div>
              <div className="total-report-item">
                <Button color="info" onClick={this.showTotalPeople}>
                  {this.state.showTotalPeople
                    ? 'Hide Total People Report'
                    : 'Show Total People Report'}
                </Button>
                <i
                  className="fa fa-info-circle"
                  data-tip
                  data-for="totalPeopleTip"
                  data-delay-hide="0"
                  aria-hidden="true"
                  style={{ paddingLeft: '.32rem' }}
                />
                <ReactTooltip id="totalPeopleTip" place="bottom" effect="solid">
                  Click this button to see exactly how many total people have contributed time to
                  the projects for a designated time period.
                  <br />
                  Peole must have had at least 10 hours logged for them to be included.
                  <br />
                  A 'Total Hours' section will show the total tangible time logged by all people
                  during the selected period.
                  <br />A detail report will list all the people and hours contributed by each
                  during that time period.
                </ReactTooltip>
              </div>
              <div className="total-report-item">
                <Button color="info" onClick={this.showTotalTeam}>
                  {this.state.showTotalTeam ? 'Hide Total Team Report' : 'Show Total Team Report'}
                </Button>
                <i
                  className="fa fa-info-circle"
                  data-tip
                  data-for="totalTeamTip"
                  data-delay-hide="0"
                  aria-hidden="true"
                  title=""
                  style={{ paddingLeft: '.32rem' }}
                />
                <ReactTooltip id="totalTeamTip" place="bottom" effect="solid">
                  Click this button to see exactly how many total teams have contributed time to the
                  projects for a designated time period.
                  <br />
                  The team must have had at least 10 hours logged for them to be included.
                  <br />
                  A 'Total Hours' section will show the total tangible time logged by all the teams
                  during the selected period.
                  <br />A detail report will list all the teams and hours contributed by each during
                  that time period.
                </ReactTooltip>
              </div>
            </div>
          </div>
        </div>
        <div className="table-data-container mt-5">
          {this.state.showPeople && <PeopleTable userProfiles={this.state.peopleSearchData} />}
          {this.state.showProjects && <ProjectTable projects={this.state.projectSearchData} />}
          {this.state.showTeams && <TeamTable allTeams={this.state.teamSearchData} />}
          {this.state.showTotalProject && (
            <TotalProjectReport
              startDate={this.state.startDate}
              endDate={this.state.endDate}
              userProfiles={userProfiles}
            />
          )}
          {this.state.showTotalPeople && (
            <TotalPeopleReport
              startDate={this.state.startDate}
              endDate={this.state.endDate}
              userProfiles={userProfiles}
            />
          )}
          {this.state.showTotalTeam && (
            <TotalTeamReport
              startDate={this.state.startDate}
              endDate={this.state.endDate}
              userProfiles={userProfiles}
              allTeams={allTeams}
              passTeamMemberList={this.setTeamMemberList}
              savedTeamMemberList={this.state.teamMemberList}
            />
          )}
        </div>
      </Container>
    );
  }
}

const mapStateToProps = state => ({ state });

export default connect(mapStateToProps, {
  fetchAllProjects,
  getAllUserTeams,
  getAllUserProfile,
  fetchAllTasks,
})(ReportsPage);
