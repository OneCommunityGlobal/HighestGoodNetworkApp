/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prop-types */
import React from 'react';
import './reports.css';
import { Link } from 'react-router-dom';

function ProjectTable(props) {
  // Display project lists
  let ProjectsList = [];
  if (props.projects.length > 0) {
    ProjectsList = props.projects.map((project, index) => (
      <tr id={`tr_${project._id}`}>
        <th scope="row">
          <div>{index + 1}</div>
        </th>
        <td>
          <Link to={`/projectreport/${project._id}`} projectId={project._id}>
            {project.projectName}
          </Link>
        </td>
        <td>
          {project.isActive ? (
            <div className="isActive">
              <i className="fa fa-circle" aria-hidden="true" />
            </div>
          ) : (
            <div className="isNotActive">
              <i className="fa fa-circle-o" aria-hidden="true" />
            </div>
          )}
        </td>
      </tr>
    ));
  }
  return (
    <table className="center">
      <table className="table table-bordered table-responsive-sm">
        <thead>
          <tr className="table-header">
            <th scope="col" id="projects__order">#</th>
            <th scope="col">Project Name</th>
            <th scope="col" id="projects__active">Active</th>
          </tr>
        </thead>
        <tbody>
          {ProjectsList}
        </tbody>
      </table>
    </table>
  );
}
export default ProjectTable;
