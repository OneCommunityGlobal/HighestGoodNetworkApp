import { Table, Button, Modal, Form, Spinner } from 'react-bootstrap';
import { connect, useSelector, useDispatch } from 'react-redux';
import React, { useState } from 'react';
import { addInvType } from '../../../actions/bmdashboard/invTypeActions';
import TypeRow from './TypeRow';
import styles from './TypesList.module.css';
import { deleteInvType, updateInvType } from '~/actions/bmdashboard/invTypeActions';
import { toast } from 'react-toastify';
import logService from '../../../services/logService';

export function TypesTable(props) {
  const { itemTypes, category, dispatch } = props;
  const rolePermissions = useSelector(state => state.role.roles);
  const userRole = useSelector(state => state.auth.user.role);
  const userPermissions = useSelector(state => state.auth.user.permissions?.frontPermissions);
  const removedDefaultPermissions = useSelector(
    state => state.auth.user.permissions?.removedDefaultPermissions || [],
  );

  const permissions = rolePermissions?.find(role => role.roleName === userRole)?.permissions || [];

  const hasAccess = permission =>
    userPermissions?.includes(permission) ||
    (permissions.includes(permission) && !removedDefaultPermissions.includes(permission));

  const canEdit = hasAccess('putInvType');
  const canDelete = hasAccess('putInvType'); //Putting edit permission to this as no specific role is set for delete
  const canAdd = hasAccess('postInvType');

  const [modalState, setModalState] = useState({
    type: '',
    visible: false,
    item: null,
    name: '',
    description: '',
  });

  const units = useSelector(state => state.bmInvUnits.list) || [];
  const [isAdding, setIsAdding] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newType, setNewType] = useState({
    name: '',
    description: '',
    unit: '',
    fuel: '',
  });

  const requiresUnit = category === 'Materials' || category === 'Consumables';

  const handleOpenDelete = item => {
    if (!canDelete || isProcessing) return;

    setModalState({
      type: 'delete',
      visible: true,
      item,
      name: '',
      description: '',
    });
  };

  const handleOpenEdit = item => {
    if (!canEdit || isProcessing) return;

    setModalState({
      type: 'edit',
      visible: true,
      item,
      name: item.name,
      description: item.description || '',
    });
  };

  const handleCloseModal = () => {
    if (isProcessing) return;

    setModalState({
      type: '',
      visible: false,
      item: null,
      name: '',
      description: '',
    });
  };

  const handleConfirmDelete = async () => {
    if (isProcessing || !canDelete || !modalState.item) return;

    setIsProcessing(true);

    try {
      await dispatch(deleteInvType(category, modalState.item._id));

      setModalState({
        type: '',
        visible: false,
        item: null,
        name: '',
        description: '',
      });
    } finally {
      setIsProcessing(false);
    }
  };
  const handleSaveEdit = async () => {
    if (isProcessing || !canEdit || !modalState.item) return;

    const trimmedName = modalState.name.trim();

    if (!trimmedName) {
      toast.error('Name cannot be empty');
      return;
    }

    if (requiresUnit && !(modalState.item.unit || '').trim()) {
      toast.error('Unit is required');
      return;
    }

    setIsProcessing(true);

    try {
      await dispatch(
        updateInvType(category, modalState.item._id, {
          name: trimmedName,
          description: modalState.description,
          ...(requiresUnit && {
            unit: modalState.item.unit,
          }),
        }),
      );

      // Do not show another success toast here.
      // updateInvType already displays its own toast.

      setModalState({
        type: '',
        visible: false,
        item: null,
        name: '',
        description: '',
      });
    } catch (err) {
      logService.logError(err);
      toast.error('Failed to update inventory type. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAdd = () => {
    if (!canAdd || isAdding || isProcessing) return;
    setIsAdding(true);
  };

  const handleSave = () => {
    if (!canAdd || isProcessing) return;
    if (!newType.name.trim() || (requiresUnit && !newType.unit.trim())) {
      toast.error(requiresUnit ? 'Name and unit are required' : 'Name cannot be empty');
      return;
    }

    let payload;

    if (category === 'Equipments') {
      payload = {
        name: newType.name.trim(),
        description: newType.description,
        fuel: newType.fuel,
      };
    } else if (requiresUnit) {
      payload = {
        ...newType,
        name: newType.name.trim(),
      };
    } else {
      payload = {
        name: newType.name.trim(),
        description: newType.description,
      };
    }

    dispatch(addInvType(category, payload));
    setNewType({ name: '', description: '', unit: '', fuel: '' });
    setIsAdding(false);
  };

  const handleCancel = () => {
    setNewType({ name: '', description: '', unit: '', fuel: '' });
    setIsAdding(false);
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setNewType(prev => ({ ...prev, [name]: value }));
  };

  const isDeleteModal = modalState.type === 'delete';
  const isEditModal = modalState.type === 'edit';

  return (
    <div>
      <Table hover borderless size="sm" responsive="lg">
        <thead className={styles.tableHeader}>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            {requiresUnit && <th>Unit</th>}
            {category === 'Equipments' && <th>Fuel Type</th>}
            {(canEdit || canDelete) && <th>Actions</th>}
          </tr>
        </thead>

        <tbody>
          {itemTypes?.map((type, index) => (
            <TypeRow
              key={type._id}
              itemType={type}
              id={index + 1}
              category={category}
              requiresUnit={requiresUnit}
              canEdit={canEdit}
              canDelete={canDelete}
              onEdit={() => handleOpenEdit(type)}
              onDelete={() => handleOpenDelete(type)}
            />
          ))}

          {isAdding && (
            <tr>
              <td>{(itemTypes?.length ?? 0) + 1}</td>
              <td>{(itemTypes?.length ?? 0) + 1}</td>
              <td>
                <Form.Control
                  type="text"
                  name="name"
                  value={newType.name}
                  onChange={handleInputChange}
                  placeholder={`Enter ${category.slice(0, -1).toLowerCase()} name`}
                  size="sm"
                />
              </td>
              <td>
                <Form.Control
                  as="textarea"
                  name="description"
                  value={newType.description}
                  onChange={handleInputChange}
                  placeholder={`Enter ${category.slice(0, -1).toLowerCase()} description`}
                  size="sm"
                  rows={2}
                />
              </td>

              {requiresUnit && (
                <td>
                  <Form.Control
                    as="select"
                    name="unit"
                    value={newType.unit}
                    onChange={handleInputChange}
                    size="sm"
                  >
                    <option value="">Select unit</option>
                    {units.map(unit => (
                      <option key={unit._id || unit.unit} value={unit.unit}>
                        {unit.unit}
                      </option>
                    ))}
                  </Form.Control>
                </td>
              )}

              {category === 'Equipments' && (
                <td>
                  <Form.Control
                    type="text"
                    name="fuel"
                    value={newType.fuel}
                    onChange={handleInputChange}
                    placeholder="Enter fuel type"
                    size="sm"
                  />
                </td>
              )}

              <td>
                <Button size="sm" variant="success" onClick={handleSave}>
                  Save
                </Button>
              </td>
              <td>
                <Button
                  size="sm"
                  className={styles.modalBtnCancel}
                  variant="secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {canAdd && (
        <Button
          size="sm"
          className={styles.btnTypes}
          onClick={handleAdd}
          disabled={isAdding || isProcessing}
        >
          Add
        </Button>
      )}
      {/* Delete confirmation modal */}
      {isDeleteModal && modalState.item && (
        <Modal
          className={styles.inventoryModal}
          show={modalState.visible}
          onHide={handleCloseModal}
          centered
          backdrop="static"
          keyboard={!isProcessing}
        >
          <Modal.Header closeButton={!isProcessing}>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            Are you sure you want to delete <strong>{modalState.item.name}</strong>?
            <p className="mb-0 mt-2">This action cannot be undone.</p>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              className={styles.modalBtnCancel}
              onClick={handleCloseModal}
              disabled={isProcessing}
            >
              Cancel
            </Button>

            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              disabled={isProcessing || !canDelete}
            >
              {isProcessing && (
                <Spinner
                  animation="border"
                  size="sm"
                  role="status"
                  aria-label="Deleting inventory type"
                  className="me-2"
                />
              )}
              {isProcessing ? 'Deleting...' : 'Delete'}
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Edit modal */}
      {isEditModal && modalState.item && (
        <Modal
          className={styles.inventoryModal}
          show={modalState.visible}
          onHide={handleCloseModal}
          centered
          backdrop="static"
          keyboard={!isProcessing}
        >
          <Modal.Header closeButton={!isProcessing}>
            <Modal.Title>Edit Inventory Type</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label className={styles.modalLabel}>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={modalState.name}
                  onChange={e =>
                    setModalState(prev => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  disabled={isProcessing}
                  required
                />
              </Form.Group>

              <Form.Group>
                <Form.Label className={styles.modalLabel}>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={modalState.description}
                  onChange={e =>
                    setModalState(prev => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  disabled={isProcessing}
                />
              </Form.Group>
            </Form>
          </Modal.Body>

          <Modal.Footer>
            <Button
              className={styles.modalBtnCancel}
              variant="secondary"
              onClick={handleCloseModal}
              disabled={isProcessing}
            >
              Cancel
            </Button>

            <Button variant="primary" onClick={handleSaveEdit} disabled={isProcessing || !canEdit}>
              {isProcessing && (
                <Spinner
                  animation="border"
                  size="sm"
                  role="status"
                  aria-label="Saving inventory type"
                  className="me-2"
                />
              )}
              {isProcessing ? 'Saving...' : 'Save Changes'}
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
