import { useEffect, useState, useMemo } from 'react';
import { Spinner } from 'reactstrap';
import ExpenditureChart from './ExpenditureChart';
import { getProjectIds } from './mockExpenditureData';
import styles from './FinancialsTrackingCard.module.css';

function FinancialsTrackingCard() {
  const [projectList, setProjectList] = useState([]);
  const [selectedProject, setSelectedProject] = useState(
    () => localStorage.getItem('bm_pie_project') || '',
  );

  const [loading, setLoading] = useState(true); // Initial load state
  const [isFiltering, setIsFiltering] = useState(false); // Transition state for dropdown
  const [error, setError] = useState(null);

  const selectedProjectName = useMemo(
    () => projectList.find(p => p.id === selectedProject)?.name ?? 'Loading...',
    [projectList, selectedProject],
  );

  useEffect(() => {
    if (selectedProject) {
      localStorage.setItem('bm_pie_project', selectedProject);
    }
  }, [selectedProject]);

  useEffect(() => {
    setIsFiltering(true);
    const timeout = setTimeout(() => {
      setIsFiltering(false);
    }, 400); // 400ms delay for smooth UI feedback
    return () => clearTimeout(timeout);
  }, [selectedProject]);

  // 3. Fetch initial project list
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const projectIds = getProjectIds();
        const labeledProjects = projectIds.map((id, index) => ({
          id,
          name: `Project ${String.fromCharCode(65 + index)}`,
        }));

        setProjectList(labeledProjects);

        if (labeledProjects.length > 0 && !selectedProject) {
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

  // Show full loading spinner on initial mount
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <Spinner color="primary" />
      </div>
    );
  }

  if (error) return <div>{error}</div>;

  return (
    <div className={styles.financialsTrackingCard}>
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-color)', fontWeight: 'bold' }}>
          Viewing: {selectedProjectName}
        </div>
      </div>

      <div className={styles.projectDropdown}>
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

      {/* Render the transition spinner OR the chart */}
      {isFiltering ? (
        <div
          style={{
            display: 'flex',
            height: 300,
            justifyContent: 'center',
            alignItems: 'center',
            color: 'var(--text-color)',
          }}
        >
          <Spinner color="primary" size="sm" />
          <span style={{ marginLeft: '10px' }}>Updating chart...</span>
        </div>
      ) : (
        selectedProject && <ExpenditureChart projectId={selectedProject} />
      )}
    </div>
  );
}

export default FinancialsTrackingCard;
