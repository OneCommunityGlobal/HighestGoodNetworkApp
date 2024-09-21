import { useState, useEffect } from 'react';
import { ARCHIVE } from './../../../languages/en/ui';
import './../projects.css';
import { Link } from 'react-router-dom';
import { NavItem } from 'reactstrap';
import { connect } from 'react-redux';
import hasPermission from 'utils/permissions';
import { boxStyle } from 'styles';
import { toast } from 'react-toastify';  

const Project = props => {
  const { darkMode, index } = props;
  const [firstLoad, setFirstLoad] = useState(true);
  const [projectData, setProjectData] = useState(props.projectData);
  const { projectName, category, isActive, _id: projectId } = projectData;
  const [displayName, setDisplayName] = useState(projectName);

  const canPutProject = props.hasPermission('putProject');
  const canDeleteProject = props.hasPermission('deleteProject');

  const canSeeProjectManagementFullFunctionality = props.hasPermission('seeProjectManagement');
  const canEditCategoryAndStatus = props.hasPermission('editProject');


  const updateProject = (key, value) => {
    setProjectData({
      ...projectData,
      [key]: value,
    });
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
    updateProject('category', e.target.value);
  }

  const onArchiveProject = () => {
    props.onClickArchiveBtn(projectData);
  }
  
  useEffect(() => {
    if (firstLoad) {
      setFirstLoad(false);
    } else {
      props.onUpdateProject(projectData)
    }
  }, [projectData]);

  return (
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
          >
            {ARCHIVE}
          </button>
        </td>
      ) : null}
    </tr>
  );
};
const mapStateToProps = state => state;
export default connect(mapStateToProps, { hasPermission })(Project);
