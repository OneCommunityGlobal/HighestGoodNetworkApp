/*********************************************************************************
 * Component: TAKS 
 * Author: Henry Ng - 21/03/20 ≢
 ********************************************************************************/
import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { fetchAllTasks, updateNumList } from './../../../../actions/task'
import Task from './Task/'
import AddTaskModal from './AddTask/AddTaskModal'
import './wbs.css';
import ReactTooltip from 'react-tooltip'

const WBSTasks = (props) => {

  // modal
  const [modal, setModal] = useState(false);
  const toggle = () => setModal(!modal);

  const wbsId = props.match.params.wbsId;
  const projectId = props.match.params.projectId;
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    props.fetchAllTasks(wbsId);
    groupItems(props.state.tasks.taskItems);

  }, [wbsId]);

  const selectTaskFunc = (id) => {
    if (selectedId !== null) {
      document.getElementById(selectedId).style.background = 'white';
      document.getElementById(`controller_${selectedId}`).style.display = 'none';
    }
    setSelectedId(id);
  }



  const groupItems = (tasks) => {
    // group sub items 
    tasks.forEach(task => {
      let subTasks = document.getElementsByClassName(`parentId_${task._id}`);
      if (subTasks.length > 0) {
        document.getElementById(`dropdown_${task._id}`).style.visibility = 'visible';
      }
    });
  }

  let drag = '';
  const dragTask = (taskIdFrom) => {
    console.log('draggg', taskIdFrom);
    drag = taskIdFrom;
  }

  const dropTask = (taskIdTo, parentId) => {
    console.log('drop', drag, taskIdTo);
    const tasks = props.state.tasks.taskItems;

    let tasksClass = document.getElementsByClassName('taskDrop');
    for (let i = 0; i < tasks.length; i++) {
      tasksClass[i].style.display = 'none';
    }

    const list = [];
    let target = tasks.find(task => task._id === taskIdTo);
    let siblings = tasks.filter(task => task.parentId === parentId);
    console.log(siblings);

    let modifiedList = false;
    for (let i = 0; i < siblings.length - 1; i++) {
      if (siblings[i]._id === drag) {
        modifiedList = false;
      }
      if (modifiedList) {
        console.log(siblings[i]._id, siblings[i + 1].num);
        list.push({
          id: siblings[i]._id,
          num: siblings[i + 1].num
        });

      }
      if (siblings[i]._id === target._id) {
        list.push({
          id: drag,
          num: siblings[i + 1].num
        });
        modifiedList = true;
      }
    }

    console.log(list);
    props.updateNumList(wbsId, list);


  }





  return (
    <React.Fragment>
      <ReactTooltip />

      <div className='container' >

        <AddTaskModal parentNum={"-1"} taskId={null} wbsId={wbsId} />


        <table className="table table-bordered">
          <thead>
            <tr>
              <th scope="col" data-tip="WBS ID">#</th>
              <th scope="col" data-tip="Task Name">Task</th>
              <th scope="col" data-tip="Priority"><i className="fa fa-star" aria-hidden="true"></i></th>
              <th scope="col" data-tip="Resources"><i className="fa fa-users" aria-hidden="true"></i></th>
              <th scope="col" data-tip="Assigned" ><i className="fa fa-user-circle-o" aria-hidden="true"></i></th>
              <th scope="col" data-tip="Status" ><i className="fa fa-tasks" aria-hidden="true"></i></th>
              <th scope="col" data-tip="Hours-Best"><i className="fa fa-hourglass-start" aria-hidden="true"></i></th>
              <th scope="col" data-tip="Hours-Worst"><i className="fa fa-hourglass" aria-hidden="true"></i></th>
              <th scope="col" data-tip="Hours-Most"><i className="fa fa-hourglass-half" aria-hidden="true"></i></th>
              <th scope="col" data-tip="Estimated Hours"><i className="fa fa-clock-o" aria-hidden="true"></i></th>
              <th scope="col" data-tip="Start Date" ><i className="fa fa-calendar-check-o" aria-hidden="true"></i> Start</th>
              <th scope="col" data-tip="Due Date"><i className="fa fa-calendar-times-o" aria-hidden="true"></i> End</th>
              <th scope="col" data-tip="Links" ><i className="fa fa-link" aria-hidden="true"></i></th>

            </tr>
          </thead>
          <tbody>



            {props.state.tasks.taskItems.map((task, i) =>

              <Task
                key={i}
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
                links={task.links[0]}
                projectId={projectId}
                wbsId={wbsId}
                selectTask={selectTaskFunc}
                isNew={task.new ? true : false}
                parentId={task.parentId}
                isOpen={true}
                drop={dropTask}
                drag={dragTask}

              />)}



          </tbody>
        </table>

      </div>


    </React.Fragment>
  )
}
const mapStateToProps = state => { return { state } }
export default connect(mapStateToProps, { fetchAllTasks, updateNumList })(WBSTasks)

