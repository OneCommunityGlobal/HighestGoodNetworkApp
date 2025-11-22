import { Table, Button } from 'react-bootstrap';
import styles from './TypesList.module.css';

export default function UnitsTable(props) {
  const { invUnits } = props;

  const handleDelete = () => {
    // TODO:
  };

  const handleAdd = () => {
    // TODO:
  };

  return (
    <div>
      <Table hover borderless size="sm" responsive="lg">
        <thead className={`${styles.tableHeader}`}>
          <tr>
            <th>Name</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {invUnits?.map(unit => (
            <tr key={`invUnit-${unit.unit}`}>
              <td>{unit.unit}</td>
              <td>
                <Button size="sm" className={`${styles.btnTypes}`} onClick={handleDelete}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div>
        <input id="input-measurement" type="text" placeholder="Enter a new measurement" />
        <Button size="sm" className={`${styles.btnTypes}`} onClick={handleAdd}>
          Add
        </Button>
      </div>
    </div>
  );
}
