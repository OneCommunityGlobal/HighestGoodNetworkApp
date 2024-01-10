import { Button } from 'react-bootstrap';

export default function TypeRow(props) {
  const { itemType, id } = props;

  const handleEdit = () => {
    // TODO:
    console.log('Editd item with id:', itemType._id);
  };

  const handleDelete = () => {
    // TODO:
    console.log('Deleted item with id:', itemType._id);
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
