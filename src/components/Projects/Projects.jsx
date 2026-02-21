/* eslint-disable no-shadow */
/* eslint-disable no-use-before-define */
import { useState, useEffect, useCallback } from 'react';
import { connect , useSelector } from 'react-redux';
import SearchProjectByPerson from '~/components/SearchProjectByPerson/SearchProjectByPerson';
import ProjectsList from '~/components/BMDashboard/Projects/ProjectsList';
// import { fetchAllProjects, modifyProject, clearError } from '../../actions/projects';
import { fetchProjectsWithActiveUsers } from '../../actions/projectMembers.js';
// import { getProjectsByUsersName } from '../../actions/userProfile';
// import { useState, useCallback, useEffect } from 'react';
// import { connect } from 'react-redux';
// import { fetchAllArchivedProjects } from '../../actions/projects';
import {
  fetchAllProjects,
  postNewProject,
  modifyProject,
  clearError,
  fetchAllArchivedProjects
} from '../../actions/projects';
import {getProjectsByUsersName, getUserByAutocomplete } from '../../actions/userProfile';
import { getPopupById } from '../../actions/popupEditorAction';
import Overview from './Overview';
import AddProject from './AddProject';
import ProjectTableHeader from './ProjectTableHeader';
import Project from './Project';
import ModalTemplate from './../common/Modal';
import { CONFIRM_ARCHIVE, PROJECT_INACTIVE_CONFIRMATION, PROJECT_ACTIVE_CONFIRMATION } from './../../languages/en/messages';
import styles from './projects.module.css';
import Loading from '../common/Loading';
import hasPermission from '../../utils/permissions';
import EditableInfoModal from '../UserProfile/EditableModal/EditableInfoModal';


