import React, { useState, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList
} from 'recharts';
// If using Material-UI, you can replace these with MUI Selects

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

  // Refs for focusing dropdowns
  const projectSelectRef = useRef(null);
  const dateSelectRef = useRef(null);

  // Helper for 'ALL' label
  const allDatesSelected = selectedDates.length === allDates.length;
  const allProjectsSelected = selectedProjects.length === allProjects.length;

  // Filter projects that are ongoing on ALL selected dates and in selectedProjects
  const filteredData = mockData.filter(
    p => selectedProjects.includes(p.name) && selectedDates.every(d => p.dates.includes(d))
  );

  return (
    <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: 24, marginBottom: 24 }}>
      <h2 style={{ marginBottom: 24 }}>Project Risk Profile Overview</h2>
      <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', marginBottom: 24, alignItems: 'flex-end' }}>
        {/* Project Dropdown */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 90 }}>
          <span style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 0 }}>Project</span>
          <span
            style={{ fontSize: 14, color: '#444', fontWeight: 500, marginBottom: 2, cursor: allProjectsSelected ? 'pointer' : 'default' }}
            onClick={() => { if (allProjectsSelected && projectSelectRef.current) projectSelectRef.current.focus(); }}
            tabIndex={allProjectsSelected ? 0 : -1}
            role="button"
            aria-label="Show project dropdown"
          >
            {allProjectsSelected ? 'ALL' : ''}
          </span>
          <select
            ref={projectSelectRef}
            multiple
            value={selectedProjects}
            onChange={e => {
              const opts = Array.from(e.target.selectedOptions, o => o.value);
              setSelectedProjects(opts.length ? opts : allProjects);
            }}
            style={{
              border: 'none',
              background: 'none',
              fontSize: 14,
              color: '#444',
              outline: 'none',
              textAlign: 'center',
              cursor: 'pointer',
              width: 60,
              minHeight: 22,
              margin: 0,
              padding: 0,
              appearance: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
            }}
            size={1}
            title="Select Project(s)"
          >
            {allProjects.map(project => (
              <option key={project} value={project}>{project}</option>
            ))}
          </select>
        </div>
        {/* Date Dropdown */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 90 }}>
          <span style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 0 }}>Dates</span>
          <span
            style={{ fontSize: 14, color: '#444', fontWeight: 500, marginBottom: 2, cursor: allDatesSelected ? 'pointer' : 'default' }}
            onClick={() => { if (allDatesSelected && dateSelectRef.current) dateSelectRef.current.focus(); }}
            tabIndex={allDatesSelected ? 0 : -1}
            role="button"
            aria-label="Show date dropdown"
          >
            {allDatesSelected ? 'ALL' : ''}
          </span>
          <select
            ref={dateSelectRef}
            multiple
            value={selectedDates}
            onChange={e => {
              const opts = Array.from(e.target.selectedOptions, o => o.value);
              setSelectedDates(opts.length ? opts : allDates);
            }}
            style={{
              border: 'none',
              background: 'none',
              fontSize: 14,
              color: '#444',
              outline: 'none',
              textAlign: 'center',
              cursor: 'pointer',
              width: 60,
              minHeight: 22,
              margin: 0,
              padding: 0,
              appearance: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
            }}
            size={1}
            title="Select Date(s)"
          >
            {allDates.map(date => (
              <option key={date} value={date}>{date}</option>
            ))}
          </select>
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
