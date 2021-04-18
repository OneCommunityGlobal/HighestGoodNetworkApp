import React , { Component }from 'react';
import '../Teams/Team.css';
import { connect } from 'react-redux'
import { Dropdown, DropdownButton } from 'react-bootstrap'
import { fetchAllTasks } from '../../actions/task'
import "react-datepicker/dist/react-datepicker.css";
import TasksDetail from './TasksDetail'

class TasksTable extends Component{
  constructor(props) {
    super(props);
    this.props=props
    this.state = {
      tasks: {},
      tasks_per_project: {},
      tasks_filter: {},
      isAssigned:false,
      isActive:false,
      priority:'',
      status:''

    }
    this.setTasks=this.setTasks.bind(this)
    this.setStatus=this.setStatus.bind(this)
    this.setPriority=this.setPriority.bind(this)
    this.get_task_by_wbsId=this.get_task_by_wbsId.bind(this)
    this.setActive=this.setActive.bind(this)
    // this.setInActive=this.setInActive.bind(this)
    this.setAssign=this.setAssign.bind(this)
    // this.setNotAssign=this.setNotAssign.bind(this)

  }
  setTasks( get_tasks=[]) {
    this.setState((state) => {
      return {
        tasks_filter: get_tasks
      }
    });
  }

  async componentDidMount() {
    this.setState({
      tasks:{
        ...this.props.tasks
      },
      WbsTasksID:{
        ...this.props.WbsTasksID
      },

    })


  }
  get_task_by_wbsId(){
    var get_tasks=[]
    if ( Object.keys(this.props.WbsTasksID).length>0) {
      var i=0
      console.log('here666')

      while( i< Object.keys(this.props.WbsTasksID).length) {
        console.log(Object.keys(this.props.WbsTasksID).length)
        console.log('here777')
        console.log(this.props.tasks)
        console.log('9999')
        if (this.props.tasks.fetched) {
          console.log('here8888')
          var result = this.props.tasks.taskItems.filter(task => task.wbsId == this.props.WbsTasksID[i]);
          console.log(this.props.tasks)
          i+=1
          if ( Object.keys(result).length<Object.keys(this.props.tasks.taskItems).length) {
            get_tasks.push(result)
          }
          else if(Object.keys(result).length==Object.keys(this.props.tasks.taskItems).length && i==Object.keys(this.props.WbsTasksID).length-1){
            get_tasks[0]=result
            break
          }
          else{
            break
          }
        }
      }
    }
    return get_tasks
  }
  setActive(activeValue) {
    this.setState((state) => {
      return {
        isActive:activeValue
      }
    });
  }
  setPriority(priorityValue) {
    this.setState((state) => {
      return {
        priority:priorityValue
      }
    });
  }
  setStatus(statusValue) {
    this.setState((state) => {
      return {
        status:statusValue
      }
    });
  }
  // setInActive(){
  //   this.setState(()=>({
  //     isActive:false
  //   }))
  //
  // }
  setAssign(assignValue) {
    this.setState((state) => {
      return {
        isAssigned:assignValue
      }
    });
  }
  // setNotAssign(){
  //   this.setState(()=>({
  //     isAssigned:false
  //   }))
  // }


  render() {
    const {
      isAssigned,
      isActive,
      priority,
      status
    } = this.state


    var get_tasks=this.get_task_by_wbsId()

    return(
      <tbody>
      <div>
        <DropdownButton id="dropdown-basic-button" title="Assignment Status">
          <Dropdown.Item  onClick={this.setAssign(true)}>Assign</Dropdown.Item>
          <Dropdown.Item onClick={this.setAssign(false)}>Not Assign</Dropdown.Item>
        </DropdownButton>

        <input name='radio' type="radio" style={{margin:'5px'}} value="active" onChange={this.setActive(true)}  />
        Active
        <input name='radio' type="radio" style={{margin:'5px'}} value="inactive" onChange={this.setActive(false) } />
        InActive
        <DropdownButton style={{margin:'3px'}} exact id="dropdown-basic-button" title="Priority Level">
          <Dropdown.Item onClick={()=>this.setPriority('Primary')}>Primary</Dropdown.Item>
          <Dropdown.Item  onClick={()=>this.setPriority('Secondary')}>Secondary</Dropdown.Item>
          <Dropdown.Item  onClick={()=>this.setPriority('Tertiary') }>Tertiary</Dropdown.Item>
        </DropdownButton>
        <DropdownButton style={{margin:'3px'}} exact id="dropdown-basic-button" title="Status">
          <Dropdown.Item onClick={()=>this.setStatus('Complete')}>Complete</Dropdown.Item>
          <Dropdown.Item onClick={()=>this.setStatus('Paused')}>Paused</Dropdown.Item>
          <Dropdown.Item onClick={()=>this.setStatus('Not Started')}>Not Started</Dropdown.Item>
          <Dropdown.Item onClick={()=>this.setStatus('Active')}>Active</Dropdown.Item>
          <Dropdown.Item onClick={()=>this.setStatus('Ready for Final Review')}>Ready for Final Review</Dropdown.Item>
        </DropdownButton>
        <button style={{margin:'3px'}} exact className="btn btn-secondary btn-bg mt-3">User</button>
        <button style={{margin:'3px'}} exact className="btn btn-secondary btn-bg mt-3">Estimated Hours</button>
        <button style={{margin:'3px'}} exact className="btn btn-secondary btn-bg mt-3">Classification</button>
      </div>
      {/*<TasksDetail*/}
      {/*  tasks_filter={get_tasks}*/}
      {/*  isAssigned={isAssigned}*/}
      {/*  isActive={isActive}*/}
      {/*  priority={priority}*/}
      {/*  status={status}*/}
      {/*/>*/}
      </tbody>
    )
  }

}
const mapStateToProps = state => ({
  tasks: state.tasks,
  id_List:state.id_List,
  tasks_filter:state.tasks_filter,
  isAssigned:state.isAssigned,
  isActive:state.isActive,
  priority:state.priority,
  status:state.status
});


export default connect(mapStateToProps, {
  fetchAllTasks
})(TasksTable);
