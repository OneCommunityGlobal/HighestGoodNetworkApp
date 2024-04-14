import { useState, useEffect } from 'react';
import 'reactjs-popup/dist/index.css';
import { Container } from 'reactstrap';
import './PeopleTableDetails.css';
import { NewModal } from '../common/NewModal';
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
  const [isMobile, setisMobile] = useState(false);
  useEffect(() => {
    function handleResize() {
      const w = window.innerWidth
      if (w <= 400) {

        setisMobile(true);
      }
    }
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);



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
      if (
        task.taskName.toLowerCase().includes(name.toLowerCase()) &&
        task?.estimatedHours?.toLowerCase().includes(estimatedHours.toLowerCase())
      ) {
        return true;
      }
    });
    // addtasknamelist
    filterTaskslist = filterTaskslist.filter(task => {
      let tasklist = []
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
  const { taskData } = props;
  const filteredTasks = filterTasks(taskData);
  const filteredOptions = filterOptions(taskData)

  const renderMobileFilteredTask = (value) => {
    return (
      <div className="mobile-table">
        <div key={value._id} >
          <h5 >Task :</h5>
          <div>  {value.taskName}</div>
          <h5 >Priority :</h5>
          <div >{value.priority}</div>
          <h5 >Status :</h5>
          <div > {value.status}</div>
          <h5 >Resources:</h5>
          <div >
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
            {value.resources?.map((res, index) =>
              res.length > 2 ? (
                <button
                  key={index}
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
            <h5 >Active: {value.active === 'Yes' ? <span>&#10003;</span> : <span>&#10060;</span>}</h5>

          </div>
          <div className="people-table-center-cell">
            <h5 >Assign: {value.assign === 'Yes' ? <span>&#10003;</span> : <span>&#10060;</span>}</h5>
          </div>
          <div className="people-table-end-cell">

            <h5 >Estimated Hours: {value.estimatedHours}</h5>
          </div>
          <div className="people-table-end-cell">
            <h5>Start Date: {value.startDate}</h5>
          </div>
          <div className="people-table-end-cell">
            <h5>End Date: {value.endDate}</h5>
          </div>
        </div>
      </div>

    )
  }



  const renderFilteredTask = value => (
    <div>
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
          {value.resources?.map((res, index) =>
            res.length > 2 ? (
              <button
                key={index}
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
      <div className="people-table-row reports-table-head">
        <div>Task</div>
        <div>Priority</div>
        <div>Status</div>
        <div className="people-table-center-cell">Resources</div>
        <div className="people-table-center-cell">Active</div>
        <div className="people-table-center-cell">Assign</div>
        <div className="people-table-end-cell">Estimated Hours</div>
        <div className="people-table-end-cell">Start Date</div>
        <div className="people-table-end-cell">End Date</div>
      </div>
      <div className="people-table">
        {filteredTasks.map(value => (
          <NewModal header="Task info" trigger={() => <> {isMobile ? renderMobileFilteredTask(value) : renderFilteredTask(value)}</>}>
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
