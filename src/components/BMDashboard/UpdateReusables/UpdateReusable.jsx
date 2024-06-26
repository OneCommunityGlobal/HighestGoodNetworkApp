import './UpdateReusable.css';
import { Container } from 'reactstrap';
import * as moment from 'moment';
import { FormGroup, Input, Label, Form, Col, Button } from 'reactstrap';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { postReusableUpdate } from 'actions/bmdashboard/reusableActions';
import { toast } from 'react-toastify';
import { resetReusableUpdate } from 'actions/bmdashboard/reusableActions';
import { fetchAllReusables } from 'actions/bmdashboard/reusableActions';

function UpdateReusable({ record, bulk, sendUpdatedRecord, cancel, setModal }) {
  const dispatch = useDispatch();
  const postReusableUpdateResult = useSelector(state => state.bmReusables.updateReusables);

  useEffect(() => {
    if (postReusableUpdateResult.loading === false && postReusableUpdateResult.error === true) {
      toast.error(`${postReusableUpdateResult.result}`);
      setModal(false);
    } else if (
      postReusableUpdateResult.loading === false &&
      postReusableUpdateResult.result !== null
    ) {
      toast.success(`Updated ${record?.itemType?.name} successfully`);
      setModal(false);
    }
  }, [postReusableUpdateResult]);

  const { purchaseRecord, updateRecord: _, ...rest } = record;
  const recordInitialState = {
    date: moment(new Date()).format('YYYY-MM-DD'),
    quantityUsed: 0,
    quantityWasted: 0,
    QtyUsedLogUnit: 'unit',
    QtyWastedLogUnit: 'unit',
    reusable: rest,
    newAvailable: record.stockAvailable,
  };
  const validationsInitialState = {
    quantityUsed: '',
    quantityWasted: '',
    quantityTogether: '',
  };
  const [updateRecord, setUpdateRecord] = useState(recordInitialState);
  const [validations, setValidations] = useState(validationsInitialState);

  useEffect(() => {
    setUpdateRecord({ ...recordInitialState });
    setValidations({ ...validationsInitialState });
  }, [cancel]);

  const validate = (_qtyUsed, _qtyWasted, QtyUsedLogUnit, QtyWastedLogUnit) => {
    const qtyUsed = _qtyUsed === '' ? 0 : _qtyUsed;
    const qtyWasted = _qtyWasted === '' ? 0 : _qtyWasted;
    const available = record?.stockAvailable;
    let valUsed = +qtyUsed;
    let valWasted = +qtyWasted;
    if (QtyUsedLogUnit === 'percent') {
      valUsed = (+qtyUsed / 100) * available;
    }
    if (QtyWastedLogUnit === 'percent') {
      valWasted = (+qtyWasted / 100) * available;
    }

    valUsed = Number.parseFloat(valUsed.toFixed(4));
    valWasted = Number.parseFloat(valWasted.toFixed(4));
    if (valUsed > available) {
      validations.quantityUsed = 'Quantity Used exceeds the available stock';
    } else {
      validations.quantityUsed = '';
    }

    if (valWasted > available) {
      validations.quantityWasted = 'Quantity Wasted exceeds the available stock';
    } else {
      validations.quantityWasted = '';
    }

    if (valUsed + valWasted > available) {
      validations.quantityTogether = `Sum of Used and Wasted values exceeds available stock with a value of ${valUsed +
        valWasted}`;
    } else {
      validations.quantityTogether = '';
    }
    setValidations({ ...validations });
    let newAvailable = available - (valUsed + valWasted);

    if (newAvailable !== available) {
      newAvailable = Number.parseFloat(newAvailable.toFixed(4));
      updateRecord.newAvailable = newAvailable;
      setUpdateRecord({ ...updateRecord });
    } else {
      updateRecord.newAvailable = '';
      setUpdateRecord({ ...updateRecord });
    }
    if (bulk === true) sendUpdatedRecord(updateRecord, validations);
  };

  const submitHandler = e => {
    e.preventDefault();
    dispatch(postReusableUpdate(updateRecord));
    dispatch(resetReusableUpdate());
    dispatch(fetchAllReusables());
  };

  const changeRecordHandler = e => {
    const { value } = e.target;
    if (e.target.name === 'quantityWasted' || e.target.name === 'quantityUsed') {
      if (value.match(/\./g)) {
        const [, decimal] = value.split('.');
        if (decimal?.length > 2) {
          // value = Number(value).toFixed(2);
          return;
        }
      }
      if (Number(value) < 0) return;
    }

    updateRecord[e.target.name] = value;

    if (e.target.name === 'quantityUsed') {
      validate(
        e.target.value,
        updateRecord.quantityWasted,
        updateRecord.QtyUsedLogUnit,
        updateRecord.QtyWastedLogUnit,
      );
    } else if (e.target.name === 'quantityWasted') {
      validate(
        updateRecord.quantityUsed,
        e.target.value,
        updateRecord.QtyUsedLogUnit,
        updateRecord.QtyWastedLogUnit,
      );
    } // unit change
    else if (e.target.name === 'QtyUsedLogUnit') {
      validate(
        updateRecord.quantityUsed,
        updateRecord.quantityWasted,
        e.target.value,
        updateRecord.QtyWastedLogUnit,
      );
    } else if (e.target.name === 'QtyWastedLogUnit') {
      validate(
        updateRecord.quantityUsed,
        updateRecord.quantityWasted,
        updateRecord.QtyUsedLogUnit,
        e.target.value,
      );
    }
  };
  return bulk === true ? (
    <>
      <tr key={record._id}>
        <td> {record.project?.name} </td>
        <td> {record.itemType?.name} </td>
        <td> {record.stockAvailable} </td>
        <td>
          <Input
            id="updateReusableQuantityUsed"
            name="quantityUsed"
            placeholder="Used"
            type="number"
            value={updateRecord.quantityUsed}
            onChange={e => changeRecordHandler(e)}
            min={0}
          />
          {validations.quantityUsed !== '' && (
            <div className="reusableFormTableError">{validations.quantityUsed}</div>
          )}
        </td>
        <td>
          <Input
            id="updateReusableQtyUsedLogUnitSelect"
            name="QtyUsedLogUnit"
            type="select"
            value={updateRecord.QtyUsedLogUnit}
            onChange={e => changeRecordHandler(e)}
          >
            <option value="unit">{record?.itemType?.unit}</option>
            <option value="percent">%</option>
          </Input>
        </td>
        <td>
          <Input
            id="updateReusablequantityWasted"
            name="quantityWasted"
            type="number"
            placeholder="Wasted"
            value={updateRecord.quantityWasted}
            onChange={e => changeRecordHandler(e)}
            min={0}
          />
          {validations.quantityWasted !== '' && (
            <div className="reusableFormTableError">{validations.quantityWasted}</div>
          )}
        </td>
        <td>
          <Input
            id="updateReusableQtyWastedLogUnitSelect"
            name="QtyWastedLogUnit"
            type="select"
            value={updateRecord.QtyWastedLogUnit}
            onChange={e => changeRecordHandler(e)}
          >
            <option value="unit">{record?.itemType?.unit}</option>
            <option value="percent">%</option>
          </Input>
        </td>
        <td>
          <span className={updateRecord.newAvailable < 0 ? 'reusableFormErrorClr' : undefined}>
            {updateRecord.newAvailable}
          </span>
        </td>
      </tr>
      <tr>
        <td colSpan={7} className="reusableFormTableError">
          {validations.quantityTogether}
        </td>
      </tr>
    </>
  ) : (
    <Container fluid className="updateReusableContainer">
      <div className="updateReusablePage">
        <div className="updateReusable">
          <Form>
            {/* <img className='reusableImage' alt='reusableImage' src={riversand} /> */}
            <FormGroup row className="align-items-center justify-content-start">
              <Label for="updateReusableName" sm={4} className="reusableFormLabel">
                Reusable
              </Label>
              <Col sm={6} className="reusableFormValue">
                <b>{record?.itemType?.name}</b>
              </Col>
            </FormGroup>

            <FormGroup row className="align-items-center">
              <Label for="updateReusableProject" sm={4} className="reusableFormLabel">
                Project Name
              </Label>
              <Col sm={8} className="reusableFormValue">
                {record?.project.name}
              </Col>
            </FormGroup>

            <FormGroup row className="align-items-center justify-content-start">
              <Label for="updateReusableDate" sm={4} className="reusableFormLabel">
                Date
              </Label>
              <Col sm={6} className="reusableFormValue">
                <Input
                  id="updateReusableDate"
                  name="date"
                  type="date"
                  value={updateRecord.date}
                  disabled
                />
              </Col>
            </FormGroup>

            <FormGroup row className="align-items-center justify-content-start">
              <Label for="updateReusableUnit" sm={4} className="reusableFormLabel">
                Available
              </Label>
              <Col sm={6} className="reusableFormValue">
                {record?.stockAvailable}
              </Col>
            </FormGroup>

            {updateRecord.newAvailable !== undefined && (
              <FormGroup row className="align-items-center justify-content-start">
                <Label for="updateReusableUnit" sm={4} className="reusableFormLabel">
                  New Available
                </Label>
                <Col sm={6} className="reusableFormValue">
                  <span
                    className={updateRecord.newAvailable < 0 ? 'reusableFormErrorClr' : undefined}
                  >
                    {updateRecord.newAvailable}
                  </span>
                </Col>
              </FormGroup>
            )}

            <FormGroup row>
              <Label for="updateReusableQuantityUsed" sm={4} className="reusableFormLabel">
                Quantity Used
              </Label>
              <Col sm={4} className="reusableFormValue">
                <Input
                  id="updateReusableQuantityUsed"
                  name="quantityUsed"
                  placeholder="Used"
                  type="number"
                  value={updateRecord.quantityUsed}
                  onChange={e => changeRecordHandler(e)}
                  min={0}
                />
              </Col>
              <Col sm={{ size: 4 }} className="reusableFormValue">
                <Input
                  id="updateReusableQtyUsedLogUnitSelect"
                  name="QtyUsedLogUnit"
                  type="select"
                  value={updateRecord.QtyUsedLogUnit}
                  onChange={e => changeRecordHandler(e)}
                >
                  <option value="unit">{record?.itemType?.unit}</option>
                  <option value="percent">%</option>
                </Input>
              </Col>

              {validations.quantityUsed !== '' && (
                <Label for="updateReusableQuantityUsedError" sm={12} className="reusableFormError">
                  {validations.quantityUsed}
                </Label>
              )}
            </FormGroup>
            <FormGroup row>
              <Label for="updateReusablequantityWasted" sm={4} className="reusableFormLabel">
                Quantity Wasted
              </Label>
              <Col sm={4} className="reusableFormValue">
                <Input
                  id="updateReusablequantityWasted"
                  name="quantityWasted"
                  type="number"
                  placeholder="Wasted"
                  value={updateRecord.quantityWasted}
                  onChange={e => changeRecordHandler(e)}
                  min={0}
                />
              </Col>
              <Col sm={{ size: 4 }} className="reusableFormValue">
                <Input
                  id="updateReusableQtyWastedLogUnitSelect"
                  name="QtyWastedLogUnit"
                  type="select"
                  value={updateRecord.QtyWastedLogUnit}
                  onChange={e => changeRecordHandler(e)}
                >
                  <option value="unit">{record?.itemType?.unit}</option>
                  <option value="percent">%</option>
                </Input>
              </Col>
              {validations.quantityWasted !== '' && (
                <Label
                  for="updateReusableQuantityWastedError"
                  sm={12}
                  className="reusableFormError"
                >
                  {validations.quantityWasted}
                </Label>
              )}
            </FormGroup>

            {validations.quantityTogether !== '' && (
              <FormGroup row>
                <Label
                  for="updateReusableQuantityTogetherError"
                  sm={12}
                  className="reusableFormError"
                >
                  {validations.quantityTogether}
                </Label>
              </FormGroup>
            )}

            <FormGroup row className="d-flex justify-content-right">
              <Button
                disabled={postReusableUpdateResult.loading || updateRecord.newAvailable < 0}
                className="reusableButtonBg"
                onClick={e => submitHandler(e)}
              >
                Update Reusable
              </Button>
            </FormGroup>
          </Form>
        </div>
      </div>
    </Container>
  );
}

export default UpdateReusable;
