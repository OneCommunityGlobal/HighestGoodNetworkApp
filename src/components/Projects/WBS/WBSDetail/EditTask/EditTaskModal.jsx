import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import { DUE_DATE_MUST_GREATER_THAN_START_DATE } from '../../../../../languages/en/messages';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import { DateUtils } from 'react-day-picker';
import 'react-day-picker/lib/style.css';
import dateFnsFormat from 'date-fns/format';
import dateFnsParse from 'date-fns/parse';
import { updateTask, fetchAllTasks } from '../../../../../actions/task';
import { Editor } from '@tinymce/tinymce-react';
import { UserRole } from './../../../../../utils/enums';

const EditTaskModal = (props) => {
  const [role] = useState(props.auth ? props.auth.user.role : null);

  const tasks = props.tasks.taskItems;
  const { members } = props.projectMembers;
  let foundedMembers = [];

  const thisTask = tasks.filter((task) => task._id === props.taskId)[0];

  // Date picker
  const FORMAT = 'MM/dd/yy';
  const formatDate = (date, format, locale) => dateFnsFormat(date, format, { locale });
  const parseDate = (str, format, locale) => {
    const parsed = dateFnsParse(str, format, new Date(), { locale });
    if (DateUtils.isDate(parsed)) {
      return parsed;
    }
    return undefined;
  };

  // modal
  const [modal, setModal] = useState(false);
  const toggle = () => setModal(!modal);

  // task name
  const [taskName, setTaskName] = useState(thisTask.taskName);

  // priority
  const [priority, setPriority] = useState(thisTask.priority);

  // members name
  const [memberName, setMemberName] = useState('');

  // resources
  const [resourceItems, setResourceItems] = useState(thisTask.resources);

  // assigned
  const [assigned, setAssigned] = useState(thisTask.assigned);

  // status
  const [status, setStatus] = useState(thisTask.status);

  // hour best
  const [hoursBest, setHoursBest] = useState(thisTask.hoursBest);

  // hour worst
  const [hoursWorst, setHoursWorst] = useState(thisTask.hoursWorst);

  // hour most
  const [hoursMost, setHoursMost] = useState(thisTask.hoursMost);

  // hour estimate
  const [hoursEstimate, setHoursEstimate] = useState(thisTask.estimatedHours);

  // started date
  const [startedDate, setStartedDate] = useState(thisTask.startedDatetime);

  // due date
  const [dueDate, setDueDate] = useState(thisTask.dueDatetime);

  // links
  const [links, setLinks] = useState(thisTask.links);

  // Why info (Why is this task important)
  const [whyInfo, setWhyInfo] = useState(thisTask.whyInfo);

  // Intent info (Design intent)
  const [intentInfo, setIntentInfo] = useState(thisTask.intentInfo);

  // Endstate info (what it should look like when done)
  const [endstateInfo, setEndstateInfo] = useState(thisTask.endstateInfo);

  // Classification
  const [classification, setClassification] = useState(thisTask.classification);

  // Warning
  const [dateWarning, setDateWarning] = useState(false);
  const [hoursWarning, setHoursWarning] = useState(false);

  const [foundMembersHTML, setfoundMembersHTML] = useState('');
  const findMembers = () => {
    foundedMembers = members.filter((user) =>
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(memberName.toLowerCase()),
    );
    const html = foundedMembers.map((elm) => (
      <div>
        <input
          type="text"
          className="task-resouces-input"
          value={`${elm.firstName} ${elm.lastName}`}
          disabled
        />
        <button
          data-tip="Add this member"
          className="task-resouces-btn"
          type="button"
          onClick={() => addResources(elm._id, elm.firstName, elm.lastName, elm.profilePic)}
        >
          <i className="fa fa-plus" aria-hidden="true" />
        </button>
      </div>
    ));
    setfoundMembersHTML(html);
  };

  const removeResource = (userID) => {
    const removeIndex = resourceItems.map((item) => item.userID).indexOf(userID);
    setResourceItems([
      ...resourceItems.slice(0, removeIndex),
      ...resourceItems.slice(removeIndex + 1),
    ]);
  };

  const res = [...resourceItems];
  const addResources = (userID, first, last, profilePic) => {
    res.push({
      userID,
      name: `${first} ${last}`,
      profilePic,
    });
    setResourceItems([...res]);
  };

  // Links
  const [link, setLink] = useState('');
  const addLink = () => {
    setLinks([...links, link]);
  };

  // Hours estimate
  const calHoursEstimate = (isOn = null) => {
    let currHoursMost = parseInt(hoursMost);
    let currHoursWorst = parseInt(hoursWorst);
    const currHoursBest = parseInt(hoursBest);
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

    if (!(currHoursBest <= currHoursMost && currHoursMost <= currHoursWorst)) {
      setHoursWarning(true);
    } else {
      setHoursWarning(false);
    }
  };

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
  };

  const changeDateEnd = (dueDate) => {
    setDueDate(dueDate);
    if (startedDate) {
      if (dueDate < startedDate) {
        setDateWarning(true);
      } else {
        setDateWarning(false);
      }
    }
  };

  const removeLink = (index) => {
    setLinks([...links.splice(0, index), ...links.splice(index + 1)]);
  };

  const updateTask = () => {
    const updatedTask = {
      taskName,
      priority,
      resources: resourceItems,
      isAssigned: assigned,
      status,
      hoursBest: parseFloat(hoursBest),
      hoursWorst: parseFloat(hoursWorst),
      hoursMost: parseFloat(hoursMost),
      estimatedHours: parseFloat(hoursEstimate),
      startedDatetime: startedDate,
      dueDatetime: dueDate,
      links,
      whyInfo,
      intentInfo,
      endstateInfo,
      classification,
    };

    props.updateTask(props.taskId, updatedTask);
    setTimeout(() => {
      props.fetchAllTasks(props.wbsId);
    }, 4000);

    if (props.tasks.error === 'none') {
      toggle();
    }
  };

  useEffect(() => {}, [tasks]);

  return (
    <div className="controlBtn">
      <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>
          {role === UserRole.Administrator ? 'Edit' : 'View'}
        </ModalHeader>
        <ModalBody>
          <ReactTooltip />

          <table
            className={`table table-bordered ${
              role === UserRole.Administrator ? null : 'disable-div'
            }`}
          >
            <tbody>
              <tr>
                <td scope="col" data-tip="WBS ID">
                  WBS #
                </td>
                <td scope="col">{thisTask.num.replace(/.0/g, '')}</td>
              </tr>
              <tr>
                <td scope="col">Task Name</td>
                <td scope="col">
                  <input
                    type="text"
                    className="task-name"
                    onChange={(e) => setTaskName(e.target.value)}
                    onKeyPress={(e) => setTaskName(e.target.value)}
                    value={taskName}
                  />
                </td>
              </tr>
              <tr>
                <td scope="col">Priority</td>
                <td scope="col">
                  <select
                    id="priority"
                    onChange={(e) => setPriority(e.target.value)}
                    value={priority}
                  >
                    <option value="Primary">Primary</option>
                    <option value="Secondary">Secondary</option>
                    <option value="Tertiary">Tertiary</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td scope="col">Resources</td>
                <td scope="col">
                  <div>
                    <input
                      type="text"
                      aria-label="Search user"
                      placeholder="Name"
                      className="task-resouces-input"
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
                      <i className="fa fa-caret-square-o-down" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="task-reousces-list">
                    <div>{foundMembersHTML}</div>
                  </div>
                  <div className="task-reousces-list">
                    {resourceItems.map((elm, i) => {
                      if (!elm.profilePic) {
                        return (
                          <a
                            key={`res_${i}`}
                            data-tip={elm.name}
                            onClick={(e) => removeResource(elm.userID, e.target)}
                          >
                            <span className="dot">{elm.name.substring(0, 2)}</span>
                          </a>
                        );
                      }
                      return (
                        <a
                          key={`res_${i}`}
                          data-tip={elm.name}
                          onClick={(e) => removeResource(elm.userID, e.target)}
                        >
                          <img className="img-circle" src={elm.profilePic} />
                        </a>
                      );
                    })}
                  </div>
                </td>
              </tr>
              <tr>
                <td scope="col">Assigned</td>
                <td scope="col">
                  <select id="Assigned" onChange={(e) => setAssigned(e.target.value === 'true')}>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td scope="col">Status</td>
                <td scope="col">
                  <select id="Status" onChange={(e) => setStatus(e.target.value)}>
                    <option value="Started">Started</option>
                    <option value="Not Started">Not Started</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td scope="col" data-tip="Hours - Best-case">
                  Hours - Best-case
                </td>
                <td scope="col" data-tip="Hours - Best-case">
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={hoursBest}
                    onChange={(e) => setHoursBest(e.target.value)}
                    onBlur={() => calHoursEstimate()}
                  />
                  <div className="warning">
                    {hoursWarning
                      ? 'Hours - Best-case < Hours - Most-case < Hours - Most-case'
                      : ''}
                  </div>
                </td>
              </tr>
              <tr>
                <td scope="col" data-tip="Hours - Worst-case">
                  Hours - Worst-case
                </td>
                <td scope="col" data-tip="Hours - Worst-case">
                  <input
                    type="number"
                    min={hoursBest}
                    max="500"
                    value={hoursWorst}
                    onChange={(e) => setHoursWorst(e.target.value)}
                    onBlur={() => calHoursEstimate('hoursWorst')}
                  />
                  <div className="warning">
                    {hoursWarning
                      ? 'Hours - Best-case < Hours - Most-case < Hours - Most-case'
                      : ''}
                  </div>
                </td>
              </tr>
              <tr>
                <td scope="col" data-tip="Hours - Most-case">
                  Hours - Most-case
                </td>
                <td scope="col" data-tip="Hours - Most-case">
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={hoursMost}
                    onChange={(e) => setHoursMost(e.target.value)}
                    onBlur={() => calHoursEstimate('hoursMost')}
                  />
                  <div className="warning">
                    {hoursWarning
                      ? 'Hours - Best-case < Hours - Most-case < Hours - Most-case'
                      : ''}
                  </div>
                </td>
              </tr>
              <tr>
                <td scope="col" data-tip="Estimated Hours">
                  Estimated Hours
                </td>
                <td scope="col" data-tip="Estimated Hours">
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={hoursEstimate}
                    onChange={(e) => setHoursEstimate(e.target.value)}
                  />
                </td>
              </tr>

              <tr>
                <td scope="col">Links</td>
                <td scope="col">
                  <div>
                    <input
                      type="text"
                      aria-label="Search user"
                      placeholder="Link"
                      className="task-resouces-input"
                      data-tip="Add a link"
                      onChange={(e) => setLink(e.target.value)}
                    />
                    <button
                      className="task-resouces-btn"
                      type="button"
                      data-tip="Add Link"
                      onClick={addLink}
                    >
                      <i className="fa fa-plus" aria-hidden="true" />
                    </button>
                  </div>
                  <div>
                    {links.map((link, i) =>
                      link.length > 1 ? (
                        <div key={i} className="task-link">
                          <a href={link} target="_blank">
                            {link.slice(-10)}
                          </a>
                          <span className="remove-link" onClick={() => removeLink(i)}>
                            x
                          </span>
                        </div>
                      ) : null,
                    )}
                  </div>
                </td>
              </tr>
              <tr>
                <td scope="col">Classification</td>
                <td scope="col">
                  <select
                    value={classification}
                    onChange={(e) => setClassification(e.target.value)}
                  >
                    <option value="Food">Food</option>
                    <option value="Energy">Energy</option>
                    <option value="Housing">Housing</option>
                    <option value="Education">Education</option>
                    <option value="Soceity">Society</option>
                    <option value="Economics">Economics</option>
                    <option value="Stewardship">Stewardship</option>
                    <option value="Not Assigned">Not Assigned</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td scope="col" colSpan="2">
                  Why this Task is Important
                  <Editor
                    init={{
                      menubar: false,
                      plugins: 'advlist autolink autoresize lists link charmap table paste help',
                      toolbar:
                        'bold italic  underline numlist   |  removeformat link bullist  outdent indent |\
                                        styleselect fontsizeselect | table| strikethrough forecolor backcolor |\
                                        subscript superscript charmap  | help',
                      branding: false,
                      min_height: 180,
                      max_height: 300,
                      autoresize_bottom_margin: 1,
                    }}
                    name="why-info"
                    className="why-info"
                    className="form-control"
                    value={whyInfo}
                    onEditorChange={(content) => setWhyInfo(content)}
                  />
                </td>
              </tr>
              <tr>
                <td scope="col" colSpan="2">
                  Design Intent
                  <Editor
                    init={{
                      menubar: false,
                      plugins: 'advlist autolink autoresize lists link charmap table paste help',
                      toolbar:
                        'bold italic  underline numlist   |  removeformat link bullist  outdent indent |\
                                        styleselect fontsizeselect | table| strikethrough forecolor backcolor |\
                                        subscript superscript charmap  | help',
                      branding: false,
                      min_height: 180,
                      max_height: 300,
                      autoresize_bottom_margin: 1,
                    }}
                    name="intent-info"
                    className="intent-info"
                    className="form-control"
                    value={intentInfo}
                    onEditorChange={(content) => setIntentInfo(content)}
                  />
                </td>
              </tr>
              <tr>
                <td scope="col" colSpan="2">
                  Endstate
                  <Editor
                    init={{
                      menubar: false,
                      plugins: 'advlist autolink autoresize lists link charmap table paste help',
                      toolbar:
                        'bold italic  underline numlist   |  removeformat link bullist  outdent indent |\
                                        styleselect fontsizeselect | table| strikethrough forecolor backcolor |\
                                        subscript superscript charmap  | help',
                      branding: false,
                      min_height: 180,
                      max_height: 300,
                      autoresize_bottom_margin: 1,
                    }}
                    name="endstate-info"
                    className="endstate-info"
                    className="form-control"
                    value={endstateInfo}
                    onEditorChange={(content) => setEndstateInfo(content)}
                  />
                </td>
              </tr>
              <tr>
                <td scope="col">Start Date</td>
                <td scope="col">
                  <div>
                    <DayPickerInput
                      format={FORMAT}
                      formatDate={formatDate}
                      placeholder={`${dateFnsFormat(new Date(), FORMAT)}`}
                      onDayChange={(day, mod, input) => changeDateStart(input.state.value)}
                      value={startedDate}
                    />
                    <div className="warning">
                      {dateWarning ? DUE_DATE_MUST_GREATER_THAN_START_DATE : ''}
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td scope="col">End Date</td>
                <td scope="col">
                  <DayPickerInput
                    format={FORMAT}
                    formatDate={formatDate}
                    placeholder={`${dateFnsFormat(new Date(), FORMAT)}`}
                    onDayChange={(day, mod, input) => changeDateEnd(input.state.value)}
                    value={dueDate}
                  />

                  <div className="warning">
                    {dateWarning ? DUE_DATE_MUST_GREATER_THAN_START_DATE : ''}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </ModalBody>

        {role === UserRole.Administrator ? (
          <ModalFooter>
            {taskName !== '' && startedDate !== '' && dueDate !== '' ? (
              <Button color="primary" onClick={toggle} onClick={updateTask}>
                Update
              </Button>
            ) : null}
            <Button color="secondary" onClick={toggle}>
              Cancel
            </Button>
          </ModalFooter>
        ) : null}
      </Modal>
      <Button color="primary" size="sm" onClick={toggle}>
        {role === UserRole.Administrator ? 'Edit' : 'View'}
      </Button>
    </div>
  );
};

const mapStateToProps = (state) => state;
export default connect(mapStateToProps, {
  updateTask,
  fetchAllTasks,
})(EditTaskModal);
