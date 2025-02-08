import React, { useState, useEffect, useMemo } from 'react';
import { Button, Col, Tooltip } from 'reactstrap';
import './TeamsAndProjects.css';
import hasPermission from '../../../utils/permissions';
import styles from './UserProjectsTable.css';
import { boxStyle, boxStyleDark } from 'styles';
import { useLocation } from 'react-router-dom';
import { connect } from 'react-redux';
import EditableInfoModal from 'components/UserProfile/EditableModal/EditableInfoModal';
import { NavItem, UncontrolledTooltip } from 'reactstrap';
import { Link } from 'react-router-dom';

const UserProjectsTable = React.memo(props => {
  const {darkMode} = props;

  const [tooltipOpen, setTooltip] = useState(false);
  const canAssignProjectToUsers = props.hasPermission('assignProjectToUsers');
  const canUpdateTask = props.hasPermission('updateTask');
  const canDeleteProjects = props.hasPermission('deleteProject');
  const canDeleteTasks = props.hasPermission('deleteTask')
  const canPostTask = props.hasPermission('postTask');

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

  const sortedTasksByNumber = useMemo(() => {
    return userTasks?.sort((task1, task2) => task1.num - task2.num);
  }, [userTasks]);

  const tasksByProject = userProjects?.map(project => {
    const tasks = sortedTasksByNumber?.filter(task => task.projectId.includes(project._id));
    return { ...project, tasks };
  });

  const filterTasksByUserTaskSituation = useMemo(() => {
    return (situation) => {
      if (sortedTasksByNumber) {
        return userProjects?.map(project => {
          const filteredTasks = sortedTasksByNumber.filter(task => {
            const isTaskForProject = task.projectId.includes(project._id);
            const isCompletedTask = task.resources?.find(user => user.userID === props.userId)?.completedTask;
    
            if (isTaskForProject) {
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
  }, [sortedTasksByNumber, props.userId, userProjects]);

  const [filteredTasks, setFilteredTasks] = useState(filterTasksByUserTaskSituation('active'));

  useEffect(() => {
    setFilteredTasks(() => filterTasksByUserTaskSituation(actualType));
  }, [sortedTasksByNumber, actualType]);

  const removeOrAddTaskFromUser = (task, method) => {
    const newResources = task.resources?.map(resource => {
      if (resource.userID === props.userId) {
        return {
          ...resource,
          completedTask: method === 'remove'
        };
      }
      return resource;
    });
  
    const updatedTask = {
      ...task,
      resources: newResources,
      status: method === 'remove' ? 'Complete' : 'Started'
    };
  
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
      <div className="desktop" data-testid='userProjectTest'>
        <div className={`projecttable-container ${darkMode ? 'bg-yinmn-blue' : ''}`}>
          <div className="container">
            <div className="row mr-auto">
              <Col
                md='12'
                className={`projects-and-tasks-header d-flex ${darkMode  ? 'bg-space-cadet' : ''}`}
              >
                <span className="projects-span mr-auto pt-2">Projects</span>
                {props.edit && props.role && canAssignProjectToUsers && (
                <Col md="4" className='p-0'>
                  {props.disabled ? (
                    <>
                      <Tooltip placement="bottom" isOpen={tooltipOpen} target="btn-assignproject" toggle={toggleTooltip}>
                        Please save changes before assign project
                      </Tooltip>
                      <Button className="btn-addproject mt-2" id="btn-assignproject" color="primary" style={darkMode ? boxStyleDark : boxStyle} disabled>
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
                    style={darkMode ? boxStyleDark : boxStyle}
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
            <table className={`table table-bordered table-responsive-sm ${darkMode ? 'text-light' : ''}`}>
              <thead className={darkMode ? 'bg-space-cadet' : ''}>
                {props.role && (
                  <tr className={darkMode ? 'bg-space-cadet' : ''}>
                    <th className='table-header'>#</th>
                    <th>Project Name</th>
                    {canPostTask && 
                    <th style={{width: '100px'}}>
                      <div className="d-flex align-items-center">
                        <span className="mr-2">WBS</span>
                          <EditableInfoModal
                            areaName="ProjectTableHeaderWBS"
                            areaTitle="WBS"
                            fontSize={24}
                            isPermissionPage={true}
                            role={props.role}
                            className="p-2"
                            darkMode={darkMode}
                          />
                      </div>
                    </th>}
                    {canAssignProjectToUsers ? <th style={{ width: '100px' }}>{}</th> : null}
                  </tr>
                )}
              </thead>
              <tbody>
                {props.userProjectsById.length > 0 ? (
                  tasksByProject?.map((project, index) => (
                    <tr key={project._id} className={darkMode ? 'bg-yinmn-blue' : ''}>
                      <td>{index + 1}</td>
                      <td>{project.projectName}</td>
                      {props.role && canPostTask && (
                        <td className='table-cell'>
                          <NavItem tag={Link} to={`/project/wbs/${project._id}` } id={`wbs-tooltip-${project._id}`}>
                            <button type="button" className="btn btn-outline-info" style={darkMode ? {} : boxStyle}>
                              <i className="fa fa-tasks" aria-hidden="true"></i>
                            </button>
                          </NavItem>
                          <UncontrolledTooltip placement="left" target={`wbs-tooltip-${project._id}`}>
                            Click to access the Work Breakdown Structures &#40;WBSs&#41; for this project
                          </UncontrolledTooltip>
                        </td>
                      )}
                      {props.edit && props.role && canDeleteProjects &&(
                        <td className='table-cell'>
                          <Button
                            color="danger"
                            disabled={!canUpdateTask}
                            onClick={e => {
                              props.onDeleteClicK(project._id);
                              deleteTasksTemporarily(project._id);
                            }}
                            style={darkMode ? boxStyleDark : boxStyle}
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
                className={`projects-and-tasks-header d-flex flex-row ${darkMode  ? 'bg-space-cadet' : ''}`}
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
                    style={darkMode ? boxStyleDark : boxStyle}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    className="btn btn-success btn-sm"
                    onClick={() => filterTasksAndUpdateFilter('active')}
                    style={darkMode ? boxStyleDark : boxStyle}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => filterTasksAndUpdateFilter('complete')}
                    style={darkMode ? boxStyleDark : boxStyle}
                  >
                    Complete
                  </button>
                </div>
              </Col>
            </div>
            <div className='table-container' data-testid='userProjectTaskTest'>
              <table className={`table table-bordered table-responsive-sm ${darkMode ?'text-light' : ''}`}>
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
                      project?.tasks?.map(task => {
                        const isCompletedTask = task?.resources?.find(
                          ({ userID }) => userID === props.userId,
                        )?.completedTask;
                        return (
                          <tr key={task._id}>
                            <td>{task.num}</td>
                            <td>
                              <span className='opacity-70'>{project.projectName} </span>
                              <br />
                              <Link className="fs-18" to={`/wbs/tasks/${task._id}`}>
                                {task.taskName && `\u2003 ↳ ${task.taskName}`}
                              </Link>
                            </td>
                            {!isCompletedTask && props.edit && props.role && canDeleteTasks && (
                              <td>
                                <Button
                                  color="danger"
                                  style={darkMode ? { ...boxStyleDark, width: '72px' } : { ...boxStyle, width: '72px' }}
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
                                  style={darkMode ? { ...boxStyleDark, width: '72px' } : { ...boxStyle, width: '72px' }}
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
        <div className={`projecttable-container ${darkMode ? 'bg-yinmn-blue' : ''}`}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Col
              md="12"
              className={`d-flex projects-and-tasks-header ${darkMode  ? 'bg-space-cadet text-light' : ''}`}
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
                        style={darkMode ? boxStyleDark : boxStyle}
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
            <table className={`table table-bordered ${darkMode ? 'text-light' : ''}`}>
              <thead>
                {props.role && (
                  <tr>
                    <th className={`table-header ${darkMode ? 'bg-space-cadet' : ''}`}>#</th>
                    <th className={darkMode ? 'bg-space-cadet' : ''}>Project Name</th>
                    {canAssignProjectToUsers ? <th className={darkMode ? 'bg-space-cadet' : ''} style={{ width: '100px' }}>{}</th> : null}
                  </tr>
                )}
              </thead>
              <tbody>
                {props.userProjectsById.length > 0 ? (
                  tasksByProject?.map((project, index) => (
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
                            style={darkMode ? boxStyleDark : boxStyle}
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
                  className={`projects-and-tasks-header d-flex ${darkMode ? 'bg-space-cadet text-light' : ''}`}
                >
                  <span className="projects-span mr-auto pt-2">Tasks</span>
                  <div className="justify-content-end d-flex py-2" style={{ gap: '4px' }}>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => filterTasksAndUpdateFilter('all')}
                      style={darkMode ? boxStyleDark : boxStyle}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      className="btn btn-success btn-sm"
                      onClick={() => filterTasksAndUpdateFilter('active')}
                      style={darkMode ? boxStyleDark : boxStyle}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => filterTasksAndUpdateFilter('complete')}
                      style={darkMode ? boxStyleDark : boxStyle}
                    >
                      Complete
                    </button>
                  </div>
                </Col>
              </div>
            </div>
            <div className='table-container'>
              <table className="table table-bordered">
                <thead className={darkMode ? 'text-light' : ''}>
                  {props.role && (
                    <tr>
                      <th className={`table-header ${darkMode ? 'bg-space-cadet' : ''}`}>#</th>
                      <th className={darkMode ? 'bg-space-cadet' : ''}>Task Name</th>
                      {canAssignProjectToUsers ? <th className={darkMode ? 'bg-space-cadet' : ''} style={{ width: '100px' }}>{}</th> : null}
                    </tr>
                  )}
                </thead>
                <tbody className={darkMode ? 'text-light' : ''}>
                  {props.userProjectsById.length > 0 ? (
                    filteredTasks?.map(project =>
                      project?.tasks?.map(task => {
                        const isCompletedTask = task?.resources?.find(
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
                                  style={darkMode ? { ...boxStyleDark, width: '72px' } : { ...boxStyle, width: '72px' }}
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
                                  style={darkMode ? { ...boxStyleDark, width: '72px' } : { ...boxStyle, width: '72px' }}
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