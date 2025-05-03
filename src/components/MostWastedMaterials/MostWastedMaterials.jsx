import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList
} from "recharts";

const mockData = [
  { material: "Concrete", percentage: 32 },
  { material: "Wood", percentage: 27 },
  { material: "Steel", percentage: 18 },
  { material: "Glass", percentage: 12 },
  { material: "Plastic", percentage: 9 },
];

const projectOptions = ["Project A", "Project B", "Project C"];

export default function MostWastedMaterialsGraph() {
  const [selectedProject, setSelectedProject] = useState("Project A");
  const [dateRange, setDateRange] = useState({ start: new Date(), end: new Date() });
  const [data, setData] = useState([]);

  useEffect(() => {
    // Simulate data fetch based on filters
    const sortedData = [...mockData].sort((a, b) => b.percentage - a.percentage);
    setData(sortedData);
  }, [selectedProject, dateRange]);

  return (
    <div style={{ padding: "1rem", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)", borderRadius: "1rem" }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem", textAlign: "center" }}>Most Wasted Materials</h2>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap", justifyContent: "center" }}>
        <div>
          <label htmlFor="project" style={{ display: "block", marginBottom: ".5rem" }}>Project</label>
          <select
            id="project"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            style={{ padding: ".5rem", borderRadius: ".5rem", border: "1px solid #ccc" }}
          >
            {projectOptions.map((project) => (
              <option key={project} value={project}>
                {project}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="date" style={{ display: "block", marginBottom: ".5rem" }}>Date Range</label>
          <input
            type="date"
            value={dateRange.start.toISOString().split('T')[0]}
            onChange={(e) => setDateRange({ ...dateRange, start: new Date(e.target.value) })}
            style={{ padding: ".5rem", borderRadius: ".5rem", border: "1px solid #ccc", marginRight: ".5rem" }}
          />
          <input
            type="date"
            value={dateRange.end.toISOString().split('T')[0]}
            onChange={(e) => setDateRange({ ...dateRange, end: new Date(e.target.value) })}
            style={{ padding: ".5rem", borderRadius: ".5rem", border: "1px solid #ccc" }}
          />
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="material" />
          <YAxis label={{ value: "% Wasted", angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <Bar dataKey="percentage" fill="#8884d8">
            <LabelList dataKey="percentage" position="top" formatter={(value) => `${value}%`} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
