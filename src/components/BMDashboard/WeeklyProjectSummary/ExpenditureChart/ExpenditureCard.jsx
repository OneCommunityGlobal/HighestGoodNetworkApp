import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { ENDPOINTS } from '../../../../utils/URL';
import { fetchBMProjects } from '../../../../actions/bmdashboard/projectActions';
import ExpenditureChart from './ExpenditureChart';
import styles from './ExpenditureCard.module.css';
import PropTypes from 'prop-types';

function useProjectList() {
  const dispatch = useDispatch();
  const bmProjects = useSelector(state => state.bmProjects);
  const [projectIds, setProjectIds] = useState([]);
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
        const ids = Array.isArray(data) ? data.map(String) : [];
        setProjectIds(ids);
        if (ids.length > 0) setSelectedProject(ids[0]);
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

  // Project names come from the BM project list; load it if no other card has yet
  const hasProjectNames = Array.isArray(bmProjects) && bmProjects.length > 0;
  useEffect(() => {
    if (!hasProjectNames) dispatch(fetchBMProjects());
  }, [dispatch, hasProjectNames]);

  // Show real project names; fall back to "Project A/B/…" for ids without a known name
  const projectList = useMemo(() => {
    const names = new Map((bmProjects || []).map(p => [String(p._id), p.name]));
    return projectIds.map((id, index) => ({
      id,
      name: names.get(id) || `Project ${String.fromCodePoint(65 + index)}`,
    }));
  }, [projectIds, bmProjects]);

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

ExpenditureCard.propTypes = {
  mode: PropTypes.string,
  pieType: PropTypes.string,
};

export default ExpenditureCard;
