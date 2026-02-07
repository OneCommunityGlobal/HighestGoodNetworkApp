import { Button, Modal, Form } from 'react-bootstrap';
import styles from './TypesList.module.css';
import React from 'react';
import { useDispatch } from 'react-redux';
import { deleteInvTypeById } from '~/actions/bmdashboard/invTypeActions';

export default function TypeRow(props) {
  const { itemType, id, category } = props;
  const [popupShow, setPopupShow] = React.useState(false);
  const [editShow, setEditShow] = React.useState(false);
  const dispatch = useDispatch();

  const handleEdit = () => {
    setEditShow(true);
  };

  const handleDelete = () => {
    setPopupShow(true);
  };

  const handleConfirmDelete = () => {
    dispatch(deleteInvTypeById(category, id));
    setPopupShow(false);
  };

  return (
    <>
      <tr>
        <td>{id}</td>
        <td>{itemType.name}</td>
        <td>{itemType.description}</td>
        <td>
          <Button size="sm" className={`${styles.btnTypes}`} onClick={handleEdit}>
            Edit
          </Button>
        </td>
        <td>
          <Button size="sm" className={`${styles.btnTypes}`} onClick={handleDelete}>
            Delete
          </Button>
        </td>
      </tr>

      <Modal show={popupShow} onHide={() => setPopupShow(false)} centered backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>

        <Modal.Body>Are you sure you want to delete this item?</Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setPopupShow(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={editShow} onHide={() => setEditShow(false)} centered backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Edit Item</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group controlId="formItemTypeName">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" defaultValue={itemType.name} />
            </Form.Group>

            <Form.Group controlId="formItemTypeDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={3} defaultValue={itemType.description} />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditShow(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              //call to backend to save changes
              setEditShow(false);
            }}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
