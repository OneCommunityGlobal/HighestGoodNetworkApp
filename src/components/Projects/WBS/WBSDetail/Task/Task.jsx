/*********************************************************************************
 * Component: TAK
 * Author: Henry Ng - 21/03/20
 ********************************************************************************/
import React from 'react'
import { connect } from 'react-redux'
import { Button } from 'reactstrap';
import AddTaskModal from '../AddTask/AddTaskModal';
import './tagcolor.css';

const Task = (props) => {
  const startedDate = new Date(props.startedDatetime);
  const dueDate = new Date(props.dueDatetime);
  let isOpen = true;


  const selectTask = (id) => {
    document.getElementById(id).style.background = '#effff2';
    document.getElementById(`controller_${id}`).style.display = 'contents';
    props.selectTask(id);
  }

  const toggleGroups = (num, id) => {
    const allItems = document.getElementsByClassName('wbsTask');
    for (let i = 0; i < allItems.length; i++) {
      if (allItems[i].className.includes(`num_${num}`) && allItems[i].id !== id) {
        if (isOpen) {
          allItems[i].style.display = 'none';
        } else {
          allItems[i].style.display = 'table-row';
        }

      }
    }
    isOpen = !isOpen;
  }



  return (
    <React.Fragment>

      <tr className={`wbsTask  ${props.isNew ? 'newTask' : ''} parentId_${props.parentId} num_${props.num}`} id={props.id} >
        <th scope="row" className={`taskNum tag_color_${props.num.length > 0 ? props.num.split('.')[0] : props.num}`} onClick={() => selectTask(props.id)}>{props.num}</th>
        <td className="taskName">

          {props.level === 1 ? <div className='level-space-1' data-tip="Level 1"><span onClick={(e) => toggleGroups(props.num, props.id)} className='fa_dropdown' id={`dropdown_${props.id}`}><i className="fa fa-caret-down" aria-hidden="true"></i></span> {props.name}</div> : null}
          {props.level === 2 ? <div className='level-space-2' data-tip="Level 2"><span onClick={(e) => toggleGroups(props.num, props.id)} className='fa_dropdown' id={`dropdown_${props.id}`}><i className="fa fa-caret-down" aria-hidden="true"></i></span> {props.name}</div> : null}
          {props.level === 3 ? <div className='level-space-3' data-tip="Level 3"><span onClick={(e) => toggleGroups(props.num, props.id)} className='fa_dropdown' id={`dropdown_${props.id}`}><i className="fa fa-caret-down" aria-hidden="true"></i></span> {props.name}</div> : null}
          {props.level === 4 ? <div className='level-space-4' data-tip="Level 4"><span onClick={(e) => toggleGroups(props.num, props.id)} className='fa_dropdown' id={`dropdown_${props.id}`}><i className="fa fa-caret-down" aria-hidden="true"></i></span> {props.name}</div> : null}

        </td>
        <td>
          {props.priority === "Primary" ? <i data-tip="Primary" className="fa fa-star" aria-hidden="true"></i> : null}
          {props.priority === "Secondary" ? <i data-tip="Secondary" className="fa fa-star-half-o" aria-hidden="true"></i> : null}
          {props.priority === "Tertiary" ? <i data-tip="Tertiary" className="fa fa-star-o" aria-hidden="true"></i> : null}

        </td>
        <td>
          {props.resources.map((elm) => {
            if (!elm.profilePic) {
              return (
                <a data-tip={elm.name}
                  href={`/userprofile/${elm.userID}`} target='_blank'><span className="dot">{elm.name.substring(0, 2)}</span>
                </a>)
            }
            return (
              <a data-tip={elm.name}
                href={`/userprofile/${elm.userID}`} target='_blank'><img className='img-circle' src={elm.profilePic} />
              </a>
            )
          })}


        </td>
        <td>{props.isAssigned ? <i data-tip="Assigned" className="fa fa-check-square" aria-hidden="true"></i> : <i data-tip="Not Assigned" className="fa fa-square-o" aria-hidden="true"></i>}</td>
        <td>{props.status === "Started" ? <i data-tip="Started" className="fa fa-pause" aria-hidden="true"></i> : <i data-tip="Not Started" className="fa fa-play" aria-hidden="true"></i>}</td>
        <td data-tip="Hours-Best" >{props.hoursBest}</td>
        <td data-tip="Hours-Worst" >{props.hoursWorst}</td>
        <td data-tip="Hours-Most" >{props.hoursMost}</td>
        <td data-tip="Estimated Hours" >{props.estimatedHours}</td>
        <td>
          {(startedDate.getMonth() + 1)}/{startedDate.getDate()}/{startedDate.getFullYear()}
          <br />
        </td>
        <td>
          {(dueDate.getMonth() + 1)}/{dueDate.getDate()}/{dueDate.getFullYear()}
        </td>
        <td>{props.links}</td>
      </tr>

      <tr className='wbsTaskController' id={`controller_${props.id}`}>
        <td colspan="13" className='controlTd'>
          <AddTaskModal parentNum={props.num} taskId={props.id} wbsId={props.wbsId} />
          <Button color="info" size="sm" className='controlBtn'>Edit</Button>

          <Button color="success" size="sm" className='controlBtn'><i class="fa fa-arrow-up" aria-hidden="true"></i></Button>
          <Button color="success" size="sm" className='controlBtn'><i class="fa fa-arrow-down" aria-hidden="true"></i></Button>
          <Button color="danger" size="sm" className='controlBtn controlBtn_remove'>Remove</Button>

        </td>
      </tr>
    </React.Fragment >
  )
}

export default connect(null)(Task)

