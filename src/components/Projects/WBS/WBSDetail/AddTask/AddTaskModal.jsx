import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { connect } from 'react-redux'
import ReactTooltip from 'react-tooltip'
import { fetchAllTasks } from './../../../../../actions/task'
import { addNewTask } from './../../../../../actions/task';
import { DUE_DATE_MUST_GREATER_THAN_START_DATE } from './../../../../../languages/en/messages';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';
import dateFnsFormat from 'date-fns/format';

const AddTaskModal = (props) => {
  const tasks = props.tasks.taskItems;
  const { members } = props.projectMembers;
  let foundedMembers = [];

  // modal
  const [modal, setModal] = useState(false);
  const toggle = () => setModal(!modal);

  const [isLoading, setIsLoading] = useState(false);

  const setToggle = () => {
    try {
      props.openChild();
    } catch{ }
    toggle();
  }

  // task Num
  let newNum = '1';

  // task name
  const [taskName, setTaskName] = useState('')

  // priority 
  const [priority, setPriority] = useState('Primary')

  // members name
  const [memberName, setMemberName] = useState(' ');

  // resources 
  const [resourceItems, setResourceItems] = useState([]);

  // assigned
  const [assigned, setAssigned] = useState(true)

  // status
  const [status, setStatus] = useState('Started');

  // hour best
  const [hoursBest, setHoursBest] = useState(0);

  // hour worst
  const [hoursWorst, setHoursWorst] = useState(0);

  // hour most
  const [hoursMost, setHoursMost] = useState(0);

  // hour estimate
  const [hoursEstimate, setHoursEstimate] = useState(0);

  // started date
  const [startedDate, setStartedDate] = useState('');

  // due date
  const [dueDate, setDueDate] = useState('');

  // links
  const [links, setLinks] = useState([]);

  // Warning
  const [dateWarning, setDateWarning] = useState(false);
  const [hoursWarning, setHoursWarning] = useState(false);

  const getNewNum = () => {
    if (tasks.length > 0) {
      if (props.taskId) {
        const childTasks = tasks.filter(task => task.mother === props.taskId);
        newNum = `${props.parentNum !== null ? props.parentNum + '.' : ''}${childTasks.length + 1}`;
        newNum = newNum.replace(/.0/g, '');
      } else {
        newNum = tasks.filter(task => task.level === 1).length + 1 + '';
      }

    }

  }







  const [foundMembersHTML, setfoundMembersHTML] = useState('');
  const findMembers = () => {
    foundedMembers = members.filter(user => ((user.firstName + " " + user.lastName)).toLowerCase().includes(memberName.toLowerCase()));
    const html = foundedMembers.map((elm, i) =>
      <div key={i}>
        <a href={`/userprofile/${elm._id}`} target='_blank'>
          <input
            type="text"
            className='task-resouces-input'
            value={elm.firstName + ' ' + elm.lastName}
            disabled />
        </a>
        <button
          data-tip="Add this member"
          className="task-resouces-btn"
          type="button"
          onClick={() => addResources(elm._id, elm.firstName, elm.lastName, elm.profilePic)}
        >
          <i className="fa fa-plus" aria-hidden="true"></i>
        </button>
      </div>
    );
    setfoundMembersHTML(html);
  }


  const removeResource = (userID) => {
    var removeIndex = resourceItems.map(item => item.userID).indexOf(userID);
    setResourceItems([...resourceItems.slice(0, removeIndex), ...resourceItems.slice(removeIndex + 1)]);
  }

  let res = [];
  const addResources = (userID, first, last, profilePic) => {
    res.push({
      userID,
      name: `${first} ${last}`,
      profilePic
    });
    setResourceItems([...res]);
  }

  // Date picker
  const FORMAT = 'MM/dd/yy';
  const formatDate = (date, format, locale) => {
    return dateFnsFormat(date, format, { locale });
  }

  // Links
  const [link, setLink] = useState('');
  const addLink = () => {
    setLinks([...links, link]);
  }

  const removeLink = (index) => {
    setLinks([...links.slice(0, index), ...links.slice(index + 1)]);
  }

  // Hours estimate
  const calHoursEstimate = (isOn = null) => {
    let currHoursMost = parseInt(hoursMost);
    let currHoursWorst = parseInt(hoursWorst);
    let currHoursBest = parseInt(hoursBest);
    if (isOn !== 'hoursMost') {
      currHoursMost = Math.round((currHoursWorst - currHoursBest) / 2 + currHoursBest);
      setHoursMost(currHoursMost);
      if (isOn !== 'hoursWorst') {
        currHoursWorst = Math.round(currHoursBest * 2);
        setHoursWorst(currHoursWorst);
        currHoursMost = Math.round((currHoursWorst - currHoursBest) / 2 + currHoursBest);
        setHoursMost(currHoursMost);

      }
    }

    setHoursEstimate(parseInt((currHoursMost + currHoursBest + currHoursWorst) / 3));

    if (!((currHoursBest <= currHoursMost) && (currHoursMost <= currHoursWorst))) {
      setHoursWarning(true);
    } else {
      setHoursWarning(false);
    }


  }


  // parent Id
  let parentId1 = props.parentId1 ? props.parentId1 : null;
  let parentId2 = props.parentId2 ? props.parentId2 : null;
  let parentId3 = props.parentId3 ? props.parentId3 : null;


  if (props.parentId1 === null) {
    parentId1 = props.taskId;
  } else if (props.parentId2 === null) {
    parentId2 = props.taskId;
  } else if (props.parentId3 === null) {
    parentId3 = props.taskId;
  }

  const changeDateStart = (startDate) => {
    setStartedDate(startDate);
    if (dueDate) {
      if (startDate > dueDate) {
        setDateWarning(true);
      } else {
        setDateWarning(false);

      }
    }
  }

  const changeDateEnd = (dueDate) => {
    setDueDate(dueDate);
    if (startedDate) {
      if (dueDate < startedDate) {
        setDateWarning(true);
      } else {
        setDateWarning(false);

      }
    }
  }

  const clear = () => {
    setTaskName('');
    setPriority('Primary')
    setMemberName(' ');
    setResourceItems([]);
    res = [];
    setAssigned(false);
    setStatus('Started')
    setHoursBest(0);
    setHoursWorst(0);
    setHoursMost(0);
    setHoursEstimate(0);
    setStartedDate('');
    setDueDate('');
    setLinks([]);
  }




  const addNewTask = () => {
    setIsLoading(true);
    const newTask =
    {
      "wbsId": props.wbsId,
      "taskName": taskName,
      "num": newNum,
      "level": newNum.length > 1 ? newNum.split('.').length : 1,
      "priority": priority,
      "resources": resourceItems,
      "isAssigned": assigned,
      "status": status,
      "hoursBest": parseFloat(hoursBest),
      "hoursWorst": parseFloat(hoursWorst),
      "hoursMost": parseFloat(hoursMost),
      "estimatedHours": parseFloat(hoursEstimate),
      "startedDatetime": startedDate,
      "dueDatetime": dueDate,
      "links": links,
      "mother": props.taskId,
      "parentId1": parentId1,
      "parentId2": parentId2,
      "parentId3": parentId3,
      "position": tasks.length,
      "isActive": true
    }



    props.addNewTask(newTask, props.wbsId);
    clear();
    setTimeout(() => {
      props.fetchAllTasks(props.wbsId);
      setTimeout(() => {
        setIsLoading(false);
        if (props.tasks.error === "none") {
          toggle();
          getNewNum();
        }
      }, 2000);
    }, 4000);


  }

  useEffect(() => {

  }, [tasks]);

  getNewNum();

  return (
    <div className='controlBtn'>

      <Modal isOpen={modal} toggle={toggle} >
        <ModalHeader toggle={toggle}>Add New Task <button type="button" className="btn btn-primary btn-sm" onClick={() => clear()}>Reset</button></ModalHeader>
        <ModalBody>
          <ReactTooltip />

          <table className="table table-bordered">
            <tbody>
              <tr>
                <td scope="col" data-tip="WBS ID">
                  WBS #
                  </td>
                <td scope="col" >
                  {newNum.replace(/.0/g, '')}
                </td>
              </tr>
              <tr>
                <td scope="col" >Task Name</td>
                <td scope="col" >
                  <input
                    type="text"
                    className='task-name'
                    onChange={(e) => setTaskName(e.target.value)}
                    onKeyPress={(e) => setTaskName(e.target.value)}
                    value={taskName}
                  />
                </td>
              </tr>
              <tr>
                <td scope="col" >Priority</td>
                <td scope="col" >
                  <select id="priority"
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value='Primary'>Primary</option>
                    <option value='Secondary'>Secondary</option>
                    <option value='Tertiary'>Tertiary</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td scope="col" >Resources</td>
                <td scope="col" >
                  <div>
                    <input type="text"

                      aria-label="Search user"
                      placeholder="Name"
                      className='task-resouces-input'
                      data-tip="Input a name"
                      onChange={(e) => setMemberName(e.target.value)}
                      onKeyPress={(e) => setMemberName(e.target.value)}
                      onKeyPress={findMembers}

                    />
                    <button
                      className="task-resouces-btn"
                      type="button"
                      data-tip="All members"
                      onClick={findMembers}
                    >
                      <i className="fa fa-caret-square-o-down" aria-hidden="true"></i>

                    </button>
                  </div>
                  <div className='task-reousces-list'>
                    <div>
                      {foundMembersHTML}
                    </div>
                  </div>
                  <div className='task-reousces-list'>
                    {
                      resourceItems.map((elm, i) => {
                        if (!elm.profilePic) {
                          return (
                            <a
                              key={`res_${i}`}
                              data-tip={elm.name}
                              onClick={(e) => removeResource(elm.userID, e.target)}
                            ><span className="dot">{elm.name.substring(0, 2)}</span>
                            </a>)
                        }
                        return (
                          <a
                            key={`res_${i}`}
                            data-tip={elm.name}
                            onClick={(e) => removeResource(elm.userID, e.target)}

                          ><img className='img-circle' src={elm.profilePic} />
                          </a>
                        )

                      })
                    }

                  </div>
                </td>
              </tr>
              <tr>
                <td scope="col" >Assigned</td>
                <td scope="col" >
                  <select
                    id="Assigned"
                    onChange={(e) => setAssigned(e.target.value === 'true' ? true : false)}
                  >
                    <option value='true'>Yes</option>
                    <option value='false'>No</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td scope="col" >Status</td>
                <td scope="col" >
                  <select id="Status"
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value='Not Started'>Not Started</option>
                    <option value='Started'>Started</option>

                  </select>
                </td>
              </tr>
              <tr>
                <td scope="col" data-tip="Hours - Best-case">Hours - Best-case</td>
                <td scope="col" data-tip="Hours - Best-case">
                  <input type='number' min='0' max='500' value={hoursBest}
                    onChange={(e) => setHoursBest(e.target.value)}
                    onBlur={() => calHoursEstimate()}
                  />
                  <div className='warning'>
                    {hoursWarning ? "Hours - Best-case < Hours - Most-case < Hours - Most-case" : ''}
                  </div>
                </td>
              </tr>
              <tr>
                <td scope="col" data-tip="Hours - Worst-case">Hours - Worst-case</td>
                <td scope="col" data-tip="Hours - Worst-case">
                  <input type='number' min={hoursBest} max='500' value={hoursWorst}
                    onChange={(e) => setHoursWorst(e.target.value)}
                    onBlur={() => calHoursEstimate("hoursWorst")}
                  />
                  <div className='warning'>
                    {hoursWarning ? "Hours - Best-case < Hours - Most-case < Hours - Most-case" : ''}
                  </div>
                </td>
              </tr>
              <tr>
                <td scope="col" data-tip="Hours - Most-case">Hours - Most-case</td>
                <td scope="col" data-tip="Hours - Most-case">
                  <input type='number' min='0' max='500' value={hoursMost}
                    onChange={(e) => setHoursMost(e.target.value)}
                    onBlur={() => calHoursEstimate("hoursMost")}
                  />
                  <div className='warning'>
                    {hoursWarning ? "Hours - Best-case < Hours - Most-case < Hours - Most-case" : ''}
                  </div>
                </td>
              </tr>
              <tr>
                <td scope="col" data-tip="Estimated Hours">Estimated Hours</td>
                <td scope="col" data-tip="Estimated Hours">
                  <input type='number' min='0' max='500' value={hoursEstimate}
                    onChange={(e) => setHoursEstimate(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <td scope="col" >Start Date</td>
                <td scope="col" >
                  <div>
                    <DayPickerInput
                      format={FORMAT}
                      formatDate={formatDate}
                      placeholder={`${dateFnsFormat(new Date(), FORMAT)}`}
                      onDayChange={(day, mod, input) => changeDateStart(input.state.value)}
                    />
                    <div className='warning'>
                      {dateWarning ? DUE_DATE_MUST_GREATER_THAN_START_DATE : ''}
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td scope="col" >End Date</td>
                <td scope="col" >
                  <DayPickerInput
                    format={FORMAT}
                    formatDate={formatDate}
                    placeholder={`${dateFnsFormat(new Date(), FORMAT)}`}
                    onDayChange={(day, mod, input) => changeDateEnd(input.state.value)} />
                  <div className='warning'>
                    {dateWarning ? DUE_DATE_MUST_GREATER_THAN_START_DATE : ''}
                  </div>
                </td>
              </tr>
              <tr>
                <td scope="col" >Links</td>
                <td scope="col" >
                  <div>
                    <input type="text"
                      aria-label="Search user"
                      placeholder="Link"
                      className='task-resouces-input'
                      data-tip="Add a link"
                      onChange={(e) => setLink(e.target.value)}
                    />
                    <button
                      className="task-resouces-btn"
                      type="button"
                      data-tip="Add Link"
                      onClick={() => addLink()}
                    >
                      <i className="fa fa-plus" aria-hidden="true"></i>
                    </button>
                  </div>
                  <div>
                    {links.map((link, i) => link.length > 1 ? <div key={i}><a href={link} target='_blank'>{link}</a><span className="remove-link" onClick={() => removeLink(i)}>x</span></div> : null)}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>


        </ModalBody>
        <ModalFooter>
          {taskName !== '' ? isLoading ? " Adding..." : <Button color="primary" onClick={toggle} onClick={addNewTask}>Save</Button> : null}
          <Button color="secondary" onClick={toggle}>Cancel</Button>
        </ModalFooter>
      </Modal >
      <Button color="primary" size="sm" onClick={setToggle} >Add Task</Button>

    </div >


  );
}

const mapStateToProps = state => { return state }
export default connect(mapStateToProps, {
  addNewTask, fetchAllTasks
})(AddTaskModal);