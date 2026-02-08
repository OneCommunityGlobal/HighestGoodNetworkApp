import { useState, useEffect } from 'react';
import { Form, FormGroup, Label, Input, Button, Badge } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import Joi from 'joi-browser';
import { boxStyle } from '../../../../styles';
import styles from './CreateNewTeam.module.css';
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
  const [tasks, setTasks] = useState([]);
  //const [tasks] = useState([]);
  const [assignedMembers, setAssignedMembers] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [taskErrorMessage, setTaskErrorMessage] = useState('');

  const [touchedFields, setTouchedFields] = useState({
    teamName: false,
    assignedMembers: false,
    additionalInformation: false,
  });

  const user = useSelector(state => state.auth.user);

  const dummyTasks = ['Task 1', 'Task 2', 'Task 3', 'Task 4', 'Task 5'];

  const [loadingMembers, setLoadingMembers] = useState(false);
  useEffect(() => {
    setLoadingMembers(true);
    const result = dispatch(getUserProfileBasicInfo());
    // If the action returns a promise (thunk), handle it
    if (result && typeof result.then === 'function') {
      result.finally(() => setLoadingMembers(false));
    } else {
      setLoadingMembers(false);
    }
    tasks.length === 0 && setTasks(dummyTasks);
  }, [dispatch]);

  useEffect(() => {
    setMembers(userProfilesBasicInfo || []);
  }, [userProfilesBasicInfo]);

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
    if ((!data.teamMembers || data.teamMembers.length === 0) && assignedMembers.length === 0) {
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
    setErrorMessage('');
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
      setTaskErrorMessage('');
    }
  };

  const handleRemoveTask = task => {
    setAssignedTasks(assignedTasks.filter(t => t !== task));
  };

  // const isTaskAssigned = assignedTasks.includes(selectedTask);

  return (
    <main className={`${styles.addTeamContainer}`}>
      <header className={`${styles.addTeamHeader}`}>
        <h2>Create New Team</h2>
      </header>

      <Form className={`${styles.addTeamForm} container`} onSubmit={handleSubmit}>
        <FormGroup style={{ marginTop: '1.5rem', marginBottom: 0 }}>
          <Label for="teamName">
            Team Name<span className={`${styles.fieldRequired}`}>*</span>
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
            <Label for="teamNameErr" sm={12} className={`${styles.teamFormError}`}>
              {errors.teamName}
            </Label>
          )}
        </FormGroup>
        <FormGroup style={{ marginTop: '1.5rem', marginBottom: 0 }}>
          <Label for="member-select">
            Add Members<span className={`${styles.fieldRequired}`}>*</span>
          </Label>
          <div className={`${styles.selectContainer}`}>
            {loadingMembers ? (
              <div style={{ padding: '0.5rem' }}>Loading members...</div>
            ) : (
              <Input
                id="members-select"
                type="select"
                value={selectedMember}
                onChange={handleMemberChange}
                className={`${styles.memberDropdown}`}
              >
                {Array.isArray(members) && members.length > 0 ? (
                  <>
                    <option value="">Select a Member</option>
                    {members.map((user, index) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <option key={index} value={user.id}>
                        {user.firstName} {user.lastName}
                      </option>
                    ))}
                  </>
                ) : (
                  <option value="">No members available</option>
                )}
              </Input>
            )}
            <Button
              onClick={handleAddMember}
              // disabled={!selectedMember || isMemberAssigned}
              className="add-member-button"
            >
              Add
            </Button>
          </div>
          {errors.assignedMembers && (
            <Label for="assignedMembersErr" className={`${styles.teamFormError}`}>
              {errors.assignedMembers}
            </Label>
          )}
          {errorMessage && (
            <Label className={`${styles.teamFormError}`} style={{ color: 'red' }}>
              {errorMessage}
            </Label>
          )}
        </FormGroup>
        <div>
          {assignedMembers.length > 0 && (
            <label htmlFor="assigned-members" className={styles.label}>
              Currently Assigned Members:
            </label>
          )}
          <div className={`${styles.badgeContainer}`}>
            {assignedMembers.map((member, index) => {
              return (
                // eslint-disable-next-line react/no-array-index-key
                <Badge key={index} pill color="info" className="mr-2">
                  {member}
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={() => handleRemoveMember(member)}
                    onKeyDown={e =>
                      (e.key === 'Enter' || e.key === ' ') && handleRemoveMember(member)
                    }
                    aria-label={`Remove member ${member}`}
                  >
                    X
                  </span>
                </Badge>
              );
            })}
          </div>
        </div>
        <FormGroup style={{ marginTop: '1.5rem', marginBottom: 0 }}>
          <Label for="task-select">Add Main Tasks</Label>
          <div className={`${styles.selectContainer}`}>
            <Input id="tasks-select" type="select" value={selectedTask} onChange={handleTaskChange}>
              {Array.isArray(tasks) && tasks.length > 0 ? (
                <>
                  <option value="">Select a Task</option>
                  {tasks.map((task, index) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <option key={index} value={task.id}>
                      {task}
                    </option>
                  ))}
                </>
              ) : (
                <option value="">No tasks available</option>
              )}
            </Input>
            <Button
              onClick={handleAddTask}
              // disabled={!selectedTask || isTaskAssigned}
              style={{ marginTop: '10px' }}
            >
              Add
            </Button>
          </div>
          {taskErrorMessage && (
            <Label className={`${styles.teamFormError}`} style={{ color: 'red' }}>
              {taskErrorMessage}
            </Label>
          )}
        </FormGroup>

        <div>
          {assignedTasks.length > 0 && (
            <label htmlFor="assigned-tasks" className={styles.label}>
              Currently Assigned Tasks:
            </label>
          )}
          <div className={`${styles.badgeContainer}`}>
            {assignedTasks.map((task, index) => {
              return (
                // eslint-disable-next-line react/no-array-index-key
                <Badge key={index} pill color="info" className="mr-2">
                  {task}{' '}
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={() => handleRemoveTask(task)}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleRemoveTask(task)}
                    aria-label={`Remove task ${task}`}
                  >
                    X
                  </span>
                </Badge>
              );
            })}
          </div>
        </div>
        <FormGroup style={{ marginTop: '1.5rem', marginBottom: 0 }}>
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
            <Label for="additionalInformationErr" sm={12} className={`${styles.teamFormError}`}>
              {errors.additionalInformation}
            </Label>
          )}
        </FormGroup>
        <div className={`${styles.addTeamButtons}`}>
          <Button id="cancel-button" style={boxStyle} onClick={handleCancelClick}>
            Cancel
          </Button>
          <Button id="submit-button" style={boxStyle} onClick={handleSubmit}>
            Submit
          </Button>
        </div>
      </Form>
    </main>
  );
}
