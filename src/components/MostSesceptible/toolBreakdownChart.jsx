import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
  Legend,
  ResponsiveContainer,
} from "recharts";

const sampleData = [
  { projectId: "1", project: "Alpha", tool: "Hammer", inUse: 120, needsReplacement: 20, yetToReceive: 10 },
  { projectId: "2", project: "Alpha", tool: "Screwdriver", inUse: 80, needsReplacement: 30, yetToReceive: 10 },
  { projectId: "3", project: "Beta", tool: "Drill", inUse: 50, needsReplacement: 80, yetToReceive: 20 },
  { projectId: "4", project: "Beta", tool: "Saw", inUse: 90, needsReplacement: 10, yetToReceive: 5 },
];

const allProjects = [...new Set(sampleData.map((d) => d.project))];

const ToolsBreakdownChart = () => {
  const [selectedProject, setSelectedProject] = useState("");

  const handleProjectChange = (e) => {
    setSelectedProject(e.target.value);
  };

  const filteredData = sampleData.filter((d) =>
    selectedProject ? d.project === selectedProject : true
  );

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Tools by Availability</h2>

      <div className="mb-6 flex gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Project</label>
          <select
            value={selectedProject}
            onChange={handleProjectChange}
            className="border p-2 rounded"
          >
            <option value="">ALL</option>
            {allProjects.map((project) => (
              <option key={project} value={project}>
                {project}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          layout="vertical"
          data={filteredData}
          margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
          stackOffset="none"
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="tool" type="category" width={100} />
          <Tooltip />
          <Legend />

          <Bar dataKey="inUse" stackId="a" fill="#4285F4" name="In Use">
            <LabelList dataKey="inUse" position="insideRight" />
          </Bar>
          <Bar dataKey="needsReplacement" stackId="a" fill="#EA4335" name="Needs to be replaced">
            <LabelList dataKey="needsReplacement" position="insideRight" />
          </Bar>
          <Bar dataKey="yetToReceive" stackId="a" fill="#FBBC04" name="Yet to receive">
            <LabelList dataKey="yetToReceive" position="insideRight" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ToolsBreakdownChart;
