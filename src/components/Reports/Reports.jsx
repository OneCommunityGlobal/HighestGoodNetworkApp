import React, { Component } from 'react'
import { fetchAllProjects } from '../../actions/projects'
import { connect } from 'react-redux'
import { getAllUserTeams } from '../../actions/allTeamsAction';
// import AllProjects from './AllProjects'
import TeamTable from './TeamTable'
import PeopleTable from './PeopleTable'
import ProjectTable from './ProjectTable'
import { getAllUserProfile } from '../../actions/userManagement';
import { ACTIVE, TEAM_NAME } from '../../languages/en/ui'
import CreateNewTeamPopup from '../Teams/CreateNewTeamPopup'
import moment from 'moment'


class ReportsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showProjects: false,
      showPeople: false,
      showTeams: false,
      // projectTarget: {
      //   projectName: '',
      //   projectId: -1,
      //   active: false
      // },
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

  setIsActive = () => {
    console.log(this.state.checkActive)
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
    // this.setInActive()
  }

  // setActive(){
  //   this.setState(()=>({
  //     return {isActive:"true"}
  //   }))
  // }

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
    console.log('here set inactive')
    this.setState(()=>({
      checkActive:'false'
    }))
  }

  showProjectTable() {
    this.setState(prevState => ({
      showProjects: !prevState.showProjects,
      showPeople: false,
      showTeams: false,
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

  render() {
    let { projects} = this.props.state.allProjects;
    let { allTeams } = this.props.state.allTeamsData;
    // const teamTable = this.teamTableElements(allTeams);
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

    // // Display project lists
    // let ProjectsList = [];
    // if (projects.length > 0) {
    //   ProjectsList = projects.map((project, index) =>
    //     <AllProjects
    //       key={project._id}
    //       index={index}
    //       projectId={project._id}
    //       name={project.projectName}
    //       active={project.isActive}
    //       onClickActive={this.onClickActive}
    //     />
    //     );
    // }

    return (
      <div>
        {/*<div className="jumbotron">ReportsPage</div>*/}
        <div>
          <nav className="navbar navbar-expand-md navbar-light bg-light mb-3 nav-fill">
            <li className="navbar-brand">Generate Report:</li>
          </nav>
          <a>Select a Category</a>
          <button style={{margin:'3px'}} exact className="btn btn-secondary btn-bg mt-3" onClick={this.showProjectTable}>Project</button>
          <button style={{margin:'3px'}} exact className="btn btn-secondary btn-bg mt-3" onClick={this.showPeopleTable}>Person</button>
          <button style={{margin:'3px'}} exact className="btn btn-secondary btn-bg mt-3" onClick={this.showTeamsTable}>Team</button>
          <div>
          <a>Select a Filter</a>

            <input name='radio' type="radio" style={{margin:'5px'}} value="active" onChange={this.setActive}  />
            Active
            <input name='radio' type="radio" style={{margin:'5px'}} value="inactive" onChange={this.setInActive } />
            InActive
            <input name='radio' type="radio" style={{margin:'5px'}} value="all" onChange={this.setAll }defaultChecked />
            All

          {/*<button style={{margin:'3px'}} exact className="btn btn-secondary btn-bg mt-3" onClick={this.setActive}>Active</button>*/}

          {/*<button style={{margin:'3px'}} exact className="btn btn-secondary btn-bg mt-3" onClick={this.setActive}>InActive</button>*/}

          {/*<button style={{margin:'3px'}} exact className="btn btn-secondary btn-bg mt-3" defaultChecked>All</button>*/}

          <button style={{margin:'5px'}} type="submit" className="btn btn-primary btn-bg mt-3">
            Submit
          </button>
            </div>

        </div>

        {this.state.showPeople && <PeopleTable userProfiles={userProfiles}/>}

        {this.state.showProjects &&<ProjectTable projects={projects}/>}

        {/*// <table className="table table-bordered table-responsive-sm">*/}
        {/*//   <thead>*/}
        {/*//   <ProjectTable />*/}
        {/*//   </thead>*/}
        {/*//   <tbody>*/}
        {/*//   {ProjectsList}*/}
        {/*//   </tbody>*/}
        {/*// </table>}*/}
        {this.state.showTeams &&<TeamTable allTeams={allTeams}/>}

        {/*{this.state.showTeams && <div><div>*/}
        {/*  <button style={{margin:'3px'}} exact className="btn btn-secondary btn-bg mt-3">Date</button>*/}
        {/*  <button style={{margin:'3px'}} exact className="btn btn-secondary btn-bg mt-3">Priority Level</button>*/}
        {/*  <button style={{margin:'3px'}} exact className="btn btn-secondary btn-bg mt-3">Status</button>*/}
        {/*  <button style={{margin:'3px'}} exact className="btn btn-secondary btn-bg mt-3">Manager</button>*/}
        {/*  <button style={{margin:'3px'}} exact className="btn btn-secondary btn-bg mt-3">Estimated Hours</button>*/}
        {/*  <button style={{margin:'3px'}} exact className="btn btn-secondary btn-bg mt-3">Ready for Review</button>*/}
        {/*</div></div>}*/}
        {/*{this.state.showTeams &&*/}
        {/*  <table className="table table-bordered table-responsive-sm">*/}
        {/*    <thead>*/}
        {/*    <tr>*/}
        {/*      <th scope="col" id="teams__order">#</th>*/}
        {/*      <th scope="col">{TEAM_NAME}</th>*/}
        {/*      <th scope="col" id="teams__active">{ACTIVE}</th>*/}
        {/*    </tr>*/}
        {/*    </thead>*/}
        {/*    <tbody>*/}
        {/*    {teamTable}*/}
        {/*    </tbody>*/}
        {/*  </table>*/}
        {/*}*/}
      </div>

    )
  }

  teamTableElements = (allTeams) => {
    if (allTeams && allTeams.length > 0) {
      const teamSearchData = this.filteredTeamList(allTeams);
      /*
      * Builiding the table body for teams returns
       * the rows for currently selected page .
       * Applying the Default sort in the order of created date as well
       */
      return teamSearchData.sort((a, b) => {
        if (a.createdDatetime > b.createdDatetime) return -1;
        if (a.createdDatetime < b.createdDatetime) return 1;
        return 0;
      }).map((team, index) => (
        <TeamTable
          key={team._id}
          index={index}
          name={team.teamName}
          teamId={team._id}
          active={team.isActive}
          // onMembersClick={this.onTeamMembersPopupShow}
          // onDeleteClick={this.onDeleteTeamPopupShow}
          // onStatusClick={this.onTeamStatusShow}
          // onEditTeam={this.onEidtTeam}
          // onClickActive={this.onClickActive}
          team={team}
        />
      ));
    }
  }
  filteredTeamList = (allTeams) => {
    const filteredList = allTeams.filter((team) => {
      // Applying the search filters before creating each team table data element
      if ((team.teamName
        && team.teamName.toLowerCase().indexOf(this.state.teamNameSearchText.toLowerCase()) > -1
        && this.state.wildCardSearchText === '')
        // the wild card search, the search text can be match with any item
        || (this.state.wildCardSearchText !== ''
          && (team.teamName.toLowerCase().indexOf(this.state.wildCardSearchText.toLowerCase()) > -1
          ))
      ) {
        return team;
      }
    });

    return filteredList;
  }


}
//export default ReportsPage
const mapStateToProps = state => { return { state } }

export default connect(mapStateToProps, {
  fetchAllProjects,  getAllUserTeams,getAllUserProfile
})(ReportsPage);


