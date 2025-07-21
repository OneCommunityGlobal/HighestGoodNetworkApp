import React, { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  Label,
  ResponsiveContainer,
} from 'recharts';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import './ApplicantSourceDonutChart.css'; // Optional custom styling

const COLORS = ['#FF4D4F', '#FFC107', '#1890FF', '#00C49F', '#8884D8'];

const ApplicantSourceDonutChart = () => {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [comparisonText, setComparisonText] = useState('');
  const [comparisonType, setComparisonType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, selectedRoles, comparisonType]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const roleParams = selectedRoles.map(role => role.value).join(',');
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());
      if (roleParams) params.append('roles', roleParams);
      if (comparisonType) params.append('comparisonType', comparisonType);

      const response = await fetch(`/api/analytics/applicant-sources?${params.toString()}`);
      const result = await response.json();

      setData(result.sources || []);
      setComparisonText(result.comparisonText || '');
    } catch (err) {
      setError('Failed to fetch data. Please try again later.');
      setData([]);
      setComparisonText('');
    } finally {
      setLoading(false);
    }
  };

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const renderCenterText = () => (
    <text
      x="50%"
      y="50%"
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={12}
      fontWeight="bold"
    >
      {comparisonText}
    </text>
  );

  const isDateRangeValid = !startDate || !endDate || startDate <= endDate;

  return (
    <div className="applicant-chart-container">
      <h2 style={{ textAlign: 'center', color: '#3977FF' }}>Source of Applicants</h2>

      {/* Filters */}
      <div className="filter-row">
        <div className="filter-input">
          <DatePicker
            selected={startDate}
            onChange={setStartDate}
            placeholderText="Start Date"
            className="filter-date"
          />
        </div>
        <div className="filter-input">
          <DatePicker
            selected={endDate}
            onChange={setEndDate}
            placeholderText="End Date"
            className="filter-date"
            minDate={startDate}
          />
        </div>
        <div className="filter-input">
          <Select
            isMulti
            options={[
              { label: 'Frontend Developer', value: 'frontend' },
              { label: 'Backend Developer', value: 'backend' },
              { label: 'Project Manager', value: 'pm' },
            ]}
            value={selectedRoles}
            onChange={setSelectedRoles}
            placeholder="Select Roles"
          />
        </div>
        <div className="filter-input">
          <Select
            options={[
              { label: 'This same week last year', value: 'week' },
              { label: 'This same month last year', value: 'month' },
              { label: 'This same year', value: 'year' },
              { label: 'Custom Dates (no comparison)', value: '' },
            ]}
            onChange={option => setComparisonType(option.value)}
            placeholder="Comparison Type"
          />
        </div>
      </div>

      {/* Chart Display */}
      <div className="chart-wrapper">
        {loading && <p style={{ textAlign: 'center' }}>Loading data...</p>}
        {!loading && error && <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>}
        {!loading && !error && data.length === 0 && (
          <p style={{ textAlign: 'center' }}>No data available for selected filters.</p>
        )}

        {!loading && !error && data.length > 0 && (
          <ResponsiveContainer width="100%" height={500}>
            <PieChart margin={{ top: 40, right: 40, left: 40, bottom: 40 }}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={100}
                outerRadius={160}
                dataKey="value"
                label={({ name, value }) =>
                  `${name}: ${((value / total) * 100).toFixed(1)}% (${value})`
                }
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                <Label content={renderCenterText} position="center" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ApplicantSourceDonutChart;


// ---------------------------------------------------------------- 
// ----------------------------------------------------------------

// import React, { useEffect, useState } from 'react';
// import { PieChart, Pie, Cell, Tooltip, Legend, Label } from 'recharts';
// import DatePicker from 'react-datepicker';
// import Select from 'react-select';
// import 'react-datepicker/dist/react-datepicker.css';
// import './ApplicantSourceDonutChart.css';

// const COLORS = ['#FF4D4F', '#FFC107', '#1890FF']; // Red, Yellow, Blue

// const ApplicantSourceDonutChart = () => {
//   const [data, setData] = useState([]);
//   const [startDate, setStartDate] = useState(null);
//   const [endDate, setEndDate] = useState(null);
//   const [selectedRoles, setSelectedRoles] = useState([]);
//   const [comparisonText, setComparisonText] = useState('');
//   const [comparisonType, setComparisonType] = useState('');

//   useEffect(() => {
//     fetchData();
//   }, [startDate, endDate, selectedRoles, comparisonType]);

//   const fetchData = async () => {
//     // Dummy data for testing
//     const dummyData = [
//       { name: 'Web Search', value: 250 },
//       { name: 'Volunteer Match', value: 160 },
//       { name: 'Referral by current volunteer', value: 160 },
//     ];
//     setData(dummyData);
//     setComparisonText('10% increase over last week');
//   };

//   const total = data.reduce((acc, item) => acc + item.value, 0);

//   const renderCenterText = () => (
//     <text
//       x="50%"
//       y="50%"
//       textAnchor="middle"
//       dominantBaseline="middle"
//       fontSize={12}
//       fontWeight="bold"
//     >
//       {comparisonText}
//     </text>
//   );

//   return (
//     <div>
//       <h2 style={{ textAlign: 'center', color: '#3977FF' }}>Source of Applicants</h2>

//       {/* Filters */}
//         <div className="filter-container">
//           <div className="filter-item">
//             <DatePicker
//               selected={startDate}
//               onChange={date => setStartDate(date)}
//               placeholderText="Start Date"
//               className="filter-input"
//             />
//           </div>
//           <div className="filter-item">
//             <DatePicker
//               selected={endDate}
//               onChange={date => setEndDate(date)}
//               placeholderText="End Date"
//               className="filter-input"
//             />
//           </div>
//           <div className="filter-item">
//             <div className="filter-input"> {/* Wrapper to force width */}
//               <Select
//                 isMulti
//                 options={[
//                   { label: 'Frontend Developer', value: 'frontend' },
//                   { label: 'Backend Developer', value: 'backend' },
//                   { label: 'Project Manager', value: 'pm' },
//                 ]}
//                 onChange={setSelectedRoles}
//                 placeholder="Select Roles"
//                 styles={{ container: base => ({ ...base, width: '100%' }) }}
//               />
//             </div>
//           </div>
//           <div className="filter-item">
//             <div className="filter-input">
//               <Select
//                 options={[
//                   { label: 'This same week last year', value: 'week' },
//                   { label: 'This same month last year', value: 'month' },
//                   { label: 'This same year', value: 'year' },
//                   { label: 'Custom Dates (no comparison)', value: '' },
//                 ]}
//                 onChange={option => setComparisonType(option.value)}
//                 placeholder="Comparison Type"
//                 styles={{ container: base => ({ ...base, width: '100%' }) }}
//               />
//             </div>
//           </div>
//         </div>


//       {/* Chart */}
//       <div style={{ display: 'flex', justifyContent: 'center' }}>
//         <PieChart width={700} height={500} margin={{ top: 40, right: 40, left: 40, bottom: 40 }}>
//         <Pie
//           data={data}
//           cx="50%"
//           cy="50%"
//           innerRadius={100}
//           outerRadius={160}
//           dataKey="value"
//           label={({ name, value }) =>
//             `${name}: ${((value / total) * 100).toFixed(1)}% (${value})`
//           }
//           labelLine={false}
//         >
//           {data.map((entry, index) => (
//             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//           ))}
//           <Label content={renderCenterText} position="center" />
//         </Pie>
//           <Tooltip />
//           <Legend />
//         </PieChart>
//       </div>
//     </div>
//   );
// };

// export default ApplicantSourceDonutChart;