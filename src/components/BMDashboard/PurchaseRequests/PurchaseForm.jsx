import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Joi from 'joi';
import { Form, FormGroup, Label, Input, Button } from 'reactstrap';
import BMError from '../shared/BMError';
import { boxStyle } from 'styles';
import './PurchaseForm.css';

const PurchaseForm = ({
  fetchPrimaryDataAction,
  fetchSecondaryDataAction,
  submitFormAction,
  primaryDataSelector,
  secondaryDataSelector,
  errorSelector,
  formLabels,
}) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const primaryData = useSelector(primaryDataSelector);
  const secondaryData = useSelector(secondaryDataSelector);
  const errors = useSelector(errorSelector);
  const [primaryId, setPrimaryId] = useState('Test');
  const [secondaryId, setSecondaryId] = useState('Test');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [priority, setPriority] = useState('Low');
  const [brand, setBrand] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isError, setIsError] = useState(false);

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchPrimaryDataAction());
    dispatch(fetchSecondaryDataAction());
  }, [dispatch, fetchPrimaryDataAction, fetchSecondaryDataAction]);

  // Set error state based on errors from the store
  useEffect(() => {
    setIsError(Object.entries(errors).length !== 0);
  }, [errors]);

  // Automatically update unit state when secondaryId changes
  useEffect(() => {
    const selectedType = secondaryData.find(item => item._id === secondaryId);
    setUnit(selectedType ? selectedType.unit : '');
  }, [secondaryId, secondaryData]);

  // Form validation logic
  const validateForm = () => Joi.object({
    primaryId: Joi.string().required(),
    secondaryId: Joi.string().required(),
    quantity: Joi.number().min(1).max(999).integer().required(),
    priority: Joi.string().valid('Low', 'Medium', 'High').required(),
    brand: Joi.string().allow(''),
  }).validate({ primaryId, secondaryId, quantity, priority, brand });

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = validateForm();
    if (error) {
      setValidationError(error.details.map(detail => detail.message).join(", "));
      return;
    }
    setValidationError(''); // Clear previous errors

    const response = await submitFormAction({ primaryId, secondaryId, quantity, priority, brand });

    if (response?.status === 201) {
      toast.success('Success: Your request has been processed.');
      setPrimaryId('');
      setSecondaryId('');
      setQuantity('');
      setUnit('');
      setPriority('Low');
      setBrand('');
    } else {
      toast.error(`Error: ${response?.statusText || 'Unknown error'}`);
    }
  };

  // Handle cancel action
  const handleCancel = () => {
    history.goBack();
  };

  if (isError) {
    return <BMError errors={errors} />;
  }

  return (
    <main className="purchase-request-container">
      <header className="purchase-header">
        <h2>{formLabels.headerText}</h2>
        <p>{formLabels.headerSubText}</p>
      </header>
      <Form className="purchase-form" onSubmit={handleSubmit}>
        <FormGroup>
          <Label for="select-project">{formLabels.primarySelectLabel}</Label>
          <Input
            id="select-project"
            type="select"
            value={primaryId}
            onChange={({ currentTarget }) => { setPrimaryId(currentTarget.value) }}
            disabled={!primaryData.length}
          >
            <option value="">{formLabels.primarySelectDefaultOption}</option>
            {primaryData.map(item => (
              <option key={item._id} value={item._id}>{item.name}</option>
            ))}
          </Input>
        </FormGroup>

        <FormGroup>
          <Label for="select-material">{formLabels.secondarySelectLabel}</Label>
          <Input
            id="select-material"
            type="select"
            value={secondaryId}
            onChange={({ currentTarget }) => { setSecondaryId(currentTarget.value) }}
          >
            <option value="">{formLabels.secondarySelectDefaultOption}</option>
            {secondaryData.map(item => (
              <option key={item._id} value={item._id}>{item.name}</option>
            ))}
          </Input>
        </FormGroup>

        <div className="purchase-flex-group">
          <FormGroup className="purchase-qty-group">
            <Label for="input-quantity">{formLabels.quantityLabel}</Label>
            <div className="purchase-qty-container">
              <Input
                id="input-quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                placeholder={formLabels.quantityPlaceholder}
              />
              <span>{unit}</span>
            </div>
          </FormGroup>

          <FormGroup>
            <Label for="input-priority">{formLabels.priorityLabel}</Label>
            <Input
              id="input-priority"
              type="select"
              value={priority}
              onChange={e => setPriority(e.target.value)}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </Input>
          </FormGroup>
        </div>

        <FormGroup>
          <Label for="input-brand">{formLabels.brandLabel}</Label>
          <Input
            id="input-brand"
            type="text"
            value={brand}
            onChange={e => setBrand(e.target.value)}
            placeholder={formLabels.brandPlaceholder}
          />
        </FormGroup>

        {validationError && <div className="purchase-error-message"><p>{validationError}</p></div>}

        <div className="purchase-actions">
          <Button
            type="button"
            id="cancel-button"
            color="secondary"
            onClick={handleCancel}
            style={boxStyle}
          >
            Cancel
          </Button>
          <Button
            id="submit-button"
            type="sumbit"
            color="primary"
            style={boxStyle}
            disabled={!primaryId || !secondaryId || !quantity || !priority || !!validationError}
          >
            Submit
          </Button>
        </div>
      </Form>
    </main>


  );
};

export default PurchaseForm;
