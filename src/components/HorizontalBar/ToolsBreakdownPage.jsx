import React, { useEffect, useState } from 'react';
import ToolsBreakdownChart from './ToolsBreakdownChart';
import getToolsAvailability from '../../services/toolsService';

const ToolsBreakdownPage = () => {
  const [projectId, setProjectId] = useState('65f123abc456def789123456');
  const [startDate, setStartDate] = useState('2026-03-01');
  const [endDate, setEndDate] = useState('2026-03-31');
  const [toolsData, setToolsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token = 'PUT_YOUR_JWT_TOKEN_HERE';

  const projectOptions = [
    { label: 'Project A', value: '65f123abc456def789123456' },
    { label: 'Project B', value: '65f123abc456def789123457' },
  ];

  const fetchToolsData = async () => {
    try {
      setLoading(true);
      setError('');

      const result = await getToolsAvailability({
        projectId,
        startDate,
        endDate,
        token,
      });

      setToolsData(result.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tools data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToolsData();
  }, []);

  const handleApplyFilters = () => {
    fetchToolsData();
  };

  return (
    <div style={{ padding: '24px' }}>
      <div
        style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <label htmlFor="project-select">Project</label>
          <br />
          <select
            id="project-select"
            value={projectId}
            onChange={e => setProjectId(e.target.value)}
          >
            {projectOptions.map(project => (
              <option key={project.value} value={project.value}>
                {project.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="start-date">Start Date</label>
          <br />
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="end-date">End Date</label>
          <br />
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </div>

        <div style={{ marginTop: '18px' }}>
          <button type="button" onClick={handleApplyFilters}>
            Apply Filters
          </button>
        </div>
      </div>

      {loading && <p>Loading tools data...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && <ToolsBreakdownChart data={toolsData} />}
    </div>
  );
};

export default ToolsBreakdownPage;
