/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-props-no-spreading */

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';

const colors = {
  blue: 'blue',
  red: 'red',
  yellow: '#ffc107',
};
function WarningIcon(props) {
  const {
    id,
    color,
    date: dateAssigned,
    warningText,
    handleModalTriggered,
    numberOfWarnings,
  } = props;

  const btnColor = color ? colors[color] : 'white';

  // eslint-disable-next-line no-shadow
  const handleIssueWarning = id => {
    const today = moment().format('MM/DD/YYYY HH:mm:ss a');
    const [todaysDate, todaysTime, todaysTimeOfDay] = today.split(' ');

    const colorAssigned = 'blue';
    const warningDetails = { todaysDate, id, colorAssigned, warningText };

    if (color === 'blue' || color === 'red' || color === 'yellow') {
      handleModalTriggered({ id, deleteWarning: true });
      return;
    }
    if (numberOfWarnings >= 2) {
      handleModalTriggered({ id, deleteWarning: false, displayModal: true, warningDetails });
      return;
    }

    props.handleWarningIconClicked({ id, colorAssigned, todaysDate, warningText });
  };

  const popover = (
    <Popover id="popover-basic">
      <Popover.Title as="h4">Date Assigned</Popover.Title>
      <Popover.Content>{dateAssigned}</Popover.Content>
    </Popover>
  );

  return (
    <div className="warning-icon">
      <OverlayTrigger placement="top" delay={{ show: 100, hide: 250 }} overlay={popover}>
        <FontAwesomeIcon
          style={{
            color: btnColor,
            border: '1px solid black',
            borderRadius: '50%',
            width: '10px',
            height: '10px',
          }}
          id={id}
          onClick={() => handleIssueWarning(id)}
          icon={faCircle}
          data-testid="icon"
        />
      </OverlayTrigger>
    </div>
  );
}

export default WarningIcon;
