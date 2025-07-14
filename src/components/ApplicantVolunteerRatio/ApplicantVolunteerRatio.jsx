import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
} from 'recharts';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';

// Mock data
const initialData = [
  { role: 'Master Electrician', applicants: 100, hired: 8 },
  { role: 'Surveyor', applicants: 80, hired: 5 },
  { role: 'Video Producer', applicants: 50, hired: 10 },
  { role: 'Food Specialist', applicants: 120, hired: 65 },
  { role: 'Graphic Designer', applicants: 60, hired: 30 },
];

const roleOptions = initialData.map(d => ({ label: d.role, value: d.role }));

function ApplicantVolunteerRatio() {
  const [selectedRoles, setSelectedRoles] = useState(roleOptions);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Filter data by selected roles
  const filteredData = useMemo(() => {
    const selectedRoleNames = selectedRoles.map(r => r.value);
    // Here you would also filter by date if your data had date fields
    return initialData.filter(d => selectedRoleNames.includes(d.role));
  }, [selectedRoles]);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h2>Number of People Hired vs. Total Applications</h2>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <label style={{ fontWeight: 500 }}>Date Range: </label>
          <DatePicker
            selected={startDate}
            onChange={date => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            placeholderText="Start Date"
            dateFormat="yyyy/MM/dd"
            style={{ marginRight: 8 }}
          />
          <span> to </span>
          <DatePicker
            selected={endDate}
            onChange={date => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            placeholderText="End Date"
            dateFormat="yyyy/MM/dd"
          />
        </div>
        <div style={{ minWidth: 220 }}>
          <label style={{ fontWeight: 500 }}>Role: </label>
          <Select
            isMulti
            options={roleOptions}
            value={selectedRoles}
            onChange={setSelectedRoles}
            placeholder="Select roles..."
          />
        </div>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={filteredData}
          layout="vertical"
          margin={{ top: 20, right: 40, left: 80, bottom: 20 }}
          barCategoryGap={24}
        >
          <XAxis
            type="number"
            label={{ value: 'Number of People', position: 'insideBottom', offset: -5 }}
          />
          <YAxis dataKey="role" type="category" width={180} />
          <Tooltip />
          <Legend />
          <Bar dataKey="applicants" name="Total Applicants" fill="#8884d8">
            <LabelList dataKey="applicants" position="right" />
          </Bar>
          <Bar dataKey="hired" name="Total Hired" fill="#82ca9d">
            <LabelList dataKey="hired" position="right" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ApplicantVolunteerRatio;
