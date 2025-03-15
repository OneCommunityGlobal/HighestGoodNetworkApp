import React from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Alert,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  ListGroup,
  ListGroupItem,
  Badge,
  Spinner,
  Row,
  Col,
} from 'reactstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
// Remove unused import
// import { MultiSelect } from 'react-multi-select-component';
import {
  getAllUserTeams,
  postNewTeam,
  deleteTeam,
  updateTeam,
  getTeamMembers,
  addTeamMember,
  deleteTeamMember,
  updateTeamsAfterModalAction,
} from '../../actions/allTeamsAction';

// Custom CSS for the modal
const styles = {
  modalHeader: {
    borderBottom: '1px solid #dee2e6',
  },
  modalHeaderDark: {
    borderBottom: '1px solid #444',
  },
  modalBody: {
    padding: '1.5rem',
  },
  modalFooter: {
    borderTop: '1px solid #dee2e6',
  },
  modalFooterDark: {
    borderTop: '1px solid #444',
  },
  selected: {
    borderLeft: '4px solid #007bff',
  },
  selectedDark: {
    borderLeft: '4px solid #1f88ff',
  },
  navTabs: {
    borderBottom: '1px solid #dee2e6',
  },
  navTabsDark: {
    borderBottom: '1px solid #444',
  },
  navLink: {
    cursor: 'pointer',
  },
  tabContent: {
    padding: '1rem 0',
  },
};

// Regex for validating team code (5-7 characters)
const teamCodeRegex = /^.{5,7}$/;

