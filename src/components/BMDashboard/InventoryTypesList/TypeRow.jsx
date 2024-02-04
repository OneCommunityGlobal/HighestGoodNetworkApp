import { useState } from 'react';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import {
  fetchInvTypeByType,
  deleteBuildingInventoryType,
  updateBuildingInventoryType,
} from 'actions/bmdashboard/invTypeActions';

export function TypeRow(props) {
  const { itemType, rowID, dispatch } = props;

  const [editMode, setEditMode] = useState(false);
  const [updatedType, setUpdatedType] = useState({
    name: itemType.name,
    description: itemType.description,
  });

  const handleEdit = async () => {
    // TODO:
    const { category, _id: id } = itemType;
    const { name, description } = updatedType;
    await dispatch(updateBuildingInventoryType({ category, id, name, description }));
    setEditMode(false);
    dispatch(fetchInvTypeByType(`${category}s`));
  };

  const handleDelete = async () => {
    const { category, _id: id } = itemType;
    await dispatch(deleteBuildingInventoryType({ category, id }));
    dispatch(fetchInvTypeByType(`${category}s`));
  };

  const handleChangeInput = e => {
    const { name, value } = e.target;
    setUpdatedType({ ...updatedType, [name]: value });
  };

  const toggleEditMode = () => setEditMode(!editMode);

  if (editMode) {
    return (
      <tr>
        <td>{rowID}</td>
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
      <td>{rowID}</td>
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
