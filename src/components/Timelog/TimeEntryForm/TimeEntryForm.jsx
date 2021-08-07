import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
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
} from 'reactstrap'
import moment from 'moment'
import _ from 'lodash'
import { Editor } from '@tinymce/tinymce-react'
import ReactTooltip from 'react-tooltip'
import { postTimeEntry, editTimeEntry } from '../../../actions/timeEntries'
import { getUserProjects } from '../../../actions/userProjects'
import { stopTimer } from '../../../actions/timer'
import AboutModal from './AboutModal'
import TangibleInfoModal from './TangibleInfoModal'
import ReminderModal from './ReminderModal'

const GREEN = '#24a44c'
const BLUE = '#00a2b6'

/**
 *
 * @param {*} props
 * @param {*} props.userId
 * @param {*} props.data Fields: 'disabled' and 'isTangible'
 * @returns {TimeEntryForm}
 */
const TimeEntryForm = props => {
  const { userId, edit, data, isOpen, toggle, timer, resetTimer } = props

  const initialFormValues = {
    dateOfWork: moment().format('YYYY-MM-DD'),
    hours: 0,
    minutes: 0,
    projectId: '',
    notes: '',
    isTangible: data.isTangible,
  }

  const initialReminder = {
    notification: false,
    hasLink: data && data.notes && data.notes.includes('http') ? true : false,
    remind: '',
    wordCount: data && data.notes && data.notes.split(' ').length > 10 ? 10 : 0,
    editCount: data ? data.editCount : 0,
    editNotice: true,
  }

  const initialInfo = {
    in: false,
    information: '',
  }

  const [submitDisabled, setSubmitDisabled] = useState(false)
  const [inputs, setInputs] = useState(edit ? data : initialFormValues)
  const [errors, setErrors] = useState({})
  const [close, setClose] = useState(false)
  const [reminder, setReminder] = useState(initialReminder)
  const [isTangibleInfoModalVisible, setTangibleInfoModalVisibleModalVisible] = useState(false)
  const [isInfoModalVisible, setInfoModalVisible] = useState(false)

  const fromTimer = !_.isEmpty(timer)
  const isAdmin = useSelector(state => state.auth.user.role) === 'Administrator'
  const dispatch = useDispatch()

  const tangibleInfoToggle = e => {
    e.preventDefault()
    setTangibleInfoModalVisibleModalVisible(!isTangibleInfoModalVisible)
  }

  useEffect(() => {
    //this to make sure that the form is cleared before closing
    if (close && inputs.projectId == '') {
      //double make sure close is set to false to stop form from reclosing on open
      close = false
      setClose(close => {
        setTimeout(function myfunc() {
          toggle()
        }, 100)
        return false
      })
    }
  }, [close, inputs])

  const openModal = () =>
    setReminder(reminder => ({
      ...reminder,
      notification: !reminder.notification,
    }))

  const cancelChange = () => {
    setReminder(reminder => ({
      ...reminder,
      notification: !reminder.notification,
    }))
    setInputs(inputs => ({
      ...inputs,
      hours: data.hours,
      minutes: data.minutes,
    }))
  }

  useEffect(() => {
    const fetchProjects = async userId => {
      await dispatch(getUserProjects(userId))
    }
    fetchProjects(userId)
  }, [userId, dispatch])

  useEffect(() => {
    setInputs({ ...inputs, ...timer })
  }, [timer])

  const userprofile = useSelector(state => state.userProfile)
  const projects = userprofile && userprofile.projects ? userprofile.projects : []
  const projectOptions = projects.map(project => (
    <option value={project._id} key={project._id}>
      {' '}
      {project.projectName}{' '}
    </option>
  ))
  projectOptions.unshift(
    <option value="" key="none" disabled>
      Select Project/Task
    </option>,
  )

  const validateForm = edittime => {
    const result = {}

    if (inputs.dateOfWork === '') {
      result.dateOfWork = 'Date is required'
    } else {
      const date = moment(inputs.dateOfWork)
      if (!date.isValid()) {
        result.dateOfWork = 'Invalid date'
      }
    }

    if (inputs.hours === '' && inputs.minutes === '') {
      result.time = 'Time is required'
    } else {
      const hours = inputs.hours === '' ? 0 : inputs.hours * 1
      const minutes = inputs.minutes === '' ? 0 : inputs.minutes * 1
      if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
        result.time = 'Hours and minutes should be integers'
      }
      if (hours < 0 || minutes < 0 || (hours === 0 && minutes === 0)) {
        result.time = 'Time should be greater than 0'
      }
    }

    if (inputs.projectId === '') {
      result.projectId = 'Project/Task is required'
    }

    if (reminder.wordCount < 10) {
      openModal()
      setReminder(reminder => ({
        ...reminder,
        remind:
          'Please write a more detailed description of your work completed, write at least 1-2 sentences.',
      }))
      result.notes = 'Description and reference link are required'
    }

    if (reminder.wordCount >= 10 && !reminder.hasLink) {
      openModal()
      setReminder(reminder => ({
        ...reminder,
        remind:
          'Do you have a link to your Google Doc or other place to review this work? You should add it if you do. (Note: Please include http[s]:// in your URL)',
      }))
      result.notes = 'Description and reference link are required'
    }

    if (edit && reminder.editNotice && reminder.editCount < 4 && edittime) {
      openModal()
      setReminder(reminder => ({
        ...reminder,
        remind:
          'You are about to edit your time, if you do this your manager will be notified you’ve edited it. The system automatically tracks how many times you’ve edited your time and will issue blue squares if you edit it repeatedly. Please use the timer properly so your time is logged accurately.',
        editNotice: !reminder.editNotice,
      }))
      return false
    }

    if (edit && reminder.editNotice && reminder.editCount === 4 && edittime) {
      openModal()
      setReminder(reminder => ({
        ...reminder,
        remind:
          'You’ve edited your time 3 times already as a member of the team, are you sure you want to edit it again? Editing your time more than 5 times in a calendar year will result in you receiving a blue square.',
        editNotice: !reminder.editNotice,
      }))
      return false
    }

    if (edit && reminder.editNotice && reminder.editCount === 5 && edittime) {
      openModal()
      setReminder(reminder => ({
        ...reminder,
        remind:
          'Heads up this is your fifth and final time being allowed to edit your time without receiving a blue square. Please use the timer properly from this point forward if you’d like to avoid receiving one.',
        editNotice: !reminder.editNotice,
      }))
      return false
    }
    if (edit && reminder.editNotice && (reminder.editCount - 5) % 2 === 1 && edittime) {
      openModal()
      setReminder(reminder => ({
        ...reminder,
        remind: `Heads up this is your ${reminder.editCount}th time editing your recorded time. The next time you do this, you will receive a blue square. Please use the timer properly from this point forward to avoid this.`,
        editNotice: !reminder.editNotice,
      }))
      return false
    }

    if (edit && reminder.editNotice && (reminder.editCount - 5) % 2 === 0 && edittime) {
      openModal()
      setReminder(reminder => ({
        ...reminder,
        remind: `Heads up this is your ${reminder.editCount}th time editing your recorded time and this edit will make you receive a blue square. Please use the timer properly from this point forward to avoid receiving additional blue squares.`,
        editNotice: !reminder.editNotice,
      }))
      return false
    }

    setErrors(result)
    return _.isEmpty(result)
  }

  const handleSubmit = async event => {
    if (event) {
      event.preventDefault()
    }
    if (submitDisabled) {
      return
    }
    setSubmitDisabled(true)
    setTimeout(function() {
      setSubmitDisabled(false)
    }, 2000)
    const hours = inputs.hours === '' ? '0' : inputs.hours
    const minutes = inputs.minutes === '' ? '0' : inputs.minutes

    const edittime = edit && (data.hours !== hours || data.minutes !== minutes)

    if (!validateForm(edittime)) {
      return
    }
    const timeEntry = {}
    timeEntry.personId = userId
    timeEntry.dateOfWork = inputs.dateOfWork

    timeEntry.projectId = inputs.projectId
    timeEntry.notes = inputs.notes
    timeEntry.isTangible = inputs.isTangible.toString()

    let status
    if (edit) {
      if (edittime) {
        timeEntry.editCount = reminder.editCount + 1
      }
      timeEntry.hours = hours
      timeEntry.minutes = minutes
      if (!edittime || !reminder.notice) {
        status = await dispatch(editTimeEntry(data._id, timeEntry))
      }
    } else {
      timeEntry.timeSpent = `${hours}:${minutes}:00`
      status = await dispatch(postTimeEntry(timeEntry))
    }

    // const totalTime = (parseFloat(userProfile.totalComittedHours, 10) + deltatime).toFixed(2);
    // console.log(totalTime);
    // const updatedUserprofile = {
    //   ...userProfile,
    //   totalComittedHours: totalTime,
    // };
    //await dispatch(updateUserProfile(userProfile._id, updatedUserprofile));

    if (fromTimer) {
      if (status === 200) {
        const timerStatus = await dispatch(stopTimer(userId))
        if (timerStatus === 200 || timerStatus === 201) {
          resetTimer()
          clearForm(true)
        }
      }
    } else if (!edit) {
      clearForm(true)
    } else if (!reminder.notice && edittime) {
      setReminder(reminder => ({
        ...reminder,
        editCount: reminder.editCount + 1,
        editNotice: !reminder.editNotice,
      }))
      toggle()
    } else if (!edittime) {
      toggle()
    }
  }

  const handleInputChange = event => {
    event.persist()
    setInputs(inputs => ({
      ...inputs,
      [event.target.name]: event.target.value,
    }))
  }

  const handleHHInputChange = event => {
    event.persist()
    if (event.target.value < 0 || event.target.value > 40) {
      return
    }
    setInputs(inputs => ({
      ...inputs,
      [event.target.name]: event.target.value,
    }))
  }

  const handleMMInputChange = event => {
    event.persist()
    if (event.target.value < 0 || event.target.value > 59) {
      return
    }
    setInputs(inputs => ({
      ...inputs,
      [event.target.name]: event.target.value,
    }))
  }

  const handleEditorChange = (content, editor) => {
    inputs.notes = content
    const { wordcount } = editor.plugins

    setInputs(inputs => ({ ...inputs, [editor.id]: content }))
    setReminder(reminder => ({
      ...reminder,
      wordCount: wordcount.body.getWordCount(),
      hasLink: inputs.notes.indexOf('http://') > -1 || inputs.notes.indexOf('https://') > -1,
    }))
  }

  const handleCheckboxChange = event => {
    event.persist()
    setInputs(inputs => ({
      ...inputs,
      [event.target.name]: event.target.checked,
    }))
  }

  const clearForm = closed => {
    if (closed) {
      //make sure form clears before close
      setInputs({ ...initialFormValues })
      setClose(true)
    }
    setInputs({ ...initialFormValues })
    setReminder({ ...initialReminder })
    setErrors({})
  }

  return (
    <>
      <TangibleInfoModal
        visible={isTangibleInfoModalVisible}
        setVisible={setTangibleInfoModalVisibleModalVisible}
      />

      <AboutModal visible={isInfoModalVisible} setVisible={setInfoModalVisible} />

      <ReminderModal
        inputs={inputs}
        data={data}
        edit={edit}
        reminder={reminder}
        visible={reminder.notification}
        setVisible={visible => setReminder({ ...reminder, notification: visible })}
      />

      <Modal isOpen={isOpen} toggle={toggle}>
        <ModalHeader toggle={toggle} style={{ backgroundColor: inputs.isTangible ? GREEN : BLUE }}>
          <div>
            {edit ? 'Edit ' : 'Add '} Time Entry &nbsp;
            <i
              className="fa fa-info-circle"
              data-tip
              data-for="registerTip"
              aria-hidden="true"
              title="timeEntryTip"
              onClick={() => setInfoModalVisible(true)}
            />
          </div>
          <ReactTooltip id="registerTip" place="bottom" effect="solid">
            Click this icon to learn about this time entry form
          </ReactTooltip>
        </ModalHeader>
        <ModalBody style={{ backgroundColor: inputs.isTangible ? GREEN : BLUE }}>
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
                Tangible&nbsp;
                <i
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
        </ModalBody>
        <ModalFooter style={{ backgroundColor: inputs.isTangible ? GREEN : BLUE }}>
          <small className="mr-auto">* All the fields are required</small>
          <Button onClick={clearForm} color="danger">
            {' '}
            Clear Form{' '}
          </Button>
          <Button onClick={handleSubmit} color="primary" disabled={submitDisabled}>
            {edit ? 'Save' : 'Submit'}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  )
}

export default TimeEntryForm
