import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList, ResponsiveContainer } from "recharts";

const sampleData = [
  { project: "Alpha", tool: "Hammer", replacedPercentage: 75 },
  { project: "Alpha", tool: "Screwdriver", replacedPercentage: 60 },
  { project: "Beta", tool: "Drill", replacedPercentage: 80 },
  { project: "Beta", tool: "Saw", replacedPercentage: 55 },
];

const allProjects = [...new Set(sampleData.map((d) => d.project))];

const ToolsBreakdownChart = () => {
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedDates, setSelectedDates] = useState({ start: "", end: "" });

  const handleProjectChange = (e) => {
    setSelectedProject(e.target.value);
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setSelectedDates((prev) => ({ ...prev, [name]: value }));
  };

  const filteredData = sampleData
    .filter((d) => (selectedProject ? d.project === selectedProject : true))
    .sort((a, b) => b.replacedPercentage - a.replacedPercentage);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Tools Most Susceptible to Breakdown (WIP Pratyush Sahu)</h2>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <select value={selectedProject} onChange={handleProjectChange} className="border p-2 rounded">
          <option value="">Select Project</option>
          {allProjects.map((project) => (
            <option key={project} value={project}>
              {project}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <input
            type="date"
            name="start"
            value={selectedDates.start}
            onChange={handleDateChange}
            className="border p-2 rounded"
          />
          <input
            type="date"
            name="end"
            value={selectedDates.end}
            onChange={handleDateChange}
            className="border p-2 rounded"
          />
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          layout="vertical"
          data={filteredData}
          margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
          <YAxis dataKey="tool" type="category" width={150} />
          <Tooltip formatter={(value) => `${value}%`} />
          <Bar dataKey="replacedPercentage" fill="#8884d8">
            <LabelList dataKey="replacedPercentage" position="right" formatter={(value) => `${value}%`} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ToolsBreakdownChart;
