import { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import {
  fetchInvTypeByType,
  deleteBuildingInventoryType,
  updateBuildingInventoryType,
} from 'actions/bmdashboard/invTypeActions';

export function TypeRow(props) {
  const { updateInvTypeResult, deleteInvTypeResult, itemType, rowID, dispatch } = props;

  const [editMode, setEditMode] = useState(false);
  const [updatedType, setUpdatedType] = useState({
    name: itemType.name,
    description: itemType.description,
  });

  const handleEdit = async () => {
    const { category, _id: id } = itemType;
    const { name, description } = updatedType;
    await dispatch(updateBuildingInventoryType({ category, id, name, description }));
    setEditMode(false);
  };

  const handleDelete = async () => {
    const { category, _id: id } = itemType;
    await dispatch(deleteBuildingInventoryType({ category, id }));
    dispatch(fetchInvTypeByType(`${category}`));
  };

  const handleChangeInput = e => {
    const { name, value } = e.target;
    setUpdatedType({ ...updatedType, [name]: value });
  };

  const toggleEditMode = () => setEditMode(!editMode);

  useEffect(() => {
    if (updateInvTypeResult?.error || deleteInvTypeResult?.error) {
      setUpdatedType({ name: itemType.name, description: itemType.description });
    }
  }, [updateInvTypeResult, deleteInvTypeResult, setUpdatedType]);

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

const mapStateToProps = state => ({
  deleteInvTypeResult: state.bmInvTypes.deletedResult,
  updateInvTypeResult: state.bmInvTypes.updatedResult,
});

export default connect(mapStateToProps)(TypeRow);
