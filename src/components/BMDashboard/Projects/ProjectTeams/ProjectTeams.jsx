import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Row, Col, Table, Button } from 'reactstrap';
import { toast } from 'react-toastify';
import styles from '../ProjectDetails/ProjectDetails.module.css';
import { getAllUserTeams, updateTeam } from '../../../../actions/allTeamsAction';
import CreateNewTeamPopup from '../../../../components/Teams/CreateNewTeamPopup';

function ProjectTeams() {
  const { projectId } = useParams();
  const history = useHistory();
  const dispatch = useDispatch();

  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    teamName: '',
    teamId: '',
    isActive: false,
    teamCode: '',
  });

  const projects = useSelector(state => state.bmProjects) || [];
  const currProject = projects.find(project => String(project._id) === String(projectId));
  const allTeams = useSelector(state => state.allTeamsData?.allTeams || []);

  useEffect(() => {
    if (!allTeams || allTeams.length === 0) {
      dispatch(getAllUserTeams());
    }
  }, [dispatch, allTeams]);

  const handleEditClick = team => {
    setEditData({
      teamName: team.name,
      teamId: team.id,
      isActive: team.isActive,
      teamCode: team.teamCode || '',
    });
    setEditModalOpen(true);
  };

  const handleSaveChanges = async name => {
    const updateTeamResponse = await dispatch(
      updateTeam(name, editData.teamId, editData.isActive, editData.teamCode),
    );

    if (updateTeamResponse.status === 200) {
      toast.success('Team updated successfully');
      setEditModalOpen(false);
      dispatch(getAllUserTeams());
    } else {
      toast.error('Error updating team');
    }
  };

  if (!currProject) {
    return (
      <Container className="text-center mt-5">
        <p>Loading Project...</p>
      </Container>
    );
  }

  const projectTeamsList = (currProject.teams || [])
    .map(teamId => {
      const foundTeam = allTeams.find(t => t._id === teamId);
      if (!foundTeam) return null;

      return {
        id: teamId,
        name: foundTeam.teamName,
        isActive: foundTeam.isActive,
        teamCode: foundTeam.teamCode || '',
      };
    })
    .filter(team => team !== null);

  return (
    <Container fluid className={styles['project-details']}>
      <Row className="mb-4">
        <Col>
          <Button
            color="secondary"
            size="sm"
            onClick={() => history.push(`/bmdashboard/projects/${projectId}`)}
          >
            &larr; Back to Dashboard
          </Button>
        </Col>
      </Row>

      <Row className="justify-content-center">
        <Col xs="12" lg="10">
          <h2 className="mb-4">Teams working on {currProject.name}</h2>

          <div className="table-responsive">
            <Table striped hover>
              <thead>
                <tr>
                  <th>Team Name</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projectTeamsList.length > 0 ? (
                  projectTeamsList.map((team, index) => (
                    <tr key={index}>
                      <td>
                        <strong>{team.name}</strong>
                      </td>
                      <td>
                        {team.isActive ? (
                          <span className="text-success">Active</span>
                        ) : (
                          <span className="text-muted">Inactive</span>
                        )}
                      </td>
                      <td>
                        <Button color="primary" size="sm" onClick={() => handleEditClick(team)}>
                          Edit Team
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center p-4">
                      <h6 className="text-muted">
                        No active teams are currently assigned to this building.
                      </h6>
                      <small>
                        To add a team, please use the Add New Item menu on the dashboard.
                      </small>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Col>
      </Row>

      {isEditModalOpen && (
        <CreateNewTeamPopup
          open={isEditModalOpen}
          onClose={() => setEditModalOpen(false)}
          onOkClick={handleSaveChanges}
          teamName={editData.teamName}
          teamId={editData.teamId}
          isActive={editData.isActive}
          isEdit={true}
        />
      )}
    </Container>
  );
}

export default ProjectTeams;
