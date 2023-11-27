import Button from 'react-bootstrap/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCircle, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

function OverlayExample(props) {
  const renderTooltip = () => <Tooltip id="button-tooltip">Simple tooltip</Tooltip>;

  console.log('Props', props.children);
  return (
    <OverlayTrigger
      placement="right"
      delay={{ show: 0, hide: 100 }}
      overlay={renderTooltip}
      //   {...props}
    >
      <FontAwesomeIcon
        style={{
          // color: btnColor,
          border: '1px solid black',
          borderRadius: '50%',
          width: '10px',
          height: '10px',
        }}
        // id={id}
        // onClick={() => clicked(id)}
        icon={faCircle}
        data-testid="icon"
        // onMouseOver={handleHover}
        // onMouseLeave={handleHoverOut}
      />
    </OverlayTrigger>
  );
}

export default OverlayExample;
