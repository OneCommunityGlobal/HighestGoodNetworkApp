import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Container, Row, Col, Table, Button } from 'reactstrap';
import styles from '../ProjectDetails/ProjectDetails.module.css';

function ProjectTeams() {
  const { projectId } = useParams();
  const history = useHistory();

  // WORK IN PROGRESS: Logic to fetch real teams will go here.
  // For now, I'm rendering the static layout to verify routing.

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
          <h2 className="mb-4">Project Teams Management (WIP)</h2>
          <p className="text-muted">
            This module is currently under construction. It will list all unique teams associated
            with Project ID: {projectId}.
          </p>

          <div className="table-responsive">
            <Table striped hover>
              <thead>
                <tr>
                  <th>Team Name</th>
                  <th>Members on Site</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Placeholder Row to show UI design */}
                <tr>
                  <td>Example Team (Placeholder)</td>
                  <td>0</td>
                  <td>
                    <Button color="primary" size="sm" disabled>
                      Edit Team (Coming Soon)
                    </Button>
                  </td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default ProjectTeams;
