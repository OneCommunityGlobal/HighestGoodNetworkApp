import React, { useState } from 'react'
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-regular-svg-icons'
import { postTimeEntry, editTimeEntry } from '../../actions/timeEntries'

const TimeEntryForm = ({ userId, edit, data }) => {
  const initialState = {
    dateOfWork: moment().format('YYYY-MM-DD'),
    hours: 0,
    minutes: 0,
    projectId: '',
    notes: '',
    isTangible: data ? data.isTangible : true,
  }

  const [inputs, setInputs] = useState(edit ? data : initialState)
  const [isOpen, setOpen] = useState(false)
  const dispatch = useDispatch()

  const { projects } = useSelector(state => state.userProjects)
  const projectOptions = projects.map(project => (
    <option value={project.projectId} key={project.projectId}>
      {' '}
      {project.projectName}{' '}
    </option>
  ))
  projectOptions.unshift(
    <option value="" key="" disabled>
      Select Project
    </option>,
  )

  const toggle = () => setOpen(isOpen => !isOpen)

  const handleSubmit = async event => {
    if (event) {
      event.preventDefault()
    }

    const timeEntry = {}

    timeEntry.personId = userId
    timeEntry.dateOfWork = inputs.dateOfWork

    timeEntry.projectId = inputs.projectId
    timeEntry.notes = `<p>${inputs.notes}</p>`
    timeEntry.isTangible = inputs.isTangible.toString()

    if (edit) {
      timeEntry.hours = inputs.hours
      timeEntry.minutes = inputs.minutes
      await dispatch(editTimeEntry(data._id, timeEntry))
    } else {
      timeEntry.timeSpent = `${inputs.hours}:${inputs.minutes}:00`
      await dispatch(postTimeEntry(timeEntry))
    }

    setInputs(inputs => initialState)
    toggle()
  }

  const handleInputChange = event => {
    event.persist()
    setInputs(inputs => ({ ...inputs, [event.target.name]: event.target.value }))
  }

  const handleCheckboxChange = event => {
    event.persist()
    setInputs(inputs => ({ ...inputs, [event.target.name]: event.target.checked }))
  }

  const clearForm = event => {
    setInputs(inputs => initialState)
  }

  const isOwner = useSelector(state => state.auth.user.userid) === userId
  const name = `${useSelector(state => state.userProfile.firstName)} ${useSelector(
    state => state.userProfile.lastName,
  )}`
  const isAdmin = useSelector(state => state.auth.user.role) === 'Administrator'

  return (
    <span>
      {edit ? (
        <FontAwesomeIcon icon={faEdit} size="lg" className="mr-3 text-primary" onClick={toggle} />
      ) : isOwner ? (
        <Button color="success" className="float-right" onClick={toggle}>
          Add Time Entry
        </Button>
      ) : (
        <Button color="warning" className="float-right" onClick={toggle}>
          Add Time Entry {!isOwner && `for ${name}`}
        </Button>
      )}
      <Modal isOpen={isOpen} toggle={toggle}>
        <ModalHeader toggle={toggle}>
          {edit ? 'Edit ' : 'Add '}
          Time Entry
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="dateOfWork">Date</Label>
              {isAdmin ? (
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
                  />
                </Col>
              </Row>
            </FormGroup>
            <FormGroup>
              <Label for="project">Project</Label>
              <Input
                type="select"
                name="projectId"
                id="projectId"
                value={inputs.projectId}
                onChange={handleInputChange}
              >
                {projectOptions}
              </Input>
            </FormGroup>
            <FormGroup>
              <Label for="notes">Notes</Label>
              <Input
                type="textarea"
                name="notes"
                id="notes"
                placeholder="Notes"
                value={inputs.notes}
                onChange={handleInputChange}
              />
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
        </ModalBody>
        <ModalFooter>
          <Button onClick={clearForm} color="danger" className="float-left">
            {' '}
            Clear Form{' '}
          </Button>
          <Button onClick={handleSubmit} color="primary">
            {' '}
            {edit ? 'Save' : 'Submit'}{' '}
          </Button>
        </ModalFooter>
      </Modal>
    </span>
  )
}

export default TimeEntryForm
