import { v4 as uuidv4 } from 'uuid';
import { Button } from 'reactstrap';
import { Link } from 'react-router-dom';
// button styles for each section
const buttonStyles = {
  dailyLogging: 'green',
  newItem: 'blue',
  team: 'indigo',
};

function LogBar(props) {
  const { projectId } = props;
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
      name: ['Create New Team', 'Edit Existing Team', 'Log Issue'],
      url: ['/teams', '/teams', '/bmdashboard/issues/add'],
    },
  };

  return (
    <div className="log-bar">
      {Object.keys(buttonStyles).map(section => (
        <div key={uuidv4()} className="log-bar__section">
          <h2>
            {(() => {
              switch (section) {
                case 'dailyLogging':
                  return 'Daily Logging:';
                case 'newItem':
                  return 'Add a New Item:';
                default:
                  return 'Team';
              }
            })()}
          </h2>
          <ul className="log-bar__btn-group">
            {buttonLabels[section].name.map((label, index) => (
              <li key={uuidv4()}>
                {label !== 'Log Issue' ? (
                  <Link to={buttonLabels[section].url[index]}>
                    <Button type="button" className={`button button--${buttonStyles[section]}`}>
                      {label}
                    </Button>
                  </Link>
                ) : (
                  <Link to="/bmdashboard/issues/add">
                    <Button type="button" className="button button--maroon">
                      Log Issue
                    </Button>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default LogBar;
