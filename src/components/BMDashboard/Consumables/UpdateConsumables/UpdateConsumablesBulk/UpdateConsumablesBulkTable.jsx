import { useState } from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Table } from 'reactstrap';
import { toast } from 'react-toastify';
import moment from 'moment';
import {
  fetchAllConsumables,
  postConsumableUpdateBulk,
} from 'actions/bmdashboard/consumableActions';
import UpdateConsumable from '../UpdateConsumable';

function UpdateConsumablesBulkTable({ date, setDate, project, setProject }) {
  const dispatch = useDispatch();
  const consumables = useSelector(state => state.bmConsumables.consumableslist);
  const [consumablesState, setConsumablesState] = useState(consumables);
  const postConsumableUpdateBulkResult = useSelector(
    state => state.bmConsumables.updateConsumablesBulk,
  );
  const [cancel, setCancel] = useState(1);
  const [updatedRecordsList, setUpdatedRecordsList] = useState({});
  const [isReadyToSubmit, setIsReadyToSubmit] = useState(false);
  const [bulkValidationError, setBulkValidationError] = useState(false);
  const today = moment(new Date()).format('YYYY-MM-DD');

  const filterUpdatedRecords = records => {
    return Object.values(records).filter(record => record.newAvailable !== '');
  };

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
    const tempPostConsumableUpdateData = filterUpdatedRecords(updatedRecordsList);
    dispatch(postConsumableUpdateBulk({ updateConsumables: tempPostConsumableUpdateData, date }));
    // reset submit btn to disabled
    setIsReadyToSubmit(false);
  };

  const sendUpdatedRecordHandler = (updatedRecord, validationRecord) => {
    setUpdatedRecordsList(prevState => ({
      ...prevState,
      [updatedRecord.consumable._id]: updatedRecord,
    }));

    const hasValidationError =
      validationRecord.quantityUsed !== '' ||
      validationRecord.quantityWasted !== '' ||
      validationRecord.quantityTogether !== '';
    setBulkValidationError(hasValidationError);
  };

  useEffect(() => {
    const tempPostConsumableUpdateData = filterUpdatedRecords(updatedRecordsList);
    if (tempPostConsumableUpdateData.length > 0) {
      setIsReadyToSubmit(true);
    } else {
      setIsReadyToSubmit(false);
    }
  }, [updatedRecordsList]);

  return (
    <div>
      <Table borderless className="logConsumablesTable" responsive>
        <thead className="logCTableHeaderLine">
          <tr>
            <th colSpan={2}> Item </th>
            <th colSpan={1}>Quantity</th>
            <th colSpan={5} className="logCTableHead">
              {' '}
              Daily Log Input{' '}
            </th>
          </tr>
        </thead>
        <thead className="logCTableHeaderLine">
          <tr className="table-light">
            <th> Project </th>
            <th>Name</th>
            <th>Available</th>
            <th className="logCTableHead">Used</th>
            <th className="logCTableHead">Used(Unit)</th>
            <th className="logCTableHead">Wasted</th>
            <th className="logCTableHead">Wasted(Unit) </th>
            <th className="logCTableHead">New Available </th>
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
        <Button size="md" outline onClick={cancelHandler}>
          Cancel
        </Button>
        <Button
          size="md"
          className="logCButtonBg"
          disabled={!isReadyToSubmit || bulkValidationError}
          type="submit"
          onClick={e => submitHandler(e)}
        >
          Submit
        </Button>
      </div>
    </div>
  );
}

export default UpdateConsumablesBulkTable;
