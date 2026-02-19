import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
} from 'reactstrap';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { toast } from 'react-toastify';
import Joi from 'joi-browser';
import axios from 'axios';
import {
  postBuildingInventoryType,
  postBuildingToolType,
  postBuildingConsumableType,
  fetchInvTypeByType,
} from '~/actions/bmdashboard/invTypeActions';
import { addEquipmentType } from '~/actions/bmdashboard/equipmentActions';
import { fetchInvUnits } from '~/actions/bmdashboard/invUnitActions';
import { ENDPOINTS } from '~/utils/URL';
import DragAndDrop from '~/components/common/DragAndDrop/DragAndDrop';
import styles from './TypesList.module.css';

const initialFormState = {
  name: '',
  description: '',
  invoice: '',
  unitPrice: '',
  currency: 'USD',
  quantity: '',
  unit: '',
  purchaseRental: 'purchase',
  condition: 'New',
  fromDate: '',
  toDate: '',
  purchaseDate: '',
  shippingFee: '',
  taxes: '',
  phoneNumber: '',
  link: '',
  fuel: 'Diesel',
};

function AddEditInvTypeFullModal({ isOpen, toggle, category, mode = 'add', itemType = null }) {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);
  const units = useSelector(state => state.bmInvUnits.list) || [];
  const userId = useSelector(state => state.auth.user?.userid);

  const [formData, setFormData] = useState(initialFormState);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPurchased, setIsPurchased] = useState(true);

  useEffect(() => {
    dispatch(fetchInvUnits());
  }, [dispatch]);

  // Populate form when editing
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && itemType) {

        // Format dates for input fields
        const formatDate = dateStr => {
          if (!dateStr) return '';
          const date = new Date(dateStr);
          return date.toISOString().split('T')[0];
        };

        setFormData({
          name: itemType.name || '',
          description: itemType.description || '',
          invoice: itemType.invoice || '',
          unitPrice: itemType.unitPrice || '',
          currency: itemType.currency || 'USD',
          quantity: itemType.quantity || '',
          unit: itemType.unit || '',
          purchaseRental: itemType.purchaseRental || 'purchase',
          condition: itemType.condition || 'New',
          fromDate: formatDate(itemType.fromDate),
          toDate: formatDate(itemType.toDate),
          purchaseDate: formatDate(itemType.purchaseDate),
          shippingFee: itemType.shippingFee || '',
          taxes: itemType.taxes || '',
          phoneNumber: itemType.phoneNumber || '',
          link: itemType.link || '',
          fuel: itemType.fuel || 'Diesel',
        });
        setIsPurchased(itemType.purchaseRental !== 'rental');
      } else {
        setFormData(initialFormState);
        setIsPurchased(true);
      }
      setUploadedFiles([]);
      setErrors({});
    }
  }, [isOpen, mode, itemType]);

  const getCategoryLabel = () => {
    if (category === 'Equipments') return 'Equipment';
    if (category?.endsWith('s')) return category.slice(0, -1);
    return category;
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handlePurchaseRentalChange = e => {
    const value = e.target.value;
    setIsPurchased(value === 'purchase');
    handleInputChange('purchaseRental', value);
  };

  const getValidationSchema = () => {
    const baseSchema = {
      name: Joi.string()
        .min(3)
        .max(50)
        .required()
        .label('Name'),
      description: Joi.string()
        .min(5)
        .max(500)
        .required()
        .label('Description'),
    };

    if (category === 'Equipments') {
      return Joi.object({
        ...baseSchema,
        fuel: Joi.string()
          .required()
          .label('Fuel Type'),
      }).unknown();
    }

    if (category === 'Tools' || category === 'Reusables') {
      return Joi.object({
        ...baseSchema,
        invoice: Joi.string()
          .required()
          .label('Invoice'),
        quantity: Joi.number()
          .min(1)
          .max(999)
          .integer()
          .required()
          .label('Quantity'),
        unitPrice: Joi.number()
          .min(0)
          .required()
          .label('Unit Price'),
        fromDate: Joi.date()
          .required()
          .label('Purchase/Rental Date'),
      }).unknown();
    }

    // Materials, Consumables
    return Joi.object({
      ...baseSchema,
      invoice: Joi.string()
        .required()
        .label('Invoice'),
      quantity: Joi.number()
        .min(1)
        .max(999)
        .integer()
        .required()
        .label('Quantity'),
      unitPrice: Joi.number()
        .min(0)
        .required()
        .label('Unit Price'),
      unit: Joi.string()
        .required()
        .label('Unit'),
      purchaseDate: Joi.date()
        .required()
        .label('Purchase Date'),
    }).unknown();
  };

  const validate = () => {
    const schema = getValidationSchema();
    const result = schema.validate(formData, { abortEarly: false });
    if (!result.error) return null;

    const errorMessages = {};
    result.error.details.forEach(detail => {
      errorMessages[detail.path[0]] = detail.message;
    });
    return errorMessages;
  };

  const calculateTotalPrice = () => {
    const { unitPrice, quantity, taxes, shippingFee } = formData;
    const totalPrice = (parseFloat(unitPrice) || 0) * (parseInt(quantity, 10) || 0);
    const totalTax = ((parseFloat(taxes) || 0) * totalPrice) / 100;
    return (totalPrice + totalTax + (parseFloat(shippingFee) || 0)).toFixed(2);
  };

  const handleUpdate = async () => {
    const totalPriceWithShipping = calculateTotalPrice();
    const imageURL = uploadedFiles.map(file => URL.createObjectURL(file));

    try {
      let response;

      if (category === 'Equipments') {
        const payload = {
          name: formData.name,
          desc: formData.description,
          fuel: formData.fuel,
        };
        response = await axios.put(ENDPOINTS.BM_INVTYPE_BY_ID(itemType._id), payload);
      } else if (category === 'Tools' || category === 'Reusables') {
        const payload = {
          ...formData,
          category: category === 'Tools' ? 'Tool' : 'Reusable',
          images: imageURL[0] || itemType?.images || '',
          totalPriceWithShipping,
        };
        // Try tool-specific endpoint first, fallback to generic
        response = await axios.put(ENDPOINTS.BM_TOOL_BY_ID(itemType._id), payload);
      } else {
        // Materials, Consumables
        const payload = {
          ...formData,
          category: category === 'Consumables' ? 'Consumable' : 'Material',
          images: imageURL[0] || itemType?.images || '',
          totalPriceWithShipping,
        };
        response = await axios.put(ENDPOINTS.BM_INVTYPE_BY_ID(itemType._id), payload);
      }

      if (response.status === 200) {
        toast.success(`${getCategoryLabel()} type updated successfully!`);
        dispatch(fetchInvTypeByType(category));
        toggle();
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data ||
        'Failed to update. Backend endpoint may not exist.';
      toast.error(typeof errorMsg === 'string' ? errorMsg : 'Failed to update');
    }
  };

  const handleAdd = async () => {
    const imageURL = uploadedFiles.map(file => URL.createObjectURL(file));
    const totalPriceWithShipping = calculateTotalPrice();

    try {
      if (category === 'Equipments') {
        const payload = {
          name: formData.name,
          desc: formData.description,
          fuel: formData.fuel,
        };
        const result = await addEquipmentType(payload);
        if (result.status === 201) {
          toast.success('Equipment type added successfully!');
          dispatch(fetchInvTypeByType(category));
          toggle();
        } else if (result.status === 409) {
          toast.error('Error: that type already exists.');
        } else {
          toast.error(`Error: ${result.status} ${result.statusText}`);
        }
      } else if (category === 'Tools' || category === 'Reusables') {
        const payload = {
          ...formData,
          category: category === 'Tools' ? 'Tool' : 'Reusable',
          images: imageURL[0] || '',
          totalPriceWithShipping,
          createdBy: userId,
        };
        dispatch(postBuildingToolType(payload));
        toast.success(`${getCategoryLabel()} type added successfully!`);
        dispatch(fetchInvTypeByType(category));
        toggle();
      } else if (category === 'Consumables') {
        const payload = {
          ...formData,
          category: 'Consumable',
          images: imageURL[0] || '',
          totalPriceWithShipping,
          createdBy: userId,
        };
        dispatch(postBuildingConsumableType(payload));
        toast.success('Consumable type added successfully!');
        dispatch(fetchInvTypeByType(category));
        toggle();
      } else {
        // Materials
        const payload = {
          ...formData,
          category: 'Material',
          images: imageURL[0] || '',
          totalPriceWithShipping,
          createdBy: userId,
        };
        dispatch(postBuildingInventoryType(payload));
        toast.success('Material type added successfully!');
        dispatch(fetchInvTypeByType(category));
        toggle();
      }
    } catch (err) {
      toast.error('Failed to add type. Please try again.');
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors || {});
    if (validationErrors) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'edit') {
        await handleUpdate();
      } else {
        await handleAdd();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormState);
    setUploadedFiles([]);
    setErrors({});
    toggle();
  };

  const handleRemoveFile = index => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const renderEquipmentFields = () => (
    <>
      <FormGroup>
        <Label>
          Fuel Type <span className="text-danger">*</span>
        </Label>
        <Input
          type="select"
          value={formData.fuel}
          onChange={e => handleInputChange('fuel', e.target.value)}
        >
          <option value="Diesel">Diesel</option>
          <option value="Biodiesel">Biodiesel</option>
          <option value="Gasoline">Gasoline</option>
          <option value="Natural Gas">Natural Gas</option>
          <option value="Ethanol">Ethanol</option>
        </Input>
      </FormGroup>
    </>
  );

  const renderToolFields = () => (
    <>
      <FormGroup>
        <Label>
          Invoice Number <span className="text-danger">*</span>
        </Label>
        <Input
          type="text"
          value={formData.invoice}
          onChange={e => handleInputChange('invoice', e.target.value)}
          invalid={!!errors.invoice}
          placeholder="Invoice No or ID"
        />
        {errors.invoice && <div className="text-danger small">{errors.invoice}</div>}
      </FormGroup>

      <div className={styles.formRow}>
        <FormGroup>
          <Label>
            Unit Price <span className="text-danger">*</span>
          </Label>
          <Input
            type="number"
            value={formData.unitPrice}
            onChange={e => handleInputChange('unitPrice', e.target.value)}
            invalid={!!errors.unitPrice}
          />
          {errors.unitPrice && <div className="text-danger small">{errors.unitPrice}</div>}
        </FormGroup>
        <FormGroup>
          <Label>Currency</Label>
          <Input
            type="select"
            value={formData.currency}
            onChange={e => handleInputChange('currency', e.target.value)}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="CAD">CAD</option>
          </Input>
        </FormGroup>
        <FormGroup>
          <Label>
            Quantity <span className="text-danger">*</span>
          </Label>
          <Input
            type="number"
            value={formData.quantity}
            onChange={e => handleInputChange('quantity', e.target.value)}
            invalid={!!errors.quantity}
          />
          {errors.quantity && <div className="text-danger small">{errors.quantity}</div>}
        </FormGroup>
      </div>

      <div className={styles.formRow}>
        <FormGroup>
          <Label>Purchase or Rental</Label>
          <Input
            type="select"
            value={formData.purchaseRental}
            onChange={handlePurchaseRentalChange}
          >
            <option value="purchase">Purchase</option>
            <option value="rental">Rental</option>
          </Input>
        </FormGroup>
        <FormGroup>
          <Label>Condition</Label>
          <Input
            type="select"
            value={formData.condition}
            onChange={e => handleInputChange('condition', e.target.value)}
          >
            <option value="New">New</option>
            <option value="Used">Used</option>
          </Input>
        </FormGroup>
      </div>

      <div className={styles.formRow}>
        <FormGroup>
          <Label>
            Purchase/Rental Date <span className="text-danger">*</span>
          </Label>
          <Input
            type="date"
            value={formData.fromDate}
            onChange={e => handleInputChange('fromDate', e.target.value)}
            invalid={!!errors.fromDate}
          />
          {errors.fromDate && <div className="text-danger small">Date is required</div>}
        </FormGroup>
        <FormGroup>
          <Label>Return Date (if rented)</Label>
          <Input
            type="date"
            value={formData.toDate}
            onChange={e => handleInputChange('toDate', e.target.value)}
            disabled={isPurchased}
          />
        </FormGroup>
      </div>

      <div className={styles.formRow}>
        <FormGroup>
          <Label>Shipping Fee</Label>
          <Input
            type="number"
            value={formData.shippingFee}
            onChange={e => handleInputChange('shippingFee', e.target.value)}
            placeholder="0.00"
          />
        </FormGroup>
        <FormGroup>
          <Label>Taxes (%)</Label>
          <Input
            type="number"
            value={formData.taxes}
            onChange={e => handleInputChange('taxes', e.target.value)}
            placeholder="%"
          />
        </FormGroup>
      </div>

      <FormGroup>
        <Label>Phone Number</Label>
        <PhoneInput
          country="us"
          value={formData.phoneNumber}
          onChange={phone => handleInputChange('phoneNumber', phone)}
          inputStyle={{ width: '100%' }}
        />
      </FormGroup>

      <FormGroup>
        <Label>Upload Image</Label>
        <DragAndDrop updateUploadedFiles={setUploadedFiles} />
        {uploadedFiles.length > 0 && (
          <div className={styles.filePreviewContainer}>
            {uploadedFiles.map((file, index) => (
              <div key={`${file.name}-${file.lastModified}`} className={styles.filePreview}>
                <img
                  src={URL.createObjectURL(file)}
                  alt={`preview-${index}`}
                  style={{ maxWidth: '100px', maxHeight: '100px' }}
                />
                <Button color="danger" size="sm" onClick={() => handleRemoveFile(index)}>
                  X
                </Button>
              </div>
            ))}
          </div>
        )}
        {mode === 'edit' && itemType?.images && uploadedFiles.length === 0 && (
          <div className="mt-2">
            <small className="text-muted">Current image:</small>
            <img
              src={itemType.images}
              alt="current"
              style={{ maxWidth: '100px', maxHeight: '100px', display: 'block', marginTop: '5px' }}
            />
          </div>
        )}
      </FormGroup>

      <FormGroup>
        <Label>Link to Buy/Rent</Label>
        <Input
          type="text"
          value={formData.link}
          onChange={e => handleInputChange('link', e.target.value)}
          placeholder="https://"
        />
      </FormGroup>

      <div className={styles.totalPriceSection}>
        <strong>
          Total Price: {calculateTotalPrice()} {formData.currency}
        </strong>
      </div>
    </>
  );

  const renderMaterialFields = () => (
    <>
      <FormGroup>
        <Label>
          Unit <span className="text-danger">*</span>
        </Label>
        <Input
          type="select"
          value={formData.unit}
          onChange={e => handleInputChange('unit', e.target.value)}
          invalid={!!errors.unit}
        >
          <option value="">Select a Unit</option>
          {units.map((u, index) => (
            <option key={index} value={u.unit}>
              {u.unit}
            </option>
          ))}
        </Input>
        {errors.unit && <div className="text-danger small">{errors.unit}</div>}
      </FormGroup>

      <FormGroup>
        <Label>
          Invoice Number <span className="text-danger">*</span>
        </Label>
        <Input
          type="text"
          value={formData.invoice}
          onChange={e => handleInputChange('invoice', e.target.value)}
          invalid={!!errors.invoice}
          placeholder="Invoice No or ID"
        />
        {errors.invoice && <div className="text-danger small">{errors.invoice}</div>}
      </FormGroup>

      <div className={styles.formRow}>
        <FormGroup>
          <Label>
            Unit Price <span className="text-danger">*</span>
          </Label>
          <Input
            type="number"
            value={formData.unitPrice}
            onChange={e => handleInputChange('unitPrice', e.target.value)}
            invalid={!!errors.unitPrice}
          />
          {errors.unitPrice && <div className="text-danger small">{errors.unitPrice}</div>}
        </FormGroup>
        <FormGroup>
          <Label>Currency</Label>
          <Input
            type="select"
            value={formData.currency}
            onChange={e => handleInputChange('currency', e.target.value)}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="CAD">CAD</option>
          </Input>
        </FormGroup>
        <FormGroup>
          <Label>
            Quantity <span className="text-danger">*</span>
          </Label>
          <Input
            type="number"
            value={formData.quantity}
            onChange={e => handleInputChange('quantity', e.target.value)}
            invalid={!!errors.quantity}
          />
          {errors.quantity && <div className="text-danger small">{errors.quantity}</div>}
        </FormGroup>
      </div>

      <FormGroup>
        <Label>
          Purchase Date <span className="text-danger">*</span>
        </Label>
        <Input
          type="date"
          value={formData.purchaseDate}
          onChange={e => handleInputChange('purchaseDate', e.target.value)}
          invalid={!!errors.purchaseDate}
        />
        {errors.purchaseDate && <div className="text-danger small">Date is required</div>}
      </FormGroup>

      <div className={styles.formRow}>
        <FormGroup>
          <Label>Shipping Fee</Label>
          <Input
            type="number"
            value={formData.shippingFee}
            onChange={e => handleInputChange('shippingFee', e.target.value)}
            placeholder="0.00"
          />
        </FormGroup>
        <FormGroup>
          <Label>Taxes (%)</Label>
          <Input
            type="number"
            value={formData.taxes}
            onChange={e => handleInputChange('taxes', e.target.value)}
            placeholder="%"
          />
        </FormGroup>
      </div>

      <FormGroup>
        <Label>Phone Number</Label>
        <PhoneInput
          country="us"
          value={formData.phoneNumber}
          onChange={phone => handleInputChange('phoneNumber', phone)}
          inputStyle={{ width: '100%' }}
        />
      </FormGroup>

      <FormGroup>
        <Label>Upload Image</Label>
        <DragAndDrop updateUploadedFiles={setUploadedFiles} />
        {uploadedFiles.length > 0 && (
          <div className={styles.filePreviewContainer}>
            {uploadedFiles.map((file, index) => (
              <div key={`${file.name}-${file.lastModified}`} className={styles.filePreview}>
                <img
                  src={URL.createObjectURL(file)}
                  alt={`preview-${index}`}
                  style={{ maxWidth: '100px', maxHeight: '100px' }}
                />
                <Button color="danger" size="sm" onClick={() => handleRemoveFile(index)}>
                  X
                </Button>
              </div>
            ))}
          </div>
        )}
        {mode === 'edit' && itemType?.images && uploadedFiles.length === 0 && (
          <div className="mt-2">
            <small className="text-muted">Current image:</small>
            <img
              src={itemType.images}
              alt="current"
              style={{ maxWidth: '100px', maxHeight: '100px', display: 'block', marginTop: '5px' }}
            />
          </div>
        )}
      </FormGroup>

      <FormGroup>
        <Label>Link</Label>
        <Input
          type="text"
          value={formData.link}
          onChange={e => handleInputChange('link', e.target.value)}
          placeholder="https://"
        />
      </FormGroup>

      <div className={styles.totalPriceSection}>
        <strong>
          Total Price: {calculateTotalPrice()} {formData.currency}
        </strong>
      </div>
    </>
  );

  const renderCategoryFields = () => {
    if (category === 'Equipments') {
      return renderEquipmentFields();
    }
    if (category === 'Tools' || category === 'Reusables') {
      return renderToolFields();
    }
    // Materials, Consumables
    return renderMaterialFields();
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={handleClose}
      size="lg"
      className={darkMode ? 'text-light dark-mode' : ''}
    >
      <ModalHeader className={darkMode ? 'bg-space-cadet' : ''} toggle={handleClose}>
        {mode === 'edit' ? 'Edit' : 'Add'} {getCategoryLabel()} Type
      </ModalHeader>
      <ModalBody className={`${darkMode ? 'bg-yinmn-blue' : ''} ${styles.modalBody}`}>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>
              Name <span className="text-danger">*</span>
            </Label>
            <Input
              type="text"
              value={formData.name}
              onChange={e => handleInputChange('name', e.target.value)}
              invalid={!!errors.name}
              placeholder={`Enter ${getCategoryLabel().toLowerCase()} name`}
            />
            {errors.name && <div className="text-danger small">{errors.name}</div>}
          </FormGroup>

          <FormGroup>
            <Label>
              Description <span className="text-danger">*</span>
            </Label>
            <Input
              type="textarea"
              rows={3}
              value={formData.description}
              onChange={e => handleInputChange('description', e.target.value)}
              invalid={!!errors.description}
              placeholder="Enter description"
            />
            {errors.description && <div className="text-danger small">{errors.description}</div>}
            <div className="text-end">
              <small className={formData.description.length > 500 ? 'text-danger' : 'text-muted'}>
                {formData.description.length}/500
              </small>
            </div>
          </FormGroup>

          {renderCategoryFields()}
        </Form>
      </ModalBody>
      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Button onClick={handleClose} className={styles.modalBtnCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting} className={styles.modalBtnPrimary}>
          {isSubmitting
            ? mode === 'edit'
              ? 'Updating...'
              : 'Adding...'
            : mode === 'edit'
            ? 'Update'
            : 'Add'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default AddEditInvTypeFullModal;
