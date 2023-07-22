import React, { useState, useEffect } from 'react';
import { DELETE } from './../../../languages/en/ui';
import './../projects.css';
import { Link } from 'react-router-dom';
import { NavItem } from 'reactstrap';
import { connect } from 'react-redux';
import hasPermission from 'utils/permissions';

const Project = props => {
  const [originName] = useState(props.name);
  const [originCategory] = useState(props.category);
  const [name, setName] = useState(props.name);
  const [category, setCategory] = useState(props.category);
  const [active, setActive] = useState(props.active);
  const [firstLoad, setFirstLoad] = useState(true);
  const role = props.auth.user.role;
  const userPermissions = props.auth.user?.permissions?.frontPermissions;
  const { roles } = props.role;

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
    }
  };

  return (
    <tr className="projects__tr" id={'tr_' + props.projectId}>
      <th className="projects__order--input" scope="row">
        <div>{props.index + 1}</div>
      </th>
      <td className="projects__name--input">
        {hasPermission(role, 'editProject', roles, userPermissions) ? (
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={e => setName(e.target.value)}
            onBlur={updateProject}
          />
        ) : (
          name
        )}
      </td>
      <td className="projects__category--input">
        {hasPermission(role, 'editProject', roles, userPermissions) ? (
          <select
            value={props.category}
            onChange={e => {
              setCategory(e.target.value);
            }}
          >
            <option default value="Unspecified">
              {category}
            </option>
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
      <td
        className="projects__active--input"
        onClick={hasPermission(role, 'editProject', roles, userPermissions) ? updateActive : null}
      >
        {props.active ? (
          <div className="isActive">
            <i className="fa fa-circle" aria-hidden="true"></i>
          </div>
        ) : (
          <div className="isNotActive">
            <i className="fa fa-circle-o" aria-hidden="true"></i>
          </div>
        )}
      </td>
      <td>
        <NavItem tag={Link} to={`/inventory/${props.projectId}`}>
          <button type="button" className="btn btn-outline-info">
            {' '}
            <i className="fa fa-archive" aria-hidden="true"></i>
          </button>
        </NavItem>
      </td>
      <td>
        <NavItem tag={Link} to={`/project/members/${props.projectId}`}>
          <button type="button" className="btn btn-outline-info">
            {' '}
            <i className="fa fa-users" aria-hidden="true"></i>
          </button>
        </NavItem>
      </td>

      <td>
        <NavItem tag={Link} to={`/project/wbs/${props.projectId}`}>
          <button type="button" className="btn btn-outline-info">
            <i className="fa fa-tasks" aria-hidden="true"></i>
          </button>
        </NavItem>
      </td>

      {hasPermission(role, 'deleteProject', roles, userPermissions) ? (
        <td>
          <button
            type="button"
            className="btn btn-outline-danger"
            onClick={e => props.onClickDelete(props.projectId, props.active, props.name)}
          >
            {DELETE}
          </button>
        </td>
      ) : null}
    </tr>
  );
};
const mapStateToProps = state => state;
export default connect(mapStateToProps)(Project);
