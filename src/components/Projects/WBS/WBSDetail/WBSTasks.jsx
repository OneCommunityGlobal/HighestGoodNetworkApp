/*********************************************************************************
 * Component: TASK
 * Author: Henry Ng - 21/03/20 ≢
 ********************************************************************************/
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { fetchAllTasks, updateNumList, deleteTask } from './../../../../actions/task';
import { fetchAllMembers } from './../../../../actions/projectMembers.js';
import Task from './Task/';
import AddTaskModal from './AddTask/AddTaskModal';
import ImportTask from './ImportTask/';
import { Link } from 'react-router-dom';
import { NavItem, Button } from 'reactstrap';
import './wbs.css';
import ReactTooltip from 'react-tooltip';
import { UserRole } from './../../../../utils/enums';

const WBSTasks = (props) => {
  const [role] = useState(props.state ? props.state.auth.user.role : null);
  // modal
  const [modal, setModal] = useState(false);
  const toggle = () => setModal(!modal);

  const wbsId = props.match.params.wbsId;
  const projectId = props.match.params.projectId;
  const wbsName = props.match.params.wbsName;
  const [isShowImport, setIsShowImport] = useState(false);

  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    props.fetchAllTasks(wbsId, 0);
    props.fetchAllMembers(projectId);
    setIsShowImport(true);
  }, [wbsId, projectId]);

  const refresh = () => {
    setIsShowImport(false);
    props.fetchAllTasks(wbsId, -1);
    setTimeout(() => {
      props.fetchAllTasks(wbsId, 0);

      setTimeout(() => setIsShowImport(true), 1000);
    }, 1000);
  };

  const selectTaskFunc = (id) => {
    setSelectedId(id);
  };

  let drag = '';
  let dragParent = '';
  const dragTask = (taskIdFrom, parentId) => {
    drag = taskIdFrom;
    dragParent = parentId;
  };

  const dropTask = (taskIdTo, parentId) => {
    console.log('droppppped');
    console.log('drop', drag, taskIdTo);

    console.log('drop', drag, taskIdTo);
    const tasks = props.state.tasks.taskItems;

    let tasksClass = document.getElementsByClassName('taskDrop');
    for (let i = 0; i < tasks.length; i++) {
      tasksClass[i].style.display = 'none';
    }

    const list = [];
    let target = tasks.find((task) => task._id === taskIdTo);
    let siblings = tasks.filter((task) => task.parentId === dragParent);
    //console.log('sibs', siblings);

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
        //console.log('sib', siblings[i]._id, siblings[i + 1].num);
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

    //console.log(list);
    //props.updateNumList(wbsId, list);*/
  };

  const deleteTask = (taskId) => {
    props.deleteTask(taskId);
    setTimeout(() => {
      props.fetchAllTasks(wbsId);
    }, 4000);
  };

  const toggleGroups = (open) => {
    const items2 = document.getElementsByClassName(`lv_2`);
    const items3 = document.getElementsByClassName(`lv_3`);
    const items4 = document.getElementsByClassName(`lv_4`);
    const allItems = [...items2, ...items3, ...items4];

    for (let i = 0; i < allItems.length; i++) {
      if (!open) {
        allItems[i].style.display = 'none';
      } else {
        allItems[i].style.display = 'table-row';
      }
    }
  };

  return (
    <React.Fragment>
      <ReactTooltip />
      <div className="container-tasks">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <NavItem tag={Link} to={`/project/wbs/${projectId}`}>
              <button type="button" className="btn btn-secondary">
                <i className="fa fa-chevron-circle-left" aria-hidden="true"></i>
              </button>
            </NavItem>

            <div id="member_project__name">{wbsName}</div>
          </ol>
        </nav>

        {props.state.auth.user.role === UserRole.Administrator ? (
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
        <Button color="primary" className="btn-success" size="sm" onClick={() => refresh()}>
          Refresh{' '}
        </Button>

        <div className="toggle-all">
          <Button color="light" size="sm" onClick={() => toggleGroups(true)}>
            Open
          </Button>
          <Button color="dark" size="sm" onClick={() => toggleGroups(false)}>
            Close
          </Button>
        </div>

        <table className="table table-bordered tasks-table">
          <thead>
            <tr>
              <th scope="col" data-tip="Action" colSpan="2">
                Action
              </th>
              <th scope="col" data-tip="WBS ID" colSpan="2">
                #
              </th>
              <th scope="col" data-tip="Task Name" className="task-name">
                Task
              </th>
              <th scope="col" data-tip="Priority">
                <i className="fa fa-star" aria-hidden="true"></i>
              </th>
              <th className="desktop-view" scope="col" data-tip="Resources">
                <i className="fa fa-users" aria-hidden="true"></i>
              </th>
              <th scope="col" data-tip="Assigned">
                <i className="fa fa-user-circle-o" aria-hidden="true"></i>
              </th>
              <th className="desktop-view" scope="col" data-tip="Status">
                <i className="fa fa-tasks" aria-hidden="true"></i>
              </th>
              <th className="desktop-view" scope="col" data-tip="Hours-Best">
                <i className="fa fa-hourglass-start" aria-hidden="true"></i>
              </th>
              <th className="desktop-view" scope="col" data-tip="Hours-Worst">
                <i className="fa fa-hourglass" aria-hidden="true"></i>
              </th>
              <th className="desktop-view" scope="col" data-tip="Hours-Most">
                <i className="fa fa-hourglass-half" aria-hidden="true"></i>
              </th>
              <th className="desktop-view" scope="col" data-tip="Estimated Hours">
                <i className="fa fa-clock-o" aria-hidden="true"></i>
              </th>
              <th className="desktop-view" scope="col" data-tip="Start Date">
                <i className="fa fa-calendar-check-o" aria-hidden="true"></i> Start
              </th>
              <th className="desktop-view" scope="col" data-tip="Due Date">
                <i className="fa fa-calendar-times-o" aria-hidden="true"></i> End
              </th>
              <th className="desktop-view" scope="col" data-tip="Links">
                <i className="fa fa-link" aria-hidden="true"></i>
              </th>
              <th className="desktop-view" scope="col" data-tip="Details">
                <i className="fa fa-question" aria-hidden="true"></i>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="taskDrop">
              <td colSpan={14}></td>
            </tr>

            {props.state.tasks.taskItems.map((task, i) => (
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
                isNew={task.new ? true : false}
                parentId1={task.parentId1}
                parentId2={task.parentId2}
                parentId3={task.parentId3}
                mother={task.mother}
                isOpen={true}
                drop={dropTask}
                drag={dragTask}
                deleteTask={deleteTask}
                hasChildren={task.hasChild}
                siblings={props.state.tasks.taskItems.filter((item) => item.mother === task.mother)}
                taskId={task.taskId}
                whyInfo={task.whyInfo}
                intentInfo={task.intentInfo}
                endstateInfo={task.endstateInfo}
              />
            ))}
          </tbody>
        </table>
      </div>
    </React.Fragment>
  );
};
const mapStateToProps = (state) => {
  return { state };
};
export default connect(mapStateToProps, {
  fetchAllTasks,
  updateNumList,
  deleteTask,
  fetchAllMembers,
})(WBSTasks);
