import React, { useState, useEffect } from 'react';
import { Button, Col } from 'reactstrap';
import './TeamsAndProjects.css';
import hasPermission from '../../../utils/permissions';
import { useSelector } from 'react-redux';
import styles from './UserProjectsTable.css';
import { boxStyle } from 'styles';
import { useLocation } from 'react-router-dom';

const UserProjectsTable = React.memo(props => {
  const { roles } = useSelector(state => state.role);
  const userPermissions = useSelector(state => state.auth.user?.permissions?.frontPermissions);

  const userProjects = props.userProjectsById;
  const userTasks = props.userTasks;
  const [actualType, setActualType] = useState('active');

  const location = useLocation();
  const currentRoute = location.pathname;
  const isUserProfilePage = currentRoute === '/usermanagement';

  const filterTasksAndUpdateFilter = situation => {
    setActualType(situation);
  };

  const sortedTasksByNumber = userTasks?.sort((a, b) => {
    const enumerate_list_a = a.num.split('.');
    const enumerate_list_b = b.num.split('.');
    const enumerate_a = [...enumerate_list_a, 0, 0, 0, 0].slice(0, 4);
    const enumerate_b = [...enumerate_list_b, 0, 0, 0, 0].slice(0, 4);
    return (
      +enumerate_a[0] - +enumerate_b[0] ||
      +enumerate_a[1] - +enumerate_b[1] ||
      +enumerate_a[2] - +enumerate_b[2] ||
      +enumerate_a[3] - +enumerate_b[3]
    );
  });
  const tasksByProject = userProjects?.map(project => {
    const tasks = [];
    sortedTasksByNumber?.forEach(task => {
      if (task.projectId.includes(project._id)) {
        tasks.push(task);
      }
    });
    return { ...project, tasks };
  });

  const filterTasksByUserTaskSituation = situation => {
    if (sortedTasksByNumber) {
      return userProjects?.map(project => {
        const tasks = [];
        sortedTasksByNumber?.forEach(task => {
          const isCompletedTask = task?.resources?.find(user => user.userID === props.userId)
            .completedTask;
          if (task?.projectId?.includes(project._id)) {
            if (situation === 'active' && !isCompletedTask) {
              tasks.push(task);
            } else if (situation === 'complete' && isCompletedTask) {
              tasks.push(task);
            } else if (situation === 'all') {
              tasks.push(task);
            }
          }
        });
        return { ...project, tasks };
      });
    }
  };

  const [filteredTasks, setFilteredTasks] = useState(filterTasksByUserTaskSituation('active'));

  useEffect(() => {
    setFilteredTasks(() => filterTasksByUserTaskSituation(actualType));
  }, [sortedTasksByNumber, actualType]);

  const removeOrAddTaskFromUser = (task, method) => {
    const resources = [...task.resources];
    const newResources = resources?.map(resource => {
      let newResource = { ...resource };
      if (resource.userID === props.userId) {
        if (method === 'remove') {
          task.status = 'Complete';
          newResource = {
            ...resource,
            completedTask: true,
          };
        } else if (method === 'add') {
          newResource = {
            ...resource,
            completedTask: false,
          };
        }
      }
      return newResource;
    });

    const updatedTask = { ...task, resources: newResources };
    props.updateTask(task._id, updatedTask, method);
  };

  return (
    <div>
      <div className="desktop">
        <div className="projecttable-container">
          <div className="container">
            <div className="row">
              <Col
                md={props.edit ? '7' : '12'}
                style={{
                  backgroundColor: ' #e9ecef',
                  border: '1px solid #ced4da',
                  marginBottom: '10px',
                }}
              >
                <span className="projects-span">Projects</span>
              </Col>
              {props.edit && props.role && (
                <Col md="5">
                  {hasPermission(props.role, 'assignUserInProject', roles, userPermissions) ? (
                    props.disabled ? (
                      <div
                        className="div-addproject"
                        title="Please save changes before assign project"
                      >
                        <Button className="btn-addproject" color="primary" disabled>
                          Assign Project
                        </Button>
                      </div>
                    ) : (
                      <Button
                        className="btn-addproject"
                        color="primary"
                        onClick={() => {
                          props.onButtonClick();
                        }}
                        style={boxStyle}
                      >
                        Assign Project
                      </Button>
                    )
                  ) : (
                    <></>
                  )}
                </Col>
              )}
            </div>
          </div>
          <div style={{ maxHeight: '300px', overflow: 'auto' }}>
            <table className="table table-bordered table-responsive-sm">
              <thead>
                {props.role && (
                  <tr>
                    <th style={{ width: '70px' }}>#</th>
                    <th>Project Name</th>
                    {hasPermission(props.role, 'assignUserInProject', roles, userPermissions) ? (
                      <th style={{ width: '100px' }}>{}</th>
                    ) : null}
                  </tr>
                )}
              </thead>
              <tbody>
                {props.userProjectsById.length > 0 ? (
                  tasksByProject.map((project, index) => (
                    <tr key={project._id}>
                      <td>{index + 1}</td>
                      <td>{`${project.projectName}`}</td>
                      {props.edit && props.role && (
                        <td style={{ width: '103px' }}>
                          <Button
                            color="danger"
                            disabled={
                              !hasPermission(props.role, 'editTask', roles, userPermissions)
                            }
                            onClick={e => {
                              props.onDeleteClicK(project._id);
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
                  style={{
                    backgroundColor: ' #e9ecef',
                    border: '1px solid #ced4da',
                    marginBottom: '10px',
                  }}
                >
                  <span className="projects-span">Tasks</span>
                </Col>
              </div>
              <div
                className="justify-content-end d-flex pb-2"
                style={{ gap: '4px', marginRight: '10px' }}
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
            </div>
            <div style={{ maxHeight: '300px', overflow: 'auto' }}>
              <table className="table table-bordered table-responsive-sm">
                <thead>
                  {props.role && (
                    <tr>
                      <th style={{ width: '70px' }}>#</th>
                      <th>Task Name</th>
                      {hasPermission(props.role, 'assignUserInProject', roles, userPermissions) ? (
                        <th style={{ width: '100px' }}>{}</th>
                      ) : null}
                    </tr>
                  )}
                </thead>
                <tbody>
                  {props.userProjectsById.length > 0 ? (
                    filteredTasks?.map(project =>
                      project.tasks.map(task => {
                        const isCompletedTask = task.resources.find(
                          ({ userID }) => userID === props.userId,
                        ).completedTask;
                        return (
                          <tr key={task._id}>
                            <td>{task.num}</td>
                            <td>{`${task.taskName}`}</td>
                            {!isCompletedTask && props.edit && props.role && (
                              <td>
                                <Button
                                  color="danger"
                                  style={{ ...boxStyle, width: '72px' }}
                                  disabled={
                                    !hasPermission(
                                      props.role,
                                      'unassignUserInProject',
                                      roles,
                                      userPermissions,
                                    )
                                  }
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
                                  disabled={
                                    !hasPermission(
                                      props.role,
                                      'unassignUserInProject',
                                      roles,
                                      userPermissions,
                                    )
                                  }
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
              md={props.edit ? '7' : '12'}
              style={{
                backgroundColor: ' #e9ecef',
                border: '1px solid #ced4da',
                marginBottom: '10px',
              }}
            >
              <span className="projects-span">Projects</span>
            </Col>
            {props.edit && props.role && (
              <Col
                md="5"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {hasPermission(props.role, 'assignUserInProject', roles, userPermissions) ? (
                  props.disabled ? (
                    <div
                      className="div-addproject"
                      title="Please save changes before assign project"
                    >
                      <Button className="btn-addproject" color="primary" disabled>
                        Assign Project
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="btn-addproject"
                      color="primary"
                      onClick={() => {
                        props.onButtonClick();
                      }}
                      style={boxStyle}
                    >
                      Assign Project
                    </Button>
                  )
                ) : (
                  <></>
                )}
              </Col>
            )}
          </div>
          <div style={{ maxHeight: '300px', overflow: 'auto' }}>
            <table className="table table-bordered">
              <thead>
                {props.role && (
                  <tr>
                    <th style={{ width: '70px' }}>#</th>
                    <th>Project Name</th>
                    {hasPermission(props.role, 'assignUserInProject', roles, userPermissions) ? (
                      <th style={{ width: '100px' }}>{}</th>
                    ) : null}
                  </tr>
                )}
              </thead>
              <tbody>
                {props.userProjectsById.length > 0 ? (
                  tasksByProject.map((project, index) => (
                    <tr key={project._id}>
                      <td>{index + 1}</td>
                      <td>{`${project.projectName}`}</td>
                      {props.edit && props.role && (
                        <td style={{ width: '103px' }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Button
                              color="danger"
                              disabled={
                                !hasPermission(props.role, 'editTask', roles, userPermissions)
                              }
                              onClick={e => {
                                props.onDeleteClicK(project._id);
                              }}
                              style={boxStyle}
                            >
                              Delete
                            </Button>
                          </div>
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
                  style={{
                    backgroundColor: ' #e9ecef',
                    border: '1px solid #ced4da',
                    marginBottom: '10px',
                  }}
                >
                  <span className="projects-span">Tasks</span>
                </Col>
              </div>
              <div className="justify-content-end d-flex pb-2" style={{ gap: '4px' }}>
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
            </div>
            <div style={{ maxHeight: '300px', overflow: 'auto' }}>
              <table className="table table-bordered">
                <thead>
                  {props.role && (
                    <tr>
                      <th style={{ width: '70px' }}>#</th>
                      <th>Task Name</th>
                      {hasPermission(props.role, 'assignUserInProject', roles, userPermissions) ? (
                        <th style={{ width: '100px' }}>{}</th>
                      ) : null}
                    </tr>
                  )}
                </thead>
                <tbody>
                  {props.userProjectsById.length > 0 ? (
                    filteredTasks?.map(project =>
                      project.tasks.map(task => {
                        const isCompletedTask = task.resources.find(
                          ({ userID }) => userID === props.userId,
                        ).completedTask;
                        return (
                          <tr key={task._id}>
                            <td>{task.num}</td>
                            <td>{`${task.taskName}`}</td>
                            {!isCompletedTask && props.edit && props.role && (
                              <td>
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <Button
                                    color="danger"
                                    style={{ ...boxStyle, width: '72px' }}
                                    disabled={
                                      !hasPermission(
                                        props.role,
                                        'unassignUserInProject',
                                        roles,
                                        userPermissions,
                                      )
                                    }
                                    onClick={e => removeOrAddTaskFromUser(task, 'remove')}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </td>
                            )}
                            {isCompletedTask && props.edit && props.role && (
                              <td>
                                <Button
                                  color="success"
                                  style={{ ...boxStyle, width: '72px' }}
                                  disabled={
                                    !hasPermission(
                                      props.role,
                                      'unassignUserInProject',
                                      roles,
                                      userPermissions,
                                    )
                                  }
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

export default UserProjectsTable;
