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
      projectMembers:{}
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
          <button style={{margin:'3px'}} exact className="btn btn-secondary btn-bg mt-3">Date</button>
          <button style={{margin:'3px'}} exact className="btn btn-secondary btn-bg mt-3">Priority Level</button>
          <button style={{margin:'3px'}} exact className="btn btn-secondary btn-bg mt-3">Status</button>
          <button style={{margin:'3px'}} exact className="btn btn-secondary btn-bg mt-3">Manager</button>
          <button style={{margin:'3px'}} exact className="btn btn-secondary btn-bg mt-3">Estimated Hours</button>
          <button style={{margin:'3px'}} exact className="btn btn-secondary btn-bg mt-3">Ready for Review</button>
        </div>
        {this.state.showDatePicker &&
          <div>
            From: <DatePicker selected={startDate} onChange={date => this.setStartDate(date)}/>
            To: <DatePicker selected={endDate} onChange={date => this.setEndDate(date)}/>
          </div>
        }

        <h2>Project Name:{projectName}</h2>
        <h2>Project ID:{_id}</h2>
        <h5>Active:{String(isActive)}</h5>
        <WbsTable wbs={this.state.wbs}/>
        <ProjectMemberTable projectMembers={this.state.projectMembers}/>

        {/*<tbody>*/}
        {/*{*/}
        {/*  WBSItems.map((item, index) =>*/}
        {/*    <tr  id={`tr_${item._id}`} key={item._id}>*/}
        {/*      <th className="teams__order--input" scope="row"><div>{index + 1}</div></th>*/}
        {/*      <th className="teams__order--input" scope="row"><div>{item.wbsName}</div></th>*/}
        {/*      <th className="teams__order--input" scope="row"><div>{String(item.isActive)}</div></th>*/}
        {/*    </tr>*/}
        {/*  )}*/}
        {/*</tbody>*/}
      </div>
    )
  }

}
const mapStateToProps = state => ({
  project: state.project,
  wbs: state.wbs,
  projectMembers:state.projectMembers
});

export default connect(mapStateToProps, {
  getProjectDetail,fetchAllWBS,fetchAllMembers
})(ProjectReport);
