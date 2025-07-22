import { useEffect, useMemo, useState } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
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
import './InjurySeverityChart.css';

const { Option } = Select;
const { RangePicker } = DatePicker;

const generateColors = n =>
  Array.from({ length: n }, (_, i) => {
    const hue = Math.round((i * 360) / n);
    return `hsl(${hue}, 70%, 50%)`;
  });

const SEVERITY_ORDER = ['Minor', 'Major', 'Critical'];

function InjurySeverityDashboard(props) {
  const dispatch = useDispatch();
  const bmProjects = useSelector(state => state.bmProjects);
  const rawData = useSelector(state => state.bmInjuries);
  const { darkMode } = props;

  const [selProjects, setSelProjects] = useState([]);
  const [selTypes, setSelTypes] = useState([]);
  const [selDepts, setSelDepts] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchBMProjects());
  }, [dispatch]);

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

  const chartData = useMemo(() => {
    const projectNames = Array.from(new Set(rawData.map(r => r.projectName)));
    return SEVERITY_ORDER.map(sev => {
      const entry = { severity: sev };
      projectNames.forEach(pn => {
        const rec = rawData.find(r => r.severity === sev && r.projectName === pn);
        entry[pn] = rec ? rec.totalInjuries : 0;
      });
      return entry;
    });
  }, [rawData]);

  const barColors = generateColors(bmProjects.length);

  const filterStyle = {
    minWidth: 150,
    maxWidth: 300,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: 'black',
    borderColor: '#d9d9d9',
  };

  return (
    <div
      style={{ padding: '0 24px' }}
      className={`container-fluid h-100 ${darkMode ? 'oxide-dark text-light' : ''}`}
    >
      <h2 className={`${darkMode && 'text-light'}`}>Injury Severity by Projects</h2>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <Select
          className="filter-select"
          mode="multiple"
          allowClear
          placeholder="Projects"
          style={filterStyle}
          value={selProjects}
          onChange={setSelProjects}
          maxTagCount={2}
          maxTagPlaceholder={omitted => `+${omitted.length}`}
        >
          {bmProjects.map(p => (
            <Option key={p._id} value={p._id}>
              {p.name}
            </Option>
          ))}
        </Select>

        <RangePicker
          className="filter-select"
          value={dateRange}
          onChange={dates => setDateRange(dates || [null, null])}
          style={filterStyle}
        />

        <Select
          className="filter-select"
          mode="multiple"
          allowClear
          placeholder="Injury Types"
          style={filterStyle}
          value={selTypes}
          onChange={setSelTypes}
          maxTagCount={2}
          maxTagPlaceholder={omitted => `+${omitted.length}`}
        >
          {['Cut', 'Bruise', 'Fracture', 'Burn', 'Electric Shock'].map(t => (
            <Option key={t} value={t}>
              {t}
            </Option>
          ))}
        </Select>

        <Select
          className="filter-select"
          mode="multiple"
          allowClear
          placeholder="Departments"
          style={filterStyle}
          value={selDepts}
          onChange={setSelDepts}
          maxTagCount={2}
          maxTagPlaceholder={omitted => `+${omitted.length}`}
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
            <XAxis
              dataKey="severity"
              height={60}
              label={{
                value: 'Projects',
                position: 'bottom',
                dy: 0,
              }}
            />
            <YAxis
              label={{
                value: 'Injury Count',
                angle: -90,
                position: 'insideLeft',
              }}
            />
            <Tooltip />
            <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: 30 }} />
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

const mapStateToProps = state => ({
  darkMode: state.theme.darkMode,
});
export default connect(mapStateToProps)(InjurySeverityDashboard);
