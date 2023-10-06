import React from 'react';
import ProjectSummary from './ProjectSummary';

export const ProjectsList = () => {
  return (
    <ul className="projects-list">
      <ProjectSummary />
      <ProjectSummary />
    </ul>
  )
}
