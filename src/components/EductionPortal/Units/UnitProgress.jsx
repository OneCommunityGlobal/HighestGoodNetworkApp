import { useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import styles from './UnitProgress.module.css';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function UnitProgress() {
  const history = useHistory();

  // Hardcoded mock data for UI display
  const units = [
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
  ];

  return (
    <div className={styles.grid}>
      {units.map(u => (
        <UnitCard
          key={u.lessonPlanId}
          unit={u}
          onClick={() => history.push(`/educationportal/unit/${u.lessonPlanId}`)}
        />
      ))}
    </div>
  );
}

function UnitCard({ unit, onClick }) {
  const pieData = useMemo(() => {
    const completed = unit.progressPercent;
    const remaining = 100 - completed;
    return {
      labels: ['Completed', 'Remaining'],
      datasets: [
        {
          data: [completed, remaining],
          backgroundColor: ['#2196F3', '#E0E0E0'],
          borderWidth: 0,
        },
      ],
    };
  }, [unit.progressPercent]);

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: context => `${context.label}: ${context.parsed}%`,
        },
      },
    },
  };

  return (
    <button type="button" className={styles.card} onClick={onClick}>
      <h3 className={styles.cardTitle}>{unit.lessonPlanTitle}</h3>
      <div className={styles.chartContainer}>
        <Pie data={pieData} options={pieOptions} />
      </div>
      <div className={styles.metrics}>
        <span className={styles.percent}>{unit.progressPercent}%</span>
        <span className={styles.hours}>
          {unit.hoursLogged}h / {unit.suggestedHours}h
        </span>
      </div>
    </button>
  );
}
