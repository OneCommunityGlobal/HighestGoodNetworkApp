import React, { useState } from 'react';
import { Button } from 'reactstrap';
import { boxStyle, boxStyleDark } from '~/styles';
import { Link } from 'react-router-dom';

function ProjectTable({ projects, darkMode }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(projects.length / itemsPerPage);

  const paginatedProjects = projects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const ProjectsList = paginatedProjects.map((project, index) => (
    <tr data-testid={`project-row-${project._id}`} key={project._id}>
      <th scope="row" className={darkMode ? 'text-light' : ''}>
        <div>{(currentPage - 1) * itemsPerPage + index + 1}</div>
      </th>
      <td>
        <Link to={`/projectreport/${project._id}`} className={darkMode ? 'text-light' : ''}>
          {project.projectName}
        </Link>
      </td>
      <td>
        {project.isActive ? (
          <div className="isActive">
            <i className="fa fa-circle" data-testid="status-icon" aria-hidden="true" />
          </div>
        ) : (
          <div className="isNotActive">
            <i className="fa fa-circle-o" data-testid="status-icon" aria-hidden="true" />
          </div>
        )}
      </td>
    </tr>
  ));

  return (
    <>
      <table
        className={`table ${darkMode ? 'bg-yinmn-blue' : 'table-bordered'}`}
        style={darkMode ? boxStyleDark : boxStyle}
      >
        <thead>
          <tr className={darkMode ? 'bg-space-cadet text-light' : ''}>
            <th scope="col" id="projects__order">#</th>
            <th scope="col">Project Name</th>
            <th scope="col" id="projects__active">Active</th>
          </tr>
        </thead>
        <tbody className={darkMode ? 'dark-mode' : ''}>{ProjectsList}</tbody>
      </table>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center mt-3 gap-2">
          <Button
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            Previous
          </Button>

          <span className={darkMode ? 'text-light' : ''}>
            Page {currentPage} of {totalPages}
          </span>

          <Button
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </>
  );
}

export default ProjectTable;