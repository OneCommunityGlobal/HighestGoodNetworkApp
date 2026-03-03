import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { fetchInvUnits } from '../../../actions/bmdashboard/invUnitActions';
import {
  updateNameAndUnit,
  fetchMaterialTypes,
  fetchConsumableTypes,
} from '../../../actions/bmdashboard/invTypeActions';
import { fetchAllMaterials } from '~/actions/bmdashboard/materialsActions';
import { fetchAllConsumables } from '~/actions/bmdashboard/consumableActions';

import { POST_UPDATE_NAME_AND_UNIT_RESET } from '../../../constants/bmdashboard/inventoryTypeConstants';
import styles from './ItemListView.module.css';

const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 15;

const ITEM_TYPE_MAP = {
  consumable_item: 'Consumable',
  material_item: 'Material',
};

function EditNameUnitModal({ item, isOpen, toggle }) {
  const dispatch = useDispatch();

  const units = useSelector(state => state.bmInvUnits?.list || []);
  const updateResult = useSelector(state => state.bmInvTypes?.postedUpdateResult);

  const itemTypeObj = item?.itemType ?? null;

  const itemType = useMemo(() => ITEM_TYPE_MAP[item?.__t] || null, [item?.__t]);

  const [itemName, setItemName] = useState('');
  const [measurement, setMeasurement] = useState('');
  const [errors, setErrors] = useState({});

  const hasInvalidItem = !itemTypeObj || !itemType;

  // Fetch units once
  useEffect(() => {
    dispatch(fetchInvUnits());
  }, [dispatch]);

  // Initialize form values when modal opens
  useEffect(() => {
    if (isOpen && itemTypeObj) {
      setItemName(itemTypeObj.name ?? '');
      setMeasurement(itemTypeObj.unit ?? '');
      setErrors({});
    }
  }, [isOpen, itemTypeObj]);

  // Handle update result
  useEffect(() => {
    if (!updateResult) return;

    if (updateResult.error) {
      toast.error(updateResult.message || 'Update failed');
    }

    if (updateResult.success && itemType) {
      toast.success('Edited successfully');

      if (itemType === 'Material') {
        dispatch(fetchMaterialTypes());
        dispatch(fetchAllMaterials());
      } else if (itemType === 'Consumable') {
        dispatch(fetchConsumableTypes());
        dispatch(fetchAllConsumables());
      }

      toggle(); // close modal ONLY after success
    }

    if (updateResult.success || updateResult.error) {
      dispatch({ type: POST_UPDATE_NAME_AND_UNIT_RESET });
    }
  }, [updateResult, itemType, dispatch, toggle]);

  const validateForm = useCallback(() => {
    const newErrors = {};

    const trimmedName = itemName.trim();

    if (!trimmedName) {
      newErrors.itemName = 'Name is required';
    } else if (trimmedName.length < MIN_NAME_LENGTH) {
      newErrors.itemName = `Name must be at least ${MIN_NAME_LENGTH} characters`;
    } else if (trimmedName.length > MAX_NAME_LENGTH) {
      newErrors.itemName = `Name must be at most ${MAX_NAME_LENGTH} characters`;
    }

    if (!measurement) {
      newErrors.measurement = 'Measurement is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [itemName, measurement]);

  const handleSave = () => {
    if (!validateForm()) return;

    if (!itemTypeObj || !itemType) return;

    const hasChanges = itemName !== itemTypeObj.name || measurement !== itemTypeObj.unit;

    if (!hasChanges) return;

    dispatch(
      updateNameAndUnit(itemTypeObj._id, {
        type: itemType,
        name: itemName.trim(),
        unit: measurement,
      }),
    );
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Edit {itemType || ''}</ModalHeader>

      <ModalBody>
        {hasInvalidItem ? (
          `Please select a valid item for editing`
        ) : (
          <Form>
            <FormGroup>
              <Label for="itemName">
                Name
                <span className={styles.fieldRequired}>*</span>
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
                Measurement
                <span className={styles.fieldRequired}>*</span>
              </Label>
              <Input
                id="measurement"
                type="select"
                value={measurement}
                invalid={!!errors.measurement}
                onChange={e => setMeasurement(e.target.value)}
              >
                <option value="">Select a Unit</option>
                {units.map(unit => (
                  <option key={unit._id} value={unit.unit}>
                    {unit.unit}
                  </option>
                ))}
              </Input>
              {errors.measurement && <div className="text-danger">{errors.measurement}</div>}
            </FormGroup>

            <Button color="primary" onClick={handleSave}>
              Save
            </Button>
          </Form>
        )}
      </ModalBody>

      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default EditNameUnitModal;
