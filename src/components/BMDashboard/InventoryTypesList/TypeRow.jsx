import { Button } from 'react-bootstrap';
import styles from './TypesList.module.css';

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
