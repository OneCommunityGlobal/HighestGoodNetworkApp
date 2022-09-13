import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector, connect } from 'react-redux';
import { ModalBody } from 'reactstrap';
import ReactTooltip from 'react-tooltip';
import hasPermission from 'utils/permissions';
import { Editor } from '@tinymce/tinymce-react';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import dateFnsFormat from 'date-fns/format';
import dateFnsParse from 'date-fns/parse';


// TODO: Use react hook form

export const TaskEditSuggestionModalBodyEdit = ({taskEditSuggestion, newTask, setNewTask}) => {

  const role = [];
  const hasPermission = () => true;

  const FORMAT = 'MM/dd/yy';
  const formatDate = (date, format, locale) => dateFnsFormat(date, format, { locale });
  const parseDate = (str, format, locale) => {
    const parsed = dateFnsParse(str, format, new Date(), { locale });
    if (DateUtils.isDate(parsed)) {
      return parsed;
    }
    return undefined;
  };
  
  const [memberName, setMemberName] = useState('');
  const [dateWarning, setDateWarning] = useState(false);
  const [hoursWarning, setHoursWarning] = useState(false);
  const [foundMembersHTML, setfoundMembersHTML] = useState('');

  const findMembers = () => {
    const foundedMembers = taskEditSuggestion.projectMembers.filter((user) =>
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(memberName.toLowerCase()),
    );
    const html = foundedMembers.map((elm) => (
      <div key={elm._id}>
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
    const removeIndex = newTask.resources.map((item) => item.userID).indexOf(userID);
    setNewTask({...newTask, resources: [
      ...newTask.resources.slice(0, removeIndex),
      ...newTask.resources.slice(removeIndex + 1),
    ]});
  };

  const addResources = (userID, first, last, profilePic) => {
    const newResources = [...newTask.resources];
    newResources.push({userID, name: `${first} ${last}`, profilePic});
    setNewTask({...newTask, resources: newResources});
  };

  const [link, setLink] = useState('');
  const addLink = () => {
    setNewTask({...newTask, links: [...newTask.links, link]});
  };

  const calHoursEstimate = (isOn = null) => {
    let currHoursMost = parseInt(newTask.hoursMost);
    let currHoursWorst = parseInt(newTask.hoursWorst);
    const currHoursBest = parseInt(newTask.hoursBest);
    if (isOn !== 'hoursMost') {
      currHoursMost = Math.round((currHoursWorst - currHoursBest) / 2 + currHoursBest);
      setNewTask({...newTask, hoursMost: currHoursMost});
      if (isOn !== 'hoursWorst') {
        currHoursWorst = Math.round(currHoursBest * 2);
        setNewTask({...newTask, hoursWorst: currHoursWorst});
        currHoursMost = Math.round((currHoursWorst - currHoursBest) / 2 + currHoursBest);
        setNewTask({...newTask, hoursMost: currHoursMost});
      }
    }

    setNewTask({...newTask, estimatedHours: parseInt((currHoursMost + currHoursBest + currHoursWorst) / 3)});

    if (!(currHoursBest <= currHoursMost && currHoursMost <= currHoursWorst)) {
      setHoursWarning(true);
    } else {
      setHoursWarning(false);
    }
  };

  const changeDateStart = (startDate) => {
    setNewTask({...newTask, startedDateTime: startDate});
    if (dueDate) {
      if (startDate > dueDate) {
        setDateWarning(true);
      } else {
        setDateWarning(false);
      }
    }
  };

  const changeDateEnd = (dueDate) => {
    setNewTask({...newTask, dueDateTime: dueDate});
    if (startedDate) {
      if (dueDate < startedDate) {
        setDateWarning(true);
      } else {
        setDateWarning(false);
      }
    }
  };

  const removeLink = (index) => {
    setNewTask({...newTask, links: [...newTask.links.splice(0, index), ...newTask.links.splice(index + 1)]});
  };

  return (
    <ModalBody>
      <ReactTooltip />
      <table
        className={`table table-bordered 
        ${(hasPermission(role, 'editTask') || hasPermission(role, 'suggestTask')) ? null : 'disable-div'}`
        }
      >
        <tbody>
          <tr>
            <td scope="col">Task Name</td>
            <td scope="col">
              <input
                type="text"
                className="task-name"
                onChange={(e) => setNewTask({ ...newTask, taskName: e.target.value})}
                onKeyPress={(e) => setNewTask({ ...newTask, taskName: e.target.value})}
                value={newTask.taskName}
              />
            </td>
          </tr>
          <tr>
            <td scope="col">Priority</td>
            <td scope="col">
              <select
                id="priority"
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value})}
                value={newTask.priority}
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
                {newTask.resources && newTask.resources.map((resource) => {
                  if (!resource.profilePic) {
                    return (
                      <a
                        key={resource.userID}
                        data-tip={resource.name}
                        onClick={(e) => removeResource(resource.userID)}
                      >
                        <span className="dot">{resource.name.substring(0, 2)}</span>
                      </a>
                    );
                  }
                  return (
                    <a
                      key={resource.userID}
                      data-tip={resource.name}
                      onClick={(e) => removeResource(resource.userID)}
                    >
                      <img className="img-circle" src={resource.profilePic} />
                    </a>
                  );
                })}
              </div>
            </td>
          </tr>
          <tr>
            <td scope="col">Assigned</td>
            <td scope="col">
              <select id="Assigned" value={newTask.isAssigned} onChange={(e) => setNewTask({...newTask, isAssigned: e.target.value === 'true'})}>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </td>
          </tr>
          <tr>
            <td scope="col">Status</td>
            <td scope="col">
              <select id="Status" value={newTask.status} onChange={(e) => setNewTask({...newTask, status: e.target.value})}>
                <option value="Started">Started</option>
                <option value="Not Started">Not Started</option>
                <option value="Complete">Complete</option>
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
                value={newTask.hoursBest}
                onChange={(e) => setNewTask({...newTask, hoursBest: e.target.value})}
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
                min={newTask.hoursBest}
                max="500"
                value={newTask.hoursWorst}
                onChange={(e) => setNewTask({...newTask, hoursWorst: e.target.value})}
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
                value={newTask.hoursMost}
                onChange={(e) => setNewTask({...newTask, hoursMost: e.target.value})}
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
                value={newTask.estimatedHours}
                onChange={(e) => setNewTask({...newTask, estimatedHours: e.target.value})}
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
                {newTask.links && newTask.links.map((link, i) =>
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
                value={newTask.classification}
                onChange={(e) => setNewTask({...newTask, classification: e.target.value})}
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
                value={newTask.whyInfo}
                onEditorChange={(content) => setNewTask({...newTask, whyInfo: content})}
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
                value={newTask.intentInfo}
                onEditorChange={(content) => setNewTask({...newTask, intentInfo: content})}
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
                value={newTask.endstateInfo}
                onEditorChange={(content) => setNewTask({...newTask, endstateInfo: content})}
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
                  onDayChange={(day, mod, input) => setNewTask({...newTask, startedDatetime: input.state.value})}
                  value={newTask.startedDatetime}
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
                onDayChange={(day, mod, input) => setNewTask({...newTask, dueDatetime: input.state.value})}
                value={newTask.dueDatetime}
              />

              <div className="warning">
                {dateWarning ? DUE_DATE_MUST_GREATER_THAN_START_DATE : ''}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </ModalBody>)
}