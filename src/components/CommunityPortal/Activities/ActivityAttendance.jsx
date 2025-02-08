import { useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { v4 as uuidv4 } from 'uuid';
import { FaRegClock, FaIdCard } from 'react-icons/fa'; // Import icons
import './ActivityAttendance.css';
import profileImg from '../../../assets/images/profile.png';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// StatsChart Component (Donut Chart)
function StatsChart({ stats }) {
  const totalMembers = stats.find(stat => stat.title === 'Total Community Members')?.value || 1;
  const registered = stats.find(stat => stat.title === 'Registered')?.value || 0;

  // Calculate Percentage of Registered Users
  const percentage = ((registered / totalMembers) * 100).toFixed(1);

  const data = {
    labels: stats.map(stat => stat.title),
    datasets: [
      {
        data: stats.map(stat => stat.value),
        backgroundColor: ['#4CAF50', '#2196F3', '#F44336', '#FF9800'],
        hoverBackgroundColor: ['#388E3C', '#1976D2', '#D32F2F', '#F57C00'],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    cutout: '70%',
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
  };

  return (
    <div className="chart-container">
      <Doughnut data={data} options={options} />
      <div className="chart-label">{percentage}%</div>
    </div>
  );
}

// Function to Convert Data & Download as CSV
const exportToCSV = students => {
  // Define CSV Header
  let csvContent = 'data:text/csv;charset=utf-8,Name,Time In,ID\n';

  // Add Student Data
  students.forEach(({ name, time, id }) => {
    csvContent += `${name},${time},${id}\n`;
  });

  // Create Blob URL for CSV File
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'student_data.csv');

  // Trigger Download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// StatsCard Component
function StatsCard({ title, value, color }) {
  return (
    <div className="stats-card">
      <h3>{title}</h3>
      <p className="stats-value" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

// StudentRow Component
function StudentRow({ img, name, time, id }) {
  return (
    <div className="student-row">
      {/* Left - Image & Name */}
      <div className="student-left">
        <img src={img} alt={name} className="student-img" />
        <div className="student-name">{name}</div>
      </div>

      {/* Center - Time (Stacked) */}
      <div className="student-center">
        <div className="student-time">
          <FaRegClock className="student-icon" /> {time}
        </div>
      </div>

      {/* Right - ID (Stacked) */}
      <div className="student-right">
        <div className="student-id">
          <FaIdCard className="student-icon" /> {id}
        </div>
      </div>
    </div>
  );
}

// LiveUpdates Component with Search
function LiveUpdates({ students, searchTerm }) {
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="live-updates">
      <div className="updates-header">
        <h3>Live Student Update</h3>
        <button className="export-btn" type="button" onClick={() => exportToCSV(filteredStudents)}>
          Export Data
        </button>
      </div>
      <div className="updates-list">
        {filteredStudents.length > 0 ? (
          filteredStudents.map(student => (
            <StudentRow
              key={student.id}
              img={student.img}
              name={student.name}
              time={student.time}
              id={student.id}
            />
          ))
        ) : (
          <p className="no-results">No students found.</p>
        )}
      </div>
    </div>
  );
}

// Main ActivityAttendance Component
function ActivityAttendance() {
  const [searchTerm, setSearchTerm] = useState('');

  const statsData = [
    { id: uuidv4(), title: 'Total Community Members', value: 400, color: '#4CAF50' },
    { id: uuidv4(), title: 'Registered', value: 100, color: '#2196F3' },
    { id: uuidv4(), title: 'No Show', value: 15, color: '#F44336' },
    { id: uuidv4(), title: 'Community Visitor', value: 19, color: '#FF9800' },
  ];

  const students = [
    { img: profileImg, name: 'Ramakant Sharma', time: '12:30', id: '3CO-JVY' },
    { img: profileImg, name: 'John Doe', time: '12:45', id: '3CO-JXK' },
    { img: profileImg, name: 'Jane Smith', time: '01:00', id: '3CO-JYW' },
    { img: profileImg, name: 'Alice Johnson', time: '01:15', id: '3CO-JZP' },
  ];

  return (
    <div className="dashboard-container">
      {/* Title and Search Bar */}
      <div className="dashboard-title">
        <div className="title-text">
          <h2>Welcome Admin</h2>
          <p>Senior Admin - One Community</p>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search Students..."
            className="search-bar"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="dashboard-main">
        <div className="stats-chart-container">
          <StatsChart stats={statsData} />
          <div className="stats-grid">
            {statsData.map(stat => (
              <StatsCard key={stat.id} title={stat.title} value={stat.value} color={stat.color} />
            ))}
          </div>
        </div>

        {/* Live Student Updates */}
        <LiveUpdates students={students} searchTerm={searchTerm} />
      </div>
    </div>
  );
}

export default ActivityAttendance;
