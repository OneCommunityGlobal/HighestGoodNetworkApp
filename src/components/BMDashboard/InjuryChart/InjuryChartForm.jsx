import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { FormGroup, Label, Input } from 'reactstrap';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { toast } from 'react-toastify';

import { ENDPOINTS } from '../../../utils/URL';

import { fetchBMProjects } from '../../../actions/bmdashboard/projectActions';
import { fetchSeverities } from '../../../actions/bmdashboard/injuryActions';

const PALETTE = [
  '#1f77b4',
  '#ff7f0e',
  '#2ca02c',
  '#d62728',
  '#9467bd',
  '#8c564b',
  '#e377c2',
  '#7f7f7f',
  '#bcbd22',
  '#17becf',
];

function InjuryChartForm({ dark = false }) {
  const dispatch = useDispatch();

  const bmProjects = useSelector(s => s.bmProjects || []); // [{ _id, name }]
  const bmSeverities = useSelector(s => s.bmInjurySeverities || []); // ['Critical','Low',...]

  const [raw, setRaw] = useState([]); // rows from /bm/injuries/severity-by-project
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [projectId, setProjectId] = useState('all');
  const [department, setDepartment] = useState('all');

  const [stacked, setStacked] = useState(true);

  useEffect(() => {
    dispatch(fetchBMProjects());
    dispatch(fetchSeverities());
  }, [dispatch]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(ENDPOINTS.BM_INJURY_SEVERITY);
        const data = Array.isArray(res.data) ? res.data : [];

        setRaw(data);
      } catch (e) {
        const msg = e?.response?.data?.error || e?.message || 'Failed to fetch chart data';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const projectNameById = useMemo(() => {
    const m = new Map();
    for (const p of bmProjects) {
      if (p?._id) m.set(p._id, p?.name ?? '');
    }
    return m;
  }, [bmProjects]);

  const SEVERITIES = useMemo(() => {
    if (!bmSeverities?.length) {
      return ['Critical', 'Major', 'Medium', 'Minor', 'Serious', 'Low'];
    }

    return bmSeverities.map(s => (typeof s === 'string' ? s : s?.name)).filter(Boolean);
  }, [bmSeverities]);

  const departments = useMemo(() => {
    const seen = new Set();
    const ordered = [];
    for (const r of raw) {
      if (r?.department && !seen.has(r.department)) {
        seen.add(r.department);
        ordered.push(r.department);
      }
    }
    return ['all', ...ordered];
  }, [raw]);

  const chartData = useMemo(() => {
    if (!raw.length) return [];

    const filtered = raw.filter(r => {
      const okProject = projectId === 'all' ? true : r.projectId === projectId;
      const okDept = department === 'all' ? true : r.department === department;
      return okProject && okDept;
    });

    const byProject = new Map();
    for (const row of filtered) {
      const label =
        projectNameById.get(row.projectId) || row.projectName || row.projectId || 'Unknown Project';

      if (!byProject.has(label)) {
        const base = { project: label, total: 0 };
        for (const s of SEVERITIES) base[s] = 0;
        byProject.set(label, base);
      }

      const bucket = byProject.get(label);
      const sev = SEVERITIES.includes(row.severity)
        ? row.severity
        : SEVERITIES[SEVERITIES.length - 1];
      const val = Number(row.totalInjuries) || 0;
      bucket[sev] += val;
      bucket.total += val;
    }

    return Array.from(byProject.values()).sort((a, b) => a.project.localeCompare(b.project));
  }, [raw, projectId, department, projectNameById, SEVERITIES]);

  const containerClass = `p-4 rounded shadow-sm ${dark ? 'bg-dark text-light' : 'bg-white'}`;

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border" role="status" />
      </div>
    );
  }

  return (
    <div className="p-3">
      <div
        className={`mb-4 p-3 rounded shadow-sm ${dark ? 'bg-secondary text-light' : 'bg-white'}`}
      >
        <div className="row g-3 align-items-end">
          <div className="col-md-5">
            <FormGroup>
              <Label htmlFor="projectSel">Project</Label>
              <Input
                id="projectSel"
                type="select"
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
              >
                <option value="all">All Projects</option>
                {bmProjects.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </Input>
            </FormGroup>
          </div>

          <div className="col-md-5">
            <FormGroup>
              <Label htmlFor="deptSel">Department</Label>
              <Input
                id="deptSel"
                type="select"
                value={department}
                onChange={e => setDepartment(e.target.value)}
              >
                {departments.map(d => (
                  <option key={d} value={d}>
                    {d === 'all' ? 'All Departments' : d}
                  </option>
                ))}
              </Input>
            </FormGroup>
          </div>

          <div className="col-md-2 d-flex align-items-center">
            <div className="form-check">
              <Input
                id="stackedBars"
                className="form-check-input"
                type="checkbox"
                checked={stacked}
                onChange={e => setStacked(e.target.checked)}
              />
              <Label className="form-check-label" htmlFor="stackedBars">
                Stacked
              </Label>
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!error && chartData.length > 0 && (
        <div className={containerClass}>
          <h5 className="text-center mb-3">Injuries by Severity per Project</h5>
          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={chartData} margin={{ top: 10, right: 24, left: 0, bottom: 32 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="project" interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend verticalAlign="top" height={36} />

              {SEVERITIES.map((sev, idx) => (
                <Bar
                  key={sev}
                  dataKey={sev}
                  name={sev}
                  fill={PALETTE[idx % PALETTE.length]}
                  stackId={stacked ? 'stack' : undefined}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* No data */}
      {!error && chartData.length === 0 && (
        <div
          className={`text-center p-5 rounded shadow-sm ${
            dark ? 'bg-secondary text-light' : 'bg-white'
          }`}
        >
          <p className="mb-0">No injury data available for the selected criteria.</p>
        </div>
      )}
    </div>
  );
}

export default InjuryChartForm;
