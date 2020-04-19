import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { connect } from 'react-redux'
import ReactTooltip from 'react-tooltip'
import { fetchAllMembers } from './../../../../../actions/projectMembers'
import { addNewTask } from './../../../../../actions/task'
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


  // task Num
  let newNum = '0';

  // task name
  const [taskName, setTaskName] = useState('')

  // priority 
  const [priority, setPriority] = useState('Primary')

  // members name
  const [memberName, setMemberName] = useState(' ');

  // resources 
  const [resources] = useState([]);

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
  const [links] = useState([]);


  // list of num
  const nums = [];
  tasks.forEach(task => {
    nums.push(task.num);
  });


  const getNewNum = () => {
    // get new num
    if (tasks.length >= 1) {

      if (props.parentNum !== "-1") {
        let tmpNewNum = '';
        nums.forEach((num, i) => {
          if (num.includes(props.parentNum)) {
            tmpNewNum = num;
          }

        });

        if (tmpNewNum.length === props.parentNum.length) {
          newNum = `${tmpNewNum}.1`;
        } else {
          if (tmpNewNum.length > 1) {
            let numArr = tmpNewNum.split('.');
            let end = numArr[numArr.length - 1];
            let before = '';
            for (let i = 0; i < numArr.length - 1; i++) {
              before += numArr[i] + '.';
            }
            newNum = before + (parseInt(end) + 1);
          }

        }
      } else {
        nums.forEach(num => {
          if (num.split('.').length === 1) {
            newNum = parseInt(num) + 1;
          }
        });
      }
    }
  }





  const [foundMembersHTML, setfoundMembersHTML] = useState('');
  const findMembers = () => {
    foundedMembers = members.filter(user => ((user.firstName + " " + user.lastName)).toLowerCase().includes(memberName.toLowerCase()));
    const html = foundedMembers.map(elm =>
      <div>
        <input
          type="text"
          className='task-resouces-input'
          value={elm.firstName + ' ' + elm.lastName}
          disabled />
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

  // Add Resources
  const [resourcesHTML, setResourcesHTML] = useState('');
  const addResources = (userID, first, last, profilePic) => {
    resources.push({
      userID,
      name: `${first} ${last}`,
      profilePic,
    });

    const html = resources.map(elm => {
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

    });
    setResourcesHTML(html);

  }

  // Date picker
  const FORMAT = 'MM/dd/yy';
  const formatDate = (date, format, locale) => {
    return dateFnsFormat(date, format, { locale });
  }

  // Links
  const [link, setLink] = useState('');
  const [linksHTML, setLinksHTML] = useState('');
  const addLink = () => {
    links.push(link);

    const html = links.map(link =>
      <div><a href={link} target='_blank'>{link.replace('http://', '')}</a></div>);
    setLinksHTML(html);
  }

  // Hours estimate
  const calHoursEstimate = () => {
    setHoursEstimate(parseInt((parseInt(hoursMost) + parseInt(hoursWorst) + parseInt(hoursBest)) / 3));
  }


  const addNewTask = () => {
    const newTask =
    {
      "wbsId": props.wbsId,
      "taskName": taskName,
      "num": newNum,
      "level": newNum.length > 1 ? newNum.split('.').length : 1,
      "priority": priority,
      "resources": resources,
      "isAssigned": assigned,
      "status": status,
      "hoursBest": parseInt(hoursBest),
      "hoursWorst": parseInt(hoursWorst),
      "hoursMost": parseInt(hoursMost),
      "estimatedHours": parseInt(hoursEstimate),
      "startedDatetime": startedDate,
      "dueDatetime": dueDate,
      "links": links,
      "parentId": props.taskId,
      "isActive": true
    }

    props.addNewTask(newTask, props.wbsId);
    if (props.tasks.error === "none") {
      toggle();
      getNewNum();
    }
  }

  useEffect(() => {

  }, [tasks]);
  getNewNum();

  return (
    <div className='controlBtn'>

      <Modal isOpen={modal} toggle={toggle} >
        <ModalHeader toggle={toggle}>Add New Task</ModalHeader>
        <ModalBody>
          <ReactTooltip />

          <table className="table table-bordered">
            <tbody>
              <tr>
                <td scope="col" data-tip="WBS ID">
                  WBS #
                  </td>
                <td scope="col" >
                  {newNum}
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

                    {resourcesHTML}
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
                    <option value='Started'>Started</option>
                    <option value='Not Started'>Not Started</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td scope="col" data-tip="Hours-Best">Hours-Best</td>
                <td scope="col" data-tip="Hours-Best">
                  <input type='number' min='0' max='500' value={hoursBest}
                    onChange={(e) => setHoursBest(e.target.value)}
                    onBlur={() => calHoursEstimate()}


                  />
                </td>
              </tr>
              <tr>
                <td scope="col" data-tip="Hours-Worst">Hours-Worst</td>
                <td scope="col" data-tip="Hours-Worst">
                  <input type='number' min={hoursBest} max='500' value={hoursWorst}
                    onChange={(e) => setHoursWorst(e.target.value)}
                    onBlur={() => calHoursEstimate()}

                  />
                </td>
              </tr>
              <tr>
                <td scope="col" data-tip="Hours-Most">Hours-Most</td>
                <td scope="col" data-tip="Hours-Most">
                  <input type='number' min='0' max='500' value={hoursMost}
                    onChange={(e) => setHoursMost(e.target.value)}
                    onBlur={() => calHoursEstimate()}

                  />
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
                      onDayChange={(day, mod, input) => setStartedDate(input.state.value)} />
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
                    onDayChange={(day, mod, input) => setDueDate(input.state.value)} />
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
                      onClick={addLink}
                    >
                      <i className="fa fa-plus" aria-hidden="true"></i>
                    </button>
                  </div>
                  <div>
                    {linksHTML}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>


        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={toggle} onClick={addNewTask}>Save</Button>{' '}
          <Button color="secondary" onClick={toggle}>Cancel</Button>
        </ModalFooter>
      </Modal >
      <Button color="primary" size="sm" onClick={toggle} >Add Task</Button>

    </div >


  );
}

const mapStateToProps = state => { return state }
export default connect(mapStateToProps, {
  fetchAllMembers, addNewTask
})(AddTaskModal);