import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import { Editor } from '@tinymce/tinymce-react';
import dateFnsFormat from 'date-fns/format';
import { fetchAllTasks, addNewTask } from '../../../../../actions/task';
import { DUE_DATE_MUST_GREATER_THAN_START_DATE } from '../../../../../languages/en/messages';
import 'react-day-picker/lib/style.css';
import TagsSearch from '../components/TagsSearch';

function AddTaskModal(props) {
  const tasks = props.tasks.taskItems;
  const [members] = useState(props.projectMembers || props.projectMembers.members);
  const foundedMembers = [];

  // modal
  const [modal, setModal] = useState(false);
  const toggle = () => setModal(!modal);

  const [isLoading, setIsLoading] = useState(false);

  const setToggle = () => {
    try {
      props.openChild();
    } catch {}
    toggle();
  };

  // task Num
  let newNum = '1';

  // task name
  const [taskName, setTaskName] = useState('');

  // priority
  const [priority, setPriority] = useState('Primary');

  // members name
  const [memberName, setMemberName] = useState(' ');

  // resources
  const [resourceItems, setResourceItems] = useState([]);

  // assigned
  const [assigned, setAssigned] = useState(true);

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

  // Why info (Why is this task important)
  const [whyInfo, setWhyInfo] = useState('');

  // Intent info (Design intent)
  const [intentInfo, setIntentInfo] = useState('');

  // Endstate info (what it should look like when done)
  const [endstateInfo, setEndstateInfo] = useState('');

  // category
  const categoryOptions = [
    { value: 'Housing', label: 'Housing' },
    { value: 'Food', label: 'Food' },
    { value: 'Energy', label: 'Energy' },
    { value: 'Education', label: 'Education' },
    { value: 'Soceity', label: 'Soceity' },
    { value: 'Economics', label: 'Economics' },
    { value: 'Stewardship', label: 'Stewardship' },
    { value: 'Other', label: 'Other' },
  ];
  const [category, setCategory] = useState('Housing');

  // Warning
  const [dateWarning, setDateWarning] = useState(false);
  const [hoursWarning, setHoursWarning] = useState(false);

  const getNewNum = () => {
    if (tasks.length > 0) {
      if (props.taskId) {
        const childTasks = tasks.filter(task => task.mother === props.taskId);
        newNum = `${props.parentNum !== null ? `${props.parentNum}.` : ''}${childTasks.length + 1}`;
        newNum = newNum.replace(/.0/g, '');
      } else {
        newNum = `${tasks.filter(task => task.level === 1).length + 1}`;
      }
    }
  };

  const [foundMembersHTML, setfoundMembersHTML] = useState('');
  const findMembers = () => {
    const memberList = members.members ? props.projectMembers.members : members;
    console.log('findMembers', memberList);
    for (let i = 0; i < memberList.length; i++) {
      console.log('project members', memberList[i]);

      if (
        `${memberList[i].firstName} ${memberList[i].lastName}`
          .toLowerCase()
          .includes(memberName.toLowerCase())
      ) {
        foundedMembers.push(memberList[i]);
      }
    }

    const html = foundedMembers.map((elm, i) => (
      <div key={`found-member-${i}`}>
        <a href={`/userprofile/${elm._id}`} target="_blank" rel="noreferrer">
          <input
            type="text"
            className="task-resouces-input"
            value={`${elm.firstName} ${elm.lastName}`}
            disabled
          />
        </a>
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

  const removeResource = userID => {
    const removeIndex = resourceItems.map(item => item.userID).indexOf(userID);
    setResourceItems([
      ...resourceItems.slice(0, removeIndex),
      ...resourceItems.slice(removeIndex + 1),
    ]);
  };

  const addResources = (userID, first, last, profilePic) => {
    setResourceItems([
      {
        userID,
        name: `${first} ${last}`,
        profilePic,
      },
      ...resourceItems,
    ]);
  };

  // Date picker
  const FORMAT = 'MM/dd/yy';
  const formatDate = (date, format, locale) => dateFnsFormat(date, format, { locale });

  // Links
  const [link, setLink] = useState('');
  const addLink = () => {
    setLinks([...links, link]);
  };

  const removeLink = index => {
    setLinks([...links.slice(0, index), ...links.slice(index + 1)]);
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
  let parentId1 = null;
  let parentId2 = null;
  let parentId3 = null;

  if (props.level === 1) {
    parentId1 = props.taskId;
  } else if (props.level === 2) {
    parentId2 = props.taskId;
  } else if (props.level === 3) {
    parentId3 = props.taskId;
  }

  const changeDateStart = startDate => {
    setStartedDate(startDate);
    if (dueDate) {
      if (startDate > dueDate) {
        setDateWarning(true);
      } else {
        setDateWarning(false);
      }
    }
  };

  const changeDateEnd = dueDate => {
    setDueDate(dueDate);
    if (startedDate) {
      if (dueDate < startedDate) {
        setDateWarning(true);
      } else {
        setDateWarning(false);
      }
    }
  };

  const clear = () => {
    setTaskName('');
    setPriority('Primary');
    setMemberName(' ');
    setResourceItems([]);
    setAssigned(false);
    setStatus('Started');
    setHoursBest(0);
    setHoursWorst(0);
    setHoursMost(0);
    setHoursEstimate(0);
    setStartedDate('');
    setDueDate('');
    setLinks([]);
    setWhyInfo('');
    setIntentInfo('');
    setEndstateInfo('');
    setCategory('');
  };

  const paste = () => {
    taskName && setTaskName(props.tasks.copiedTask.taskName);

    if (props.tasks.copiedTask.priority === 'Secondary') {
      document.getElementById('priority').selectedIndex = 1;
    } else if (props.tasks.copiedTask.priority === 'Tertiary') {
      document.getElementById('priority').selectedIndex = 2;
    } else {
      document.getElementById('priority').selectedIndex = 0;
    }
    setPriority(props.tasks.copiedTask.priority);

    setMemberName();
    setResourceItems(props.tasks.copiedTask.resources);

    if (props.tasks.copiedTask.isAssigned === true) {
      document.getElementById('Assigned').selectedIndex = 0;
    } else {
      document.getElementById('Assigned').selectedIndex = 1;
    }
    setAssigned(props.tasks.copiedTask.isAssigned);

    // Not enough cases here
    if (props.tasks.copiedTask.status === 'Not Started') {
      document.getElementById('Status').selectedIndex = 0;
    } else {
      document.getElementById('Status').selectedIndex = 1;
    }
    setStatus(props.tasks.copiedTask.status);

    setHoursBest(props.tasks.copiedTask.hoursBest);
    setHoursWorst(props.tasks.copiedTask.hoursWorst);
    setHoursMost(props.tasks.copiedTask.hoursMost);
    setHoursEstimate(props.tasks.copiedTask.estimatedHours);

    setStartedDate(props.tasks.copiedTask.startedDatetime);
    setDueDate(props.tasks.copiedTask.dueDatetime);

    setLinks(props.tasks.copiedTask.links);
    setWhyInfo(props.tasks.copiedTask.whyInfo);
    setIntentInfo(props.tasks.copiedTask.intentInfo);
    setEndstateInfo(props.tasks.copiedTask.endstateInfo);
  };

  const addNewTask = () => {
    setIsLoading(true);

    const newTask = {
      wbsId: props.wbsId,
      taskName,
      num: newNum,
      level: newNum.length > 1 ? newNum.split('.').length : 1,
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
      mother: props.taskId,
      parentId1,
      parentId2,
      parentId3,
      position: tasks.length,
      isActive: true,
      whyInfo,
      intentInfo,
      endstateInfo,
      category,
    };

    props.addNewTask(newTask, props.wbsId);

    setTimeout(() => {
      setIsLoading(false);
      if (props.tasks.error === 'none') {
        toggle();
        getNewNum();
      }
    }, 1000);
  };

  useEffect(() => {
    if (props.level >= 1) {
      const categoryMother = props.tasks.taskItems.find(({ _id }) => _id === props.taskId).category;
      if (categoryMother) {
        setCategory(categoryMother);
      }
    } else {
      const res = props.allProjects.projects.filter(obj => obj._id === props.projectId)[0];
      setCategory(res.category);
    }
  }, [props.level]);

  getNewNum();

  return (
    <div className="controlBtn">
      <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle} className="w-100 align-items-center">
          <p className="fs-2 d-inline mr-3">Add New Task</p>
          <button
            type="button"
            size="small"
            className="btn btn-primary btn-sm margin-left"
            onClick={() => paste()}
            disabled={hoursWarning}
          >
            Paste
          </button>
          <button
            type="button"
            size="small"
            className="btn btn-danger btn-sm margin-left"
            onClick={() => clear()}
          >
            Reset
          </button>
        </ModalHeader>
        <ModalBody>
          <ReactTooltip />

          <table className="table table-bordered responsive">
            <tbody>
              <tr>
                <td scope="col" data-tip="WBS ID">
                  WBS #
                </td>
                <td scope="col">{newNum.replace(/.0/g, '')}</td>
              </tr>
              <tr>
                <td scope="col">Task Name</td>
                <td scope="col">
                  <input
                    type="text"
                    className="task-name"
                    onChange={e => setTaskName(e.target.value)}
                    onKeyPress={e => setTaskName(e.target.value)}
                    value={taskName}
                  />
                </td>
              </tr>
              <tr>
                <td scope="col">Priority</td>
                <td scope="col">
                  <select id="priority" onChange={e => setPriority(e.target.value)}>
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
                    <TagsSearch
                      placeholder="Add resources"
                      members={members.members}
                      addResources={addResources}
                      removeResource={removeResource}
                      resourceItems={resourceItems}
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <td scope="col">Assigned</td>
                <td scope="col">
                  <div className="flex-row d-inline align-items-center">
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="true"
                        name="Assigned"
                        value={true}
                        onChange={() => setAssigned(true)}
                      />
                      <label className="form-check-label" htmlFor="true">
                        Yes
                      </label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="false"
                        name="Assigned"
                        value={false}
                        onChange={() => setAssigned(false)}
                      />
                      <label className="form-check-label" htmlFor="false">
                        No
                      </label>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td scope="col">Status</td>
                <td scope="col">
                  <div className="flex-row  d-inline align-items-center">
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="started"
                        name="started"
                        value={true}
                        onChange={() => setStatus(true)}
                      />
                      <label className="form-check-label" htmlFor="started">
                        Started
                      </label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="notStarted"
                        name="started"
                        value={false}
                        onChange={() => setStatus(false)}
                      />
                      <label className="form-check-label" htmlFor="notStarted">
                        Not Started
                      </label>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td scope="col" data-tip="Hours - Best-case">
                  Hours
                </td>
                <td scope="col" data-tip="Hours - Best-case" className="w-100">
                  <div className="py-2 flex-responsive">
                    <label htmlFor="bestCase" className="text-nowrap mr-2 w-25 mr-4">
                      Best-case
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="500"
                      value={hoursBest}
                      onChange={e => setHoursBest(e.target.value)}
                      onBlur={() => calHoursEstimate()}
                      id="bestCase"
                      className="w-25"
                    />
                    <div className="warning">
                      {hoursWarning
                        ? 'Hours - Best-case < Hours - Most-case < Hours - Most-case'
                        : ''}
                    </div>
                  </div>
                  <div className="py-2 flex-responsive">
                    <label htmlFor="worstCase" className="text-nowrap mr-2  w-25 mr-4">
                      Worst-case
                    </label>
                    <input
                      type="number"
                      min={hoursBest}
                      max="500"
                      value={hoursWorst}
                      onChange={e => setHoursWorst(e.target.value)}
                      onBlur={() => calHoursEstimate('hoursWorst')}
                      className="w-25"
                    />
                    <div className="warning">
                      {hoursWarning
                        ? 'Hours - Best-case < Hours - Most-case < Hours - Most-case'
                        : ''}
                    </div>
                  </div>
                  <div className="py-2 flex-responsive">
                    <label htmlFor="mostCase" className="text-nowrap mr-2 w-25 mr-4">
                      Most-case
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="500"
                      value={hoursMost}
                      onChange={e => setHoursMost(e.target.value)}
                      onBlur={() => calHoursEstimate('hoursMost')}
                      className="w-25"
                    />
                    <div className="warning">
                      {hoursWarning
                        ? 'Hours - Best-case < Hours - Most-case < Hours - Most-case'
                        : ''}
                    </div>
                  </div>
                  <div className="py-2 flex-responsive">
                    <label htmlFor="Estimated" className="text-nowrap mr-2  w-25 mr-4">
                      Estimated
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="500"
                      value={hoursEstimate}
                      onChange={e => setHoursEstimate(e.target.value)}
                      className="w-25"
                    />
                  </div>
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
                      onChange={e => setLink(e.target.value)}
                    />
                    <button
                      className="task-resouces-btn"
                      type="button"
                      data-tip="Add Link"
                      onClick={() => addLink()}
                    >
                      <i className="fa fa-plus" aria-hidden="true" />
                    </button>
                  </div>
                  <div>
                    {links.map((link, i) =>
                      link.length > 1 ? (
                        <div key={i}>
                          <a href={link} target="_blank" rel="noreferrer">
                            {link}
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
                <td scope="col">Category</td>
                <td scope="col">
                  <select value={category} onChange={e => setCategory(e.target.value)}>
                    {categoryOptions.map(cla => (
                      <option value={cla.value} key={cla.value}>
                        {cla.label}
                      </option>
                    ))}
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
                    className="why-info form-control"
                    value={whyInfo}
                    onEditorChange={content => setWhyInfo(content)}
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
                    className="intent-info form-control"
                    value={intentInfo}
                    onEditorChange={content => setIntentInfo(content)}
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
                    className="endstate-info form-control"
                    value={endstateInfo}
                    onEditorChange={content => setEndstateInfo(content)}
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
        <ModalFooter>
          {taskName !== '' ? (
            isLoading ? (
              ' Adding...'
            ) : (
              <Button color="primary" onClick={toggle && addNewTask} disabled={hoursWarning}>
                Save
              </Button>
            )
          ) : null}
        </ModalFooter>
      </Modal>
      <Button color="primary" size="sm" onClick={setToggle}>
        Add Task
      </Button>
    </div>
  );
}

const mapStateToProps = state => state;
export default connect(mapStateToProps, {
  addNewTask,
  fetchAllTasks,
})(AddTaskModal);
