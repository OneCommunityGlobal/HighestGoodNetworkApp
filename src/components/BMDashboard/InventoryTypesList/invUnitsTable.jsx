import { useState } from 'react';
import { Table, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import {
  deleteInvUnit,
  postBuildingInventoryUnit,
} from '../../../actions/bmdashboard/invUnitActions';
import styles from './TypesList.module.css';

function UnitsTable(props) {
  const { invUnits, dispatch } = props;
  const [newUnit, setNewUnit] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleDelete = unit => {
    dispatch(deleteInvUnit(unit.unit));
  };

  const handleAdd = () => {
    if (newUnit.trim()) {
      setIsAdding(true);
      dispatch(postBuildingInventoryUnit({ unit: newUnit.trim() }));
      setNewUnit('');
      setIsAdding(false);
    }
  };

  const handleInputChange = e => {
    setNewUnit(e.target.value);
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
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
            <tr key={`invUnit-${unit._id || unit.unit}`}>
              <td>{unit.unit}</td>
              <td>
                <Button
                  size="sm"
                  className={`${styles.btnTypes}`}
                  onClick={() => handleDelete(unit)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className={styles.addUnitContainer}>
        <input
          id="input-measurement"
          type="text"
          placeholder="Enter a new measurement"
          value={newUnit}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          disabled={isAdding}
        />
        <Button size="sm" className={`${styles.btnTypes}`} onClick={handleAdd} disabled={isAdding}>
          {isAdding ? 'Adding...' : 'Add'}
        </Button>
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  invUnits: state.bmInvUnits.list,
});

export default connect(mapStateToProps)(UnitsTable);
