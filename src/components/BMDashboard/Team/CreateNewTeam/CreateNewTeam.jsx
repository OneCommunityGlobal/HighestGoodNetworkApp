import { useState, useEffect } from 'react';
import { Form, FormGroup, Label, Input, Button, Badge } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import Joi from 'joi';
import { boxStyle } from '../../../../styles';
import './CreateNewTeam.css';
import { getUserProfileBasicInfo } from '../../../../actions/userManagement';

const initialFormState = {
  teamName: '',
  additionalInformation: '',
  teamMembers: [],
  tasks: [],
};

export default function CreateNewTeam() {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const userProfilesBasicInfo = useSelector(
    state => state.allUserProfilesBasicInfo?.userProfilesBasicInfo,
  );
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedTask, setSelectedTask] = useState('');
  const [members, setMembers] = useState([]);
  // const [tasks, setTasks] = useState([]);
  const [tasks] = useState([]);
  const [assignedMembers, setAssignedMembers] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [taskErrorMessage, setTaskErrorMessage] = useState('');

  const [touchedFields, setTouchedFields] = useState({
    teamName: false,
    assignedMembers: false,
    additionalInformation: false,
  });

  useEffect(() => {
    dispatch(getUserProfileBasicInfo());
  }, [dispatch]);

  useEffect(() => {
    setMembers(userProfilesBasicInfo);
  }, []);

  const validationObj = {
    additionalInformation: Joi.string()
      .max(500)
      .allow(''),
    teamName: Joi.string()
      .required()
      .max(35),
  };

  const schema = Joi.object(validationObj).unknown();

  const validate = data => {
    const result = schema.validate(data, { abortEarly: false });
    const errorMessages = {};
    if (result.error) {
      result.error.details.forEach(detail => {
        errorMessages[detail.path[0]] = detail.message;
      });
    }
    if (assignedMembers.length === 0) {
      errorMessages.assignedMembers = 'You must assign at least one member.';
    } else {
      // Clear the assignedMembers error if members have been added
      delete errorMessages.assignedMembers;
    }
    return Object.keys(errorMessages).length > 0 ? errorMessages : null;
  };

  useEffect(() => {
    // Only trigger validation if the form is touched (fields are interacted with)
    if (Object.values(touchedFields).includes(true)) {
      const validationErrors = validate({ ...formData, teamMembers: assignedMembers });
      setErrors(validationErrors || {});
    }
  }, [assignedMembers, touchedFields]);

  const handleInputChange = (name, value) => {
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));

    // const validationErrors = validate(formData);
    // setErrors(validationErrors || {});
  };

  const handleTeamNameBlur = () => {
    setTouchedFields(prevState => ({ ...prevState, teamName: true }));
    const validationErrors = validate(formData); // Trigger validation when field loses focus
    setErrors(validationErrors || {});
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setTouchedFields({
      teamName: true,
      assignedMembers: true,
      additionalInformation: true,
    });
    const validationErrors = validate(formData);
    setErrors(validationErrors || {});
    if (validationErrors) {
      return;
    }

    const updatedFormData = {
      ...formData,
      teamMembers: assignedMembers,
      tasks: assignedTasks,
    };

    // eslint-disable-next-line no-console
    console.log('Form Submitted:', updatedFormData);

    setSelectedMember('');
    setAssignedMembers([]);
    setSelectedTask('');
    setAssignedTasks([]);
    setFormData(initialFormState);
    setErrors({});
    setTouchedFields({
      teamName: false,
      assignedMembers: false,
      additionalInformation: false,
    });
  };

  const handleCancelClick = () => {
    setSelectedMember('');
    setAssignedMembers([]);
    setSelectedTask('');
    setAssignedTasks([]);
    setFormData(initialFormState);
    setErrors({});
    setTouchedFields({
      teamName: false,
      assignedMembers: false,
      additionalInformation: false,
    });
  };

  const handleMemberChange = e => {
    setSelectedMember(e.target.value);
    setErrorMessage('');
  };

  const handleAddMember = () => {
    if (!selectedMember) {
      setErrorMessage('Please select a member!');
      return;
    }
    if (assignedMembers.includes(selectedMember)) {
      setErrorMessage('This member is already assigned!'); // Error for duplicate addition
      return;
    }
    // if (selectedMember && !assignedMembers.includes(selectedMember)) {
    //   setAssignedMembers([...assignedMembers, selectedMember]);
    //   setSelectedMember('');
    //   setErrorMessage('');

    //   const validationErrors = validate(formData);
    //   setErrors(validationErrors || {});
    // }
    if (selectedMember && !assignedMembers.includes(selectedMember)) {
      setAssignedMembers(prevMembers => {
        const updatedMembers = [...prevMembers, selectedMember];
        const validationErrors = validate({ ...formData, teamMembers: updatedMembers });
        setErrors(validationErrors || {});
        setErrorMessage('');
        return updatedMembers;
      });
      setSelectedMember('');
    }
  };

  const handleRemoveMember = member => {
    setAssignedMembers(assignedMembers.filter(m => m !== member));
  };

  // const isMemberAssigned = assignedMembers.includes(selectedMember);

  const handleTaskChange = e => {
    setSelectedTask(e.target.value);
    setTaskErrorMessage('');
  };

  const handleAddTask = () => {
    // if (!selectedTask) {
    //   setTaskErrorMessage('Please select a Task!');
    //   return;
    // }
    if (assignedTasks.includes(selectedTask)) {
      setTaskErrorMessage('This task is already assigned!'); // Error for duplicate addition
      return;
    }
    if (selectedTask && !assignedTasks.includes(selectedTask)) {
      setAssignedTasks([...assignedTasks, selectedTask]);
      setSelectedTask('');
    }
  };

  const handleRemoveTask = task => {
    setAssignedTasks(assignedTasks.filter(t => t !== task));
  };

  // const isTaskAssigned = assignedTasks.includes(selectedTask);

  return (
    <main className="add-team-container">
      <header className="add-team-header">
        <h2>Create New Team</h2>
      </header>

      <Form className="add-team-form container" onSubmit={handleSubmit}>
        <FormGroup>
          <Label for="teamName">
            Team Name<span className="field-required">*</span>
          </Label>
          <Input
            id="team-name"
            type="text"
            name="teamName"
            placeholder="Input new team name"
            value={formData.teamName}
            onChange={event => handleInputChange('teamName', event.target.value)}
            onBlur={handleTeamNameBlur}
          />
          {errors.teamName && (
            <Label for="teamNameErr" sm={12} className="teamFormError">
              {errors.teamName}
            </Label>
          )}
        </FormGroup>
        <FormGroup>
          <Label for="member-select">
            Add Members<span className="field-required">*</span>
          </Label>
          <div className="select-container">
            <Input
              id="members-select"
              type="select"
              value={selectedMember}
              onChange={handleMemberChange}
              className="member-dropdown"
            >
              <option value="">Select a Member</option>
              {members.map((user, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <option key={index} value={user.id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </Input>
            <Button
              onClick={handleAddMember}
              // disabled={!selectedMember || isMemberAssigned}
              className="add-member-button"
            >
              Add
            </Button>
          </div>
          {errors.assignedMembers && (
            <Label for="assignedMembersErr" className="teamFormError">
              {errors.assignedMembers}
            </Label>
          )}
          {errorMessage && (
            <Label className="teamFormError" style={{ color: 'red' }}>
              {errorMessage}
            </Label>
          )}
        </FormGroup>
        <div>
          {assignedMembers.length > 0 && <label>Currently Assigned Members:</label>}
          <div className="badge-container">
            {assignedMembers.map((member, index) => {
              return (
                // eslint-disable-next-line react/no-array-index-key
                <Badge key={index} pill color="info" className="mr-2">
                  {member} <span onClick={() => handleRemoveMember(member)}>X</span>
                </Badge>
              );
            })}
          </div>
        </div>
        <FormGroup>
          <Label for="task-select">Add Main Tasks</Label>
          <div className="select-container">
            <Input id="tasks-select" type="select" value={selectedTask} onChange={handleTaskChange}>
              <option value="">Select a Task</option>
              {tasks.map((task, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <option key={index} value={task.id}>
                  {task}
                </option>
              ))}
            </Input>
            <Button
              onClick={handleAddTask}
              // disabled={!selectedTask || isTaskAssigned}
              style={{ marginTop: '10px' }}
            >
              Add
            </Button>
          </div>
          {errorMessage && (
            <Label className="teamFormError" style={{ color: 'red' }}>
              {taskErrorMessage}
            </Label>
          )}
        </FormGroup>

        <div>
          {assignedTasks.length > 0 && <label>Currently Assigned Tasks:</label>}
          <div className="badge-container">
            {assignedTasks.map((task, index) => {
              return (
                // eslint-disable-next-line react/no-array-index-key
                <Badge key={index} pill color="info" className="mr-2">
                  {task}{' '}
                  <span
                    onClick={() => handleRemoveTask(task)}
                    style={{
                      cursor: 'pointer',
                      paddingLeft: '5px',
                    }}
                  >
                    X
                  </span>
                </Badge>
              );
            })}
          </div>
        </div>
        <FormGroup>
          <Label for="additional-information-label">Additional Information</Label>
          <Input
            type="textarea"
            rows="4"
            name="additional-info"
            id="additional-info"
            placeholder="Specify additional info about team if neccesary"
            value={formData.additionalInformation}
            onChange={event => handleInputChange('additionalInformation', event.target.value)}
          />
          {errors.additionalInformation && (
            <Label for="additionalInformationErr" sm={12} className="teamFormError">
              {errors.additionalInformation}
            </Label>
          )}
        </FormGroup>
        <div className="add-team-buttons">
          <Button id="cancel-button" outline style={boxStyle} onClick={handleCancelClick}>
            Cancel
          </Button>
          <Button id="submit-button" style={boxStyle}>
            Submit
          </Button>
        </div>
      </Form>
    </main>
  );
}
