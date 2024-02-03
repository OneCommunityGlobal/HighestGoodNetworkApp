import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import { deleteBuildingInventoryType } from 'actions/bmdashboard/invTypeActions';

export function TypeRow(props) {
  const { itemType, id, dispatch } = props;

  const handleEdit = () => {
    // TODO:
  };

  const handleDelete = () => {
    dispatch(deleteBuildingInventoryType({ category: itemType.category, id: itemType._id }));
  };

  return (
    <tr>
      <td>{id}</td>
      <td>{itemType.name}</td>
      <td>{itemType.description}</td>
      <td>
        <Button size="sm" className="btn-types" onClick={handleEdit}>
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
