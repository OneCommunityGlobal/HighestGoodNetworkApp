import { useEffect, useState } from 'react';
import axios from 'axios';
import { ENDPOINTS } from '../../../../utils/URL';
import ExpenditureChart from './ExpenditureChart';
import styles from './SingleExpenditureCard.module.css';

/**
 * SingleExpenditureCard
 *
 * Self-contained card with its own project selector.
 * Renders exactly one pie chart (actual OR planned) based on pieType prop.
 * Used in stacked mode where each chart is independently filterable.
 *
 * Props:
 *   pieType  ('actual'|'planned') — which dataset to display
 */
function SingleExpenditureCard({ pieType }) {
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

  // Unique id per pieType so both dropdowns can coexist in the same DOM
  const selectId = `sec-project-select-${pieType}`;

  return (
    <div className={styles.card}>
      <div className={styles.controls}>
        <div className={styles.selectGroup}>
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

      {selectedProject && <ExpenditureChart projectId={selectedProject} pieType={pieType} />}
    </div>
  );
}

export default SingleExpenditureCard;
