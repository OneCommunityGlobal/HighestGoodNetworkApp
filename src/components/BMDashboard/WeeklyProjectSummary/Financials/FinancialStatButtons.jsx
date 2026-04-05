import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import styles from './FinancialStatButtons.module.css';

function formatCurrency(amount) {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) return '-';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(Number(amount));
  } catch (e) {
    return `$${Number(amount).toFixed(0)}`;
  }
}

export default function FinancialStatButtons({ defaultProjectId }) {
  const [projects, setProjects] = useState([]); // [{ id, name }]
  const [projectId, setProjectId] = useState(defaultProjectId || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [totalCost, setTotalCost] = useState(null);
  const [materialCost, setMaterialCost] = useState(null);
  const [laborCost, setLaborCost] = useState(null);
  const [equipmentCost, setEquipmentCost] = useState(null);
  const [mom, setMom] = useState(null);

  const apiBase = useMemo(() => (process.env.REACT_APP_APIENDPOINT || '').replace(/\/$/, ''), []);

  const buildUrl = path => {
    const normalizedPath =
      path.startsWith('/api') && apiBase.endsWith('/api') ? path.replace(/^\/api/, '') : path;
    return `${apiBase}${normalizedPath}`;
  };

  async function tryJsonGet(possiblePaths) {
    // Try a list of paths in order until one succeeds (2xx)
    // Returns { ok: boolean, data?: any, error?: Error, tried: string[] }
    const tried = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const p of possiblePaths) {
      const url = buildUrl(p);
      tried.push(url);
      try {
        const res = await axios.get(url);
        if (res.status >= 200 && res.status < 300) {
          return { ok: true, data: res.data, tried };
        }
      } catch (e) {
        // continue to next
      }
    }
    return { ok: false, tried };
  }

  useEffect(() => {
    let cancelled = false;
    async function loadProjects() {
      try {
        // Best: real BuildingProject IDs with names
        const namesResp = await tryJsonGet(['/api/bm/projectsNames', '/bm/projectsNames']);
        if (cancelled) return;
        let projectList = [];
        if (namesResp.ok && Array.isArray(namesResp.data)) {
          projectList = namesResp.data
            .filter(p => p?.projectId)
            .map(p => ({ id: p.projectId, name: p.projectName || p.projectId }));
        }
        // Fallback to generic IDs if names endpoint not available
        if (!projectList.length) {
          const idsResp = await tryJsonGet([
            '/api/bm/projects-cost/ids',
            '/bm/projects-cost/ids',
            '/api/projects-cost/ids',
            '/projects-cost/ids',
          ]);
          if (idsResp.ok) {
            const data = idsResp.data;
            const ids = Array.isArray(data)
              ? data
              : Array.isArray(data?.projectIds)
              ? data.projectIds
              : Array.isArray(data?.ids)
              ? data.ids
              : Array.isArray(data?.projects)
              ? data.projects
              : [];
            projectList = ids.map((id, idx) => ({ id, name: `Project ${idx + 1}` }));
          }
        }
        setProjects(projectList);
        if (!projectId && projectList.length > 0) setProjectId(projectList[0].id);
      } catch (e) {
        // Fallback to expenditure projects if available
        try {
          const altResp = await tryJsonGet([
            '/api/bm/expenditure/projects',
            '/bm/expenditure/projects',
          ]);
          if (cancelled) return;
          let fallbackList = [];
          if (altResp.ok) {
            const alt = altResp.data;
            const ids = Array.isArray(alt)
              ? alt
              : Array.isArray(alt?.projectIds)
              ? alt.projectIds
              : Array.isArray(alt?.ids)
              ? alt.ids
              : Array.isArray(alt?.projects)
              ? alt.projects
              : [];
            fallbackList = ids.map((id, idx) => ({ id, name: `Project ${idx + 1}` }));
          }
          setProjects(fallbackList);
          if (!projectId && fallbackList.length > 0) setProjectId(fallbackList[0].id);
        } catch (err) {
          if (cancelled) return;
          setError('Failed to load projects');
        }
      }
    }
    loadProjects();
    return () => {
      cancelled = true;
    };
  }, [apiBase]);

  useEffect(() => {
    let cancelled = false;
    async function loadFinancials() {
      if (!projectId) return;
      setLoading(true);
      setError('');
      try {
        const [totalRes, breakdownRes, momRes] = await Promise.all([
          axios.get(buildUrl(`/api/financials/project/${projectId}/total-cost`)),
          axios.get(buildUrl(`/api/financials/project/${projectId}/costs`)),
          axios.get(buildUrl(`/api/financials/project/${projectId}/mom-changes`)),
        ]);
        if (cancelled) return;
        setTotalCost(totalRes?.data?.totalCost ?? null);
        setMaterialCost(breakdownRes?.data?.materialsCost ?? null);
        setLaborCost(breakdownRes?.data?.laborCost ?? null);
        setEquipmentCost(breakdownRes?.data?.equipmentCost ?? null);
        setMom(momRes?.data ?? null);
      } catch (e) {
        if (cancelled) return;
        setError('Failed to load financials');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadFinancials();
    return () => {
      cancelled = true;
    };
  }, [apiBase, projectId]);

  return (
    <div className={styles.container}>
      <div className={styles.controlsRow}>
        <label htmlFor="financials-project" className={styles.label}>
          Project
        </label>
        <select
          id="financials-project"
          className={styles.select}
          value={projectId}
          onChange={e => setProjectId(e.target.value)}
        >
          {projects.length === 0 ? (
            <option value="" disabled>
              {loading ? 'Loading...' : 'All'}
            </option>
          ) : (
            projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))
          )}
        </select>
      </div>

      {loading && <div className={styles.loading}>Loading…</div>}
      {error && <div className={styles.error}>{error}</div>}

      {!loading && !error && (
        <div className={styles.grid}>
          <button type="button" className={styles.kpiButton} aria-label="Total Project Cost">
            <span className={styles.label}>Total Project Cost</span>
            <span className={styles.value}>{formatCurrency(totalCost)}</span>
          </button>

          <button type="button" className={styles.kpiButton} aria-label="Material Cost">
            <span className={styles.label}>Material Cost</span>
            <span className={styles.value}>{formatCurrency(materialCost)}</span>
          </button>

          <button type="button" className={styles.kpiButton} aria-label="Labor Cost">
            <span className={styles.label}>Labor Cost</span>
            <span className={styles.value}>{formatCurrency(laborCost)}</span>
          </button>

          <button type="button" className={styles.kpiButton} aria-label="Equipment Cost">
            <span className={styles.label}>Equipment Cost</span>
            <span className={styles.value}>{formatCurrency(equipmentCost)}</span>
            {mom?.equipmentCostChange !== undefined && (
              <span className={styles.subtext}>
                MoM: {Number(mom.equipmentCostChange).toFixed(2)}%
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
