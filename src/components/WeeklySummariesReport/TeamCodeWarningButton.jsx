import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import styles from './WeeklySummariesReport.module.css';

const TeamCodeWarningButton = ({ count, active, onClick }) => {
  if (count === 0) return null;

  return (
    <>
      <button
        type="button"
        className={`${styles.teamCodeWarningButton} ${
          active ? styles.teamCodeWarningButtonActive : ''
        } text-danger`}
        data-tip
        data-for="teamCodeWarningTooltip"
        aria-label={active ? 'Show all users' : 'Show users with mismatched team codes'}
        aria-pressed={active}
        onClick={onClick}
      >
        <i className="fa fa-info-circle" aria-hidden="true" />
      </button>
      <ReactTooltip id="teamCodeWarningTooltip" place="top" effect="solid">
        {`${count} users have mismatched team codes! Smash this “i” button to see who they are 👊`}
      </ReactTooltip>
    </>
  );
};

TeamCodeWarningButton.propTypes = {
  count: PropTypes.number.isRequired,
  active: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default TeamCodeWarningButton;
