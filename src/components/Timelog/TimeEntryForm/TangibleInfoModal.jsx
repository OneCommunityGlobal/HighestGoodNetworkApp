import { Modal, ModalBody, ModalHeader, ModalFooter, Button } from 'reactstrap';

/**
 * Modal displaying information about the differences between tangible and intangible time
 * @param {*} props
 * @param {Boolean} props.visible
 * @param {Func} props.setVisible
 * @param {Boolean} props.darkMode
 */
function TangibleInfoModal({ visible, darkMode, setVisible }) {
  return (
    <Modal isOpen={visible} className={darkMode ? 'text-light' : ''}>
      <ModalHeader className={darkMode ? 'bg-space-cadet' : ''}>Info</ModalHeader>
      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
        <p>
          Intangible time is time logged to items not related to your specific action items OR for
          time that needs to be manually changed to tangible time by an Admin (e.g. work away from
          your computer). In the case of the latter, be sure to email your Admin your change
          request.
        </p>
      </ModalBody>
      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Button onClick={() => setVisible(false)} color="primary">
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default TangibleInfoModal;
