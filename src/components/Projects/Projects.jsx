import { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
  fetchAllProjects,
  modifyProject,
  clearError,
} from '../../actions/projects';
import { getProjectActiveUserById } from '../../actions/projectMembers';
import { getProjectsByUsersName } from '../../actions/userProfile';
import { getPopupById } from '../../actions/popupEditorAction';
import Overview from './Overview';
import AddProject from './AddProject';
import ProjectTableHeader from './ProjectTableHeader';
import Project from './Project';
import ModalTemplate from './../common/Modal';
import { CONFIRM_ARCHIVE } from './../../languages/en/messages';
import './projects.css';
import Loading from '../common/Loading';
import hasPermission from '../../utils/permissions';
import EditableInfoModal from '../UserProfile/EditableModal/EditableInfoModal';
import SearchProjectByPerson from 'components/SearchProjectByPerson/SearchProjectByPerson';
import ProjectsList from 'components/BMDashboard/Projects/ProjectsList';
import { confirmNonHgnUserEmailSubscription } from 'actions/sendEmails';

const Projects = function (props) {
  const role = props.state.userProfile.role;
  const { darkMode } = props.state.theme;
  const numberOfProjects = props.state.allProjects.projects.length;
  const numberOfActive = props.state.allProjects.projects.filter(project => project.isActive).length;
  const { fetching, fetched, status, error } = props.state.allProjects;
  const initialModalData = {
    showModal: false,
    modalMessage: "",
    modalTitle: "",
    hasConfirmBtn: false,
    hasInactiveBtn: false,
  };

  const [modalData, setModalData] = useState(initialModalData);
  const [categorySelectedForSort, setCategorySelectedForSort] = useState("");
  const [showStatus, setShowStatus] = useState("");
  const [sortedByName, setSortedByName] = useState("");
  const [projectTarget, setProjectTarget] = useState({
    projectName: '',
    projectId: -1,
    active: false,
    category: '',
  });
  const [projectList, setProjectList] = useState(null);
  const [searchName, setSearchName] = useState("");
  const [allProjects, setAllProjects] = useState(null);

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

  const onClickArchiveBtn = (projectData) => {
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

  const onChangeCategory = (value) => {
    setCategorySelectedForSort(value);
  };

  const onSelectStatus = (value) => {
    setShowStatus(value);
  }

  const handleSort = (e) => {
    const clickedId = e.target.id;
    setSortedByName(prevState => prevState === clickedId ? "" : clickedId);
  }

  const onUpdateProject = async (updatedProject) => {
    await props.modifyProject(updatedProject);
    /* refresh the page after updating the project */
    await props.fetchAllProjects();
  };

  const confirmArchive = async () => {
    const updatedProject = { ...projectTarget, isArchived: true };
    await onUpdateProject(updatedProject);
    await props.fetchAllProjects();
    onCloseModal();
  };

  const setInactiveProject = async () => {
    const updatedProject = { ...projectTarget, isActive: !isActive };
    await onUpdateProject(updatedProject);
    onCloseModal();
  };

  const postProject = async (name, category) => {
    await props.postNewProject(name, category);
    refreshProjects(); // Refresh project list after adding a project
  };

  const generateProjectList = async (categorySelectedForSort, showStatus, sortedByName) => {
    const { projects } = props.state.allProjects;

    // Precompute active user counts for all projects if sorting by active members
    let activeUserCounts = {};
    if (sortedByName === "SortingByMostActiveMembers") {
      for (const project of projects) {
        activeUserCounts[project._id] = await props.getProjectActiveUserById(project._id)
          .then(() => props.state.projectMembers.activeUserCount)
          .catch(() => 0); // Default to 0 if there is an error
        // props.getProjectActiveUserById(project._id).then(() => console.log("Active User Count:", props.state.projectMembers.activeUserCount));
      }
    }

    // Filter and sort projects
    const projectList = projects
      .filter((project) => {
        if (categorySelectedForSort && showStatus) {
          return project.category === categorySelectedForSort && project.isActive === showStatus;
        } else if (categorySelectedForSort) {
          return project.category === categorySelectedForSort;
        } else if (showStatus) {
          return project.isActive === showStatus;
        } else {
          return true;
        }
      })
      .sort((a, b) => {
        if (sortedByName === "Ascending") {
          return a.projectName.localeCompare(b.projectName);
        } else if (sortedByName === "Descending") {
          return b.projectName.localeCompare(a.projectName);
        } else if (sortedByName === "SortingByRecentEditedMembers") {
          return b.membersModifiedDatetime - a.membersModifiedDatetime;
        } else if (sortedByName === "SortingByMostActiveMembers") {
          return (activeUserCounts[b._id] || 0) - (activeUserCounts[a._id] || 0);
        } else {
          return 0;
        }
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

    // Update state
    setProjectList(projectList);
    setAllProjects(projectList);
  };

  const refreshProjects = async () => {
    await props.fetchAllProjects();
  };

  useEffect(() => {
    props.fetchAllProjects();
  }, []);

  useEffect(() => {
    const fetchProjectList = async () => {
      try {
        await generateProjectList(categorySelectedForSort, showStatus, sortedByName);
      } catch (error) {
        console.error('Error generating project list:', error);
        setModalData({
          showModal: true,
          modalMessage: error.message || 'An unexpected error occurred.',
          modalTitle: 'ERROR',
          hasConfirmBtn: false,
          hasInactiveBtn: false,
        });
      }
    };

    fetchProjectList();
  }, [categorySelectedForSort, showStatus, sortedByName, props.state.allProjects, props.state.theme.darkMode]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (debouncedSearchName) {
        const projects = await props.getProjectsByUsersName(debouncedSearchName);
        if (projects) {
          const newProjectList = allProjects.filter(project =>
            projects.some(p => p === project.key)
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

  const handleSearchName = (searchNameInput) => {
    setSearchName(searchNameInput);
  };

  return (
    <>
      <div className={darkMode ? 'bg-oxford-blue text-light' : ''}>
        <div className="container py-3">
          {fetching || !fetched ? <Loading align="center" /> : null}
          <div className="d-flex align-items-center">
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
            <tbody className={darkMode ? 'bg-yinmn-blue dark-mode' : ''}>
              {projectList}
            </tbody>
          </table>
        </div>

        <ModalTemplate
          isOpen={modalData.showModal}
          closeModal={onCloseModal}
          confirmModal={modalData.hasConfirmBtn ? confirmArchive : null}
          setInactiveModal={modalData.hasInactiveBtn ? setInactiveProject : null}
          modalMessage={modalData.modalMessage}
          modalTitle={modalData.modalTitle}
        />
      </div>
    </>
  );
}

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
  getProjectActiveUserById
})(Projects);
