/*********************************************************************************
 * Component: TAK
 * Author: Henry Ng - 21/03/20
 ********************************************************************************/
import React from 'react'
import { connect } from 'react-redux'
import { Button } from 'reactstrap';
import AddTaskModal from '../AddTask/AddTaskModal';
import EditTaskModal from "../EditTask/EditTaskModal";
import './tagcolor.css';
import './task.css';

const Task = (props) => {
  const startedDate = new Date(props.startedDatetime);
  const dueDate = new Date(props.dueDatetime);
  let isOpen = true;


  let controllerToggle = true;
  const selectTask = (id) => {
    if (controllerToggle) {
      document.getElementById(id).style.background = '#effff2';
      document.getElementById(`controller_${id}`).style.display = 'contents';
      controllerToggle = false;
    } else {
      document.getElementById(id).style.background = 'white';
      document.getElementById(`controller_${id}`).style.display = '';
      controllerToggle = true;
    }

    props.selectTask(id);
  }


  const toggleGroups = (num, id, level) => {
    const allItems = document.getElementsByClassName(`wbsTask`);
    for (let i = 0; i < allItems.length; i++) {
      if (allItems[i].className.indexOf(`num_${num.split('.').join('').replace(/0/g, '')}`) === 0 && allItems[i].id !== id) {
        if (isOpen) {
          allItems[i].style.display = 'none';
        } else {
          if (allItems[i].className.indexOf(`lv_${level + 1}`) !== -1) {
            allItems[i].style.display = 'table-row';
          }
        }
      }
    }
    isOpen = !isOpen;
  }

  const openChild = (num, id) => {
    const allItems = document.getElementsByClassName(`wbsTask`);
    for (let i = 0; i < allItems.length; i++) {
      if (allItems[i].className.indexOf(`num_${num.split('.').join('').replace(/0/g, '')}`) === 0 && allItems[i].id !== id) {
        allItems[i].style.display = 'table-row';
      }
    }
    isOpen = true;
  }

  const swap = (unit = 1) => {
    const numArr = props.num.split('.');
    let numUp = parseInt(numArr[numArr.length - 1]);
    let newNum = '';
    for (let i = 0; i < numArr.length - 1; i++) {
      newNum += numArr[i] + '.';
    }

    numUp += unit;

  }

  const allowDrop = (ev) => {
    ev.preventDefault();
    let id = ev.target.id.split('_')[2];
    let tasks = document.getElementsByClassName('taskDrop');
    for (let i = 0; i < tasks.length; i++) {
      //tasks[i].style.display = 'none';
    }
    //document.getElementById(`taskDrop_${id}`).style.display = 'table-row';
  }

  const drag = (ev, from) => {
    //props.drag(from, props.parentId);
    //document.getElementById(`taskDrop_${from}`).style.display = 'none';
  }

  const drop = (ev, to) => {
    ev.preventDefault();

    //props.drop(to, props.parentId);
  }


  let toggleMoreResourcesStatus = true;
  const toggleMoreResources = (id) => {
    if (toggleMoreResourcesStatus) {
      document.getElementById(id).style.display = 'block';
    } else {
      document.getElementById(id).style.display = 'none';
    }
    toggleMoreResourcesStatus = !toggleMoreResourcesStatus;

  }


  const deleteTask = (taskId) => {
    props.deleteTask(taskId);
  }




  return (
    <React.Fragment>
      <tr key={props.key} className={`num_${props.num.split('.').join('')} wbsTask  ${props.isNew ? 'newTask' : ''} parentId_${props.parentId} lv_${props.level}`} id={props.id}>
        <td className={`tag_color tag_color_${props.num.length > 0 ? props.num.split('.')[0] : props.num} tag_color_lv_${props.level}`}></td>
        <td
          id={`r_${props.num}_${props.id}`}
          onDragOver={e => allowDrop(e)}
          onDrop={(e) => drop(e, props)}
          draggable="true" onDragStart={e => drag(e, props.id)}
          scope="row"
          className="taskNum" onClick={() => selectTask(props.id)}>
          {props.num.split('.0').join('')}</td>
        <td className="taskName">
          {props.level === 1 ? <div className='level-space-1' data-tip="Level 1"><span onClick={(e) => toggleGroups(props.num, props.id, props.level)} id={`task_name_${props.id}`} className={props.hasChildren ? 'has_children' : ''}>{props.name}</span></div> : null}
          {props.level === 2 ? <div className='level-space-2' data-tip="Level 2"><span onClick={(e) => toggleGroups(props.num, props.id, props.level)} id={`task_name_${props.id}`} className={props.hasChildren ? 'has_children' : ''}>{props.name}</span></div> : null}
          {props.level === 3 ? <div className='level-space-3' data-tip="Level 3"><span onClick={(e) => toggleGroups(props.num, props.id, props.level)} id={`task_name_${props.id}`} className={props.hasChildren ? 'has_children' : ''}>{props.name}</span></div> : null}
          {props.level === 4 ? <div className='level-space-4' data-tip="Level 4"><span onClick={(e) => toggleGroups(props.num, props.id, props.level)} id={`task_name_${props.id}`} className={props.hasChildren ? 'has_children' : ''}>{props.name}</span></div> : null}
        </td>
        <td>
          {props.priority === "Primary" ? <i data-tip="Primary" className="fa fa-star" aria-hidden="true"></i> : null}
          {props.priority === "Secondary" ? <i data-tip="Secondary" className="fa fa-star-half-o" aria-hidden="true"></i> : null}
          {props.priority === "Tertiary" ? <i data-tip="Tertiary" className="fa fa-star-o" aria-hidden="true"></i> : null}

        </td>
        <td >

          {
            props.resources.map((elm, i) => {
              if (i < 2) {

                try {
                  if (!elm.profilePic) {
                    return (
                      <a
                        key={`res_${i}`}
                        data-tip={elm.name} className="name"
                        href={`/userprofile/${elm.userID}`} target='_blank'><span className="dot">{elm.name.substring(0, 2)}</span>
                      </a>

                    )

                  }
                  return (
                    <a
                      key={`res_${i}`}
                      data-tip={elm.name} className="name"
                      href={`/userprofile/${elm.userID}`} target='_blank'><img className='img-circle' src={elm.profilePic} />
                    </a>
                  )

                } catch (err) {

                }


              }
            })
          }

          {
            props.resources.length > 2 ? <a className="name resourceMoreToggle" onClick={() => toggleMoreResources(`res-${props.id}`)}><span className="dot">{props.resources.length - 2}+</span></a> : null
          }

          <div id={`res-${props.id}`} className="resourceMore">
            {
              props.resources.map((elm, i) => {
                if (i >= 2) {


                  if (!elm.profilePic) {
                    return (
                      <a data-tip={elm.name} className="name" key={i}
                        href={`/userprofile/${elm.userID}`} target='_blank'><span className="dot">{elm.name.substring(0, 2)}</span>
                      </a>

                    )

                  }
                  return (
                    <a data-tip={elm.name} className="name" key={i}
                      href={`/userprofile/${elm.userID}`} target='_blank'><img className='img-circle' src={elm.profilePic} />
                    </a>
                  )
                }
              })

            }
          </div>

        </td>
        <td>{props.isAssigned ? <i data-tip="Assigned" className="fa fa-check-square" aria-hidden="true"></i> : <i data-tip="Not Assigned" className="fa fa-square-o" aria-hidden="true"></i>}</td>
        <td>{props.status === "Started" ? <i data-tip="Started" className="fa fa-pause" aria-hidden="true"></i> : <i data-tip="Not Started" className="fa fa-play" aria-hidden="true"></i>}</td>
        <td data-tip="Hours-Best" >{props.hoursBest}</td>
        <td data-tip="Hours-Worst" >{props.hoursWorst}</td>
        <td data-tip="Hours-Most" >{props.hoursMost}</td>
        <td data-tip="Estimated Hours" >{props.estimatedHours}</td>
        <td>
          {startedDate.getFullYear() !== 1969 ? `${(startedDate.getMonth() + 1)}/${startedDate.getDate()}/${startedDate.getFullYear()}` : null}
          <br />
        </td>
        <td>
          {dueDate.getFullYear() !== 1969 ? `${(dueDate.getMonth() + 1)}/${dueDate.getDate()}/${dueDate.getFullYear()}` : null}
        </td>
        <td>{props.links}</td>
      </tr>
      <tr className='taskDrop' id={`taskDrop_${props.id}`}>
        <td colSpan={14}></td>
      </tr>

      <tr className='wbsTaskController' id={`controller_${props.id}`}>
        <td colSpan={14} className='controlTd'>
          <AddTaskModal key={`addTask_${props.id}`} parentNum={props.num} taskId={props.id} projectId={props.projectId} wbsId={props.wbsId} parentId1={props.parentId1} parentId2={props.parentId2} parentId3={props.parentId3} level={props.level} openChild={(e) => openChild(props.num, props.id)} />
          <EditTaskModal key={`editTask_${props.id}`} parentNum={props.num} taskId={props.id} projectId={props.projectId} wbsId={props.wbsId} parentId1={props.parentId1} parentId2={props.parentId2} parentId3={props.parentId3} level={props.level} />

          <Button color="danger" size="sm" className='controlBtn controlBtn_remove' onClick={() => deleteTask(props.id)}>Remove</Button>

        </td>
      </tr>
    </React.Fragment >
  )
}

export default connect(null)(Task)

