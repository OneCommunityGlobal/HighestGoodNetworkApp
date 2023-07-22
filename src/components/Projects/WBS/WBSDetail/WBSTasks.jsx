/*********************************************************************************
 * Component: TASK
 * Author: Henry Ng - 21/03/20 ≢
 ********************************************************************************/
import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { NavItem, Button } from 'reactstrap';
import ReactTooltip from 'react-tooltip';
import hasPermission from 'utils/permissions';
import {
  fetchAllTasks,
  emptyTaskItems,
  updateNumList,
  deleteTask,
} from '../../../../actions/task';
import { fetchAllMembers } from '../../../../actions/projectMembers.js';
import Task from './Task';
import AddTaskModal from './AddTask/AddTaskModal';
import ImportTask from './ImportTask';
import './wbs.css';
import { boxStyle } from 'styles';

function WBSTasks(props) {
  /*
<<<<<<< HEAD
  * -------------------------------- variable declarations --------------------------------
  */
  // props from store
  const { tasks, fetched } = props;

=======
  * -------------------------------- variable declarations -------------------------------- 
  */
  // props from store
  const { role, roles, userPermissions, tasks, fetched } = props;
  
>>>>>>> 3645e303 (overhaul task system logic, improve task import, move, copy, delete and add functionality)
  const { wbsId } = props.match.params;
  const { projectId } = props.match.params;
  const { wbsName } = props.match.params;

  // states from hooks
  const [showImport, setShowImport] = useState(false);
  const [filterState, setFilterState] = useState('all');
  const [openAll, setOpenAll] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleted, setIsDeleted] = useState(false);
  const [levelOneTasks, setLevelOneTasks] = useState([]);
  const [controllerId, setControllerId] = useState(null);
  const [pageLoadTime, setPageLoadTime] = useState(Date.now());
  const myRef = useRef(null);

