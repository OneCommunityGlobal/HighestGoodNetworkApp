import React from 'react';
import { Row } from 'reactstrap';
import ProjectSummary from './ProjectSummary';

const ProjectsList = ({ projects }) => {
  const listItems = projects.map(project => {
    return (
      <li className="project-summary" key={project.projectId}>
        <ProjectSummary project={project} />
      </li>
    );
  });
  return (
    <Row className="ml-0 mt-2 text-center">
      <ul className="projects-list">{listItems}</ul>
    </Row>
  );
};

export default ProjectsList;
