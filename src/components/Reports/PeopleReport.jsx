import React , { Component }from 'react';
import '../Teams/Team.css';
import { Dropdown, DropdownButton } from "react-bootstrap";
import { connect } from 'react-redux'
import { getUserProfile,getUserTask} from '../../actions/userProfile';
import {getUserProjects} from '../../actions/userProjects'
import _ from 'lodash'
import { getWeeklySummaries, updateWeeklySummaries } from '../../actions/weeklySummaries'
import moment from 'moment'
import InputRange from 'react-input-range';
import "react-input-range/lib/css/index.css"



class PeopleReport extends Component {
  constructor(props) {
    super(props);
    this.props=props
    this.state = {
      userProfile: {},
      userTask:[],
      userProjects:{},
      userId: '',
      isLoading: true,
      infringments:{},
      isAssigned:false,
      isActive:false,
      priority:'',
      status:'',
      hasFilter:true,
      allClassification:[],
      classification:'',
      users:""
    }

    this.setStatus=this.setStatus.bind(this)
    this.setPriority=this.setPriority.bind(this)
    this.setActive=this.setActive.bind(this)
    this.setAssign=this.setAssign.bind(this)
    this.setFilter=this.setFilter.bind(this)
    this.setClassfication=this.setClassfication.bind(this)
    this.setUsers=this.setUsers.bind(this)

  }


