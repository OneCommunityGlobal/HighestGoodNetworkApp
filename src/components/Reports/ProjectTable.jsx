// eslint-disable-next-line no-unused-vars
import React from 'react';
import { boxStyle, boxStyleDark } from 'styles';
// These styles were not being used
// import './reports.css';
import { Link } from 'react-router-dom';

function ProjectTable({ projects, darkMode }) {
  // Display project lists
  let ProjectsList = [];
  if (projects.length > 0) {
    ProjectsList = projects.map((project, index) => (
      <tr id={`tr_${project._id}`} key={project._id}>
        <th scope="row" className={darkMode ? 'text-light' : ''}>
          <div>{index + 1}</div>
        </th>
        <td>
          <Link to={`/projectreport/${project._id}`} className={darkMode ? 'text-light' : ''}>{project.projectName}</Link>
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
    <table className={`table ${darkMode ? 'bg-yinmn-blue' : 'table-bordered'}`} style={darkMode ? boxStyleDark : boxStyle}>
      <thead>
        <tr className={darkMode ? 'bg-space-cadet text-light' : ''}>
          <th scope="col" id="projects__order">
            #
          </th>
          <th scope="col">Project Name</th>
          <th scope="col" id="projects__active">
            Active
          </th>
        </tr>
      </thead>
      <tbody className={darkMode ? 'dark-mode' : ''}>{ProjectsList}</tbody>
    </table>
  );
}
export default ProjectTable;
