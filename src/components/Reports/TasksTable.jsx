import React , { Component }from 'react';
import '../Teams/Team.css';
import { connect } from 'react-redux'
import { Dropdown, DropdownButton, ToggleButton, ToggleButtonGroup } from 'react-bootstrap'
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
      isActive:"",
      isAssigned:"",
      allClassification:[],
      classification:'',
      users:"",
      userList:[],
      classificationList:[],
      priorityList:[],
      statusList:[],
    }

    this.get_task_by_wbsId=this.get_task_by_wbsId.bind(this)
    this.setStatus=this.setStatus.bind(this)
    this.setPriority=this.setPriority.bind(this)
    this.setActive=this.setActive.bind(this)
    this.setAssign=this.setAssign.bind(this)
    this.setClassfication=this.setClassfication.bind(this)
    this.setUsers=this.setUsers.bind(this)
    this.setFilter=this.setFilter.bind(this)
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
      while( i< Object.keys(this.props.WbsTasksID).length) {
        if (this.props.tasks.fetched) {
          var result = this.props.tasks.taskItems.filter(task => task.wbsId == this.props.WbsTasksID[i]);
          get_tasks.push(result)
          i+=1
        }
      }
    }
    return get_tasks[1]
  }

  setFilter(filterValue) {
    this.setState((state) => {
      return {
        isAssigned:"",
        isActive:"",
        priority:'',
        status:'',
        allClassification:[],
        classification:'',
        users:""
      }
    });
  }

  setActive(activeValue) {
    this.setState((state) => {
      return {
        isActive:activeValue
      }
    });
  }
  setPriority(priorityValue) {
    if (priorityValue!='Filter Off') {
      this.setState((state) => {
        return {
          priority: priorityValue,
          priorityList: this.state.priorityList.concat(priorityValue)

        }
      });
    }
    else{
      this.setState((state) => {
        return {
          priority: priorityValue,
          priorityList: []
        }
      });

    }

  }
  setStatus(statusValue) {
    if (statusValue!='Filter Off') {
      this.setState((state) => {
        return {
          status: statusValue,
          statusList: this.state.statusList.concat(statusValue)

        }
      });
    }
    else{
      this.setState((state) => {
        return {
          status: statusValue,
          statusList: []
        }
      });

    }

  }
  setAssign(assignValue) {
    this.setState((state) => {
      return {
        isAssigned:assignValue
      }
    });
  }

  setClassfication(classificationValue) {
    if (classificationValue!='Filter Off') {
      this.setState((state) => {
        return {
          classification: classificationValue,
          classificationList: this.state.classificationList.concat(classificationValue)

        }
      });
    }
    else{
      this.setState((state) => {
        return {
          classification: classificationValue,
          classificationList: []
        }
      });

    }
  }

  setUsers(userValue) {
    if (userValue!='Filter Off') {
      this.setState((state) => {
        return {
          users: userValue,
          userList: this.state.userList.concat(userValue)

        }
      });
    }
    else{
      this.setState((state) => {
        return {
          users: userValue,
          userList: []
        }
      });

    }

    // this.setState((state) => {
    //   return {
    //     users:userValue
    //   }
    // });
  }


  render() {
    const {
      isAssigned,
      isActive,
      priority,
      status,
      classification,
      users,
      classificationList,
      priorityList,
      statusList,
      userList
    } = this.state


    var get_tasks=this.get_task_by_wbsId()
    console.log('yueru get_tasks',get_tasks)


    const PriorityOptions = props => {
      var allPriorities=[...Array.from(new Set(props.get_tasks.map((item) => item.priority))).sort()]
      allPriorities.unshift("Filter Off")
      return (

        // <MultiSelect
        //   options={allPriorities}
        //   // value={selected}
        //   // onChange={setSelected}
        //   // labelledBy="Select"
        // />

        <DropdownButton style={{margin:'3px'}} exact id="dropdown-basic-button" title="Priority">
          {allPriorities.map((c, index) => (
            <Dropdown.Item onClick={()=>this.setPriority(c)}>{c}</Dropdown.Item>
          ))}
        </DropdownButton>
      )
    };

    const StatusOptions = props => {
      var allStatus=[...Array.from(new Set(props.get_tasks.map((item) => item.status))).sort()]
      allStatus.unshift("Filter Off")
      return (
        <DropdownButton style={{margin:'3px'}} exact id="dropdown-basic-button" title="Status">
          {allStatus.map((c, index) => (
            <Dropdown.Item onClick={()=>this.setStatus(c)}>{c}</Dropdown.Item>
          ))}
        </DropdownButton>
      )
    };

    const ActiveOptions = props => {
      var allOptions=[...Array.from(new Set(props.get_tasks.map((item) => item.isActive.toString()))).sort()]
      allOptions.unshift("Filter Off")
      return (
        <DropdownButton style={{margin:'3px'}} exact id="dropdown-basic-button" title="Active Options">
          {allOptions.map((c, index) => (
            <Dropdown.Item onClick={()=>this.setActive(c)}>{c}</Dropdown.Item>
          ))}
        </DropdownButton>
      )
    };

    const AssignmentOptions = props => {
      var allOptions=[...Array.from(new Set(props.get_tasks.map((item) => item.isAssigned.toString()))).sort()]
      allOptions.unshift("Filter Off")
      return (
        <DropdownButton style={{margin:'3px'}} exact id="dropdown-basic-button" title="Assignment Options">
          {allOptions.map((c, index) => (
            <Dropdown.Item onClick={()=>this.setAssign(c)}>{c}</Dropdown.Item>
          ))}
        </DropdownButton>
      )
    };


    const ClassificationOptions = props => {
      var allClassification=[...Array.from(new Set(props.get_tasks.map((item) => item.classification))).sort()]
      allClassification.unshift("Filter Off")
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

      users=Array.from(new Set(users)).sort()
      users.unshift("Filter Off")
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
        <button style={{margin:'3px'}} exact className="btn btn-secondary btn-bg mt-3" onClick={()=>this.setFilter()}>Filter Off</button>
        <UserOptions get_tasks={ get_tasks}/>
        <ClassificationOptions get_tasks={get_tasks}/>
<PriorityOptions get_tasks={get_tasks}/>
<StatusOptions get_tasks={get_tasks}/>
        <input name='radio' type="radio" style={{margin:'5px'}} value="active" onChange={()=>this.setActive(true)}  />
        Active
        <input name='radio' type="radio" style={{margin:'5px'}} value="inactive" onChange={()=>this.setActive(false) } />
        InActive
        <AssignmentOptions get_tasks={get_tasks}/>
        <button style={{margin:'3px'}} exact className="btn btn-secondary btn-bg mt-3">Estimated Hours</button>
      </div>
      <h2>Total: {get_tasks.length}</h2>
      <h2>Selected filters</h2>

      <h5>Assignment Options:
        <ToggleButtonGroup type="checkbox" variant="info">
          {/*<ToggleButton variant="info">{isAssigned}</ToggleButton>*/}
          {isAssigned ?
            <ToggleButton variant="info">Assign</ToggleButton>
            :
            <ToggleButton variant="info">Not Assign</ToggleButton>
          }

        </ToggleButtonGroup>
      </h5>
      <h5>Active Options:
        <ToggleButtonGroup type="checkbox" variant="info">
          {isActive ?
            <ToggleButton variant="info">Active</ToggleButton>
            :
            <ToggleButton variant="info">InActive</ToggleButton>
          }
        </ToggleButtonGroup>
      </h5>

      <h5>Priority Options:
        <ToggleButtonGroup type="checkbox" variant="info">
          {priorityList.map((c, index) => (
            <ToggleButton variant="info">{c}</ToggleButton>
          ))}
        </ToggleButtonGroup>
      </h5>

      <h5>Status Options:
        <ToggleButtonGroup type="checkbox" variant="info">
          {statusList.map((c, index) => (
            <ToggleButton variant="info">{c}</ToggleButton>
          ))}
        </ToggleButtonGroup>
      </h5>

      <h5>Classification Options:
        <ToggleButtonGroup type="checkbox" variant="info">
          {classificationList.map((c, index) => (
            <ToggleButton variant="info">{c}</ToggleButton>
          ))}
        </ToggleButtonGroup>
      </h5>

      <h5>User Options:
        <ToggleButtonGroup type="checkbox" variant="info">
          <ToggleButton variant="info">{users}</ToggleButton>
        </ToggleButtonGroup>
      </h5>
      {/*<h2>Selected filters</h2>*/}
      {/*<div>isAssigned:{isAssigned}</div>*/}
      {/*<div>isActive:{isActive.toString()}</div>*/}
      {/*<div>priority:{priorityList}</div>*/}
      {/*<div>status:{statusList}</div>*/}
      {/*<div>users:{userList}</div>*/}


      <div>classification:
        {classificationList.map(classification => (
         <li>{classification}</li>
        ))}
      </div>
      <TasksDetail
        tasks_filter={get_tasks}
        isAssigned={isAssigned}
        isActive={isActive}
        priority={priority}
        status={status}

        classification={classification}
        users={users}
      classificationList={classificationList}
      priorityList={priorityList}
        statusList={statusList}
        userList={userList}
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
  users:state.users,
  classificationList:state.classificationList,
  priorityList:state.priorityList,
  statusList:state.statusList,
  userList:state.userList

});


export default connect(mapStateToProps, {
  fetchAllTasks
})(TasksTable);
