/*********************************************************************************
 * Component: TAKS 
 * Author: Henry Ng - 21/03/20 ≢
 ********************************************************************************/
import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { fetchAllTasks, updateNumList, deleteTask } from './../../../../actions/task'
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
  let dragParent = '';
  const dragTask = (taskIdFrom, parentId) => {
    console.log('draggg', taskIdFrom);
    drag = taskIdFrom;
    dragParent = parentId;
  }

  const dropTask = (taskIdTo, parentId) => {

    console.log('droppppped');
    console.log('drop', drag, taskIdTo);

    /* console.log('drop', drag, taskIdTo);
    const tasks = props.state.tasks.taskItems;

    let tasksClass = document.getElementsByClassName('taskDrop');
    for (let i = 0; i < tasks.length; i++) {
      tasksClass[i].style.display = 'none';
    }

    const list = [];
    let target = tasks.find(task => task._id === taskIdTo);
    let siblings = tasks.filter(task => task.parentId === dragParent);
    //console.log('sibs', siblings);

    let modifiedList = false;
    if (dragParent === target._id) {
      list.push({
        id: drag,
        num: siblings[0].num
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
    props.updateNumList(wbsId, list);*/

  }


  const deleteTask = (taskId) => {
    props.deleteTask(taskId);
    setTimeout(() => { props.fetchAllTasks(wbsId); }, 4000);
  }




  return (
    <React.Fragment>
      <ReactTooltip />

      <div className='container' >

        <AddTaskModal parentNum={null} taskId={null} wbsId={wbsId} projectId={projectId} />


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
            <tr className='taskDrop' >
              <td colSpan={13}></td>
            </tr>



            {props.state.tasks.taskItems.map((task, i) =>

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
                links={['1', '2']}
                projectId={projectId}
                wbsId={wbsId}
                selectTask={selectTaskFunc}
                isNew={task.new ? true : false}
                parentId1={task.parentId1}
                parentId2={task.parentId2}
                parentId3={task.parentId3}
                mother={task._id}
                isOpen={true}
                drop={dropTask}
                drag={dragTask}
                deleteTask={deleteTask}

              />)}



          </tbody>
        </table>

      </div>


    </React.Fragment>
  )
}
const mapStateToProps = state => { return { state } }
export default connect(mapStateToProps, { fetchAllTasks, updateNumList, deleteTask })(WBSTasks)

