import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Row } from 'reactstrap';
import Select from 'react-select';
import ProjectSummary from './ProjectSummary';

function ProjectsList() {
  const projects = useSelector(state => state.bmProjects) || [];
  const [selectedProjects, setSelectedProjects] = useState([]);

  const projectOptions = projects.map(project => ({
    value: project._id,
    label: project.name,
  }));

  const handleSelectChange = selectedOptions => {
    setSelectedProjects(selectedOptions || []);
  };

  const filteredProjects = selectedProjects.length
    ? projects.filter(project => selectedProjects.some(selected => selected.value === project._id))
    : projects;

  return (
    <Row className="ml-0 text-center">
      <Select
        isMulti
        options={projectOptions}
        onChange={handleSelectChange}
        className="mb-3"
        placeholder="Select Projects"
      />
      {filteredProjects.length ? (
        <ul className="projects-list">
          {filteredProjects.map(project => (
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
