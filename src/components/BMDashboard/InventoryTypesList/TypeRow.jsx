import { Button } from 'react-bootstrap';
import styles from './TypesList.module.css';

function TypeRow(props) {
  const {
    itemType,
    id,
    category,
    requiresUnit,
    canEdit = false,
    canDelete = false,
    onEdit,
    onDelete,
  } = props;

  return (
    <tr>
      <td>{id}</td>
      <td>{itemType.name}</td>
      <td>{itemType.description || '-'}</td>

      {requiresUnit && <td>{itemType.unit || '-'}</td>}

      {category === 'Equipments' && <td>{itemType.fuelType || '-'}</td>}

      {(canEdit || canDelete) && (
        <td className={styles.actionsCell}>
          {canEdit && (
            <Button
              size="sm"
              className={styles.editButton}
              onClick={() => onEdit?.()}
              aria-label={`Edit ${itemType.name}`}
            >
              Edit
            </Button>
          )}

          {canDelete && (
            <Button
              size="sm"
              className={styles.deleteButton}
              onClick={() => onDelete?.()}
              aria-label={`Delete ${itemType.name}`}
            >
              Delete
            </Button>
          )}
        </td>
      )}
    </tr>
  );
}

export default TypeRow;
