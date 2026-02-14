import { Table, Button, Modal, Form } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import React, { useState } from 'react';
import TypeRow from './TypeRow';
import styles from './TypesList.module.css';
import { deleteInvTypeById, updateInvTypeById } from '~/actions/bmdashboard/invTypeActions';
import { toast } from 'react-toastify';

export function TypesTable(props) {
  const { itemTypes, category } = props;
  const dispatch = useDispatch();
  const [modalState, setModalState] = useState({
    type: '',
    visible: false,
    item: null,
    name: '',
    description: '',
  });

  const handleOpenDelete = item => {
    setModalState({
      type: 'delete',
      visible: true,
      item,
      name: '',
      description: '',
    });
  };

  const handleOpenEdit = item => {
    setModalState({
      type: 'edit',
      visible: true,
      item,
      name: item.name,
      description: item.description,
    });
  };

  const handleCloseModal = () => {
    setModalState({ type: '', visible: false, item: null, name: '', description: '' });
  };

  const handleConfirmDelete = async () => {
    try {
      await dispatch(deleteInvTypeById(modalState.item._id, category));
      toast.success('Item deleted successfully');
    } catch (err) {
      toast.error('Failed to delete item');
    } finally {
      handleCloseModal();
    }
  };

  const handleSaveEdit = async () => {
    if (!modalState.name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    try {
      await dispatch(
        updateInvTypeById(
          modalState.item._id,
          {
            name: modalState.name,
            description: modalState.description,
          },
          category,
        ),
      );
      toast.success('Item updated successfully');
    } catch (err) {
      toast.error('Failed to update item');
    } finally {
      handleCloseModal();
    }
  };

  const handleAdd = () => {
    // TODO: Implement Add functionality
  };

  return (
    <div>
      <Table hover borderless size="sm" responsive="lg">
        <thead className={styles.tableHeader}>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {itemTypes?.map((type, index) => (
            <TypeRow
              key={type._id}
              itemType={type}
              id={index + 1}
              onEdit={() => handleOpenEdit(type)}
              onDelete={() => handleOpenDelete(type)}
            />
          ))}
        </tbody>
      </Table>

      <Button size="sm" className={styles.btnTypes} onClick={handleAdd}>
        Add
      </Button>

      {/* Delete Modal */}
      {modalState.type === 'delete' && modalState.item && (
        <Modal show={modalState.visible} onHide={handleCloseModal} centered backdrop="static">
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>Are you sure you want to delete this item?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Edit Modal */}
      {modalState.type === 'edit' && modalState.item && (
        <Modal show={modalState.visible} onHide={handleCloseModal} centered backdrop="static">
          <Modal.Header closeButton>
            <Modal.Title>Edit Item</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group>
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={modalState.name}
                  onChange={e => setModalState(prev => ({ ...prev, name: e.target.value }))}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={modalState.description}
                  onChange={e => setModalState(prev => ({ ...prev, description: e.target.value }))}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}

const mapStateToProps = (state, ownProps) => ({
  itemTypes: state.bmInvTypes.invTypeList[ownProps.category],
});

export default connect(mapStateToProps)(TypesTable);
