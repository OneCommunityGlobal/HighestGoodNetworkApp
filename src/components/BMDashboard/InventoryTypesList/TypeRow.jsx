import { useState } from 'react';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import { deleteBuildingInventoryType } from 'actions/bmdashboard/invTypeActions';

export function TypeRow(props) {
  const { itemType, id, dispatch } = props;

  const [editMode, setEditMode] = useState(false);
  const [updatedType, setUpdatedType] = useState({
    name: itemType.name,
    description: itemType.description,
  });

  const handleEdit = () => {
    // TODO:
    setEditMode(false);
  };

  const handleDelete = () => {
    dispatch(deleteBuildingInventoryType({ category: itemType.category, id: itemType._id }));
  };

  const handleChangeInput = e => {
    const { name, value } = e.target;
    setUpdatedType({ ...updatedType, [name]: value });
  };

  const toggleEditMode = () => setEditMode(!editMode);

  if (editMode) {
    return (
      <tr>
        <td>{id}</td>
        <td>
          <input
            className="inventory-types-input"
            name="name"
            type="text"
            required
            maxLength="50"
            onChange={handleChangeInput}
            value={updatedType.name}
          />
        </td>
        <td>
          <textarea
            className="inventory-types-input"
            name="description"
            required
            maxLength="150"
            rows="1"
            onChange={handleChangeInput}
            value={updatedType.description}
          />
        </td>
        <td>
          <Button size="sm" className="#btn-types" variant="success" onClick={handleEdit}>
            Save
          </Button>
        </td>
        <td>
          <Button size="sm" variant="danger" className="#btn-types" onClick={toggleEditMode}>
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
      <td>
        <Button size="sm" className="btn-types" onClick={toggleEditMode}>
          Edit
        </Button>
      </td>
      <td>
        <Button size="sm" className="btn-types" onClick={handleDelete}>
          Delete
        </Button>
      </td>
    </tr>
  );
}

export default connect()(TypeRow);
