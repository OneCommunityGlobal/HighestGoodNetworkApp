import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { MODAL_TITLE_WARNING, MODAL_TITLE_INFO } from '../../constants/popupModal';

function IconStyle({ title }) {
  const iconWarningStyle = { color: '#FFEF4A', marginRight: '5px' };
  const iconInfoStyle = { color: '#1F63B4', marginRight: '5px' };
  switch (title) {
    case MODAL_TITLE_WARNING: {
      return <FontAwesomeIcon icon={faExclamationTriangle} style={iconWarningStyle} />;
    }
    case MODAL_TITLE_INFO: {
      return <FontAwesomeIcon icon={faInfoCircle} style={iconInfoStyle} />;
    }
    default: {
      return null;
    }
  }
}

export default function InfoModal({ title, bodyContent, show, onHide }) {
  const modalBodyStyle = { fontWeight: 'bold', fontSize: '16px' };
  return (
    <Modal
      show={show}
      size="lg"
      onHide={onHide}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      style={{ borderRadius: '10px', borderWidth: '4px' }}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {IconStyle({ title })}
          {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={modalBodyStyle}>{bodyContent}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
