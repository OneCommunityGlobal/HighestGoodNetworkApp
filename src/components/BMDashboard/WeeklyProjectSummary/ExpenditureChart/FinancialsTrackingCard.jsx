import { useEffect, useState } from 'react';
import httpService from '../../../../services/httpService';
import ExpenditureChart from './ExpenditureChart';

function FinancialsTrackingCard() {
  const [projectList, setProjectList] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = await httpService.get(
          `${process.env.REACT_APP_APIENDPOINT}/bm/expenditure/projects`,
        );
        const labeledProjects = res.data.map((id, index) => ({
          id,
          name: `Project ${String.fromCharCode(65 + index)}`,
        }));
        setProjectList(labeledProjects);
        if (labeledProjects.length > 0) {
          setSelectedProject(labeledProjects[0].id);
        }
      } catch (err) {
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (loading) return <div>Loading project list...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="financials-tracking-card">
      <div className="project-dropdown">
        <label htmlFor="project-select">Select Project:</label>
        <select
          id="project-select"
          value={selectedProject}
          onChange={e => setSelectedProject(e.target.value)}
        >
          {projectList.map(project => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>
      {selectedProject && <ExpenditureChart projectId={selectedProject} />}
    </div>
  );
}

export default FinancialsTrackingCard;
