import React, { useState } from 'react';
import AddProjectPopup from './AddProjectPopup';
import UserProjectsTable from './UserProjectsTable';

function ProjectsTab(props) {
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
    darkMode,
  } = props;
  const [postProjectPopupOpen, setPostProjectPopupOpen] = useState(false);
  const [renderedOn, setRenderedOn] = useState(0);
  const onSelectDeleteProject = projectId => {
    onDeleteProject(projectId);
  };

  const onSelectAssignProject = project => {
    onAssignProject(project);
    setRenderedOn(Date.now());
    // setPostProjectPopupOpen(false);
  };

  const onAddProjectPopupShow = () => {
    setPostProjectPopupOpen(true);
  };

  const onAddProjectPopupClose = () => {
    setPostProjectPopupOpen(false);
  };

  return (
    <>
      <AddProjectPopup
        open={postProjectPopupOpen}
        onClose={onAddProjectPopupClose}
        userProjectsById={userProjects}
        projects={projectsData}
        onSelectAssignProject={onSelectAssignProject}
        handleSubmit={handleSubmit}
        darkMode={darkMode}
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
        darkMode={darkMode}
      />
    </>
  );
}

export default ProjectsTab;
