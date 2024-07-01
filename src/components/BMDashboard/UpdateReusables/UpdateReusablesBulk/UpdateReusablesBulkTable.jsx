import { useState } from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Table } from 'reactstrap';
import { toast } from 'react-toastify';
import moment from 'moment';
import { fetchAllReusables, postReusableUpdateBulk } from 'actions/bmdashboard/reusableActions';
import UpdateReusable from '../UpdateReusable';

function UpdateReusablesBulkTable({ date, setDate, project, setProject }) {
  const dispatch = useDispatch();
  const reusables = useSelector(state => state.bmReusables.reusablesList);
  const [reusablesState, setReusablesState] = useState([...reusables]);
  const postReusableUpdateBulkResult = useSelector(state => state.bmReusables.updateReusablesBulk);
  const [cancel, setCancel] = useState(1);
  const [updatedRecordsList] = useState({});
  const [validationsList] = useState({});
  const [bulkValidationError, setbulkValidationError] = useState(false);
  const today = moment(new Date()).format('YYYY-MM-DD');

  useEffect(() => {
    setReusablesState([...reusables]);
    setProject({ label: 'All Projects', value: '0' });
    setDate(today);
  }, [reusables]);

  const cancelHandler = () => {
    setCancel(prev => (prev === 1 ? 2 : 1));
  };

  // call fetch on load and update(after result)
  useEffect(() => {
    dispatch(fetchAllReusables());
  }, [postReusableUpdateBulkResult.result]);

  useEffect(() => {
    if (project.value !== '0') {
      const _reusables = reusables.filter(mat => mat.project?.name === project.label);
      setReusablesState(_reusables);
    } else {
      setReusablesState([...reusables]);
    }
  }, [project]);

  useEffect(() => {
    // Reset must be called if the result is being displayed due to caching of redux store
    if (
      postReusableUpdateBulkResult.loading === false &&
      postReusableUpdateBulkResult.error === true
    ) {
      toast.error(`${postReusableUpdateBulkResult.result}`);
    } else if (
      postReusableUpdateBulkResult.loading === false &&
      postReusableUpdateBulkResult.result !== null
    ) {
      toast.success(postReusableUpdateBulkResult.result);
    }
  }, [postReusableUpdateBulkResult]);

  const submitHandler = e => {
    e.preventDefault();
    if (bulkValidationError) return;
    const tempPostReusableUpdateData = Object.values(updatedRecordsList).filter(
      d => d.newAvailable !== '',
    ); // In case , user enters and removes data
    dispatch(postReusableUpdateBulk({ upadateReusables: tempPostReusableUpdateData, date }));
  };

  const sendUpdatedRecordHandler = (updatedRecord, validationRecord) => {
    updatedRecordsList[updatedRecord.reusable._id] = updatedRecord;
    validationsList[updatedRecord.reusable._id] = validationRecord;
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
      <Table borderless className="logReusableTable" responsive>
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
          {reusablesState.length === 0 ? (
            <tr align="center">
              <td colSpan={6}>
                {' '}
                <i>Please select a project that has valid reusable data! </i>
              </td>
            </tr>
          ) : (
            reusablesState?.map((reusable, idx) => (
              <UpdateReusable
                key={reusable._id + reusable.stockAvailable}
                cancel={cancel}
                idx={idx}
                bulk
                record={reusable}
                sendUpdatedRecord={sendUpdatedRecordHandler}
              />
            ))
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

export default UpdateReusablesBulkTable;
