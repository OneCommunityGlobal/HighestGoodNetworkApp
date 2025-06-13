import { useState, useRef } from 'react';
import Select from 'react-select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts';

const mockData = [
  {
    name: 'Project 1',
    costOverrun: 12,
    timeDelay: 18,
    openIssues: 10,
    dates: ['2025-06-01', '2025-06-08'],
  },
  {
    name: 'Project 2',
    costOverrun: 20,
    timeDelay: 50,
    openIssues: 5,
    dates: ['2025-06-01', '2025-06-08'],
  },
  {
    name: 'Project 3',
    costOverrun: 31,
    timeDelay: 20,
    openIssues: 13,
    dates: ['2025-06-01'],
  },
  {
    name: 'Project 4',
    costOverrun: 7,
    timeDelay: 20,
    openIssues: 6,
    dates: ['2025-06-08'],
  },
  {
    name: 'Project 5',
    costOverrun: 17,
    timeDelay: 9,
    openIssues: 25,
    dates: ['2025-06-01', '2025-06-08'],
  },
  {
    name: 'Project 6',
    costOverrun: 7,
    timeDelay: 12,
    openIssues: 11,
    dates: ['2025-06-01'],
  },
  {
    name: 'Project 7',
    costOverrun: 5,
    timeDelay: 11,
    openIssues: 14,
    dates: ['2025-06-08'],
  },
  {
    name: 'Project 8',
    costOverrun: 10,
    timeDelay: 10,
    openIssues: 20,
    dates: ['2025-06-08'],
  },
];

const allDates = Array.from(new Set(mockData.flatMap(p => p.dates)));
const allProjects = mockData.map(p => p.name);

