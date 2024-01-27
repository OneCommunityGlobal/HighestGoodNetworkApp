import { useState } from 'react';
import 'reactjs-popup/dist/index.css';
import { Container } from 'reactstrap';
import './PeopleTableDetails.css';
import NewModal from '../common/NewModal';
import TableFilter from './TableFilter/TableFilter';

function PeopleTableDetails(props) {
  const [name, setName] = useState('');
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('');
  const [resources, setResources] = useState('');
  const [active, setActive] = useState('');
  const [assign, setAssign] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [order, setOrder] = useState('');
  const [startDate] = useState('');
  const [endDate] = useState('');

  const onTaskNameSearch = text => {
    setName(text);
  };

  const searchPriority = text => {
    setPriority(text);
  };

  const searchEstimatedHours = text => {
    setEstimatedHours(text);
  };

  const searchResources = text => {
    setResources(text);
  };

  const searchStatus = text => {
    setStatus(text);
  };

  const searchActive = text => {
    setActive(text);
  };

  const searchAssign = text => {
    setAssign(text);
  };

  const resetFilters = () => {
    setName('');
    setPriority('');
    setStatus('');
    setResources('');
    setOrder('');
    setActive('');
    setAssign('');
    setEstimatedHours('');
  };

  const filterTasks = tasks => {
    // eslint-disable-next-line no-unused-vars
    const simple = [];
    // eslint-disable-next-line array-callback-return,consistent-return
    let filteredList = tasks.filter(task => {
      if (
        task.taskName.toLowerCase().includes(name.toLowerCase()) &&
        task?.priority?.toLowerCase().includes(priority.toLowerCase()) &&
        task?.status?.toLowerCase().includes(status.toLowerCase()) &&
        task?.active?.toLowerCase().includes(active.toLowerCase()) &&
        task?.estimatedHours?.toLowerCase().includes(estimatedHours.toLowerCase()) &&
        task?.assign?.toLowerCase().includes(assign.toLowerCase())
      ) {
        return true;
      }
    });
    filteredList = filteredList.filter(task => {
      let flag = false;
      for (let i = 0; i < task.resources[0].length; i += 1) {
        if (task.resources[0][i].name.toLowerCase().includes(resources.toLowerCase())) {
          flag = true;
          break;
        }
      }
      return flag;
    });
    return filteredList;
  };
  let toggleMoreResourcesStatus = true;
  const toggleMoreResources = id => {
    const x = document.getElementById(id);
    if (toggleMoreResourcesStatus) {
      x.style.display = 'table-cell';
    } else {
      x.style.display = 'none';
    }
    toggleMoreResourcesStatus = !toggleMoreResourcesStatus;
  };
  const { taskData } = props;
  const filteredTasks = filterTasks(taskData);

  const renderFilteredTask = value => (
    <div key={value._id} className="people-table-row people-table-body-row">
      <div>{value.taskName}</div>
      <div>{value.priority}</div>
      <div>{value.status}</div>
      <div>
        {value.resources?.map(res =>
          res.map((resource, index) => {
            if (index < 2) {
              return (
                <img
                  key={resource.index}
                  alt={resource.name}
                  src={resource.profilePic || '/pfp-default.png'}
                  className="img-circle"
                  title={resource.name}
                />
              );
            }
            return null;
          }),
        )}
        {value.resources?.map(res =>
          res.length > 2 ? (
            <button
              type="button"
              className="name resourceMoreToggle"
              onClick={() => toggleMoreResources(value._id)}
            >
              <span className="dot">{res.length - 2}+</span>
            </button>
          ) : null,
        )}
        <div id={value._id} className="extra">
          <div className="extra1">
            {value.resources?.map(res =>
              // eslint-disable-next-line array-callback-return,consistent-return
              res.map((resource, index) => {
                if (index >= 2) {
                  return (
                    <img
                      key={resource.index}
                      alt={resource.name}
                      src={resource.profilePic || '/pfp-default.png'}
                      className="img-circle"
                      title={resource.name}
                    />
                  );
                }
              }),
            )}
          </div>
        </div>
      </div>
      <div className="people-table-center-cell">
        {value.active === 'Yes' ? <span>&#10003;</span> : <span>&#10060;</span>}
      </div>
      <div className="people-table-center-cell">
        {value.assign === 'Yes' ? <span>&#10003;</span> : <span>&#10060;</span>}
      </div>
      <div className="people-table-end-cell">{value.estimatedHours}</div>
      <div className="people-table-end-cell">{value.startDate}</div>
      <div className="people-table-end-cell">{value.endDate}</div>
    </div>
  );

  return (
    <Container fluid className="wrapper">
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
      />
      <div className="people-table-row reports-table-head">
        <div>Task</div>
        <div>Priority</div>
        <div>Status</div>
        <div>Resources</div>
        <div className="people-table-center-cell">Active</div>
        <div className="people-table-center-cell">Assign</div>
        <div className="people-table-end-cell">Estimated Hours</div>
        <div className="people-table-end-cell">Start Date</div>
        <div className="people-table-end-cell">End Date</div>
      </div>
      <div className="people-table">
        {filteredTasks.map(value => (
          <NewModal header="Task info" trigger={() => renderFilteredTask(value)}>
            <div>Why This Task is important</div>
            <textarea className="rectangle" type="text" value={value.whyInfo} />
            <div>Design Intent</div>
            <textarea className="rectangle" type="text" value={value.intentInfo} />
            <div>End State</div>
            <textarea className="rectangle" type="text" value={value.endstateInfo} />
          </NewModal>
        ))}
      </div>
    </Container>
  );
}

export default PeopleTableDetails;
