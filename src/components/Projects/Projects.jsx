/* eslint-disable no-shadow */
/* eslint-disable no-use-before-define */
import { useState, useEffect } from 'react';
import { connect } from 'react-redux';
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
import ModalTemplate from '../common/Modal';
import { CONFIRM_ARCHIVE } from '../../languages/en/messages';
import './projects.css';
import Loading from '../common/Loading';
import hasPermission from '../../utils/permissions';
import EditableInfoModal from '../UserProfile/EditableModal/EditableInfoModal';

const Projects = function(props) {
  const { role } = props.state.userProfile;
  const { darkMode } = props.state.theme;
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
      modalMessage: `<p>Do you want to archive ${projectData.projectName}?</p>`,
      modalTitle: CONFIRM_ARCHIVE,
      hasConfirmBtn: true,
      hasInactiveBtn: true,
    });
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

  const setInactiveProject = async () => {
    const updatedProject = { ...projectTarget, isActive: !projectTarget.active };
    await onUpdateProject(updatedProject);
    onCloseModal();
  };

  const postProject = async (name, category) => {
    await props.postNewProject(name, category);
    refreshProjects(); // Refresh project list after adding a project
  };

  const generateProjectList = (categorySelectedForSort, showStatus, sortedByName) => {
    const { projects } = props.state.allProjects;
    const activeMemberCounts = props.state.projectMembers?.activeMemberCounts || {};
    const filteredProjects = projects
      .filter(project => !project.isArchived)
      .filter(project => {
        if (categorySelectedForSort && showStatus) {
          return project.category === categorySelectedForSort && project.isActive === showStatus;
        }
        if (categorySelectedForSort) {
          return project.category === categorySelectedForSort;
        }
        if (showStatus === 'Active') {
          return project.isActive === true;
        }
        if (showStatus === 'Inactive') {
          return project.isActive === false;
        }
        return true;
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
          key={project._id}
          index={index}
          projectData={project}
          onUpdateProject={onUpdateProject}
          onClickArchiveBtn={onClickArchiveBtn}
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
  }, [
    categorySelectedForSort,
    showStatus,
    sortedByName,
    props.state.allProjects,
    props.state.theme.darkMode,
  ]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (debouncedSearchName) {
        const projects = await props.getProjectsByUsersName(debouncedSearchName);
        if (projects) {
          const newProjectList = allProjects.filter(project =>
            projects.some(p => p === project.key),
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
  }, [debouncedSearchName]);

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
              sorted={sortedByName}
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
        setInactiveModal={modalData.hasInactiveBtn ? setInactiveProject : null}
        modalMessage={modalData.modalMessage}
        modalTitle={modalData.modalTitle}
        darkMode={darkMode}
        confirmButtonText={isArchiving ? 'Archiving...' : 'Confirm'}
        isConfirmDisabled={isArchiving}
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
