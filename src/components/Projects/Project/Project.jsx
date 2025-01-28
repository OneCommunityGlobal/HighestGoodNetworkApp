import { useState, useEffect } from 'react';
import { ARCHIVE } from './../../../languages/en/ui';
import './../projects.css';
import { Link } from 'react-router-dom';
import { NavItem } from 'reactstrap';
import { connect } from 'react-redux';
import hasPermission from 'utils/permissions';
import { boxStyle } from 'styles';
import { toast } from 'react-toastify';  
import { modifyProject, clearError } from '../../../actions/projects';
import ModalTemplate from './../../common/Modal';
import { CONFIRM_ARCHIVE } from './../../../languages/en/messages';

const Project = props => {
  const { darkMode, index } = props;
  const [firstLoad, setFirstLoad] = useState(true);
  const [projectData, setProjectData] = useState(props.projectData);
  const { projectName, isActive,isArchived, _id: projectId } = projectData;
  const [displayName, setDisplayName] = useState(projectName);
  const initialModalData = {
    showModal: false,
    modalMessage: "",
    modalTitle: "",
    hasConfirmBtn: false,
    hasInactiveBtn: false,
  };

  const [modalData, setModalData] = useState(initialModalData);

  const onCloseModal = () => {
    setModalData(initialModalData);
    props.clearError();
  };  const [category, setCategory] = useState(props.category || 'Unspecified'); // Initialize with props or default

  const canPutProject = props.hasPermission('putProject');
  const canDeleteProject = props.hasPermission('deleteProject');

  const canSeeProjectManagementFullFunctionality = props.hasPermission('seeProjectManagement');
  const canEditCategoryAndStatus = props.hasPermission('editProject');

   const updateProject = ({ updatedProject, status }) => async dispatch => {
    try {
      dispatch(updateProject({ updatedProject, status }));
    } catch (err) {
      const status = err?.response?.status || 500;
      const error = err?.response?.data || { message: 'An error occurred' };
      dispatch(updateProject({ status, error }));
    }
  };

  const onDisplayNameChange = (e) => {
    setDisplayName(e.target.value);
  }

  const onUpdateProjectName = () => {
    if (displayName.length < 3) {
      toast.error('Project name must be at least 3 characters long');
      setDisplayName(displayName);
    } else if (displayName !== projectName) {
      updateProject('projectName', displayName);
    } 
  };

  const onUpdateProjectActive = () => {
    updateProject('isActive', !isActive);
  }

  const onUpdateProjectCategory = (e) => {
    setCategory(e.target.value);
    updateProject('category', e.target.value); // Update the projectData state
  };

  const onArchiveProject = () => {
    setModalData({
      showModal: true,
      modalMessage: `<p>Do you want to archive ${projectData.projectName}?</p>`,
      modalTitle: CONFIRM_ARCHIVE,
      hasConfirmBtn: true,
      hasInactiveBtn: isActive,
    });
  }
  
  const setProjectInactive = () => {
    updateProject('isActive', !isActive);
    onCloseModal(); 
  }
  const confirmArchive = () => {
    updateProject('isArchived', !isArchived);
    props.onProjectArchived();
    onCloseModal(); 
  };

  useEffect(() => {
    const onUpdateProject = async () => {
      if (firstLoad) {
        setFirstLoad(false);
      } else {
        await props.modifyProject(projectData);
      }
    };

    onUpdateProject();
  }, [projectData]);

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
            onBlur={() => onUpdateProjectName(displayName)}
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
          <td className="projects__active--input" data-testid="project-active" onClick={canEditCategoryAndStatus || canPutProject ? onUpdateProjectActive : null}>
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

        <td>
          <button
            data-testid="delete-button"
            type="button"
            className="btn btn-outline-danger"
            onClick={onArchiveProject}
            style={darkMode ? {} : boxStyle}
            disabled = {isArchived}
          >
            {ARCHIVE}
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
const mapStateToProps = state => state;
export default connect(mapStateToProps, { hasPermission, modifyProject, clearError })(Project);
