import { v4 as uuidv4 } from 'uuid';
import { Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import styles from './ProjectDetails.module.css'; // import as module

const buttonStyles = {
  dailyLogging: 'green',
  newItem: 'blue',
  team: 'indigo',
};

function LogBar({ projectId }) {
  const buttonLabels = {
    dailyLogging: {
      name: ['Time', 'Material', 'Tool/Equipment'],
      url: ['/bmdashboard/timelog', '/bmdashboard/materials/add', '/bmdashboard/tools/log'],
    },
    newItem: {
      name: ['Team', 'Material', 'Tool/Equipment', 'Lessons'],
      url: [
        '/teams',
        '/bmdashboard/materials/add',
        '/bmdashboard/tools/add',
        `/bmdashboard/lessonform/${projectId}`,
      ],
    },
    team: {
      name: ['Create New Team', 'Edit Existing Team', 'Log Issue', 'View Issues'],
      url: ['/teams', '/teams', `/bmdashboard/issues/add/${projectId}`, '/bmdashboard/issues/'],
    },
  };

  return (
    <div className={styles.logBar}>
      {Object.keys(buttonStyles).map(section => (
        <div key={uuidv4()} className={styles.logBarSection}>
          <h2>
            {section === 'dailyLogging'
              ? 'Daily Logging:'
              : section === 'newItem'
              ? 'Add a New Item:'
              : 'Team'}
          </h2>
          <ul className={styles.logBarBtnGroup}>
            {buttonLabels[section].name.map((label, index) => {
              const colorClass = label === 'Log Issue' ? 'maroon' : buttonStyles[section];
              return (
                <li key={uuidv4()}>
                  <Link to={buttonLabels[section].url[index]}>
                    <Button type="button" className={`${styles.buttonBtn} ${styles[colorClass]}`}>
                      {label}
                    </Button>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default LogBar;
