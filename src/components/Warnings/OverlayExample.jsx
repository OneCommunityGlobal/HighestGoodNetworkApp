import Button from 'react-bootstrap/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle } from '@fortawesome/free-solid-svg-icons';

function OverlayExample(props) {
  const renderTooltip = () => <Tooltip id="button-tooltip">Simple tooltip</Tooltip>;

  return (
    <OverlayTrigger placement="right" delay={{ show: 0, hide: 100 }} overlay={renderTooltip}>
      <FontAwesomeIcon
        style={{
          border: '1px solid black',
          borderRadius: '50%',
          width: '10px',
          height: '10px',
        }}
        icon={faCircle}
        data-testid="icon"
      />
    </OverlayTrigger>
  );
}

export default OverlayExample;
