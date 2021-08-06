import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import {
  Form,
  FormGroup,
  Label,
  Input,
  Row,
  Col,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import moment from 'moment';
import _ from 'lodash';
import { Editor } from '@tinymce/tinymce-react';
import ReactTooltip from 'react-tooltip';
import { postTimeEntry, editTimeEntry } from '../../actions/timeEntries';
import { getUserProjects } from '../../actions/userProjects';
import { stopTimer } from '../../actions/timer';

const TimeEntryForm = ({
  userId, edit, data, isOpen, toggle, timer, userProfile, resetTimer, isInTangible = false
}) => {
  const fromTimer = !_.isEmpty(timer);
  const [isSubmitting, setSubmitting] = useState(false);
  const initialState = {
    dateOfWork: moment().format('YYYY-MM-DD'),
    hours: 0,
    minutes: 0,
    projectId: '',
    notes: '',
    isTangible: !isInTangible,
  };
  const initialReminder = {
    notification: false,
    has_link: data && data.notes && data.notes.includes('http') ?  true : false,
    remind: '',
    num_words: data && data.notes && data.notes.split(' ').length > 10 ? 10 : 0,
    edit_count: data ? data.editCount : 0,
    edit_notice: true,
  };

  const initialInfo = {
    in: false,
    information: '',
  };
  const isDisabled = data ? data.disabled : false;
  let [inputs, setInputs] = useState(edit ? data : initialState);
  const [errors, setErrors] = useState({});
  let [close, setClose] = useState(false);
  const dispatch = useDispatch();
  const history = useHistory();
  const [reminder, setReminder] = useState(initialReminder);
  const [inform, setInfo] = useState(initialInfo);
  const [openTangibleInfo, setTangibleInfo] = useState(false);
  const tangibleInfoToggle = (e) => { e.preventDefault(); setTangibleInfo(!openTangibleInfo) };



  useEffect(() => {
    //this to make sure that the form is cleared before closing
    if (close && inputs.projectId == '') {
      //double make sure close is set to false to stop form from reclosing on open
      close = false;
      setClose((close)=>{
        setTimeout(function myfunc() {
          toggle();
        }, 100);
        return false
      });
    }
  }, [close, inputs])

  useEffect(() => {
    
  }, [inputs])

  const openModal = () => setReminder(reminder => ({
    ...reminder,
    notification: !reminder.notification,
  }));

  const openInfo = () => {
    const str = `This is the One Community time clock! It is used to clock in and out when doing your volunteer work with One Community. Whenever you stop this timer, it will ask you to log your time to a “Project/Task” list that is specific to you. 

    Because you log time to specific tasks, it is important that you start the timer when you start work on a task and stop it when you finish work on that task. If working on multiple tasks, you should log your time (stop the timer) when completing each task for the day and clock in separately (start a new timer) when starting your other task. 

    * What About Breaks: If taking a break, you can pause the timer by closing it or clicking the “pause” button. 
    * Timer Must Remain Open: The timer must remain open while you work. Closing the window, power outages, etc. will pause the timer. 
    * Log Your Time Daily: You must log your time daily. The timer will automatically stop and request you log your time if left running for more than 10 hours. 
    * Editing Your Time: Your time can be edited same-day if you make a mistake using it, but repeated edits will result in blue squares being issued. So please use the timer correctly. 
    * Project/Task: Your Project or Task list includes the project(s) and/or task(s) you’ve been assigned to work on. Please log your time only to the correct task. 
    * Notes: The “Notes” section is where you write a summary of what you did during the time you are about to log. You must write a minimum of 10 words because we want you to be specific. You must include a link to your work so others can easily confirm and review it. 
    * Tangible Time: By default, the “Tangible” box is clicked. Tangible time is any time spent working on your Projects/Tasks and counts towards your committed time for the week and also the time allocated for your task. 
    * Intangible Time: Clicking the Tangible box OFF will mean you are logging “Intangible Time.” This is for time not related to your tasks OR for time you need a manager to change to “Tangible” for you because you were working away from your computer or made a mistake and are trying to manually log time. Intangible time will not be counted towards your committed time for the week or your tasks. “Intangible” time changed by a manager to “Tangible” time WILL be counted towards your committed time for the week and whatever task it is logged towards. For Blue Square purposes, changing Intangible Time to Tangible Time for any reason other than work away from your computer will count and be recorded in the system the same as a time edit. `;

    const newstr = str.split('\n').map((item, i) => <p key={i}>{item}</p>);
    setInfo(info => ({
      ...info,
      in: !info.in,
      information: newstr,
    }));
  };

  const cancelChange = () => {
    setReminder(reminder => ({
      ...reminder,
      notification: !reminder.notification,
    }));
    setInputs(inputs => ({
      ...inputs,
      hours: data.hours,
      minutes: data.minutes,
    }));
  };

  useEffect(() => {
    const fetchProjects = async (userId) => {
      await dispatch(getUserProjects(userId));
    };
    fetchProjects(userId);
  }, [userId, dispatch]);

  useEffect(() => {
    setInputs({ ...inputs, ...timer });
  }, [timer]);

  const userprofile = useSelector(state => state.userProfile);
  const projects = (userprofile && userprofile.projects) ? userprofile.projects : [];
  const projectOptions = projects.map(project => (
    <option value={project._id} key={project._id}>
      {' '}
      {project.projectName}
      {' '}
    </option>
  ));
  projectOptions.unshift(
    <option value="" key="none" disabled>
      Select Project/Task
    </option>,
  );

  const getEditMessage = (editCount) => {
    if (editCount < 4) {
      return 'You are about to edit your time, if you do this your manager will be notified you’ve edited it. '
        + 'The system automatically tracks how many times you’ve edited your time and will issue blue squares if you edit it repeatedly. '
        + 'Please use the timer properly so your time is logged accurately.';
    } else if (editCount === 4) {
      return 'You’ve edited your time 3 times already as a member of the team, are you sure you want to edit it again? '
        + 'Editing your time more than 5 times in a calendar year will result in you receiving a blue square.';
    } else if (editCount === 5) {
      return 'Heads up this is your fifth and final time being allowed to edit your time without receiving a blue square. '
        + 'Please use the timer properly from this point forward if you’d like to avoid receiving one.';
    } else if ((editCount - 5) % 2 === 1) {
      return `Heads up this is your ${reminder.edit_count}th time editing your recorded time. `
        + 'The next time you do this, you will receive a blue square. Please use the timer properly from this point forward to avoid this.';
    }
  }

  const validateForm = (isTimeModified) => {
    const result = {};

    if (inputs.dateOfWork === '') {
      result.dateOfWork = 'Date is required';
    } else {
      const date = moment(inputs.dateOfWork);
      if (!date.isValid()) {
        result.dateOfWork = 'Invalid date';
      }
    }

    if (inputs.hours === '' && inputs.minutes === '') {
      result.time = 'Time is required';
    } else {
      const hours = inputs.hours === '' ? 0 : inputs.hours * 1;
      const minutes = inputs.minutes === '' ? 0 : inputs.minutes * 1;
      if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
        result.time = 'Hours and minutes should be integers';
      }
      if (hours < 0 || minutes < 0 || (hours === 0 && minutes === 0)) {
        result.time = 'Time should be greater than 0';
      }
    }

    if (inputs.projectId === '') {
      result.projectId = 'Project/Task is required';
    }

    if (reminder.num_words < 10) {
      openModal();
      setReminder(reminder => ({
        ...reminder,
        remind:
          'Please write a more detailed description of your work completed, write at least 1-2 sentences.',
      }));
      result.notes = 'Description and reference link are required';
    }

    if (reminder.num_words >= 10 && !reminder.has_link) {
      openModal();
      setReminder(reminder => ({
        ...reminder,
        remind:
          'Do you have a link to your Google Doc or other place to review this work? You should add it if you do. (Note: Please include http[s]:// in your URL)',
      }));
      result.notes = 'Description and reference link are required';
    }

    if (!isAdmin && inputs.isTangible && isTimeModified && reminder.edit_notice ) {
      openModal();
      setReminder(reminder => ({
        ...reminder,
        remind: `Heads up this is your ${reminder.edit_count}th time editing your recorded time and this edit will make you receive a blue square. Please use the timer properly from this point forward to avoid receiving additional blue squares.`,
        remind: getEditMessage(reminder.edit_count),
        edit_notice: !reminder.edit_notice,
      }));
      return false;
    }

    setErrors(result);
    return _.isEmpty(result);
  };



  const handleSubmit = async (event) => {

    //Validation and variable initialization
    if (event) event.preventDefault();
    if (isSubmitting) return;
    setSubmitting(true);

    const hours = inputs.hours || 0;
    const minutes = inputs.minutes || 0;
    const isTimeModified = edit && (data.hours !== hours || data.minutes !== minutes);

    if (!validateForm(isTimeModified)) return;

    //Construct the timeEntry object
    const timeEntry = {
      personId: userId,
      dateOfWork: inputs.dateOfWork,
      projectId: inputs.projectId,
      notes: inputs.notes,
      isTangible: inputs.isTangible.toString(),
      editCount: (!isAdmin && isTimeModified && inputs.isTangible) ? reminder.edit_count + 1 : reminder.edit_count
    };

    if(edit) {
      timeEntry.hours = hours;
      timeEntry.minutes = minutes;
    } else {
      timeEntry.timeSpent = `${hours}:${minutes}:00`;
    }

    //Send the time entry to the server

    let timeEntryStatus;

    if (edit) {

        if(!reminder.notice) {
          timeEntryStatus = await dispatch(editTimeEntry(data._id, timeEntry));
        }

    } else {
      timeEntryStatus = await dispatch(postTimeEntry(timeEntry));
    }
    
    setSubmitting(false);

    if(timeEntryStatus !== 200) {
      //toggle();
      alert(`An error occurred while attempting to submit your time entry. Error code: ${timeEntryStatus}`);
      return;
    }

    if (fromTimer) {

        const timerStatus = await dispatch(stopTimer(userId));
        clearForm(true);
        if (timerStatus === 200 || timerStatus === 201) {
          resetTimer();
        } else {
          alert("Your time entry was successfully recorded, but an error occurred while asking the server to reset your timer. There is no need to submit your hours a second time, and doing so will result in a duplicate time entry.")
        }

    } else if (!reminder.notice) {
      setReminder(reminder => ({
        ...reminder,
        edit_count: timeEntry.editCount,
        edit_notice: !reminder.edit_notice,
      }));
      toggle();
    } else if (!isTimeModified) {
      toggle();
    }
  };



  const handleInputChange = (event) => {
    event.persist();
    setInputs(inputs => ({
      ...inputs,
      [event.target.name]: event.target.value,
    }));
  };

  const handleHHInputChange = (event) => {
    event.persist();
    if (event.target.value < 0 || event.target.value > 40) {
      return
    }
    setInputs(inputs => ({
      ...inputs,
      [event.target.name]: event.target.value,
    }));
  };

  const handleMMInputChange = (event) => {
    event.persist();
    if (event.target.value < 0 || event.target.value > 59) {
      return
    }
    setInputs(inputs => ({
      ...inputs,
      [event.target.name]: event.target.value,
    }));
  };

  const handleEditorChange = (content, editor) => {
    inputs.notes = content;
    const { wordcount } = editor.plugins;

    setInputs(inputs => ({ ...inputs, [editor.id]: content }));
    setReminder(reminder => ({
      ...reminder,
      num_words: wordcount.body.getWordCount(),
      has_link: inputs.notes.indexOf('http://') > -1 || inputs.notes.indexOf('https://') > -1,
    }));
  };

  const handleCheckboxChange = (event) => {
    event.persist();
    setInputs(inputs => ({
      ...inputs,
      [event.target.name]: event.target.checked,
    }));
  };

  const clearForm = (closed = false) => {
    if (closed) {
      //make sure form clears before close
      inputs = {...initialState};
      setClose(true);
    }
    setInputs({...initialState});
    setReminder({...initialReminder});
    setErrors({});
  };

  const isAdmin = useSelector(state => state.auth.user.role) === 'Administrator';

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>
        <div>
          {edit ? 'Edit ' : 'Add '}
          Time Entry &nbsp;
          <i
            className="fa fa-info-circle"
            data-tip
            data-for="registerTip"
            aria-hidden="true"
            title="timeEntryTip"
            // style={{ 'text-align': 'center' }}
            onClick={openInfo}
          />
        </div>
        <ReactTooltip id="registerTip" place="bottom" effect="solid">
          Click this icon to learn about this time entry form
        </ReactTooltip>
      </ModalHeader>
      <ModalBody>
        <Form>
          <FormGroup>
            <Label for="dateOfWork">Date</Label>
            {isAdmin && !fromTimer ? (
              <Input
                type="date"
                name="dateOfWork"
                id="dateOfWork"
                value={inputs.dateOfWork}
                onChange={handleInputChange}
              />
            ) : (
                <Input
                  type="date"
                  name="dateOfWork"
                  id="dateOfWork"
                  value={inputs.dateOfWork}
                  disabled
                />
              )}
            {'dateOfWork' in errors && (
              <div className="text-danger">
                <small>{errors.dateOfWork}</small>
              </div>
            )}
          </FormGroup>
          <FormGroup>
            <Label for="timeSpent">Time (HH:MM)</Label>
            <Row form>
              <Col>
                <Input
                  type="number"
                  name="hours"
                  id="hours"
                  min={0}
                  max={40}
                  placeholder="Hours"
                  value={inputs.hours}
                  onChange={handleHHInputChange}
                  disabled={fromTimer}
                />
              </Col>
              <Col>
                <Input
                  type="number"
                  name="minutes"
                  id="minutes"
                  min={0}
                  max={59}
                  placeholder="Minutes"
                  value={inputs.minutes}
                  onChange={handleMMInputChange}
                  disabled={fromTimer}
                />
              </Col>
            </Row>
            {'time' in errors && (
              <div className="text-danger">
                <small>{errors.time}</small>
              </div>
            )}
          </FormGroup>
          <FormGroup>
            <Label for="project">Project/Task</Label>
            <Input
              type="select"
              name="projectId"
              id="projectId"
              value={inputs.projectId}
              onChange={handleInputChange}

            >
              {projectOptions}
            </Input>
            {'projectId' in errors && (
              <div className="text-danger">
                <small>{errors.projectId}</small>
              </div>
            )}
          </FormGroup>
          <FormGroup>
            <Label for="notes">Notes</Label>
            <Editor
              init={{
                menubar: false,
                placeholder: 'Description (10-word minimum) and reference link',
                plugins:
                  'advlist autolink autoresize lists link charmap table paste help wordcount',
                toolbar:
                  'bold italic underline link removeformat | bullist numlist outdent indent |\
                                    styleselect fontsizeselect | table| strikethrough forecolor backcolor |\
                                    subscript superscript charmap  | help',
                branding: false,
                min_height: 180,
                max_height: 300,
                autoresize_bottom_margin: 1,
              }}
              id="notes"
              name="notes"
              className="form-control"
              value={inputs.notes}
              onEditorChange={handleEditorChange}
            />

            {'notes' in errors && (
              <div className="text-danger">
                <small>{errors.notes}</small>
              </div>
            )}
          </FormGroup>
          <FormGroup check>
            <Label check>
              {isAdmin ? (
                <Input
                  type="checkbox"
                  name="isTangible"
                  checked={inputs.isTangible}
                  onChange={handleCheckboxChange}
                />
              ) : (
                  <Input type="checkbox" name="isTangible" checked={inputs.isTangible} disabled />
                )}{' '}
              Tangible&nbsp;<i
                className="fa fa-info-circle"
                data-tip
                data-for="tangibleTip"
                aria-hidden="true"
                title="tangibleTip"
                // style={{ 'text-align': 'center' }}
                onClick={tangibleInfoToggle}
              />
              <ReactTooltip id="tangibleTip" place="bottom" effect="solid">
                Click this icon to learn about tangible and intangible time.
              </ReactTooltip>
            </Label>
          </FormGroup>
        </Form>

        <Modal isOpen={reminder.notification} toggle={openModal}>
          <ModalHeader>Reminder</ModalHeader>
          <ModalBody>{reminder.remind}</ModalBody>
          <ModalFooter>
            <Button onClick={openModal} color="primary">
              Close
            </Button>
            {edit && (data.hours !== inputs.hours || data.minutes !== inputs.minutes) && (
              <Button onClick={cancelChange} color="secondary">
                Cancel
              </Button>
            )}
          </ModalFooter>
        </Modal>
        <Modal isOpen={inform.in} toggle={openInfo}>
          <ModalHeader>Info</ModalHeader>
          <ModalBody>{inform.information}</ModalBody>
          <ModalFooter>
            <Button onClick={openInfo} color="primary">
              Close
            </Button>
            {isAdmin && (
              <Button onClick={openInfo} color="secondary">
                Edit
              </Button>
            )}
          </ModalFooter>
        </Modal>
        <Modal isOpen={openTangibleInfo} toggle={tangibleInfoToggle}>
          <ModalHeader>Info</ModalHeader>
          <ModalBody><p>Intangible time is time logged to items not related to your specific action items OR for time that needs to be manually changed to tangible time by an Admin (e.g. work away from your computer). In the case of the latter, be sure to email your Admin your change request.</p></ModalBody>
          <ModalFooter>
            <Button onClick={tangibleInfoToggle} color="primary">
              Close
            </Button>
            {isAdmin && (
              <Button onClick={tangibleInfoToggle} color="secondary">
                Edit
              </Button>
            )}
          </ModalFooter>
        </Modal>
      </ModalBody>
      <ModalFooter>
        <small className="mr-auto text-secondary">* All the fields are required</small>
        <Button onClick={() => clearForm()} color="danger">
          {' '}
          Clear Form
          {' '}
        </Button>
        <Button color="primary" disabled={isSubmitting} onClick={handleSubmit}>
          {edit ? 'Save' : 'Submit'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default TimeEntryForm;
