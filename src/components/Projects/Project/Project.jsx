import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ARCHIVE } from './../../../languages/en/ui';
import './../projects.module.css';
import { Link } from 'react-router-dom';
import { NavItem } from 'reactstrap';
import { connect } from 'react-redux';
import hasPermission from '~/utils/permissions';
import { boxStyle } from '~/styles';
import { toast } from 'react-toastify';
import { modifyProject, clearError } from '../../../actions/projects';
import ModalTemplate from './../../common/Modal';
import { CONFIRM_ARCHIVE, CONFIRM_UNARCHIVE } from './../../../languages/en/messages';

const Project = props => {
  const { darkMode, index } = props;
  const [projectData, setProjectData] = useState(props.projectData);
  const { projectName, isActive,isArchived = false, _id: projectId } = projectData;
  // const { projectName, isActive, isArchived, _id: projectId } = projectData;
  const [displayName, setDisplayName] = useState(projectName);
  const initialModalData = {
    showModal: false,
    modalMessage: "",
    modalTitle: "",
    hasConfirmBtn: false,
    hasInactiveBtn: false,
  };
  const [category, setCategory] = useState(props.category || 'Unspecified'); // Initialize with props or default

  const [modalData, setModalData] = useState(initialModalData);

  const onCloseModal = () => {
    setModalData(initialModalData);
    if(props.clearError) props.clearError();
  };

  const canPutProject = props.hasPermission('putProject');
  const canDeleteProject = props.hasPermission('deleteProject');

  const canSeeProjectManagementFullFunctionality = props.hasPermission('seeProjectManagement');
  const canEditCategoryAndStatus = props.hasPermission('editProject');

  const persistProjectUpdate = async (field, value) => {
    if (!projectData) return;

    const previousProject = projectData;
    const updatedProject = {
      ...projectData,
      [field]: value,
    };
    setProjectData(updatedProject);

    try {
      if (props.onUpdateProject) {
        await props.onUpdateProject(updatedProject);
      } else if (props.modifyProject) {
        await props.modifyProject(updatedProject);
      }
    } catch (err) {
      setProjectData(previousProject);

      if (field === 'category') {
        setCategory(previousProject?.category || 'Unspecified');
      }

      if (field === 'projectName') {
        setDisplayName(previousProject?.projectName || '');
      }

      const errorMessage = err?.response?.data?.message || 'An error occurred while updating the project';
      toast.error(errorMessage);
    }
  };

  const onDisplayNameChange = (e) => {
    setDisplayName(e.target.value);
  }

  const onUpdateProjectName = async () => {
    if (displayName.length < 3) {
      toast.error('Project name must be at least 3 characters long');
      setDisplayName(displayName);
    } else if (displayName !== projectName) {
      await persistProjectUpdate('projectName', displayName);
    }
  };

  const onProjectStatusChange = () => {
    // Trigger the modal from Projects component via props
    props.onClickProjectStatusBtn(projectData); // This will open the modal
  };

  const onUpdateProjectCategory = (e) => {
    const newCategory = e.target.value;
    setCategory(newCategory);
    persistProjectUpdate('category', newCategory);
  };

  const onArchiveProject = () => {
    if(isArchived){
      setModalData({
        showModal: true,
        modalMessage: `<p>Do you want to unarchive this ${projectData.projectName}?</p>`,
        modalTitle: CONFIRM_UNARCHIVE,
        hasConfirmBtn: true,
        hasInactiveBtn: isActive,
      });
    } else {
      setModalData({
        showModal: true,
        modalMessage: `<p>Do you want to archive ${projectData.projectName}?</p>`,
        modalTitle: CONFIRM_ARCHIVE,
        hasConfirmBtn: true,
        hasInactiveBtn: isActive,
      });
    }
  }

  const setProjectInactive = () => {
    updateProject('isActive', !isActive);
    onCloseModal();
  }
  // const confirmArchive = () => {
  //   updateProject('isArchived', !isArchived);
  //   props.onProjectArchived(projectData);
  //   onCloseModal();
  // };
  const confirmArchive = async () => {
  // build the new project object we want on the server
    const updatedProject = { ...projectData, isArchived: !projectData.isArchived };

    // If parent provided an onProjectArchived handler, call it (parent will modify + refresh)
    if (typeof props.onProjectArchived === 'function') {
      try {
        await props.onProjectArchived(updatedProject);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error archiving/unarchiving project:', err);
      }
    } else if (typeof props.modifyProject === 'function') {
      // fallback: if parent didn't pass handler, call modifyProject directly
      try {
        await props.modifyProject(updatedProject);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Fallback modifyProject error:', err);
      }
    }

    onCloseModal();
  };

  useEffect(() => {
    setProjectData(props.projectData);
    setDisplayName(props.projectData?.projectName || '');
    setCategory(props.projectData?.category || props.category || 'Unspecified');
    if (props.projectData.category) {
      setCategory(props.projectData.category);
    }
  }, [props.projectData, props.category]);

  return (
      <>
        <tr className="projects__tr" id={'tr_' + props.projectId}>

          <th className="projects__order--input" scope="row">
            <div className={darkMode ? 'text-light' : ''}>{index + 1}</div>
          </th>


          <td data-testid="projects__name--input" className="projects__name--input">
            {(canPutProject || canSeeProjectManagementFullFunctionality) ? (


              <input
                type="text"
                className={`form-control ${darkMode ? 'bg-yinmn-blue border-0 text-light' : ''}`}
                value={displayName}
                onChange={onDisplayNameChange}
                onBlur={onUpdateProjectName}
              />
            ) : (
              projectName
            )}
          </td>
          <td className="projects__category--input">

            {canEditCategoryAndStatus || canPutProject ? (

              <select

                data-testid="projects__category--input" //added for unit test
                value={category}
                onChange={e => {
                  onUpdateProjectCategory(e);
                }}
                className={darkMode ? 'bg-darkmode-liblack border-0 text-light' : ''}
              >
                <option value="Unspecified">Unspecified</option>
                <option value="Food">Food</option>
                <option value="Energy">Energy</option>
                <option value="Housing">Housing</option>
                <option value="Education">Education</option>
                <option value="Society">Society</option>
                <option value="Economics">Economics</option>
                <option value="Stewardship">Stewardship</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              category
            )}
          </td>
          {/* <td className="projects__active--input" data-testid="project-active" onClick={canPutProject ? updateActive : null}>
          {props.active ? ( */}
          <td className="projects__active--input" data-testid="project-active" onClick={canEditCategoryAndStatus || canPutProject ? onProjectStatusChange : null}>
            {isActive ? (
              <div className="isActive">
                <i className="fa fa-circle" aria-hidden="true"></i>
              </div>
            ) : (
              <div className="isNotActive">
                <i className="fa fa-circle" aria-hidden="true" color='#dee2e6'></i>
              </div>
            )}
          </td>
          <td>
            <NavItem tag={Link} to={`/inventory/${projectId}`}>
              <button type="button" className="btn btn-outline-info" style={darkMode ? {} : boxStyle}>
                {' '}
                <i className="fa fa-archive" aria-hidden="true"></i>
              </button>
            </NavItem>
          </td>
          <td>
            <NavItem tag={Link} to={`/project/members/${projectId}`}>
              <button type="button" className="btn btn-outline-info" style={darkMode ? {} : boxStyle}>
                {' '}
                <i className="fa fa-users" aria-hidden="true"></i>
              </button>
            </NavItem>
          </td>

          <td>
            <NavItem tag={Link} to={`/project/wbs/${projectId}`}>
              <button type="button" className="btn btn-outline-info" style={darkMode ? {} : boxStyle}>
                <i className="fa fa-tasks" aria-hidden="true"></i>
              </button>
            </NavItem>
          </td>


          {(canDeleteProject) ? (

            //         <td>
            //           <button
            //             data-testid="delete-button"
            //             type="button"
            //             className="btn btn-outline-danger"
            //             onClick={onArchiveProject}
            //             style={darkMode ? {} : boxStyle}
            //             disabled={isArchived}
            //           >
            //             {ARCHIVE}
            //           </button>
            //         </td>
            //       ) : null}
            //     </tr>
            // </>
            <td>
              <button
                data-testid="delete-button"
                type="button"
                className="btn btn-outline-danger"
                style={darkMode ? {borderColor: '#D2042D'} : boxStyle}
                onClick={onArchiveProject}>
                {/* {ARCHIVE} */}
                {isArchived ? "UNARCHIVE":"Archive"}
              </button>
            </td>
          ) : null}
        </tr>
        <ModalTemplate
          isOpen={modalData.showModal}
          closeModal={onCloseModal}
          confirmModal={modalData.hasConfirmBtn ? confirmArchive : null}
          setInactiveModal={modalData.hasInactiveBtn ? setProjectInactive : null}
          modalMessage={modalData.modalMessage}
          modalTitle={modalData.modalTitle}
        />
      </>
  );
};

// PropTypes validation
Project.propTypes = {
  darkMode: PropTypes.bool,
  index: PropTypes.number.isRequired,
  projectData: PropTypes.shape({
    projectName: PropTypes.string,
    isActive: PropTypes.bool,
    isArchived: PropTypes.bool,
    _id: PropTypes.string,
    category: PropTypes.string,
  }),
  category: PropTypes.string,
  onUpdateProject: PropTypes.func,
  modifyProject: PropTypes.func,
  hasPermission: PropTypes.func.isRequired,
  onClickProjectStatusBtn: PropTypes.func,
  onClickArchiveBtn: PropTypes.func,
  projectId: PropTypes.string,
};

// Default props
Project.defaultProps = {
  darkMode: false,
  projectData: null,
  category: 'Unspecified',
  onUpdateProject: null,
  modifyProject: null,
  onClickProjectStatusBtn: () => {},
  onClickArchiveBtn: () => {},
  projectId: '',
};

const mapStateToProps = state => state;
export default connect(mapStateToProps, { hasPermission, modifyProject, clearError })(Project);
