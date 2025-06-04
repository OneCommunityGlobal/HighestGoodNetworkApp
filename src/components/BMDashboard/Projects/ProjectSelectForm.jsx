import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Row, Col, Card, CardBody, Button, Collapse } from 'reactstrap';
import ProjectDetails from './ProjectDetails/ProjectDetails';

function ProjectSelectForm() {
  const projects = useSelector(state => state.bmProjects) || [];
  const [expandedProject, setExpandedProject] = useState(null);

  const toggleProject = projectId => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  return (
    <Row className="justify-content-center mt-4">
      <Col md={12}>
        <ul className="projects-list list-unstyled">
          {projects.length ? (
            projects.map(project => (
              <li key={project._id} className="">
                <Card>
                  <CardBody className="p-0">
                    <Button
                      color="link"
                      onClick={() => toggleProject(project._id)}
                      className="w-100 text-left d-flex justify-content-between align-items-center"
                      style={{
                        fontSize: '1.1rem',
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        color: 'black',
                        backgroundColor: 'lightblue',
                      }}
                    >
                      {project.name}
                      <span>{expandedProject === project._id ? '▲' : '▼'}</span>
                    </Button>
                    <Collapse isOpen={expandedProject === project._id}>
                      <div
                        className="mt-3 border-top pt-3"
                        style={{
                          maxHeight: '600px', // Set a max height for the collapsible content
                          overflowY: 'auto', // Allow scrolling inside the collapsible content
                        }}
                      >
                        {/* ✅ Correctly pass projectId */}
                        <ProjectDetails projectId={expandedProject} />
                      </div>
                    </Collapse>
                  </CardBody>
                </Card>
              </li>
            ))
          ) : (
            <p className="text-center text-muted">No projects available</p>
          )}
        </ul>
      </Col>
    </Row>
  );
}

export default ProjectSelectForm;
