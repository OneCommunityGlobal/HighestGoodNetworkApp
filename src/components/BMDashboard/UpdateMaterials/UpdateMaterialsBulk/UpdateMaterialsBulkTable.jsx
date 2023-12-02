import { useState } from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Table } from 'reactstrap';
import { toast } from 'react-toastify';
import { fetchAllMaterials, postMaterialUpdateBulk } from 'actions/bmdashboard/materialsActions';
import UpdateMaterial from '../UpdateMaterial';

function UpdateMaterialsBulkTable({ date, project, setProject }) {
  const dispatch = useDispatch();
  const materials = useSelector(state => state.materials.materialslist);
  const [materialsState, setMaterialsState] = useState([...materials]);
  const postMaterialUpdateBulkResult = useSelector(state => state.materials.updateMaterialsBulk);
  const [cancel, setCancel] = useState(1);
  const [updatedRecordsList] = useState({});
  const [validationsList] = useState({});
  const [bulkValidationError, setbulkValidationError] = useState(false);

  useEffect(() => {
    setMaterialsState([...materials]);
    setProject({ label: 'All Projects', value: '0' });
  }, [materials]);

  const cancelHandler = () => {
    setCancel(prev => (prev === 1 ? 2 : 1));
  };

  //call fetch on load and update(after result)
  useEffect(() => {
    dispatch(fetchAllMaterials());
  }, [postMaterialUpdateBulkResult.result]);

  useEffect(() => {
    if (project.value !== '0') {
      const _materials = materials.filter(mat => mat.project.name === project.label);
      setMaterialsState(_materials);
    } else {
      setMaterialsState([...materials]);
    }
  }, [project]);

  useEffect(() => {
    // Reset must be called if the result is being displayed due to caching of redux store
    if (
      postMaterialUpdateBulkResult.loading === false &&
      postMaterialUpdateBulkResult.error === true
    ) {
      toast.error(`${postMaterialUpdateBulkResult.result}`);
    } else if (
      postMaterialUpdateBulkResult.loading === false &&
      postMaterialUpdateBulkResult.result !== null
    ) {
      toast.success(postMaterialUpdateBulkResult.result);
    }
  }, [postMaterialUpdateBulkResult]);

  const submitHandler = e => {
    e.preventDefault();
    if (bulkValidationError) return;
    const tempPostMaterialUpdateData = Object.values(updatedRecordsList).filter(
      d => d.newAvailable !== '',
    ); // In case , user enters and removes data
    dispatch(postMaterialUpdateBulk({ upadateMaterials: tempPostMaterialUpdateData, date }));
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
          {materialsState.length === 0 ? (
            <tr align="center">
              <td colSpan={6}>
                {' '}
                <i>Please select a project that has valid material data! </i>
              </td>
            </tr>
          ) : (
            materialsState?.map((material, idx) => (
              <UpdateMaterial
                key={material._id + material.stockAvailable}
                cancel={cancel}
                idx={idx}
                bulk
                record={material}
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

export default UpdateMaterialsBulkTable;
