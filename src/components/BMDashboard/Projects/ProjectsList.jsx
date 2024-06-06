import { useSelector } from 'react-redux';
import { Row } from 'reactstrap';
import ProjectSummary from './ProjectSummary';

function ProjectsList() {
  const projects = useSelector(state => state.bmProjects);
  const darkMode = useSelector(state => state.theme.darkMode);

  return (
    <Row className="ml-0 mt-2 text-center">
      {projects.length ? (
        <ul className="projects-list">
          {projects.map(project => (
            <li className={`project-summary ${darkMode ? 'bg-yinmn-blue' : ''}`} key={project._id}>
              <ProjectSummary project={project} darkMode={darkMode} />
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
