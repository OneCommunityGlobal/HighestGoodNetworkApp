import React, { Component, useState } from 'react'
import '../../Teams/Team.css';
import './PeopleReport.css';
import { Row, Col, Button, ToggleButton,ToggleButtonGroup, Dropdown, DropdownButton } from 'react-bootstrap'
//import { Label, Input, Form } from 'reactstrap'
import { connect } from 'react-redux'
import { getUserProfile,getUserTask} from '../../../actions/userProfile';
import {getUserProjects} from '../../../actions/userProjects'
import _, { lte } from 'lodash'
import { getWeeklySummaries, updateWeeklySummaries } from '../../../actions/weeklySummaries'
import moment from 'moment'
import "react-input-range/lib/css/index.css"
import Collapse from 'react-bootstrap/Collapse'
import * as d3 from 'd3/dist/d3.min'
import { DropdownItem, FormGroup, Label, Input, Form, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';
import { getTimeEntriesForPeriod } from '../../../actions/timeEntries'
import InfringmentsViz from '../InfringmentsViz'
import TimeEntriesViz from '../TimeEntriesViz'
import PeopleTableDetails from '../PeopleTableDetails'
import { ReportHeader } from "../sharedComponents/ReportHeader";
import { ReportPage } from "../sharedComponents/ReportPage";
import { getPeopleReportData } from "./selectors";
import DatePicker from 'react-datepicker'
import httpService from '../../../services/httpService'
import { ENDPOINTS } from '../../../utils/URL'
import { ReportBlock } from '../sharedComponents/ReportBlock';
class PeopleReport extends Component {
  constructor(props) {
    super(props);
    //this.props=props
    this.state = {
      userProfile: {},
      userTask:[],
      userProjects:{},
      userId: '',
      isLoading: true,
      infringments:{},
      isAssigned:"",
      isActive:"",
      priority:'',
      status:'',
      hasFilter:true,
      allClassification:[],
      classification:'',
      users:"",
      classificationList:[],
      priorityList:[],
      statusList:[],
      fromDate: "2016-01-01",
      toDate: this.endOfWeek(0),
      timeEntries: {},
      startDate:'',
      endDate:'',
      fetched:false,
    }
    this.setStatus=this.setStatus.bind(this)
    this.setPriority=this.setPriority.bind(this)
    this.setActive=this.setActive.bind(this)
    this.setAssign=this.setAssign.bind(this)
    this.setFilter=this.setFilter.bind(this)
    this.setClassfication=this.setClassfication.bind(this)
    this.setUsers=this.setUsers.bind(this)
    this.setDate=this.setDate.bind(this)
    this.setStartDate=this.setStartDate.bind(this)
    this.setEndDate=this.setEndDate.bind(this)
  }

  async componentDidMount() {
    if (this.props.match) {
      const userId = this.props.match.params.userId;
      await this.props.getUserProfile(userId)
      await this.props.getUserTask(userId)
      await this.props.getUserProjects(userId)
      await this.props.getWeeklySummaries(userId);
      await this.props.getTimeEntriesForPeriod(userId, this.state.fromDate, this.state.toDate)
      this.setState({
          userId,
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
          infringments : this.props.userProfile.infringments,
          timeEntries : {
            ...this.props.timeEntries,},
        }
      )
    }
    // get user's task from WBS
    // let MemberTasksPromises = [];
    // // console.log(this.state.userProfile);
    // MemberTasksPromises.push(httpService.get(ENDPOINTS.TASKS_BY_userID(this.state.userProfile._id)).catch(err => { if (err.status !== 401) { console.log("Errr") } }))
    // // console.log(MemberTasksPromises);
    //  Promise.all(MemberTasksPromises).then(temp=>{    
    //     this.setState({
    //       userTask:temp[0].data,     
    //   })

    // })
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

  setDate(e) {
    this.setState({ [e.target.name]: e.target.value })
  }

  startOfWeek(offset) {
    return moment()
      .tz('America/Los_Angeles')
      .startOf('week')
      .subtract(offset, 'weeks')
      .format('YYYY-MM-DD')
  }

  endOfWeek(offset) {
    return moment()
      .tz('America/Los_Angeles')
      .endOf('week')
      .subtract(offset, 'weeks')
      .format('YYYY-MM-DD')
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

  setFilter(filterValue) {
    this.setState((state) => {
      return {
        isAssigned:false,
        isActive:false,
        priority:'',
        priorityList: [],
        status:'',
        statusList:[],
        classificationList:[],
        classification:'',
        users:"",
        fromDate:  "2016-01-01",
        toDate: this.endOfWeek(0),
        startDate:'',
        endDate:''
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
      allClassification,
      classification,
      classificationList,
      priorityList,
      statusList,
      users,
      fromDate,
      toDate,
      startDate,
      endDate,
      timeEntries,
    } = this.state
    const {
      firstName,
      lastName,
      weeklyComittedHours,
      totalTangibleHrs
    } = userProfile

    var totalTangibleHrsRound = 0
    if (totalTangibleHrs) {
       totalTangibleHrsRound = totalTangibleHrs.toFixed(2);
    }

    // const ShowCollapse = props => {
    //   const [open, setOpen] = useState(false);
    //   return(
    //     <div>
    //       <Button
    //         onClick={() => setOpen(!open)}
    //         aria-expanded={open}>
    //         {props.resources.length}     ➤
    //       </Button>
    //       <div>
    //         {props.resources[0].name}
    //       </div>

    //       {props.resources.slice(1).map(resource => (
    //         <Collapse in={open}>
    //           <div key={resource._id} white-space="pre-line" white-space="nowrap" className="new-line">
    //             {resource.name}
    //           </div>
    //         </Collapse>
    //       ))}
    //     </div>

    //   )
    // }

    // const ShowTasksCollapse = props => {
    //   const [open, setOpen] = useState(false);
    //   return(
    //     <div>
    //           <table className="center">
    //             <table className="table table-bordered table-responsive-sm">
    //               <thead>
    //               <tr>
    //                 <th scope="col">
    //                   <Button variant="light"
    //                     onClick={() => setOpen(!open)}
    //                     aria-expanded={open}>⬇</Button>
    //                 </th>
    //                 <th scope="col" id="projects__active">Task</th>
    //                 <th scope="col" id="projects__active">Priority</th>
    //                 <th scope="col" id="projects__active">Status</th>
    //                 <th scope="col" >Resources</th>
    //                 <th scope="col" id="projects__active">Active</th>
    //                 <th scope="col" id="projects__active">Assign</th>
    //                 <th scope="col" id="projects__active">Class</th>
    //                 <th scope="col" id="projects__active">Estimated Hours</th>
    //                 <th scope="col">Start Date</th>
    //                 <th scope="col">End Date</th>
    //               </tr>
    //               </thead>
    //               <Collapse in={open}>
    //               <tbody>
    //               { props.userTaskList}
    //               </tbody>
    //               </Collapse>
    //             </table>
    //           </table>
    //     </div>

    //   )
    // }


//     const UserTask = (props) => {
//       let userTaskList = []
//       let tasks=[]

//       tasks=props.userTask
//       if (props.userTask.length > 0) {
//           if (!(props.isActive === "" )) {
//             tasks = props.userTask.filter(item => item.isActive === props.isActive
//             );
//           }
//           if (!(props.isAssigned ==="")) {
//             tasks = props.userTask.filter(item => item.isAssigned === props.isAssigned);
//           }

//         if (props.priorityList.length>0){
//           var i=0
//           var get_tasks=[]
//           while( i< props.priorityList.length) {
//             if (props.priorityList[i] !='Filter Off') {
//               for (var j = 0; j < tasks.length; j++) {
//                 if (tasks[j].priority === props.priorityList[i]) {
//                   get_tasks.push(tasks[j])
//                 }
//               }
//               i += 1
//             }
//             else{
//               get_tasks=props.tasks_filter
//               break
//             }
//           }
//           tasks=get_tasks
//         }

//         if (props.classificationList.length>0){
//           var i=0
//           var get_tasks=[]
//           while( i< props.classificationList.length) {
//             if (props.classificationList[i] !='Filter Off') {
//               for (var j = 0; j < tasks.length; j++) {
//                 if (tasks[j].classification === props.classificationList[i]) {
//                   get_tasks.push(tasks[j])
//                 }
//               }
//               i += 1
//             }
//             else{
//               get_tasks=props.tasks_filter
//               break
//             }
//           }
//           tasks=get_tasks
//         }
//         if (props.statusList.length>0){
//           var i=0
//           var get_tasks=[]
//           while( i< props.statusList.length) {
//             if (props.statusList[i] !='Filter Off') {
//               for (var j = 0; j < tasks.length; j++) {
//                 if (tasks[j].status === props.statusList[i]) {
//                   get_tasks.push(tasks[j])
//                 }
//               }
//               i += 1
//             }
//             else{
//               get_tasks=props.tasks_filter
//               break
//             }
//           }
//           tasks=get_tasks
//         }

//         if  (!(props.users === "")) {
//           let test=[]
//           for(var i = 0; i < tasks.length; i++) {
// for (var j=0;j< tasks[i].resources.length;j++){
//   if (tasks[i].resources[j].name===users){
//     test.push(tasks[i])
//   }
//            }
//           }
// tasks=test
//         }

// if (tasks.length>0) {

//   userTaskList = tasks.map((task, index) => (
//     <tr id={"tr_" + task._id}>
//       <th scope="row">
//         <div>{index + 1}</div>
//       </th>
//       <td>
//         {task.taskName}
//       </td>
//       <td>
//         {task.priority}
//       </td>
//       <td>
//         {task.status}
//       </td>
//       <td>
//         {task.resources.length<=2 ?
//           task.resources.map(resource => (
//             <div key={resource._id}>{resource.name}</div>
//           ))
//           :
//           <ShowCollapse resources={task.resources}/>
//         }
//       </td>

//       <td className='projects__active--input'>
//         {task.isActive ?
//           <tasks className="isActive"><i className="fa fa-circle" aria-hidden="true"></i></tasks> :
//           <div className="isNotActive"><i className="fa fa-circle-o" aria-hidden="true"></i></div>}
//       </td>

//       <td className='projects__active--input'>
//         {task.isAssigned ?
//           <div>Assign</div> :
//           <div>Not Assign</div>}
//       </td>
//       <td className='projects__active--input'>
//         {task.classification}
//       </td>
//       <td className='projects__active--input'>
//         {task.estimatedHours.toFixed(2)}
//       </td>
//       <td>
//         {task.startedDatetime}
//       </td>
//       <td>
//         {task.dueDatetime}
//       </td>
//     </tr>
//   ))
// }
// }
//       return (
//         <>
//         {/*<Row>*/}
//         {/*  <Col>*/}
//         {/*    <h2>Total: {userTaskList.length}</h2>*/}
//         {/*    <div>Selected filters:</div>*/}
//         {/*  </Col>*/}
//         {/*      <div className="row">*/}
//         {/*        <Col>*/}
//         {/*          <Col>*/}
//         {/*            Assignment:*/}
//         {/*          </Col>*/}
//         {/*          <Col>*/}
//         {/*            <ToggleButtonGroup type="checkbox" variant="info">*/}
//         {/*                {isAssigned ?*/}
//         {/*                  <ToggleButton variant="info">Assign</ToggleButton>*/}
//         {/*                  :*/}
//         {/*                  <ToggleButton variant="info">Not Assign</ToggleButton>*/}
//         {/*                }*/}
//         {/*              </ToggleButtonGroup>*/}
//         {/*          </Col>*/}
//         {/*        </Col>*/}
//         {/*        <Col class="block">*/}
//         {/*          <Col>*/}
//         {/*            Active:*/}
//         {/*          </Col>*/}
//         {/*          <Col>*/}
//         {/*            <ToggleButtonGroup type="checkbox" variant="info">*/}
//         {/*              {isActive ?*/}
//         {/*                <ToggleButton variant="info">Active</ToggleButton>*/}
//         {/*                :*/}
//         {/*                <ToggleButton variant="info">InActive</ToggleButton>*/}
//         {/*              }*/}
//         {/*            </ToggleButtonGroup>*/}
//         {/*          </Col>*/}
//         {/*        </Col>*/}

//         {/*        {priorityList.length > 0 ?*/}
//         {/*            <Col class="block">*/}
//         {/*                <Col>*/}
//         {/*                  Priority:*/}
//         {/*                </Col>*/}
//         {/*                <Col>*/}
//         {/*                  <ToggleButtonGroup type="checkbox" variant="info">*/}
//         {/*                  {priorityList.map((c, index) => (*/}
//         {/*                      <ToggleButton variant="info">{c}</ToggleButton>*/}
//         {/*                  ))}*/}
//         {/*                  </ToggleButtonGroup>*/}
//         {/*                </Col>*/}
//         {/*            </Col>*/}
//         {/*          : <></>}*/}

//         {/*        {statusList.length > 0 ?*/}
//         {/*          <Col class="block">*/}
//         {/*            <Col>*/}
//         {/*              Status:*/}
//         {/*            </Col>*/}
//         {/*            <Col>*/}
//         {/*              <ToggleButtonGroup type="checkbox" variant="info">*/}
//         {/*                {statusList.map((c, index) => (*/}
//         {/*                  <ToggleButton variant="info">{c}</ToggleButton>*/}
//         {/*                ))}*/}
//         {/*              </ToggleButtonGroup>*/}
//         {/*            </Col>*/}
//         {/*          </Col>*/}
//         {/*        : <></>}*/}

//         {/*        {classificationList.length > 0 ?*/}
//         {/*          <Col class="block">*/}
//         {/*            <Col>*/}
//         {/*              Classification:*/}
//         {/*            </Col>*/}
//         {/*            <Col>*/}
//         {/*              <ToggleButtonGroup type="checkbox" variant="info">*/}
//         {/*                {classificationList.map((c, index) => (*/}
//         {/*                  <ToggleButton variant="info">{c}</ToggleButton>*/}
//         {/*                ))}*/}
//         {/*              </ToggleButtonGroup>*/}
//         {/*            </Col>*/}
//         {/*          </Col>*/}
//         {/*        : <></>}*/}

//         {/*        {users.length > 0 ?*/}
//         {/*          <Col class="block">*/}
//         {/*          <Col>*/}
//         {/*            User:*/}
//         {/*          </Col>*/}
//         {/*          <Col>*/}
//         {/*            <ToggleButtonGroup type="checkbox" variant="info">*/}
//         {/*                <ToggleButton variant="info">{users}</ToggleButton>*/}
//         {/*            </ToggleButtonGroup>*/}
//         {/*          </Col>*/}
//         {/*          </Col>*/}
//         {/*        : <></>}*/}
//         {/*    </div>*/}
//         {/*</Row>*/}
//         {/*  <Row>*/}
//         {/*     <ShowTasksCollapse userTaskList={userTaskList}/> /!*give margin zero on left & right to prevent cutting the edge *!/*/}
//         {/*  </Row>*/}
//       </>
//       )
//     }
    const UserProject = props => {
      let userProjectList = []
      return (
        <div>
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

    const UserOptions = props => {
      let users=[]
      props.userTask.map((task, index) => (
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
    const ShowInfringmentsCollapse = props => {
      const [open, setOpen] = useState(false);
      return(
        <div>
          <table className="center">
            <table className="table table-bordered table-responsive-sm">
              <thead>
              <tr>
                <th scope="col" id="projects__order">
                  <Button variant="light"
                    onClick={() => setOpen(!open)}
                    aria-expanded={open}>
                    ⬇
                  </Button>
                </th>

                <th scope="col" id="projects__order">Date</th>
                <th scope="col">Description</th>
              </tr>
              </thead>
              <Collapse in={open}>
              <tbody>
              { props.BlueSquare }
              </tbody>
                </Collapse>
            </table>
          </table>

        </div>

      )
    }

    const Infringments = props => {
      let BlueSquare = []
      let dict= {}

      //aggregate infringments
      for (let i = 0; i < props.infringments.length; i++) {
        if (props.infringments[i].date in dict){
          dict[props.infringments[i].date].count+=1
          dict[props.infringments[i].date].des.push(props.infringments[i].description)
        }else{
          dict[props.infringments[i].date]={count:1,des:[props.infringments[i].description]}
        }
      }

      const startdate=Object.keys(dict)[0]
      var startdateStr=""
      if (startdate){
         startdateStr=startdate.toString()

      }
        if (props.infringments.length > 0) {
        BlueSquare = props.infringments.map((current, index) => (
          <tr className="teams__tr">
            <td>{index+1}
              </td>
          <td>
            {current.date}
          </td>
          <td>
            {current.description}
          </td>
          </tr>
        ))}
      return (
        <div>

      <div>
      </div>
          {/*<ShowInfringmentsCollapse BlueSquare={BlueSquare}/>*/}
      </div>
      )
    }
    // const StartDate = (props) => {
    //     return (
    //         <div>Start Date:{moment(props.userProfile.createdDate).format('YYYY-MM-DD')}</div>
    // )
    // };

    // const ActiveOptions = props => {
    //   var allOptions=[...Array.from(new Set(props.get_tasks.map((item) => item.isActive.toString())))]
    //   return (
    //     <DropdownButton style={{margin:'3px'}} exact id="dropdown-basic-button" title="Active Options">
    //       {allOptions.map((c, index) => (
    //         <Dropdown.Item onClick={()=>this.setActive(c)}>{c}</Dropdown.Item>
    //       ))}
    //     </DropdownButton>
    //   )
    // };




    // const PriorityOptions = props => {
    //   var allPriorities=[...Array.from(new Set(props.get_tasks.map((item) => item.priority))).sort()]
    //   allPriorities.unshift("Filter Off")
    //   return (
    //     <DropdownButton style={{margin:'3px'}} exact id="dropdown-basic-button" title="Priority">
    //       {allPriorities.map((c, index) => (
    //         <Dropdown.Item onClick={()=>this.setPriority(c)}>{c}</Dropdown.Item>
    //       ))}
    //     </DropdownButton>
    //   )
    // };



    // const DateRangeSelect = () => {
    //   return(
    //     <div>
    //       <span />
    //             <Form inline className="mb-2">
    //               <FormGroup className="mr-2">
    //               <Label for="fromDate" className="mr-2">
    //                   From
    //               </Label>
    //               <Input
    //                 type="date"
    //                 name="fromDate"
    //                 id="fromDate"
    //                 value={this.state.fromDate}
    //                 onChange={this.setDate}
    //               />
    //               </FormGroup>
    //               <span />
    //               <FormGroup className="mr-2">
    //               <Label for="toDate" className="mr-2">
    //                 To
    //               </Label>
    //               <Input
    //                 type="date"
    //                 name="toDate"
    //                 id="toDate"
    //                 value={this.state.toDate}
    //                 onChange={this.setDate}
    //               />
    //               </FormGroup>
    //           </Form>
    //     </div>
    //   )
    // }

    const PeopleDataTable = props => {
      let peopleData={
        "alertVisible":false,
        "taskData":[
        ],
        "color": null,
        "message": ""
      }
      // console.log(userTask);
      for(let i=0;i<userTask.length;i++){
        let task={
          "taskName":"",
          "priority":"",
          "status":"",
          "resources":[],         
          "active":"",
          "assign":"",
          "estimatedHours":"",
          "_id":"",
          "startDate":"",
          "endDate":"",
          "hoursBest": "",
          "hoursMost": "",
          "hoursWorst": "",
          "whyInfo":"",
          "endstateInfo":"",
          "intentInfo":"",
        }
        let resourcesName= []
        
        if(userTask[i].isActive){
          task.active="Yes";
        }else{
          task.active="No";
        }
        if(userTask[i].isAssigned){
          task.assign="Yes";
        }else{
          task.assign="No";
        }
        task.taskName=userTask[i].taskName;
        task.priority=userTask[i].priority;
        task.status=userTask[i].status;
        let n=userTask[i].estimatedHours;
        task.estimatedHours=n.toFixed(2);
        for(let j=0;j<userTask[i].resources.length;j++){
          let tempResource={
            "name":"",
            "profilePic":""
          }
          if(userTask[i].resources[j].profilePic){
            // resourcesName.push(userTask[i].resources[j].profilePic);
            tempResource.name=userTask[i].resources[j].name;
            tempResource.profilePic=userTask[i].resources[j].profilePic;
            //resourcesName.set(userTask[i].resources[j].name,userTask[i].resources[j].profilePic);
          }      
          else{
            // resourcesName.push("/pfp-default.png");
            tempResource.name=userTask[i].resources[j].name;
            tempResource.profilePic="/pfp-default.png";
            //resourcesName.set(userTask[i].resources[j].name,userTask[i].resources[j].profilePic);
          }
          resourcesName.push(tempResource);
        }
        task._id=userTask[i]._id;
        task.resources.push(resourcesName);
        if(userTask[i].startedDatetime==null){
          task.startDate="null";
        }
        if(userTask[i].endedDatime==null){
          task.endDate="null";
        }
        task.hoursBest=userTask[i].hoursBest;
        task.hoursMost=userTask[i].hoursMost;
        task.hoursWorst=userTask[i].hoursWorst;   
        task.whyInfo=userTask[i].whyInfo;
        task.intentInfo=userTask[i].intentInfo;
        task.endstateInfo=userTask[i].endstateInfo;    
        peopleData.taskData.push(task);
      }
      
      return (
        <PeopleTableDetails taskData={peopleData.taskData}  />
      )
    }

    const renderProfileInfo = () => (
      <ReportHeader src={this.state.userProfile.profilePic} isActive>
        <h1 className="heading">{`${firstName} ${lastName}`}</h1>

        <div className="stats">
          <div>
            <h4>{moment(userProfile.createdDate).format('YYYY-MM-DD')}</h4>
            <p>Start Date</p>
          </div>
          <div>
            <h4>{userProfile.endDate ? userProfile.endDate.toLocaleString().split('T')[0] : 'N/A'}</h4>
            <p>End Date</p>
          </div>
        </div>
      </ReportHeader>
    )

    return (
    <ReportPage renderProfile={renderProfileInfo}>

      <div className='people-report-time-logs-wrapper'>
        <ReportBlock firstColor='#ff5e82' secondColor='#e25cb2' className='people-report-time-log-block'>
          <h3>{weeklyComittedHours}</h3>
          <p>Weekly Committed Hours</p>
        </ReportBlock>
        <ReportBlock firstColor='#b368d2' secondColor='#831ec4' className='people-report-time-log-block'>
          <h3>{this.props.tangibleHoursReportedThisWeek}</h3>
          <p>Hours Logged This Week</p>
        </ReportBlock>
        <ReportBlock firstColor='#64b7ff' secondColor='#928aef' className='people-report-time-log-block'>
            <h3>{infringments.length}</h3>
            <p>Blue squares</p>
        </ReportBlock>
        <ReportBlock firstColor='#ffdb56' secondColor='#ff9145' className='people-report-time-log-block'>
          <h3>{totalTangibleHrsRound}</h3>
          <p>Total Hours Logged</p>
        </ReportBlock>
      </div>

      <ReportBlock>
        <div className="intro_date">
        <h4>Tasks contributed</h4>
        </div>
        {/*<div>*/}
        {/*  <div>*/}
        {/*    From: <DatePicker selected={startDate} onChange={date => this.setStartDate(date)}/>*/}
        {/*    To: <DatePicker selected={endDate} onChange={date => this.setEndDate(date)}/>*/}
        {/*  </div>*/}
        {/*</div>*/}
        <PeopleDataTable/>
        {/* <div>
          <img src={this.state.userProfile.profilePic||'/pfp-default.png'} alt="profile picture" className="test-pic"/>
        </div> */}
        <div className='container'>

          <table>
            {/*<div class="row" style={{justifyContent:'flex-start'}}>*/}
            {/*  <div>*/}
            {/*    <div><button style={{margin:'3px'}} exact className="btn btn-secondary btn-bg mt-3" onClick={()=>this.setFilter()}>Filters Off</button>*/}
            {/*    </div>*/}
            {/*  <div>*/}
            {/*    <input name='radio' type="radio" style={{margin:'5px'}} value="active" onChange={()=>this.setAssign(true)}  />*/}
            {/*    Assigned*/}
            {/*    <input name='radio' type="radio" style={{margin:'5px'}} value="inactive" onChange={()=>this.setAssign(false) } />*/}
            {/*    Not Assigned*/}
            {/*    </div>*/}
            {/*    <div>*/}
            {/*    <input name='radio' type="radio" style={{margin:'5px'}} value="active" onChange={()=>this.setActive(true)}  />*/}
            {/*    Active*/}
            {/*    <input name='radio' type="radio" style={{margin:'5px'}} value="inactive" onChange={()=>this.setActive(false) } />*/}
            {/*    Inactive*/}
            {/*    </div>*/}
            {/*    </div>*/}
            {/*  <div className="row" style={{justifyContent:'space-evenly', margin:'3px'}}>*/}
            {/*    <div>*/}
            {/*      <PriorityOptions get_tasks={userTask}/>*/}
            {/*    </div>*/}
            {/*    <div>*/}
            {/*      <StatusOptions get_tasks={userTask}/>*/}
            {/*    </div>*/}
            {/*    <div>*/}
            {/*      <ClassificationOptions allClassification={allClassification}/>*/}
            {/*    </div>*/}
            {/*    <div>*/}
            {/*      <UserOptions userTask={userTask}/>*/}
            {/*    </div>*/}
            {/*    <div>*/}
            {/*      <DateRangeSelect />*/}
            {/*    </div>*/}
            {/*  </div>*/}
            {/*</div>*/}

              {/* <UserTask userTask={userTask}
                        isAssigned={isAssigned}
                        isActive={isActive}
                        priority={priority}
                        status={status}
                        classification={classification}
                        users={users}
                        classificationList={classificationList}
                        priorityList={priorityList}
                        statusList={statusList}
              /> */}
            <UserProject userProjects={userProjects}/>
            <Infringments infringments={infringments} fromDate={fromDate} toDate={toDate} timeEntries={timeEntries}/>
            <div className='visualizationDiv'>
              <InfringmentsViz infringments={infringments} fromDate={fromDate} toDate={toDate} />
            </div>
            <div className='visualizationDiv'>
              <TimeEntriesViz timeEntries={timeEntries} fromDate={fromDate} toDate={toDate} />
            </div>
          </table>

        </div>
      </ReportBlock>
    </ReportPage>
      )
    }
}

export default connect(getPeopleReportData, {
  getUserProfile,
  getWeeklySummaries,
  updateWeeklySummaries,
  getUserTask,
  getUserProjects,
  getTimeEntriesForPeriod
})(PeopleReport);