// Use function declaration instead of arrow function for component
function CustomTeamCodeModal({
  isOpen,
  toggle,
  darkMode,
  getAllUserTeams: getUserTeams, // Rename props to avoid shadowing
  postNewTeam: createNewTeam,
  deleteTeam: removeTeam,
  updateTeamsAfterModalAction,
  onTeamCreated,
  // eslint-disable-next-line no-unused-vars
  updateTeam: modifyTeam,
  getTeamMembers: fetchTeamMembers,
  addTeamMember: addMember,
  deleteTeamMember: removeMember,
  auth,
}) {
  const [activeTab, setActiveTab] = React.useState('1');
  const [teams, setTeams] = React.useState([]);
  const [customTeams, setCustomTeams] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [success, setSuccess] = React.useState(null);

  // New team form state
  const [newTeamName, setNewTeamName] = React.useState('');
  const [newTeamCode, setNewTeamCode] = React.useState('');
  const [selectedMembers, setSelectedMembers] = React.useState([]);

  // Edit team state
  const [selectedTeam, setSelectedTeam] = React.useState(null);
  const [teamMembers, setTeamMembers] = React.useState([]);
  const [teamMembersLoading, setTeamMembersLoading] = React.useState(false);

  // Member selection options
  const [usersByTeam, setUsersByTeam] = React.useState({});
  const [loadingTeamMembers, setLoadingTeamMembers] = React.useState({});

  // Define fetchTeams and handleSelectTeam before they're used anywhere
  const fetchTeams = async () => {
    setLoading(true);
    setError(null);

    try {
      const teamsData = await getUserTeams(); // Use the prop method directly

      // Ensure teamsData is processed correctly
      const teams = Array.isArray(teamsData) ? teamsData : teamsData.teams || teamsData || [];

      if (teams.length > 0) {
        setTeams(teams);

        // Filter custom teams
        const customTeamsData = teams.filter(team => team.teamCode && team.teamCode.length > 0);
        console.log('Custom teams after filtering:', customTeamsData);
        setCustomTeams(customTeamsData);

        // Create team code groups
        const teamCodeGroup = {};
        teams.forEach(team => {
          const code = team.teamCode || 'noCodeLabel';
          if (teamCodeGroup[code]) {
            teamCodeGroup[code].push(team);
          } else {
            teamCodeGroup[code] = [team];
          }
        });

        // Prepare team codes
        const teamCodes = Object.keys(teamCodeGroup)
          .filter(code => code !== 'noCodeLabel')
          .map(code => ({
            value: code,
            label: `${code} (${teamCodeGroup[code].length})`,
            _ids: teamCodeGroup[code]?.map(item => item._id),
          }))
          .sort((a, b) => `${a.label}`.localeCompare(`${b.label}`));

        // Add "No Code" option
        teamCodes.push({
          value: '',
          label: `Select All With NO Code (${teamCodeGroup.noCodeLabel?.length || 0})`,
          _ids: teamCodeGroup?.noCodeLabel?.map(item => item._id),
        });

        // Initialize users by team
        const usersByTeamMap = {};
        teamCodes.forEach(teamCode => {
          usersByTeamMap[teamCode.value] = [];
        });

        setUsersByTeam(usersByTeamMap);
      } else {
        console.warn('No teams data received');
        setTeams([]);
        setCustomTeams([]);
        setUsersByTeam({});
      }
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError('Failed to load teams. Please try again.');
      setTeams([]);
      setCustomTeams([]);
      setUsersByTeam({});
    } finally {
      setLoading(false);
    }
  };

  // Define handleSelectTeam before it's used (especially in handleUpdateTeam)
  const handleSelectTeam = async team => {
    setSelectedTeam(team);
    setTeamMembersLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const members = await fetchTeamMembers(team._id);
      if (members && Array.isArray(members)) {
        setTeamMembers(members);
      } else {
        setTeamMembers([]);
        // console.error('Invalid members data:', members);
      }
    } catch (err) {
      // console.error('Error fetching team members:', err);
      setError('Failed to load team members. Please try again.');
    } finally {
      setTeamMembersLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      fetchTeams();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleUpdateTeam = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!selectedTeam) {
        setError('No team selected for update.');
        setLoading(false);
        return;
      }

      // Get current team members
      const currentMembers = new Set(teamMembers.map(member => member._id));

      // Find members to add (in selectedMembers but not in currentMembers)
      const membersToAdd = selectedMembers.filter(member => !currentMembers.has(member.value));

      // Add new members
      if (membersToAdd.length > 0) {
        try {
          // Use Promise.all instead of for...of loop with await
          await Promise.all(
            membersToAdd.map(async member => {
              const nameParts = member.label.split(' ');
              const firstName = nameParts[0] || '';
              const lastName = nameParts.slice(1).join(' ') || '';

              return addMember(selectedTeam._id, member.value, firstName, lastName);
            }),
          );

          setSuccess('Team members updated successfully!');
        } catch (memberErr) {
          setError('Some members could not be added. Please try again.');
          // console.error('Error adding members:', memberErr);
        }
      } else {
        setSuccess('No new members to add.');
      }

      // Reset form and refresh
      setActiveTab('1');
      fetchTeams();
      handleSelectTeam(selectedTeam);
    } catch (err) {
      setError('An error occurred. Please try again.');
      // console.error('Error updating team:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to load members for a specific team code on demand
  const loadMembersForTeamCode = async teamCode => {
    // If already loading or already loaded with members, don't reload
    if (
      loadingTeamMembers[teamCode] ||
      (usersByTeam[teamCode] && usersByTeam[teamCode].length > 0)
    ) {
      return;
    }

    // Set loading state for this team code
    setLoadingTeamMembers(prev => ({
      ...prev,
      [teamCode]: true,
    }));

    try {
      // Find all teams with this team code
      const teamsWithCode = teams.filter(team => (team.teamCode || 'No Code') === teamCode);
      const membersList = [];
      const processedMemberIds = new Set(); // To avoid duplicates

      // Use Promise.all instead of for...of with await
      await Promise.all(
        teamsWithCode.map(async team => {
          try {
            const members = await fetchTeamMembers(team._id);

            if (members && members.length > 0) {
              members.forEach(member => {
                if (!processedMemberIds.has(member._id)) {
                  processedMemberIds.add(member._id);

                  membersList.push({
                    value: member._id,
                    label: `${member.firstName || ''} ${member.lastName || ''}`.trim(),
                    teamCode,
                    teamName: team.teamName,
                    role: member.role,
                  });
                }
              });
            }
          } catch (err) {
            // console.error(`Error fetching members for team ${team._id}:`, err);
          }
        }),
      );

      // Update the usersByTeam state
      setUsersByTeam(prev => ({
        ...prev,
        [teamCode]: membersList,
      }));
    } catch (err) {
      // console.error(`Error loading members for team code ${teamCode}:`, err);
    } finally {
      // Clear loading state
      setLoadingTeamMembers(prev => ({
        ...prev,
        [teamCode]: false,
      }));
    }
  };

  const toggleTab = tab => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      setError(null);
      setSuccess(null);
    }
  };

  // In CustomTeamCodeModal.js - handleCreateTeam method
  const handleCreateTeam = async e => {
    e.preventDefault();
    console.log('STEP 1: Starting team creation');
    setLoading(true);
    setError(null);

    try {
      console.log(`STEP 2: Creating team "${newTeamName}" with code "${newTeamCode}"`);
      const response = await createNewTeam(newTeamName, true, null, auth.user, newTeamCode);
      console.log('STEP 3: Create team response:', response);

      if (response && response.status === 200 && response.data) {
        console.log('STEP 4: Team creation successful, new team data:', response.data);
        const newTeamId = response.data._id;
        // Get current teams first
        try {
          console.log('STEP 5: Fetching updated teams from server');
          const teamsData = await getUserTeams();
          console.log('STEP 6: Updated teams data received, team count:', teamsData.teams.length);
          const newTeamExists = teamsData.teams.some(
            team => team._id === response.data._id || team.teamCode === newTeamCode,
          );
          console.log(`STEP 7: New team exists in updated data? ${newTeamExists}`);

          console.log('STEP 8: Dispatching updateTeamsAfterModalAction');
          // Ensure the new team is included in the Redux store
          await updateTeamsAfterModalAction(teamsData.teams);
          console.log('STEP 9: updateTeamsAfterModalAction completed');

          if (selectedMembers.length > 0) {
            console.log(`Adding ${selectedMembers.length} members to team ${newTeamId}`);

            // Use Promise.all for parallel processing of member additions
            await Promise.all(
              selectedMembers.map(member =>
                addMember(
                  newTeamId,
                  member.value, // Member ID
                  member.label.split(' ')[0] || '', // First name (simple extraction)
                  member.label
                    .split(' ')
                    .slice(1)
                    .join(' ') || '', // Last name
                ),
              ),
            );
          }

          setSuccess('Team created successfully');
          console.log('STEP 10: Calling fetchTeams to update modal');
          setNewTeamName('');
          setNewTeamCode('');

          // Fetch updated teams for the modal
          await fetchTeams();
          console.log('STEP 11: fetchTeams completed');

          // Notify parent component
          if (onTeamCreated) {
            console.log('STEP 12: Calling onTeamCreated callback');
            onTeamCreated(response.data);
          } else {
            console.log('STEP 12: No onTeamCreated callback provided');
          }
        } catch (updateError) {
          console.error('Error updating teams after creation:', updateError);
          setError('Team was created but there was an error updating the display');
        }
      } else {
        setError('Failed to create team - invalid response');
      }
    } catch (createError) {
      console.error('Team creation error:', createError);
      setError('Failed to create team: ' + (createError.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async teamId => {
    if (window.confirm('Are you sure you want to delete this custom team?')) {
      try {
        await removeTeam(teamId, auth.user);

        // Fetch updated teams
        const updatedTeamsData = await getUserTeams();

        // Dispatch the update
        await updateTeamsAfterModalAction(updatedTeamsData.teams);

        setSuccess('Team deleted successfully');
        fetchTeams();
      } catch (error) {
        setError('Failed to delete team');
      }
    }
  };

  // Add a function to add members to an existing team
  const handleAddMembers = async () => {
    if (!selectedTeam) return;

    setActiveTab('2'); // Switch to create tab which has the member selection UI
    setNewTeamName(selectedTeam.teamName);
    setNewTeamCode(selectedTeam.teamCode);

    // Pre-select existing members
    if (teamMembers && teamMembers.length > 0) {
      const existingMembers = teamMembers.map(member => ({
        value: member._id,
        label: `${member.firstName} ${member.lastName}`,
        teamCode: member.teamCode || 'No Code',
      }));

      setSelectedMembers(existingMembers);
    }
  };

  const renderCreateTeamForm = () => (
    <Form onSubmit={handleCreateTeam}>
      <FormGroup>
        <Label for="teamName">Team Name</Label>
        <Input
          type="text"
          name="teamName"
          id="teamName"
          placeholder="Enter team name"
          value={newTeamName}
          onChange={e => setNewTeamName(e.target.value)}
          required
          className={darkMode ? 'bg-dark text-light' : ''}
          disabled={selectedTeam !== null}
        />
        {selectedTeam && (
          <small className="form-text text-muted">
            Team name cannot be changed when updating members.
          </small>
        )}
      </FormGroup>
      <FormGroup>
        <Label for="teamCode">Team Code (5-7 characters)</Label>
        <Input
          type="text"
          name="teamCode"
          id="teamCode"
          placeholder="Enter team code"
          value={newTeamCode}
          onChange={e => setNewTeamCode(e.target.value)}
          required
          className={darkMode ? 'bg-dark text-light' : ''}
          disabled={selectedTeam !== null}
        />
        <small className="form-text text-muted">
          {selectedTeam
            ? 'Team code cannot be changed when updating members.'
            : 'Team code must be between 5 and 7 characters long.'}
        </small>
      </FormGroup>
      <FormGroup>
        <Label>Team Members</Label>
        <div className="mb-2">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6>Currently Selected: {selectedMembers.length} members</h6>
            {selectedMembers.length > 0 && (
              <Button color="secondary" size="sm" onClick={() => setSelectedMembers([])}>
                Clear All
              </Button>
            )}
          </div>

          <ListGroup className="mb-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {selectedMembers.length > 0 ? (
              selectedMembers.map(member => (
                <ListGroupItem
                  key={member.value}
                  className={darkMode ? 'bg-dark text-light border-secondary' : ''}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{member.label}</strong>
                      <br />
                      <small>
                        Team: {member.teamCode === 'No Code' ? 'No Team Code' : member.teamCode}
                      </small>
                    </div>
                    <Button
                      color="danger"
                      size="sm"
                      onClick={() => {
                        setSelectedMembers(selectedMembers.filter(m => m.value !== member.value));
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </ListGroupItem>
              ))
            ) : (
              <ListGroupItem className="text-center">No members selected</ListGroupItem>
            )}
          </ListGroup>
        </div>

        <div className="mb-3">
          <h6>Select Members by Team</h6>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {Object.keys(usersByTeam)
              .sort()
              .map(teamCode => (
                <div
                  key={teamCode}
                  className="mb-3 p-2"
                  style={{ border: '1px solid #dee2e6', borderRadius: '0.25rem' }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0">
                      {teamCode === 'No Code' ? 'No Team Code' : `Team: ${teamCode}`}
                      {usersByTeam[teamCode] && usersByTeam[teamCode].length > 0 && (
                        <Badge color="info" className="ml-2">
                          {usersByTeam[teamCode].length}
                        </Badge>
                      )}
                    </h6>
                    <Button
                      color="primary"
                      size="sm"
                      onClick={() => loadMembersForTeamCode(teamCode)}
                      disabled={loadingTeamMembers[teamCode]}
                    >
                      {/* Use conditional rendering to avoid nested ternary */}
                      {loadingTeamMembers[teamCode] && (
                        <>
                          <Spinner size="sm" /> Loading...
                        </>
                      )}
                      {!loadingTeamMembers[teamCode] &&
                        usersByTeam[teamCode] &&
                        usersByTeam[teamCode].length > 0 &&
                        `${usersByTeam[teamCode].length} Members`}
                      {!loadingTeamMembers[teamCode] &&
                        (!usersByTeam[teamCode] || usersByTeam[teamCode].length === 0) &&
                        'Load Members'}
                    </Button>
                  </div>

                  {usersByTeam[teamCode] && usersByTeam[teamCode].length > 0 && (
                    <>
                      <div className="d-flex justify-content-end mb-2">
                        <Button
                          color="primary"
                          size="sm"
                          className="mr-1"
                          onClick={() => {
                            // Select all from this team
                            const teamMembersList = usersByTeam[teamCode] || [];
                            const otherTeamMembers = selectedMembers.filter(
                              member => !teamMembersList.some(m => m.value === member.value),
                            );
                            setSelectedMembers([...otherTeamMembers, ...teamMembersList]);
                          }}
                        >
                          Select All
                        </Button>
                        <Button
                          color="secondary"
                          size="sm"
                          onClick={() => {
                            // Deselect all from this team
                            setSelectedMembers(
                              selectedMembers.filter(
                                member =>
                                  !usersByTeam[teamCode] ||
                                  !usersByTeam[teamCode].some(m => m.value === member.value),
                              ),
                            );
                          }}
                        >
                          Clear
                        </Button>
                      </div>

                      <ListGroup>
                        {usersByTeam[teamCode].map(member => (
                          <ListGroupItem
                            key={member.value}
                            className={`d-flex justify-content-between align-items-center ${
                              darkMode ? 'bg-dark text-light border-secondary' : ''
                            }`}
                          >
                            <div>
                              {member.label}
                              {member.role && (
                                <small className="d-block text-muted">{member.role}</small>
                              )}
                            </div>
                            <div>
                              <Input
                                type="checkbox"
                                checked={selectedMembers.some(m => m.value === member.value)}
                                onChange={e => {
                                  if (e.target.checked) {
                                    setSelectedMembers([...selectedMembers, member]);
                                  } else {
                                    setSelectedMembers(
                                      selectedMembers.filter(m => m.value !== member.value),
                                    );
                                  }
                                }}
                              />
                            </div>
                          </ListGroupItem>
                        ))}
                      </ListGroup>
                    </>
                  )}
                </div>
              ))}
          </div>
        </div>
      </FormGroup>
      <div className="d-flex">
        {selectedTeam ? (
          <>
            <Button
              color="primary"
              type="button"
              disabled={loading}
              onClick={handleUpdateTeam}
              className="mr-2"
            >
              {loading ? <Spinner size="sm" /> : 'Update Team Members'}
            </Button>
            <Button
              color="secondary"
              type="button"
              onClick={() => {
                setSelectedTeam(null);
                setNewTeamName('');
                setNewTeamCode('');
                setSelectedMembers([]);
              }}
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button color="primary" type="submit" disabled={loading}>
            {loading ? <Spinner size="sm" /> : 'Create Custom Code'}
          </Button>
        )}
      </div>
    </Form>
  );

  // Update the UI based on whether we're creating a new team or modifying an existing one
  const getFormTitle = () => {
    if (selectedTeam) {
      return `Update Members for Team: ${selectedTeam.teamName} (${selectedTeam.teamCode})`;
    }
    return 'Create New Custom Team';
  };

  const renderViewTeams = () => (
    <div>
      <Row>
        <Col md={4}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>Custom Teams</h5>
          </div>

          {customTeams.length === 0 ? (
            <div className="text-center p-4 border rounded">
              <p>No custom teams created yet.</p>
              <Button color="primary" size="sm" onClick={() => toggleTab('2')}>
                Create Your First Team
              </Button>
            </div>
          ) : (
            <ListGroup
              className="custom-team-list"
              style={{ maxHeight: '500px', overflowY: 'auto' }}
            >
              {customTeams.map(team => (
                <ListGroupItem
                  key={team._id}
                  action
                  active={selectedTeam && selectedTeam._id === team._id}
                  onClick={() => handleSelectTeam(team)}
                  className={`
                    ${darkMode ? 'bg-dark text-light border-secondary' : ''}
                    ${selectedTeam && selectedTeam._id === team._id ? '' : ''}
                    ${
                      selectedTeam && selectedTeam._id === team._id && darkMode
                        ? 'selected-dark'
                        : ''
                    }
                    ${selectedTeam && selectedTeam._id === team._id && !darkMode ? 'selected' : ''}
                  `}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{team.teamName}</strong>
                    </div>
                  </div>
                </ListGroupItem>
              ))}
            </ListGroup>
          )}
        </Col>
        <Col md={8}>
          {selectedTeam ? (
            <div className={`p-3 border rounded ${darkMode ? 'bg-dark border-secondary' : ''}`}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h5 className="mb-0">{selectedTeam.teamName}</h5>
                </div>
                <Button color="danger" size="sm" onClick={() => handleDeleteTeam(selectedTeam._id)}>
                  Delete
                </Button>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6>Team Members</h6>
              </div>

              {teamMembersLoading ? (
                <div className="text-center py-3">
                  <Spinner />
                  <p className="mt-2">Loading team members...</p>
                </div>
              ) : (
                <div className="member-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {teamMembers && teamMembers.length > 0 ? (
                    <ListGroup>
                      {teamMembers.map(member => (
                        <ListGroupItem
                          key={member._id}
                          className={darkMode ? 'bg-dark text-light border-secondary' : ''}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <strong>
                                {member.firstName} {member.lastName}
                              </strong>
                              <div>
                                {/* Split ternary into two parts */}
                                {member.role === 'Owner' || member.role === 'Administrator' ? (
                                  <Badge color="warning" className="mr-2">
                                    {member.role}
                                  </Badge>
                                ) : (
                                  <Badge color="info" className="mr-2">
                                    {member.role}
                                  </Badge>
                                )}
                                {member.teamCode && (
                                  <small className="text-muted">
                                    Original Team: {member.teamCode}
                                  </small>
                                )}
                              </div>
                            </div>
                            <Button
                              color="danger"
                              size="sm"
                              onClick={() => handleRemoveMember(selectedTeam._id, member._id)}
                            >
                              Remove
                            </Button>
                          </div>
                        </ListGroupItem>
                      ))}
                    </ListGroup>
                  ) : (
                    <div className="text-center py-4 border rounded">
                      <p>No members in this team</p>
                      <Button color="primary" size="sm" onClick={() => toggleTab('2')}>
                        Add Members
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Add button to add more members to existing team */}
              <div className="text-center mt-4 pt-3 border-top">
                <Button color="primary" onClick={handleAddMembers} disabled={!selectedTeam}>
                  <i className="fas fa-user-plus mr-1" /> Add More Members
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-5 border rounded">
              <p className="mb-3">Select a team to view its details</p>
              <Button color="primary" size="sm" onClick={() => toggleTab('2')}>
                Create New Team
              </Button>
            </div>
          )}
        </Col>
      </Row>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      size="lg"
      className={darkMode ? 'modal-dark' : ''}
      style={{ maxWidth: '900px' }}
    >
      <ModalHeader
        toggle={toggle}
        className={darkMode ? 'bg-dark text-light' : ''}
        style={darkMode ? styles.modalHeaderDark : styles.modalHeader}
      >
        Manage Custom Team Codes
      </ModalHeader>
      <ModalBody className={darkMode ? 'bg-dark text-light' : ''} style={styles.modalBody}>
        {error && (
          <Alert color="danger" className="mb-3" fade={false}>
            <strong>Error:</strong> {error}
          </Alert>
        )}
        {success && (
          <Alert color="success" className="mb-3" fade={false}>
            <strong>Success:</strong> {success}
          </Alert>
        )}

        <Nav tabs className="mb-4" style={darkMode ? styles.navTabsDark : styles.navTabs}>
          <NavItem>
            <NavLink
              className={`${activeTab === '1' ? 'active' : ''}`}
              onClick={() => toggleTab('1')}
              style={styles.navLink}
            >
              View Custom Teams
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={`${activeTab === '2' ? 'active' : ''}`}
              onClick={() => toggleTab('2')}
              style={styles.navLink}
            >
              Create Custom Team Code
            </NavLink>
          </NavItem>
        </Nav>

        {loading && !teamMembersLoading ? (
          <div className="text-center py-5">
            <Spinner color="primary" />
            <p className="mt-3">Loading teams data...</p>
          </div>
        ) : (
          <TabContent activeTab={activeTab} style={styles.tabContent}>
            <TabPane tabId="1">{renderViewTeams()}</TabPane>
            <TabPane tabId="2">
              <h5 className="mb-4">{getFormTitle()}</h5>
              {renderCreateTeamForm()}
            </TabPane>
          </TabContent>
        )}
      </ModalBody>
      <ModalFooter
        className={darkMode ? 'bg-dark text-light' : ''}
        style={darkMode ? styles.modalFooterDark : styles.modalFooter}
      >
        <Button color="secondary" onClick={toggle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}

CustomTeamCodeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  darkMode: PropTypes.bool,
  getAllUserTeams: PropTypes.func.isRequired,
  postNewTeam: PropTypes.func.isRequired,
  deleteTeam: PropTypes.func.isRequired,
  updateTeam: PropTypes.func.isRequired,
  getTeamMembers: PropTypes.func.isRequired,
  addTeamMember: PropTypes.func.isRequired,
  deleteTeamMember: PropTypes.func.isRequired,
  updateTeamsAfterModalAction: PropTypes.func.isRequired, // Add this
  onTeamCreated: PropTypes.func, // Add this
  auth: PropTypes.shape({
    // More specific than 'object'
    user: PropTypes.shape({
      id: PropTypes.string,
    }),
  }),
};

// Add defaultProps
CustomTeamCodeModal.defaultProps = {
  darkMode: false,
  auth: null,
};

const mapStateToProps = state => ({
  auth: state.auth,
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      getAllUserTeams: () => getAllUserTeams(),
      postNewTeam,
      deleteTeam,
      updateTeam,
      getTeamMembers,
      addTeamMember,
      deleteTeamMember,
      updateTeamsAfterModalAction,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(CustomTeamCodeModal);
