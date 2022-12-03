import React, { useState } from 'react';
import { Button, Col } from 'reactstrap';
import './TeamsAndProjects.css';
import hasPermission from '../../../utils/permissions';
import { useSelector } from 'react-redux';

const UserProjectsTable = React.memo(props => {
  //const [addProjectPopupOpen, showProjectPopup] = useState(false);
  const { roles } = useSelector(state => state.role);
  const userPermissions = useSelector(state => state.auth.user?.permissions?.frontPermissions);

  const userProjects = props.userProjectsById;
  const userTasks = props.userTasks;

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

  const removeTaskFromUser = task => {
    const newResources = task.resources.filter(user => user.userID != props.userId);
    const updatedTask = { ...task, resources: newResources };
    props.updateTask(task._id, updatedTask);
  };

  return (
    <>
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
                  <Button
                    className="btn-addproject"
                    color="primary"
                    onClick={() => {
                      props.onButtonClick();
                    }}
                  >
                    Assign Project
                  </Button>
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
                  <th>#</th>
                  <th>Project Name</th>
                  {hasPermission(props.role, 'assignUserInProject', roles, userPermissions) ? (
                    <th>{}</th>
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
                            //change perms
                            disabled={
                              !hasPermission(props.role, 'editTask', roles, userPermissions)
                            }
                            onClick={e => {
                              props.onDeleteClicK(project._id);
                            }}
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
      </div>
      <div style={{ maxHeight: '300px', overflow: 'auto' }}>
        <table className="table table-bordered table-responsive-sm">
          <thead>
            {props.role && (
              <tr>
                <th style={{width: '70px'}}>#</th>
                <th>Task Name</th>
                {hasPermission(props.role, 'assignUserInProject', roles, userPermissions) ? (
                  <th>{}</th>
                ) : null}
              </tr>
            )}
          </thead>
          <tbody >
            {props.userProjectsById.length > 0 ? (
              tasksByProject.map(project => 
                  project.tasks.map(task => {
                    return (
                      <tr key={task._id}>
                        <td >{task.num}</td>
                        <td>{`${task.taskName}`}</td>
                        {props.edit && props.role && (
                          <td>
                            <Button
                              color="danger"
                              disabled={
                                !hasPermission(
                                  props.role,
                                  'unassignUserInProject',
                                  roles,
                                  userPermissions,
                                )
                              }
                              onClick={e => removeTaskFromUser(task)}
                            >
                              Delete
                            </Button>
                          </td>
                        )}
                      </tr>
                    );
                  })
                  )
            ) : (
              <></>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
});

export default UserProjectsTable;
