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
// import ReactHtmlParser from 'react-html-parser'
import ReactTooltip from 'react-tooltip';
import { postTimeEntry, editTimeEntry } from '../../actions/timeEntries';
import { getUserProjects } from '../../actions/userProjects';
import { updateUserProfile } from '../../actions/userProfile';
import { stopTimer } from '../../actions/timer';

const TimeEntryForm = ({ userId, edit, data, isOpen, toggle, timer, userProfile }) => {
  const fromTimer = !_.isEmpty(timer);

  const initialState = {
    dateOfWork: moment().format('YYYY-MM-DD'),
    hours: 0,
    minutes: 0,
    projectId: '',
    notes: '',
    isTangible: data ? data.isTangible : true,
  };
  const initialReminder = {
    notification: false,
    has_link: !!data,
    remind: '',
    num_words: data ? 10 : 0,
    edit_count: data ? data.editCount : 0,
    edit_notice: true,
  };

  const initialInfo = {
    in: false,
    information: '',
  };

  const [inputs, setInputs] = useState(edit ? data : initialState);
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const history = useHistory();
  const [reminder, setReminder] = useState(initialReminder);
  const [inform, setInfo] = useState(initialInfo);

  const openModal = () =>
    setReminder((reminder) => ({
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
    setInfo((info) => ({
      ...info,
      in: !info.in,
      information: newstr,
    }));
  };

  const cancelChange = () => {
    setReminder((reminder) => ({
      ...reminder,
      notification: !reminder.notification,
    }));
    setInputs((inputs) => ({
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
  }, [userId]);

  useEffect(() => {
    setInputs({ ...inputs, ...timer });
  }, [timer]);

  const userProjects = useSelector((state) => state.userProjects);
  let projects = [];
  if (!_.isEmpty(userProjects)) {
    projects = userProjects.projects;
  }
  const projectOptions = projects.map((project) => (
    <option value={project.projectId} key={project.projectId}>
      {' '}
      {project.projectName}{' '}
    </option>
  ));
  projectOptions.unshift(
    <option value="" key="" disabled>
      Select Project/Task
    </option>,
  );

  const validateForm = (edittime) => {
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
      setReminder((reminder) => ({
        ...reminder,
        remind:
          'Please write a more detailed description of your work completed, write at least 1-2 sentences.',
      }));
      result.notes = 'Description and reference link are required';
    }

    if (reminder.num_words >= 10 && !reminder.has_link) {
      openModal();
      setReminder((reminder) => ({
        ...reminder,
        remind:
          'Do you have a link to your Google Doc or other place to review this work? You should add it if you do.',
      }));
      result.notes = 'Description and reference link are required';
    }

    if (edit && reminder.edit_notice && reminder.edit_count < 4 && edittime) {
      openModal();
      setReminder((reminder) => ({
        ...reminder,
        remind:
          'You are about to edit your time, if you do this your manager will be notified you’ve edited it. The system automatically tracks how many times you’ve edited your time and will issue blue squares if you edit it repeatedly. Please use the timer properly so your time is logged accurately.',
        edit_notice: !reminder.edit_notice,
      }));
      return false;
    }

    if (edit && reminder.edit_notice && reminder.edit_count == 4 && edittime) {
      openModal();
      setReminder((reminder) => ({
        ...reminder,
        remind:
          'You’ve edited your time 3 times already as a member of the team, are you sure you want to edit it again? Editing your time more than 5 times in a calendar year will result in you receiving a blue square.',
        edit_notice: !reminder.edit_notice,
      }));
      return false;
    }

    if (edit && reminder.edit_notice && reminder.edit_count == 5 && edittime) {
      openModal();
      setReminder((reminder) => ({
        ...reminder,
        remind:
          'Heads up this is your fifth and final time being allowed to edit your time without receiving a blue square. Please use the timer properly from this point forward if you’d like to avoid receiving one.',
        edit_notice: !reminder.edit_notice,
      }));
      return false;
    }
    if (edit && reminder.edit_notice && (reminder.edit_count - 5) % 2 == 1 && edittime) {
      openModal();
      setReminder((reminder) => ({
        ...reminder,
        remind: `Heads up this is your ${reminder.edit_count}th time editing your recorded time. The next time you do this, you will receive a blue square. Please use the timer properly from this point forward to avoid this.`,
        edit_notice: !reminder.edit_notice,
      }));
      return false;
    }

    if (edit && reminder.edit_notice && (reminder.edit_count - 5) % 2 == 0 && edittime) {
      openModal();
      setReminder((reminder) => ({
        ...reminder,
        remind: `Heads up this is your ${reminder.edit_count}th time editing your recorded time and this edit will make you receive a blue square. Please use the timer properly from this point forward to avoid receiving additional blue squares.`,
        edit_notice: !reminder.edit_notice,
      }));
      return false;
    }

    setErrors(result);
    return _.isEmpty(result);
  };

  const handleSubmit = async (event) => {
    if (event) {
      event.preventDefault();
    }

    const hours = inputs.hours === '' ? '0' : inputs.hours;
    const minutes = inputs.minutes === '' ? '0' : inputs.minutes;

    const edittime = edit && (data.hours != hours || data.minutes != minutes);

    if (!validateForm(edittime)) {
      return;
    }
    const timeEntry = {};
    timeEntry.personId = userId;
    timeEntry.dateOfWork = inputs.dateOfWork;

    timeEntry.projectId = inputs.projectId;
    timeEntry.notes = inputs.notes;
    timeEntry.isTangible = inputs.isTangible.toString();

    let status;
    if (edit) {
      if (edittime) {
        timeEntry.editCount = reminder.edit_count + 1;
      }
      timeEntry.hours = hours;
      timeEntry.minutes = minutes;
      if (!edittime || !reminder.notice) {
        status = await dispatch(editTimeEntry(data._id, timeEntry));
      }
    } else {
      timeEntry.timeSpent = `${hours}:${minutes}:00`;
      status = await dispatch(postTimeEntry(timeEntry));
    }
    let deltatime;
    if (edit) {
      deltatime = (
        hours -
        parseInt(data.hours, 10) +
        (parseInt(minutes, 10) - parseInt(data.minutes, 10)) / 60
      ).toFixed(2);
    } else {
      deltatime = (parseInt(hours, 10) + parseInt(minutes, 10) / 60).toFixed(2);
    }

    const totalTime = parseInt(userProfile.totalComittedHours, 10) + parseInt(deltatime, 10);
    console.log(totalTime);
    const updatedUserprofile = {
      ...userProfile,
      totalComittedHours: totalTime,
    };
    await dispatch(updateUserProfile(userProfile._id, updatedUserprofile));
    // console.log('kkk')
    if (fromTimer) {
      if (status === 200) {
        const timerStatus = await dispatch(stopTimer(userId));
        if (timerStatus === 200 || timerStatus === 201) {
          setInputs((inputs) => initialState);
          setReminder((reminder) => initialReminder);
          toggle();
        }
        history.push(`/timelog/${userId}`);
      }
    } else if (!edit) {
      setInputs((inputs) => initialState);
      setReminder((reminder) => initialReminder);
      toggle();
    } else if (!reminder.notice && edittime) {
      setReminder((reminder) => ({
        ...reminder,
        edit_count: reminder.edit_count + 1,
        edit_notice: !reminder.edit_notice,
      }));
      toggle();
    } else if (!edittime) {
      // setReminder(reminder => initialReminder)
      // console.log('kkkkkkkkk')
      toggle();
    }
  };

  const handleInputChange = (event) => {
    event.persist();
    setInputs((inputs) => ({
      ...inputs,
      [event.target.name]: event.target.value,
    }));
  };

  const handleEditorChange = (content, editor) => {
    const { wordcount } = editor.plugins;

    setInputs((inputs) => ({ ...inputs, [editor.id]: content }));
    setReminder((reminder) => ({
      ...reminder,
      num_words: wordcount.body.getWordCount(),
      has_link: inputs.notes.indexOf('http://') > -1 || inputs.notes.indexOf('https://') > -1,
    }));
  };

  const handleCheckboxChange = (event) => {
    event.persist();
    setInputs((inputs) => ({
      ...inputs,
      [event.target.name]: event.target.checked,
    }));
  };

  const clearForm = (event) => {
    setInputs((inputs) => initialState);
    setReminder((reminder) => initialReminder);
    setErrors((errors) => ({}));
  };

  const isAdmin = useSelector((state) => state.auth.user.role) === 'Administrator';

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>
        <div>
          {edit ? 'Edit ' : 'Add '}
          Time Entry
          <i
            className="fa fa-info-circle"
            data-tip
            data-for="registerTip"
            aria-hidden="true"
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
                  placeholder="Hours"
                  value={inputs.hours}
                  onChange={handleInputChange}
                  disabled={fromTimer}
                />
              </Col>
              <Col>
                <Input
                  type="number"
                  name="minutes"
                  id="minutes"
                  placeholder="Minutes"
                  value={inputs.minutes}
                  onChange={handleInputChange}
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
                placeholder: 'Description and reference link',
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
              {isAdmin || !edit ? (
                <Input
                  type="checkbox"
                  name="isTangible"
                  checked={inputs.isTangible}
                  onChange={handleCheckboxChange}
                />
              ) : (
                <Input type="checkbox" name="isTangible" checked={inputs.isTangible} disabled />
              )}{' '}
              Tangible
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
            {edit && (data.hours != inputs.hours || data.minutes != inputs.minutes) && (
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
      </ModalBody>
      <ModalFooter>
        <small className="mr-auto text-secondary">* All the fields are required</small>
        <Button onClick={clearForm} color="danger">
          {' '}
          Clear Form{' '}
        </Button>
        <Button onClick={handleSubmit} color="primary">
          {edit ? 'Save' : 'Submit'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default TimeEntryForm;
