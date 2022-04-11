import React, { useState } from 'react';
import {
  Container, Button, Modal, ModalBody, ModalFooter, Card, CardTitle, CardBody, CardImg, CardText, UncontrolledPopover,
} from 'reactstrap';
import { connect } from 'react-redux';
import TableFilter from './TableFilter'
import TableHeader from './TableHeader'


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
    let filteredList = tasks.filter((task) => {
      if (task.taskName.toLowerCase().indexOf(name.toLowerCase()) > -1 &&
        (!priority.toLowerCase() || task?.priority?.toLowerCase().indexOf(priority.toLowerCase()) > -1) &&
        (!status.toLowerCase() || task?.status?.toLowerCase().indexOf(status.toLowerCase()) > -1) &&
        (!resources.toLowerCase() || task?.resources?.toLowerCase().indexOf(resources.toLowerCase()) > -1) &&
        (!active.toLowerCase() || task?.active?.toLowerCase().indexOf(active.toLowerCase()) > -1) &&
        (!estimatedHours.toLowerCase() || task?.estimatedHours?.toLowerCase().indexOf(estimatedHours.toLowerCase()) > -1) &&
        (!assign.toLowerCase() || task?.assign?.toLowerCase().indexOf(assign.toLowerCase()) > -1)) {
        return task;
      }
    });

    return filteredList;
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
        />
        </thead>
        <tbody>
        {filteredTasks.map((value) =>
          <tr key={value._id} >
            <td>{value.taskName}</td>
            <td>{value.priority}</td>
            <td>{value.status}</td>
            {/* <td>{value.resources.map(resource=>
                <div>{resource}</div>
                )}
            </td> */}
            <td>{value.resources}</td>
            {/* <td>{value.resources}</td> */}
            {/* const data =[{"name":"test1"},{"name":"test2"}];
              const listItems = data.map((d) => <li key={d.name}>{d.name}</li>; */}
            <td>{value.active}</td>
            <td>{value.assign}</td>
            <td>{value.estimatedHours}</td>
          </tr>)}
        </tbody>
      </table>
    </Container >
  );
};


export default PeopleTableDetails;
