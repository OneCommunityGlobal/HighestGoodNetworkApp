import React, { useState } from 'react';
import AddProjectPopup from './AddProjectPopup';
import UserProjectsTable from './UserProjectsTable';

const ProjectsTab = props => {
  const {
    projectsData,
    userProjects,
    onDeleteProject,
    onAssignProject,
    edit,
    role,
    userTasks,
    userId,
    updateTask,
    handleSubmit,
    disabled,
  } = props;
  const [addProjectPopupOpen, setaddProjectPopupOpen] = useState(false);
  const [renderedOn, setRenderedOn] = useState(0);
  const onSelectDeleteProject = projectId => {
    onDeleteProject(projectId);
  };

  const onSelectAssignProject = project => {
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
        handleSubmit={handleSubmit}
      />
      <UserProjectsTable
        userTasks={userTasks}
        userProjectsById={userProjects}
        onButtonClick={onAddProjectPopupShow}
        onDeleteClicK={onSelectDeleteProject}
        renderedOn={renderedOn}
        edit={edit}
        role={role}
        updateTask={updateTask}
        userId={userId}
        disabled={disabled}
      />
    </React.Fragment>
  );
};

export default ProjectsTab;
