import React from 'react';
import { Row } from 'reactstrap';
import ProjectSummary from './ProjectSummary';

const ProjectsList = ({ projects }) => {
  return (
    <Row className="ml-0 mt-2 text-center">
      {projects.length > 0 ? (
        <ul className="projects-list">
          {projects.map(project => (
            <li className="project-summary" key={project.projectId}>
              <ProjectSummary project={project} />
            </li>
          ))}
        </ul>
      ) : (
        <p>No projects data</p>
      )}
    </Row>
  );
};

export default ProjectsList;
