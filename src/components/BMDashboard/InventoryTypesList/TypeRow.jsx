import { Button } from 'react-bootstrap';
import styles from './TypesList.module.css';
import React from 'react';

export default function TypeRow({ itemType, id, onEdit, onDelete }) {
  return (
    <tr>
      <td>{id}</td>
      <td>{itemType.name}</td>
      <td>{itemType.description}</td>
      <td>
        <Button size="sm" className={styles.btnTypes} onClick={onEdit}>
          Edit
        </Button>
      </td>
      <td>
        <Button size="sm" className={styles.btnTypes} onClick={onDelete}>
          Delete
        </Button>
      </td>
    </tr>
  );
}
