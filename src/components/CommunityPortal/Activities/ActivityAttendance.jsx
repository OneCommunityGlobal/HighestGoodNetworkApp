import { useSelector } from 'react-redux';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { v4 as uuidv4 } from 'uuid';
import { FaRegClock, FaIdCard, FaEllipsisV } from 'react-icons/fa';
import styles from './ActivityAttendance.module.css';
import { useState } from 'react';
import profileImg from '../../../assets/images/profile.png';

ChartJS.register(ArcElement, Tooltip, Legend);

function StatsChart({ stats }) {
  const totalMembers = stats.find(stat => stat.title === 'Total Community Members')?.value || 1;
  const registered = stats.find(stat => stat.title === 'Registered')?.value || 0;
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
    <div className={styles['chart-container']}>
      <Doughnut data={data} options={options} />
      <div className={styles['chart-label']}>{percentage}%</div>
    </div>
  );
}

const exportToCSV = students => {
  let csvContent = 'data:text/csv;charset=utf-8,Name,Time In,ID\n';
  students.forEach(({ name, time, id }) => {
    csvContent += `${name},${time},${id}\n`;
  });
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'student_data.csv');
  document.body.appendChild(link);
  // eslint-disable-next-line testing-library/no-node-access
  link.click();
  document.body.removeChild(link);
};

function StatsCard({ title, value, color }) {
  return (
    <div className={styles['stats-card']}>
      <h3>{title}</h3>
      <p className={styles['stats-value']} style={{ color }}>
        {value}
      </p>
    </div>
  );
}

function StudentRow({ img, name, time, id, onViewDetails }) {
  return (
    <div className={styles['student-row']}>
      <div className={styles['student-left']}>
        <img src={img} alt={name} className={styles['student-img']} />
        <div
          className={styles['student-name']}
          title="View more details"
          onClick={onViewDetails}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              onViewDetails();
            }
          }}
          role="button"
          tabIndex={0}
        >
          {name}
        </div>
      </div>

      <div className={styles['student-center']}>
        <div className={styles['student-time']}>
          <FaRegClock className={styles['student-icon']} /> {time}
        </div>
      </div>

      <div className={styles['student-right']}>
        <div className={styles['student-id']}>
          <FaIdCard className={styles['student-icon']} /> {id}
        </div>

        <button
          type="button"
          className={styles['student-menu-btn']}
          title="View more details"
          onClick={onViewDetails}
        >
          <FaEllipsisV />
        </button>
      </div>
    </div>
  );
}

function StudentDetailPanel({ student, onClose }) {
  if (!student) return null;

  return (
    <div className={styles['student-detail-overlay']}>
      <div className={styles['student-detail-panel']}>
        <h3>Student Details</h3>
        <p>
          <strong>Name:</strong> {student.name}
        </p>
        <p>
          <strong>ID:</strong> {student.id}
        </p>
        <p>
          <strong>Check-in Time:</strong> {student.time}
        </p>

        <button type="button" className={styles['close-panel-btn']} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

function LiveUpdates({ students, searchTerm }) {
  const [selectedStudent, setSelectedStudent] = useState(null);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className={styles['live-updates']}>
      <div className={styles['updates-header']}>
        <h3>Live Student Update</h3>
        <button
          className={styles['export-btn']}
          type="button"
          onClick={() => exportToCSV(filteredStudents)}
        >
          Export Data
        </button>
      </div>

      <div className={styles['updates-list']}>
        {filteredStudents.length > 0 ? (
          filteredStudents.map(student => (
            <StudentRow
              key={student.id}
              img={student.img}
              name={student.name}
              time={student.time}
              id={student.id}
              onViewDetails={() => setSelectedStudent(student)}
            />
          ))
        ) : (
          <p className={styles['no-results']}>No students found.</p>
        )}
      </div>

      <StudentDetailPanel student={selectedStudent} onClose={() => setSelectedStudent(null)} />
    </div>
  );
}

function ActivityAttendance() {
  const darkMode = useSelector(state => state.theme.darkMode);
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
    <div
      className={`${styles['activity-attendance-page']} ${
        darkMode ? styles['activity-attendance-dark-mode'] : ''
      }`}
    >
      <div className={styles['dashboard-container']}>
        <div className={styles['dashboard-title']}>
          <div className={styles['title-text']}>
            <h2>Welcome Admin</h2>
            <p>Senior Admin - One Community</p>
          </div>
          <div className={styles['search-container']}>
            <input
              type="text"
              placeholder="Search Students..."
              className={styles['search-bar']}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className={styles['dashboard-main']}>
          <div className={styles['stats-chart-container']}>
            <StatsChart stats={statsData} />
            <div className={styles['stats-grid']}>
              {statsData.map(stat => (
                <StatsCard key={stat.id} title={stat.title} value={stat.value} color={stat.color} />
              ))}
            </div>
          </div>

          <LiveUpdates students={students} searchTerm={searchTerm} />
        </div>
      </div>
    </div>
  );
}

export default ActivityAttendance;
