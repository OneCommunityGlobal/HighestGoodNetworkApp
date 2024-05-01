import { Button } from 'react-bootstrap';

export default function TypeRow(props) {
  const { itemType, id } = props;

  const handleEdit = () => {
    // TODO:
  };

  const handleDelete = () => {
    // TODO:
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
