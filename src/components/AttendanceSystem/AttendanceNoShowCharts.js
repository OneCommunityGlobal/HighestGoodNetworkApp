import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const AttendanceNoShowCharts = () => {
  // Mock Data for Attendance Status
  const attendanceData = [
    { status: "Present", count: 3 },
    { status: "Absent", count: 2 },
  ];

  const attendanceColors = ["#0088FE", "#FF8042"];

  // Mock Data for No-Show Breakdown
  const eventData = { registrations: 50, attendees: 40 };
  const noShowData = [
    { name: "Attendees", count: eventData.attendees },
    { name: "No-Shows", count: eventData.registrations - eventData.attendees },
  ];

  const noShowColors = ["#82ca9d", "#FF6347"];

  return (
    <div style={{ display: "flex", justifyContent: "space-around", padding: "20px" }}>
      {/* Attendance Status Pie Chart */}
      <div>
        <h3>Attendance Status</h3>
        <PieChart width={400} height={400}>
          <Pie
            data={attendanceData}
            dataKey="count"
            nameKey="status"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            label={(entry) => `${entry.status}: ${entry.count}`}
          >
            {attendanceData.map((entry, index) => (
              <Cell key={`attendance-cell-${index}`} fill={attendanceColors[index % attendanceColors.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>

      {/* No-Show Breakdown Pie Chart */}
      <div>
        <h3>No-Show Breakdown</h3>
        <PieChart width={400} height={400}>
          <Pie
            data={noShowData}
            dataKey="count"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            label={(entry) => `${entry.name}: ${entry.count}`}
          >
            {noShowData.map((entry, index) => (
              <Cell key={`noshow-cell-${index}`} fill={noShowColors[index % noShowColors.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>
    </div>
  );
};

export default AttendanceNoShowCharts;
