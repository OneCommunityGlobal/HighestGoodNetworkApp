import React from 'react';
// These styles were not being used
// import './reports.css';
import { Link } from 'react-router-dom';

const ProjectTable = props => {
  // Display project lists
  let ProjectsList = [];
  if (props.projects.length > 0) {
    ProjectsList = props.projects.map((project, index) => (
      <tr id={'tr_' + project._id} key={project._id}>
        <th scope="row">
          <div>{index + 1}</div>
        </th>
        <td>
          <Link to={`/projectreport/${project._id}`}>
            {project.projectName}
          </Link>
        </td>
        <td>
          {project.isActive ? (
            <div className="isActive">
              <i className="fa fa-circle" aria-hidden="true"></i>
            </div>
          ) : (
            <div className="isNotActive">
              <i className="fa fa-circle-o" aria-hidden="true"></i>
            </div>
          )}
        </td>
      </tr>
    ));
  }

  return (
    <table className="table table-bordered">
      <thead>
        <tr>
          <th scope="col" id="projects__order">
            #
          </th>
          <th scope="col">Project Name</th>
          <th scope="col" id="projects__active">
            Active
          </th>
        </tr>
      </thead>
      <tbody>{ProjectsList}</tbody>
    </table>
  );
};
export default ProjectTable;
