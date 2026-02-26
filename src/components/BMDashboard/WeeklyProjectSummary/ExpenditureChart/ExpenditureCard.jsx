import { useEffect, useState } from 'react';
import axios from 'axios';
import { ENDPOINTS } from '../../../../utils/URL';
import ExpenditureChart from './ExpenditureChart';
import styles from './ExpenditureCard.module.css';

function useProjectList() {
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

  return { projectList, selectedProject, setSelectedProject, loading, error };
}

/**
 * ExpenditureCard — unified card for both layout variants.
 *
 * Props:
 *   mode     ('comparison' | 'stacked') — layout variant; defaults to 'stacked'
 *   pieType  ('actual' | 'planned')     — required when mode === 'stacked'
 */
function ExpenditureCard({ mode = 'stacked', pieType }) {
  const { projectList, selectedProject, setSelectedProject, loading, error } = useProjectList();

  const isStacked = mode === 'stacked';
  const cardClass = isStacked ? `${styles.card} ${styles.cardStacked}` : styles.card;
  const selectId = isStacked ? `sec-project-select-${pieType}` : 'ft-project-select';

  if (loading) {
    return (
      <div className={cardClass}>
        {/* <output> is the semantic equivalent of role="status" with implicit aria-live="polite" */}
        <output className={styles.stateMessage}>Loading project list…</output>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cardClass}>
        <p className={`${styles.stateMessage} ${styles.errorMessage}`} role="alert">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className={cardClass}>
      <div className={`${styles.controls} ${isStacked ? styles.controlsStacked : ''}`}>
        <div className={`${styles.selectGroup} ${isStacked ? styles.selectGroupStacked : ''}`}>
          <label htmlFor={selectId} className={styles.selectLabel}>
            Project
          </label>
          <select
            id={selectId}
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

      {selectedProject && (
        <ExpenditureChart
          projectId={selectedProject}
          {...(isStacked ? { pieType } : { viewMode: 'comparison' })}
        />
      )}
    </div>
  );
}

export default ExpenditureCard;
