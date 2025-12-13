import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ENDPOINTS } from '../../../utils/URL';

const GRANULARITY_OPTS = [
  { value: 'totals', label: 'Totals' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'annually', label: 'Annually' },
];

const JobAnalyticsFilters = ({ filters, setFilters }) => {
  const [roleOptions, setRoleOptions] = useState(['All']);
  const [loadingRoles, setLoadingRoles] = useState(false);

  const [isDark, setIsDark] = useState(
    typeof document !== 'undefined' &&
      document.querySelector('.dark-mode') !== null
  );

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const targetNode = document.body;
    const observer = new MutationObserver(() => {
      const darkActive =
        document.querySelector('.dark-mode') !== null;
      setIsDark(darkActive);
    });

    observer.observe(targetNode, {
      attributes: true,
      subtree: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoadingRoles(true);
      try {
        const resp = await axios.get(
          ENDPOINTS.JOB_ANALYTICS_ROLES
        );
        const arr = Array.isArray(resp.data) ? resp.data : [];

        const withAll = [
          'All',
          ...Array.from(new Set(arr)).sort((a, b) =>
            a.localeCompare(b)
          ),
        ];

        if (alive) {
          setRoleOptions(withAll);
          if (!withAll.includes(filters.roles)) {
            setFilters((prev) => ({
              ...prev,
              roles: 'All',
            }));
          }
        }
      } catch (e) {
        console.error('Failed to load roles:', e);
        if (alive) setRoleOptions(['All']);
      } finally {
        alive && setLoadingRoles(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [filters.roles, setFilters]);

  const onChange = (e) => {
    const { name, value } = e.target;

    if (name === 'dateMode') {
      if (value === 'All') {
        return setFilters((prev) => ({
          ...prev,
          dateMode: 'All',
          startDate: '',
          endDate: '',
          granularity: 'totals',
        }));
      }
      return setFilters((prev) => ({
        ...prev,
        dateMode: 'Custom',
      }));
    }

    if (name === 'granularity' && filters.dateMode === 'All') {
      return setFilters((prev) => ({
        ...prev,
        granularity: 'totals',
      }));
    }

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const wrap = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: '1.25rem',
  };

  const col = {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '.92rem',
    minWidth: 180,
    color: isDark ? '#eee' : '#2b2b2b',
  };

  const inputStyle = {
    backgroundColor: isDark ? '#1a1a1a' : '#fff',
    color: isDark ? '#eee' : '#111',
    border: `1px solid ${isDark ? '#666' : '#ccc'}`,
    borderRadius: 4,
    padding: '0.25rem',
  };

  const nonTotalsDisabled = filters.dateMode !== 'Custom';

  return (
    <div style={wrap}>
      <label style={col}>
        <span>Dates:</span>
        <select
          name="dateMode"
          value={filters.dateMode}
          onChange={onChange}
          aria-label="Dates"
          style={inputStyle}
        >
          <option value="All">All</option>
          <option value="Custom">Custom</option>
        </select>
      </label>

      {filters.dateMode === 'Custom' && (
        <>
          <label style={col}>
            <span>Start Date:</span>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={onChange}
              style={inputStyle}
            />
          </label>

          <label style={col}>
            <span>End Date:</span>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={onChange}
              style={inputStyle}
            />
          </label>
        </>
      )}

      <label style={col}>
        <span>Role:</span>
        <select
          name="roles"
          value={filters.roles}
          onChange={onChange}
          disabled={loadingRoles}
          style={inputStyle}
        >
          {roleOptions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>

      <label style={col}>
        <span>Granularity:</span>
        <select
          name="granularity"
          value={filters.granularity}
          onChange={onChange}
          style={inputStyle}
        >
          {GRANULARITY_OPTS.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              disabled={
                opt.value !== 'totals' && nonTotalsDisabled
              }
            >
              {opt.label}
            </option>
          ))}
        </select>

        {nonTotalsDisabled && (
          <small
            style={{
              opacity: 0.7,
              marginTop: 4,
              color: isDark ? '#aaa' : '#555',
            }}
          >
          
          </small>
        )}
      </label>
    </div>
  );
};

export default JobAnalyticsFilters;
