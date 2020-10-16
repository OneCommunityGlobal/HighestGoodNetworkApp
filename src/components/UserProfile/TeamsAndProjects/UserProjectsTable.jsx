import React, { useState } from 'react';
import { Button } from 'reactstrap';
import './TeamsAndProjects.css';

const UserProjectsTable = React.memo((props) => {
  const [addProjectPopupOpen, showProjectPopup] = useState(false);

  return (
    <div className="projecttable-container">
      <div className="container">
        <div className="row">
          <div className="col" style={{ backgroundColor: ' #e9ecef', border: '1px solid #ced4da', marginBottom: '10px' }}>
            <span className="projects-span">Projects</span>
          </div>
          {props.edit && (
          <div className="col">
            {
              props.isUserAdmin
                ? <Button className="btn-addproject" color="primary" onClick={() => { props.onButtonClick(); }}>Assign Project</Button>
                : <></>
            }
          </div>
          )}
        </div>
      </div>
      <div style={{ maxHeight: '300px', overflow: 'auto' }}>
        <table className="table table-bordered table-responsive-sm">
          <thead>
            <tr>
              <th>#</th>
              <th>Project Name</th>
              <th>{}</th>
            </tr>
          </thead>
          <tbody>
            {props.userProjectsById.length > 0
              ? props.userProjectsById.map((project, index) => (
                <tr>
                  <td>{index + 1}</td>
                  <td>{`${project.projectName}`}</td>
                  {props.edit && (<td><Button color="danger" onClick={(e) => { props.onDeleteClicK(project._id); }}>Delete</Button></td>)}
                </tr>
              )) : <></>
            }
          </tbody>

        </table>
      </div>
    </div>
  );
});
export default UserProjectsTable;
