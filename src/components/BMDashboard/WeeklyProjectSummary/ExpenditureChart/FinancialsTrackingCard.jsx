import { useEffect, useState } from 'react';
import axios from 'axios';
import { ENDPOINTS } from '../../../../utils/URL';
import ExpenditureChart from './ExpenditureChart';
import styles from './FinancialsTrackingCard.module.css';

/**
 * FinancialsTrackingCard (Combined Comparison View)
 *
 * Used exclusively in Comparison mode.
 * Renders both Actual and Planned expenditure pies side-by-side
 * under a single shared project selector.
 *
 * The layout toggle lives in FinancialsTrackingSection, not here.
 */
function FinancialsTrackingCard() {
  const [projectList, setProjectList] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    axios
      .get(ENDPOINTS.BM_EXPENDITURE_PROJECTS)
      .then(({ data }) => {
        if (cancelled) return;
        const labeled = Array.isArray(data)
          ? data.map((id, index) => ({
              id,
              name: `Project ${String.fromCodePoint(65 + index)}`,
            }))
          : [];
        setProjectList(labeled);
        if (labeled.length > 0) setSelectedProject(labeled[0].id);
      })
      .catch(err => {
        if (!cancelled) {
          setError(err?.response?.data?.message || 'Failed to load projects');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className={styles.card}>
        {/* <output> is the semantic equivalent of role="status" with implicit aria-live="polite" */}
        <output className={styles.stateMessage}>Loading project list…</output>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.card}>
        <p className={`${styles.stateMessage} ${styles.errorMessage}`} role="alert">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.controls}>
        {/* Shared project selector — controls both pies simultaneously */}
        <div className={styles.selectGroup}>
          <label htmlFor="ft-project-select" className={styles.selectLabel}>
            Project
          </label>
          <select
            id="ft-project-select"
            className={styles.select}
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
      </div>

      {selectedProject && <ExpenditureChart projectId={selectedProject} viewMode="comparison" />}
    </div>
  );
}

export default FinancialsTrackingCard;
