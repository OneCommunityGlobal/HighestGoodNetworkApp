import { useSelector } from 'react-redux';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { v4 as uuidv4 } from 'uuid';
import { FaRegClock, FaIdCard, FaInfoCircle } from 'react-icons/fa';
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
    <div className={styles.chartContainer}>
      <Doughnut data={data} options={options} />
      <div className={styles.chartLabel}>{percentage}%</div>
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

function StatsCard({ title, value, color, definition }) {
  return (
    <div className={styles.statsCard}>
      <div className={styles.statsCardHeader}>
        <h3>{title}</h3>
        <button
          className={styles.infoIconWrapper}
          title={definition}
          aria-label={`Definition of ${title}`}
          type="button"
        >
          <FaInfoCircle className={styles.infoIcon} />
        </button>
      </div>
      <p className={styles.statsValue} style={{ color }}>
        {value}
      </p>
    </div>
  );
}

function StudentRow({ img, name, time, id }) {
  return (
    <div className={styles.studentRow}>
      <div className={styles.studentLeft}>
        <img src={img} alt={name} className={styles.studentImg} />
        <div className={styles.studentName}>{name}</div>
      </div>
      <div className={styles.studentCenter}>
        <div className={styles.studentTime}>
          <FaRegClock className={styles.studentIcon} /> {time}
        </div>
      </div>
      <div className={styles.studentRight}>
        <div className={styles.studentId}>
          <FaIdCard className={styles.studentIcon} /> {id}
        </div>
      </div>
    </div>
  );
}

function LiveUpdates({ students, searchTerm, selectedStatus, onStatusChange }) {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredStudents = students.filter(student => {
    const matchesStatus = selectedStatus === 'All' || student.status === selectedStatus;

    const matchesSearch =
      !normalizedSearch ||
      student.name.toLowerCase().includes(normalizedSearch) ||
      student.id.toLowerCase().includes(normalizedSearch);

    return matchesStatus && matchesSearch;
  });

  const statuses = ['All', 'In', 'Out', 'Leave'];

  return (
    <div className={styles.liveUpdates}>
      <div className={styles.updatesHeader}>
        <div className={styles.updatesHeaderLeft}>
          <h3>Live Student Update</h3>
          <div className={styles.statusFilters}>
            {statuses.map(status => (
              <button
                key={status}
                type="button"
                className={`${styles.statusFilterBtn} ${
                  selectedStatus === status ? styles.statusFilterBtnActive : ''
                }`}
                onClick={() => onStatusChange(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
        <button
          className={styles.exportBtn}
          type="button"
          onClick={() => exportToCSV(filteredStudents)}
        >
          Export Data
        </button>
      </div>

      <div className={styles.updatesList}>
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
          <p className={styles.noResults}>No students found.</p>
        )}
      </div>
    </div>
  );
}

function ActivityAttendance() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const statsData = [
    {
      id: uuidv4(),
      title: 'Total Community Members',
      value: 400,
      color: '#4CAF50',
      definition: 'All members registered in the community, including inactive users and visitors.',
    },
    {
      id: uuidv4(),
      title: 'Registered',
      value: 100,
      color: '#2196F3',
      definition: 'Members registered for the selected event/session only.',
    },
    {
      id: uuidv4(),
      title: 'No Show',
      value: 15,
      color: '#F44336',
      definition: 'Registered members who did not check in or attend the event.',
    },
    {
      id: uuidv4(),
      title: 'Community Visitor',
      value: 19,
      color: '#FF9800',
      definition: 'Non-registered participants who attended the event.',
    },
  ];

  const students = [
    { img: profileImg, name: 'Ramakant Sharma', time: '12:30', id: '3CO-JVY', status: 'In' },
    { img: profileImg, name: 'John Doe', time: '12:45', id: '3CO-JXK', status: 'Out' },
    { img: profileImg, name: 'Jane Smith', time: '01:00', id: '3CO-JYW', status: 'Leave' },
    { img: profileImg, name: 'Alice Johnson', time: '01:15', id: '3CO-JZP', status: 'In' },
  ];

  return (
    <div
      className={`${styles.activityAttendancePage} ${
        darkMode ? styles.activityAttendanceDarkMode : ''
      }`}
    >
      <div className={styles.dashboardContainer}>
        {/* Title and Search Bar */}
        <div className={styles.dashboardTitle}>
          <div className={styles.titleText}>
            <h2>Welcome Admin</h2>
            <p>Senior Admin - One Community</p>
          </div>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search Students..."
              className={styles.attendanceSearchBar}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.dashboardMain}>
          <div className={styles.statsChartContainer}>
            <StatsChart stats={statsData} />
            <div className={styles.statsGrid}>
              {statsData.map(stat => (
                <StatsCard
                  key={stat.id}
                  title={stat.title}
                  value={stat.value}
                  color={stat.color}
                  definition={stat.definition}
                />
              ))}
            </div>
          </div>

          {/* Live Student Updates */}
          <LiveUpdates
            students={students}
            searchTerm={searchTerm}
            selectedStatus={statusFilter}
            onStatusChange={setStatusFilter}
          />
        </div>
      </div>
    </div>
  );
}

export default ActivityAttendance;
