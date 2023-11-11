import { Row } from 'reactstrap';
import ProjectSummary from './ProjectSummary';

function ProjectsList({ projects }) {
  return (
    <Row className="ml-0 mt-2 text-center">
      {projects.length  ? (
        <ul className="projects-list">
          {projects.map(project => (
            <li className="project-summary" key={project._id}>
              <ProjectSummary project={project} />
            </li>
          ))}
        </ul>
      ) : (
        <p>No projects data</p>
      )}
    </Row>
  );
}

export default ProjectsList;
