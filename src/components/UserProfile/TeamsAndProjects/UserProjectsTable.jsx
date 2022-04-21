import React, { useState } from 'react';
import { Button, Col } from 'reactstrap';
import './TeamsAndProjects.css';
import hasPermission from '../../../utils/permissions';

const UserProjectsTable = React.memo((props) => {
  //const [addProjectPopupOpen, showProjectPopup] = useState(false);

  return (
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
          {props.edit && (
            <Col md="5">
              {hasPermission(props.role, 'assignUserInProject') ? (
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
            <tr>
              <th>#</th>
              <th>Project Name</th>
              {hasPermission(props.role, 'assignUserInProject') ? (
                <th>{}</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {props.userProjectsById.length > 0 ? (
              props.userProjectsById.map((project, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{`${project.projectName}`}</td>
                  {props.edit && (
                    <td>
                      <Button
                        color="danger"
                        disabled={!hasPermission(props.role, 'unassignUserInProject')}
                        onClick={(e) => {
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
  );
});
export default UserProjectsTable;
