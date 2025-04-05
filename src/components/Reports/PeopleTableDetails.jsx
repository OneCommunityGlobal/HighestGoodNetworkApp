import { useState, useEffect } from 'react';
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

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  // useEffect(() => {
  //   function handleResize() {
  //     const w = window.innerWidth
  //     if (w <= 1020) {
  //       setisMobile(true);
  //     } else {
  //       setisMobile(false)
  //     }
  //   }
  //   window.addEventListener('resize', handleResize);

  //   return () => {
  //     window.removeEventListener('resize', handleResize);
  //   };
  // }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    }
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    }
  }, [])

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

  const filterOptions = tasks => {
    let filterTaskslist = tasks.filter(task => {
      return (
        task.taskName.toLowerCase().includes(name.toLowerCase()) &&
        task?.estimatedHours?.toLowerCase().includes(estimatedHours.toLowerCase())
      );
    });
    // addtasknamelist
    filterTaskslist = filterTaskslist.filter(task => {
      const tasklist = []
      for (let i = 0; i < task.taskName.length; i += 1) {
        tasklist.push(task.taskName[i])

      }
      return tasklist
    });
    return filterTaskslist;
  }

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
  const { taskData, darkMode } = props;
  const filteredTasks = filterTasks(taskData);
  const filteredOptions = filterOptions(taskData)

  const renderMobileFilteredTask = (value) => {
    return (
      <div className={`task-card ${darkMode ? 'text-dark' : ''}`}>
        <div key={value._id} >
          <div className='task-header'>
            <div>
              <div className='task-title people-report-task-name task-name-word-break'>
                {value.taskName}
              </div>  
            </div>
            
            <div className='task-status'>
              {value.status}
            </div>
          </div>
          <div className='task-details'>
            <div className='task-info'>
              <div className='sub-head'>Priority</div>
              <div className='sub-details'>{value.priority}</div>
            </div>
            <div className='task-info'>
              <div className='sub-head'>Resources</div>
              <div>{value.resources?.map(res =>
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
              )}</div>
            </div>
            <div className='task-info'>
              <div className='sub-head'>Active</div>
              <div>{value.active === 'Yes' ? <span>&#10003;</span> : <span>&#10060;</span>}</div>
            </div>
            <div className='task-info'>
              <div className='sub-head'>Assign</div>
              <div>{value.assign === 'Yes' ? <span>&#10003;</span> : <span>&#10060;</span>}</div>
            </div>
            <div className='task-info'>
              <div className='sub-head'>Estimated Hours</div>
              <div>{value.estimatedHours}</div>
            </div>
            <div className='task-info'>
              <div className='sub-head'>Start Date</div>
              <div>{value.startDate}</div>
            </div>
            <div className='task-info'>
              <div className='sub-head'>End Date</div>
              <div>{value.endDate}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderFilteredTask = value => (
    <div>
      <div key={value._id} className={`people-table-row people-table-body-row ${darkMode ? 'people-table-row-dark' : ''}`}>
        <div className='people-report-task-name'>{value.taskName}</div>
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
          {value.resources?.map((res) =>
            res.length > 2 ? (
              <button
                key={res[0]?.name || res[0]?.id}
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
    </div>
  );

  // const renderFilteredTask = () => (

  // )
  return (
    <Container fluid className={`wrapper ${darkMode ? 'text-light' : ''}`}>
      <div className="table-filter-container">
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
          taskNameList={filteredOptions}
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
        <button type="button" onClick={resetFilters} className="tasks-table-clear-filter-button">
          Clear Filters
        </button>
      </div>
      <div className={`people-table-row reports-table-head ${darkMode ? 'bg-space-cadet' : ''}`}>
        <div data-testid="task">Task</div>
        <div data-testid="priority">Priority</div>
        <div data-testid="status">Status</div>
        <div data-testid="resources" className="people-table-center-cell">Resources</div>
        <div data-testid="active" className="people-table-center-cell">Active</div>
        <div data-testid="assign" className="people-table-center-cell">Assign</div>
        <div data-testid="eh" className="people-table-end-cell">Estimated Hours</div>
        <div data-testid="sd" className="people-table-end-cell">Start Date</div>
        <div data-testid="ed" className="people-table-end-cell">End Date</div>
      </div>
      <div className="people-table">
        {filteredTasks.map(value => (
          // eslint-disable-next-line react/no-unstable-nested-components
          <NewModal header="Task info" trigger={() => <> {(windowWidth <= 1020) ? renderMobileFilteredTask(value) : renderFilteredTask(value)}</>}>
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