  async componentDidMount() {
    if (this.props.match) {
      const { userId } = this.props.match.params.userId
      await this.props.getUserProfile(this.props.match.params.userId)
      await this.props.getUserTask(this.props.match.params.userId)
      await this.props.getUserProjects(this.props.match.params.userId)
      await this.props.getWeeklySummaries(this.props.match.params.userId);
      this.setState({
          userId: this.props.match.params.userId,
          isLoading: false,
          userProfile: {
            ...this.props.userProfile,
          },
        userTask :[
          ...this.props.userTask
        ],
        userProjects:{
            ...this.props.userProjects
        },
        allClassification:
          [...Array.from(new Set(this.props.userTask.map((item) => item.classification)))],


        infringments : this.props.userProfile.infringments
        },()=>
        console.log(this.state.userProjects)
      )
    }

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

  setFilter(filterValue) {
    this.setState((state) => {
      return {
        hasFilter:filterValue
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
      userProfile,
      infringments,
      userTask,
      userProjects,
      isAssigned,
      isActive,
      priority,
      status,
      hasFilter,
      allClassification,
      classification,
      users
    } = this.state
    const {
      firstName,
      lastName,
      weeklyComittedHours,
      totalComittedHours
    } = userProfile

    const UserTask = props => {
      let userTaskList = []
      if (props.userTask.length > 0) {
        let tasks=props.userTask
          tasks = props.userTask.filter(item => item.isActive === props.isActive
            && item.isAssigned === props.isAssigned);
          if (!(props.priority === "")) {
            tasks=props.userTask.filter(item => item.priority == props.priority &&item.isActive === props.isActive
              && item.isAssigned === props.isAssigned)
          }

          if  (!(props.status === "")) {
            tasks=props.userTask.filter(item => item.status == props.status &&item.isActive === props.isActive
              && item.isAssigned === props.isAssigned)
          }
        if  (!(props.classification === "")) {
          tasks=tasks.filter(item => item.classification === props.classification)
        }

        if  (!(props.users === "")) {
          let test=[]
          for(var i = 0; i < tasks.length; i++) {
for (var j=0;j< tasks[i].resources.length;j++){
  if (tasks[i].resources[j].name===users){
    test.push(tasks[i])
  }
           }
          }
tasks=test
        }


          userTaskList = tasks.map((task, index) => (
          <tr id={"tr_" + task._id}>
            <th scope="row">
              <div>{index + 1}</div>
            </th>
            <td>
              {task.taskName}
            </td>
            <td>
              {task.priority}
            </td>
            <td>
              {task.status}
            </td>
            <td>
              {task.startedDatetime}
            </td>
            <td>
              {task.dueDatetime}
            </td>

            <td className='projects__active--input' >
              {task.isActive ?
                <tasks className="isActive"><i className="fa fa-circle" aria-hidden="true"></i></tasks> :
                <div className="isNotActive"><i className="fa fa-circle-o" aria-hidden="true"></i></div>}
            </td>

            <td className='projects__active--input' >
              {task.isAssigned ?
                <div className="isActive">Assign</div> :
                <div className="isNotActive">Not Assign</div>}
            </td>
            <td className='projects__active--input' >
              {task.classification}
            </td>
            <td className='projects__active--input' >
              {task.resources.map(resource => (
                <div class="new-line" key={resource._id}><li>{resource.name}</li></div>
              ))}
            </td>

            <td className='projects__active--input'>
              {task.estimatedHours.toFixed(2)}
            </td>
          </tr>
        ))}
      return (
        <div>
          <h2>Total: {userTaskList.length}</h2>
          <table className="center">
            <table className="table table-bordered table-responsive-sm">
              <thead>
              <tr>
                <th scope="col" id="projects__order">#</th>
                <th scope="col">Task Name</th>
                <th scope="col" id="projects__active">Priority</th>
                <th scope="col" id="projects__active">Status</th>
                <th scope="col" id="projects__active">startedDate</th>
                <th scope="col" id="projects__active">dueDate</th>
                <th scope="col" id="projects__active">isActive</th>
                <th scope="col" id="projects__active">isAssigned</th>
                <th scope="col" id="projects__active">classification</th>
                <th scope="col" id="projects__active">resources</th>
                <th scope="col" id="projects__active">Estimated Hours</th>
              </tr>
              </thead>

              <tbody>

              { userTaskList}
              </tbody>
            </table>
          </table>
        </div>
      )
    }
    const UserProject = props => {
      let userProjectList = []
      return (
        <div>
          <h1>User Task</h1>
          { userProjectList }
        </div>
      )
    }

    const ClassificationOptions = props => {
      return (
        <DropdownButton style={{margin:'3px'}} exact id="dropdown-basic-button" title="Classification">
        {props.allClassification.map((c, index) => (
            <Dropdown.Item onClick={()=>this.setClassfication(c)}>{c}</Dropdown.Item>
          ))}
        </DropdownButton>
      )
    };

    const UserOptions = props => {

      let users=[]
      props.userTask.map((task, index) => (
        task.resources.map(resource => (
         users.push(resource.name)

         // filter(item => item.classification === props.classification)


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


    const Infringments = props => {
      let BlueSquare = []
      if (props.infringments.length > 0) {
        BlueSquare = props.infringments.map((current, index) => (
          <tr className="teams__tr">
          <td>
            {current.date}
          </td>
          <td>
            {current.description}
          </td>
          </tr>
        ))}
      return (

        <table className="center">
          <table className="table table-bordered table-responsive-sm">
            <thead>
            <tr>
              <th scope="col" id="projects__order">Date</th>
              <th scope="col">description</th>
            </tr>
            </thead>
            <tbody>
            { BlueSquare }
            </tbody>
          </table>
        </table>
      )
    }
    const StartDate = (props) => {
        return (
          <h2>Start Date:{moment(props.userProfile.createdDate).format('YYYY-MM-DD')}</h2>
    )
    };

      return (
        <table>
          <DropdownButton id="dropdown-basic-button" title="Time Frame">
            <Dropdown.Item href="#/action-1">Past Week</Dropdown.Item>
            <Dropdown.Item href="#/action-2">Past Two Weeks</Dropdown.Item>
            <Dropdown.Item href="#/action-3">Past Month</Dropdown.Item>
            <Dropdown.Item href="#/action-4">Past 6 Months</Dropdown.Item>
            <Dropdown.Item href="#/action-5">Past Year</Dropdown.Item>
            <Dropdown.Item href="#/action-6">Custom range</Dropdown.Item>
          </DropdownButton>
          <div>
            <h1
              style={{ display: 'inline-block', marginRight: 10 }}
            >Name: {`${firstName} ${lastName}`}</h1>
            <h2>Weekly Comitted Hours:{weeklyComittedHours}</h2>
            <h2>Total Comitted Hours:{totalComittedHours}</h2>
            <StartDate userProfile={userProfile}/>
            <Infringments infringments={infringments}/>
          </div>
            <h2>Tasks</h2>
          <div>
            <button style={{margin:'3px'}} exact className="btn btn-secondary btn-bg mt-3" onClick={()=>this.setFilter(false)}>No Filter</button>

            <DropdownButton id="dropdown-basic-button" title="Assignment Status">
              <Dropdown.Item  onClick={()=>this.setAssign(true)}>Assign</Dropdown.Item>
              <Dropdown.Item onClick={()=>this.setAssign(false)}>Not Assign</Dropdown.Item>
            </DropdownButton>

            <input name='radio' type="radio" style={{margin:'5px'}} value="active" onChange={()=>this.setActive(true)}  />
            Active
            <input name='radio' type="radio" style={{margin:'5px'}} value="inactive" onChange={()=>this.setActive(false) } />
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
            {/*<button style={{margin:'3px'}} exact className="btn btn-secondary btn-bg mt-3">User</button>*/}
            <button style={{margin:'3px'}} exact className="btn btn-secondary btn-bg mt-3">Estimated Hours</button>
            {/*<InputRange*/}
            {/*  maxValue={20}*/}
            {/*  minValue={0}*/}
            {/*  // value={this.state.value}*/}
            {/*  // onChange={value => this.setState({ value })}*/}
            {/*/>*/}

            {/*<button style={{margin:'3px'}} exact className="btn btn-secondary btn-bg mt-3">Classification</button>*/}

            <ClassificationOptions allClassification={allClassification}/>
            <UserOptions userTask={userTask}/>

            {/*<DropdownButton style={{margin:'3px'}} exact id="dropdown-basic-button" title="Classification">*/}
            {/*  */}
            {/*/!*{allClassification.map((state) => {*!/*/}
            {/*/!*  return <Dropdown.Item value={state}>{state}*!/*/}
            {/*/!*  </Dropdown.Item>;*!/*/}
            {/*/!*})}*!/*/}
            {/*</DropdownButton>*/}
          </div>

            <UserTask userTask={userTask}
                      isAssigned={isAssigned}
                      isActive={isActive}
                      priority={priority}
                      status={status}
                      // hasFilter={hasFilter}
                      classification={classification}
                       users={users}
            />
          <h2>Projects</h2>
          <UserProject userProjects={userProjects}/>

        </table>
      )
    }
}


const mapStateToProps = state => ({
  auth: state.auth,
  userProfile: state.userProfile,
  userTask: state.userTask,
  // userProject:state.userProject,
  infringments: state.userProfile.infringments,
  user: _.get(state, 'user', {}),
  timeEntries: state.timeEntries,
  userProjects: state.userProjects,
  allProjects: _.get(state, 'allProjects'),
  allTeams: state,
  isAssigned:state.isAssigned,
  isActive:state.isActive,
  priority:state.priority,
  status:state.status,
  hasFilter: state.hasFilter,
  allClassification:state.allClassification,
  classification:state.classification,
  users:state.users
});

export default connect(mapStateToProps, {
  getUserProfile,
  getWeeklySummaries,
  updateWeeklySummaries,
  getUserTask,
  getUserProjects
})(PeopleReport);
