import React, { useState } from 'react';
//import { Row, Col } from 'reactstrap';
import AddProjectPopup from './AddProjectPopup';
import UserProjectsTable from './UserProjectsTable';

const ProjectsTab = (props) => {
  const { projectsData, userProjects, isUserAdmin, onDeleteProject, onAssignProject, edit } = props;
  const [addProjectPopupOpen, setaddProjectPopupOpen] = useState(false);
  const [renderedOn, setRenderedOn] = useState(0);

  const onSelectDeleteProject = (projectId) => {
    onDeleteProject(projectId);
  };

  const onSelectAssignProject = (project) => {
    onAssignProject(project);
    setRenderedOn(Date.now());
    //setaddProjectPopupOpen(false);
  };

  const onAddProjectPopupShow = () => {
    setaddProjectPopupOpen(true);
  };

  const onAddProjectPopupClose = () => {
    setaddProjectPopupOpen(false);
  };

  return (
    <React.Fragment>
      <AddProjectPopup
        open={addProjectPopupOpen}
        onClose={onAddProjectPopupClose}
        userProjectsById={userProjects}
        projects={projectsData}
        onSelectAssignProject={onSelectAssignProject}
      />
      <UserProjectsTable
        userProjectsById={userProjects}
        onButtonClick={onAddProjectPopupShow}
        onDeleteClicK={onSelectDeleteProject}
        renderedOn={renderedOn}
        isUserAdmin={isUserAdmin}
        edit={edit}
      />
    </React.Fragment>
  );
};

export default ProjectsTab;
