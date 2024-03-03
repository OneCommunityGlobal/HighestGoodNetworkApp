import React, { useState, useEffect } from 'react';
import { Button, Col, Tooltip } from 'reactstrap';
import './TeamsAndProjects.css';
import hasPermission from '../../../utils/permissions';
import styles from './UserProjectsTable.css';
import { boxStyle } from 'styles';
import { useLocation } from 'react-router-dom';
import { connect } from 'react-redux';

const UserProjectsTable = React.memo(props => {
  const [tooltipOpen, setTooltip] = useState(false);
  
  const canAssignProjectToUsers = props.hasPermission('assignProjectToUsers');
  const canUpdateTask = props.hasPermission('updateTask');
  const canDeleteProjects = props.hasPermission('deleteProject');
  const canDeleteTasks = props.hasPermission('deleteTask')

  const userProjects = props.userProjectsById;
  const userTasks = props.userTasks;
  const [actualType, setActualType] = useState('active');

  const location = useLocation();
  const currentRoute = location.pathname;
  const isUserProfilePage = currentRoute === '/usermanagement';

  const toggleTooltip = () => setTooltip(!tooltipOpen);

  //Situation can be all, active, or complete
  const filterTasksAndUpdateFilter = situation => {
    setActualType(situation);
  };

  const sortedTasksByNumber = userTasks?.sort((task1, task2) => task1.num - task2.num);

  const tasksByProject = userProjects?.map(project => {
    const tasks = sortedTasksByNumber.filter(task => task.projectId.includes(project._id));
    return { ...project, tasks };
  });

  const filterTasksByUserTaskSituation = situation => {
    if (sortedTasksByNumber) {
      return userProjects?.map(project => {
        const tasks = [];
        sortedTasksByNumber?.forEach(task => {
          const isCompletedTask = task?.resources?.find(user => user.userID === props.userId)?.completedTask;
          if (task?.projectId?.includes(project._id)) {
            if (situation === 'active' && !isCompletedTask) {
              return true;
            } else if (situation === 'complete' && isCompletedTask) {
              return true;
            } else if (situation === 'all') {
              return true;
            }
          }
          return false;
        });
  
        return { ...project, tasks: filteredTasks };
      });
    }
  };

  const [filteredTasks, setFilteredTasks] = useState(filterTasksByUserTaskSituation('active'));

  useEffect(() => {
    setFilteredTasks(() => filterTasksByUserTaskSituation(actualType));
  }, [sortedTasksByNumber, actualType]);

  const removeOrAddTaskFromUser = (task, method) => {
    const newResources = task.resources.map(resource => {
      if (resource.userID === props.userId) {
        if (method === 'remove') {
          task.status = 'Complete';
          return { ...resource, completedTask: true };
        } else if (method === 'add') {
          return { ...resource, completedTask: false };
        }
      }
      return resource;
    });
  
    const updatedTask = { ...task, resources: newResources };
    props.updateTask(task._id, updatedTask, method);
  };

  //For updating tasks visually but not saving until user clicks save changes
  const deleteTasksTemporarily = (project_id) => {
    setFilteredTasks(filteredTasks?.filter(project => project._id !== project_id ));
  }

  useEffect(()=>{
    setFilteredTasks(() => filterTasksByUserTaskSituation('active'));
  }, [props.userProjectsById])


  return (
    <div>
      <div className="desktop">
        <div className="projecttable-container">
          <div className="container">
            <div className="row mr-auto">
              <Col
                md='12'
                className='projects-and-tasks-header d-flex'
              >
                <span className="projects-span mr-auto pt-2">Projects</span>
                {props.edit && props.role && canAssignProjectToUsers && (
                <Col md="4" className='p-0'>
                  {props.disabled ? (
                    <>
                      <Tooltip placement="bottom" isOpen={tooltipOpen} target="btn-assignproject" toggle={toggleTooltip}>
                        Please save changes before assign project
                      </Tooltip>
                      <Button className="btn-addproject mt-2" id="btn-assignproject" color="primary" style={boxStyle} disabled>
                        Assign Project
                      </Button>
                    </>
                  ) : (
                    <Button
                    className="btn-addproject mt-2"
                    color="primary"
                    onClick={() => {
                      props.onButtonClick();
                    }}
                    style={boxStyle}
                   >
                    Assign Project
                  </Button>
                  )}
                </Col>
              )}
              </Col>
            </div>
          </div>
          <div className='table-container'>
            <table className="table table-bordered table-responsive-sm">
              <thead>
                {props.role && (
                  <tr>
                    <th className='table-header'>#</th>
                    <th>Project Name</th>
                    {canAssignProjectToUsers ? <th style={{ width: '100px' }}>{}</th> : null}
                  </tr>
                )}
              </thead>
              <tbody>
                {props.userProjectsById.length > 0 ? (
                  tasksByProject.map((project, index) => (
                    <tr key={project._id}>
                      <td>{index + 1}</td>
                      <td>{project.projectName}</td>
                      {props.edit && props.role && canDeleteProjects &&(
                        <td className='table-cell'>
                          <Button
                            color="danger"
                            disabled={!canUpdateTask}
                            onClick={e => {
                              props.onDeleteClicK(project._id);
                              deleteTasksTemporarily(project._id);
                            }}
                            style={boxStyle}
                          >
                            Delete
                          </Button>
                        </td>
                      )}
                    </tr>
                    
                  ))
                ) : (
                  <></>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {!isUserProfilePage && (
          <>
            <div className="projecttable-container">
              <Col
                md={'12'}
                className='projects-and-tasks-header d-flex flex-row'
              >
                <span className="projects-span py-2 mr-auto">Tasks</span>
                <div
                className="justify-content-end d-flex py-2"
                style={{ gap: '4px'}}
                >
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => filterTasksAndUpdateFilter('all')}
                    style={boxStyle}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    className="btn btn-success btn-sm"
                    onClick={() => filterTasksAndUpdateFilter('active')}
                    style={boxStyle}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => filterTasksAndUpdateFilter('complete')}
                    style={boxStyle}
                  >
                    Complete
                  </button>
                </div>
              </Col>
            </div>
            <div className='table-container'>
              <table className="table table-bordered table-responsive-sm">
                <thead>
                  {props.role && (
                    <tr>
                      <th className='table-header'>#</th>
                      <th>Task Name</th>
                      {canAssignProjectToUsers ? <th className='table-cell'>{}</th> : null}
                    </tr>
                  )}
                </thead>
                <tbody>
                  {props.userProjectsById.length > 0 ? (
                    filteredTasks?.map(project =>
                      project.tasks.map(task => {
                        const isCompletedTask = task.resources.find(
                          ({ userID }) => userID === props.userId,
                        )?.completedTask;
                        return (
                          <tr key={task._id}>
                            <td>{task.num}</td>
                            <td>  
                              <span className='opacity-70'>{project.projectName} </span>
                              <br />
                              <span className="fs-18">{task.taskName && `\u2003 ↳ ${task.taskName}`}</span>
                            </td>
                            {!isCompletedTask && props.edit && props.role && canDeleteTasks && (
                              <td>
                                <Button
                                  color="danger"
                                  style={{ ...boxStyle, width: '72px' }}
                                  disabled={!canAssignProjectToUsers}
                                  onClick={e => removeOrAddTaskFromUser(task, 'remove')}
                                >
                                  Delete
                                </Button>
                              </td>
                            )}
                            {isCompletedTask && props.edit && props.role && (
                              <td>
                                <Button
                                  color="success"
                                  style={{ ...boxStyle, width: '72px' }}
                                  disabled={!canAssignProjectToUsers}
                                  onClick={e => removeOrAddTaskFromUser(task, 'add')}
                                >
                                  Add
                                </Button>
                              </td>
                            )}
                          </tr>
                        );
                      }),
                    )
                  ) : (
                    <></>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      <div className="tablet">
        <div className="projecttable-container">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Col
              md="12"
              className='d-flex projects-and-tasks-header'
            >
              <span className="projects-span mr-auto pt-2">Projects</span>
              {props.edit && props.role && (
              <div
                className="pt-2"
              >
                {canAssignProjectToUsers && (
                    <div
                      className="div-addproject"
                      title="Please save changes before assign project"
                      display={props.disabled ? "none" : "block"}
                    >
                      <Button 
                        className="btn-addproject" 
                        color="primary" 
                        disabled={props.disabled ? true : false}
                        onClick={() => {
                          props.onButtonClick();
                        }}
                        style={boxStyle}
                        >
                        Assign Project
                      </Button>
                    </div>
                  )}
              </div>
            )}
            </Col>
          </div>
          <div className='table-container'>
            <table className="table table-bordered">
              <thead>
                {props.role && (
                  <tr>
                    <th className='table-header'>#</th>
                    <th>Project Name</th>
                    {canAssignProjectToUsers ? <th style={{ width: '100px' }}>{}</th> : null}
                  </tr>
                )}
              </thead>
              <tbody>
                {props.userProjectsById.length > 0 ? (
                  tasksByProject.map((project, index) => (
                    <tr key={project._id}>
                      <td>{index + 1}</td>
                      <td>{`${project.projectName}`}</td>
                      {props.edit && props.role && canDeleteProjects && (
                        <td className='table-cell'>
                          <Button
                            color="danger"
                            disabled={!canUpdateTask}
                            onClick={e => {
                              props.onDeleteClicK(project._id);
                              deleteTasksTemporarily(project._id);
                            }}
                            style={boxStyle}
                          >
                            Delete
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <></>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {!isUserProfilePage && (
          <>
            <div className="projecttable-container">
              <div>
                <Col
                  md={'12'}
                  className='projects-and-tasks-header d-flex'
                >
                  <span className="projects-span mr-auto pt-2">Tasks</span>
                  <div className="justify-content-end d-flex py-2" style={{ gap: '4px' }}>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => filterTasksAndUpdateFilter('all')}
                      style={boxStyle}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      className="btn btn-success btn-sm"
                      onClick={() => filterTasksAndUpdateFilter('active')}
                      style={boxStyle}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => filterTasksAndUpdateFilter('complete')}
                      style={boxStyle}
                    >
                      Complete
                    </button>
                  </div>
                </Col>
              </div>
            </div>
            <div className='table-container'>
              <table className="table table-bordered">
                <thead>
                  {props.role && (
                    <tr>
                      <th className='table-header'>#</th>
                      <th>Task Name</th>
                      {canAssignProjectToUsers ? <th style={{ width: '100px' }}>{}</th> : null}
                    </tr>
                  )}
                </thead>
                <tbody>
                  {props.userProjectsById.length > 0 ? (
                    filteredTasks?.map(project =>
                      project.tasks.map(task => {
                        const isCompletedTask = task.resources.find(
                          ({ userID }) => userID === props.userId,
                        )?.completedTask;
                        return (
                          <tr key={task._id}>
                            <td>{task.num}</td>
                            <td>  
                              <span className='opacity-70'>{project.projectName}</span>
                              <br />
                              <span className='fs-18'>{task.taskName && `\u2003 ↳ ${task.taskName}`}</span>
                            </td>
                            {!isCompletedTask && props.edit && props.role && canDeleteTasks && (
                              <td>
                                <Button
                                  color="danger"
                                  style={{ ...boxStyle, width: '72px' }}
                                  disabled={!canAssignProjectToUsers}
                                  onClick={e => removeOrAddTaskFromUser(task, 'remove')}
                                >
                                  Delete
                                </Button>
                              </td>
                            )}
                            {isCompletedTask && props.edit && props.role && (
                              <td>
                                <Button
                                  color="success"
                                  style={{ ...boxStyle, width: '72px' }}
                                  disabled={!canAssignProjectToUsers}
                                  onClick={e => removeOrAddTaskFromUser(task, 'add')}
                                >
                                  Add
                                </Button>
                              </td>
                            )}
                          </tr>
                        );
                      }),
                    )
                  ) : (
                    <></>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
});

export default connect(null, { hasPermission })(UserProjectsTable);