export default function ProjectRiskProfileOverview() {
  const [selectedDates, setSelectedDates] = useState(allDates);
  const [selectedProjects, setSelectedProjects] = useState(allProjects);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  // Refs for focusing dropdowns
  const allSpanRef = useRef(null);
  const dateSpanRef = useRef(null);

  // Filter projects that are ongoing on ALL selected dates and in selectedProjects
  const filteredData = mockData.filter(
    p => selectedProjects.includes(p.name) && selectedDates.every(d => p.dates.includes(d)),
  );

  const getProjectLabel = () => {
    if (selectedProjects.length === allProjects.length) return 'ALL';
    if (selectedProjects.length === 0) return 'Select projects';
    return `${selectedProjects.length} selected`;
  };

  const getDateLabel = () => {
    if (selectedDates.length === allDates.length) return 'ALL';
    if (selectedDates.length === 0) return 'Select dates';
    return `${selectedDates.length} selected`;
  };

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 8,
        boxShadow: '0 2px 8px #eee',
        padding: 24,
        marginBottom: 24,
      }}
    >
      <h2 style={{ marginBottom: 24 }}>Project Risk Profile Overview</h2>
      <div
        style={{
          display: 'flex',
          gap: 40,
          flexWrap: 'wrap',
          marginBottom: 24,
          alignItems: 'flex-end',
        }}
      >
        {/* Project Dropdown */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: 90,
          }}
        >
          <span style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 0 }}>Project</span>
          <span
            ref={allSpanRef}
            style={{
              fontSize: 14,
              color: '#444',
              fontWeight: 500,
              marginBottom: 2,
              cursor: 'pointer',
              position: 'relative',
              display: 'inline-block',
              minWidth: 60,
              textAlign: 'center',
            }}
            onClick={() => setShowProjectDropdown(true)}
            tabIndex={0}
            role="button"
            aria-label="Show project dropdown"
          >
            {getProjectLabel()}
            {showProjectDropdown && (
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: '100%',
                  zIndex: 2000,
                  minWidth: 120,
                  background: 'white',
                  boxShadow: '0 2px 8px #eee',
                  borderRadius: 4,
                  marginTop: 2,
                }}
              >
                <Select
                  autoFocus
                  menuIsOpen
                  isMulti
                  classNamePrefix="custom-select"
                  options={allProjects.map(p => ({ label: p, value: p }))}
                  value={selectedProjects.map(p => ({ label: p, value: p }))}
                  onChange={opts => {
                    const values = opts && opts.length ? opts.map(o => o.value) : [];
                    setSelectedProjects(values);
                  }}
                  onBlur={() => setShowProjectDropdown(false)}
                  closeMenuOnSelect={false}
                  hideSelectedOptions={false}
                  components={{ IndicatorSeparator: () => null, ClearIndicator: () => null }}
                  styles={{
                    control: base => ({
                      ...base,
                      fontSize: 14,
                      minHeight: 22,
                      width: 120,
                      background: 'none',
                      border: 'none',
                      boxShadow: 'none',
                      textAlign: 'center',
                      alignItems: 'center',
                      padding: 0,
                    }),
                    valueContainer: base => ({
                      ...base,
                      padding: '0 2px',
                      justifyContent: 'center',
                    }),
                    multiValue: base => ({
                      ...base,
                      background: '#e6f7ff',
                      fontSize: 12,
                      margin: '0 2px',
                    }),
                    input: base => ({
                      ...base,
                      margin: 0,
                      padding: 0,
                      textAlign: 'center',
                    }),
                    placeholder: base => ({
                      ...base,
                      color: '#aaa',
                      textAlign: 'center',
                    }),
                    dropdownIndicator: base => ({
                      ...base,
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }),
                    menu: base => ({ ...base, zIndex: 9999, fontSize: 14 }),
                  }}
                />
              </div>
            )}
          </span>
        </div>
        {/* Date Dropdown */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: 90,
          }}
        >
          <span style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 0 }}>Dates</span>
          <span
            ref={dateSpanRef}
            style={{
              fontSize: 14,
              color: '#444',
              fontWeight: 500,
              marginBottom: 2,
              cursor: 'pointer',
              position: 'relative',
              display: 'inline-block',
              minWidth: 60,
              textAlign: 'center',
            }}
            onClick={() => setShowDateDropdown(true)}
            tabIndex={0}
            role="button"
            aria-label="Show date dropdown"
          >
            {getDateLabel()}
            {showDateDropdown && (
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: '100%',
                  zIndex: 2000,
                  minWidth: 120,
                  background: 'white',
                  boxShadow: '0 2px 8px #eee',
                  borderRadius: 4,
                  marginTop: 2,
                }}
              >
                <Select
                  autoFocus
                  menuIsOpen
                  isMulti
                  classNamePrefix="custom-select"
                  options={allDates.map(d => ({ label: d, value: d }))}
                  value={selectedDates.map(d => ({ label: d, value: d }))}
                  onChange={opts => {
                    const values = opts && opts.length ? opts.map(o => o.value) : [];
                    setSelectedDates(values);
                  }}
                  onBlur={() => setShowDateDropdown(false)}
                  closeMenuOnSelect={false}
                  hideSelectedOptions={false}
                  components={{ IndicatorSeparator: () => null, ClearIndicator: () => null }}
                  styles={{
                    control: base => ({
                      ...base,
                      fontSize: 14,
                      minHeight: 22,
                      width: 120,
                      background: 'none',
                      border: 'none',
                      boxShadow: 'none',
                      textAlign: 'center',
                      alignItems: 'center',
                      padding: 0,
                    }),
                    valueContainer: base => ({
                      ...base,
                      padding: '0 2px',
                      justifyContent: 'center',
                    }),
                    multiValue: base => ({
                      ...base,
                      background: '#e6f7ff',
                      fontSize: 12,
                      margin: '0 2px',
                    }),
                    input: base => ({
                      ...base,
                      margin: 0,
                      padding: 0,
                      textAlign: 'center',
                    }),
                    placeholder: base => ({
                      ...base,
                      color: '#aaa',
                      textAlign: 'center',
                    }),
                    dropdownIndicator: base => ({
                      ...base,
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }),
                    menu: base => ({ ...base, zIndex: 9999, fontSize: 14 }),
                  }}
                />
              </div>
            )}
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={filteredData}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          barGap={8}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="costOverrun" name="Predicted Cost Overrun (%)" fill="#4285F4">
            <LabelList dataKey="costOverrun" position="top" />
          </Bar>
          <Bar dataKey="openIssues" name="Issues" fill="#EA4335">
            <LabelList dataKey="openIssues" position="top" />
          </Bar>
          <Bar dataKey="timeDelay" name="Predicted Time Delay (%)" fill="#FBBC05">
            <LabelList dataKey="timeDelay" position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
