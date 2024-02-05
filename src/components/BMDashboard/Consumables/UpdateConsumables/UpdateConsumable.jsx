import './UpdateConsumable.css';
import { Container } from 'reactstrap';
import * as moment from 'moment';
import { FormGroup, Input, Label, Form, Col, Button } from 'reactstrap';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

function UpdateConsumable({ record, bulk, sendUpdatedRecord, cancel, setModal }) {
  const { purchaseRecord, updateRecord: _, ...rest } = record;
  const recordInitialState = {
    date: moment(new Date()).format('YYYY-MM-DD'),
    quantityUsed: 0,
    quantityWasted: 0,
    QtyUsedLogUnit: 'unit',
    QtyWastedLogUnit: 'unit',
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
      // if (Number(value) < 0) return;
      if (Number(value) < 0) {
        if (e.target.name === 'quantityWasted') {
          updateRecord.quantityWasted = ''
          return
        }
        else {
          updateRecord.quantityUsed = ''
          return
        }
      }
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
            id="updateMaterialQuantityUsed"
            name="quantityUsed"
            placeholder="Used"
            type="number"
            value={updateRecord.quantityUsed}
            onChange={e => changeRecordHandler(e)}
            min={0}
          />
          {validations.quantityUsed !== '' && (
            <div className="materialFormTableError">{validations.quantityUsed}</div>
          )}
        </td>
        <td>
          <Input
            id="updateMaterialQtyUsedLogUnitSelect"
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
            id="updateMaterialquantityWasted"
            name="quantityWasted"
            type="number"
            placeholder="Wasted"
            value={updateRecord.quantityWasted}
            onChange={e => changeRecordHandler(e)}
            min={0}
          />
          {validations.quantityWasted !== '' && (
            <div className="materialFormTableError">{validations.quantityWasted}</div>
          )}
        </td>
        <td>
          <Input
            id="updateMaterialQtyWastedLogUnitSelect"
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
          <span className={updateRecord.newAvailable < 0 ? 'materialFormErrorClr' : undefined}>
            {updateRecord.newAvailable}
          </span>
        </td>
      </tr>
      <tr>
        <td colSpan={7} className="materialFormTableError">
          {validations.quantityTogether}
        </td>
      </tr>
    </>
  ) : (
    //TODO update the following fragment for individual consumable update
    <></>
  );
}

export default UpdateConsumable;
