/*********************************************************************************
 * Component: TASK
 * Author: Henry Ng - 21/03/20 ≢
 ********************************************************************************/
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { NavItem, Button } from 'reactstrap';
import ReactTooltip from 'react-tooltip';
import hasPermission from 'utils/permissions';
import { fetchAllTasks, emptyAllTaskItems, updateNumList, deleteTask } from '../../../../actions/task';
import { fetchAllMembers } from '../../../../actions/projectMembers.js';
import Task from './Task';
import AddTaskModal from './AddTask/AddTaskModal';
import ImportTask from './ImportTask';
import './wbs.css';

function WBSTasks(props) {
  // modal
  const [modal, setModal] = useState(false);
  const toggle = () => setModal(!modal);
  const { roles } = props.state.role;

  const { wbsId } = props.match.params;
  const { projectId } = props.match.params;
  const { wbsName } = props.match.params;
  const userPermissions = props.state.auth.user?.permissions?.frontPermissions;

  const [isShowImport, setIsShowImport] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [filterState, setFilterState] = useState('all');
  const [openAll, setOpenAll] = useState(false);
  const [loadAll, setLoadAll] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const load = async () => {
    const levelList = [0, 1, 2, 3, 4];
    await Promise.all(levelList.map(level => props.fetchAllTasks(wbsId, level)));
    AutoOpenAll(false);
    setLoadAll(true);
  };

  useEffect(() => {
    return () => {
      props.emptyAllTaskItems();
    };
  }, [])

  useEffect(() => {
    load().then(setOpenAll(false));
    props.fetchAllMembers(projectId);
    setTimeout(() => setIsShowImport(true), 1000);
  }, [wbsId, projectId]);

  const refresh = () => {
    setLoadAll(false);
    setIsShowImport(false);
    props.fetchAllTasks(wbsId, -1);
    setTimeout(() => {
      load().then(setOpenAll(false));
    }, 100);
    setTimeout(() => setIsShowImport(true), 1000);
  };

  useEffect(() => {
    AutoOpenAll(openAll);
  }, [openAll]);

  useEffect(() => {
    if (isDeleted) {
      refresh();
    }
    setIsDeleted(false);
  }, [isDeleted]);

  const AutoOpenAll = openflag => {
    if (openflag) {
      //console.log('open the folder');
      for (let i = 2; i < 5; i++) {
        const subItems = [...document.getElementsByClassName(`lv_${i}`)];
        for (let i = 0; i < subItems.length; i++) {
          subItems[i].style.display = 'table-row';
        }
      }
    } else {
      //console.log('close the folder');
      for (let i = 2; i < 5; i++) {
        const subItems = [...document.getElementsByClassName(`lv_${i}`)];
        for (let i = 0; i < subItems.length; i++) {
          subItems[i].style.display = 'none';
        }
      }
    }
  };

  const selectTaskFunc = id => {
    setSelectedId(id);
  };

  let drag = '';
  let dragParent = '';
  const dragTask = (taskIdFrom, parentId) => {
    drag = taskIdFrom;
    dragParent = parentId;
  };

  const dropTask = (taskIdTo, parentId) => {
    const tasks = props.state.tasks.taskItems;

    const tasksClass = document.getElementsByClassName('taskDrop');
    for (let i = 0; i < tasks.length; i++) {
      tasksClass[i].style.display = 'none';
    }

    const list = [];
    const target = tasks.find(task => task._id === taskIdTo);
    const siblings = tasks.filter(task => task.parentId === dragParent);

    let modifiedList = false;
    if (dragParent === target._id) {
      list.push({
        id: drag,
        num: siblings[0].num,
      });
      modifiedList = true;
    }
    for (let i = 0; i < siblings.length - 1; i++) {
      if (siblings[i]._id === drag) {
        modifiedList = false;
      }
      if (modifiedList) {
        list.push({
          id: siblings[i]._id,
          num: siblings[i + 1].num,
        });
      }
      if (siblings[i]._id === target._id) {
        list.push({
          id: drag,
          num: siblings[i + 1].num,
        });
        modifiedList = true;
      }
    }
  };

  const deleteWBSTask = (taskId, mother) => {
    props.deleteTask(taskId, mother);
    setIsDeleted(true);
  };

  const filterTasks = (allTaskItems, filter) => {
    if (filter === 'all') {
      return allTaskItems;
    } else if (filter === 'assigned') {
      return allTaskItems.filter(taskItem => {
        if (taskItem.isAssigned === true) {
          return taskItem;
        }
      });
    } else if (filter === 'unassigned') {
      return allTaskItems.filter(taskItem => {
        if (taskItem.isAssigned === false) {
          return taskItem;
        }
      });
    } else if (filter === 'active') {
      return allTaskItems.filter(taskItem => {
        if (taskItem.status === 'Active' || taskItem.status === 'Started') {
          return taskItem;
        }
      });
    } else if (filter === 'inactive') {
      return allTaskItems.filter(taskItem => {
        if (taskItem.status === 'Not Started') {
          return taskItem;
        }
      });
    } else if (filter === 'complete') {
      return allTaskItems.filter(taskItem => {
        if (taskItem.status === 'Complete') {
          return taskItem;
        }
      });
    }
  };

  const LoadTasks = props.state.tasks.taskItems.slice(0).sort((a, b) => {
    var former = a.num.split('.');
    var latter = b.num.split('.');
    for (var i = 0; i < 4; i++) {
      var _former = +former[i] || 0;
      var _latter = +latter[i] || 0;
      if (_former === _latter) continue;
      else return _former > _latter ? 1 : -1;
    }
    return 0;
  });
  const filteredTasks = filterTasks(LoadTasks, filterState);

  return (
    <>
      <ReactTooltip />
      <div className="container-tasks">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <NavItem tag={Link} to={`/project/wbs/${projectId}`}>
              <button type="button" className="btn btn-secondary">
                <i className="fa fa-chevron-circle-left" aria-hidden="true" />
              </button>
            </NavItem>
            <div id="member_project__name">{wbsName}</div>
          </ol>
        </nav>

        {hasPermission(props.state.auth.user.role, 'addTask', roles, userPermissions) ? (
          <AddTaskModal
            key="task_modal_null"
            parentNum={null}
            taskId={null}
            wbsId={wbsId}
            projectId={projectId}
          />
        ) : null}

        {props.state.tasks.taskItems.length === 0 && isShowImport === true ? (
          <ImportTask wbsId={wbsId} projectId={projectId} />
        ) : null}
        <Button
          color="primary"
          className="btn-success"
          size="sm"
          onClick={() => {
            refresh();
          }}
        >
          Refresh{' '}
        </Button>

        {loadAll === false ? (

          <Button color="warning" size="sm" className="ml-3">

            {' '}
            Task Loading......{' '}
          </Button>
        ) : null}

        <div className="toggle-all">
          <Button
            color="primary"
            size="sm"
            className="ml-3"
            onClick={() => {
              setFilterState('all');
              setOpenAll(!openAll);
            }}
          >
            All
          </Button>
          <Button
            color="secondary"
            size="sm"
            onClick={() => setFilterState('assigned')}
            className="ml-2"
          >
            Assigned
          </Button>
          <Button
            color="success"
            size="sm"
            onClick={() => setFilterState('unassigned')}
            className="ml-2"
          >
            Unassigned
          </Button>
          <Button
            color="info"
            size="sm"
            onClick={() => setFilterState('active')}
            className="ml-2"
          >
            Active
          </Button>
          <Button
            color="warning"
            size="sm"
            onClick={() => setFilterState('inactive')}
            className="ml-2"
          >
            Inactive
          </Button>
          <Button
            color="danger"
            size="sm"
            onClick={() => setFilterState('complete')}
            className="ml-2"
          >
            Complete
          </Button>
        </div>

        <table className="table table-bordered tasks-table">
          <thead>
            <tr>
              <th scope="col" data-tip="Action" colSpan="2">
                Action
              </th>
              <th scope="col" data-tip="WBS ID" colSpan="1">
                #
              </th>
              <th scope="col" data-tip="Task Name" className="task-name">
                Task
              </th>
              <th scope="col" data-tip="Priority">
                <i className="fa fa-star" aria-hidden="true" />
              </th>
              <th className="desktop-view" scope="col" data-tip="Resources">
                <i className="fa fa-users" aria-hidden="true" />
              </th>
              <th scope="col" data-tip="Assigned">
                <i className="fa fa-user-circle-o" aria-hidden="true" />
              </th>
              <th className="desktop-view" scope="col" data-tip="Status">
                <i className="fa fa-tasks" aria-hidden="true" />
              </th>
              <th className="desktop-view" scope="col" data-tip="Hours-Best">
                <i className="fa fa-hourglass-start" aria-hidden="true" />
              </th>
              <th className="desktop-view" scope="col" data-tip="Hours-Worst">
                <i className="fa fa-hourglass" aria-hidden="true" />
              </th>
              <th className="desktop-view" scope="col" data-tip="Hours-Most">
                <i className="fa fa-hourglass-half" aria-hidden="true" />
              </th>
              <th className="desktop-view" scope="col" data-tip="Estimated Hours">
                <i className="fa fa-clock-o" aria-hidden="true" />
              </th>
              <th className="desktop-view" scope="col" data-tip="Start Date">
                <i className="fa fa-calendar-check-o" aria-hidden="true" /> Start
              </th>
              <th className="desktop-view" scope="col" data-tip="Due Date">
                <i className="fa fa-calendar-times-o" aria-hidden="true" /> End
              </th>
              <th className="desktop-view" scope="col" data-tip="Links">
                <i className="fa fa-link" aria-hidden="true" />
              </th>
              <th className="desktop-view" scope="col" data-tip="Details">
                <i className="fa fa-question" aria-hidden="true" />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="taskDrop">
              <td colSpan={14} />
            </tr>

            {props.state.tasks.fetched && filteredTasks.map((task, i) => (
              <Task
                key={`${task._id}${i}`}
                id={task._id}
                level={task.level}
                num={task.num}
                name={task.taskName}
                priority={task.priority}
                resources={task.resources}
                isAssigned={task.isAssigned}
                status={task.status}
                hoursBest={task.hoursBest}
                hoursMost={task.hoursMost}
                hoursWorst={task.hoursWorst}
                estimatedHours={task.estimatedHours}
                startedDatetime={task.startedDatetime}
                dueDatetime={task.dueDatetime}
                links={task.links}
                projectId={projectId}
                wbsId={wbsId}
                selectTask={selectTaskFunc}
                isNew={!!task.new}
                parentId1={task.parentId1}
                parentId2={task.parentId2}
                parentId3={task.parentId3}
                mother={task.mother}
                isOpen={openAll}
                drop={dropTask}
                drag={dragTask}
                deleteWBSTask={deleteWBSTask}
                hasChildren={task.hasChild}
                siblings={props.state.tasks.taskItems.filter(item => item.mother === task.mother)}
                taskId={task.taskId}
                whyInfo={task.whyInfo}
                intentInfo={task.intentInfo}
                endstateInfo={task.endstateInfo}
                childrenQty={task.childrenQty}
                filteredTasks={filteredTasks}

              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

const mapStateToProps = state => ({ state });

export default connect(mapStateToProps, {
  fetchAllTasks,
  emptyAllTaskItems,
  updateNumList,
  deleteTask,
  fetchAllMembers,
})(WBSTasks);
