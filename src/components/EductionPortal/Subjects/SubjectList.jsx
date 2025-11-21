import { useHistory } from 'react-router-dom';
import styles from './SubjectList.module.css';

function SmallProgress({ percent }) {
  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${percent}%` }} />
      </div>
      <span className={styles.progressText}>{percent}%</span>
    </div>
  );
}

export default function SubjectList() {
  const history = useHistory();

  // Hardcoded mock data for UI display
  const subjects = [
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
  ];

  return (
    <div className={styles.listContainer}>
      {subjects.map(s => (
        <button
          key={s.subjectId}
          className={styles.listItem}
          onClick={() => history.push(`/educationportal/subject/${s.subjectId}`)}
          type="button"
        >
          <span className={styles.subjectName}>{s.subjectName}</span>
          <SmallProgress percent={s.progressPercent} />
        </button>
      ))}
    </div>
  );
}
