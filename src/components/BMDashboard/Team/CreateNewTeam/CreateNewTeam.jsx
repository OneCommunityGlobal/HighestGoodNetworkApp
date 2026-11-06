import { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Form, FormGroup, Label, Input, Button, Badge, Tooltip } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import axios from 'axios';
import Joi from 'joi';
import { toast } from 'react-toastify';
import { boxStyle } from '../../../../styles';
import styles from './CreateNewTeam.module.css';
import { getUserProfileBasicInfo } from '../../../../actions/userManagement';
import { postNewTeam, addTeamMember } from '../../../../actions/allTeamsAction';
import { ENDPOINTS } from '../../../../utils/URL';

const TEAM_NAME_MAX = 35;

const initialFormState = {
  teamName: '',
  additionalInformation: '',
  teamMembers: [],
  tasks: [],
};

const initialTouchedState = {
  teamName: false,
  assignedMembers: false,
  additionalInformation: false,
  assignedTasks: false,
};

export default function CreateNewTeam() {
  const history = useHistory();
  const location = useLocation();
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const userProfilesBasicInfo = useSelector(
    state => state.allUserProfilesBasicInfo?.userProfilesBasicInfo,
  );
  const [selectedMember, setSelectedMember] = useState('');
  const [members, setMembers] = useState([]);
  const [assignedMembers, setAssignedMembers] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [taskErrorMessage, setTaskErrorMessage] = useState('');
  const [selectedMembersForBulk, setSelectedMembersForBulk] = useState([]);
  const [selectedTasksForBulk, setSelectedTasksForBulk] = useState([]);
  // Locks the form while the team is being created to prevent double submits
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [teamNameTooltipOpen, setTeamNameTooltipOpen] = useState(false);
  const [membersTooltipOpen, setMembersTooltipOpen] = useState(false);
  const [tasksTooltipOpen, setTasksTooltipOpen] = useState(false);

  const [touchedFields, setTouchedFields] = useState(initialTouchedState);
  // True until the members request finishes (the store can hold an empty array before that)
  const [membersLoading, setMembersLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    setMembersLoading(true);
    const finishLoading = () => {
      if (isActive) setMembersLoading(false);
    };
    // Errors are handled by the action; either way the loading state must end
    Promise.resolve(dispatch(getUserProfileBasicInfo({ source: 'CreateNewTeam' })))
      .then(finishLoading)
      .catch(finishLoading);
    return () => {
      isActive = false;
    };
  }, [dispatch]);

  useEffect(() => {
    // Restore saved draft when returning from WBS task selection
    const saved = sessionStorage.getItem('createTeamDraft');
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        setFormData(draft.formData || initialFormState);
        setAssignedMembers(draft.assignedMembers || []);
        setAssignedTasks(draft.assignedTasks || []);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to parse saved team draft:', e);
      }
      sessionStorage.removeItem('createTeamDraft');
    }
    // Add task selected from WBS page, then clear the location state so it
    // doesn't re-apply on subsequent visits / refreshes
    if (location.state?.selectedTask) {
      const task = location.state.selectedTask;
      setAssignedTasks(prev => (prev.some(t => t.id === task.id) ? prev : [...prev, task]));
      // Returning from task selection counts as interacting with the Tasks field
      setTouchedFields(prev => ({ ...prev, assignedTasks: true }));
      history.replace(location.pathname, {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      .trim()
      .required()
      .max(TEAM_NAME_MAX),
  };

  const schema = Joi.object(validationObj).unknown();

  const validate = (data, membersList) => {
    const result = schema.validate(data, { abortEarly: false });
    const errorMessages = {};
    if (result.error) {
      result.error.details.forEach(detail => {
        if (detail.path[0] === 'teamName') {
          if (detail.type === 'string.empty' || detail.type === 'any.required') {
            errorMessages.teamName = 'Team name is required.';
          } else if (detail.type === 'string.max') {
            errorMessages.teamName = `Team name must be ${TEAM_NAME_MAX} characters or fewer.`;
          } else {
            errorMessages[detail.path[0]] = detail.message;
          }
        } else {
          errorMessages[detail.path[0]] = detail.message;
        }
      });
    }
    const currentMembers = membersList === undefined ? assignedMembers : membersList;
    if (currentMembers.length === 0) {
      errorMessages.assignedMembers = 'You must assign at least one member.';
    }
    if (assignedTasks.length === 0) {
      errorMessages.assignedTasks = 'You must assign at least one task.';
    }
    return Object.keys(errorMessages).length > 0 ? errorMessages : null;
  };

  const isFormValid =
    formData.teamName.trim().length > 0 &&
    formData.teamName.length <= TEAM_NAME_MAX &&
    assignedMembers.length > 0 &&
    assignedTasks.length > 0;

  // Once the user has interacted with any field, show all missing requirements so it is
  // clear why Submit is disabled (Submit cannot be clicked to reveal them)
  const hasInteracted = Object.values(touchedFields).some(Boolean);

  useEffect(() => {
    // Only trigger validation if the form is touched (fields are interacted with)
    if (hasInteracted) {
      const validationErrors = validate({ ...formData, teamMembers: assignedMembers });
      setErrors(validationErrors || {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignedMembers, assignedTasks, touchedFields]);

  const handleInputChange = (name, value) => {
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);

    // Live validation after the first interaction, so errors clear as the user fixes them
    if (hasInteracted) {
      const validationErrors = validate(updatedData);
      setErrors(validationErrors || {});
    }
  };

  const handleTeamNameBlur = () => {
    setTouchedFields(prevState => ({ ...prevState, teamName: true }));
    const validationErrors = validate(formData); // Trigger validation when field loses focus
    setErrors(validationErrors || {});
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setAssignedMembers([]);
    setAssignedTasks([]);
    setErrors({});
    setSelectedMember('');
    setSelectedMembersForBulk([]);
    setSelectedTasksForBulk([]);
    setTaskErrorMessage('');
    setErrorMessage('');
    setTouchedFields(initialTouchedState);
  };

  const handleSubmit = async event => {
    event.preventDefault();
    if (isSubmitting) return;

    setTouchedFields({
      teamName: true,
      assignedMembers: true,
      additionalInformation: true,
      assignedTasks: true,
    });
    const validationErrors = validate(formData);
    setErrors(validationErrors || {});
    if (validationErrors) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await dispatch(postNewTeam(formData.teamName.trim(), true));
      if (res?.status !== 200) {
        const errMsg = res?.data?.error || res?.message || 'Failed to create team.';
        toast.error(errMsg);
        return;
      }

      const newTeamId = res.data._id;

      // Assign each selected member to the newly created team
      await Promise.all(assignedMembers.map(userId => dispatch(addTeamMember(newTeamId, userId))));

      // Add assigned members as resources on each assigned task
      if (assignedTasks.length > 0 && assignedMembers.length > 0) {
        const memberResources = assignedMembers.map(userId => {
          const user = members.find(u => u._id === userId);
          return {
            userID: userId,
            name: user ? `${user.firstName} ${user.lastName}` : userId,
            profilePic: user?.profilePic || '',
          };
        });
        await Promise.all(
          assignedTasks.map(async task => {
            const taskRes = await axios.get(ENDPOINTS.GET_TASK(task.id));
            const existingResources = taskRes.data?.resources || [];
            const existingIds = new Set(existingResources.map(r => r.userID));
            const newResources = [
              ...existingResources,
              ...memberResources.filter(r => !existingIds.has(r.userID)),
            ];
            await axios.put(ENDPOINTS.TASK_UPDATE(task.id), {
              ...taskRes.data,
              resources: newResources,
              isAssigned: newResources.length > 0,
            });
          }),
        );
      }

      // Confirmation with next-step guidance
      const memberCount = assignedMembers.length;
      const taskCount = assignedTasks.length;
      toast.success(
        `Team "${formData.teamName.trim()}" created with ${memberCount} member${
          memberCount === 1 ? '' : 's'
        } and ${taskCount} task${
          taskCount === 1 ? '' : 's'
        }. You can now manage it from the Teams page, or create another team below.`,
      );
      // Reset form after successful submission, stay on same page
      resetForm();
    } catch (err) {
      const errMsg =
        err?.response?.data?.error ||
        err?.message ||
        'An unexpected error occurred. Please try again.';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelClick = () => {
    resetForm();
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
    setTouchedFields(prev => ({ ...prev, assignedMembers: true }));
    setSelectedMember('');
  };

  const handleRemoveMember = member => {
    setAssignedMembers(assignedMembers.filter(m => m !== member));
    setSelectedMembersForBulk(prev => prev.filter(m => m !== member));
    setTouchedFields(prev => ({ ...prev, assignedMembers: true }));
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

  const handleOpenTaskModal = () => {
    setTaskErrorMessage('');
    sessionStorage.setItem(
      'createTeamDraft',
      JSON.stringify({ formData, assignedMembers, assignedTasks }),
    );
    history.push('/projects', { taskSelectionMode: true, returnPath: '/bmdashboard/AddNewTeam' });
  };

  const handleRemoveTask = task => {
    setAssignedTasks(assignedTasks.filter(t => t.id !== task.id));
    setSelectedTasksForBulk(prev => prev.filter(taskId => taskId !== task.id));
    setTouchedFields(prev => ({ ...prev, assignedTasks: true }));
  };

  const handleBulkRemoveTasks = () => {
    if (selectedTasksForBulk.length === 0) return;
    setAssignedTasks(prev => prev.filter(task => !selectedTasksForBulk.includes(task.id)));
    setSelectedTasksForBulk([]);
  };

  const handleToggleTaskForBulk = task => {
    setSelectedTasksForBulk(prev =>
      prev.includes(task.id) ? prev.filter(taskId => taskId !== task.id) : [...prev, task.id],
    );
  };

  // Tooltips open on keyboard focus; Escape closes them
  const handleTooltipKeyDown = (event, close) => {
    if (event.key === 'Escape') close();
  };

  const getMemberName = memberId => {
    const memberInfo = members.find(u => u._id === memberId);
    return memberInfo ? `${memberInfo.firstName} ${memberInfo.lastName}` : memberId;
  };

  const teamNameError = touchedFields.teamName ? errors.teamName : undefined;
  const membersError =
    (touchedFields.assignedMembers || hasInteracted) && errors.assignedMembers
      ? errors.assignedMembers
      : undefined;
  const tasksError =
    (touchedFields.assignedTasks || hasInteracted) && errors.assignedTasks
      ? errors.assignedTasks
      : undefined;
  const teamNameLength = formData.teamName.length;

  return (
    <main className={`${styles.addTeamContainer}`}>
      <header className={`${styles.addTeamHeader}`}>
        <h2>Create New Team</h2>
      </header>

      <Form className={`${styles.addTeamForm}`} onSubmit={handleSubmit} noValidate>
        {/* Team Details */}
        <div className={styles.formSection}>
          <h5 className={styles.sectionTitle}>Team Details</h5>
          <FormGroup>
            <Label for="team-name">
              Team Name<span className={styles.fieldRequired}>*</span>
              <button
                type="button"
                id="teamNameTooltip"
                className={styles.tooltipIcon}
                aria-label="Team name help"
                onKeyDown={e => handleTooltipKeyDown(e, () => setTeamNameTooltipOpen(false))}
              >
                ?
              </button>
            </Label>
            <Tooltip
              isOpen={teamNameTooltipOpen}
              target="teamNameTooltip"
              toggle={() => setTeamNameTooltipOpen(!teamNameTooltipOpen)}
            >
              Enter a unique name for your team (max {TEAM_NAME_MAX} characters).
            </Tooltip>
            <Input
              id="team-name"
              type="text"
              name="teamName"
              placeholder="Enter team name"
              value={formData.teamName}
              onChange={event => handleInputChange('teamName', event.target.value)}
              onBlur={handleTeamNameBlur}
              invalid={Boolean(teamNameError)}
              aria-invalid={Boolean(teamNameError)}
              aria-describedby="team-name-help team-name-error"
              disabled={isSubmitting}
            />
            <small
              id="team-name-help"
              className={teamNameLength > TEAM_NAME_MAX ? styles.helperTextOver : styles.helperText}
            >
              {teamNameLength}/{TEAM_NAME_MAX} characters
            </small>
            {teamNameError && (
              <div id="team-name-error" className={styles.teamFormError} role="alert">
                {teamNameError}
              </div>
            )}
          </FormGroup>
        </div>

        {/* Members */}
        <div className={styles.formSection}>
          <h5 className={styles.sectionTitle}>Members</h5>
          <FormGroup>
            <Label for="members-select">
              Add Members<span className={styles.fieldRequired}>*</span>
              <button
                type="button"
                id="membersTooltip"
                className={styles.tooltipIcon}
                aria-label="Members help"
                onKeyDown={e => handleTooltipKeyDown(e, () => setMembersTooltipOpen(false))}
              >
                ?
              </button>
            </Label>
            <Tooltip
              isOpen={membersTooltipOpen}
              target="membersTooltip"
              toggle={() => setMembersTooltipOpen(!membersTooltipOpen)}
            >
              At least one member is required. Select from dropdown and click Add.
            </Tooltip>
            <div className={styles.selectContainer}>
              <Select
                inputId="members-select"
                options={members}
                getOptionLabel={user => `${user.firstName} ${user.lastName}`}
                getOptionValue={user => user._id}
                // Already-assigned members are shown but cannot be picked again
                isOptionDisabled={user => assignedMembers.includes(user._id)}
                value={members.find(user => user._id === selectedMember) || null}
                onChange={user => handleMemberChange({ target: { value: user?._id || '' } })}
                placeholder={membersLoading ? 'Loading members…' : 'Select a Member'}
                isLoading={membersLoading}
                isDisabled={membersLoading || isSubmitting}
                noOptionsMessage={() => 'No members found'}
                aria-describedby={membersError ? 'members-error' : undefined}
                isSearchable
                styles={{
                  container: base => ({
                    ...base,
                    flex: 1,
                    minWidth: 0,
                    '--member-bg': '#fff',
                    '--member-text': '#333',
                    '--member-muted': '#666',
                    '--member-hover': '#fef0db',
                    '--member-disabled': '#aaa',
                    'body.dark-mode &, body.bm-dashboard-dark &': {
                      '--member-bg': '#2e5061',
                      '--member-text': '#fff',
                      '--member-muted': '#b8c5d1',
                      '--member-hover': '#3a506b',
                      '--member-disabled': '#7f93a3',
                    },
                  }),
                  input: base => ({ ...base, '& input': { boxShadow: 'none !important' } }),
                  option: (base, state) =>
                    state.isDisabled
                      ? { ...base, color: 'var(--member-disabled)', cursor: 'not-allowed' }
                      : base,
                }}
                theme={theme => ({
                  ...theme,
                  borderRadius: 6,
                  colors: {
                    ...theme.colors,
                    neutral0: 'var(--member-bg)',
                    neutral80: 'var(--member-text)',
                    neutral50: 'var(--member-muted)',
                    primary25: 'var(--member-hover)',
                    primary50: 'var(--member-hover)',
                    primary: '#f49441',
                  },
                })}
              />
              <Button
                onClick={handleAddMember}
                type="button"
                className={styles.addBtn}
                disabled={!selectedMember || membersLoading || isSubmitting}
              >
                Add
              </Button>
            </div>
            {membersError && (
              <div id="members-error" className={styles.teamFormError} role="alert">
                {membersError}
              </div>
            )}
            {errorMessage && (
              <div className={styles.teamFormError} role="alert">
                {errorMessage}
              </div>
            )}
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
                    disabled={selectedMembersForBulk.length === 0 || isSubmitting}
                  >
                    Remove Selected ({selectedMembersForBulk.length})
                  </Button>
                )}
              </div>
              <div className={styles.badgeContainer}>
                {assignedMembers.map(member => {
                  const isSelected = selectedMembersForBulk.includes(member);
                  const memberName = getMemberName(member);
                  return (
                    <Badge
                      key={member}
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
                      {memberName}
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
                        aria-label={`Remove member ${memberName}`}
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
              Add Main Tasks<span className={styles.fieldRequired}>*</span>{' '}
              <button
                type="button"
                id="tasksTooltip"
                className={styles.tooltipIcon}
                aria-label="Tasks help"
                onKeyDown={e => handleTooltipKeyDown(e, () => setTasksTooltipOpen(false))}
              >
                ?
              </button>
            </Label>
            <Tooltip
              isOpen={tasksTooltipOpen}
              target="tasksTooltip"
              toggle={() => setTasksTooltipOpen(!tasksTooltipOpen)}
            >
              At least one task is required. Click &#34;Select Task&#34; to assign tasks to the
              team.
            </Tooltip>
            <div className={styles.selectContainer}>
              <Input
                id="tasks-select"
                type="text"
                value="Select a Task"
                className={styles.taskSelectInput}
                aria-describedby={tasksError ? 'tasks-error' : undefined}
                readOnly
              />
              <Button
                onClick={handleOpenTaskModal}
                type="button"
                className={styles.addBtn}
                disabled={isSubmitting}
              >
                Select Task
              </Button>
            </div>
            {tasksError && (
              <div id="tasks-error" className={styles.teamFormError} role="alert">
                {tasksError}
              </div>
            )}
            {taskErrorMessage && (
              <div className={styles.teamFormError} role="alert">
                {taskErrorMessage}
              </div>
            )}
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
                    disabled={selectedTasksForBulk.length === 0 || isSubmitting}
                  >
                    Remove Selected ({selectedTasksForBulk.length})
                  </Button>
                )}
              </div>
              <div className={styles.badgeContainer}>
                {assignedTasks.map(task => {
                  const isSelected = selectedTasksForBulk.includes(task.id);
                  return (
                    <Badge
                      key={task.id}
                      pill
                      color="info"
                      className={`${styles.assignedBadge} ${
                        isSelected ? styles.badgeSelected : ''
                      }`}
                      onClick={() => assignedTasks.length > 1 && handleToggleTaskForBulk(task)}
                      style={{ cursor: assignedTasks.length > 1 ? 'pointer' : 'default' }}
                    >
                      {task.projectName} / {task.wbsName} / {task.name}
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
                        aria-label={`Remove task ${task.name}`}
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
              disabled={isSubmitting}
            />
            {errors.additionalInformation && (
              <div className={styles.teamFormError} role="alert">
                {errors.additionalInformation}
              </div>
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
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            id="submit-button"
            style={boxStyle}
            type="submit"
            disabled={!isFormValid || isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? 'Creating…' : 'Submit'}
          </Button>
        </div>
      </Form>
    </main>
  );
}
