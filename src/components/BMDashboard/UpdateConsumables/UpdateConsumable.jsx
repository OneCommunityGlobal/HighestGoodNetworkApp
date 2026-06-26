import moment from 'moment';
import PropTypes from 'prop-types';
import { Container, FormGroup, Input, Label, Form, Col, Button, Spinner } from 'reactstrap';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { postConsumableUpdate } from '../../../actions/bmdashboard/consumableActions';
import styles from './UpdateConsumable.module.css';

const getInitialRecord = rest => ({
  date: moment(new Date()).format('YYYY-MM-DD'),
  quantityUsed: '0',
  quantityWasted: '0',
  qtyUsedLogUnit: 'unit',
  qtyWastedLogUnit: 'unit',
  consumable: rest,
  newAvailable: undefined,
});

const getInitialValidations = () => ({
  quantityUsed: '',
  quantityWasted: '',
  quantityTogether: '',
});

const toUnits = (qty, logUnit, stockAvailable) => {
  const value = qty === '' ? 0 : Number.parseFloat(qty);
  return logUnit === 'percent' && stockAvailable > 0 ? (value * stockAvailable) / 100 : value;
};

const computeValidations = (unitsUsed, unitsWasted, stockAvailable) => {
  const result = { quantityUsed: '', quantityWasted: '', quantityTogether: '' };
  if (unitsUsed > stockAvailable) result.quantityUsed = 'Quantity Used exceeds the available stock';
  if (unitsWasted > stockAvailable)
    result.quantityWasted = 'Quantity Wasted exceeds the available stock';
  if (unitsUsed + unitsWasted > stockAvailable) {
    result.quantityTogether = `Sum of Used and Wasted values exceeds available stock with a value of ${unitsUsed +
      unitsWasted}`;
  }
  return result;
};

