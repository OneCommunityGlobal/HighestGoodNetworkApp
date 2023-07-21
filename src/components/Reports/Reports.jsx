import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { Container } from 'reactstrap';
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

const DATE_PICKER_MIN_DATE = '01/01/2010';

class ReportsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showProjects: false,
      showPeople: false,
      showTeams: false,
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
    };
    this.showProjectTable = this.showProjectTable.bind(this);
    this.showPeopleTable = this.showPeopleTable.bind(this);
    this.showTeamsTable = this.showTeamsTable.bind(this);
    this.setActive = this.setActive.bind(this);
    this.setInActive = this.setInActive.bind(this);
    this.setAll = this.setAll.bind(this);
  }

  async componentDidMount() {
    this.props.fetchAllProjects(); // Fetch to get all projects
    this.props.getAllUserTeams();
    this.state = {
      showProjects: false,
      showPeople: false,
      showTeams: false,
      checkActive: '',
    };
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

  showProjectTable() {
    this.setState(prevState => ({
      showProjects: !prevState.showProjects,
      showPeople: false,
      showTeams: false,
    }));
  }

  showTeamsTable() {
    this.setState(prevState => ({
      showProjects: false,
      showPeople: false,
      showTeams: !prevState.showTeams,
    }));
  }

  showPeopleTable() {
    this.setState(prevState => ({
      showProjects: false,
      showPeople: !prevState.showPeople,
      showTeams: false,
    }));
  }

  showTasksTable() {
    this.setState(prevState => ({
      showProjects: false,
      showPeople: false,
      showTeams: false,
    }));
  }

  render() {
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
          <h2 className="mt-3 mb-5">Reports Page</h2>
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
          <div className="mt-4 bg-white p-4 rounded-5">
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
              <td id="task_startDate" className="date-picker-item">
                <label for="task_startDate" className="date-picker-label">
                  {' '}
                  Start Date
                </label>
                <DatePicker
                  selected={this.state.startDate}
                  minDate={new Date(DATE_PICKER_MIN_DATE)}
                  maxDate={new Date()}
                  onChange={date => this.setState({ startDate: date })}
                  className="form-control"
                />
              </td>
              <td id="task_EndDate" className="date-picker-item">
                <label for="task_EndDate" className="date-picker-label">
                  {' '}
                  End Date
                </label>
                <DatePicker
                  selected={this.state.endDate}
                  maxDate={new Date()}
                  minDate={new Date(DATE_PICKER_MIN_DATE)}
                  onChange={date => this.setState({ endDate: date })}
                  className="form-control"
                />
              </td>
            </div>
          </div>
        </div>
        <div className="table-data-container mt-5">
          {this.state.showPeople && <PeopleTable userProfiles={this.state.peopleSearchData} />}
          {this.state.showProjects && <ProjectTable projects={this.state.projectSearchData} />}
          {this.state.showTeams && <TeamTable allTeams={this.state.teamSearchData} />}
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
