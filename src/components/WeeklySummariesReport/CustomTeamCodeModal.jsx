import React, { useState, useEffect } from 'react';
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
import { MultiSelect } from 'react-multi-select-component';
import {
  getAllUserTeams,
  postNewTeam,
  deleteTeam,
  updateTeam,
  getTeamMembers,
  addTeamMember,
  deleteTeamMember,
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

const CustomTeamCodeModal = ({
  isOpen,
  toggle,
  darkMode,
  getAllUserTeams,
  postNewTeam,
  deleteTeam,
  updateTeam,
  getTeamMembers,
  addTeamMember,
  deleteTeamMember,
  auth,
}) => {
  const [activeTab, setActiveTab] = useState('1');
  const [teams, setTeams] = useState([]);
  const [customTeams, setCustomTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // New team form state
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamCode, setNewTeamCode] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);

  // Edit team state
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamMembersLoading, setTeamMembersLoading] = useState(false);

  // Member selection options
  const [memberOptions, setMemberOptions] = useState([]);
  const [usersByTeam, setUsersByTeam] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchTeams();
    }
  }, [isOpen]);

  const fetchTeams = async () => {
    setLoading(true);
    setError(null);

    try {
      const teamsData = await getAllUserTeams();
      if (teamsData) {
        setTeams(teamsData);

        // Filter custom teams
        const customTeamsData = teamsData.filter(team => team.teamCode && team.teamCode.length > 0);
        setCustomTeams(customTeamsData);

        // Create user options for member selection
        const usersByTeamMap = {};
        const allMemberOptions = [];

        // First pass to get team details
        const teamDetailsMap = {};
        teamsData.forEach(team => {
          teamDetailsMap[team._id] = {
            teamName: team.teamName,
            teamCode: team.teamCode || 'No Code',
          };
        });

        // Second pass to get members with team details
        const processedUserIds = new Set(); // To avoid duplicates

        for (const team of teamsData) {
          if (team.members && team.members.length > 0) {
            // For each team, get detailed member information
            const members = await getTeamMembers(team._id);

            if (members && members.length > 0) {
              const teamCode = team.teamCode || 'No Code';

              if (!usersByTeamMap[teamCode]) {
                usersByTeamMap[teamCode] = [];
              }

              members.forEach(member => {
                if (!processedUserIds.has(member._id)) {
                  processedUserIds.add(member._id);

                  const memberOption = {
                    value: member._id,
                    label: `${member.firstName || ''} ${member.lastName || ''}`.trim(),
                    teamCode: teamCode,
                    teamName: team.teamName,
                    role: member.role,
                  };

                  usersByTeamMap[teamCode].push(memberOption);
                  allMemberOptions.push(memberOption);
                }
              });
            }
          }
        }

        // Sort teams by their code
        const sortedUsersByTeam = {};
        Object.keys(usersByTeamMap)
          .sort()
          .forEach(key => {
            sortedUsersByTeam[key] = usersByTeamMap[key];
          });

        setUsersByTeam(sortedUsersByTeam);
        setMemberOptions(allMemberOptions);
      }
    } catch (err) {
      setError('Failed to load teams. Please try again.');
      console.error('Error fetching teams:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTab = tab => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      setError(null);
      setSuccess(null);
    }
  };

  const handleCreateTeam = async e => {
    e.preventDefault();

    // If just updating an existing team's members, use the update function instead
    if (selectedTeam) {
      handleUpdateTeam(e);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validate inputs
    if (!newTeamName.trim()) {
      setError('Team name is required.');
      setLoading(false);
      return;
    }

    // Validate team code
    if (!teamCodeRegex.test(newTeamCode)) {
      setError('Team code must be between 5 and 7 characters.');
      setLoading(false);
      return;
    }

    try {
      // Check if team code already exists (excluding the selectedTeam if it exists)
      const duplicateTeam = teams.find(
        team => team.teamCode === newTeamCode && (!selectedTeam || team._id !== selectedTeam._id),
      );

      if (duplicateTeam) {
        setError('This team code already exists. Please choose a different code.');
        setLoading(false);
        return;
      }

      // Create the team
      const response = await postNewTeam(newTeamName, true);

      if (response && response.status === 201 && response.data) {
        const newTeamId = response.data._id;

        // Update the team code
        const updateResponse = await updateTeam(newTeamName, newTeamId, true, newTeamCode);

        if (updateResponse && updateResponse.status === 200) {
          // Add selected members to the team if any are selected
          if (selectedMembers.length > 0) {
            let addedCount = 0;
            try {
              for (const member of selectedMembers) {
                // Extract first name and last name properly
                const nameParts = member.label.split(' ');
                const firstName = nameParts[0] || '';
                const lastName = nameParts.slice(1).join(' ') || '';

                await addTeamMember(newTeamId, member.value, firstName, lastName);
                addedCount++;
              }

              setSuccess(`Custom team created successfully with ${addedCount} members!`);
            } catch (memberErr) {
              setSuccess(
                `Custom team created with ${addedCount} members. Some members could not be added.`,
              );
              console.error('Error adding members:', memberErr);
            }
          } else {
            setSuccess('Custom team created successfully!');
          }

          // Reset form
          setNewTeamName('');
          setNewTeamCode('');
          setSelectedMembers([]);

          // Refresh teams list
          fetchTeams();
        } else {
          setError('Failed to set team code. Please try again.');
        }
      } else {
        setError('Failed to create team. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Error creating team:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async teamId => {
    if (window.confirm('Are you sure you want to delete this custom team?')) {
      setLoading(true);
      try {
        await deleteTeam(teamId);
        setSuccess('Team deleted successfully.');
        fetchTeams();
      } catch (err) {
        setError('Failed to delete team. Please try again.');
        console.error('Error deleting team:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSelectTeam = async team => {
    setSelectedTeam(team);
    setTeamMembersLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const members = await getTeamMembers(team._id);
      if (members && Array.isArray(members)) {
        setTeamMembers(members);
      } else {
        setTeamMembers([]);
        console.error('Invalid members data:', members);
      }
    } catch (err) {
      console.error('Error fetching team members:', err);
      setError('Failed to load team members. Please try again.');
    } finally {
      setTeamMembersLoading(false);
    }
  };

  const handleRemoveMember = async (teamId, userId) => {
    setError(null);
    setSuccess(null);

    try {
      await deleteTeamMember(teamId, userId);

      // Refresh team members
      const members = await getTeamMembers(teamId);
      if (members && Array.isArray(members)) {
        setTeamMembers(members);
        setSuccess('Member removed successfully.');
      } else {
        console.error('Invalid members data after removal:', members);
        setError('Something went wrong. Please refresh the view.');
      }

      // Also refresh the main teams list to update member counts
      fetchTeams();
    } catch (err) {
      setError('Failed to remove member. Please try again.');
      console.error('Error removing member:', err);
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

  // Add a function to handle updating team members
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
          for (const member of membersToAdd) {
            const nameParts = member.label.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            await addTeamMember(selectedTeam._id, member.value, firstName, lastName);
          }

          setSuccess('Team members updated successfully!');
        } catch (memberErr) {
          setError('Some members could not be added. Please try again.');
          console.error('Error adding members:', memberErr);
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
      console.error('Error updating team:', err);
    } finally {
      setLoading(false);
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
            {Object.keys(usersByTeam).map(teamCode => (
              <div
                key={teamCode}
                className="mb-3 p-2"
                style={{ border: '1px solid #dee2e6', borderRadius: '0.25rem' }}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0">
                    {teamCode === 'No Code' ? 'No Team Code' : `Team: ${teamCode}`}
                    <Badge color="info" className="ml-2">
                      {usersByTeam[teamCode] ? usersByTeam[teamCode].length : 0}
                    </Badge>
                  </h6>
                  <div>
                    <Button
                      color="primary"
                      size="sm"
                      className="mr-1"
                      onClick={() => {
                        // Select all from this team
                        const teamMembers = usersByTeam[teamCode] || [];
                        const otherTeamMembers = selectedMembers.filter(
                          member => !teamMembers.some(m => m.value === member.value),
                        );
                        setSelectedMembers([...otherTeamMembers, ...teamMembers]);
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
                </div>

                <ListGroup>
                  {usersByTeam[teamCode] &&
                    usersByTeam[teamCode].map(member => (
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
            {loading ? <Spinner size="sm" /> : 'Create Custom Team'}
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
            <h5>All Teams</h5>
            {customTeams.length > 0 && (
              <Badge color="primary" pill>
                {customTeams.length}
              </Badge>
            )}
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
                  className={`${darkMode ? 'bg-dark text-light border-secondary' : ''} ${
                    selectedTeam && selectedTeam._id === team._id
                      ? darkMode
                        ? 'selected-dark'
                        : 'selected'
                      : ''
                  }`}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{team.teamName}</strong>
                      <div>
                        <small className="text-muted">Code: </small>
                        <span className="badge badge-secondary">{team.teamCode}</span>
                      </div>
                    </div>
                    <Badge color="info" pill>
                      {team.members ? team.members.length : 0}
                    </Badge>
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
                  <div>
                    <Badge color="primary" className="mr-2">
                      {selectedTeam.teamCode}
                    </Badge>
                    <small className="text-muted">
                      Created: {new Date(selectedTeam.createdDatetime).toLocaleDateString()}
                    </small>
                  </div>
                </div>
                <Button color="danger" size="sm" onClick={() => handleDeleteTeam(selectedTeam._id)}>
                  Delete Team
                </Button>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6>Team Members</h6>
                {!teamMembersLoading && teamMembers && teamMembers.length > 0 && (
                  <Badge color="secondary">{teamMembers.length} members</Badge>
                )}
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
                                <Badge
                                  color={
                                    member.role === 'Owner' || member.role === 'Administrator'
                                      ? 'warning'
                                      : 'info'
                                  }
                                  className="mr-2"
                                >
                                  {member.role}
                                </Badge>
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
                  <i className="fas fa-user-plus mr-1"></i> Add More Members
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
              View All Teams
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
};

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
  auth: PropTypes.object,
};

const mapStateToProps = state => ({
  auth: state.auth,
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      getAllUserTeams,
      postNewTeam,
      deleteTeam,
      updateTeam,
      getTeamMembers,
      addTeamMember,
      deleteTeamMember,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(CustomTeamCodeModal);
