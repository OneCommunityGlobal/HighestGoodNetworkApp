import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { boxStyle } from 'styles';

function DeleteLessonCardPopUp({ open, setDeletePopup, deleteLesson, lessonId }) {
  const closePopup = () => {
    setDeletePopup(false);
  };

  const onDelete = () => {
    closePopup();
    deleteLesson(lessonId);
  };

  return (
    <Modal isOpen={open} toggle={closePopup}>
      <ModalHeader toggle={closePopup}>Confirm Delete Lesson Card</ModalHeader>
      <ModalBody>
        <div>
          <p>Are you sure you want to delete this card?</p>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={onDelete} style={boxStyle}>
          Delete
        </Button>{' '}
        <Button color="primary" onClick={closePopup} style={boxStyle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default DeleteLessonCardPopUp;
