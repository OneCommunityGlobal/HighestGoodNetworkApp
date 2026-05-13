import { useState, useEffect } from 'react';
import { Form, FormGroup, Label, Input, Button } from 'reactstrap';
import DragAndDrop from '~/components/common/DragAndDrop/DragAndDrop';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { toast } from 'react-toastify';

import { useDispatch, useSelector } from 'react-redux';
import Joi from 'joi';
import { boxStyle, boxStyleDark } from '~/styles';
import styles from './AddToolForm.module.css';

import {
  fetchToolTypes,
  postBuildingToolType,
  resetPostBuildingToolTypeResult,
} from '../../../actions/bmdashboard/invTypeActions';

const initialFormState = {
  project: 'Project1',
  name: '',
  invoice: '',
  unitPrice: '',
  currency: 'USD',
  quantity: '',
  purchaseRental: 'purchase',
  condition: 'New',
  fromDate: '',
  toDate: '',
  shippingFee: '',
  taxes: '',
  areaCode: '+1',
  phoneNumber: '',
  images: [],
  link: '',
  description: '',
};

const calculateTotalPrice = (price, qty) => price * qty;
const calculateTotalTax = (taxPct, total) => (taxPct * total) / 100;

function getPhoneBorderStyle(phoneInvalid, isDarkMode) {
  if (phoneInvalid) return '1px solid #dc3545';
  return isDarkMode ? '1px solid #555' : '1px solid #ccc';
}

const toolSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(15)
    .required(),
  description: Joi.string()
    .min(5)
    .max(500)
    .required(),
  invoice: Joi.string().required(),
  quantity: Joi.number()
    .min(1)
    .max(999)
    .integer()
    .required(),
  unitPrice: Joi.number()
    .min(1)
    .required(),
  fromDate: Joi.date().required(),
  phoneNumber: Joi.string()
    .pattern(/^\d{6,15}$/)
    .allow('')
    .optional()
    .messages({
      'string.pattern.base': 'Phone number must be 6-15 digits.',
    }),
  toDate: Joi.date()
    .when('purchaseRental', {
      is: 'rental',
      then: Joi.date()
        .greater(Joi.ref('fromDate'))
        .required(),
    })
    .when('purchaseRental', {
      is: 'purchase',
      then: Joi.date().allow(''),
    }),
}).unknown();

function validateToolForm(data) {
  const result = toolSchema.validate(data, { abortEarly: false });
  if (!result.error) return null;
  const errorMessages = {};
  result.error.details.forEach(detail => {
    errorMessages[detail.path[0]] = detail.message;
  });
  return errorMessages;
}