const Projects = function(props) {
  const { role } = props.state.userProfile;
  const { darkMode } = props.state.theme;
  
  const allReduxProjects = useSelector(state => state.allProjects.projects);
  const projectFetchStatus = useSelector(state => state.allProjects.status);
  const numberOfProjects = props.state.allProjects.projects.length;
  const numberOfActive = props.state.allProjects.projects.filter(project => project.isActive)
    .length;
  const { fetching, fetched, status, error } = props.state.allProjects;
  const initialModalData = {
    showModal: false,
    modalMessage: '',
    modalTitle: '',
    // hasConfirmBtn: false,
    // hasInactiveBtn: false,
    // hasActiveBtn: false,
  };

  const [modalData, setModalData] = useState(initialModalData);
  const [categorySelectedForSort, setCategorySelectedForSort] = useState('');
  const [showStatus, setShowStatus] = useState('');
  const [sortedByName, setSortedByName] = useState('');
  const [projectTarget, setProjectTarget] = useState({
    projectName: '',
    projectId: -1,
    active: false,
    category: '',
  });
  const [projectList, setProjectList] = useState([]); // changed
  const [searchName, setSearchName] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const [allProjects, setAllProjects] = useState([]); // changed
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [searchMode, setSearchMode] = useState('person'); 

  const [suggestions, setSuggestions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

   // active member counts used in generateProjectList
  const activeMemberCounts = props.state.projectMembers?.activeMemberCounts || {};
  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  };

  const debouncedSearchName = useDebounce(searchName, 300);

  const canPostProject = props.hasPermission('postProject');

  // const onClickArchiveBtn = projectData => {
  //   setProjectTarget(projectData);
  //   const message = showArchived
  //     ? `Do you want to unarchive ${projectData.projectName}?`
  //     : `Do you want to archive ${projectData.projectName}?`;
  //   setModalData({
  //     showModal: true,
  //     modalMessage: `<p style="${darkMode ? 'color:white;' : 'color:black;'}">${message}</p>`,
  //     // modalMessage: `<p style="${darkMode ? 'color: white' : 'color: black;'}">Do you want to archive ${projectData.projectName}?</p>`,
  //     // modalTitle: CONFIRM_ARCHIVE,
  //     modalTitle: showArchived ? 'Unarchive Confirmation' : 'Archive Confirmation',
  //     hasConfirmBtn: true,
  //     hasInactiveBtn: false,
  //     hasActiveBtn: false,
  //   });
  // };
  const onClickArchiveBtn = projectData => { 
    setProjectTarget(projectData); // ADDED FROM PR
    const message = projectData.isArchived
      ? `Do you want to unarchive ${projectData.projectName}?`
      : `Do you want to archive ${projectData.projectName}?`;
    setModalData({
      showModal: true,
      // modalMessage: `<p style="${darkMode ? 'color:white;' : 'color:black;'}">${message}</p>`,
      modalMessage: <p style={{ color: darkMode ? 'white' : 'black' }}>{message}</p>,
      modalTitle: projectData.isArchived ? 'Unarchive Confirmation' : 'Archive Confirmation',
      hasConfirmBtn: true,
      hasInactiveBtn: false,
      hasActiveBtn: false,
    });
  };

  const onClickProjectStatusBtn = (projectData) => {
    setProjectTarget(projectData);
    if (projectData.isActive) {
      // If the project is archived, allow unarchiving
      setModalData({
        showModal: true,
        // modalMessage: `<p style="${darkMode ? 'color: white' : 'color: black'}">${PROJECT_INACTIVE_CONFIRMATION}</p>`,
        modalMessage: (
          <p style={{ color: darkMode ? 'white' : 'black' }}>
            {projectData.isActive ? PROJECT_INACTIVE_CONFIRMATION : PROJECT_ACTIVE_CONFIRMATION}
          </p>
        ),
        modalTitle: `Inactive Confirmation - ${projectData.projectName} `,
        hasConfirmBtn: false,
        hasInactiveBtn: true, // No need for inactive button
        hasActiveBtn: false,
      });
    } 
    // else if (!projectData.isActive) {
    //   // If the project is inactive, allow setting it to active
    //   setModalData({
    //     showModal: true,
    //     modalMessage: `<p style="${darkMode ? 'color: white' : 'color: black;'}">${PROJECT_ACTIVE_CONFIRMATION}</p>`,
    //     modalTitle: `Active Confirmation - ${projectData.projectName} `,
    //     hasConfirmBtn: false,
    //     hasInactiveBtn: false, // No need for inactive button
    //     hasActiveBtn: true,
    //   });
    // }
    else {
      setModalData({
        showModal: true,
        modalMessage: `<p style="${darkMode ? 'color:white;' : 'color:black;'}">${PROJECT_ACTIVE_CONFIRMATION}</p>`,
        modalTitle: `Active Confirmation - ${projectData.projectName}`,
        hasConfirmBtn: false,
        hasInactiveBtn: false,
        hasActiveBtn: true,
      });
    }
  };

  const onCloseModal = () => {
    setModalData(initialModalData);
    props.clearError();
  };

  const onChangeCategory = value => {
    setCategorySelectedForSort(value);
  };

  const onSelectStatus = value => {
    setShowStatus(value);
  };

  const handleSort = (e) => {
    const clickedId = e.target.id;
    setSortedByName(prevState => prevState === clickedId ? "" : clickedId);
  }

  // const generateJSXList = (projectsArray) => {
  //   return projectsArray.map((project, index) => (
  //     <Project
  //       key={`${project._id}-${project.isActive}`}
  //       index={index}
  //       projectData={project}
  //       onUpdateProject={onUpdateProject}
  //       onClickArchiveBtn={onClickArchiveBtn}
  //       onClickProjectStatusBtn={onClickProjectStatusBtn}
  //       darkMode={darkMode}
  //       onProjectArchived={async (updatedProject) => {
  //         // centralize: update backend -> refresh Redux (keeps logic consistent)
  //         try {
  //           await props.modifyProject(updatedProject);
  //           // re-fetch to keep server and Redux consistent; UI already updated optimistically below
  //           await props.fetchAllProjects();
  //         } catch (err) {
  //           console.error('onProjectArchived error:', err);
  //         }
  //       }}
  //     />
  //   ));
  // };
  const generateJSXList = (projectsArray) => {
    return (projectsArray || []).map((project, index) => (
      <Project
        key={`${project._id}-${project.isActive}`}
        index={index}
        projectData={project}
        onUpdateProject={onUpdateProject}
        onClickArchiveBtn={onClickArchiveBtn}
        onClickProjectStatusBtn={onClickProjectStatusBtn}
        darkMode={darkMode}
        onProjectArchived={async (updatedProject) => {
          try {
            // persist change
            await props.modifyProject(updatedProject);
            // refresh the same view the user is currently on
            await handleProjectArchived();
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error('onProjectArchived error:', err);
            // fallback -> at least keep Redux in sync
            await props.fetchAllProjects();
          }
        }}
      />
    ));
  };
  // const handleSort = e => {
  //   const clickedId = e.target.id;
  //   if (clickedId === 'SortingByRecentEditedInventory') {
  //     setSortedByName(prevState =>
  //       prevState === 'SortingByRecentEditedInventory' ? '' : 'SortingByRecentEditedInventory',
  //     );
  //   } else {
  //     setSortedByName(prevState => (prevState === clickedId ? '' : clickedId));
  //   }
  // };

  // const onUpdateProject = async updatedProject => {
  //   await props.modifyProject(updatedProject);
  //   // Optimistically update the state
  //   // const updatedProjectsList = projectList.map(project =>
  //   const updatedProjectsList = (allProjects || []).map(project =>
  //     project._id === updatedProject._id ? updatedProject : project,
  //   );
  //   setProjectList(updatedProjectsList);
  //   generateProjectList(categorySelectedForSort, showStatus, sortedByName);
  //   /* refresh the page after updating the project */
  //   await props.fetchAllProjects();
  // };

  // below is working version
  // const onUpdateProject = async (updatedProject) => {
  //   try {
  //     await props.modifyProject(updatedProject); // backend + Redux
  //     // await props.fetchAllProjects();
  //     // Update local raw data
  //     // setAllProjects(prev =>
  //     //   prev.map(p => (p._id === updatedProject._id ? updatedProject : p))
  //     // );

  //     // // Update JSX list
  //     // setProjectList(prev => generateJSXList(
  //     //   (allProjects || []).map(p => (p._id === updatedProject._id ? updatedProject : p))
  //     // ));

  //     // second try
  //     // create updated array immediately
  //     // const updatedAllProjects = (allProjects || []).map(p =>
  //     //   p._id === updatedProject._id ? updatedProject : p
  //     // );

  //     // setAllProjects(updatedAllProjects);
  //     // setProjectList(generateJSXList(updatedAllProjects));
  //     // generateProjectList(categorySelectedForSort, showStatus, sortedByName);
  //   } catch (error) {
  //     console.error("Update project error:", error);
  //   }
  // };
  const onUpdateProject = async (updatedProject) => {
    try {
      // Optimistically update local raw data so UI is responsive
      setAllProjects(prev => {
        const updated = (prev || []).map(p => (p._id === updatedProject._id ? { ...p, ...updatedProject } : p));
        // update visible list immediately
        setProjectList(generateJSXList(updated));
        return updated;
      });

      // Send update to backend and Redux
      await props.modifyProject(updatedProject);

      // Ensure redux is in sync (modifyProject should update redux but fetchAllProjects is safe)
      await props.fetchAllProjects();
      // The effect watching allReduxProjects will call generateProjectList again when redux lands
    } catch (error) {
      // eslint-disable-next-line no-console
        console.error('Update project error:', error);
        // Optionally: refetch full list to recover
        await props.fetchAllProjects();
    }
  };
  // const confirmArchive = async () => {
  //   setIsArchiving(true); // show loading on confirm
  //   const updatedProject = { ...projectTarget, isArchived: !projectTarget.isArchived, };// isArchived: true };
  //   await onUpdateProject(updatedProject);
  //   await handleProjectArchived();
  //   await props.fetchAllProjects();
  //   setIsArchiving(false); // reset loading
  //   onCloseModal();
  // };

  // below is working version,
  // const confirmArchive = async () => {
  //   setIsArchiving(true);
  //   onCloseModal(); // close modal immediately
  //   // setIsArchiving(true);
  //   // const updatedProject = { ...projectTarget, isArchived: !projectTarget.isArchived }; // CHANGED
  //   // await onUpdateProject(updatedProject);
  //   // handleProjectArchived();
  //   // setIsArchiving(false);
  //   // onCloseModal();
  //   // try {
  //   //   await onUpdateProject(projectTarget._id, {
  //   //     isArchived: !projectTarget.isArchived,
  //   //     modifiedDatetime: new Date().toISOString() // if backend requires it
  //   //   });
  //   //   handleProjectArchived();
  //   // } catch (err) {
  //   //   console.error('Archive error:', err);
  //   // } finally {
  //   //   setIsArchiving(false);
  //   //   onCloseModal();
  //   // }

  //   // second try,
  //   // try {
  //   //   const updatedProject = {
  //   //     ...projectTarget,
  //   //     isArchived: !projectTarget.isArchived,
  //   //     modifiedDatetime: new Date().toISOString(),
  //   //   };

  //   //   await onUpdateProject(updatedProject); // pass the full object

  //   //   // // Optimistic local update so UI doesn’t “blink”
  //   //   // setAllProjects(prev =>
  //   //   //   prev.map(p => p._id === updatedProject._id ? updatedProject : p)
  //   //   // );

  //   //   // // Re-fetch from backend to be safe
  //   //   // await handleProjectArchived();
  //   // } catch (err) {
  //   //     console.error("Archive error:", err);
  //   // } finally {
  //   //     setIsArchiving(false);
  //   //     // onCloseModal(); // coz closing the modal, as soon as the request is processed.
  //   // }

  //   // third try
  //   const updatedProject = {
  //     ...projectTarget,
  //     isArchived: !projectTarget.isArchived,
  //     modifiedDatetime: new Date().toISOString(),
  //   };
  //   // try {
  //   //   await onUpdateProject(updatedProject);

  //   //   // update local state immediately
  //   //   setAllProjects(prev =>
  //   //     prev.map(p => p._id === updatedProject._id ? updatedProject : p)
  //   //   );

  //   //   // rebuild visible list (instead of waiting for fetch)
  //   //   setProjectList(generateJSXList(
  //   //     (allProjects || []).map(p => p._id === updatedProject._id ? updatedProject : p)
  //   //   ));
  //   // } catch (err) {
  //   //     console.error("Archive error:", err);
  //   //   } finally {
  //   //     setIsArchiving(false);
  //   //   }

  //   try {
  //     // await onUpdateProject(updatedProject);
  //     await props.modifyProject(updatedProject);
  //     await props.fetchAllProjects();

  //     // generateProjectList(categorySelectedForSort, showStatus, sortedByName);
  //     // 3. Regenerate list from redux (not local state!)
  //     const projects = props.state.allProjects?.projects || [];
  //     const filtered = projects.filter(project =>
  //       showArchived ? project.isArchived : !project.isArchived
  //     );

  //     setProjectList(generateJSXList(filtered));
  //   } catch (err) {
  //       console.error("Archive error:", err);
  //   } finally {
  //       setIsArchiving(false); 
  //   }
  //   // Fire-and-forget backend update
  //   // onUpdateProject(updatedProject).catch(err => console.error("Archive error:", err));

  //   // setIsArchiving(false);
  // };

  const confirmArchive = async () => {
  // close modal immediately so the UI feels responsive
  onCloseModal();
  setIsArchiving(true);

  const updatedProject = {
    ...projectTarget,
    isArchived: !projectTarget.isArchived,
    modifiedDatetime: new Date().toISOString(),
  };

  try {
    // optimistic local update (update raw objects)
    const source = (allProjects && allProjects.length) ? allProjects : allReduxProjects || [];
    const updatedAll = source.map(p => (p._id === updatedProject._id ? { ...p, ...updatedProject } : p));
    setAllProjects(updatedAll);
    setProjectList(generateJSXList(updatedAll));

    // persist to server
    await props.modifyProject(updatedProject);

    // refresh the same view the user was on
    await handleProjectArchived();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Archive/unarchive failed:', err);
    // fallback refresh so UI and server are consistent
    await handleProjectArchived();
  } finally {
    setIsArchiving(false);
  }
  };

  // const confirmArchive = async () => {
  //   // close modal immediately for responsiveness
  //   onCloseModal();
  //   setIsArchiving(true);

  //   const updatedProject = {
  //     ...projectTarget,
  //     isArchived: !projectTarget.isArchived,
  //     modifiedDatetime: new Date().toISOString(),
  //   };

  //   try {
  //     // Optimistic local update
  //     const updatedAll = (allProjects.length ? allProjects : allReduxProjects).map(p =>
  //       p._id === updatedProject._id ? { ...p, ...updatedProject } : p
  //     );
  //     setAllProjects(updatedAll);
  //     setProjectList(generateJSXList(updatedAll));

  //     // Persist to backend + ensure redux sync
  //     await props.modifyProject(updatedProject);
  //     // await props.fetchAllProjects();
  //     // ✅ refresh based on current toggle
  //     if (showArchived) {
  //       await props.fetchAllArchivedProjects();
  //     } else {
  //       await props.fetchAllProjects();
  //     }
  //     // The useEffect (watching allReduxProjects) will re-run generateProjectList with true server data
  //   } catch (err) {
  //     console.error('Archive error:', err);
  //     // In case of error, attempt to refresh list from server
  //     // await props.fetchAllProjects();
  //     if (showArchived) {
  //       await props.fetchAllArchivedProjects();
  //     } else {
  //       await props.fetchAllProjects();
  //     }
  //   } finally {
  //     setIsArchiving(false);
  //   }
  // };

  // const setProjectStatus = async () => {
  //   setIsChangingStatus(true);
  //   const updatedProject = { ...projectTarget, isActive: !projectTarget.isActive };
  //   await onUpdateProject(updatedProject)
  //   setIsChangingStatus(false);
  //   // Close the modal after update
  //   onCloseModal();
  // };
  const setProjectStatus = async () => {
    setIsChangingStatus(true);
    const updatedProject = { ...projectTarget, isActive: !projectTarget.isActive }; // CHANGED
    await onUpdateProject(updatedProject);
    setIsChangingStatus(false);
    onCloseModal(); // changed
  };

  const postProject = async (name, category) => {
    await props.postNewProject(name, category);
    await refreshProjects(); // Refresh project list after adding a project
  };

  // const onCloseModal = () => {
  //   setModalData(initialModalData);
  //   props.clearError();
  // };
  
  const handleProjectArchived = () => {
    if(showArchived){
        props.fetchAllArchivedProjects();
    } else{
      props.fetchAllProjects();
    }
  };

  const handleFetchArchivedProjects = () => {
     setShowArchived(prev=>!prev); 
  };
  // Fetch autocomplete suggestions
  const fetchSuggestions = useCallback(async () => {
      try {
      if (debouncedSearchName) {
        const userSuggestions = await props.getUserByAutocomplete(debouncedSearchName);
        if (userSuggestions) {
          setSuggestions(userSuggestions);
        } else {
          setSuggestions([]);
        }
      } else {
        setSuggestions([]); // Clear suggestions when input is cleared
      }
    }
    catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error fetching user suggestions:", error);
      setSuggestions([]); // Clearing suggestions on error
    }
  }, [debouncedSearchName, props.getUserByAutocomplete]);

  // const fetchSuggestions = useCallback(async () => {
  //   try {
  //     if (debouncedSearchName) {
  //       const userSuggestions = await props.getUserByAutocomplete(debouncedSearchName);
  //       setSuggestions(userSuggestions || []);
  //     } else {
  //       setSuggestions([]);
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     setSuggestions([]);
  //   }
  // }, [debouncedSearchName, props.getUserByAutocomplete]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  // Handle selection of a user from suggestions
  const handleSelectSuggestion = async (user) => {

    if (!user) {
      // If the user is null, reset to show all projects
      setSearchName(''); // Clear search name
      setProjectList(allProjects); // Reset project list to all projects
      setSelectedUser(null);
      // setProjectList(
      //   (allProjects || []).map((project, index) => (
      //     <Project
      //       key={`${project._id}-${project.isActive}`}
      //       index={index}
      //       projectData={project}
      //       onUpdateProject={onUpdateProject}
      //       onClickArchiveBtn={onClickArchiveBtn}
      //       onClickProjectStatusBtn={onClickProjectStatusBtn}
      //       darkMode={darkMode}
      //     />
      //   ))
      // );
      // setSelectedUser(null); // Clear selected user
      return;
    } 

    try {
      setSearchName(`${user.firstName} ${user.lastName}`);
      setSelectedUser(user); // Store selected user

      // Fetch projects by selected user's name
      const userProjects = await props.getProjectsByUsersName(`${user.firstName} ${user.lastName}`);

      if (userProjects) {
        const newProjectList = (allProjects || []).filter(project => 
          userProjects.some(p => p === project.key)
        );
        setProjectList(newProjectList);
        // setProjectList(
        //   newProjectList.map((project, index) => (
        //     <Project
        //       key={`${project._id}-${project.isActive}`}
        //       index={index}
        //       projectData={project}
        //       onUpdateProject={onUpdateProject}
        //       onClickArchiveBtn={onClickArchiveBtn}
        //       onClickProjectStatusBtn={onClickProjectStatusBtn}
        //       darkMode={darkMode}
        //     />
        //   ))
        // );
      }else{
        setProjectList(allProjects);
        // setProjectList(
        //   allProjects.map((project, index) => (
        //     <Project
        //       key={`${project._id}-${project.isActive}`}
        //       index={index}
        //       projectData={project}
        //       onUpdateProject={onUpdateProject}
        //       onClickArchiveBtn={onClickArchiveBtn}
        //       onClickProjectStatusBtn={onClickProjectStatusBtn}
        //       darkMode={darkMode}
        //     />
        //   ))
        // );
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error fetching projects for selected user:", error);
      setProjectList(allProjects); // Showing all projects on error
      // setProjectList(
      //   allProjects.map((project, index) => (
      //     <Project
      //       key={`${project._id}-${project.isActive}`}
      //       index={index}
      //       projectData={project}
      //       onUpdateProject={onUpdateProject}
      //       onClickArchiveBtn={onClickArchiveBtn}
      //       onClickProjectStatusBtn={onClickProjectStatusBtn}
      //       darkMode={darkMode}
      //     />
      //   ))
      // );
    } //changed

    // setSelectedUser(user);
    // setSearchName(`${user.firstName} ${user.lastName}`);
    // const userProjects = await props.getProjectsByUsersName(`${user.firstName} ${user.lastName}`);
    // const newProjectList = (allProjects || []).filter(project =>
    //   userProjects?.includes(project._id)
    // );
    // setProjectList(
    //   newProjectList.map((project, index) => (
    //     <Project
    //       key={`${project._id}-${project.isActive}`}
    //       index={index}
    //       projectData={project}
    //       onUpdateProject={onUpdateProject}
    //       onClickArchiveBtn={onClickArchiveBtn}
    //       onClickProjectStatusBtn={onClickProjectStatusBtn}
    //       darkMode={darkMode}
    //     />
    //   ))
    // );
  };
// };


  // const generateProjectList = (categorySelectedForSort, showStatus, sortedByName) => {
  //   try {
  //     const { projects } = props.state.allProjects;
  //     let filteredProjects = [];
  //     if(showArchived){
  //         filteredProjects = projects.filter(project => project?.isArchived);
  //     }else{
  //         filteredProjects = projects.filter(project=>!project.isArchived);
  //     }
   
  //      filteredProjects = filteredProjects.filter(project => {
  //   //    const activeMemberCounts = props.state.projectMembers?.activeMemberCounts || {};
  //   // const filteredProjects = allReduxProjects.filter(project => !project.isArchived).filter(project => {
  //     if (categorySelectedForSort && showStatus){
  //       return project.category === categorySelectedForSort && project.isActive === showStatus;
  //     } else if (categorySelectedForSort) {
  //       return project.category === categorySelectedForSort;
  //     } else if (showStatus === 'Active') {
  //       return project.isActive === true;
  //     } else if (showStatus === 'Inactive') {
  //       return project.isActive === false;
  //     } else {
  //       return true;
  //     }
  //     })
  //     .sort((a, b) => {
  //       if (sortedByName === 'Ascending') {
  //         return a.projectName[0].toLowerCase() < b.projectName[0].toLowerCase() ? -1 : 1;
  //       }
  //       if (sortedByName === 'Descending') {
  //         return a.projectName[0].toLowerCase() < b.projectName[0].toLowerCase() ? 1 : -1;
  //       }
  //       if (sortedByName === 'SortingByRecentEditedMembers') {
  //         return a.membersModifiedDatetime < b.membersModifiedDatetime ? 1 : -1;
  //       }
  //       if (sortedByName === 'SortingByRecentEditedInventory') {
  //         return a.inventoryModifiedDatetime < b.inventoryModifiedDatetime ? 1 : -1;
  //       }
  //       if (sortedByName === 'SortingByMostActiveMembers') {
  //         const lenA = activeMemberCounts[a._id] || 0;
  //         const lenB = activeMemberCounts[b._id] || 0;
  //         return lenB - lenA; // Most active first
  //       }
  //       return 0;
  //     })
  //     .map((project, index) => (
  //       <Project
  //         // key={project._id}
  //         key={`${project._id}-${project.isActive}`} 
  //         index={index}
  //         projectData={project}
  //         onUpdateProject={onUpdateProject}
  //         onClickArchiveBtn={onClickArchiveBtn}
  //         onClickProjectStatusBtn={onClickProjectStatusBtn}
  //         darkMode={darkMode}
  //       />
  //     ));
  //     setProjectList(filteredProjects);
  //     setAllProjects(filteredProjects);
  //   } catch (error) {
  //     console.log(error);
  //   }
   
  // }
  // working version down below, 
  // const generateProjectList = (categorySelectedForSort, showStatus, sortedByName) => {
  //   try {
  //     const projects = props.state.allProjects?.projects || [];
  //     // Filter archived vs non-archived
  //     let filtered = showArchived
  //       ? projects.filter(project => project?.isArchived)
  //       : projects.filter(project => !project.isArchived);

  //     // Apply category/status filters
  //     filtered = filtered.filter(project => {
  //       if (categorySelectedForSort && showStatus) {
  //         return project.category === categorySelectedForSort && project.isActive === showStatus;
  //       } else if (categorySelectedForSort) {
  //         return project.category === categorySelectedForSort;
  //       } else if (showStatus === 'Active') {
  //         return project.isActive === true;
  //       } else if (showStatus === 'Inactive') {
  //         return project.isActive === false;
  //       } else {
  //         return true;
  //       }
  //     });

  //     // Sorting
  //     filtered.sort((a, b) => {
  //       if (sortedByName === 'Ascending') {
  //         return a.projectName[0].toLowerCase() < b.projectName[0].toLowerCase() ? -1 : 1;
  //       }
  //       if (sortedByName === 'Descending') {
  //         return a.projectName[0].toLowerCase() < b.projectName[0].toLowerCase() ? 1 : -1;
  //       }
  //       if (sortedByName === 'SortingByRecentEditedMembers') {
  //         // return a.membersModifiedDatetime < b.membersModifiedDatetime ? 1 : -1;
  //         const aTime = a.membersModifiedDatetime ? new Date(a.membersModifiedDatetime).getTime() : 0;
  //         const bTime = b.membersModifiedDatetime ? new Date(b.membersModifiedDatetime).getTime() : 0;
  //         return bTime - aTime;
  //       }
  //       if (sortedByName === 'SortingByRecentEditedInventory') {
  //         // return a.inventoryModifiedDatetime < b.inventoryModifiedDatetime ? 1 : -1;
  //         const aTime = a.inventoryModifiedDatetime
  //           ? new Date(a.inventoryModifiedDatetime).getTime()
  //           : 0;
  //         const bTime = b.inventoryModifiedDatetime
  //           ? new Date(b.inventoryModifiedDatetime).getTime()
  //           : 0;

  //         return bTime - aTime;
  //       }
  //       if (sortedByName === 'SortingByMostActiveMembers') {
  //         const lenA = activeMemberCounts[a._id] || 0;
  //         const lenB = activeMemberCounts[b._id] || 0;
  //         return lenB - lenA;
  //       }
  //       return 0;
  //     });

  //     // Save raw objects for other logic
  //     // setAllProjects(filtered);

  //     // // Create JSX list for rendering
  //     // const jsxList = filtered.map((project, index) => (
  //     //   <Project
  //     //     key={`${project._id}-${project.isActive}`}
  //     //     index={index}
  //     //     projectData={project}
  //     //     onUpdateProject={onUpdateProject}
  //     //     onClickArchiveBtn={onClickArchiveBtn}
  //     //     onClickProjectStatusBtn={onClickProjectStatusBtn}
  //     //     darkMode={darkMode}
  //     //     // onProjectArchived={handleProjectArchived}
  //     //     onProjectArchived={async (updatedProject) => {
  //     //       // ADDED: centralize the modify + refresh logic in parent
  //     //       try {
  //     //         // Update the project on the server
  //     //         await props.modifyProject(updatedProject);

  //     //         // Re-fetch the correct list depending on whether we're currently
  //     //         // showing archived projects or not (uses your existing function)
  //     //         await handleProjectArchived();

  //     //         // Ensure Redux state is up to date
  //     //         await props.fetchAllProjects();
  //     //       } catch (err) {
  //     //         // log for now; optionally show toast/error UI
  //     //         // eslint-disable-next-line no-console
  //     //         console.error('onProjectArchived error:', err);
  //     //       }
  //     //     }} 
  //     //   />
  //     // ));
  //     // // setAllProjects(jsxList);
  //     // setProjectList(jsxList);
  //     // Create JSX list for rendering (no need to keep raw copy in local state)
  //     setProjectList(
  //       filtered.map((project, index) => (
  //         <Project
  //           key={project._id}
  //           index={index}
  //           projectData={project}
  //           onUpdateProject={onUpdateProject}
  //           onClickArchiveBtn={onClickArchiveBtn}
  //           onClickProjectStatusBtn={onClickProjectStatusBtn}
  //           darkMode={darkMode}
  //           onProjectArchived={async (updatedProject) => {
  //             try {
  //               await props.modifyProject(updatedProject);
  //               await handleProjectArchived();
  //               await props.fetchAllProjects();
  //             } catch (err) {
  //               console.error('onProjectArchived error:', err);
  //             }
  //           }}
  //         />
  //       ))
  //     );
  //   } catch (error) {
  //     // keep logging so you can see the stack
  //     // eslint-disable-next-line no-console
  //     console.error('generateProjectList error:', error);
  //   }
  // };

  const generateProjectList = (projectsSource = allReduxProjects) => {
    try {
      // projectsSource should be raw objects
      const projects = projectsSource || [];

      // Filter archived vs non-archived (uses showArchived boolean)
      let filtered = showArchived
        ? projects.filter(project => !!project?.isArchived)
        : projects.filter(project => !project?.isArchived);

      // Apply category/status filters
      filtered = filtered.filter(project => {
        if (categorySelectedForSort && showStatus) {
          return project.category === categorySelectedForSort && project.isActive === showStatus;
        } else if (categorySelectedForSort) {
          return project.category === categorySelectedForSort;
        } else if (showStatus === 'Active') {
          return project.isActive === true;
        } else if (showStatus === 'Inactive') {
          return project.isActive === false;
        }
        return true;
      });

      // Sorting (make date sorts robust)
      filtered.sort((a, b) => {
        if (sortedByName === 'Ascending') {
          return a.projectName.localeCompare(b.projectName);
        }
        if (sortedByName === 'Descending') {
          return b.projectName.localeCompare(a.projectName);
        }
        if (sortedByName === 'SortingByRecentEditedMembers') {
          const aT = a.membersModifiedDatetime ? new Date(a.membersModifiedDatetime).getTime() : 0;
          const bT = b.membersModifiedDatetime ? new Date(b.membersModifiedDatetime).getTime() : 0;
          return bT - aT;
        }
        if (sortedByName === 'SortingByRecentEditedInventory') {
          const aT = a.inventoryModifiedDatetime ? new Date(a.inventoryModifiedDatetime).getTime() : 0;
          const bT = b.inventoryModifiedDatetime ? new Date(b.inventoryModifiedDatetime).getTime() : 0;
          return bT - aT;
        }
        if (sortedByName === 'SortingByMostActiveMembers') {
          const lenA = activeMemberCounts[a._id] || 0;
          const lenB = activeMemberCounts[b._id] || 0;
          return lenB - lenA;
        }
        return 0;
      });

      // Save raw objects for other logic
      // setAllProjects(filtered);
      // setAllProjects(generateJSXList(filtered)); // store JSX in local state so we don’t have to recalculate on every render

      // Build JSX and set list
      setProjectList(generateJSXList(filtered));
    } catch (error) {
      // eslint-disable-next-line no-console
        console.error('generateProjectList error:', error);
    }
  };

  const refreshProjects = async () => {
    await props.fetchAllProjects();
  };

  // useEffect(() => {
  //   props.fetchAllProjects();
  // }, []);
// 1
  // useEffect(()=>{
  //    if(showArchived){
  //        props.fetchAllArchivedProjects();
  //    }else{
  //        props.fetchAllProjects();
  //    }
  // },[showArchived])

  useEffect(() => {
    props.fetchProjectsWithActiveUsers();
  }, []);

  // useEffect(() => {
  //   handleProjectArchived(); // fetches either archived or unarchived projects
  // }, [showArchived]);

  // fetch the correct list on mount and whenever the showArchived toggle changes
  useEffect(() => {
    const doFetch = async () => {
      try {
        if (showArchived) {
          await props.fetchAllArchivedProjects();
        } else {
          await props.fetchAllProjects();
        }
      } catch (err) {
        // keep debugging info
        // eslint-disable-next-line no-console
        console.error('Error fetching projects for showArchived=', showArchived, err);
      }
    };

    doFetch();
  }, [showArchived, props.fetchAllArchivedProjects, props.fetchAllProjects]);
  // useEffect(() => {
  //   // console.log('generateProjectList triggered:', {
  //   //   fetched: props.state.allProjects.fetched,
  //   //   fetching: props.state.allProjects.fetching,
  //   //   dataLength: allReduxProjects?.length || 0,
  //   //   status: props.state.allProjects.status
  //   // });
  //   generateProjectList(categorySelectedForSort, showStatus, sortedByName);
  //   if (status !== 200) {
  //     setModalData({
  //       showModal: true,
  //       modalMessage: error,
  //       modalTitle: 'ERROR',
  //       hasConfirmBtn: false,
  //       hasInactiveBtn: false,
  //     });
  //   }
  // }, [categorySelectedForSort, showStatus, sortedByName, props.state.allProjects, props.state.theme.darkMode]);
  
  // useEffect(() => {
  // // whenever Redux changes (or filters/sort/showArchived change), rebuild list from Redux raw data
  //   generateProjectList(allReduxProjects);
  // }, [allReduxProjects, categorySelectedForSort, showStatus, sortedByName, showArchived, props.state.theme.darkMode]);
  // //above is working code

  // useEffect(() => {
  //   const source = allProjects.length ? allProjects : allReduxProjects;

  //   // if (debouncedSearchName) {
  //   //   const filtered = source.filter(project =>
  //   //     project.name?.toLowerCase().includes(debouncedSearchName.toLowerCase())
  //   //   );
  //   //   setProjectList(generateJSXList(filtered));
  //   // } else {
  //   //   setProjectList(generateJSXList(source));
  //   // }
  //   if (debouncedSearchName) {
  //   const filtered = source.filter(project =>
  //     (project.projectName || '').toLowerCase().includes(debouncedSearchName.toLowerCase())
  //   );
  //   setProjectList(generateJSXList(filtered));
  //   } else {
  //     setProjectList(generateJSXList(source));
  //   }
  // }, [debouncedSearchName, allProjects, allReduxProjects]);

  // useEffect(() => { generateProjectList(categorySelectedForSort, showStatus, sortedByName); }, [allReduxProjects, categorySelectedForSort, showStatus, sortedByName]);
  // }, [fetched, categorySelectedForSort, showStatus, sortedByName, props.state.theme.darkMode]);

  // useEffect(() => {
  //   const fetchProjects = async () => {
  //     if (debouncedSearchName) {
  //       const projects = await props.getProjectsByUsersName(debouncedSearchName);
  //       if (projects && allReduxProjects) {
  //         const newProjectList = allProjects.filter(project => 
  //           projects.some(p => p === project._id)
  //         );
  //         // setProjectList(newProjectList);
  //         setProjectList(
  //           newProjectList.map((project, index) => (
  //             <Project
  //               key={`${project._id}-${project.isActive}`}
  //               index={index}
  //               projectData={project}
  //               onUpdateProject={onUpdateProject}
  //               onClickArchiveBtn={onClickArchiveBtn}
  //               onClickProjectStatusBtn={onClickProjectStatusBtn}
  //               darkMode={darkMode}
  //             />
  //           ))
  //         );
  //       } else {
  //         // setProjectList(allProjects);
  //         // fallback → render all projects
  //           setProjectList(
  //             allProjects.map((project, index) => (
  //               <Project
  //                 key={`${project._id}-${project.isActive}`}
  //                 index={index}
  //                 projectData={project}
  //                 onUpdateProject={onUpdateProject}
  //                 onClickArchiveBtn={onClickArchiveBtn}
  //                 onClickProjectStatusBtn={onClickProjectStatusBtn}
  //                 darkMode={darkMode}
  //               />
  //             ))
  //           );
  //         }
  //       }
  //     } else {
  //       // setProjectList(allProjects);
  //       // no search term → render all projects
  //       setProjectList(
  //         allProjects.map((project, index) => (
  //           <Project
  //             key={`${project._id}-${project.isActive}`}
  //             index={index}
  //             projectData={project}
  //             onUpdateProject={onUpdateProject}
  //             onClickArchiveBtn={onClickArchiveBtn}
  //             onClickProjectStatusBtn={onClickProjectStatusBtn}
  //             darkMode={darkMode}
  //           />
  //         ))
  //       );
  //     }
  //   fetchProjects();
  // }, [debouncedSearchName, allProjects, allReduxProjects]);

  // useEffect(() => {
  //   const fetchProjects = async () => {
  //     if (debouncedSearchName) {
  //       const projects = await props.getProjectsByUsersName(debouncedSearchName);
  //       if (projects && allReduxProjects?.projects) {
  //         const newProjectList = (allProjects || []).filter(project => 
  //           projects.some(p => p === project._id)
  //         );
  //         setProjectList(
  //           newProjectList.map((project, index) => (
  //             <Project
  //               key={`${project._id}-${project.isActive}`}
  //               index={index}
  //               projectData={project}
  //               onUpdateProject={onUpdateProject}
  //               onClickArchiveBtn={onClickArchiveBtn}
  //               onClickProjectStatusBtn={onClickProjectStatusBtn}
  //               darkMode={darkMode}
  //             />
  //           ))
  //         );
  //       } else {
  //         // fallback → render all projects
  //         setProjectList(
  //           allProjects.map((project, index) => (
  //             <Project
  //               key={`${project._id}-${project.isActive}`}
  //               index={index}
  //               projectData={project}
  //               onUpdateProject={onUpdateProject}
  //               onClickArchiveBtn={onClickArchiveBtn}
  //               onClickProjectStatusBtn={onClickProjectStatusBtn}
  //               darkMode={darkMode}
  //             />
  //           ))
  //         );
  //       }
  //     } else {
  //       // no search term → render all projects
  //       setProjectList(
  //         allProjects.map((project, index) => (
  //           <Project
  //             key={`${project._id}-${project.isActive}`}
  //             index={index}
  //             projectData={project}
  //             onUpdateProject={onUpdateProject}
  //             onClickArchiveBtn={onClickArchiveBtn}
  //             onClickProjectStatusBtn={onClickProjectStatusBtn}
  //             darkMode={darkMode}
  //           />
  //         ))
  //       );
  //     }
  //   };

  //   fetchProjects();
  // }, [debouncedSearchName, allProjects, allReduxProjects]);
  
//   useEffect(() => {
//     const fetchProjects = async () => {
//       // if (!debouncedSearchName) {
//       //   setProjectList(allProjects);
//       //   return;
//       // }
//       let source = allReduxProjects;
//       if (!debouncedSearchName) {
//         // const mapped = allReduxProjects.map((project, index) => (
//         //   <Project
//         //     key={`${project._id}-${project.isActive}`}
//         //     index={index}
//         //     projectData={project}
//         //     onUpdateProject={onUpdateProject}
//         //     onClickArchiveBtn={onClickArchiveBtn}
//         //     onClickProjectStatusBtn={onClickProjectStatusBtn}
//         //     darkMode={darkMode}
//         //   />
//         // ));
//         // const source = showArchived
//         //   ? allReduxProjects.filter(p => p.isArchived)
//         //   : allReduxProjects.filter(p => !p.isArchived);

//         const mapped = source.map((project, index) => (
//           <Project
//             key={project._id}
//             index={index}
//             projectData={project}
//             onUpdateProject={onUpdateProject}
//             onClickArchiveBtn={onClickArchiveBtn}
//             onClickProjectStatusBtn={onClickProjectStatusBtn}
//             darkMode={darkMode}
//           />
//         ));

//         setProjectList(mapped);
//         return;
//       }
//       // Mode 1: Search by user
//       if (searchMode === 'person') {
//         const userProjects = await props.getProjectsByUsersName(debouncedSearchName);

//         const filteredProjects = allReduxProjects.filter(p =>
//           userProjects.includes(p._id)
//         );

//         const mapped = filteredProjects.map((project, index) => (
//           <Project
//             key={`${project._id}-${project.isActive}`}
//             index={index}
//             projectData={project}
//             onUpdateProject={onUpdateProject}
//             onClickArchiveBtn={onClickArchiveBtn}
//             onClickProjectStatusBtn={onClickProjectStatusBtn}
//             darkMode={darkMode}
//           />
//         ));

//         setProjectList(mapped);
//         return;
//       }

//       // Mode 2: Search by project name
//       if (searchMode === 'project') {
//         const filteredProjects = allReduxProjects.filter(p =>
//           p.projectName?.toLowerCase().includes(debouncedSearchName.toLowerCase())
//         );

//         const mapped = filteredProjects.map((project, index) => (
//           <Project
//             key={`${project._id}-${project.isActive}`}
//             index={index}
//             projectData={project}
//             onUpdateProject={onUpdateProject}
//             onClickArchiveBtn={onClickArchiveBtn}
//             onClickProjectStatusBtn={onClickProjectStatusBtn}
//             darkMode={darkMode}
//           />
//         ));

//         setProjectList(mapped);
//         return;
//       }
//     };

//   fetchProjects();
// }, [debouncedSearchName, searchMode, allProjects, allReduxProjects]);

  useEffect(() => {
  let source = allReduxProjects;

  source = showArchived
    ? source.filter(p => p.isArchived)
    : source.filter(p => !p.isArchived);

  // Search by project name
  if (debouncedSearchName && searchMode === 'project') {
    source = source.filter(project =>
      (project.projectName || '')
        .toLowerCase()
        .includes(debouncedSearchName.toLowerCase())
    );
  }

  const mapped = source.map((project, index) => (
    <Project
      key={project._id}
      index={index}
      projectData={project}
      onUpdateProject={onUpdateProject}
      onClickArchiveBtn={onClickArchiveBtn}
      onClickProjectStatusBtn={onClickProjectStatusBtn}
      darkMode={darkMode}
    />
  ));

  setProjectList(mapped);
}, [
  allReduxProjects,
  showArchived,        // ✅ REQUIRED
  debouncedSearchName,
  searchMode,
  darkMode,
]);

  const handleSearchName = searchNameInput => {
    setSearchName(searchNameInput);
  };

  return (
    <>
      <div className={darkMode ? 'bg-oxford-blue text-light' : ''}>
        <div className={`${styles.container} py-3 border border-secondary rounded`} style={darkMode ? { backgroundColor: '#1B2A41' } : {}}>
        <div
          className="container py-3 mb-5 rounded"
          style={darkMode ? { backgroundColor: '#1B2A41' } : {}}
        >
          {fetching || !fetched ? <Loading align="center" /> : null}
          <div className="d-flex align-items-center flex-wrap w-100">
            <h3 style={{ display: 'inline-block', marginRight: 10 }}>Projects</h3>
            <EditableInfoModal
              areaName="projectsInfoModal"
              areaTitle="Projects"
              fontSize={30}
              isPermissionPage={true}
              role={role}
            />
            <Overview numberOfProjects={numberOfProjects} numberOfActive={numberOfActive} />
            {canPostProject ? <AddProject hasPermission={hasPermission} onAddNewProject={postProject} /> : null}
          </div>
          <SearchProjectByPerson 
            onSearch={handleSearchName} 
            handleFetchArchivedProjects={handleFetchArchivedProjects} 
            showArchived ={showArchived} 
            suggestions={suggestions}
            onSelectSuggestion={handleSelectSuggestion}
            />


          {canPostProject ? <AddProject hasPermission={hasPermission} /> : null}
        </div>
        {/* <div className="d-flex" style={{ gap: '10px' }}> */}
          {/* <SearchProjectByPerson onSearch={handleSearchName} searchMode={searchMode} /> */}
          <div className="input-group" style={{ maxWidth: '260px', maxHeight: '38px' }}>
            <div className="input-group-prepend">
              <span
              className={`input-group-text ${darkMode ? 'bg-light-grey' : ''}`}
              >
                Filter by
              </span>
            </div>
            <select
              value={searchMode}
              onChange={e => setSearchMode(e.target.value)}
              className={`form-control ${darkMode ? 'bg-white' : ''}`}
              aria-label="Filter by"
            >
              <option value="person">User Name</option>
              <option value="project">Project Name</option>
            </select>
          </div>
        {/* </div> */}
        <div>
        <table className="table table-bordered table-responsive-sm">
          <thead>
            <ProjectTableHeader
              onChange={onChangeCategory}
              selectedValue={categorySelectedForSort}
              showStatus={showStatus}
              selectStatus={onSelectStatus}
              sorted={sortedByName}
              handleSort={handleSort}
              darkMode={darkMode}
            />
          </thead>
          <tbody className={darkMode ? 'bg-yinmn-blue dark-mode' : ''}>{projectList}</tbody>
        </table>
        </div>
      </div>

      <ModalTemplate
        // isOpen={modalData.showModal}
        // closeModal={onCloseModal}
        // confirmModal={modalData.hasConfirmBtn ? confirmArchive : null}
        // setInactiveModal={modalData.hasInactiveBtn ? setProjectStatus : null}
        // setActiveModal={modalData.hasActiveBtn ? setProjectStatus : null}
        // modalMessage={modalData.modalMessage}
        // modalTitle={modalData.modalTitle}
        // darkMode={darkMode}
        // confirmButtonText={isArchiving ? (showArchived ? 'Unarchiving...' : 'Archiving...') : 'Confirm'}
        // // confirmButtonText={isArchiving ? 'Archiving...' : 'Confirm'}
        // // confirmButtonColor="green"
        // isConfirmDisabled={isArchiving}
        // setInactiveButton={isChangingStatus ? 'Setting Inactive' : 'Yes, hide it all'}
        // isSetInactiveDisabled={isChangingStatus}
        // setActiveButton={isChangingStatus ? 'Setting Active' : 'Yes, revive the monster'}
        // isSetActiveDisabled={isChangingStatus}
        isOpen={modalData.showModal}
        closeModal={onCloseModal}
        confirmModal={modalData.hasConfirmBtn ? confirmArchive : null}
        setInactiveModal={modalData.hasInactiveBtn ? setProjectStatus : null}
        setActiveModal={modalData.hasActiveBtn ? setProjectStatus : null}
        modalMessage={modalData.modalMessage}
        modalTitle={modalData.modalTitle}
        darkMode={darkMode}
        confirmButtonText={isArchiving ? (showArchived ? 'Unarchiving...' : 'Archiving...') : 'Confirm'}
        isConfirmDisabled={isArchiving}
        setInactiveButton={isChangingStatus ? 'Setting Inactive' : 'Yes, hide it all'}
        isSetInactiveDisabled={isChangingStatus}
        setActiveButton={isChangingStatus ? 'Setting Active' : 'Yes, revive the monster'}
        isSetActiveDisabled={isChangingStatus}
      />
    </div>
    </>
  );
};

const mapStateToProps = state => {
  return { state };
};

export default connect(mapStateToProps, {
  fetchAllProjects,
  postNewProject,
  modifyProject,
  clearError,
  getPopupById,
  hasPermission,
  getProjectsByUsersName,
  fetchAllArchivedProjects,
  fetchProjectsWithActiveUsers,
  getUserByAutocomplete,
})(Projects);
