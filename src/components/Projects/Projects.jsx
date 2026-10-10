/* eslint-disable no-shadow */
/* eslint-disable no-use-before-define */
import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect , useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import SearchProjectByPerson from '~/components/SearchProjectByPerson/SearchProjectByPerson';
import { fetchAllProjects, fetchAllArchivedProjects, modifyProject, clearError } from '../../actions/projects';
import { fetchProjectsWithActiveUsers } from '../../actions/projectMembers';
import { getProjectsByUsersName } from '../../actions/userProfile';
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

// Stable reference for the empty case. Returning a fresh [] from a selector
// gives a new identity on every render, which retriggers effects that depend
// on it.
const EMPTY_PROJECT_LIST = [];

import { permissions } from '../../utils/constants';
const Projects = function(props) {
  const { role } = props.state.userProfile;
  const { darkMode } = props.state.theme;
  const location = useLocation();
  const taskSelectionMode = location.state?.taskSelectionMode || false;
  const taskSelectionReturnPath = location.state?.returnPath || '/bmdashboard/AddNewTeam';
  const allReduxProjects = useSelector(state => state.allProjects.projects);
  const archivedReduxProjects = useSelector(
    state => state.allProjects.archivedProjects ?? EMPTY_PROJECT_LIST,
  );
  // Total counts every project the app knows about, so it does not change when
  // the archived view is toggled. The second card switches between the active
  // count and the archived count depending on which list is on screen.
  const numberOfProjects = allReduxProjects.length + archivedReduxProjects.length;
  const numberOfActive = allReduxProjects.filter(project => project.isActive).length;
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
  const [personSearchResult, setPersonSearchResult] = useState(null);
  const [searchName, setSearchName] = useState('');
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [searchMode, setSearchMode] = useState('person');

  const [showArchived, setShowArchived] = useState(false);

  const handleFetchArchivedProjects = () => {
  setShowArchived(prev => {
    const next = !prev;
    if (next) {
      props.fetchAllArchivedProjects();
    } else {
      props.fetchAllProjects();
    }
      return next;
    });
  };

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

  const searchQuery = searchName.trim();
  const debouncedSearchName = useDebounce(searchQuery, 300);
  const activeMemberCounts = props.state.projectMembers?.activeMemberCounts;
  const { getProjectsByUsersName: searchProjectsByPerson } = props;
  const personSearchLoading = searchMode === 'person' && Boolean(searchQuery) && (
    searchQuery !== debouncedSearchName || personSearchResult?.query !== searchQuery
  );

  useEffect(() => {
    let current = true;
    setPersonSearchResult(null);
    if (searchMode !== 'person' || !searchQuery || searchQuery !== debouncedSearchName) {
      return () => { current = false; };
    }

    const fetchPersonProjects = async () => {
      let ids = [];
      try {
        const result = await searchProjectsByPerson(searchQuery);
        if (Array.isArray(result)) ids = result.filter(id => typeof id === 'string');
      } catch {
        // The existing search action handles user-facing API errors.
      }
      if (current) setPersonSearchResult({ query: searchQuery, ids: new Set(ids) });
    };
    fetchPersonProjects();
    return () => { current = false; };
  }, [searchQuery, debouncedSearchName, searchMode, searchProjectsByPerson]);

  const canPostProject = props.hasPermission(permissions.postProject);
  const canDeleteProject = props.hasPermission(permissions.deleteProject);
  const tableColumnCount = canDeleteProject ? 8 : 7;
  const hasSearchOrFilters = Boolean(searchName || categorySelectedForSort || showStatus);
  const clearSearchAndFilters = () => {
    setSearchName('');
    setCategorySelectedForSort('');
    setShowStatus('');
  };

  const onClickArchiveBtn = projectData => {
    setProjectTarget(projectData);
    const archiveMessage = projectData.isArchived
      ? `<p style="${darkMode ? 'color: white' : 'color: black'}">Do you want to unarchive <b>${projectData.projectName}</b>? This will restore it and its tasks.</p>`
      : `<p style="${darkMode ? 'color: white' : 'color: black'}"><b>Hold on!</b><br/>Archiving <b>${projectData.projectName}</b> will deactivate all its WBS, tasks, and time entries, and remove it from all team members' profiles.<br/><b>Sure about this?</b></p>`;
    setModalData({
      showModal: true,
      modalMessage: archiveMessage,
      modalTitle: projectData.isArchived ? 'Confirm Unarchive' : CONFIRM_ARCHIVE,
      hasConfirmBtn: true,
      hasInactiveBtn: false,
      hasActiveBtn: false,
    });
  };

  const onClickProjectStatusBtn = projectData => {
    setProjectTarget(projectData);
    if (projectData.isActive) {
      // If the project is archived, allow unarchiving
      setModalData({
        showModal: true,
        modalMessage: `<p style="${
          darkMode ? 'color: white' : 'color: black'
        }">${PROJECT_INACTIVE_CONFIRMATION}</p>`,
        modalTitle: `Inactive Confirmation - ${projectData.projectName} `,
        hasConfirmBtn: false,
        hasInactiveBtn: true, // No need for inactive button
        hasActiveBtn: false,
      });
    } else {
      setModalData({
        showModal: true,
        modalMessage: `<p style="${
          darkMode ? 'color: white' : 'color: black;'
        }">${PROJECT_ACTIVE_CONFIRMATION}</p>`,
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

  const getNextSortDirection = direction => {
    if (direction === 'DEFAULT') return 'ASC';
    if (direction === 'ASC') return 'DESC';
    return 'DEFAULT';
  };

  const onInventorySortChange = option => {
    if (option === 'EDITED' || option === 'DEFAULT') {
      setSorter({ column: 'INVENTORY', direction: option === 'EDITED' ? 'DESC' : 'DEFAULT' });
    }
  };

  const handleSort = column => {
    setSorter(prev => {
      if (prev.column === column) {
        return { column, direction: getNextSortDirection(prev.direction) };
      }
      return { column, direction: getNextSortDirection('DEFAULT') };
    });
  };

  const onUpdateProject = async updatedProject => {
    await props.modifyProject(updatedProject);
    /* refresh the page after updating the project */
    await props.fetchAllProjects();
  };

  const confirmArchive = async () => {
    setIsArchiving(true);
    const updatedProject = { ...projectTarget, isArchived: !projectTarget.isArchived };
    await onUpdateProject(updatedProject);
    if (showArchived) {
      await props.fetchAllArchivedProjects(); // stay in archived view after unarchiving
    } else {
      await props.fetchAllProjects();
    }
    setIsArchiving(false);
    onCloseModal();
  };

  const setProjectStatus = async () => {
    setIsChangingStatus(true);
    const updatedProject = { ...projectTarget, isActive: !projectTarget.isActive };
    await onUpdateProject(updatedProject);
    setIsChangingStatus(false);
    // Close the modal after update
    onCloseModal();
  };

  const sortedProjects = useMemo(() => {
    const sourceProjects = showArchived ? archivedReduxProjects : allReduxProjects;
    const selectedStatus = { Active: true, Inactive: false }[showStatus];
    const statusRestricted = showStatus === 'Active' || showStatus === 'Inactive';
    const filteredProjects = sourceProjects.filter(project => {
      const categoryMatches =
        !categorySelectedForSort || project.category === categorySelectedForSort;
      const statusMatches = !statusRestricted || project.isActive === selectedStatus;
      const query = searchQuery ? debouncedSearchName : '';
      const searchMatches = !searchQuery || (searchMode === 'project'
        ? project.projectName?.toLowerCase().includes(query.toLowerCase())
        : !personSearchLoading && personSearchResult?.ids.has(project._id));
      return categoryMatches && statusMatches && searchMatches;
    });

    return [...filteredProjects].sort((a, b) => {
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
          const countA = activeMemberCounts?.[a._id] || 0;
          const countB = activeMemberCounts?.[b._id] || 0;
          return countA - countB;
        } else if (direction === "DESC") {
          const countA = activeMemberCounts?.[a._id] || 0;
          const countB = activeMemberCounts?.[b._id] || 0;
          return countB - countA;
        } else {
          return 0; // Default: keep same order as PROJECT sorting
        }
      }

      if (column === "INVENTORY") {
        if (direction === 'DEFAULT') return 0;

        const dateA = Date.parse(a.inventoryModifiedDatetime);
        const dateB = Date.parse(b.inventoryModifiedDatetime);
        const validA = Number.isFinite(dateA);
        const validB = Number.isFinite(dateB);
        // Unknown dates stay last regardless of the selected direction.
        if (validA !== validB) return validA ? -1 : 1;
        if (validA && dateA !== dateB) {
          return dateB - dateA;
        }
        return (
          a.projectName.localeCompare(b.projectName, undefined, { sensitivity: 'base' }) ||
          a._id.localeCompare(b._id)
        );
      }

      return 0;
    });

  }, [allReduxProjects, archivedReduxProjects, showArchived, categorySelectedForSort,
    showStatus, searchQuery, debouncedSearchName, searchMode, personSearchLoading,
    personSearchResult, sorter, activeMemberCounts]);

  const sourceProjects = showArchived ? archivedReduxProjects : allReduxProjects;
  const emptyMessage = sourceProjects.length === 0
    ? (showArchived ? 'No archived projects available.' : 'No projects available.')
    : 'No projects match your search and filters.';

  const projectList = sortedProjects.map((project, index) => (
    <Project
      key={`${project._id}-${project.isActive}`}
      index={index}
      projectData={project}
      activeMemberCounts={activeMemberCounts?.[project._id] || 0}
      onUpdateProject={onUpdateProject}
      onClickArchiveBtn={onClickArchiveBtn}
      onClickProjectStatusBtn={onClickProjectStatusBtn}
      darkMode={darkMode}
      taskSelectionMode={taskSelectionMode}
      taskSelectionReturnPath={taskSelectionReturnPath}
    />
  ));


  useEffect(() => {
    // Both lists are loaded up front so the total is correct before the
    // archived view is ever opened.
    props.fetchAllProjects();
    props.fetchAllArchivedProjects();
  }, []);

  useEffect(() => {
    props.fetchProjectsWithActiveUsers();
  }, []);

  useEffect(() => {
    if (status !== 200) {
      setModalData({
        showModal: true,
        modalMessage: error,
        modalTitle: 'ERROR',
        hasConfirmBtn: false,
        hasInactiveBtn: false,
      });
    }
  }, [status, error]);

  const handleSearchName = searchNameInput => {
    setSearchName(searchNameInput);
  };

  return (
    <>
      <div className={darkMode ? 'bg-oxford-blue text-light' : ''}>
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
            <Overview
              numberOfProjects={numberOfProjects}
              numberOfActive={numberOfActive}
              numberOfArchived={archivedReduxProjects.length}
              showArchived={showArchived}
            />
            {canPostProject ? <AddProject hasPermission={hasPermission} /> : null}
            {taskSelectionMode && (
              <div className="alert alert-info mb-2" role="alert">
                <strong>Task Selection Mode:</strong> Click the <i className="fa fa-tasks" /> WBS button on a project to browse its tasks.
              </div>
            )}
        </div>
        <div className="d-flex flex-wrap mb-3" style={{ gap: '10px' }}>
          <SearchProjectByPerson
            value={searchName}
            onSearch={handleSearchName}
            searchMode={searchMode}
            handleFetchArchivedProjects={handleFetchArchivedProjects}
            showArchived={showArchived}
          />
          <div
            className="input-group"
            style={{ maxWidth: '260px', maxHeight: '38px', flexShrink: 0 }}
          >
            <div className="input-group-prepend">
              <span
                  className={`input-group-text ${darkMode ? styles.searchLabelDark + ' text-light' : ''}`}
              >
                Filter by
              </span>
            </div>
            <select
              value={searchMode}
              onChange={e => setSearchMode(e.target.value)}
              className={`form-control ${darkMode ? 'bg-darkmode-liblack text-light' : ''}`}
              aria-label="Filter by"
            >
              <option value="person">User Name</option>
              <option value="project">Project Name</option>
            </select>
          </div>
          <button
          type="button"
          onClick={handleFetchArchivedProjects}
          style={{ whiteSpace: 'nowrap', height: '38px', flexShrink: 0 }}
          className={`btn px-3 ${
            darkMode
              ? styles.archiveToggleDark
              : showArchived
                ? 'btn-warning'
                : 'btn-outline-secondary'
          }`}
        >
          {showArchived ? 'Hide Archived' : 'Show Archived'}
        </button>
        {hasSearchOrFilters && (
          <button type="button" className={`btn ${darkMode ? 'btn-outline-light' : 'btn-outline-secondary'}`} onClick={clearSearchAndFilters}>
            Clear search and filters
          </button>
        )}
        </div>
        <div className="table-responsive-sm w-100">
        <table
          className={`table table-bordered ${styles.projectsTable}`}
          style={{ tableLayout: 'fixed', width: '100%' }}
        >
          <thead className={styles.projectsTableHead}>
            <ProjectTableHeader
              canDeleteProject={canDeleteProject}
              onChange={onChangeCategory}
              selectedValue={categorySelectedForSort}
              showStatus={showStatus}
              selectStatus={onSelectStatus}
              sorted={sorter}
              handleSort={handleSort}
              onInventorySortChange={onInventorySortChange}
              darkMode={darkMode}
            />
          </thead>
          <tbody className={darkMode ? 'bg-yinmn-blue dark-mode' : ''}>
            {personSearchLoading ? (
              <tr>
                <td colSpan={tableColumnCount}>
                  <div role="status" aria-label="Searching projects">
                    <Loading align="center" darkMode={darkMode} />
                  </div>
                </td>
              </tr>
            ) : fetching || !fetched || status !== 200 ? null : sortedProjects.length === 0 ? (
              <tr>
                <td colSpan={tableColumnCount} className="text-center py-4">
                  <div role="status">{emptyMessage}</div>
                </td>
              </tr>
            ) : projectList}
          </tbody>
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
        confirmButtonText={isArchiving
          ? (projectTarget.isArchived ? 'Unarchiving...' : 'Archiving...')
          : (projectTarget.isArchived ? 'Unarchive' : 'Yes, archive it')
        }
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

Projects.propTypes = {
  clearError: PropTypes.func.isRequired,
  fetchAllProjects: PropTypes.func.isRequired,
  fetchAllArchivedProjects: PropTypes.func.isRequired,
  fetchProjectsWithActiveUsers: PropTypes.func.isRequired,
  getProjectsByUsersName: PropTypes.func.isRequired,
  hasPermission: PropTypes.func.isRequired,
  modifyProject: PropTypes.func.isRequired,
  state: PropTypes.shape({
    allProjects: PropTypes.shape({
      projects: PropTypes.arrayOf(PropTypes.object).isRequired,
      fetching: PropTypes.bool,
      fetched: PropTypes.bool,
      status: PropTypes.number,
      error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    }).isRequired,
    projectMembers: PropTypes.shape({
      activeMemberCounts: PropTypes.objectOf(PropTypes.number),
    }),
    theme: PropTypes.shape({
      darkMode: PropTypes.bool,
    }).isRequired,
    userProfile: PropTypes.shape({
      role: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

export default connect(mapStateToProps, {
  fetchAllProjects,
  fetchAllArchivedProjects,
  modifyProject,
  clearError,
  getPopupById,
  hasPermission,
  getProjectsByUsersName,
  fetchProjectsWithActiveUsers,
})(Projects);
