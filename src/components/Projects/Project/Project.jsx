import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { NavItem } from 'reactstrap';
import { boxStyle } from '~/styles';
import hasPermission from '~/utils/permissions';
import { clearError, modifyProject } from '../../../actions/projects';
import { ARCHIVE } from './../../../languages/en/ui';
import './../projects.css';

const Project = props => {
  const { darkMode, index } = props;
  const [firstLoad, setFirstLoad] = useState(true);
  const [projectData, setProjectData] = useState(props.projectData);
  const { projectName, isActive, isArchived, _id: projectId } = projectData;
  const [displayName, setDisplayName] = useState(projectName);

  const [category, setCategory] = useState(props.category || 'Unspecified'); // Initialize with props or default

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
      updateProject('projectName', displayName); // NOSONAR
    }
  };

  const onProjectStatusChange = () => {
    // Trigger the modal from Projects component via props
    props.onClickProjectStatusBtn(projectData); // This will open the modal
  };

  const onUpdateProjectActive = () => {
    updateProject('isActive', !isActive); // NOSONAR
  }

  const onUpdateProjectCategory = (e) => {
    setCategory(e.target.value);
    updateProject('category', e.target.value); // NOSONAR
  };

  const onArchiveProject = () => {
    props.onClickArchiveBtn(projectData);
  }



  useEffect(() => {
    const onUpdateProject = async () => {
      if (firstLoad) {
        setFirstLoad(false);
      } else {
        await props.modifyProject(projectData);
      }
      if (props.projectData.category) {
        setCategory(props.projectData.category);
      }
    };

    onUpdateProject();
  }, [projectData]);

  return (
      <>
        <tr className="projects__tr" id={`tr_${  props.projectId}`}>

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
                onBlur={() => onUpdateProjectName(displayName)} // NOSONAR
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
                <i className="fa fa-circle" aria-hidden="true" />
              </div>
            ) : (
              <div className="isNotActive">
                <i className="fa fa-circle" aria-hidden="true" color='#dee2e6' />
              </div>
            )}
          </td>
          <td>
            <NavItem tag={Link} to={`/inventory/${projectId}`}>
              <button type="button" className="btn btn-outline-info" style={darkMode ? {} : boxStyle}>
                {' '}
                <i className="fa fa-archive" aria-hidden="true" />
              </button>
            </NavItem>
          </td>
          <td>
            <NavItem tag={Link} to={`/project/members/${projectId}`}>
              <button type="button" className="btn btn-outline-info" style={darkMode ? {} : boxStyle}>
                {' '}
                <i className="fa fa-users" aria-hidden="true" />
              </button>
            </NavItem>
          </td>

          <td>
            <NavItem tag={Link} to={`/project/wbs/${projectId}`}>
              <button type="button" className="btn btn-outline-info" style={darkMode ? {} : boxStyle}>
                <i className="fa fa-tasks" aria-hidden="true" />
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
                {ARCHIVE}
              </button>
            </td>
          ) : null}
        </tr>
      </>
  );
};
const mapStateToProps = state => state;
export default connect(mapStateToProps, { hasPermission, modifyProject, clearError })(Project);
