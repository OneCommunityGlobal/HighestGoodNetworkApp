import { useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import styles from './ProgressTracker.module.css';

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

export default function ProgressTracker() {
  // Hardcoded mock data for UI display
  const data = {
    tasks: [
      {
        _id: 't1',
        type: 'read',
        status: 'in_progress',
        suggestedHours: 5,
        hoursLogged: 3,
        progressPercent: 60,
        lessonPlanId: 'lp1',
        lessonPlanTitle: 'Introduction to Mathematics',
        subject: 'Mathematics',
      },
      {
        _id: 't2',
        type: 'write',
        status: 'completed',
        suggestedHours: 8,
        hoursLogged: 8,
        progressPercent: 100,
        lessonPlanId: 'lp1',
        lessonPlanTitle: 'Introduction to Mathematics',
        subject: 'Mathematics',
      },
      {
        _id: 't3',
        type: 'read',
        status: 'assigned',
        suggestedHours: 4,
        hoursLogged: 0,
        progressPercent: 0,
        lessonPlanId: 'lp2',
        lessonPlanTitle: 'Science Basics',
        subject: 'Science',
      },
      {
        _id: 't4',
        type: 'practice',
        status: 'in_progress',
        suggestedHours: 6,
        hoursLogged: 2,
        progressPercent: 33,
        lessonPlanId: 'lp2',
        lessonPlanTitle: 'Science Basics',
        subject: 'Science',
      },
      {
        _id: 't5',
        type: 'write',
        status: 'completed',
        suggestedHours: 10,
        hoursLogged: 10,
        progressPercent: 100,
        lessonPlanId: 'lp3',
        lessonPlanTitle: 'World History',
        subject: 'History',
      },
      {
        _id: 't6',
        type: 'quiz',
        status: 'assigned',
        suggestedHours: 2,
        hoursLogged: 0,
        progressPercent: 0,
        lessonPlanId: 'lp1',
        lessonPlanTitle: 'Introduction to Mathematics',
        subject: 'Mathematics',
      },
    ],
    subjects: [
      {
        subjectId: 'Mathematics',
        subjectName: 'Mathematics',
        hoursLogged: 11,
        suggestedHours: 15,
        progressPercent: 73,
      },
      {
        subjectId: 'Science',
        subjectName: 'Science',
        hoursLogged: 2,
        suggestedHours: 10,
        progressPercent: 20,
      },
      {
        subjectId: 'History',
        subjectName: 'History',
        hoursLogged: 10,
        suggestedHours: 10,
        progressPercent: 100,
      },
    ],
    units: [
      {
        lessonPlanId: 'lp1',
        lessonPlanTitle: 'Introduction to Mathematics',
        hoursLogged: 11,
        suggestedHours: 15,
        progressPercent: 73,
      },
      {
        lessonPlanId: 'lp2',
        lessonPlanTitle: 'Science Basics',
        hoursLogged: 2,
        suggestedHours: 10,
        progressPercent: 20,
      },
      {
        lessonPlanId: 'lp3',
        lessonPlanTitle: 'World History',
        hoursLogged: 10,
        suggestedHours: 10,
        progressPercent: 100,
      },
    ],
    overall: { progressPercent: 66, hoursLogged: 23, suggestedHours: 35 },
  };

  const donutData = useMemo(() => {
    if (!data?.overall) return null;
    const completed = data.overall.progressPercent;
    const remaining = 100 - completed;
    return {
      labels: ['Completed', 'Remaining'],
      datasets: [
        {
          data: [completed, remaining],
          backgroundColor: ['#4CAF50', '#E0E0E0'],
          borderWidth: 0,
        },
      ],
    };
  }, [data]);

  const taskBars = useMemo(() => {
    if (!data?.tasks || data.tasks.length === 0) return null;
    const taskLabels = data.tasks.map((t, i) => `Task ${i + 1}`);
    const taskPercentages = data.tasks.map(t => t.progressPercent);
    return {
      labels: taskLabels,
      datasets: [
        {
          label: 'Progress %',
          data: taskPercentages,
          backgroundColor: '#2196F3',
          borderRadius: 4,
        },
      ],
    };
  }, [data]);

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 12,
          font: { size: 12 },
        },
      },
      tooltip: {
        callbacks: {
          label: context => `${context.label}: ${context.parsed}%`,
        },
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: context => `${context.parsed.x}%`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: value => `${value}%`,
        },
      },
    },
  };

  return (
    <section className={styles.grid} aria-label="Student progress overview">
      {/* Donut Chart Card */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Overall Progress</h3>
        <div className={styles.chartContainer}>
          {donutData && <Doughnut data={donutData} options={donutOptions} />}
        </div>
        <div className={styles.centerText}>
          <span className={styles.percentLarge}>{data.overall.progressPercent}%</span>
          <span className={styles.hoursText}>
            {data.overall.hoursLogged}h / {data.overall.suggestedHours}h
          </span>
        </div>
      </div>

      {/* Task Progress Bars Card */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Task Progress</h3>
        <div className={styles.chartContainer}>
          {taskBars && <Bar data={taskBars} options={barOptions} />}
        </div>
      </div>

      {/* Status Sidebar */}
      <aside className={styles.sidebar} aria-label="Progress summary">
        <h3 className={styles.sidebarTitle}>Summary</h3>
        <div className={styles.sidebarItem}>
          <span className={styles.sidebarLabel}>Overall Completion</span>
          <span className={styles.sidebarValue}>{data.overall.progressPercent}%</span>
        </div>
        <div className={styles.sidebarItem}>
          <span className={styles.sidebarLabel}>Total Hours Logged</span>
          <span className={styles.sidebarValue}>{data.overall.hoursLogged}h</span>
        </div>
        <div className={styles.sidebarItem}>
          <span className={styles.sidebarLabel}>Suggested Hours</span>
          <span className={styles.sidebarValue}>{data.overall.suggestedHours}h</span>
        </div>
        <div className={styles.sidebarItem}>
          <span className={styles.sidebarLabel}>Tasks Assigned</span>
          <span className={styles.sidebarValue}>{data.tasks.length}</span>
        </div>
        <div className={styles.sidebarItem}>
          <span className={styles.sidebarLabel}>Subjects</span>
          <span className={styles.sidebarValue}>{data.subjects.length}</span>
        </div>
        <div className={styles.sidebarItem}>
          <span className={styles.sidebarLabel}>Units</span>
          <span className={styles.sidebarValue}>{data.units.length}</span>
        </div>
      </aside>
    </section>
  );
}
