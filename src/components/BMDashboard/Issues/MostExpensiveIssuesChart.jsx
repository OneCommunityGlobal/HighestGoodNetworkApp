import { useState } from 'react';
// import { useDispatch } from 'react-redux';
import Select from 'react-select';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList
} from 'recharts';
import './MostExpensiveIssuesChart.css';
// import { fetchOpenIssues } from 'actions/bmdashboard/issueChartActions';

// const dispatch = useDispatch();

// const { loading, issues, error, issueTypes, years } = useSelector(state => state.bmissuechart);

// useEffect(() => {
//   dispatch(fetchOpenIssues());
// }, [dispatch]);

// issues.forEach(issue => issue.createdDate = issue.createdDate.split('T')[0]);

// const dateOptions =  [...new Set(issues.map(issue=>issue.createdDate))];
// const projects = 

const allData = [
  { name: 'Issue 1', cost: 50, project: 'Project A', startDate: '2022-01-01', endDate: '2023-12-31' },
  { name: 'Issue 2', cost: 45, project: 'Project B', startDate: '2022-06-01', endDate: '2023-06-30' },
  { name: 'Issue 3', cost: 40, project: 'Project A', startDate: '2023-01-01', endDate: '2024-01-01' },
  { name: 'Issue 4', cost: 38, project: 'Project C', startDate: '2022-03-01', endDate: '2023-09-30' },
  { name: 'Issue 5', cost: 32, project: 'Project B', startDate: '2023-02-01', endDate: '2023-11-30' },
  { name: 'Issue 6', cost: 30, project: 'Project A', startDate: '2022-07-01', endDate: '2023-07-31' },
  { name: 'Issue 7', cost: 25, project: 'Project D', startDate: '2023-04-01', endDate: '2024-04-01' },
];

const projects = ['Project A', 'Project B', 'Project C', 'Project D'];
const dateOptions = ['2022-01-01', '2022-06-01', '2023-01-01', '2023-06-01', '2024-01-01'];

function MultiSelectDropdown({ label, options, selectedValues, setSelectedValues }){
  const mappedOptions = options.map(opt => ({ label: opt, value: opt }));

  const handleChange = (selectedOptions) => {
    setSelectedValues(selectedOptions ? selectedOptions.map(o => o.value) : []);
  };

  const selected = mappedOptions.filter(opt => selectedValues.includes(opt.value));

  return (
    <div className="dropdown-group">
      <span className="label">{label}</span>
      <Select
        isMulti
        value={selected}
        onChange={handleChange}
        options={mappedOptions}
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
        classNamePrefix="custom"
        placeholder={`Select ${label}`}
        styles={{
          control: (base) => ({
            ...base,
            minHeight: '34px',
          }),
          valueContainer: (base) => ({
            ...base,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '4px',
            padding: '4px',
            maxHeight: '60px',
            overflowY: 'auto',
          }),
          multiValue: (base) => ({
            ...base,
            fontSize: '12px',
            padding: '2px 6px',
            minHeight: '22px',
          }),
          multiValueLabel: (base) => ({
            ...base,
            fontSize: '12px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }),
          multiValueRemove: (base) => ({
            ...base,
            padding: '0 4px',
            fontSize: '12px',
          }),
          input: (base) => ({
            ...base,
            margin: 0,
            padding: 0,
            minHeight: '20px',
          }),
        }}
      />
    </div>
  );
};

export default function MostExpensiveIssuesChart(){
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);

  const filterData = () => {
    return allData.filter(issue => {
      const projectMatch = selectedProjects.length === 0 || selectedProjects.includes(issue.project);
      const dateMatch = selectedDates.length === 0 || selectedDates.some(date => issue.startDate <= date && issue.endDate >= date);
      return projectMatch && dateMatch;
    });
  };

  const data = filterData();
  const xTicks = Array.from({ length: 6 }, (_, i) => i * 10);

  return (
    <div className="container">
      <div className="top-bar">
        <h5 className="title">Most Expensive or Loss-making Issues</h5>
        <div className="dropdown-wrapper">
          <MultiSelectDropdown
            label="Project"
            options={projects}
            selectedValues={selectedProjects}
            setSelectedValues={setSelectedProjects}
          />
          <MultiSelectDropdown
            label="Date"
            options={dateOptions}
            selectedValues={selectedDates}
            setSelectedValues={setSelectedDates}
          />
        </div>
      </div>

      <div className="chart-wrapper">
        <BarChart
          width={1000}
          height={400}
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            domain={[0, 50]}
            ticks={xTicks}
            label={{ value: 'Cost due to issue', position: 'insideBottomRight', offset: -5 }}
          />
          <YAxis
            type="category"
            dataKey="name"
            label={{ value: 'Issue Name', angle: -90, position: 'insideLeft', offset: -30 }}
          />
          <Tooltip />
          <Bar dataKey="cost" fill="#1f77b4">
            <LabelList dataKey="cost" position="right" />
          </Bar>
        </BarChart>
      </div>
    </div>
  );
};
