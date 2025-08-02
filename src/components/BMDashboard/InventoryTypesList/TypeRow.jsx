import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import styles from './TypesList.module.css';
import { connect } from 'react-redux';
import { deleteInvType, updateInvType } from '../../../actions/bmdashboard/invTypeActions';

function TypeRow(props) {
  const { itemType, id, category, dispatch, requiresUnit } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [editType, setEditType] = useState({
    name: itemType.name,
    description: itemType.description,
    unit: itemType.unit || '',
    fuel: itemType.fuelType || '',
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDelete = () => {
    dispatch(deleteInvType(category, itemType._id));
  };

  const handleSave = () => {
    if (editType.name.trim() && (!requiresUnit || editType.unit.trim())) {
      // Only include unit if it's required for this category
      let payload;
      if (category === 'Equipments') {
        // Equipment needs description and fuel fields
        payload = {
          name: editType.name,
          description: editType.description,
          fuel: editType.fuel,
        };
      } else if (requiresUnit) {
        payload = editType;
      } else {
        payload = { name: editType.name, description: editType.description };
      }
      dispatch(updateInvType(category, itemType._id, payload));
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditType({
      name: itemType.name,
      description: itemType.description,
      unit: itemType.unit || '',
      fuel: itemType.fuelType || '',
    });
    setIsEditing(false);
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setEditType(prev => ({ ...prev, [name]: value }));
  };

  if (isEditing) {
    return (
      <tr>
        <td>{id}</td>
        <td>
          <Form.Control
            type="text"
            name="name"
            value={editType.name}
            onChange={handleInputChange}
            size="sm"
          />
        </td>
        <td>
          <Form.Control
            as="textarea"
            name="description"
            value={editType.description}
            onChange={handleInputChange}
            size="sm"
            rows={2}
          />
        </td>
        {requiresUnit && (
          <td>
            <Form.Control
              type="text"
              name="unit"
              value={editType.unit}
              onChange={handleInputChange}
              size="sm"
            />
          </td>
        )}
        {category === 'Equipments' && (
          <td>
            <Form.Control
              type="text"
              name="fuel"
              value={editType.fuel}
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
          <Button size="sm" variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td>{id}</td>
      <td>{itemType.name}</td>
      <td>{itemType.description}</td>
      {requiresUnit && <td>{itemType.unit || '-'}</td>}
      {category === 'Equipments' && <td>{itemType.fuelType || '-'}</td>}
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
  );
}

export default connect()(TypeRow);