function UpdateConsumable({ record, setModal }) {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);
  const postConsumableUpdateResult = useSelector(state => state.bmConsumables.updateConsumables);
  const { stockAvailable, ...rest } = record;

  const [updateRecord, setUpdateRecord] = useState(getInitialRecord(rest));
  const [validations, setValidations] = useState(getInitialValidations());
  const [availableCount, setAvailableCount] = useState(undefined);
  const [changeOccured, setChangeOccured] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setUpdateRecord(getInitialRecord(rest));
    setValidations(getInitialValidations());
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
    const qtyUsedFloat = Number.parseFloat(updateRecord.quantityUsed);
    const qtyWastedFloat = Number.parseFloat(updateRecord.quantityWasted);
    setChangeOccured(!!(qtyUsedFloat || qtyWastedFloat));

    const unitsUsed = toUnits(
      updateRecord.quantityUsed,
      updateRecord.qtyUsedLogUnit,
      stockAvailable,
    );
    const unitsWasted = toUnits(
      updateRecord.quantityWasted,
      updateRecord.qtyWastedLogUnit,
      stockAvailable,
    );

    setValidations(computeValidations(unitsUsed, unitsWasted, stockAvailable));

    const newAvailable = Number.parseFloat((stockAvailable - (unitsUsed + unitsWasted)).toFixed(4));
    setAvailableCount(newAvailable === stockAvailable ? undefined : newAvailable);
  }, [updateRecord]);

  const isValid = () =>
    validations.quantityUsed === '' &&
    validations.quantityWasted === '' &&
    validations.quantityTogether === '' &&
    changeOccured;

  const submitHandler = () => {
    if (isSubmitting) return;
    if (isValid()) {
      setIsSubmitting(true);
      dispatch(
        postConsumableUpdate({
          date: updateRecord.date,
          quantityUsed:
            updateRecord.quantityUsed === '' ? 0 : Number.parseFloat(updateRecord.quantityUsed),
          qtyUsedLogUnit: updateRecord.qtyUsedLogUnit,
          quantityWasted:
            updateRecord.quantityWasted === '' ? 0 : Number.parseFloat(updateRecord.quantityWasted),
          qtyWastedLogUnit: updateRecord.qtyWastedLogUnit,
          stockAvailable,
          consumable: updateRecord.consumable,
        }),
      );
    } else {
      toast.error('Invalid Data');
    }
  };

  const changeRecordHandler = e => {
    const { value, name } = e.target;
    if (Number(value) < 0) return;
    setUpdateRecord(prev => ({ ...prev, [name]: value }));
  };

  const labelClass = `${styles.consumableFormLabel} ${
    darkMode ? styles.consumableFormLabelDark : ''
  }`;
  const valueClass = `${styles.consumableFormValue} ${
    darkMode ? styles.consumableFormValueDark : ''
  }`;
  const inputClass = darkMode ? 'bg-space-cadet text-light' : '';
  const inputStyle = darkMode ? { borderColor: '#3a506b' } : {};

  return (
    <Container fluid className={styles.updateConsumableContainer}>
      <div
        className={`${styles.updateConsumablePage} ${
          darkMode ? styles.updateConsumablePageDark : ''
        }`}
      >
        <div
          className={`${styles.updateConsumable} ${darkMode ? styles.updateConsumableDark : ''}`}
        >
          <Form>
            <FormGroup row className="align-items-center justify-content-start">
              <Label for="updateConsumableName" sm={4} className={labelClass}>
                Consumable
              </Label>
              <Col sm={6} className={valueClass}>
                <b>{record?.itemType?.name}</b>
              </Col>
            </FormGroup>

            <FormGroup row className="align-items-center">
              <Label for="updateConsumableProject" sm={4} className={labelClass}>
                Project Name
              </Label>
              <Col sm={8} className={valueClass}>
                {record?.project.name}
              </Col>
            </FormGroup>

            <FormGroup row className="align-items-center justify-content-start">
              <Label for="updateConsumableDate" sm={4} className={labelClass}>
                Date
              </Label>
              <Col sm={6} className={valueClass}>
                <Input
                  id="updateConsumableDate"
                  name="date"
                  type="date"
                  value={updateRecord.date}
                  disabled
                  className={inputClass}
                />
              </Col>
            </FormGroup>

            <FormGroup row className="align-items-center justify-content-start">
              <Label for="updateConsumableUnit" sm={4} className={labelClass}>
                Available
              </Label>
              <Col sm={6} className={valueClass}>
                {record?.stockAvailable}
              </Col>
            </FormGroup>

            {availableCount !== undefined && (
              <FormGroup row className="align-items-center justify-content-start">
                <Label for="updateMaterialUnit" sm={4} className={labelClass}>
                  New Available
                </Label>
                <Col sm={6} className={valueClass}>
                  <span className={availableCount < 0 ? styles.consumableFormErrorClr : undefined}>
                    {availableCount}
                  </span>
                </Col>
              </FormGroup>
            )}

            <FormGroup row>
              <Label for="updateConsumableQuantityUsed" sm={4} className={labelClass}>
                Quantity Used
              </Label>
              <Col sm={4} className={valueClass}>
                <Input
                  id="updateConsumableQuantityUsed"
                  name="quantityUsed"
                  placeholder="Used"
                  type="number"
                  value={updateRecord.quantityUsed}
                  onChange={changeRecordHandler}
                  min={0}
                  className={inputClass}
                  style={inputStyle}
                  onKeyDown={e => {
                    if (e.key === '+' || e.key === '-') e.preventDefault();
                  }}
                  onInput={e => {
                    e.target.value = e.target.value.replace(/[^\d.]/g, '');
                  }}
                />
              </Col>
              <Col sm={{ size: 4 }} className={valueClass}>
                <Input
                  id="updateConsumableQtyUsedLogUnitSelect"
                  name="qtyUsedLogUnit"
                  type="select"
                  value={updateRecord.qtyUsedLogUnit}
                  onChange={changeRecordHandler}
                  className={inputClass}
                  style={inputStyle}
                >
                  <option value="unit">{record?.itemType?.unit}</option>
                  <option value="percent">%</option>
                </Input>
              </Col>
              {validations.quantityUsed !== '' && (
                <Label
                  for="updateMaterialQuantityUsedError"
                  sm={12}
                  className={styles.consumableFormError}
                >
                  {validations.quantityUsed}
                </Label>
              )}
            </FormGroup>

            <FormGroup row>
              <Label for="updateConsumablequantityWasted" sm={4} className={labelClass}>
                Quantity Wasted
              </Label>
              <Col sm={4} className={valueClass}>
                <Input
                  id="updateConsumablequantityWasted"
                  name="quantityWasted"
                  type="number"
                  placeholder="Wasted"
                  value={updateRecord.quantityWasted}
                  onChange={changeRecordHandler}
                  min={0}
                  className={inputClass}
                  style={inputStyle}
                  onKeyDown={e => {
                    if (e.key === '+' || e.key === '-') e.preventDefault();
                  }}
                  onInput={e => {
                    e.target.value = e.target.value.replace(/[^\d.]/g, '');
                  }}
                />
              </Col>
              <Col sm={{ size: 4 }} className={valueClass}>
                <Input
                  id="updateConsumableQtyWastedLogUnitSelect"
                  name="qtyWastedLogUnit"
                  type="select"
                  value={updateRecord.qtyWastedLogUnit}
                  onChange={changeRecordHandler}
                  className={inputClass}
                  style={inputStyle}
                >
                  <option value="unit">{record?.itemType?.unit}</option>
                  <option value="percent">%</option>
                </Input>
              </Col>
              {validations.quantityWasted !== '' && (
                <Label
                  for="updateConsumableQuantityWastedError"
                  sm={12}
                  className={styles.consumableFormError}
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
                    className={styles.consumableFormError}
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
                  !changeOccured
                }
                className={`${styles.consumableButtonBg} ${
                  darkMode ? styles.consumableButtonBgDark : ''
                }`}
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

UpdateConsumable.propTypes = {
  record: PropTypes.shape({
    itemType: PropTypes.shape({
      name: PropTypes.string,
      unit: PropTypes.string,
    }),
    project: PropTypes.shape({
      name: PropTypes.string,
    }),
    stockAvailable: PropTypes.number,
  }).isRequired,
  setModal: PropTypes.func.isRequired,
};

export default UpdateConsumable;
