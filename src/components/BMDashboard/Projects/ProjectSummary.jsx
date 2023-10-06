import React from 'react';

const ProjectSummary = ({ project }) => {
  return (
    <div>
      <h2 className="project-summary_header">{project.projectName} summary</h2>
    </div>
  );
}

export default ProjectSummary