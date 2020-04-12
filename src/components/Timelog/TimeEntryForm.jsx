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
    ModalFooter
} from 'reactstrap'
import { postTimeEntry, editTimeEntry } from '../../actions/timeEntries' 
import moment from "moment"
import _ from "lodash"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-regular-svg-icons'

const TimeEntryForm = ({userId, edit, data}) => {
    const initialState = {
        dateOfWork: moment().format("YYYY-MM-DD"),
        hours: 0,
        minutes: 0,
        projectId: "",
        notes: "",
        isTangible: data ? data.isTangible : true
    }

    const [inputs, setInputs] = useState(edit ? data : initialState);
    const [isOpen, setOpen] = useState(false);
    const [errors, setErrors] = useState({});
    const dispatch = useDispatch();

    const { projects } = useSelector(state => state.userProjects);
    const projectOptions = projects.map(project => 
        <option value={project.projectId} key={project.projectId}> {project.projectName} </option>
    )
    projectOptions.unshift(<option value="" key="" disabled>Select Project</option>);

    const toggle = () => setOpen(isOpen => !isOpen);
    
    const validateForm = () => {
        const result = {};

        if (inputs.dateOfWork === "") {
            result['dateOfWork'] = "Date is required";
        }
        else {
            const date = moment(inputs.dateOfWork);
            if (!date.isValid()){
                result['dateOfWork'] = "Invalid date";
            }
        }

        if (inputs.hours === "" && inputs.minutes === "") {
            result['time'] = "Time is required";
        }
        else {
            const hours = inputs.hours === "" ? 0 : inputs.hours * 1;
            const minutes = inputs.minutes === "" ? 0 : inputs.minutes * 1;
            if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
                result['time'] = "Hours and minutes should be integers";
            }
            if (hours < 0 || minutes < 0 || (hours === 0 && minutes === 0)) {
                result['time'] = "Time should be greater than 0";
            }
        }

        if (inputs.projectId === "") {
            result['projectId'] = "Project is required";
        }

        if (inputs.notes === "") {
            result["notes"] = "Notes is required"
        }

        setErrors(result);
        return _.isEmpty(result);
    }

    const handleSubmit = async event => {
        if (event) {
            event.preventDefault();
        }

        if (!validateForm()) {
            return;
        }

        const timeEntry = {};

        timeEntry.personId = userId;
        timeEntry.dateOfWork = inputs.dateOfWork;

        timeEntry.projectId = inputs.projectId;
        timeEntry.notes = `<p>${inputs.notes}</p>`;
        timeEntry.isTangible = inputs.isTangible.toString();
    
        const hours = inputs.hours === "" ? "0" : inputs.hours;
        const minutes = inputs.minutes === "" ? "0" : inputs.minutes;
        if (edit) {
            timeEntry.hours = hours;
            timeEntry.minutes = minutes;
            await dispatch(editTimeEntry(data._id, timeEntry));
        }
        else {
            timeEntry.timeSpent = `${hours}:${minutes}:00`;
            await dispatch(postTimeEntry(timeEntry));
        }

        setInputs(inputs => initialState);
        toggle();
    }

    const handleInputChange = event => {
        event.persist();
        setInputs(inputs => ({...inputs, [event.target.name]: event.target.value}));
    }

    const handleCheckboxChange = event => {
        event.persist();
        setInputs(inputs => ({...inputs, [event.target.name]: event.target.checked}));
    }

    const clearForm = event => {
        setInputs(inputs => initialState);
        setErrors(errors => ({}));
    }

    const isOwner = useSelector(state => state.auth.user.userid) === userId;
    const name = useSelector(state => state.userProfile.firstName) + " " + 
                    useSelector(state => state.userProfile.lastName);
    const isAdmin = useSelector(state => state.auth.user.role) === "Administrator";

    return (
        <span>
            {edit ? <FontAwesomeIcon icon={faEdit} size="lg" className="mr-3 text-primary" onClick={ toggle }/>
            : isOwner ? (<Button color="success" className="float-right" onClick={ toggle }>
                Add Time Entry
            </Button>) : 
            (<Button color="warning" className="float-right" onClick={ toggle }>
                Add Time Entry {!isOwner && `for ${name}`}
            </Button>)}
            <Modal isOpen={isOpen} toggle={ toggle }>
                <ModalHeader toggle={toggle}>
                    { edit ? "Edit " : "Add " }Time Entry
                </ModalHeader>
                <ModalBody>
                    <Form>
                        <FormGroup>
                            <Label for="dateOfWork">Date</Label>
                            {isAdmin ? 
                                <Input type="date" name="dateOfWork" id="dateOfWork"
                                    value={inputs.dateOfWork} onChange={handleInputChange}/> :
                                <Input type="date" name="dateOfWork" id="dateOfWork" 
                                    value={inputs.dateOfWork} disabled/>
                            }
                            {'dateOfWork' in errors && <div className="text-danger"><small>{errors.dateOfWork}</small></div>}
                        </FormGroup>
                        <FormGroup>
                            <Label for="timeSpent">Time (HH:MM)</Label>
                            <Row form>
                                <Col>
                                    <Input type="number" name="hours" id="hours" placeholder="Hours" 
                                        value={inputs.hours} onChange={handleInputChange}/>
                                </Col>
                                <Col>
                                    <Input type="number" name="minutes" id="minutes" placeholder="Minutes" 
                                        value={inputs.minutes} onChange={handleInputChange}/>
                                </Col>
                            </Row>
                            {'time' in errors && <div className="text-danger"><small>{errors.time}</small></div>}
                        </FormGroup>
                        <FormGroup>
                            <Label for="project">Project</Label>
                            <Input type="select" name="projectId" id="projectId" 
                                value={inputs.projectId} onChange={handleInputChange}>
                                {projectOptions}
                            </Input>
                            {'projectId' in errors && <div className="text-danger"><small>{errors.projectId}</small></div>}
                        </FormGroup>
                        <FormGroup>
                            <Label for="notes">Notes</Label>
                            <Input type="textarea" name="notes" id="notes" placeholder="Notes" 
                                value={inputs.notes} onChange={handleInputChange}/>
                            {'notes' in errors && <div className="text-danger"><small>{errors.notes}</small></div>}
                        </FormGroup>
                        <FormGroup check>
                            <Label check>
                                {(isAdmin || !edit) ? 
                                    <Input type="checkbox" name="isTangible" checked={inputs.isTangible} 
                                        onChange={handleCheckboxChange}/> : 
                                    <Input type="checkbox" name="isTangible" checked={inputs.isTangible} disabled />   
                                }
                                {' '}Tangible
                            </Label>
                        </FormGroup>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <small className="mr-auto text-secondary">* All the fields are required</small>
                    <Button onClick={clearForm} color="danger"> Clear Form </Button>
                    <Button onClick={handleSubmit} color="primary"> 
                        { edit ? "Save" : "Submit" } 
                    </Button>
                </ModalFooter>
            </Modal>
        </span>
    )
}

export default TimeEntryForm