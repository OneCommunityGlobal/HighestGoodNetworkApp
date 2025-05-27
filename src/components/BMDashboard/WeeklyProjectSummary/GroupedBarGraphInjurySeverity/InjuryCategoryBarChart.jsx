import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LabelList, ResponsiveContainer
} from 'recharts';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './InjuryCategoryBarChart.css';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInjuryData } from '../../../../actions/bmdashboard/injuryActions';

const InjuryCategoryBarChart = () => {
  const dispatch = useDispatch();
  const { data = [], loading, error } = useSelector(state => state.bmInjury || {});
  const [projects, setProjects] = useState([]);
  const [projectFilter, setProjectFilter] = useState([]);
  const [severityFilter, setSeverityFilter] = useState([]);
  const [injuryTypeFilter, setInjuryTypeFilter] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const severityOptions = [
    { value: 'Minor', label: 'Minor' },
    { value: 'Moderate', label: 'Moderate' },
    { value: 'Severe', label: 'Severe' },
  ];

  const typeOptions = [
    { value: 'Cut', label: 'Cut' },
    { value: 'Burn', label: 'Burn' },
    { value: 'Fracture', label: 'Fracture' },
  ];

  useEffect(() => {
    // If your project list is coming from redux, fetch here
    // Else hardcode or fetch from an API
    setProjects([ // Example mock options
      { value: '5a849085592ca46b43db272a', label: 'Duplicable City Center' },
      { value: '5ad4b7514d09fa002abca581', label: 'Straw Bale Village' },
    ]);
  }, []);

  useEffect(() => {
    const filters = {
      projectIds: projectFilter.map(p => p.value).join(','),
      startDate: startDate ? startDate.toISOString() : '',
      endDate: endDate ? endDate.toISOString() : '',
      severities: severityFilter.map(s => s.value).join(','),
      types: injuryTypeFilter.map(t => t.value).join(','),
    };
    dispatch(fetchInjuryData(filters));
  }, [projectFilter, severityFilter, injuryTypeFilter, startDate, endDate, dispatch]);

  const chartData = Object.values(
    data.reduce((acc, curr) => {
      const key = curr.workerCategory;
      acc[key] = acc[key] || { workerCategory: key };
      acc[key][curr.projectName] = curr.totalInjuries;
      return acc;
    }, {})
  );

  const uniqueProjects = [...new Set(data.map(d => d.projectName))];

  return (
    <div className="injury-chart-container">
      <h3 className="injury-chart-title">Injuries by Category of worked injured</h3>

      <div className="injury-chart-filters">
        <Select isMulti options={projects} value={projectFilter} onChange={setProjectFilter} placeholder="Select Project(s)" />
        <Select isMulti options={severityOptions} value={severityFilter} onChange={setSeverityFilter} placeholder="Select Severity" />
        <Select isMulti options={typeOptions} value={injuryTypeFilter} onChange={setInjuryTypeFilter} placeholder="Select Injury Type" />
        <DatePicker selected={startDate} onChange={setStartDate} selectsStart startDate={startDate} endDate={endDate} placeholderText="Start Date" />
        <DatePicker selected={endDate} onChange={setEndDate} selectsEnd startDate={startDate} endDate={endDate} placeholderText="End Date" />
      </div>

      {loading ? <p>Loading...</p> : error ? <p>Error: {error}</p> : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <XAxis dataKey="workerCategory" />
            <YAxis />
            <Tooltip />
            <Legend />
            {uniqueProjects.map((project, index) => (
              <Bar key={project} dataKey={project} fill={index % 2 === 0 ? '#17c9d3' : '#000'}>
                <LabelList dataKey={project} position="top" />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default InjuryCategoryBarChart;
