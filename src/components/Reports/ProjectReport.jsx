import React , { Component,useState }from 'react';
import '../Teams/Team.css';
import { connect } from 'react-redux'
import { Dropdown, DropdownButton } from 'react-bootstrap'
import { getProjectDetail} from '../../actions/project';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fetchAllWBS } from '../../actions/wbs'
import { fetchAllMembers } from '../../actions/projectMembers'
import WbsTable from './WbsTable'
import ProjectMemberTable from './ProjectMemberTable'
import { fetchAllTasks } from '../../actions/task'


class ProjectReport extends Component{
  constructor(props) {
    super(props);
    this.state = {
      project: {},
      projectId:'',
      isLoading: false,
      startDate:'',
      endDate:'',
      showDatePicker:false,
      wbs:{},
      projectMembers:{},
      tasks:{},
      wbsID:[],
    }
    this.setStartDate=this.setStartDate.bind(this)
    this.setEndDate=this.setEndDate.bind(this)
    this.showDatePickerSection=this.showDatePickerSection.bind(this)
  }


  showProjectTable() {
    this.setState(prevState => ({
      showProjects: !prevState.showProjects,
      showPeople: false,
      showTeams: false,
      showTasks: false
    }))
  }

  showDatePickerSection(){
    this.setState(prevState=>({
      showDatePicker: !prevState.showDatePicker
    }))
  }
  setStartDate(date) {
    this.setState((state) => {
      return {
        startDate:date
      }
    });
  }
  setEndDate(date) {
    this.setState((state) => {
      return {
        endDate:date
      }
    });
  }

  async componentDidMount() {
    if (this.props.match) {
      this.props.getProjectDetail(this.props.match.params.projectId)
      this.props.fetchAllWBS(this.props.match.params.projectId)
      this.props.fetchAllMembers(this.props.match.params.projectId)



      this.setState({
        project: {
          ...this.props.project},
        wbs:{
          ...this.props.wbs},
        projectMembers:{
          ...this.props.projectMembers
        },
        projectId: this.props.match.params.projectId,
        isLoading: false,
      })
    }
  }

  render() {
    const {
      project,
      startDate,
      endDate,
      wbs,
      showDatePicker,

      projectMembers
    } = this.state

    const {
      isActive,
      _id,
      projectName,
    } = project


    return(
      <div>
      <DropdownButton id="dropdown-basic-button" title="Time Frame">
        <Dropdown.Item href="#/action-1">Past Week</Dropdown.Item>
        <Dropdown.Item href="#/action-2">Past Two Weeks</Dropdown.Item>
        <Dropdown.Item href="#/action-3">Past Month</Dropdown.Item>
        <Dropdown.Item href="#/action-4">Past 6 Months</Dropdown.Item>
        <Dropdown.Item href="#/action-5">Past Year</Dropdown.Item>
        <Dropdown.Item href="#/action-6" onClick={this.showDatePickerSection}>Custom range</Dropdown.Item>
      </DropdownButton>
      <div>
        {showDatePicker &&
        <div>
          From: <DatePicker selected={startDate} onChange={date => this.setStartDate(date)}/>
          To: <DatePicker selected={endDate} onChange={date => this.setEndDate(date)}/>
        </div>
        }
      </div>

        <h2>Project Name:{projectName}</h2>
        <h2>Project ID:{_id}</h2>
        <h5>Active:{String(isActive)}</h5>
        <WbsTable wbs={wbs}/>
        <ProjectMemberTable projectMembers={projectMembers}/>
      </div>

    )
  }

}
const mapStateToProps = state => ({
  project: state.project,
  wbs: state.wbs,
  projectMembers:state.projectMembers,
  tasks: state.tasks
});

export default connect(mapStateToProps, {
  getProjectDetail,fetchAllWBS,fetchAllMembers,  fetchAllTasks,

})(ProjectReport);
