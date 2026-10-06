/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-props-no-spreading */

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import styles from './Warnings.module.css';
import { useSelector } from 'react-redux';

function WarningIcon({
  userProfileModal,
  id,
  color,
  date: dateAssigned,
  warningText,
  handleShowWarningModal,
  numberOfWarnings,
  canIssueTrackingWarnings,
  handleWarningIconClicked,
}) {
  // const {
  //   id,
  //   color,
  //   date: dateAssigned,
  //   warningText,
  //   handleModalTriggered,
  //   numberOfWarnings,
  // } = props;

  const darkMode = useSelector(state => state.theme.darkMode);

  // eslint-disable-next-line no-shadow
  const handleIssueWarning = id => {
    if (!canIssueTrackingWarnings) {
      return;
    }
    const today = moment().format('MM/DD/YYYY HH:mm:ss a');
    const [todaysDate, todaysTime, todaysTimeOfDay] = today.split(' ');

    const colorAssigned = 'blue';
    const warningDetails = { todaysDate, id, colorAssigned, warningText };

    if (color === 'blue' || color === 'red' || color === 'yellow') {
      handleShowWarningModal({ id, deleteWarning: true, warningDetails });
      return;
    }
    if (numberOfWarnings >= 2) {
      handleShowWarningModal({ id, deleteWarning: false, displayModal: true, warningDetails });
      return;
    }

    handleWarningIconClicked({ id, colorAssigned, todaysDate, warningText });
  };

  const popover = (
    <Popover id="popover-basic" className={darkMode ? styles.popoverDarkMode : ''}>
      <Popover.Title as="h4">Date Assigned</Popover.Title>
      <Popover.Content className={styles['popover-body']}>{dateAssigned}</Popover.Content>
    </Popover>
  );

  const warningColor = () => {
    if (color === 'red') {
      return styles.warningColorRed;
    } else if (color === 'blue') {
      return styles.warningColorBlue;
    } else if (color === 'yellow') {
      return styles.warningColorYellow;
    }
    return '';
  };

  const renderIcon = (
    <FontAwesomeIcon
      style={{
        cursor: userProfileModal ? 'not-allowed' : 'pointer',
      }}
      className={`${styles.icon} ${warningColor()}`}
      id={id}
      onClick={userProfileModal ? null : () => handleIssueWarning(id)}
      icon={faCircle}
      data-testid="icon"
    />
  );

  return (
    <div className={`${styles['warning-icon']}`}>
      {dateAssigned ? (
        <OverlayTrigger placement="top" delay={{ show: 100, hide: 250 }} overlay={popover}>
          {renderIcon}
        </OverlayTrigger>
      ) : (
        renderIcon
      )}
    </div>
  );
}

export default WarningIcon;
