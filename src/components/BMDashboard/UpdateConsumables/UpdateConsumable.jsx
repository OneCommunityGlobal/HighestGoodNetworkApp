import moment from 'moment';
import { Container, FormGroup, Input, Label, Form, Col, Button, Spinner } from 'reactstrap';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { postConsumableUpdate } from '../../../actions/bmdashboard/consumableActions';
import styles from './UpdateConsumable.module.css';

function UpdateConsumable({ record, setModal }) {
  const dispatch = useDispatch();
  const postConsumableUpdateResult = useSelector(state => state.bmConsumables.updateConsumables);
  const { purchaseRecord, stockAvailable, updateRecord: _, ...rest } = record;
  const recordInitialState = {
    date: moment(new Date()).format('YYYY-MM-DD'),
    quantityUsed: '0',
    quantityWasted: '0',
    qtyUsedLogUnit: 'unit',
    qtyWastedLogUnit: 'unit',
    consumable: rest,
    newAvailable: undefined,
  };
  const validationsInitialState = {
    quantityUsed: '',
    quantityWasted: '',
    quantityTogether: '',
  };
  const [updateRecord, setUpdateRecord] = useState(recordInitialState);
  const [validations, setValidations] = useState(validationsInitialState);
  const [availableCount, setAvailableCount] = useState(undefined);
  const [changeOccured, setChangeOccured] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setUpdateRecord({ ...recordInitialState });
    setValidations({ ...validationsInitialState });
  }, []);

  useEffect(() => {
    if (postConsumableUpdateResult.loading === false && postConsumableUpdateResult.error === true) {
      toast.error(`${postConsumableUpdateResult.result}`);
      setIsSubmitting(false);
      setModal(false);
    } else if (
      postConsumableUpdateResult.loading === false &&
      postConsumableUpdateResult.result !== null &&
      isSubmitting
    ) {
      toast.success(`Updated ${record?.itemType?.name} successfully`);
      setIsSubmitting(false);
      setModal(false);
    }
  }, [postConsumableUpdateResult, isSubmitting]);

  useEffect(() => {
    const qtyUsedFloat = parseFloat(updateRecord.quantityUsed);
    const qtyWastedFloat = parseFloat(updateRecord.quantityWasted);

    if (qtyUsedFloat || qtyWastedFloat) {
      setChangeOccured(true);
    } else {
      setChangeOccured(false);
    }

    // eslint-disable-next-line no-use-before-define
    validate(
      updateRecord.quantityUsed,
      updateRecord.quantityWasted,
      updateRecord.qtyUsedLogUnit,
      updateRecord.qtyWastedLogUnit,
    );
  }, [updateRecord]);

  const validate = (_qtyUsed, _qtyWasted, qtyUsedLogUnit, qtyWastedLogUnit) => {
    let unitsUsed = _qtyUsed === '' ? 0 : parseFloat(_qtyUsed);
    let unitsWasted = _qtyWasted === '' ? 0 : parseFloat(_qtyWasted);

    if (qtyUsedLogUnit === 'percent' && stockAvailable > 0) {
      unitsUsed *= stockAvailable / 100;
    }

    if (qtyWastedLogUnit === 'percent' && stockAvailable > 0) {
      unitsWasted *= stockAvailable / 100;
    }

    const tempValidations = { ...validations };

    if (unitsUsed > stockAvailable) {
      tempValidations.quantityUsed = 'Quantity Used exceeds the available stock';
    } else {
      tempValidations.quantityUsed = '';
    }

    if (unitsWasted > stockAvailable) {
      tempValidations.quantityWasted = 'Quantity Wasted exceeds the available stock';
    } else {
      tempValidations.quantityWasted = '';
    }

    if (unitsUsed + unitsWasted > stockAvailable) {
      tempValidations.quantityTogether = `Sum of Used and Wasted values exceeds available stock with a value of ${unitsUsed +
        unitsWasted}`;
    } else {
      tempValidations.quantityTogether = '';
    }

    setValidations({ ...tempValidations });
    const newAvailable = parseFloat((stockAvailable - (unitsUsed + unitsWasted)).toFixed(4));
    if (newAvailable !== stockAvailable) {
      setAvailableCount(newAvailable);
    } else {
      setAvailableCount(undefined);
    }
  };

  const submitHandler = () => {
    if (isSubmitting) return; // Prevent double-click

    if (
      validations.quantityUsed === '' &&
      validations.quantityWasted === '' &&
      validations.quantityTogether === '' &&
      changeOccured
    ) {
      setIsSubmitting(true);
      const postObject = {
        date: updateRecord.date,
        quantityUsed: updateRecord.quantityUsed === '' ? 0 : parseFloat(updateRecord.quantityUsed),
        qtyUsedLogUnit: updateRecord.qtyUsedLogUnit,
        quantityWasted:
          updateRecord.quantityWasted === '' ? 0 : parseFloat(updateRecord.quantityWasted),
        qtyWastedLogUnit: updateRecord.qtyWastedLogUnit,
        stockAvailable,
        consumable: updateRecord.consumable,
      };
      dispatch(postConsumableUpdate(postObject));
    } else {
      toast.error('Invalid Data');
    }
  };

  const changeRecordHandler = e => {
    const { value, name } = e.target;
    if (Number(value) < 0) return;
    const tempRecord = { ...updateRecord };
    tempRecord[name] = value;

    setUpdateRecord(tempRecord);
  };

  return (
    <Container fluid className={`${styles.updateConsumableContainer}`}>
      <div className={`${styles.updateConsumablePage}`}>
        <div className={`${styles.updateConsumable}`}>
          <Form>
            <FormGroup row className="align-items-center justify-content-start">
              <Label for="updateConsumableName" sm={4} className={`${styles.consumableFormLabel}`}>
                Consumable
              </Label>
              <Col sm={6} className={`${styles.consumableFormValue}`}>
                <b>{record?.itemType?.name}</b>
              </Col>
            </FormGroup>

            <FormGroup row className="align-items-center">
              <Label
                for="updateConsumableProject"
                sm={4}
                className={`${styles.consumableFormLabel}`}
              >
                Project Name
              </Label>
              <Col sm={8} className={`${styles.consumableFormValue}`}>
                {record?.project.name}
              </Col>
            </FormGroup>
            <FormGroup row className="align-items-center justify-content-start">
              <Label for="updateConsumableDate" sm={4} className={`${styles.consumableFormLabel}`}>
                Date
              </Label>
              <Col sm={6} className={`${styles.consumableFormValue}`}>
                <Input
                  id="updateConsumableDate"
                  name="date"
                  type="date"
                  value={updateRecord.date}
                  disabled
                />
              </Col>
            </FormGroup>

            <FormGroup row className="align-items-center justify-content-start">
              <Label for="updateConsumableUnit" sm={4} className={`${styles.consumableFormLabel}`}>
                Available
              </Label>
              <Col sm={6} className={`${styles.consumableFormValue}`}>
                {record?.stockAvailable}
              </Col>
            </FormGroup>

            {availableCount !== undefined && (
              <FormGroup row className="align-items-center justify-content-start">
                <Label for="updateMaterialUnit" sm={4} className={`${styles.consumableFormLabel}`}>
                  New Available
                </Label>
                <Col sm={6} className={`${styles.consumableFormValue}`}>
                  <span className={availableCount < 0 ? 'consumableFormErrorClr' : undefined}>
                    {availableCount}
                  </span>
                </Col>
              </FormGroup>
            )}
            <FormGroup row>
              <Label
                for="updateConsumableQuantityUsed"
                sm={4}
                className={`${styles.consumableFormLabel}`}
              >
                Quantity Used
              </Label>
              <Col sm={4} className={`${styles.consumableFormValue}`}>
                <Input
                  id="updateConsumableQuantityUsed"
                  name="quantityUsed"
                  placeholder="Used"
                  type="number"
                  value={updateRecord.quantityUsed}
                  onChange={e => changeRecordHandler(e)}
                  min={0}
                />
              </Col>
              <Col sm={{ size: 4 }} className={`${styles.consumableFormValue}`}>
                <Input
                  id="updateConsumableQtyUsedLogUnitSelect"
                  name="qtyUsedLogUnit"
                  type="select"
                  value={updateRecord.qtyUsedLogUnit}
                  onChange={e => changeRecordHandler(e)}
                >
                  <option value="unit">{record?.itemType?.unit}</option>
                  <option value="percent">%</option>
                </Input>
              </Col>

              {validations.quantityUsed !== '' && (
                <Label
                  for="updateMaterialQuantityUsedError"
                  sm={12}
                  className={`${styles.consumableFormError}`}
                >
                  {validations.quantityUsed}
                </Label>
              )}
            </FormGroup>

            <FormGroup row>
              <Label
                for="updateConsumablequantityWasted"
                sm={4}
                className={`${styles.consumableFormLabel}`}
              >
                Quantity Wasted
              </Label>
              <Col sm={4} className={`${styles.consumableFormValue}`}>
                <Input
                  id="updateConsumablequantityWasted"
                  name="quantityWasted"
                  type="number"
                  placeholder="Wasted"
                  value={updateRecord.quantityWasted}
                  onChange={e => changeRecordHandler(e)}
                  min={0}
                />
              </Col>
              <Col sm={{ size: 4 }} className={`${styles.consumableFormValue}`}>
                <Input
                  id="updateConsumableQtyWastedLogUnitSelect"
                  name="qtyWastedLogUnit"
                  type="select"
                  value={updateRecord.qtyWastedLogUnit}
                  onChange={e => changeRecordHandler(e)}
                >
                  <option value="unit">{record?.itemType?.unit}</option>
                  <option value="percent">%</option>
                </Input>
              </Col>
              {validations.quantityWasted !== '' && (
                <Label
                  for="updateConsumableQuantityWastedError"
                  sm={12}
                  className={`${styles.consumableFormError}`}
                >
                  {validations.quantityWasted}
                </Label>
              )}
            </FormGroup>
            {validations.quantityTogether !== '' &&
              validations.quantityUsed === '' &&
              validations.quantityWasted === '' && (
                <FormGroup row>
                  <Label
                    for="updateConsumableQuantityTogetherError"
                    sm={12}
                    className={`${styles.consumableFormError}`}
                  >
                    {validations.quantityTogether}
                  </Label>
                </FormGroup>
              )}

            <FormGroup row className="d-flex justify-content-right">
              <Button
                disabled={
                  isSubmitting ||
                  postConsumableUpdateResult.loading ||
                  availableCount < 0 ||
                  changeOccured === false
                }
                className={`${styles.consumableButtonBg}`}
                onClick={submitHandler}
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" /> Updating...
                  </>
                ) : (
                  'Update Consumable'
                )}
              </Button>
            </FormGroup>
          </Form>
        </div>
      </div>
    </Container>
  );
}

export default UpdateConsumable;
