import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Form,
  FormGroup,
  Label,
} from 'reactstrap';
import { fetchInvUnits } from '../../../actions/bmdashboard/invUnitActions';
import { updateNameAndUnit, fetchMaterialTypes } from '../../../actions/bmdashboard/invTypeActions';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { POST_UPDATE_NAME_AND_UNIT_RESET } from '../../../constants/bmdashboard/inventoryTypeConstants';
import styles from './ItemListView.module.css';
import { fetchAllMaterials } from '~/actions/bmdashboard/materialsActions';

function EditNameUnitModal({ item, isOpen, toggle }) {
  const [itemName, setItemName] = useState('');
  const [measurement, setMeasurement] = useState('');
  const dispatch = useDispatch();
  const units = useSelector(state => state.bmInvUnits.list);
  const error = !item || item?.itemType === null;
  const [errors, setErrors] = useState({});
  const updateNameAndUnitResult = useSelector(state => state.bmInvTypes.postedUpdateResult);

  useEffect(() => {
    dispatch(fetchInvUnits());
  }, [dispatch]);

  useEffect(() => {
    if (item || isOpen) {
      setItemName(item?.itemType?.name || '');
      setMeasurement(item?.itemType?.unit || '');
    }
  }, [item, isOpen]);

  useEffect(() => {
    if (updateNameAndUnitResult?.error) {
      toast.error(updateNameAndUnitResult.message || 'Update failed');
      dispatch({ type: POST_UPDATE_NAME_AND_UNIT_RESET });
    }

    if (updateNameAndUnitResult?.success) {
      toast.success('Edited successfully');
      dispatch(fetchMaterialTypes());
      dispatch(fetchAllMaterials());
      dispatch({ type: POST_UPDATE_NAME_AND_UNIT_RESET });
    }
  }, [updateNameAndUnitResult?.success, updateNameAndUnitResult?.error, dispatch]);

  const validateForm = () => {
    const newErrors = {};

    if (!itemName.trim()) {
      newErrors.itemName = 'Name is required';
    } else if (itemName.length < 3) {
      newErrors.itemName = 'Name should contain minimum of 3 letters';
    } else if (itemName.length > 15) {
      newErrors.itemName = 'Name should contain maximum of 15 letters';
    }
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    if (itemName != item?.itemType?.name || measurement != item?.itemType?.unit) {
      dispatch(
        updateNameAndUnit(item?.itemType?._id, {
          name: itemName,
          unit: measurement,
        }),
      );
      toggle();
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} toggle={toggle}>
        <ModalHeader toggle={toggle}>Edit Material</ModalHeader>
        <ModalBody>
          {error && 'Please select a named material for editing'}
          {!error && (
            <Form>
              <FormGroup>
                <Label for="materialName">
                  Name<span className={`${styles.fieldRequired}`}>*</span>
                </Label>
                <Input
                  id="itemName"
                  type="text"
                  value={itemName}
                  invalid={!!errors.itemName}
                  onChange={e => setItemName(e.target.value)}
                />
                {errors.itemName && <div className="text-danger">{errors.itemName}</div>}
              </FormGroup>
              <FormGroup>
                <Label for="measurement">
                  Measurement <span className={`${styles.fieldRequired}`}>*</span>
                </Label>
                <Input
                  id="unit-select"
                  type="select"
                  value={measurement}
                  onChange={e => setMeasurement(e.target.value)}
                >
                  <option value="">Select a Unit</option>
                  {units.map((unit, index) => (
                    <option key={index} value={unit.unit}>
                      {unit.unit}
                    </option>
                  ))}
                </Input>
                {errors.measurement && <div className="text-danger">{errors.measurement}</div>}
              </FormGroup>

              <Button onClick={handleSave}>Save</Button>
            </Form>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggle}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

export default EditNameUnitModal;
