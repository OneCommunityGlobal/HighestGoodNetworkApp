import React, { Component } from 'react'
import { fetchAllProjects } from '../../actions/projects'
import { connect } from 'react-redux'
import { getAllUserTeams } from '../../actions/allTeamsAction';
import TeamTable from './TeamTable'
import PeopleTable from './PeopleTable'
import ProjectTable from './ProjectTable'
import { getAllUserProfile } from '../../actions/userManagement';
import { fetchAllTasks } from "../../actions/task";
import moment from 'moment';
import { Container } from 'reactstrap';
import ReportTableSearchPanel from './ReportTableSearchPanel';
import { getUserProfile,getUserTask} from '../../actions/userProfile';
import httpService from '../../services/httpService';
import { ENDPOINTS } from '../../utils/URL';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
      teamSearchData:{},
      peopleSearchData:[],
      projectSearchData:{},
      users:{},
      startDate: new Date(),
      endDate: new Date(),
    }
    this.showProjectTable = this.showProjectTable.bind(this);
    this.showPeopleTable =this.showPeopleTable.bind(this);
    this.showTeamsTable=this.showTeamsTable.bind(this)
    this.setActive=this.setActive.bind(this)
    this.setInActive=this.setInActive.bind(this)
    this.setAll=this.setAll.bind(this);
    this.setStartDate=this.setStartDate.bind(this);
    this.setEndDate=this.setEndDate.bind(this);
  }
  setStartDate=(date)=>{
    this.setState(()=>{
      return{
        startDate: date
      }
      })
  }
  setEndDate=(date)=> {
    this.setState( {
        endDate: date
      })
  }
  
  async componentDidMount() {
    this.props.fetchAllProjects(); // Fetch to get all projects
    this.props.getAllUserTeams();
    this.state = {
      showProjects: false,
      showPeople: false,
      showTeams: false,
      checkActive: ''
    }
    this.props.getAllUserProfile();
    // let temp=[];
  //   this.props.state.allUserProfiles.userProfiles.forEach(member=>{
  //     // console.log(member._id);
  //     // this.state.peopleSearchData?.push(httpService.get(ENDPOINTS.USER_PROFILE(member._id)).catch(err => { }))
  //     temp.push(httpService.get(ENDPOINTS.USER_PROFILE(member._id)).catch(err => { }));
  //   })
  //   // console.log(this.state.peopleSearchData);
  //   Promise.all(temp).then(member=>{    
  //     console.log(member.data);
  //     this.setState({
  //       peopleSearchData:member,     
  //   })
  // })
  // console.log(this.state.peopleSearchData);
  }
  
  /**
   * callback for search
   */
  onWildCardSearch = (searchText) => {
    this.setState({
      wildCardSearchText: searchText,

    });
  }

  filteredProjectList = (projects) => {
    const filteredList = projects.filter((project) => {
      // Applying the search filters before creating each team table data element
      if ((project.projectName
        && project.projectName.toLowerCase().indexOf(this.state.teamNameSearchText.toLowerCase()) > -1
        && this.state.wildCardSearchText === '')
        // the wild card search, the search text can be match with any item
        || (this.state.wildCardSearchText !== ''
          && (project.projectName.toLowerCase().indexOf(this.state.wildCardSearchText.toLowerCase()) > -1
          ))
      ) {
        
        return project;
      }
      return false;
    });

    return filteredList;
  }


  filteredTeamList = (allTeams) => {
    const filteredList = allTeams?.filter((team) => {
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
      return false;
    });
    ;
    return filteredList;
  }

  filteredPeopleList = (userProfiles) => {
    const filteredList = userProfiles.filter((userProfile) => {
      // Applying the search filters before creating each team table data element
      if ((userProfile.firstName
        && userProfile.firstName.toLowerCase().indexOf(this.state.teamNameSearchText.toLowerCase()) > -1
        && this.state.wildCardSearchText === '')
        // the wild card search, the search text can be match with any item
        || (this.state.wildCardSearchText !== ''
          && (userProfile.firstName.toLowerCase().indexOf(this.state.wildCardSearchText.toLowerCase()) > -1
          )
        )
        || (this.state.wildCardSearchText !== '' &&
        userProfile.lastName
        && (userProfile.lastName.toLowerCase().indexOf(this.state.wildCardSearchText.toLowerCase()) > -1
          )
        )

      ) {
        return userProfile;
      }
      return false;
    });
    
    return filteredList;
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
    // console.log(this.props.state.allUserProfiles.userProfiles);
    this.setStartDate = new Date();
    this.setEndDate =new Date();
    this.state.teamSearchData = this.filteredTeamList(allTeams);
    this.state.peopleSearchData = this.filteredPeopleList(userProfiles);
    this.state.projectSearchData = this.filteredProjectList(projects);
    if (this.state.checkActive ==='true'){
      this.state.teamSearchData=allTeams.filter(team => team.isActive ===true);
      this.state.projectSearchData=projects.filter(project => project.isActive ===true);
      this.state.peopleSearchData=userProfiles.filter(user => user.isActive ===true);
      this.state.teamSearchData = this.filteredTeamList(this.state.teamSearchData );
      this.state.peopleSearchData = this.filteredPeopleList(this.state.peopleSearchData);
      this.state.projectSearchData = this.filteredProjectList(this.state.projectSearchData);
    }
    else if (this.state.checkActive ==='false'){
      this.state.teamSearchData=allTeams.filter(team => team.isActive ===false);
      this.state.projectSearchData=projects.filter(project => project.isActive ===false);
      this.state.peopleSearchData=userProfiles.filter(user => user.isActive ===false);
      this.state.teamSearchData = this.filteredTeamList(this.state.teamSearchData );
      this.state.peopleSearchData = this.filteredPeopleList(this.state.peopleSearchData);
      this.state.projectSearchData = this.filteredProjectList(this.state.projectSearchData);
    }
     console.log(this.state.peopleSearchData);
    return (
      
      <Container fluid className="bg--white py-3 mb-5">
        <div className='container'>

          <h3 className="mt-3 mb-5">Reports Page</h3>
          <div>
          <a>Select a Category</a>
            </div>

          <button style={{margin:'5px'}} exact className="btn btn-info btn-bg mt-3" onClick={this.showProjectTable}><i className="fa fa-folder" aria-hidden="true"></i>  Projects  {this.state.projectSearchData.length}</button>
          <button style={{margin:'5px'}} exact className="btn btn-info btn-bg mt-3" onClick={this.showPeopleTable}><i className="fa fa-user" aria-hidden="true"></i>  People  {this.state.peopleSearchData.length}</button>
          <button style={{margin:'5px'}} exact className="btn btn-info btn-bg mt-3" onClick={this.showTeamsTable}><i className="fa fa-users" aria-hidden="true"></i>  Teams  {this.state.teamSearchData?.length}</button>
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

              <ReportTableSearchPanel
                onSearch={this.onWildCardSearch}
                onCreateNewTeamClick={this.onCreateNewTeamShow}
              />



            </div>
            <div>
                <td id="task_startDate">Start Date 
                  <DatePicker selected={this.state.startDate} onChange={this.setStartDate} name="startDate" dateFormat="MM/dd/yyyy"/>
                </td>
                <td id="task_EndDate">End Date
                  <DatePicker selected={this.state.endDate} onChange={this.setEndDate} name="endDate" dateFormat="MM/dd/yyyy"/>
                </td>
            </div>

          </div>
          
        </div>
        {this.state.showPeople && <PeopleTable userProfiles={this.state.peopleSearchData}/>}
        {this.state.showProjects &&<ProjectTable projects={this.state.projectSearchData}/>}
        {this.state.showTeams &&<TeamTable allTeams={this.state.teamSearchData}/>}
        </Container>
    
    )
  }

}
//export default ReportsPage
const mapStateToProps = state => { return { state } }

export default connect(mapStateToProps, {
  fetchAllProjects,  getAllUserTeams,getAllUserProfile,fetchAllTasks
})(ReportsPage);


