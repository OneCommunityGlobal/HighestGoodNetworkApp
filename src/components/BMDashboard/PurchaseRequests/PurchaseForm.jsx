import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Joi from 'joi-browser';
import {
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import { boxStyle } from '~/styles';
import BMError from '../shared/BMError';
import styles from './PurchaseForm.module.css';

function PurchaseForm({
  fetchPrimaryDataAction,
  fetchSecondaryDataAction,
  submitFormAction,
  primaryDataSelector,
  secondaryDataSelector,
  errorSelector,
  formLabels,
}) {
  const dispatch = useDispatch();
  const history = useHistory();
  const primaryData = useSelector(primaryDataSelector);
  const secondaryData = useSelector(secondaryDataSelector);
  const errors = useSelector(errorSelector);
  const [primaryId, setPrimaryId] = useState('');
  const [secondaryId, setSecondaryId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [priority, setPriority] = useState('Low');
  const [brand, setBrand] = useState('');
  const [validationError, setValidationError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

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

  useEffect(() => {
    if (validationError) setValidationError('');
  }, [primaryId, secondaryId, quantity, priority, brand]);

  // Validate individual field
  const validateField = (fieldName, value) => {
    const schemas = {
      primaryId: Joi.string()
        .required()
        .label('Project'),
      secondaryId: Joi.string()
        .required()
        .label('Material'),
      quantity: Joi.number()
        .positive()
        .required()
        .label('Quantity'),
      priority: Joi.string()
        .valid('Low', 'Medium', 'High')
        .required()
        .label('Priority'),
    };

    if (schemas[fieldName]) {
      const { error } = schemas[fieldName].validate(value);
      return error ? error.details[0].message : null;
    }
    return null;
  };

  // Handle field blur for validation
  const handleFieldBlur = (fieldName, value) => {
    const error = validateField(fieldName, value);
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: error,
    }));
  };

  // Form validation logic
  const validateForm = () =>
    Joi.object({
      primaryId: Joi.string()
        .required()
        .label('Project'),
      secondaryId: Joi.string()
        .required()
        .label('Material'),
      quantity: Joi.number()
        .positive()
        .required()
        .label('Quantity'),
      priority: Joi.string()
        .valid('Low', 'Medium', 'High')
        .required()
        .label('Priority'),
      brand: Joi.string().allow(''),
    }).validate({ primaryId, secondaryId, quantity, priority, brand }, { abortEarly: false });

  // Reset form to initial state
  const resetForm = () => {
    setPrimaryId('');
    setSecondaryId('');
    setQuantity('');
    setUnit('');
    setPriority('Low');
    setBrand('');
    setValidationError('');
    setFieldErrors({});
  };

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault();
    const { error } = validateForm();

    if (error) {
      const errors = {};
      error.details.forEach(detail => {
        const fieldName = detail.path[0];
        errors[fieldName] = detail.message;
      });
      setFieldErrors(errors);
      setValidationError('Please fix the errors above before submitting.');
      return;
    }

    setValidationError('');
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const response = await submitFormAction({
        primaryId,
        secondaryId,
        quantity,
        priority,
        brand,
      });

      if (response?.status === 201) {
        // Get project and material names for success message
        const projectName = primaryData.find(p => p._id === primaryId)?.name || 'Unknown Project';
        const materialName =
          secondaryData.find(m => m._id === secondaryId)?.name || 'Unknown Material';

        setSubmittedData({ projectName, materialName });
        toast.success(`Purchase request submitted for ${materialName} on ${projectName}`);
        setShowSuccessModal(true);
      } else if (response?.status === 400 && response?.data) {
        // Backend validation error - show specific error message
        const backendError = response.data;

        if (backendError.field && backendError.message) {
          // Map backend field names to frontend field names
          const fieldMapping = {
            projectId: 'primaryId',
            matTypeId: 'secondaryId',
            quantity: 'quantity',
            priority: 'priority',
            requestorId: 'requestorId',
          };

          const frontendFieldName = fieldMapping[backendError.field] || backendError.field;

          // Set field-specific error
          setFieldErrors(prev => ({
            ...prev,
            [frontendFieldName]: backendError.message,
          }));
          toast.error(backendError.message);
        } else {
          // Generic validation error
          toast.error(backendError.message || 'Validation error. Please check your inputs.');
        }
      } else {
        // Other server errors
        const errorMessage = response?.data?.message || response?.statusText || 'Unknown error';
        toast.error(
          `There was an issue submitting your request. ${errorMessage}. Please try again or contact an admin.`,
        );
      }
    } catch (err) {
      toast.error('Unable to connect. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle "Create Another Request" action
  const handleCreateAnother = () => {
    setShowSuccessModal(false);
    resetForm();
  };

  // Handle "Go to Materials List" action
  const handleGoToMaterials = () => {
    setShowSuccessModal(false);
    history.push('/bmdashboard/materials');
  };

  // Handle cancel action
  const handleCancel = () => {
    history.goBack();
  };

  if (isError) {
    return <BMError errors={errors} />;
  }

  return (
    <main className={`${styles.purchaseRequestContainer}`}>
      <header className={`${styles.purchaseHeader}`}>
        <h2>{formLabels.headerText}</h2>
        <p>{formLabels.headerSubText}</p>
      </header>
      <Form className={`${styles.purchaseForm}`} onSubmit={handleSubmit}>
        <FormGroup>
          <Label for="select-project">
            {formLabels.primarySelectLabel} <span className={styles.requiredIndicator}>*</span>
          </Label>
          <Input
            id="select-project"
            type="select"
            value={primaryId}
            onChange={({ currentTarget }) => {
              setPrimaryId(currentTarget.value);
              if (fieldErrors.primaryId) {
                setFieldErrors(prev => ({ ...prev, primaryId: null }));
              }
            }}
            onBlur={() => handleFieldBlur('primaryId', primaryId)}
            disabled={!primaryData.length || isSubmitting}
            className={fieldErrors.primaryId ? styles.invalidField : ''}
          >
            <option value="">{formLabels.primarySelectDefaultOption}</option>
            {primaryData.map(item => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
          </Input>
          {fieldErrors.primaryId && (
            <div className={styles.fieldError}>{fieldErrors.primaryId}</div>
          )}
        </FormGroup>

        <FormGroup>
          <Label for="select-material">
            {formLabels.secondarySelectLabel} <span className={styles.requiredIndicator}>*</span>
          </Label>
          <Input
            id="select-material"
            type="select"
            value={secondaryId}
            onChange={({ currentTarget }) => {
              setSecondaryId(currentTarget.value);
              if (fieldErrors.secondaryId) {
                setFieldErrors(prev => ({ ...prev, secondaryId: null }));
              }
            }}
            onBlur={() => handleFieldBlur('secondaryId', secondaryId)}
            disabled={isSubmitting}
            className={fieldErrors.secondaryId ? styles.invalidField : ''}
          >
            <option value="">{formLabels.secondarySelectDefaultOption}</option>
            {secondaryData.map(item => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
          </Input>
          {fieldErrors.secondaryId && (
            <div className={styles.fieldError}>{fieldErrors.secondaryId}</div>
          )}
        </FormGroup>

        <div className={`${styles.purchaseFlexGroup}`}>
          <FormGroup className={`${styles.purchaseQtyGroup}`}>
            <Label for="input-quantity">
              {formLabels.quantityLabel} <span className={styles.requiredIndicator}>*</span>
            </Label>
            <div className={`${styles.purchaseQtyContainer}`}>
              <Input
                id="input-quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={e => {
                  setQuantity(e.target.value);
                  if (fieldErrors.quantity) {
                    setFieldErrors(prev => ({ ...prev, quantity: null }));
                  }
                }}
                onBlur={() => handleFieldBlur('quantity', quantity)}
                placeholder={formLabels.quantityPlaceholder}
                disabled={isSubmitting}
                className={fieldErrors.quantity ? styles.invalidField : ''}
              />
              <span>{unit}</span>
            </div>
            {fieldErrors.quantity && (
              <div className={styles.fieldError}>{fieldErrors.quantity}</div>
            )}
          </FormGroup>

          <FormGroup>
            <Label for="input-priority">
              {formLabels.priorityLabel} <span className={styles.requiredIndicator}>*</span>
            </Label>
            <Input
              id="input-priority"
              type="select"
              value={priority}
              onChange={e => {
                setPriority(e.target.value);
                if (fieldErrors.priority) {
                  setFieldErrors(prev => ({ ...prev, priority: null }));
                }
              }}
              disabled={isSubmitting}
              className={fieldErrors.priority ? styles.invalidField : ''}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </Input>
            {fieldErrors.priority && (
              <div className={styles.fieldError}>{fieldErrors.priority}</div>
            )}
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
            disabled={isSubmitting}
          />
        </FormGroup>

        {validationError && (
          <div className={`${styles.purchaseErrorMessage}`}>
            <p>{validationError}</p>
          </div>
        )}

        <div className={`${styles.purchaseActions}`}>
          <Button
            type="button"
            id="cancel-button"
            color="secondary"
            onClick={handleCancel}
            style={boxStyle}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            id="submit-button"
            type="submit"
            color="primary"
            style={boxStyle}
            disabled={
              !primaryId ||
              !secondaryId ||
              !quantity ||
              !priority ||
              !!validationError ||
              isSubmitting
            }
            className={isSubmitting ? styles.submitButtonLoading : ''}
          >
            {isSubmitting ? 'Submitting...' : 'Purchase Request'}
          </Button>
        </div>
      </Form>

      {/* Success Modal */}
      <Modal isOpen={showSuccessModal} toggle={() => setShowSuccessModal(false)}>
        <ModalHeader toggle={() => setShowSuccessModal(false)}>
          Request Submitted Successfully
        </ModalHeader>
        <ModalBody>
          {submittedData && (
            <p>
              Your purchase request for <strong>{submittedData.materialName}</strong> on project{' '}
              <strong>{submittedData.projectName}</strong> has been submitted for approval.
            </p>
          )}
          <p>What would you like to do next?</p>
        </ModalBody>
        <ModalFooter className={styles.successModalActions}>
          <Button color="secondary" onClick={handleCreateAnother} style={boxStyle}>
            Create Another Request
          </Button>
          <Button color="primary" onClick={handleGoToMaterials} style={boxStyle}>
            Go to Materials List
          </Button>
        </ModalFooter>
      </Modal>
    </main>
  );
}

export default PurchaseForm;
