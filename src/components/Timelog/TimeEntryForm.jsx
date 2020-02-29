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
import { postTimeEntry } from '../../actions/timeEntries' 
import moment from "moment";

const TimeEntryForm = () => {
    const initialState = {
        dateOfWork: moment().format("YYYY-MM-DD"),
        hours: 0,
        minutes: 0,
        projectId: "",
        notes: "",
        isTangible: true
    }

    const [inputs, setInputs] = useState(initialState);
    const [isOpen, setOpen] = useState(false);
    const dispatch = useDispatch();

    const { projects } = useSelector(state => state.userProjects);
    const projectOptions = projects.map(project => 
        <option value={project.projectId} key={project.projectId}> {project.projectName} </option>
    )
    projectOptions.unshift(<option value="" key="" disabled>Select Project</option>);

    const { userid } = useSelector(state => state.auth.user);

    const toggle = () => setOpen(isOpen => !isOpen);
    

    const handleSubmit = async event => {
        if (event) {
            event.preventDefault();
        }

        const timeEntry = {};

        timeEntry.personId = userid;
        timeEntry.dateOfWork = inputs.dateOfWork;
        timeEntry.timeSpent = `${inputs.hours}:${inputs.minutes}:00`;
        timeEntry.projectId = inputs.projectId;
        timeEntry.notes = `<p>${inputs.notes}</p>`;
        timeEntry.isTangible = inputs.isTangible.toString();
    
        await dispatch(postTimeEntry(timeEntry));

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
    }

    return (
        <div>
            <Button color="success" className="float-right" onClick={ toggle }>
                Add Time Entry
            </Button>
            <Modal isOpen={isOpen} toggle={ toggle }>
                <ModalHeader toggle={toggle}>
                    Add a Time Entry
                </ModalHeader>
                <ModalBody>
                    <Form>
                        <FormGroup>
                            <Label for="dateOfWork">Date</Label>
                            {/* <Input type="date" name="dateOfWork" id="dateOfWork" placeholder="Date Placeholder" 
                                value={inputs.dateOfWork} onChange={handleInputChange}/> */}
                            <Input type="date" name="dateOfWork" id="dateOfWork" placeholder="Date Placeholder" 
                                value={inputs.dateOfWork} disabled/>
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
                        </FormGroup>
                        <FormGroup>
                            <Label for="project">Project</Label>
                            <Input type="select" name="projectId" id="projectId" 
                                value={inputs.projectId} onChange={handleInputChange}>
                                {projectOptions}
                            </Input>
                        </FormGroup>
                        <FormGroup>
                            <Label for="notes">Notes</Label>
                            <Input type="textarea" name="notes" id="notes" placeholder="Notes" 
                                value={inputs.notes} onChange={handleInputChange}/>
                        </FormGroup>
                        <FormGroup check>
                            <Label check>
                                <Input type="checkbox" name="isTangible" checked={inputs.isTangible} 
                                    onChange={handleCheckboxChange}/>
                                {' '}Tangible
                            </Label>
                        </FormGroup>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={clearForm} color="danger" className="float-left"> Clear Form </Button>
                    <Button onClick={handleSubmit} color="primary" > Submit </Button>
                </ModalFooter>
            </Modal>
        </div>
    )
}

export default TimeEntryForm