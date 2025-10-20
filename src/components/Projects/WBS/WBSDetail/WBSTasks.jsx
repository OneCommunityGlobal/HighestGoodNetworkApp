import React, { useState, useEffect, useRef } from 'react';
import { connect, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { NavItem, Button } from 'reactstrap';
import ReactTooltip from 'react-tooltip';
import hasPermission from '~/utils/permissions';
import { boxStyle, boxStyleDark } from '~/styles';
import { getProjectDetail } from '~/actions/project';
import { fetchAllTasks, emptyTaskItems, updateNumList, deleteTask } from '../../../../actions/task';
import { fetchAllMembers } from '../../../../actions/projectMembers.js';
import Task from './Task';
import AddTaskModal from './AddTask/AddTaskModal';
import ImportTask from './ImportTask';
import './wbs.css';

import { useFetchWbsTasks } from './hook';
import { FilterBar } from './FilterBar';

function WBSTasks(props) {
  // const { tasks, fetched, darkMode } = props;
  const { fetched, darkMode } = props;

  const { wbsId } = props.match.params;
  const { projectId } = props.match.params;
  const { wbsName } = props.match.params;
  const projectName = useSelector(state => state.projectById?.projectName || '');

  // states from hooks
  const [filterState, setFilterState] = useState('all');
  const [openAll, setOpenAll] = useState(false);
  // const [isLoading, setIsLoading] = useState(true);
  const [isDeleted, setIsDeleted] = useState(false);
  const [levelOneTasks, setLevelOneTasks] = useState([]);
  const [controllerId, setControllerId] = useState(null);
  const [pageLoadTime, setPageLoadTime] = useState(Date.now());
  const [copiedTask, setCopiedTask] = useState(null);
  const myRef = useRef(null);

  const { tasks, isLoading, error, refresh } = useFetchWbsTasks(wbsId);

  useEffect(() => {
    if(!isLoading){
      setPageLoadTime(Date.now());
    }
  },[tasks, isLoading]);

  useEffect(() => {
    setLevelOneTasks(
      filterTasks(
        tasks.filter(task => task.level === 1),
        filterState,
      ),
    );
  }, [tasks, filterState]);

  // permissions
  const canPostTask = props.hasPermission('postTask');
  const filterTasks = (tasks, filterState) => {
    switch (filterState) {
      case 'all':
        return tasks;
      case 'assigned':
        return tasks.filter(task => task.isAssigned === true);
      case 'unassigned':
        return tasks.filter(task => task.isAssigned === false);
      case 'active':
        return tasks.filter(task => ['Active', 'Started'].includes(task.status));
      case 'inactive':
        return tasks.filter(task => ['Not Started', 'Paused'].includes(task.status));
      case 'complete':
        return tasks.filter(task => task.status === 'Complete');
      case 'paused':
        return tasks.filter(task => task.status === 'Paused');
    }
  };

  

  const deleteWBSTask = (taskId, mother) => {
    props.deleteTask(taskId, mother);
    setIsDeleted(true);
  };

  /*
  * -------------------------------- useEffects -------------------------------- 
  */
  useEffect(() => {
    const observer = new MutationObserver(ReactTooltip.rebuild);
    const observerOptions = {
      childList: true,
      subtree: true,
    };
    observer.observe(myRef.current, observerOptions); // only rebuild ReactTooltip when DOM tree changes
    return () => {
      observer.disconnect();
      props.emptyTaskItems();
    };
  }, []);

  return (
    <div className={darkMode ? 'bg-oxford-blue text-light' : ''} style={{ minHeight: '100%' }}>
      <ReactTooltip delayShow={300} />
      <div className="container-tasks m-0 p-2">
        <nav aria-label="breadcrumb">
          <ol
            className={`breadcrumb ${darkMode ? 'bg-space-cadet' : ''}`}
            style={darkMode ? boxStyleDark : boxStyle}
          >
            <NavItem tag={Link} to={`/project/wbs/${projectId}`}>
              <button
                type="button"
                className="btn btn-secondary mr-2"
                style={darkMode ? boxStyleDark : boxStyle}
              >
                <i className="fa fa-chevron-circle-left" aria-hidden="true" />
              </button>
              <span style={{ marginLeft: '1px' }}>Return to WBS List: {projectName}</span>
            </NavItem>
            <div
              id="member_project__name"
              style={{
                flex: '1',
                textAlign: 'center',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {' '}
              WBS Name: {wbsName}
            </div>
          </ol>
        </nav>
        <div
          className="mb-2 wbs-button-group" // Group the buttons
          style={{}}
        >
          {/* <span> */}
          {canPostTask ? (
            <AddTaskModal
              copiedTask={copiedTask}
              key="task_modal_null"
              taskNum={null}
              taskId={null}
              wbsId={wbsId}
              projectId={projectId}
              // load={load}
              load={refresh}
              pageLoadTime={pageLoadTime}
              darkMode={darkMode}
              tasks={tasks} 
            />
          ) : null}

          {!isLoading ? (
            <ImportTask
              wbsId={wbsId}
              projectId={projectId}
              // load={load}
              load={refresh}
              setIsLoading={() => {}}
              // setIsLoading={setIsLoading}
              darkMode={darkMode}
            />
          ) : null}
          <Button
            color={isLoading ? 'warning' : 'success'}
            size="sm"
            onClick={refresh}
            style={darkMode ? boxStyleDark : boxStyle}
            disabled={isLoading}
          >
            <i className={`fa fa-refresh ${isLoading ? 'fa-spin' : ''}`} /> Refresh
          </Button>
          <Button
            color="light"
            size="sm"
            className="ml-2"
            onClick={() => setOpenAll(!openAll)}
            style={darkMode ? boxStyleDark : boxStyle}
            disabled={isLoading}
          >
            {openAll ? 'Fold All' : 'Unfold All'}
          </Button>
          <FilterBar currentFilter={filterState} onChange={setFilterState} isLoading={isLoading} />
          {/* </span> */}
        </div>

        <table
          className={`table table-bordered tasks-table ${darkMode ? 'text-light' : ''}`}
          ref={myRef}
        >
          <thead>
            <tr className={darkMode ? 'bg-space-cadet' : ''}>
              <th scope="col" className="tasks-detail-header tasks-detail-actions" data-tip="Action" colSpan="2">
                Action
              </th>
              <th scope="col" data-tip="WBS ID" colSpan="1" className='tasks-detail-header'>
                #
              </th>
              <th scope="col" data-tip="Task Name" className="tasks-detail-header tasks-detail-task-name task-name">
                Task
              </th>
              <th scope="col" data-tip="Priority" className='tasks-detail-header'>
                <i className="fa fa-star" aria-hidden="true" />
              </th>
              <th className="tasks-detail-header desktop-view" scope="col" data-tip="Resources">
                <i className="fa fa-users" aria-hidden="true" />
              </th>
              <th scope="col" data-tip="Assigned" className='tasks-detail-header'>
                <i className="fa fa-user-circle-o" aria-hidden="true" />
              </th>
              <th className="tasks-detail-header desktop-view" scope="col" data-tip="Status">
                <i className="fa fa-tasks" aria-hidden="true" />
              </th>
              <th className="tasks-detail-header desktop-view" scope="col" data-tip="Hours-Best">
                <i className="fa fa-hourglass-start" aria-hidden="true" />
              </th>
              <th className="tasks-detail-header desktop-view" scope="col" data-tip="Hours-Worst">
                <i className="fa fa-hourglass" aria-hidden="true" />
              </th>
              <th className="tasks-detail-header desktop-view" scope="col" data-tip="Hours-Most">
                <i className="fa fa-hourglass-half" aria-hidden="true" />
              </th>
              <th className="tasks-detail-header desktop-view" scope="col" data-tip="Estimated Hours">
                <i className="fa fa-clock-o" aria-hidden="true" />
              </th>
              <th className="tasks-detail-header desktop-view" scope="col" data-tip="Start Date">
                <i className="fa fa-calendar-check-o" aria-hidden="true" /> Start
              </th>
              <th className="tasks-detail-header desktop-view" scope="col" data-tip="Due Date">
                <i className="fa fa-calendar-times-o" aria-hidden="true" /> End
              </th>
              <th className="tasks-detail-header desktop-view" scope="col" data-tip="Links">
                <i className="fa fa-link" aria-hidden="true" />
              </th>
              <th className="tasks-detail-header desktop-view" scope="col" data-tip="Details">
                <i className="fa fa-question" aria-hidden="true" />
              </th>
            </tr>
          </thead>
          <tbody>
            {filterTasks(
              tasks.filter(task => task.level === 1),
              filterState,
            ).map((task, i) => (
              <Task
                copyCurrentTask={setCopiedTask}
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
                tasks={tasks}
                load={refresh}
                pageLoadTime={pageLoadTime}
                setIsLoading={() => {}}
                darkMode={darkMode}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  tasks: state.tasks.taskItems,
  fetched: state.tasks.fetched,
  darkMode: state.theme.darkMode,
});

export default connect(mapStateToProps, {
  fetchAllTasks,
  emptyTaskItems,
  updateNumList,
  deleteTask,
  fetchAllMembers,
  hasPermission,
  getProjectDetail,
})(WBSTasks);