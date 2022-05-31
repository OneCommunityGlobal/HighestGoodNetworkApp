import React, { useState } from 'react';
import {
  Container, Button, Modal, ModalBody, ModalFooter, Card, CardTitle, CardBody, CardImg, CardText, UncontrolledPopover,
} from 'reactstrap';
import { connect } from 'react-redux';
import TableFilter from './TableFilter/TableFilter'
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
      if (task.taskName.toLowerCase().includes(name.toLowerCase())  &&
        (task?.priority?.toLowerCase().includes(priority.toLowerCase()) ) &&
        ( task?.status?.toLowerCase().includes(status.toLowerCase()) ) &&    
        ( task?.active?.toLowerCase().includes(active.toLowerCase()) ) &&
        (task?.estimatedHours?.toLowerCase().includes(estimatedHours.toLowerCase())) &&
        (task?.assign?.toLowerCase().includes(assign.toLowerCase()) )) {
          return true;     
      }
    });
    filteredList = filteredList.filter((task) => {
      let flag = false;
      for (let i = 0; i<task.resources[0].length; i++) {
          if ( task.resources[0][i].name.toLowerCase().includes(resources.toLowerCase() ) ){
              flag = true;
              break;
          }
      }
      return flag;
  })
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
    <Container fluid className="wrapper">
      <table className="table table-bordered people-table">
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
                    return <img key={resource.index} alt={resource.name} src={resource.profilePic||'/pfp-default.png'}  
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
                        return <img key={resource.index} alt={resource.name} src={resource.profilePic||'/pfp-default.png'} 
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
