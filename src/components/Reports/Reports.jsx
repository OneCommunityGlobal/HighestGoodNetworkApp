import React, { Component } from 'react'
import { fetchAllProjects } from '../../actions/projects'
import { connect } from 'react-redux'
import { getAllUserTeams } from '../../actions/allTeamsAction';
import TeamTable from './TeamTable'
import PeopleTable from './PeopleTable'
import ProjectTable from './ProjectTable'
import { getAllUserProfile } from '../../actions/userManagement';
import { fetchAllTasks } from "../../actions/task";
import moment from 'moment'
import { Container } from 'reactstrap'



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
        mediaConfirm: false
      },
      dueDate: moment().tz('America/Los_Angeles').endOf('week').toISOString(),
      dueDateLastWeek: moment().tz('America/Los_Angeles').endOf('week').subtract(1, 'week').toISOString(),
      dueDateBeforeLast: moment().tz('America/Los_Angeles').endOf('week').subtract(2, 'week').toISOString(),
      activeTab: '1',
      errors: {},
      fetchError: null,
      loading: true,
    }
    this.showProjectTable = this.showProjectTable.bind(this);
    this.showPeopleTable =this.showPeopleTable.bind(this);
    this.showTeamsTable=this.showTeamsTable.bind(this)
    this.setActive=this.setActive.bind(this)
    this.setInActive=this.setInActive.bind(this)
    this.setAll=this.setAll.bind(this)
  }

  componentDidMount() {
    this.props.fetchAllProjects(); // Fetch to get all projects
    this.props.getAllUserTeams();
    this.state = {
      showProjects: false,
      showPeople: false,
      showTeams: false,
      checkActive: ''
    }
    this.props.getAllUserProfile();
  }

  setActive() {
    this.setState((state) => {
      return {
        checkActive:'true'
      }
    });
  }

  setAll() {
    this.setState((state) => {
      return {
        checkActive:''
      }
    });
  }

  setInActive(){

    this.setState(()=>({
      checkActive:'false'
    }))
  }

  showProjectTable() {
    this.setState(prevState => ({
      showProjects: !prevState.showProjects,
      showPeople: false,
      showTeams: false,
      // showTasks: false
    }))
  }

  showTeamsTable() {
    this.setState(prevState => ({
      showProjects: false,
      showPeople: false,
      showTeams: !prevState.showTeams,
    }))
  }

  showPeopleTable() {
    this.setState(prevState => ({
      showProjects: false,
      showPeople: !prevState.showPeople,
      showTeams: false,
    }))
      }


  showTasksTable(){
    this.setState(prevState => ({
      showProjects: false,
      showPeople: false,
      showTeams: false,
    }))
  }
  render() {
    let { projects} = this.props.state.allProjects;
    let { allTeams } = this.props.state.allTeamsData;
    let { userProfiles } = this.props.state.allUserProfiles;



    if (this.state.checkActive ==='true'){
      projects = projects.filter(project => project.isActive ===true);
      userProfiles =userProfiles.filter(user => user.isActive ===true);
      allTeams =allTeams.filter(team => team.isActive ===true);
    }
    else if (this.state.checkActive ==='false'){
      projects = projects.filter(project => project.isActive ===false);
      userProfiles =userProfiles.filter(user => user.isActive ===false);
      allTeams =allTeams.filter(team => team.isActive ===false);
    }


    return (
      <Container fluid className="bg--white py-3 mb-5">

        <div className='container'>

          <h3 className="mt-3 mb-5">Reports Page</h3>
          <div>
          <a>Select a Category</a>
            </div>

          <button style={{margin:'5px'}} exact className="btn btn-info btn-bg mt-3" onClick={this.showProjectTable}><i className="fa fa-folder" aria-hidden="true"></i>  Projects  {projects.length}</button>
          <button style={{margin:'5px'}} exact className="btn btn-info btn-bg mt-3" onClick={this.showPeopleTable}><i className="fa fa-user" aria-hidden="true"></i>  People  {userProfiles.length}</button>
          <button style={{margin:'5px'}} exact className="btn btn-info btn-bg mt-3" onClick={this.showTeamsTable}><i className="fa fa-users" aria-hidden="true"></i>  Teams  {allTeams.length}</button>
          <div>
            <div>
          <a >Select a Filter</a>
              </div>
            <div>


              <input name='radio' type="radio" style={{margin:'8px'}} value="active" onChange={this.setActive}  />
            Active
            <input name='radio' type="radio" style={{margin:'8px'}} value="inactive" onChange={this.setInActive } />
            Inactive
            <input name='radio' type="radio" style={{margin:'8px'}} value="all" onChange={this.setAll }defaultChecked />
            All
              </div>
            <div>
          {/*<button style={{margin:'5px'}} type="submit" className="btn btn-primary btn-bg mt-3">*/}
          {/*  Submit*/}
          {/*</button>*/}
            </div>
            </div>
        </div>
        {this.state.showPeople && <PeopleTable userProfiles={userProfiles}/>}
        {this.state.showProjects &&<ProjectTable projects={projects}/>}
        {this.state.showTeams &&<TeamTable allTeams={allTeams}/>}
      {/*</div>*/}
        </Container>

    )
  }

  // teamTableElements = (allTeams) => {
  //   if (allTeams && allTeams.length > 0) {
  //     const teamSearchData = this.filteredTeamList(allTeams);
  //     /*
  //     * Builiding the table body for teams returns
  //      * the rows for currently selected page .
  //      * Applying the Default sort in the order of created date as well
  //      */
  //     return teamSearchData.sort((a, b) => {
  //       if (a.createdDatetime > b.createdDatetime) return -1;
  //       if (a.createdDatetime < b.createdDatetime) return 1;
  //       return 0;
  //     }).map((team, index) => (
  //       <TeamTable
  //         key={team._id}
  //         index={index}
  //         name={team.teamName}
  //         teamId={team._id}
  //         active={team.isActive}
  //         team={team}
  //       />
  //     ));
  //   }
  // }
  // filteredTeamList = (allTeams) => {
  //   const filteredList = allTeams.filter((team) => {
  //     // Applying the search filters before creating each team table data element
  //     if ((team.teamName
  //       && team.teamName.toLowerCase().indexOf(this.state.teamNameSearchText.toLowerCase()) > -1
  //       && this.state.wildCardSearchText === '')
  //       // the wild card search, the search text can be match with any item
  //       || (this.state.wildCardSearchText !== ''
  //         && (team.teamName.toLowerCase().indexOf(this.state.wildCardSearchText.toLowerCase()) > -1
  //         ))
  //     ) {
  //       return team;
  //     }
  //   });
  //
  //   return filteredList;
  // }


}
//export default ReportsPage
const mapStateToProps = state => { return { state } }

export default connect(mapStateToProps, {
  fetchAllProjects,  getAllUserTeams,getAllUserProfile,fetchAllTasks
})(ReportsPage);


