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
      status:'',
      priority:'',
      isActive:false,
      isAssigned:false,
      allClassification:[],
      classification:'',
      users:""

    }

    this.get_task_by_wbsId=this.get_task_by_wbsId.bind(this)
    this.setStatus=this.setStatus.bind(this)
    this.setPriority=this.setPriority.bind(this)
    this.setActive=this.setActive.bind(this)
    this.setAssign=this.setAssign.bind(this)
    this.setClassfication=this.setClassfication.bind(this)
    this.setUsers=this.setUsers.bind(this)

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
      // console.log('here666')

      while( i< Object.keys(this.props.WbsTasksID).length) {
        // console.log(Object.keys(this.props.WbsTasksID).length)
        // console.log('here777')
        // console.log(this.props.tasks)
        // console.log('9999')
        if (this.props.tasks.fetched) {
          // console .log('here8888')
          var result = this.props.tasks.taskItems.filter(task => task.wbsId == this.props.WbsTasksID[i]);
          // console.log(this.props.tasks)
          // console.log('result111')
          // console.log(result)
          get_tasks.push(result)
          //console.log('result111')
          i+=1
          // if ( Object.keys(result).length<Object.keys(this.props.tasks.taskItems).length) {
          //   console.log('add here?')
          //   get_tasks.push(result)
          //   console.log('get_tasks')
          //
          //   console.log(get_tasks)
          //   console.log('result222222')
          //
          //   console.log(result)
          // }
          // else if(Object.keys(result).length==Object.keys(this.props.tasks.taskItems).length && i==Object.keys(this.props.WbsTasksID).length-1){
          //   get_tasks[0]=result
          //   console.log('add here?222')
          //   break
          // }
          // else{
          //   break
          //   console.log('add here333?')
          // }
        }
      }
    }
    return get_tasks[1]
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
  setAssign(assignValue) {
    this.setState((state) => {
      return {
        isAssigned:assignValue
      }
    });
  }

  setClassfication(classificationValue) {
    this.setState((state) => {
      return {
        classification:classificationValue
      }
    });
  }

  setUsers(userValue) {
    this.setState((state) => {
      return {
        users:userValue
      }
    });
  }


  render() {
    const {
      isAssigned,
      isActive,
      priority,
      status,
      classification
    } = this.state


    var get_tasks=this.get_task_by_wbsId()
    // console.log('get_tasks')
    // console.log(get_tasks)

    const PriorityOptions = props => {


      var allPriorities=[...Array.from(new Set(props.get_tasks.map((item) => item.priority)))]

      return (
        <DropdownButton style={{margin:'3px'}} exact id="dropdown-basic-button" title="Priority">
          {allPriorities.map((c, index) => (
            <Dropdown.Item onClick={()=>this.setPriority(c)}>{c}</Dropdown.Item>
          ))}
        </DropdownButton>
      )
    };

    const StatusOptions = props => {


      var allStatus=[...Array.from(new Set(props.get_tasks.map((item) => item.status)))]

      return (
        <DropdownButton style={{margin:'3px'}} exact id="dropdown-basic-button" title="Status">
          {allStatus.map((c, index) => (
            <Dropdown.Item onClick={()=>this.setStatus(c)}>{c}</Dropdown.Item>
          ))}
        </DropdownButton>
      )
    };

    const ActiveOptions = props => {


      var allOptions=[...Array.from(new Set(props.get_tasks.map((item) => item.isActive.toString())))]

      return (
        <DropdownButton style={{margin:'3px'}} exact id="dropdown-basic-button" title="Active Options">
          {allOptions.map((c, index) => (
            <Dropdown.Item onClick={()=>this.setActive(c)}>{c}</Dropdown.Item>
          ))}
        </DropdownButton>
      )
    };

    const AssignmentOptions = props => {
      var allOptions=[...Array.from(new Set(props.get_tasks.map((item) => item.isAssigned.toString())))]
      return (
        <DropdownButton style={{margin:'3px'}} exact id="dropdown-basic-button" title="Assignment Options">
          {allOptions.map((c, index) => (
            <Dropdown.Item onClick={()=>this.setAssign(c)}>{c}</Dropdown.Item>
          ))}
        </DropdownButton>
      )
    };


    const ClassificationOptions = props => {
      var allClassification=[...Array.from(new Set(props.get_tasks.map((item) => item.classification)))]
      return (
        <DropdownButton style={{margin:'3px'}} exact id="dropdown-basic-button" title="Classification">
          {allClassification.map((c, index) => (
            <Dropdown.Item onClick={()=>this.setClassfication(c)}>{c}</Dropdown.Item>
          ))}
        </DropdownButton>
      )
    };

    const UserOptions = props => {

      let users=[]
      props.get_tasks.map((task, index) => (
        task.resources.map(resource => (
          users.push(resource.name)
        ))
      ))

      users=Array.from(new Set(users))
      return (
        <DropdownButton style={{margin:'3px'}} exact id="dropdown-basic-button" title="Users">
          {users.map((c, index) => (
            <Dropdown.Item onClick={()=>this.setUsers(c)}>{c}</Dropdown.Item>
          ))}
        </DropdownButton>
      )
    };

    return(
      <tbody>
      <div>
        <UserOptions get_tasks={ get_tasks}/>
        <ClassificationOptions get_tasks={get_tasks}/>
<PriorityOptions get_tasks={get_tasks}/>
<StatusOptions get_tasks={get_tasks}/>
        <ActiveOptions get_tasks={get_tasks}/>
        <AssignmentOptions get_tasks={get_tasks}/>
        <button style={{margin:'3px'}} exact className="btn btn-secondary btn-bg mt-3">Estimated Hours</button>
      </div>
      <TasksDetail
        tasks_filter={get_tasks}
        isAssigned={isAssigned}
        isActive={isActive}
        priority={priority}
        status={status}
        classification={classification}
      />
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
  status:state.status,
  classification:state.classification,
  users:state.users

});


export default connect(mapStateToProps, {
  fetchAllTasks
})(TasksTable);
