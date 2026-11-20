import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Button, Col, UncontrolledTooltip } from 'reactstrap';
import { connect } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import hasPermission from '../../../utils/permissions';
import { permissions } from '../../../utils/constants';
import EditableInfoModal from '~/components/UserProfile/EditableModal/EditableInfoModal';
import appStyles from '~/App.module.css';
import { boxStyle, boxStyleDark } from '~/styles';
import SubmittedTaskLinks from './SubmittedTaskLinks';
import styles from './UserProjectsTable.module.css';

const taskFilters = [
  { value: 'all', label: 'All', color: 'primary' },
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'resolved', label: 'Resolved', color: 'danger' },
];

// eslint-disable-next-line react/display-name
const UserProjectsTable = React.memo(props => {
  const { darkMode, userId, role, edit, disabled } = props;
  const userProjects = Array.isArray(props.userProjectsById) ? props.userProjectsById : [];
  const userTasks = Array.isArray(props.userTasks) ? props.userTasks : [];
  const [taskFilter, setTaskFilter] = useState('active');
  const { pathname } = useLocation();
  const showTasks = pathname !== '/usermanagement';

  const canAssignProjectToUsers = props.hasPermission(permissions.assignProjectToUsers);
  const canUpdateTask = props.hasPermission(permissions.updateTask);
  const canDeleteProjects = props.hasPermission(permissions.deleteProject);
  const canDeleteTasks = props.hasPermission(permissions.deleteTask);
  const canPostTask = props.hasPermission(permissions.postTask);
  const showEditActions = edit && role;
  const buttonStyle = darkMode ? boxStyleDark : boxStyle;
  const headerBackground = darkMode && appStyles['bg-space-cadet'];
  const tableBackground = darkMode && appStyles['bg-yinmn-blue'];

  const sortedTasks = [...userTasks].sort(
    (firstTask, secondTask) => firstTask.num - secondTask.num,
  );
  const filteredTasks = sortedTasks
    .map(task => {
      const resource = task.resources?.find(assignee => assignee.userID === userId);
      return { task, resolved: resource?.completedTask === true };
    })
    .filter(({ resolved }) => taskFilter === 'all' || resolved === (taskFilter === 'resolved'));

  const reopenTask = task => {
    const resources = task.resources.map(resource =>
      resource.userID === userId
        ? { ...resource, completedTask: false, reviewStatus: 'Unsubmitted' }
        : resource,
    );
    props.updateTask(task._id, { resources, status: 'Started' }, 'add');
  };

  const renderProjects = desktop => (
    <div className={clsx(styles.projectTable, tableBackground)}>
      <div className={clsx(desktop && 'container', styles.projectHeaderContainer)}>
        <div className={clsx(desktop && 'row', styles.projectHeaderRow)}>
          <Col
            md="12"
            className={clsx(
              'd-flex',
              styles.sectionHeader,
              headerBackground,
              !desktop && darkMode && 'text-light',
            )}
          >
            <span className={clsx(styles.sectionTitle, 'mr-auto pt-2')}>Projects</span>
            {showEditActions && canAssignProjectToUsers && (
              <div
                className={clsx(desktop ? 'py-2' : 'pt-2', !desktop && styles.assignProject)}
                title={desktop ? undefined : 'Please save changes before assign project'}
              >
                <Button
                  className={styles.assignProjectButton}
                  id={desktop && disabled ? 'btn-assignproject' : undefined}
                  color="primary"
                  disabled={disabled}
                  onClick={props.onButtonClick}
                  style={buttonStyle}
                >
                  Assign Project
                </Button>
              </div>
            )}
          </Col>
        </div>
      </div>
      <div className={clsx(styles.tableContainer, tableBackground)}>
        <table
          className={clsx(
            'table table-bordered',
            desktop && 'table-responsive-sm',
            darkMode && 'text-light',
          )}
        >
          {role && (
            <thead className={clsx(headerBackground)}>
              <tr>
                <th className={styles.tableHeader}>#</th>
                <th>Project Name</th>
                {desktop && canPostTask && (
                  <th style={{ width: '100px' }}>
                    <div className="d-flex align-items-center">
                      <span className="mr-2">WBS</span>
                      <EditableInfoModal
                        areaName="ProjectTableHeaderWBS"
                        areaTitle="WBS"
                        fontSize={24}
                        isPermissionPage
                        role={role}
                        className="p-2"
                        darkMode={darkMode}
                      />
                    </div>
                  </th>
                )}
                {canAssignProjectToUsers && <th className={styles.tableCell} />}
              </tr>
            </thead>
          )}
          <tbody>
            {userProjects.map((project, index) => {
              const projectId = project._id || project.projectId;
              const tooltipId = `wbs-tooltip-${projectId}`;
              return (
                <tr key={projectId} className={clsx(desktop && tableBackground)}>
                  <td>{index + 1}</td>
                  <td className={styles.taskName}>{project.projectName}</td>
                  {desktop && role && canPostTask && (
                    <td className={styles.tableCell}>
                      <Button
                        tag={Link}
                        to={`/project/wbs/${projectId}`}
                        id={tooltipId}
                        color="info"
                        outline
                        aria-label={`Work breakdown structures for ${project.projectName}`}
                        style={darkMode ? undefined : boxStyle}
                      >
                        <i className="fa fa-tasks" aria-hidden="true" />
                      </Button>
                      <UncontrolledTooltip
                        placement="left"
                        target={tooltipId}
                        delay={{ show: 250, hide: 100 }}
                      >
                        Click to access the Work Breakdown Structures (WBSs) for this project
                      </UncontrolledTooltip>
                    </td>
                  )}
                  {showEditActions && canDeleteProjects && (
                    <td className={styles.tableCell}>
                      <Button
                        color="danger"
                        disabled={!canUpdateTask}
                        onClick={() => props.onDeleteClick(projectId)}
                        style={buttonStyle}
                      >
                        Delete
                      </Button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTasks = desktop => (
    <>
      <div className={styles.projectTable}>
        <Col
          md="12"
          className={clsx(
            'd-flex',
            styles.sectionHeader,
            styles.taskHeader,
            headerBackground,
            darkMode && 'text-light',
          )}
        >
          <span className={clsx(styles.sectionTitle, 'mr-auto py-2')}>Tasks</span>
          <div className={styles.taskFilters} role="group" aria-label="Task status">
            {taskFilters.map(({ value, label, color }) => (
              <Button
                key={value}
                type="button"
                color={color}
                size="sm"
                aria-pressed={taskFilter === value}
                onClick={() => setTaskFilter(value)}
                style={buttonStyle}
              >
                {label}
              </Button>
            ))}
          </div>
        </Col>
      </div>
      <div
        className={clsx(styles.tableContainer, tableBackground, darkMode && styles.darkMode)}
        data-testid={desktop ? 'userProjectTaskTest' : undefined}
      >
        <table
          className={clsx(
            'table table-bordered',
            desktop && 'table-responsive-sm',
            darkMode && 'text-light',
          )}
        >
          {role && (
            <thead className={clsx(headerBackground)}>
              <tr>
                <th className={styles.tableHeader}>#</th>
                <th>Task Name</th>
                {showEditActions && (canAssignProjectToUsers || canDeleteTasks) && (
                  <th className={styles.tableCell} />
                )}
              </tr>
            </thead>
          )}
          <tbody>
            {userProjects.map(project => {
              const projectId = project._id || project.projectId;
              return filteredTasks
                .filter(({ task }) =>
                  Array.isArray(task.projectId)
                    ? task.projectId.includes(projectId)
                    : task.projectId === projectId,
                )
                .map(({ task, resolved }) => {
                  const taskName = task.taskName && `\u2003 ↳ ${task.taskName}`;
                  return (
                    <tr key={task._id}>
                      <td>{task.num}</td>
                      <td className={styles.taskName}>
                        <div className={styles.taskDetails}>
                          <div className={styles.taskDescription}>
                            <span className={styles.projectName}>{project.projectName}</span>
                            <br />
                            {desktop ? (
                              <a className={styles.taskTitle} href={`/wbs/tasks/${task._id}`}>
                                {taskName}
                              </a>
                            ) : (
                              <span className={styles.taskTitle}>{taskName}</span>
                            )}
                          </div>
                          <span
                            className={clsx(
                              styles.taskStatus,
                              resolved ? styles.resolved : styles.active,
                            )}
                          >
                            {resolved ? 'Resolved' : 'Active'}
                          </span>
                          <SubmittedTaskLinks
                            taskName={task.taskName}
                            links={task.relatedWorkLinks}
                            darkMode={darkMode}
                          />
                        </div>
                      </td>
                      {showEditActions && (resolved || canDeleteTasks) && (
                        <td>
                          <Button
                            color={resolved ? 'success' : 'danger'}
                            style={{ ...buttonStyle, width: '72px' }}
                            disabled={!canAssignProjectToUsers}
                            onClick={() =>
                              resolved
                                ? reopenTask(task)
                                : props.updateTask(task._id, undefined, 'remove')
                            }
                          >
                            {resolved ? 'Add' : 'Delete'}
                          </Button>
                        </td>
                      )}
                    </tr>
                  );
                });
            })}
          </tbody>
        </table>
      </div>
    </>
  );

  return (
    <div>
      <div className={styles.desktop} data-testid="userProjectTest">
        {renderProjects(true)}
        {showTasks && renderTasks(true)}
      </div>
      <div className={styles.tablet} data-testid="userProjectTabletTest">
        {renderProjects(false)}
        {showTasks && renderTasks(false)}
      </div>
    </div>
  );
});

UserProjectsTable.propTypes = {
  userId: PropTypes.string,
  userProjectsById: PropTypes.array,
  userTasks: PropTypes.array,
  role: PropTypes.string,
  edit: PropTypes.bool,
  disabled: PropTypes.bool,
  hasPermission: PropTypes.func,
  onButtonClick: PropTypes.func,
  onDeleteClick: PropTypes.func,
  updateTask: PropTypes.func,
  darkMode: PropTypes.bool,
};

export default connect(null, { hasPermission })(UserProjectsTable);
