import React from 'react';
import ProjectSummary from './ProjectSummary';

 const ProjectsList = ({ projects }) => {

  const listItems = projects.map(project => {
    return (
      <li className="project-summary" key={project.projectId}>
        <ProjectSummary project={project} />
      </li>
    );
  })
  return (
    <ul className="projects-list">
      {listItems}
    </ul>
  );
 }

export default ProjectsList;
