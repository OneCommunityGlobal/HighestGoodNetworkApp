import { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Table, Button } from 'react-bootstrap';
import {
  postBuildingInventoryUnit,
  deleteBuildingInventoryUnit,
  resetPostInvUnitResult,
  resetDeleteInvUnitResult,
} from 'actions/bmdashboard/invUnitActions';
import { toast } from 'react-toastify';

export function UnitsTable(props) {
  const { invUnits, postInvUnitsResult, deleteInvUnitResult, dispatch } = props;

  const [newUnit, setNewUnit] = useState('');

  useEffect(() => {
    if (postInvUnitsResult.error) {
      toast.error(`Error creating unit.`);
      dispatch(resetPostInvUnitResult());
    } else if (postInvUnitsResult.success) {
      toast.success(`New unit created.`);
      dispatch(resetPostInvUnitResult());
    }
  }, [postInvUnitsResult]);

  useEffect(() => {
    if (deleteInvUnitResult.error) {
      toast.error(`Error deleting unit.`);
      dispatch(resetDeleteInvUnitResult());
    } else if (deleteInvUnitResult.success) {
      toast.success(`Unit deleted.`);
      dispatch(resetDeleteInvUnitResult());
    }
  }, [deleteInvUnitResult]);

  const handleDelete = unit => {
    dispatch(deleteBuildingInventoryUnit({ unit }));
  };

  const handleAdd = e => {
    e.preventDefault();
    dispatch(postBuildingInventoryUnit({ unit: newUnit }));
    setNewUnit('');
  };

  const handleChangeInput = e => {
    setNewUnit(e.target.value);
  };

  return (
    <div>
      <Table hover borderless size="sm" responsive="lg">
        <thead className="table-header">
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
                <Button size="sm" className="btn-types" onClick={() => handleDelete(unit.unit)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <form>
        <input
          id="input-measurement"
          type="text"
          required
          maxLength="50"
          placeholder="Enter a new measurement"
          onChange={handleChangeInput}
          value={newUnit}
        />
        <Button size="sm" className="btn-types" type="submit" onClick={handleAdd}>
          Add
        </Button>
      </form>
    </div>
  );
}

const mapStateToProps = state => ({
  invUnits: state.bmInvUnits.list,
  postInvUnitsResult: state.bmInvUnits.postedResult,
  deleteInvUnitResult: state.bmInvUnits.deletedResult,
});
export default connect(mapStateToProps)(UnitsTable);
