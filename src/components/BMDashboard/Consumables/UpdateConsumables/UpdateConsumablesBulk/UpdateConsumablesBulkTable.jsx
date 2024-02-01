import { useState } from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Table } from 'reactstrap';
import { toast } from 'react-toastify';
import moment from 'moment';
import { fetchAllConsumables, postConsumableUpdateBulk } from 'actions/bmdashboard/consumableActions';
import UpdateConsumable from "../UpdateConsumable"


function UpdateConsumablesBulkTable({ date, setDate, project, setProject }) {
  const dispatch = useDispatch();
  const consumables = useSelector(state => state.bmConsumables.consumableslist);
  const [consumablesState, setConsumablesState] = useState([...consumables]);
  const postConsumableUpdateBulkResult = useSelector(state => state.bmConsumables.updateConsumablesBulk);
  const [cancel, setCancel] = useState(1);
  const [updatedRecordsList] = useState({});
  const [validationsList] = useState({});
  const [bulkValidationError, setbulkValidationError] = useState(false);
  const today = moment(new Date()).format('YYYY-MM-DD');

  useEffect(() => {
    setConsumablesState([...consumables]);
    setProject({ label: 'All Projects', value: '0' });
    setDate(today);
  }, [consumables]);

  const cancelHandler = () => {
    setCancel(prev => (prev === 1 ? 2 : 1));
  };

  // call fetch on load and update(after result)
  useEffect(() => {
    dispatch(fetchAllConsumables());
  }, [postConsumableUpdateBulkResult.result]);

  useEffect(() => {
    if (project.value !== '0') {
      const _consumables = consumables.filter(el => el.project?.name === project.label);
      setConsumablesState(_consumables);
    } else {
      setConsumablesState([...consumables]);
    }
  }, [project]);

  useEffect(() => {
    // Reset must be called if the result is being displayed due to caching of redux store
    if (
      postConsumableUpdateBulkResult.loading === false &&
      postConsumableUpdateBulkResult.error === true
    ) {
      toast.error(`${postConsumableUpdateBulkResult.result}`);
    } else if (
      postConsumableUpdateBulkResult.loading === false &&
      postConsumableUpdateBulkResult.result !== null
    ) {
      toast.success(postConsumableUpdateBulkResult.result);
    }
  }, [postConsumableUpdateBulkResult]);

  const submitHandler = e => {
    e.preventDefault();

    if (bulkValidationError) return;
    const tempPostConsumableUpdateData = Object.values(updatedRecordsList).filter(
      d => d.newAvailable !== '',
    ); // In case , user enters and removes data
    dispatch(postConsumableUpdateBulk({ updateConsumables: tempPostConsumableUpdateData, date }));
  };

  const sendUpdatedRecordHandler = (updatedRecord, validationRecord) => {
    updatedRecordsList[updatedRecord.material._id] = updatedRecord;
    validationsList[updatedRecord.material._id] = validationRecord;
    if (
      !(
        validationRecord.quantityUsed === '' &&
        validationRecord.quantityWasted === '' &&
        validationRecord.quantityTogether === ''
      )
    ) {
      setbulkValidationError(true);
    } else {
      setbulkValidationError(false);
    }
  };

  return (
    <div>
      <Table borderless className="logMaterialTable" responsive>
        <thead className="logMTableHeaderLine">
          <tr className="">
            <th colSpan={2}> Item </th>
            <th colSpan={1}>Quantity</th>
            <th colSpan={5} className="logMTableHead">
              {' '}
              Daily Log Input{' '}
            </th>
          </tr>
        </thead>
        <thead className="logMTableHeaderLine">
          <tr className="table-light">
            <th> Project </th>
            <th>Name</th>
            <th>Available</th>
            <th className="logMTableHead">Used</th>
            <th className="logMTableHead">Used(Unit)</th>
            <th className="logMTableHead">Wasted</th>
            <th className="logMTableHead">Wasted(Unit) </th>
            <th className="logMTableHead">New Available </th>
          </tr>
        </thead>
        <tbody>
          {consumablesState && Array.isArray(consumablesState) && consumablesState.length > 0 ? (
            consumablesState.map((consumable, idx) => {
              if (consumable && consumable.itemType && consumable._id) {
                return (
                  <UpdateConsumable
                    key={consumable._id + (consumable.stockAvailable || '')}
                    cancel={cancel}
                    idx={idx}
                    bulk
                    record={consumable}
                    sendUpdatedRecord={sendUpdatedRecordHandler}
                  />
                );
              }
              return null;
            })
          ) : (
            <tr align="center">
              <td colSpan="6">No data available or invalid project selection</td>
            </tr>
          )}
        </tbody>
      </Table>
      <div
        style={{ marginRight: '0px', marginLeft: '0px' }}
        className="row justify-content-between "
      >
        <Button size="md" className="logMButtons" outline onClick={cancelHandler}>
          Cancel
        </Button>
        <Button
          size="md"
          className="logMButtonBg"
          disabled={bulkValidationError}
          onClick={e => submitHandler(e)}
        >
          Submit
        </Button>
      </div>
    </div>
  );
}

export default UpdateConsumablesBulkTable;


