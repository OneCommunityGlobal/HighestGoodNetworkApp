/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-props-no-spreading */

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import styles from './Warnings.module.css';

const colors = {
  blue: 'blue',
  red: 'red',
  yellow: '#ffc107',
};
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

  const btnColor = color ? colors[color] : 'white';

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
    <Popover id="popover-basic">
      <Popover.Title as="h4">Date Assigned</Popover.Title>
      <Popover.Content>{dateAssigned}</Popover.Content>
    </Popover>
  );

  const renderIcon = (
    <FontAwesomeIcon
      style={{
        color: btnColor,
        border: '1px solid black',
        borderRadius: '50%',
        width: '10px',
        height: '10px',
        margin: '0em 0.175em',
        cursor: userProfileModal ? 'not-allowed' : 'pointer',
      }}
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
