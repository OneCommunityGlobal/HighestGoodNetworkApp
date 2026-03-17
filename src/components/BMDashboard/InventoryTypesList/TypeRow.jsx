import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import styles from './TypesList.module.css';

export default function TypeRow({ itemType, id, onEdit, onDelete }) {
  return (
    <tr>
      <td>{id}</td>
      <td>{itemType.name}</td>
      <td>{itemType.description}</td>
      <td>
        <Button size="sm" className={`${styles.btnTypes}`} onClick={onEdit}>
          Edit
        </Button>
      </td>
      <td>
        <Button size="sm" className={`${styles.btnTypes}`} onClick={onDelete}>
          Delete
        </Button>
      </td>
    </tr>
  );
}

TypeRow.propTypes = {
  itemType: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
  id: PropTypes.number.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
