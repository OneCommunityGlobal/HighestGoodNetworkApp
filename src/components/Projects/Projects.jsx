/* eslint-disable no-shadow */
/* eslint-disable no-use-before-define */
import { useState, useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import SearchProjectByPerson from 'components/SearchProjectByPerson/SearchProjectByPerson';
import ProjectsList from 'components/BMDashboard/Projects/ProjectsList';
import { fetchAllProjects, modifyProject, clearError } from '../../actions/projects';
import { fetchProjectsWithActiveUsers } from '../../actions/projectMembers';
import { getProjectsByUsersName } from '../../actions/userProfile';
import { getPopupById } from '../../actions/popupEditorAction';
import Overview from './Overview';
import AddProject from './AddProject';
import ProjectTableHeader from './ProjectTableHeader';
import Project from './Project';
import ModalTemplate from './../common/Modal';
import { CONFIRM_ARCHIVE, PROJECT_INACTIVE_CONFIRMATION, PROJECT_ACTIVE_CONFIRMATION } from './../../languages/en/messages';
import './projects.css';
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
    hasConfirmBtn: false,
    hasInactiveBtn: false,
    hasActiveBtn: false,
  };

  const [modalData, setModalData] = useState(initialModalData);
  const [categorySelectedForSort, setCategorySelectedForSort] = useState("");
  const [showStatus, setShowStatus] = useState("");
  const [sortedByName, setSortedByName] = useState("");
  const [sorter, setSorter] = useState({
    column: "PROJECTS",
    direction: "DEFAULT",
  });  
  const [projectTarget, setProjectTarget] = useState({
    projectName: '',
    projectId: -1,
    active: false,
    category: '',
  });
  const [projectList, setProjectList] = useState(null);
  const [searchName, setSearchName] = useState('');
  const [allProjects, setAllProjects] = useState(null);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

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

  const onClickArchiveBtn = projectData => {
    setProjectTarget(projectData);
    setModalData({
      showModal: true,
      modalMessage: `<p style="${darkMode ? 'color: white' : 'color: black;'}">Do you want to archive ${projectData.projectName}?</p>`,
      modalTitle: CONFIRM_ARCHIVE,
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
        modalMessage: `<p style="${darkMode ? 'color: white' : 'color: black'}">${PROJECT_INACTIVE_CONFIRMATION}</p>`,
        modalTitle: `Inactive Confirmation - ${projectData.projectName} `,
        hasConfirmBtn: false,
        hasInactiveBtn: true, // No need for inactive button
        hasActiveBtn: false,
      });
    } else if (!projectData.isActive) {
      // If the project is inactive, allow setting it to active
      setModalData({
        showModal: true,
        modalMessage: `<p style="${darkMode ? 'color: white' : 'color: black;'}">${PROJECT_ACTIVE_CONFIRMATION}</p>`,
        modalTitle: `Active Confirmation - ${projectData.projectName} `,
        hasConfirmBtn: false,
        hasInactiveBtn: false, // No need for inactive button
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

  const handleSort = (column) => {
    setSorter(prev => {
      if (prev.column === column) {
        const nextDirection = prev.direction === "DEFAULT"
          ? "ASC"
          : prev.direction === "ASC"
            ? "DESC"
            : "DEFAULT";
        return { column, direction: nextDirection };
      } else {
        return { column, direction: "ASC" };
      }
    });
  };
  
  const onUpdateProject = async updatedProject => {
    await props.modifyProject(updatedProject);
    // Optimistically update the state
    const updatedProjectsList = projectList.map(project =>
      project._id === updatedProject._id ? updatedProject : project,
    );
    setProjectList(updatedProjectsList);
    /* refresh the page after updating the project */
    await props.fetchAllProjects();
  };

  const confirmArchive = async () => {
    setIsArchiving(true); // show loading on confirm
    const updatedProject = { ...projectTarget, isArchived: true };
    await onUpdateProject(updatedProject);
    await props.fetchAllProjects();
    setIsArchiving(false); // reset loading
    onCloseModal();
  };

  const setProjectStatus = async () => {
    setIsChangingStatus(true);
    const updatedProject = { ...projectTarget, isActive: !projectTarget.isActive };
    await onUpdateProject(updatedProject)
    setIsChangingStatus(false);
    // Close the modal after update
    onCloseModal();
  };

  const postProject = async (name, category) => {
    await props.postNewProject(name, category);
    refreshProjects(); // Refresh project list after adding a project
  };

  const generateProjectList = (categorySelectedForSort, showStatus) => {
    const activeMemberCounts = props.state.projectMembers?.activeMemberCounts || {};  
    const filteredProjects = allReduxProjects
      .filter(project => !project.isArchived)
      .filter(project => {
        if (categorySelectedForSort && showStatus){
          return project.category === categorySelectedForSort && project.isActive === showStatus;
        } else if (categorySelectedForSort) {
          return project.category === categorySelectedForSort;
        } else if (showStatus === 'Active') {
          return project.isActive === true;
        } else if (showStatus === 'Inactive') {
          return project.isActive === false;
        } else {
          return true;
        }
      });
  
    const sortedProjects = [...filteredProjects].sort((a, b) => {
      const { column, direction } = sorter;
  
      if (column === "PROJECTS") {
        if (direction === "ASC") {
          return a.projectName.localeCompare(b.projectName, undefined, { sensitivity: 'base' });
        } else if (direction === "DESC") {
          return b.projectName.localeCompare(a.projectName, undefined, { sensitivity: 'base' });
        } else {
          return 0; // Default: recently added, retain original order
        }
      }
  
      if (column === "MEMBERS") {
        if (direction === "ASC") {
          const countA = activeMemberCounts[a._id] || 0;
          const countB = activeMemberCounts[b._id] || 0;
          return countA - countB;
        } else if (direction === "DESC") {
          const countA = activeMemberCounts[a._id] || 0;
          const countB = activeMemberCounts[b._id] || 0;
          return countB - countA;
        } else {
          return 0; // Default: keep same order as PROJECT sorting
        }
      }

      if (column === "INVENTORY") {
        const dateA = new Date(a.inventoryModifiedDatetime);
        const dateB = new Date(b.inventoryModifiedDatetime);
        if (direction === "ASC") return dateA - dateB;
        if (direction === "DESC") return dateB - dateA;
        return 0;
      }
  
      return 0;
    });
  
    const renderedProjects = sortedProjects.map((project, index) => (
      <Project
        key={`${project._id}-${project.isActive}`}
        index={index}
        projectData={project}
        activeMemberCounts={activeMemberCounts[project._id] || 0}
        onUpdateProject={onUpdateProject}
        onClickArchiveBtn={onClickArchiveBtn}
        onClickProjectStatusBtn={onClickProjectStatusBtn}
        darkMode={darkMode}
      />
    ));
  
    setProjectList(renderedProjects);
    setAllProjects(renderedProjects);
  };
  

  const refreshProjects = async () => {
    await props.fetchAllProjects();
  };

  useEffect(() => {
    props.fetchAllProjects();
  }, []);

  useEffect(() => {
    props.fetchProjectsWithActiveUsers();
  }, []);

  useEffect(() => {
    // console.log('generateProjectList triggered:', {
    //   fetched: props.state.allProjects.fetched,
    //   fetching: props.state.allProjects.fetching,
    //   dataLength: allReduxProjects?.length || 0,
    //   status: props.state.allProjects.status
    // });
    generateProjectList(categorySelectedForSort, showStatus);
    if (status !== 200) {
      setModalData({
        showModal: true,
        modalMessage: error,
        modalTitle: 'ERROR',
        hasConfirmBtn: false,
        hasInactiveBtn: false,
      });
    }
  }, [categorySelectedForSort, showStatus, sorter, allReduxProjects, props.state.theme.darkMode, props.state.projectMembers?.activeMemberCounts]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (debouncedSearchName) {
        const projects = await props.getProjectsByUsersName(debouncedSearchName);
        if (projects && allReduxProjects) {
          const newProjectList = allProjects.filter(project => 
            projects.some(p => p === project._id)
          );
          setProjectList(newProjectList);
        } else {
          setProjectList(allProjects);
        }
      } else {
        setProjectList(allProjects);
      }
    };
    fetchProjects();
  }, [debouncedSearchName, allProjects, allReduxProjects]);

  const handleSearchName = searchNameInput => {
    setSearchName(searchNameInput);
  };

  return (

    <div className={darkMode ? 'bg-oxford-blue text-light' : ''}>
      <div className={`container py-3 ${darkMode ? 'bg-yinmn-blue-light text-light' : ''}`}>
        {fetching || !fetched ? <Loading align="center" /> : null}
        <div className="d-flex align-items-center">
          <h3 style={{ display: 'inline-block', marginRight: 10 }}>Projects</h3>
          <EditableInfoModal
            areaName="projectsInfoModal"
            areaTitle="Projects"
            fontSize={30}
            isPermissionPage
            role={role}
            darkMode={darkMode}
          />
          <Overview numberOfProjects={numberOfProjects} numberOfActive={numberOfActive} />

            {canPostProject ? <AddProject hasPermission={hasPermission} /> : null}
        </div>

        <SearchProjectByPerson onSearch={handleSearchName} />

        <table className="table table-bordered table-responsive-sm">
          <thead>
            <ProjectTableHeader
              onChange={onChangeCategory}
              selectedValue={categorySelectedForSort}
              showStatus={showStatus}
              selectStatus={onSelectStatus}
              sorted={sorter}
              handleSort={handleSort}
              darkMode={darkMode}
            />
          </thead>
          <tbody className={darkMode ? 'bg-yinmn-blue dark-mode' : ''}>{projectList}</tbody>
        </table>
      </div>

      <ModalTemplate
        isOpen={modalData.showModal}
        closeModal={onCloseModal}
        confirmModal={modalData.hasConfirmBtn ? confirmArchive : null}
        setInactiveModal={modalData.hasInactiveBtn ? setProjectStatus : null}
        setActiveModal={modalData.hasActiveBtn ? setProjectStatus : null}
        modalMessage={modalData.modalMessage}
        modalTitle={modalData.modalTitle}
        darkMode={darkMode}
        confirmButtonText={isArchiving ? 'Archiving...' : 'Confirm'}
        isConfirmDisabled={isArchiving}
        setInactiveButton={isChangingStatus ? 'Setting Inactive' : 'Yes, hide it all'}
        isSetInactiveDisabled={isChangingStatus}
        setActiveButton={isChangingStatus ? 'Setting Active' : 'Yes, revive the monster'}
        isSetActiveDisabled={isChangingStatus}
      />
    </div>
  );
};

const mapStateToProps = state => {
  return { state };
};

export default connect(mapStateToProps, {
  fetchAllProjects,
  modifyProject,
  clearError,
  getPopupById,
  hasPermission,
  getProjectsByUsersName,
  fetchProjectsWithActiveUsers,
})(Projects);
