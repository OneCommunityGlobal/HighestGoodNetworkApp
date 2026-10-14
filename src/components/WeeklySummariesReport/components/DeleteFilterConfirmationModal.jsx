import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Spinner } from 'reactstrap';
import mainStyles from '../WeeklySummariesReport.module.css';

export default function DeleteFilterConfirmationModal({
  deleteModalOpen,
  deleteModalToggle,
  selectedFilter,
  handleDelete,
  isProcessing,
  darkMode,
}) {
  return (
    <Modal
      isOpen={deleteModalOpen}
      toggle={deleteModalToggle}
      className={`${darkMode ? mainStyles.darkModal : ''}`}
    >
      <ModalHeader toggle={deleteModalToggle}>Confirm Delete</ModalHeader>
      <ModalBody>
        {isProcessing ? (
          <div className="d-flex align-items-center">
            <Spinner size="sm" color="danger" className="mr-2" />
            Deleting...
          </div>
        ) : (
          `Are you sure you want to delete filter ${selectedFilter ? selectedFilter.label : ''}?`
        )}
      </ModalBody>
      <ModalFooter>
        {!isProcessing && (
          <>
            <Button color="secondary" onClick={deleteModalToggle}>
              Cancel
            </Button>
            <Button color="danger" onClick={handleDelete}>
              Yes, Delete
            </Button>
          </>
        )}
      </ModalFooter>
    </Modal>
  );
}
