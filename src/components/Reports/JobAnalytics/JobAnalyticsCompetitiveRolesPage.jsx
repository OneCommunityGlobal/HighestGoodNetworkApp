import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { ENDPOINTS } from '../../../utils/URL';
import JobAnalyticsFilters from './JobAnalyticsFilters';
import JobAnalyticsGraph from './JobAnalyticsGraph';

const JobAnalyticsCompetitiveRolesPage = () => {
  const [filters, setFilters] = useState({
    dateMode: 'All',
    startDate: '',
    endDate: '',
    roles: 'All',
    granularity: 'totals'
  });

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isDark, setIsDark] = useState(
    typeof document !== 'undefined' && document.querySelector('.dark-mode') !== null
  );

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const targetNode = document.body;
    const observer = new MutationObserver(() => {
      const darkActive = document.querySelector('.dark-mode') !== null;
      setIsDark(darkActive);
    });

    observer.observe(targetNode, { attributes: true, subtree: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  const requestUrl = useMemo(() => {
    const start = filters.dateMode === 'Custom' ? filters.startDate : '';
    const end = filters.dateMode === 'Custom' ? filters.endDate : '';
    const gran =
      filters.dateMode === 'Custom' && filters.granularity !== 'totals'
        ? filters.granularity
        : undefined;

    return ENDPOINTS.JOB_ANALYTICS(start, end, filters.roles, gran);
  }, [filters]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const resp = await axios.get(requestUrl);
        if (alive) setData(Array.isArray(resp.data) ? resp.data : []);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Error fetching job analytics:', e);
        if (alive) setData([]);
      } finally {
        alive && setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [requestUrl]);

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '100%',
        margin: '0 auto',
        padding: '1rem',
        minWidth: 0,
        backgroundColor: isDark ? '#1a1a1a' : '#fff',
        color: isDark ? '#eee' : '#111',
        borderRadius: 8,
        transition: 'background-color 0.3s ease, color 0.3s ease'
      }}
    >
      <div style={{ display: 'grid', gap: 12, minWidth: 0 }}>
        <JobAnalyticsFilters filters={filters} setFilters={setFilters} />
        {loading ? <p>Loading…</p> : <JobAnalyticsGraph data={data} />}
      </div>
    </div>
  );
};

export default JobAnalyticsCompetitiveRolesPage;
