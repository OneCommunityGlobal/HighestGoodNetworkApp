/* eslint-disable no-shadow */
/* eslint-disable no-use-before-define */
import { useState, useEffect } from 'react';
import { connect , useSelector } from 'react-redux';
import SearchProjectByPerson from '~/components/SearchProjectByPerson/SearchProjectByPerson';
import ProjectsList from '~/components/BMDashboard/Projects/ProjectsList';
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
  const [categorySelectedForSort, setCategorySelectedForSort] = useState('');
  const [showStatus, setShowStatus] = useState('');
  const [sortedByName, setSortedByName] = useState('');
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
  const [searchMode, setSearchMode] = useState('person'); 

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

  // const handleSort = (e) => {
  //   const clickedId = e.target.id;
  //   setSortedByName(prevState => prevState === clickedId ? "" : clickedId);
  // }
  const handleSort = e => {
    const clickedId = e.target.id;
    if (clickedId === 'SortingByRecentEditedInventory') {
      setSortedByName(prevState =>
        prevState === 'SortingByRecentEditedInventory' ? '' : 'SortingByRecentEditedInventory',
      );
    } else {
      setSortedByName(prevState => (prevState === clickedId ? '' : clickedId));
    }
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

  const generateProjectList = (categorySelectedForSort, showStatus, sortedByName) => {
    // const { projects } = props.state.allProjects;
    const activeMemberCounts = props.state.projectMembers?.activeMemberCounts || {};
    const filteredProjects = allReduxProjects.filter(project => !project.isArchived).filter(project => {
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
      })
      .sort((a, b) => {
        if (sortedByName === 'Ascending') {
          return a.projectName[0].toLowerCase() < b.projectName[0].toLowerCase() ? -1 : 1;
        }
        if (sortedByName === 'Descending') {
          return a.projectName[0].toLowerCase() < b.projectName[0].toLowerCase() ? 1 : -1;
        }
        if (sortedByName === 'SortingByRecentEditedMembers') {
          return a.membersModifiedDatetime < b.membersModifiedDatetime ? 1 : -1;
        }
        if (sortedByName === 'SortingByRecentEditedInventory') {
          return a.inventoryModifiedDatetime < b.inventoryModifiedDatetime ? 1 : -1;
        }
        if (sortedByName === 'SortingByMostActiveMembers') {
          const lenA = activeMemberCounts[a._id] || 0;
          const lenB = activeMemberCounts[b._id] || 0;
          return lenB - lenA; // Most active first
        }
        return 0;
      })
      .map((project, index) => (
        <Project
          // key={project._id}
          key={`${project._id}-${project.isActive}`} 
          index={index}
          projectData={project}
          onUpdateProject={onUpdateProject}
          onClickArchiveBtn={onClickArchiveBtn}
          onClickProjectStatusBtn={onClickProjectStatusBtn}
          darkMode={darkMode}
        />
      ));
    setProjectList(filteredProjects);
    setAllProjects(filteredProjects);
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
    generateProjectList(categorySelectedForSort, showStatus, sortedByName);
    if (status !== 200) {
      setModalData({
        showModal: true,
        modalMessage: error,
        modalTitle: 'ERROR',
        hasConfirmBtn: false,
        hasInactiveBtn: false,
      });
    }
  }, [categorySelectedForSort, showStatus, sortedByName, allReduxProjects, props.state.theme.darkMode]);
  // }, [fetched, categorySelectedForSort, showStatus, sortedByName, props.state.theme.darkMode]);

  useEffect(() => {
  const fetchProjects = async () => {
    if (!debouncedSearchName) {
      setProjectList(allProjects);
      return;
    }

    // Mode 1: Search by user
    if (searchMode === 'person') {
      const userProjects = await props.getProjectsByUsersName(debouncedSearchName);

      const filteredProjects = allReduxProjects.filter(p =>
        userProjects.includes(p._id)
      );

      const mapped = filteredProjects.map((project, index) => (
        <Project
          key={`${project._id}-${project.isActive}`}
          index={index}
          projectData={project}
          onUpdateProject={onUpdateProject}
          onClickArchiveBtn={onClickArchiveBtn}
          onClickProjectStatusBtn={onClickProjectStatusBtn}
          darkMode={darkMode}
        />
      ));

      setProjectList(mapped);
      return;
    }

    // Mode 2: Search by project name
    if (searchMode === 'project') {
      const filteredProjects = allReduxProjects.filter(p =>
        p.projectName?.toLowerCase().includes(debouncedSearchName.toLowerCase())
      );

      const mapped = filteredProjects.map((project, index) => (
        <Project
          key={`${project._id}-${project.isActive}`}
          index={index}
          projectData={project}
          onUpdateProject={onUpdateProject}
          onClickArchiveBtn={onClickArchiveBtn}
          onClickProjectStatusBtn={onClickProjectStatusBtn}
          darkMode={darkMode}
        />
      ));

      setProjectList(mapped);
      return;
    }
  };

  fetchProjects();
}, [debouncedSearchName, searchMode, allProjects, allReduxProjects]);

  const handleSearchName = searchNameInput => {
    setSearchName(searchNameInput);
  };

  return (
    <>
      <div className={darkMode ? 'bg-oxford-blue text-light' : ''}>
        <div className="container py-3 mb-5 border border-secondary rounded" style={darkMode ? { backgroundColor: '#1B2A41' } : {}}>
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

          {canPostProject ? <AddProject hasPermission={hasPermission} /> : null}
        </div>
        <div className="d-flex" style={{ gap: '10px' }}>
          <SearchProjectByPerson onSearch={handleSearchName} searchMode={searchMode} />
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
        </div>
        <div style={{ overflowX: 'auto', overflowY: 'auto',  maxHeight: '500px' }}>
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
    </>
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
