import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarCheck } from '@fortawesome/free-regular-svg-icons';
import moment from 'moment';
import { boxStyle, boxStyleDark } from 'styles';
import CountdownTimer from './CountdownTimer';

function DueDateTime({ dueDate, isShow, darkMode }) {
  // The display time should add 1 sec so it displays Sunday at 00:00 and not Saturday at 23:59:59.
  const displayTime = moment(dueDate)
    .tz('America/Los_Angeles')
    .add(1, 'second');
  return (
    <div className={`my-4 my-md-1 ${darkMode ? 'text-light' : ''}`}>
      {isShow ? (
        <div className="mb-1">Weekly Summary Due Date (click to close)</div>
      ) : (
        <div className="mb-1">Weekly Summary Due Date (click to add)</div>
      )}
      <div className="mx-auto due-section" style={darkMode ? boxStyleDark : boxStyle}>
        <div className="text-light due-section__date">
          <FontAwesomeIcon icon={faCalendarCheck} className="mr-1" />{' '}
          {displayTime.format('MMM-DD-YY')} at {displayTime.format('HH:mm')} PST
        </div>
        <CountdownTimer date={dueDate} darkMode={darkMode} />
      </div>
    </div>
  );
}

DueDateTime.propTypes = {
  dueDate: PropTypes.shape({
    format: PropTypes.func,
  }).isRequired,
};

export default DueDateTime;