export default function AddToolForm() {
  const [formData, setFormData] = useState(initialFormState);
  const [isPurchased, setIsPurchased] = useState(true);
  const [areaCode, setAreaCode] = useState('1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(true);
  const [phoneErrorMsg, setPhoneErrorMsg] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]); // log here for correct state snapshot (will show each render)
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const postBuildingInventoryResult = useSelector(state => state.bmInvTypes.postedResult);
  const darkMode = useSelector(state => state.theme.darkMode);
  const phoneHasError = !isPhoneValid;

  useEffect(() => {
    if (postBuildingInventoryResult?.error === true) {
      toast.error(`${postBuildingInventoryResult?.result}`);
      dispatch(resetPostBuildingToolTypeResult());
    } else if (postBuildingInventoryResult?.result !== null) {
      toast.success(
        `Created a new Tool Type "${postBuildingInventoryResult?.result.name}" successfully`,
      );
      dispatch(fetchToolTypes());
      dispatch(resetPostBuildingToolTypeResult());
      // setDisableSubmit(true);
    }
  }, [postBuildingInventoryResult]);

  const handleInputChange = (name, value) => {
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePurchaseRentalChange = event => {
    const selectedOption = event.target.value;
    setIsPurchased(selectedOption === 'purchase');
    handleInputChange('purchaseRental', selectedOption);
  };

  const { unitPrice, quantity, taxes, shippingFee } = formData;

  const totalPrice = calculateTotalPrice(unitPrice, quantity);
  const totalTax = calculateTotalTax(Number(taxes), totalPrice);
  const totalPriceWithShipping = (totalPrice + totalTax + Number(shippingFee)).toFixed(2);

  const phoneChange = (name, phone, country) => {
    setFormData(prevData => ({
      ...prevData,
      [name]: phone,
    }));
    const dialCodeLen = country?.dialCode?.length || 1;
    const userDigits = phone.length - dialCodeLen;
    // Count dots in format mask (e.g. "+. (...) ...-....") to get exact expected total digits
    const expectedTotal = (country?.format?.match(/\./g) || []).length;
    const expectedUserDigits = expectedTotal > 0 ? expectedTotal - dialCodeLen : null;
    if (userDigits <= 0) {
      setPhoneErrorMsg('Please enter a phone number.');
      setIsPhoneValid(false);
      return;
    }
    const isValid =
      expectedTotal > 0 ? phone.length === expectedTotal : userDigits >= 6 && userDigits <= 15;
    if (isValid) {
      setPhoneErrorMsg('');
    } else {
      const msg =
        expectedUserDigits === null
          ? 'Phone number length is invalid for the selected country.'
          : `Phone number must be exactly ${expectedUserDigits} digits for the selected country.`;
      setPhoneErrorMsg(msg);
    }
    setIsPhoneValid(isValid);
  };

  const handleSubmit = async event => {
    event.preventDefault();
    const validationErrors = validateToolForm(formData);
    setErrors(validationErrors || {});

    // Also catch empty phone that was never touched (isPhoneValid stays true by default)
    const phoneVal = formData.phoneNumber || '';
    if (phoneVal.length > 0 && isPhoneValid) {
      if (validationErrors) {
        return;
      }
      const imageURL = uploadedFiles.map(file => URL.createObjectURL(file));
      const updatedFormData = {
        ...formData,
        category: 'Tool',
        images: imageURL[0],
        areaCode,
        phoneNumber,
        totalPriceWithShipping,
      };
      dispatch(postBuildingToolType(updatedFormData));
      setFormData(initialFormState);
      setUploadedFiles([]);
      setAreaCode(1);
      setPhoneNumber('');
      return;
    }
    if (phoneVal.length === 0) setPhoneErrorMsg('Please enter a phone number.');
    setIsPhoneValid(false);
  };

  const handleCancelClick = () => {
    setFormData(initialFormState);
    setUploadedFiles([]);
    setAreaCode(1);
    setPhoneNumber('');
    setIsPhoneValid(true);
    setPhoneErrorMsg('');
  };

  const handleRemoveFile = index => {
    setUploadedFiles(prevUploadedFiles => prevUploadedFiles.filter((file, i) => i !== index));
  };

  return (
    <Form
      className={`${styles.addToolForm} ${darkMode ? styles.addToolFormDark : ''} container`}
      onSubmit={handleSubmit}
    >
      <FormGroup>
        <Label for="tool">
          Tool name <span className={`${styles.fieldRequired}`}>*</span>
        </Label>
        <Input
          id="tool"
          type="text"
          name="tool"
          placeholder="Enter tool name."
          value={formData.name}
          onChange={event => handleInputChange('name', event.target.value)}
        />
        {errors.name && (
          <Label for="toolNameErr" sm={12} className={`${styles.toolFormError} bm-error-red`}>
            {errors.name}
          </Label>
        )}
      </FormGroup>
      <FormGroup>
        <Label for="invoice-number">
          Invoice Number or ID <span className={`${styles.fieldRequired}`}>*</span>
        </Label>
        <Input
          id="invoice-number"
          type="text"
          name="invoice"
          placeholder="Input Invoice No or  ID for the tool or equipment"
          value={formData.invoice}
          onChange={event => handleInputChange('invoice', event.target.value)}
        />
        {errors.invoice && (
          <Label for="toolInvoiceErr" sm={12} className={`${styles.toolFormError} bm-error-red`}>
            {errors.invoice}
          </Label>
        )}
      </FormGroup>
      <div className={`${styles.addToolFlexGroup}`}>
        <FormGroup>
          <Label for="unit-price">
            Unit Price (excl.taxes & shipping) <span className={`${styles.fieldRequired}`}>*</span>
          </Label>
          <Input
            id="unit-price"
            type="number"
            name="unit-price"
            value={formData.unitPrice}
            onChange={event => handleInputChange('unitPrice', event.target.value)}
          />
          {errors.unitPrice && (
            <Label
              for="toolUnitPriceErr"
              sm={12}
              className={`${styles.toolFormError} bm-error-red`}
            >
              {errors.unitPrice}
            </Label>
          )}
        </FormGroup>
        <FormGroup>
          <Label for="currency">Currency</Label>
          <Input
            id="currency"
            type="select"
            name="currency"
            value={formData.currency}
            onChange={event => handleInputChange('currency', event.target.value)}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="CAD">CAD</option>
          </Input>
        </FormGroup>
        <FormGroup>
          <Label for="quantity">
            Total quantity <span className={`${styles.fieldRequired}`}>*</span>
          </Label>
          <Input
            id="quantity"
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={event => handleInputChange('quantity', event.target.value)}
          />
          {errors.quantity && (
            <Label for="toolQuantityErr" sm={12} className={`${styles.toolFormError} bm-error-red`}>
              {errors.quantity}
            </Label>
          )}
        </FormGroup>
      </div>
      <div className={`${styles.addToolFlexGroup}`}>
        <FormGroup>
          <Label for="purchase-rental">Purchase or Rental</Label>
          <Input
            id="purchase-rental"
            type="select"
            name="purchase-rental"
            value={formData.purchaseRental}
            onChange={handlePurchaseRentalChange}
          >
            <option value="purchase">Purchase</option>
            <option value="rental">Rental</option>
          </Input>
        </FormGroup>
        <FormGroup>
          <Label for="condition">Condition</Label>
          <Input
            id="condition"
            type="select"
            name="condition"
            value={formData.condition}
            onChange={event => handleInputChange('condition', event.target.value)}
          >
            <option value="new">New</option>
            <option value="used">Used</option>
          </Input>
        </FormGroup>
      </div>
      <div className={`${styles.addToolFlexGroup}`}>
        <FormGroup>
          <Label for="from-date">
            Purchase/Rental Date <span className={`${styles.fieldRequired}`}>*</span>
          </Label>
          <Input
            id="from-date"
            type="date"
            name="from-date"
            value={formData.fromDate}
            onChange={event => handleInputChange('fromDate', event.target.value)}
            style={{ colorScheme: darkMode ? 'dark' : 'light' }}
          />
          {errors.fromDate && (
            <Label for="fromDateErr" sm={12} className={`${styles.toolFormError} bm-error-red`}>
              Enter Date
            </Label>
          )}
        </FormGroup>
        <FormGroup>
          <Label for="to-date">Return date (if rented)</Label>
          <Input
            id="to-date"
            type="date"
            name="to-date"
            value={formData.toDate}
            onChange={event => handleInputChange('toDate', event.target.value)}
            disabled={isPurchased}
            style={{ colorScheme: darkMode ? 'dark' : 'light' }}
          />
          {errors.toDate && (
            <Label for="toDateErr" sm={12} className={`${styles.toolFormError} bm-error-red`}>
              Return Date must be after Rental Date
            </Label>
          )}
        </FormGroup>
      </div>
      <div className={`${styles.addToolFlexGroup}`}>
        <FormGroup>
          <Label for="shipping-fee">Shipping Fee excluding taxes (enter 0 if free)</Label>
          <Input
            id="shipping-fee"
            type="number"
            name="shipping-fee"
            placeholder="100.00"
            value={formData.shippingFee}
            onChange={event => handleInputChange('shippingFee', event.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <Label for="taxes">Taxes</Label>
          <Input
            id="taxes"
            type="number"
            name="taxes"
            placeholder="%"
            value={formData.taxes}
            onChange={event => handleInputChange('taxes', event.target.value)}
          />
        </FormGroup>
      </div>

      <FormGroup>
        <Label for="phone-number">
          Contact Phone Number <span style={{ color: '#dc3545' }}>*</span>
        </Label>
        <PhoneInput
          country="us"
          regions={['america', 'europe', 'asia', 'oceania', 'africa']}
          limitMaxLength
          value={formData.phoneNumber}
          onChange={(phone, country) => phoneChange('phoneNumber', phone, country)}
          inputStyle={{
            height: 'auto',
            width: 'calc(100% - 52px)',
            fontSize: 'inherit',
            backgroundColor: darkMode ? '#1a1a2e' : '#fff',
            color: darkMode ? '#fff' : '#000',
            border: getPhoneBorderStyle(phoneHasError, darkMode),
          }}
          buttonStyle={{
            backgroundColor: darkMode ? '#1a1a2e' : '#fff',
            border: getPhoneBorderStyle(phoneHasError, darkMode),
          }}
          dropdownStyle={{
            backgroundColor: darkMode ? '#1a1a2e' : '#fff',
            color: darkMode ? '#fff' : '#000',
          }}
        />
        {phoneHasError && (
          <Label className={`${styles.toolFormError} bm-error-red`}>
            {phoneErrorMsg || 'Please enter a valid phone number for the selected country.'}
          </Label>
        )}
        {errors.phoneNumber && (
          <Label className={`${styles.toolFormError} bm-error-red`}>{errors.phoneNumber}</Label>
        )}
      </FormGroup>
      <FormGroup>
        <Label for="imageUpload">Upload Tool/Equipment Picture</Label>
        <DragAndDrop
          id="imageUpload"
          name="image"
          value={formData.images}
          // onFilesSelected={handleFilesSelected}
          updateUploadedFiles={setUploadedFiles}
        />
        {uploadedFiles.length > 0 && (
          <div className={`${styles.filePreviewContainer}`}>
            {uploadedFiles.map((file, index) => (
              <div key={`${file.name} - ${file.lastModified}`} className="file-preview">
                <img src={URL.createObjectURL(file)} alt={`preview-${index}`} />
                <Button color="danger" onClick={() => handleRemoveFile(index)}>
                  X
                </Button>
              </div>
            ))}
          </div>
        )}
      </FormGroup>

      <FormGroup>
        <Label for="link">Link to Buy/Rent</Label>
        <Input
          id="link"
          type="text"
          name="link"
          placeholder="https://"
          value={formData.link}
          onChange={event => handleInputChange('link', event.target.value)}
        />
      </FormGroup>
      <FormGroup>
        <Label for="description">
          Tool/Equipment Description <span className={`${styles.fieldRequired}`}>*</span>
        </Label>
        <Input
          type="textarea"
          rows="4"
          name="description"
          id="description"
          value={formData.description}
          onChange={event => handleInputChange('description', event.target.value)}
        />
        {errors.description && (
          <Label
            for="toolDescriptionErr"
            sm={12}
            className={`${styles.toolFormError} bm-error-red`}
          >
            {errors.description}
          </Label>
        )}
      </FormGroup>
      <div
        className={`${styles.addToolTotalPrice} ${darkMode ? styles.addToolTotalPriceDark : ''}`}
      >
        <div>Total Price</div>
        <div className={`${styles.totalPriceCalculated}`}>
          {totalPriceWithShipping} {formData.currency}
        </div>
      </div>
      {errors &&
        (errors.name ||
          errors.description ||
          errors.invoice ||
          errors.quantity ||
          errors.unitPrice ||
          errors.toDate ||
          errors.fromDate) && (
          <div className={`${styles.toolFormError} bm-error-red`}> Missing Required Field </div>
        )}
      <div className={`${styles.addToolButtons}`}>
        <Button outline style={darkMode ? boxStyleDark : boxStyle} onClick={handleCancelClick}>
          Cancel
        </Button>
        <Button id="submit-button" style={darkMode ? boxStyleDark : boxStyle}>
          Submit
        </Button>
      </div>
    </Form>
  );
}
