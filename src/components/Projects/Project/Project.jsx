import React, { useState, useEffect } from 'react';
import { DELETE } from './../../../languages/en/ui';
import './../projects.css';
import { Link } from 'react-router-dom';
import { NavItem } from 'reactstrap';
import { connect } from 'react-redux';
import hasPermission from 'utils/permissions';
import { boxStyle } from 'styles';

const Project = props => {
  const {darkMode} = props;

  const [originName] = useState(props.name);
  const [originCategory, setOriginCategory] = useState(props.category);
  const [name, setName] = useState(props.name);
  const [category, setCategory] = useState(props.category);
  const [active, setActive] = useState(props.active);
  const [firstLoad, setFirstLoad] = useState(true);

  const canPutProject = props.hasPermission('putProject');
  const canDeleteProject = props.hasPermission('deleteProject');

  const updateActive = () => {
    props.onClickActive(props.projectId, name, category, active);
    setActive(!active);
  };

  useEffect(() => {
    if (!firstLoad) {
      updateProject();
    }
    setFirstLoad(false);
  }, [category]);

  const updateProject = () => {
    if (name.length < 3) {
      setName(originName);
    } else if (originName !== name || category != originCategory) {
      props.onUpdateProjectName(props.projectId, name, category, active);
      setOriginCategory(category);
    }
  };

  return (
    <tr className={`projects__tr ${darkMode ? 'bg-yinmn-blue text-light' : ''}`} id={'tr_' + props.projectId}>
      <th className="projects__order--input" scope="row">
        <div>{props.index + 1}</div>
      </th>
      <td className="projects__name--input">
        {(canPutProject) ? (
          <input
            type="text"
            className={`form-control ${darkMode ? 'bg-yinmn-blue border-0 text-light' : ''}`}
            value={name}
            onChange={e => setName(e.target.value)}
            onBlur={updateProject}
          />
        ) : (
          name
        )}
      </td>
      <td className="projects__category--input">
        {(canPutProject) ? (
          <select
            value={props.category}
            onChange={e => {
              setCategory(e.target.value);
            }}
            className={darkMode ? 'bg-yinmn-blue border-primary text-light' : ''}
          >
            <option default value="Unspecified">Unspecified</option>
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
      <td className="projects__active--input" onClick={canPutProject ? updateActive : null}>
        {props.active ? (
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
        <NavItem tag={Link} to={`/inventory/${props.projectId}`}>
          <button type="button" className="btn btn-outline-info" style={darkMode ? {} : boxStyle}>
            {' '}
            <i className="fa fa-archive" aria-hidden="true"></i>
          </button>
        </NavItem>
      </td>
      <td>
        <NavItem tag={Link} to={`/project/members/${props.projectId}`}>
          <button type="button" className="btn btn-outline-info" style={darkMode ? {} : boxStyle}>
            {' '}
            <i className="fa fa-users" aria-hidden="true"></i>
          </button>
        </NavItem>
      </td>

      <td>
        <NavItem tag={Link} to={`/project/wbs/${props.projectId}`}>
          <button type="button" className="btn btn-outline-info" style={darkMode ? {} : boxStyle}>
            <i className="fa fa-tasks" aria-hidden="true"></i>
          </button>
        </NavItem>
      </td>

      {(canDeleteProject) ? (
        <td>
          <button
            type="button"
            className="btn btn-outline-danger"
            onClick={e => props.onClickDelete(props.projectId, props.active, props.name, props.category)}
            style={darkMode ? {} : boxStyle}
          >
            {DELETE}
          </button>
        </td>
      ) : null}
    </tr>
  );
};
const mapStateToProps = state => state;
export default connect(mapStateToProps, { hasPermission })(Project);
