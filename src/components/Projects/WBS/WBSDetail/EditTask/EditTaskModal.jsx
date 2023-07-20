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
import hasPermission from 'utils/permissions';
import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';
import TagsSearch from '../components/TagsSearch';
import { boxStyle } from 'styles';
import { toast } from 'react-toastify';

const EditTaskModal = props => {
  const [role] = useState(props.auth ? props.auth.user.role : null);
  const userPermissions = props.auth.user?.permissions?.frontPermissions;
  const { roles } = props.role;

  const [members] = useState(props.projectMembers || props.projectMembers.members);
  let foundedMembers = [];

  // get this task by id
  const [thisTask, setThisTask] = useState();
  const [oldTask, setOldTask] = useState();
  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        const res = await axios.get(ENDPOINTS.GET_TASK(props.taskId));
        setThisTask(res?.data || {});
        setOldTask(res?.data || {});
        setCategory(res.data.category);
        setAssigned(res.data.isAssigned);
      } catch (error) {
        console.log(error);
      }
    };
    fetchTaskData();
  }, [props.taskId]);

  // modal
  const [modal, setModal] = useState(false);
  const toggle = () => setModal(!modal);

  // task name
  const [taskName, setTaskName] = useState(thisTask?.taskName);

  // priority
  const [priority, setPriority] = useState(thisTask?.priority);

  // members name
  const [memberName, setMemberName] = useState('');
  // resources
  const [resourceItems, setResourceItems] = useState(thisTask?.resources);

  // assigned
  const [assigned, setAssigned] = useState(false);

  // status
  const [status, setStatus] = useState('false');

  // hour best
  const [hoursBest, setHoursBest] = useState(thisTask?.hoursBest);
  // hour worst
  const [hoursWorst, setHoursWorst] = useState(thisTask?.hoursWorst);
  // hour most
  const [hoursMost, setHoursMost] = useState(thisTask?.hoursMost);
  // hour estimate
  const [hoursEstimate, setHoursEstimate] = useState(thisTask?.estimatedHours);
  //deadline count
  const [deadlineCount, setDeadlineCount] = useState(thisTask?.deadlineCount);
  // hours warning
  const [hoursWarning, setHoursWarning] = useState(false);

  // links
  const [links, setLinks] = useState(thisTask?.links);

  // Category
  const [category, setCategory] = useState(thisTask?.category);

  // Why info (Why is this task important)
  const [whyInfo, setWhyInfo] = useState(thisTask?.whyInfo);
  // Intent info (Design intent)
  const [intentInfo, setIntentInfo] = useState(thisTask?.intentInfo);
  // Endstate info (what it should look like when done)
  const [endstateInfo, setEndstateInfo] = useState(thisTask?.endstateInfo);

  // started date
  const [startedDate, setStartedDate] = useState(thisTask?.startedDatetime);
  // due date
  const [dueDate, setDueDate] = useState(thisTask?.dueDatetime);
  // date warning
  const [dateWarning, setDateWarning] = useState(false);

  // associate states with thisTask state
  useEffect(() => {
    setTaskName(thisTask?.taskName);
    setPriority(thisTask?.priority);
    setResourceItems(thisTask?.resources);
    setAssigned(thisTask?.isAssigned || false);
    setStatus(thisTask?.status || false);
    setHoursBest(thisTask?.hoursBest);
    setHoursWorst(thisTask?.hoursWorst);
    setHoursMost(thisTask?.hoursMost);
    setHoursEstimate(thisTask?.estimatedHours);
    setDeadlineCount(thisTask?.deadlineCount);
    setLinks(thisTask?.links);
    setCategory(thisTask?.category);
    setWhyInfo(thisTask?.whyInfo);
    setIntentInfo(thisTask?.intentInfo);
    setEndstateInfo(thisTask?.endstateInfo);
    setStartedDate(thisTask?.startedDatetime);
    setDueDate(thisTask?.dueDatetime);
  }, [thisTask]);

  const removeResource = userID => {
    const removeIndex = resourceItems.map(item => item.userID).indexOf(userID);
    setResourceItems([
      ...resourceItems.slice(0, removeIndex),
      ...resourceItems.slice(removeIndex + 1),
    ]);
  };

  const res = [...(resourceItems ? resourceItems : [])];
  const addResources = (userID, first, last, profilePic) => {
    res.push({
      userID,
      name: `${first} ${last}`,
      profilePic,
    });
    setResourceItems([...(res ? res : [])]);
  };

  // helper for hours estimate calculation
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

  // helpers for add/remove links
  const [link, setLink] = useState('');
  const addLink = () => {
    setLinks([...links, link]);
  };
  const removeLink = index => {
    setLinks([...links.splice(0, index), ...links.splice(index + 1)]);
  };

  // helpers for change start/end date
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
  // helper for date picker
  const FORMAT = 'MM/dd/yy';
  const formatDate = (date, format, locale) => dateFnsFormat(date, format, { locale });
  const parseDate = (str, format, locale) => {
    const parsed = dateFnsParse(str, format, new Date(), { locale });
    if (DateUtils.isDate(parsed)) {
      return parsed;
    }
    return undefined;
  };

  // helper for updating task
  const updateTask = async () => {
    let newDeadlineCount = deadlineCount;
    if (thisTask?.estimatedHours !== hoursEstimate) {
      newDeadlineCount = deadlineCount + 1;
      setDeadlineCount(newDeadlineCount);
    }

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
      deadlineCount: parseFloat(newDeadlineCount),
      startedDatetime: startedDate,
      dueDatetime: dueDate,
      links,
      whyInfo,
      intentInfo,
      endstateInfo,
      category,
    };

    await props.updateTask(
      props.taskId,
      updatedTask,
      hasPermission(role, 'editTask', roles, userPermissions),
      oldTask,
    );
    await props.fetchAllTasks(props.wbsId);

    if (props.tasks.error === 'none' || Object.keys(props.tasks.error).length === 0) {
      window.location.reload();
    } else {
      toast.error('Update failed! Error is ' + props.tasks.error);
    }
  };

  const handleAssign = value => {
    setAssigned(value);
  };

  const handleStatus = value => {
    setStatus(value);
  };

  return (
    <div className="controlBtn">
      <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>
          {hasPermission(role, 'editTask', roles, userPermissions)
            ? 'Edit'
            : hasPermission(role, 'suggestTask', roles, userPermissions)
            ? 'Suggest'
            : 'View'}
        </ModalHeader>
        <ModalBody>
          <ReactTooltip />
          <table
            className={`table table-bordered responsive
            ${
              hasPermission(role, 'editTask', roles, userPermissions) ||
              hasPermission(role, 'suggestTask', roles, userPermissions)
                ? null
                : 'disable-div'
            }`}
          >
            <tbody>
              <tr>
                <td scope="col" data-tip="task ID">
                  Task #
                </td>
                <td scope="col">{thisTask?.num}</td>
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
                  <select
                    id="priority"
                    onChange={e => setPriority(e.target.value)}
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
                        value="true"
                        onChange={e => handleAssign(true)}
                        checked={assigned}
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
                        value="false"
                        onChange={e => handleAssign(false)}
                        checked={!assigned}
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
                        value="true"
                        onChange={e => handleStatus('true')}
                        checked={status === 'true' ? true : false}
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
                        value="false"
                        onChange={e => handleStatus('false')}
                        checked={status === 'false' ? true : false}
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
                      onClick={addLink}
                    >
                      <i className="fa fa-plus" aria-hidden="true" />
                    </button>
                  </div>
                  <div>
                    {links?.map((link, i) =>
                      link.length > 1 ? (
                        <div key={i} className="task-link">
                          <a href={link} target="_blank" rel="noreferrer">
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
                <td scope="col">Category</td>
                <td scope="col">
                  <select
                    value={category}
                    onChange={e => {
                      setCategory(e.target.value);
                    }}
                  >
                    <option value="Housing">Housing</option>
                    <option value="Food">Food</option>
                    <option value="Energy">Energy</option>
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
        {hasPermission(role, 'editTask', roles, userPermissions) ||
        hasPermission(role, 'suggestTask', roles, userPermissions) ? (
          <ModalFooter>
            {taskName !== '' && startedDate !== '' && dueDate !== '' ? (
              <Button color="primary" onClick={updateTask} style={boxStyle}>
                Update
              </Button>
            ) : null}
            <Button color="secondary" onClick={toggle} style={boxStyle}>
              Cancel
            </Button>
          </ModalFooter>
        ) : null}
      </Modal>
      <Button color="primary" size="sm" onClick={toggle} style={boxStyle}>
        {hasPermission(role, 'editTask', roles, userPermissions)
          ? 'Edit'
          : hasPermission(role, 'suggestTask', roles, userPermissions)
          ? 'Suggest'
          : 'View'}
      </Button>
    </div>
  );
};

const mapStateToProps = state => state;
export default connect(mapStateToProps, {
  updateTask,
  fetchAllTasks,
})(EditTaskModal);
