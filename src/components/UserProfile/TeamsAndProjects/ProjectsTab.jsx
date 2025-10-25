import React, { useState } from 'react';
import AddProjectPopup from './AddProjectPopup';
import UserProjectsTable from './UserProjectsTable';

const ProjectsTab = props => {
  const {
    projectsData = [],
    userProjects = [], // ✅ Ensure this is always an array
    onDeleteProject,
    onAssignProject = () => {},
    edit,
    role,
    userTasks = [],
    userId,
    updateTask,
    disabled,
    darkMode,
  } = props;
  const safeUserProjects = Array.isArray(userProjects) ? userProjects : [];
  const safeProjectsData = Array.isArray(projectsData) ? projectsData : [];
  const safeUserTasks = Array.isArray(userTasks) ? userTasks : [];

  const [postProjectPopupOpen, setPostProjectPopupOpen] = useState(false);
  const [renderedOn, setRenderedOn] = useState(0);
  const onSelectDeleteProject = projectId => {
    onDeleteProject(projectId);
  };

const onSelectAssignProject = project => {
  // eslint-disable-next-line no-console
  console.log('Assigned Project in ProjectsTab:', project); // Debugging log
  onAssignProject(project);       // parent adds to the list
  setRenderedOn(Date.now());      // refresh the table
  setPostProjectPopupOpen(false); // close the popup
 };

  const onAddProjectPopupShow = () => {
    setPostProjectPopupOpen(true);
  };

  const onAddProjectPopupClose = () => {
    setPostProjectPopupOpen(false);
  };

  return (
    <React.Fragment>
      <AddProjectPopup
        open={postProjectPopupOpen}
        onClose={onAddProjectPopupClose}
        projects={safeProjectsData}
        userProjects={safeUserProjects}
        onSelectAssignProject={onSelectAssignProject}
        darkMode={darkMode}
      />
      <UserProjectsTable
        userTasks={safeUserTasks}
        userProjectsById={safeUserProjects}
        onButtonClick={onAddProjectPopupShow}
        onDeleteClick={onSelectDeleteProject}
        renderedOn={renderedOn}
        edit={edit}
        role={role}
        updateTask={updateTask}
        userId={userId}
        disabled={disabled}
        darkMode={darkMode}
      />
    </React.Fragment>
  );
};

export default ProjectsTab;
