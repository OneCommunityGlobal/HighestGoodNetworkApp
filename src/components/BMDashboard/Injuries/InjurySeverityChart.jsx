import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
} from 'recharts';
import { Select, DatePicker, Spin } from 'antd';
import { fetchInjurySeverity } from 'actions/bmdashboard/injuryActions';
import { fetchBMProjects } from 'actions/bmdashboard/projectActions';

const { Option } = Select;
const { RangePicker } = DatePicker;

const generateColors = n =>
  Array.from({ length: n }, (_, i) => {
    const hue = Math.round((i * 360) / n);
    return `hsl(${hue}, 70%, 50%)`;
  });

const SEVERITY_ORDER = ['Minor', 'Major', 'Critical'];

export default function InjurySeverityDashboard() {
  const dispatch = useDispatch();

  // 1) Fetch the list of projects
  const bmProjects = useSelector(state => state.bmProjects);

  useEffect(() => {
    dispatch(fetchBMProjects());
  }, [dispatch]);

  const rawData = useSelector(state => state.bmInjuries);

  // filter state
  const [selProjects, setSelProjects] = useState([]);
  const [selTypes, setSelTypes] = useState([]);
  const [selDepts, setSelDepts] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [loading, setLoading] = useState(false);

  // 3) Fetch severity data when filters change
  useEffect(() => {
    setLoading(true);
    dispatch(
      fetchInjurySeverity({
        projectIds: selProjects,
        types: selTypes,
        departments: selDepts,
        startDate: dateRange[0]?.format('YYYY-MM-DD'),
        endDate: dateRange[1]?.format('YYYY-MM-DD'),
      }),
    ).finally(() => setLoading(false));
  }, [dispatch, selProjects, selTypes, selDepts, dateRange]);

  // pivot rawData into chartData
  const chartData = useMemo(() => {
    const projectNames = Array.from(new Set(rawData.map(r => r.projectName)));
    const severities = SEVERITY_ORDER;

    return severities.map(sev => {
      const entry = { severity: sev };
      projectNames.forEach(pn => {
        const rec = rawData.find(r => r.severity === sev && r.projectName === pn);
        entry[pn] = rec ? rec.totalInjuries : 0;
      });
      return entry;
    });
  }, [rawData]);

  const barColors = useMemo(() => generateColors(bmProjects.length), [bmProjects.length]);

  return (
    <div style={{ padding: '0 24px' }}>
      <h2>Injury Severity by Projects</h2>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <Select
          mode="multiple"
          allowClear
          placeholder="Projects"
          style={{ minWidth: 200 }}
          value={selProjects}
          onChange={setSelProjects}
        >
          {bmProjects.map(p => (
            <Option key={p._id} value={p._id}>
              {p.name}
            </Option>
          ))}
        </Select>

        <RangePicker
          value={dateRange}
          onChange={dates => setDateRange(dates || [null, null])}
          style={{ minWidth: 260 }}
        />

        <Select
          mode="multiple"
          allowClear
          placeholder="Injury Types"
          style={{ minWidth: 200 }}
          value={selTypes}
          onChange={setSelTypes}
        >
          {['Cut', 'Bruise', 'Fracture', 'Burn', 'Electric Shock'].map(t => (
            <Option key={t} value={t}>
              {t}
            </Option>
          ))}
        </Select>

        <Select
          mode="multiple"
          allowClear
          placeholder="Departments"
          style={{ minWidth: 200 }}
          value={selDepts}
          onChange={setSelDepts}
        >
          {['Plumbing', 'Electrical', 'Carpentry', 'Welding'].map(d => (
            <Option key={d} value={d}>
              {d}
            </Option>
          ))}
        </Select>
      </div>

      {/* Chart */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 50 }}>
          <Spin size="large" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="severity" />
            <YAxis />
            <Tooltip />
            <Legend />
            {bmProjects.map((p, idx) => (
              <Bar key={p._id} dataKey={p.name} name={p.name} fill={barColors[idx]}>
                <LabelList dataKey={p.name} position="top" />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
