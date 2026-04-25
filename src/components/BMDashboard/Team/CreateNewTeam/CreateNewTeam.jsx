import { useState, useEffect } from 'react';
import { Form, FormGroup, Label, Input, Button, Badge, Tooltip } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import Joi from 'joi';
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
  // const [tasks, setTasks] = useState([]);
  const [tasks] = useState([]);
  const [assignedMembers, setAssignedMembers] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [taskErrorMessage, setTaskErrorMessage] = useState('');
  const [selectedMembersForBulk, setSelectedMembersForBulk] = useState([]);
  const [selectedTasksForBulk, setSelectedTasksForBulk] = useState([]);

  const [teamNameTooltipOpen, setTeamNameTooltipOpen] = useState(false);
  const [membersTooltipOpen, setMembersTooltipOpen] = useState(false);
  const [tasksTooltipOpen, setTasksTooltipOpen] = useState(false);

  const [touchedFields, setTouchedFields] = useState({
    teamName: false,
    assignedMembers: false,
    additionalInformation: false,
  });

  useEffect(() => {
    dispatch(getUserProfileBasicInfo({ source: 'CreateNewTeam' }));
  }, [dispatch]);

  useEffect(() => {
    if (Array.isArray(userProfilesBasicInfo)) {
      setMembers(userProfilesBasicInfo);
    }
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

  const validate = (data, membersList) => {
    const result = schema.validate(data, { abortEarly: false });
    const errorMessages = {};
    if (result.error) {
      result.error.details.forEach(detail => {
        if (detail.path[0] === 'teamName') {
          if (detail.type === 'any.empty' || detail.type === 'any.required') {
            errorMessages.teamName = 'Team name is required.';
          } else if (detail.type === 'string.max') {
            errorMessages.teamName = 'Team name must be 35 characters or fewer.';
          } else {
            errorMessages[detail.path[0]] = detail.message;
          }
        } else {
          errorMessages[detail.path[0]] = detail.message;
        }
      });
    }
    const currentMembers = membersList !== undefined ? membersList : assignedMembers;
    if (currentMembers.length === 0) {
      errorMessages.assignedMembers = 'You must assign at least one member.';
    } else {
      delete errorMessages.assignedMembers;
    }
    return Object.keys(errorMessages).length > 0 ? errorMessages : null;
  };

  const isFormValid =
    formData.teamName.trim().length > 0 &&
    formData.teamName.length <= 35 &&
    assignedMembers.length > 0;

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

  const handleSubmit = event => {
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
    setSelectedMembersForBulk([]);
    setSelectedTasksForBulk([]);
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
    setSelectedMembersForBulk([]);
    setSelectedTasksForBulk([]);
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
      setErrorMessage('This member is already assigned!');
      return;
    }
    if (selectedMember && !assignedMembers.includes(selectedMember)) {
      setAssignedMembers(prevMembers => {
        const updatedMembers = [...prevMembers, selectedMember];
        const validationErrors = validate(
          { ...formData, teamMembers: updatedMembers },
          updatedMembers,
        );
        setErrors(validationErrors || {});
        setErrorMessage('');
        return updatedMembers;
      });
      setSelectedMember('');
    }
  };

  const handleRemoveMember = member => {
    setAssignedMembers(assignedMembers.filter(m => m !== member));
    setSelectedMembersForBulk(prev => prev.filter(m => m !== member));
  };

  const handleBulkRemoveMembers = () => {
    if (selectedMembersForBulk.length === 0) return;
    setAssignedMembers(prev => prev.filter(m => !selectedMembersForBulk.includes(m)));
    setSelectedMembersForBulk([]);
  };

  const handleToggleMemberForBulk = member => {
    setSelectedMembersForBulk(prev =>
      prev.includes(member) ? prev.filter(m => m !== member) : [...prev, member],
    );
  };

  const handleTaskChange = e => {
    setSelectedTask(e.target.value);
    setTaskErrorMessage('');
  };

  const handleAddTask = () => {
    if (assignedTasks.includes(selectedTask)) {
      setTaskErrorMessage('This task is already assigned!');
      return;
    }
    if (selectedTask && !assignedTasks.includes(selectedTask)) {
      setAssignedTasks([...assignedTasks, selectedTask]);
      setSelectedTask('');
    }
  };

  const handleRemoveTask = task => {
    setAssignedTasks(assignedTasks.filter(t => t !== task));
    setSelectedTasksForBulk(prev => prev.filter(t => t !== task));
  };

  const handleBulkRemoveTasks = () => {
    if (selectedTasksForBulk.length === 0) return;
    setAssignedTasks(prev => prev.filter(t => !selectedTasksForBulk.includes(t)));
    setSelectedTasksForBulk([]);
  };

  const handleToggleTaskForBulk = task => {
    setSelectedTasksForBulk(prev =>
      prev.includes(task) ? prev.filter(t => t !== task) : [...prev, task],
    );
  };

  return (
    <main className={`${styles.addTeamContainer}`}>
      <header className={`${styles.addTeamHeader}`}>
        <h2>Create New Team</h2>
      </header>

      <Form className={`${styles.addTeamForm}`} onSubmit={handleSubmit}>
        {/* Team Details */}
        <div className={styles.formSection}>
          <h5 className={styles.sectionTitle}>Team Details</h5>
          <FormGroup>
            <Label for="team-name">
              Team Name<span className={styles.fieldRequired}>*</span>
              <span id="teamNameTooltip" className={styles.tooltipIcon}>
                ?
              </span>
            </Label>
            <Tooltip
              isOpen={teamNameTooltipOpen}
              target="teamNameTooltip"
              toggle={() => setTeamNameTooltipOpen(!teamNameTooltipOpen)}
            >
              Enter a unique name for your team (max 35 characters).
            </Tooltip>
            <Input
              id="team-name"
              type="text"
              name="teamName"
              placeholder="Enter team name"
              value={formData.teamName}
              onChange={event => handleInputChange('teamName', event.target.value)}
              onBlur={handleTeamNameBlur}
            />
            <small className={styles.helperText}>Max 35 characters</small>
            {touchedFields.teamName && errors.teamName && (
              <div className={styles.teamFormError}>{errors.teamName}</div>
            )}
          </FormGroup>
        </div>

        {/* Members */}
        <div className={styles.formSection}>
          <h5 className={styles.sectionTitle}>Members</h5>
          <FormGroup>
            <Label for="members-select">
              Add Members<span className={styles.fieldRequired}>*</span>
              <span id="membersTooltip" className={styles.tooltipIcon}>
                ?
              </span>
            </Label>
            <Tooltip
              isOpen={membersTooltipOpen}
              target="membersTooltip"
              toggle={() => setMembersTooltipOpen(!membersTooltipOpen)}
            >
              At least one member is required. Select from dropdown and click Add.
            </Tooltip>
            <div className={styles.selectContainer}>
              <Input
                id="members-select"
                type="select"
                value={selectedMember}
                onChange={handleMemberChange}
              >
                <option value="">Select a Member</option>
                {Array.isArray(members) &&
                  members.map((user, index) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <option key={index} value={user.id}>
                      {user.firstName} {user.lastName}
                    </option>
                  ))}
              </Input>
              <Button onClick={handleAddMember} type="button" className={styles.addBtn}>
                Add
              </Button>
            </div>
            {touchedFields.assignedMembers && errors.assignedMembers && (
              <div className={styles.teamFormError}>{errors.assignedMembers}</div>
            )}
            {errorMessage && <div className={styles.teamFormError}>{errorMessage}</div>}
          </FormGroup>
          {assignedMembers.length > 0 && (
            <div className={styles.assignedBlock}>
              <div className={styles.assignedHeader}>
                <span className={styles.assignedLabel}>
                  Assigned Members ({assignedMembers.length})
                </span>
                {assignedMembers.length > 1 && (
                  <Button
                    type="button"
                    size="sm"
                    className={styles.bulkRemoveBtn}
                    onClick={handleBulkRemoveMembers}
                    disabled={selectedMembersForBulk.length === 0}
                  >
                    Remove Selected ({selectedMembersForBulk.length})
                  </Button>
                )}
              </div>
              <div className={styles.badgeContainer}>
                {assignedMembers.map((member, index) => {
                  const isSelected = selectedMembersForBulk.includes(member);
                  return (
                    // eslint-disable-next-line react/no-array-index-key
                    <Badge
                      key={index}
                      pill
                      color="info"
                      className={`${styles.assignedBadge} ${
                        isSelected ? styles.badgeSelected : ''
                      }`}
                      onClick={() =>
                        assignedMembers.length > 1 && handleToggleMemberForBulk(member)
                      }
                      style={{ cursor: assignedMembers.length > 1 ? 'pointer' : 'default' }}
                    >
                      {member}
                      <span
                        role="button"
                        tabIndex={0}
                        className={styles.badgeRemove}
                        onClick={e => {
                          e.stopPropagation();
                          handleRemoveMember(member);
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.stopPropagation();
                            handleRemoveMember(member);
                          }
                        }}
                        aria-label={`Remove member ${member}`}
                      >
                        &times;
                      </span>
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Tasks */}
        <div className={styles.formSection}>
          <h5 className={styles.sectionTitle}>Tasks</h5>
          <FormGroup>
            <Label for="tasks-select">
              Add Main Tasks
              <span id="tasksTooltip" className={styles.tooltipIcon}>
                ?
              </span>
            </Label>
            <Tooltip
              isOpen={tasksTooltipOpen}
              target="tasksTooltip"
              toggle={() => setTasksTooltipOpen(!tasksTooltipOpen)}
            >
              Optionally assign tasks to define the team&#39;s responsibilities.
            </Tooltip>
            <div className={styles.selectContainer}>
              <Input
                id="tasks-select"
                type="select"
                value={selectedTask}
                onChange={handleTaskChange}
              >
                <option value="">Select a Task</option>
                {tasks.map((task, index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <option key={index} value={task.id}>
                    {task}
                  </option>
                ))}
              </Input>
              <Button onClick={handleAddTask} type="button" className={styles.addBtn}>
                Add
              </Button>
            </div>
            {taskErrorMessage && <div className={styles.teamFormError}>{taskErrorMessage}</div>}
          </FormGroup>
          {assignedTasks.length > 0 && (
            <div className={styles.assignedBlock}>
              <div className={styles.assignedHeader}>
                <span className={styles.assignedLabel}>
                  Assigned Tasks ({assignedTasks.length})
                </span>
                {assignedTasks.length > 1 && (
                  <Button
                    type="button"
                    size="sm"
                    className={styles.bulkRemoveBtn}
                    onClick={handleBulkRemoveTasks}
                    disabled={selectedTasksForBulk.length === 0}
                  >
                    Remove Selected ({selectedTasksForBulk.length})
                  </Button>
                )}
              </div>
              <div className={styles.badgeContainer}>
                {assignedTasks.map((task, index) => {
                  const isSelected = selectedTasksForBulk.includes(task);
                  return (
                    // eslint-disable-next-line react/no-array-index-key
                    <Badge
                      key={index}
                      pill
                      color="info"
                      className={`${styles.assignedBadge} ${
                        isSelected ? styles.badgeSelected : ''
                      }`}
                      onClick={() => assignedTasks.length > 1 && handleToggleTaskForBulk(task)}
                      style={{ cursor: assignedTasks.length > 1 ? 'pointer' : 'default' }}
                    >
                      {task}
                      <span
                        role="button"
                        tabIndex={0}
                        className={styles.badgeRemove}
                        onClick={e => {
                          e.stopPropagation();
                          handleRemoveTask(task);
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.stopPropagation();
                            handleRemoveTask(task);
                          }
                        }}
                        aria-label={`Remove task ${task}`}
                      >
                        &times;
                      </span>
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Additional Information */}
        <div className={styles.formSection}>
          <h5 className={styles.sectionTitle}>Additional Information</h5>
          <FormGroup>
            <Input
              type="textarea"
              rows="3"
              name="additional-info"
              id="additional-info"
              placeholder="Specify additional info about team if necessary"
              value={formData.additionalInformation}
              onChange={event => handleInputChange('additionalInformation', event.target.value)}
            />
            {errors.additionalInformation && (
              <div className={styles.teamFormError}>{errors.additionalInformation}</div>
            )}
          </FormGroup>
        </div>

        <div className={styles.addTeamButtons}>
          <Button
            id="cancel-button"
            outline
            style={boxStyle}
            onClick={handleCancelClick}
            type="button"
          >
            Cancel
          </Button>
          <Button id="submit-button" style={boxStyle} type="submit" disabled={!isFormValid}>
            Submit
          </Button>
        </div>
      </Form>
    </main>
  );
}
