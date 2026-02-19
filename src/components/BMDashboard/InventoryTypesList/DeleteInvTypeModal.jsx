import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { toast } from 'react-toastify';
import { deleteInventoryType } from '~/actions/bmdashboard/invTypeActions';
import { deleteInventoryUnit } from '~/actions/bmdashboard/invUnitActions';
import styles from './TypesList.module.css';

function DeleteInvTypeModal({ isOpen, toggle, itemType, category, isUnit = false }) {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    let result;
    if (isUnit) {
      result = await dispatch(deleteInventoryUnit(itemType._id));
    } else {
      result = await dispatch(deleteInventoryType(itemType._id, category));
    }

    setIsDeleting(false);

    if (result.success) {
      toast.success(`${isUnit ? 'Unit' : 'Type'} deleted successfully!`);
      toggle();
    } else {
      toast.error(result.error || `Failed to delete ${isUnit ? 'unit' : 'type'}`);
    }
  };

  const getItemName = () => {
    if (isUnit) {
      return itemType?.unit || 'this unit';
    }
    return itemType?.name || 'this type';
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} className={darkMode ? 'text-light dark-mode' : ''}>
      <ModalHeader className={darkMode ? 'bg-space-cadet' : ''} toggle={toggle}>
        Confirm Delete
      </ModalHeader>
      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
        <p>
          Are you sure you want to delete{' '}
          <strong style={{ color: darkMode ? '#90EE90' : '#285739' }}>
            {getItemName()}
          </strong>
          ?
        </p>
        <p className="text-muted">
          This action cannot be undone. {!isUnit && 'This type will be removed from all inventory records.'}
        </p>
      </ModalBody>
      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Button
          onClick={toggle}
          disabled={isDeleting}
          className={styles.modalBtnCancel}
        >
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          disabled={isDeleting}
          className={styles.modalBtnDanger}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default DeleteInvTypeModal;
