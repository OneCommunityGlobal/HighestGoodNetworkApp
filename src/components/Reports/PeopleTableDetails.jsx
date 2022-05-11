import React, { useState } from 'react';
import {
  Container, Button, Modal, ModalBody, ModalFooter, Card, CardTitle, CardBody, CardImg, CardText, UncontrolledPopover,
} from 'reactstrap';
import { connect } from 'react-redux';
import TableFilter from './TableFilter'
import TableHeader from './TableHeader'
import './PeopleTableDetails.css';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import TextSearchBox from '../UserManagement/TextSearchBox';

const PeopleTableDetails = (props) => {

  const [name, setName] = useState('');
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('');
  const [resources, setResources] = useState('');
  const [active, setActive] = useState('');
  const [assign, setAssign] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [order, setOrder] = useState('');
  const [deleteId, setDeleteId] = useState('')
  const [deleteName, setDeleteName] = useState('')
  const [deletePopup, setDeletePopup] = useState(false);
  const [editPopup, setEditPopup] = useState(false);
  const [startDate, setStartDate] =useState('');
  const [endDate, setEndDate] =useState('');
  const [link, setLink]=useState('');
  const onTaskNameSearch = (text) => {
    setName(text);
  };

  const searchPriority = (text) => {
    setPriority(text);
  }

  const searchEstimatedHours = (text) => {
    setEstimatedHours(text);
  }

  const searchResources = (text) => {
    setResources(text);
  }

  const searchStatus = (text) => {
    setStatus(text);
  }

  const searchActive = (text) => {
    setActive(text);
  }

  const searchAssign = (text) => {
    setAssign(text);
  }

  const resetFilters = () => {
    setName('');
    setPriority('');
    setStatus('');
    setResources('');
    setOrder('');
    setActive('');
    setAssign('');
    setEstimatedHours('');
  }

  const filterTasks = (tasks) => {
    let simple=[];
    let filteredList = tasks.filter((task) => {
      if (task.taskName.toLowerCase().indexOf(name.toLowerCase()) > -1 &&
        (!priority.toLowerCase() || task?.priority?.toLowerCase().indexOf(priority.toLowerCase()) > -1) &&
        (!status.toLowerCase() || task?.status?.toLowerCase().indexOf(status.toLowerCase()) > -1) &&
        (!resources.toLowerCase() || task?.resources[0].forEach(t=>{
          t.name.toLowerCase().indexOf(resources.toLowerCase()) > -1})
        ) &&
        
        (!active.toLowerCase() || task?.active?.toLowerCase().indexOf(active.toLowerCase()) > -1) &&
        (!estimatedHours.toLowerCase() || task?.estimatedHours?.toLowerCase().indexOf(estimatedHours.toLowerCase()) > -1) &&
        (!assign.toLowerCase() || task?.assign?.toLowerCase().indexOf(assign.toLowerCase()) > -1)) {
          return true;     
      }
    });
    // let filteredList = tasks.filter((task) => {
    //   (!resources.toLowerCase()||task.resources[0].forEach(person=>{
    //     if (person.name.toLowerCase().indexOf(resources.toLowerCase())>-1){
    //       simple.push(task);
    //     }
    //   }))
      
    // });
    // filteredList=filteredList.filter(task=>{
    //    (!resources.toLowerCase() || task?.resources[0].filter(t=>{
    //     t.name.toLowerCase().includes(resources.toLowerCase())}))
    // })
    // console.log(filteredList.length);
    // console.log(filteredList);
    return filteredList;
  }
  let toggleMoreResourcesStatus = true;
  const toggleMoreResources = (id) => {
    let x=document.getElementById(id);
    // let hidden = x.getAttribute("hidden");
    if (toggleMoreResourcesStatus) {
      x.style.display = 'table-cell';
    } else {
      x.style.display = 'none';
    }
    toggleMoreResourcesStatus = !toggleMoreResourcesStatus;
  }
  let filteredTasks = filterTasks(props.taskData);
  return (
    <Container fluid>
      <table className="table table-bordered">
        <thead>
        <TableHeader />
        <TableFilter
          onTaskNameSearch={onTaskNameSearch}
          searchPriority={searchPriority}
          searchResources={searchResources}
          searchStatus={searchStatus}
          searchActive={searchActive}
          searchAssign={searchAssign}
          searchEstimatedHours={searchEstimatedHours}
          resetFilters={resetFilters}
          name={name}
          order={order}
          priority={priority}
          status={status}
          resources={resources}
          active={active}
          assign={assign}
          estimatedHours={estimatedHours}
          startDate={startDate}
          EndDate={endDate}
          Link={link}
        />
        </thead>
        <tbody>
        {filteredTasks.map((value) =>
          <tr key={value._id} >
            <td >{value.taskName}</td>
            <td >{value.priority}</td>
            <td >{value.status}</td>
            <td >
              {value.resources?.map(res=>
                
                res.map((resource,index)=>{
                  if(index<2){
                    return <img alt={resource.name} src={resource.profilePic||'/pfp-default.png'}  
                              className='img-circle' auto="format" title={resource.name}/>
                    
                  }
              }),
            )}
              {value.resources?.map(res=>
              res.length >2 ? <a className="name resourceMoreToggle" onClick={() => 
                      toggleMoreResources(value._id)}>
                  <span className="dot">{res.length - 2}+</span>
                </a>:null
              )}
              <tr id={value._id} class="extra" >
                <td class="extra1" >
                  {value.resources?.map(res=>
                    res.map((resource,index)=>{
                      if(index>=2){
                        return <img alt={resource.name} src={resource.profilePic||'/pfp-default.png'} 
                         className='img-circle' auto="format" title={resource.name}/>
                      }
                  }),
                )}
                </td>
              </tr>
              
            </td>
            <td >{value.active}</td>
            <td >{value.assign}</td>
            <td >{value.estimatedHours}</td>
            <td >{value.startDate}</td>
            <td >{value.endDate}</td>
            <td >
                
                <Popup trigger={<button className="button"></button>} modal>
                    <div>Why This Task is important</div>
                    <textarea
                        className='rectangle'
                        type="text"
                        value={value.whyInfo}
                    />
                    <div>Design Intent</div>
                    <textarea
                        className='rectangle'
                        type="text"
                        value={value.intentInfo}
                        // onChange={this.handleChange}
                    />
                    <div>End State</div>
                    <textarea
                        className='rectangle'
                        type="text"
                        value={value.endstateInfo}
                        // onChange={this.handleChange}
                    />
                </Popup>
            </td>
          </tr>)}
        </tbody>
      </table>
    </Container >
  );
};


export default PeopleTableDetails;
