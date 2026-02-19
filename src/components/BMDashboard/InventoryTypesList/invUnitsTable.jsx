import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { addInventoryUnit } from '~/actions/bmdashboard/invUnitActions';
import DeleteInvTypeModal from './DeleteInvTypeModal';
import styles from './TypesList.module.css';

export default function UnitsTable({ invUnits }) {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);

  const [newUnit, setNewUnit] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);

  const handleAdd = async () => {
    if (!newUnit.trim()) {
      toast.warning('Please enter a unit name');
      return;
    }

    setIsAdding(true);
    const result = await dispatch(addInventoryUnit({ unit: newUnit.trim() }));
    setIsAdding(false);

    if (result.success) {
      toast.success('Unit added successfully!');
      setNewUnit('');
    } else {
      toast.error(result.error || 'Failed to add unit');
    }
  };

  const handleDelete = unit => {
    setSelectedUnit(unit);
    setDeleteModalOpen(true);
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
          onChange={e => setNewUnit(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isAdding}
        />
        <Button size="sm" className={`${styles.btnTypes}`} onClick={handleAdd} disabled={isAdding}>
          {isAdding ? 'Adding...' : 'Add'}
        </Button>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteInvTypeModal
        isOpen={deleteModalOpen}
        toggle={() => setDeleteModalOpen(false)}
        itemType={selectedUnit}
        isUnit
      />
    </div>
  );
}