<<<<<<< HEAD
  // permissions
  const canPostTask = props.hasPermission('postTask');

  /*
  * -------------------------------- functions --------------------------------
=======
  /*
  * -------------------------------- functions -------------------------------- 
>>>>>>> 3645e303 (overhaul task system logic, improve task import, move, copy, delete and add functionality)
  */
  const load = async () => {
    const levelList = [0, 1, 2, 3, 4];
    await Promise.all(levelList.map(level => props.fetchAllTasks(wbsId, level)));
    setPageLoadTime(Date.now());
  };

  const filterTasks = (tasks, filterState) => {
    switch (filterState) {
      case 'all': return tasks
      case 'assigned': return tasks.filter(task => task.isAssigned === true)
      case 'unassigned': return tasks.filter(task => task.isAssigned === false)
      case 'active': return tasks.filter(task => ['Active', 'Started'].includes(task.status))
      case 'inactive': return tasks.filter(task => task.status === 'Not Started')
      case 'complete': return tasks.filter(task => task.status === 'Complete')
    }
  }

  
  const refresh = async () => {
    setIsLoading(true);
    props.emptyTaskItems();
    await load();
    setOpenAll(false)
    setIsLoading(false)
  };
  
  const deleteWBSTask = (taskId, mother) => {
    props.deleteTask(taskId, mother);
    setIsDeleted(true);
  };

  /**
   * Drag and drop is not being used anywhere, and it seems to be replaced by the copy and paste functionality,
   * so here comments it out for future reference if such functionality is desired again.  
   */

  // let drag = '';
  // let dragParent = '';
  // const dragTask = (taskIdFrom, parentId) => {
  //   drag = taskIdFrom;
  //   dragParent = parentId;
  // };
  
  // const dropTask = (taskIdTo, parentId) => {
  //   const tasksClass = document.getElementsByClassName('taskDrop');
  //   for (let i = 0; i < tasks.length; i++) {
  //     tasksClass[i].style.display = 'none';
  //   }
    
  //   const list = [];
  //   const target = tasks.find(task => task._id === taskIdTo);
  //   const siblings = tasks.filter(task => task.parentId === dragParent);
    
  //   let modifiedList = false;
  //   if (dragParent === target._id) {
  //     list.push({
  //       id: drag,
  //       num: siblings[0].num,
  //     });
  //     modifiedList = true;
  //   }
  //   for (let i = 0; i < siblings.length - 1; i++) {
  //     if (siblings[i]._id === drag) {
  //       modifiedList = false;
  //     }
  //     if (modifiedList) {
  //       list.push({
  //         id: siblings[i]._id,
  //         num: siblings[i + 1].num,
  //       });
  //     }
  //     if (siblings[i]._id === target._id) {
  //       list.push({
  //         id: drag,
  //         num: siblings[i + 1].num,
  //       });
  //       modifiedList = true;
  //     }
  //   }
  // };

  /*
  * -------------------------------- useEffects -------------------------------- 
  */
  useEffect(() => {
    const observer = new MutationObserver(ReactTooltip.rebuild);
    const observerOptions = {
      childList: true,
      subtree: true,
    }
    observer.observe(myRef.current, observerOptions); // only rebuild ReactTooltip when DOM tree changes
    return () => {
      observer.disconnect();
      props.emptyTaskItems();
    };
  }, []);
  
  useEffect(() => {
    load();
    props.fetchAllMembers(projectId);
    setShowImport(tasks.length === 0);
    setIsLoading(false);
  }, [wbsId, projectId]);
  
  useEffect(() => {
    const newLevelOneTasks = tasks.filter(task => task.level === 1);
    const filteredTasks = filterTasks(newLevelOneTasks, filterState);
    setShowImport(tasks.length === 0);
    setLevelOneTasks(filteredTasks);
  }, [tasks, filterState])
  
  useEffect(() => {
    if (isDeleted) {
      refresh();
    }
    setIsDeleted(false);
  }, [isDeleted]);

  return (
    <>
<<<<<<< HEAD
      <ReactTooltip delayShow={300} />
=======
      <ReactTooltip delayShow={300} html={true}/>
>>>>>>> 3645e303 (overhaul task system logic, improve task import, move, copy, delete and add functionality)
      <div className="container-tasks">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <NavItem tag={Link} to={`/project/wbs/${projectId}`}>
              <button type="button" className="btn btn-secondary" style={boxStyle}>
                <i className="fa fa-chevron-circle-left" aria-hidden="true" />
              </button>
            </NavItem>
            <div id="member_project__name">{wbsName}</div>
          </ol>
        </nav>
        <div className='mb-2'>
<<<<<<< HEAD
          {canPostTask ? (
=======
          {hasPermission(role, 'addTask', roles, userPermissions) ? (
>>>>>>> 3645e303 (overhaul task system logic, improve task import, move, copy, delete and add functionality)
            <AddTaskModal
              key="task_modal_null"
              taskNum={null}
              taskId={null}
              wbsId={wbsId}
              projectId={projectId}
              load={load}
              pageLoadTime={pageLoadTime}
            />
          ) : null}

          {!isLoading && showImport ? (
<<<<<<< HEAD
            <ImportTask
              wbsId={wbsId}
              projectId={projectId}
=======
            <ImportTask 
              wbsId={wbsId} 
              projectId={projectId} 
>>>>>>> 3645e303 (overhaul task system logic, improve task import, move, copy, delete and add functionality)
              load={load}
              setIsLoading={setIsLoading}
            />
          ) : null}
          <Button
            color="success"
            className="ml-2"
            size="sm"
            onClick={refresh}
            style={boxStyle}
          >
            Refresh{' '}
          </Button>
          {isLoading ? (
            <Button color="warning" size="sm" className="ml-3" style={boxStyle}>
              {' '}
              Task Loading......{' '}
            </Button>
          ) : null}

          <div className="toggle-all">
            <Button
              color="light"
              size="sm"
              className="ml-2 mr-4"
              onClick={() => setOpenAll(!openAll)}
              style={boxStyle}
            >
              {openAll ? 'fold All' : 'Unfold All'}
            </Button>
            <Button
              color="primary"
              size="sm"
              className="ml-3"
              onClick={() => setFilterState('all')}
              style={boxStyle}
            >
              All
            </Button>
            <Button
              color="secondary"
              size="sm"
              onClick={() => setFilterState('assigned')}
              className="ml-2"
              style={boxStyle}
            >
              Assigned
            </Button>
            <Button
              color="success"
              size="sm"
              onClick={() => setFilterState('unassigned')}
              className="ml-2"
              style={boxStyle}
            >
              Unassigned
            </Button>
            <Button
              color="info"
              size="sm"
              onClick={() => setFilterState('active')}
              className="ml-2"
              style={boxStyle}
            >
              Active
            </Button>
            <Button
              color="warning"
              size="sm"
              onClick={() => setFilterState('inactive')}
              className="ml-2"
              style={boxStyle}
            >
              Inactive
            </Button>
            <Button
              color="danger"
              size="sm"
              onClick={() => setFilterState('complete')}
              className="ml-2"
              style={boxStyle}
            >
              Complete
            </Button>
          </div>
        </div>

        <table className="table table-bordered tasks-table" ref={myRef}>
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
            {/* <tr className="taskDrop">   // Drag and drop functionality is deserted for now
              <td colSpan={14} />
            </tr> */}
            {fetched && levelOneTasks.map((task, i) => (
              <Task
                key={`${task._id}${i}`}
                taskId={task._id}
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
                parentId1={task.parentId1}
                parentId2={task.parentId2}
                parentId3={task.parentId3}
                mother={task.mother}
                openAll={openAll}
                deleteWBSTask={deleteWBSTask}
                hasChildren={task.hasChildren}
                siblings={levelOneTasks}
                whyInfo={task.whyInfo}
                intentInfo={task.intentInfo}
                endstateInfo={task.endstateInfo}
                childrenQty={task.childrenQty}
                filterTasks={filterTasks}
                filterState={filterState}
                controllerId={controllerId}
                setControllerId={setControllerId}
                load={load}
                pageLoadTime={pageLoadTime}
                setIsLoading={setIsLoading}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

<<<<<<< HEAD
const mapStateToProps = state => ({
=======
const mapStateToProps = state => ({ 
  role: state.auth ? state.auth.user.role : null,
  roles: state.role.roles,
  userPermissions: state.auth.user?.permissions?.frontPermissions,
>>>>>>> 3645e303 (overhaul task system logic, improve task import, move, copy, delete and add functionality)
  tasks: state.tasks.taskItems,
  fetched: state.tasks.fetched,
});

export default connect(mapStateToProps, {
  fetchAllTasks,
  emptyTaskItems,
  updateNumList,
  deleteTask,
  fetchAllMembers,
  hasPermission,
})(WBSTasks);
