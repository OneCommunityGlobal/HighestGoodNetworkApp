import { useState, useEffect } from 'react';
import { Form, FormGroup, Label, Input, Button } from 'reactstrap';
import DragAndDrop from 'components/common/DragAndDrop/DragAndDrop';
import { PhoneInput } from 'components/common/PhoneInput/PhoneInput';
import { toast } from 'react-toastify';

import { useDispatch, useSelector } from 'react-redux';
import Joi from 'joi';
import { boxStyle } from 'styles';
import './AddToolForm.css';

// import { fetchInvUnits } from '../../../actions/bmdashboard/invUnitActions';

import {
  fetchToolTypes,
  postBuildingToolType,
  resetPostBuildingToolTypeResult,
} from '../../../actions/bmdashboard/invTypeActions';

// import { addTools } from 'actions/bmdashboard/toolActions';

const initialFormState = {
  project: 'Project1',
  name: '',
  invoice: '',
  unitPrice: '',
  currency: 'USD',
  quantity: '',
  purchaseRental: 'Purchase',
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

export default function AddToolForm() {
  const [formData, setFormData] = useState(initialFormState);
  const [isPurchased, setIsPurchased] = useState(true);
  const [areaCode, setAreaCode] = useState('1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]); // log here for correct state snapshot (will show each render)
  // const [validationError, setValidationError] = useState('');
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const postBuildingInventoryResult = useSelector(state => state.bmInvTypes.postedResult);

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

  const validationObj = {
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
  };

  const schema = Joi.object(validationObj).unknown();

  const validate = data => {
    const result = schema.validate(data, { abortEarly: false });
    if (!result.error) return null;

    const errorMessages = {};
    result.error.details.forEach(detail => {
      errorMessages[detail.path[0]] = detail.message;
    });
    return errorMessages;
  };

  const handleInputChange = (name, value) => {
    // const inputName = name;
    // const inputValue = value;

    // const errorsList = {};
    // const validation = validationObj[inputName].validate(inputValue);
    // if (validation.error) {
    //   validation.error.details.forEach(error => {
    //     errorsList[inputName] = error.message;
    //     // errorsList[detail.path[0]] = detail.message;
    //   });
    // } else {
    //   errorsList[inputName] = '';
    // }

    // setErrors({ ...errors, ...errorsList });
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePurchaseRentalChange = event => {
    const selectedOption = event.target.value;
    if (selectedOption === 'purchase') {
      setIsPurchased(true);
    } else {
      setIsPurchased(false);
    }
    handleInputChange('purchaseRental', selectedOption);
  };

  const { unitPrice, quantity, taxes, shippingFee } = formData;

  const calculateTotalPrice = (price, totalQuantity) => price * totalQuantity;
  const calculateTotalTax = (taxPercentage, totalPrice) => (taxPercentage * totalPrice) / 100;

  const totalPrice = calculateTotalPrice(unitPrice, quantity);
  const totalTax = calculateTotalTax(Number(taxes), totalPrice);
  const totalPriceWithShipping = (totalPrice + totalTax + Number(shippingFee)).toFixed(2);

  const handleSubmit = async event => {
    event.preventDefault();
    // eslint-disable-next-line no-console
    // console.log(errors);
    // const validation = schema.validate(formData);
    const validationErrors = validate(formData);
    setErrors(validationErrors || {});

    if (validationErrors) {
      return;
    }
    // if (!validation.error) {
    const imageURL = uploadedFiles.map(file => URL.createObjectURL(file));
    const updatedFormData = {
      ...formData,
      category: 'Tool',
      // images: uploadedFiles,
      images: imageURL[0],
      areaCode,
      phoneNumber,
      totalPriceWithShipping,
    };
    // eslint-disable-next-line no-console
    dispatch(postBuildingToolType(updatedFormData));
    setFormData(initialFormState);
    setUploadedFiles([]);
    setAreaCode(1);
    setPhoneNumber('');
    // }
    // TODO: validate form data
    // TODO: submit data to API
  };

  const handleCancelClick = () => {
    setFormData(initialFormState);
    setUploadedFiles([]);
    setAreaCode(1);
    setPhoneNumber('');
  };

  const handleRemoveFile = index => {
    setUploadedFiles(prevUploadedFiles => prevUploadedFiles.filter((file, i) => i !== index));
  };

  return (
    <Form className="add-tool-form container" onSubmit={handleSubmit}>
      {/* <FormGroup>
        <Label for="select-project">Project</Label>
        <Input
          id="select-project"
          name="project"
          type="select"
          value={formData.project}
          onChange={event => handleInputChange('project', event.target.value)}
        >
          <option value="Project1">Project 1</option>
          <option value="Project2">Project 2</option>
        </Input>
      </FormGroup> */}
      <FormGroup>
        <Label for="tool">
          Tool name <span className="field-required">*</span>
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
          <Label for="toolNameErr" sm={12} className="toolFormError">
            {/* Tool &quot;name&quot; length must be at least 4 characters that are not space. */}
            {errors.name}
          </Label>
        )}
      </FormGroup>
      <FormGroup>
        <Label for="invoice-number">
          Invoice Number or ID <span className="field-required">*</span>
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
          <Label for="toolInvoiceErr" sm={12} className="toolFormError">
            {/* Tool &quot;description&quot; length must be at least 4 characters that are not space. */}
            {errors.invoice}
          </Label>
        )}
      </FormGroup>
      <div className="add-tool-flex-group">
        <FormGroup>
          <Label for="unit-price">
            Unit Price (excl.taxes & shipping) <span className="field-required">*</span>
          </Label>
          <Input
            id="unit-price"
            type="number"
            name="unit-price"
            value={formData.unitPrice}
            onChange={event => handleInputChange('unitPrice', event.target.value)}
          />
          {errors.unitPrice && (
            <Label for="toolUnitPriceErr" sm={12} className="toolFormError">
              {/* Tool &quot;description&quot; length must be at least 4 characters that are not space. */}
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
            Total quantity <span className="field-required">*</span>
          </Label>
          <Input
            id="quantity"
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={event => handleInputChange('quantity', event.target.value)}
          />
          {errors.quantity && (
            <Label for="toolQuantityErr" sm={12} className="toolFormError">
              {/* Tool &quot;description&quot; length must be at least 4 characters that are not space. */}
              {errors.quantity}
            </Label>
          )}
        </FormGroup>
      </div>
      <div className="add-tool-flex-group">
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
      <div className="add-tool-flex-group">
        <FormGroup>
          <Label for="from-date">Purchase/Rental Date</Label>
          <Input
            id="from-date"
            type="date"
            name="from-date"
            value={formData.fromDate}
            onChange={event => handleInputChange('fromDate', event.target.value)}
          />
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
          />
        </FormGroup>
      </div>
      <div className="add-tool-flex-group">
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

      {/* <PhoneInput onPhoneNumberChange={handlePhoneNumberChange} /> */}

      <PhoneInput
        areaCode={areaCode}
        setAreaCode={setAreaCode}
        phoneNumber={phoneNumber}
        setPhoneNumber={setPhoneNumber}
      />

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
          <div className="file-preview-container">
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
          Tool/Equipment Description <span className="field-required">*</span>
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
          <Label for="toolDescriptionErr" sm={12} className="toolFormError">
            {/* Tool &quot;description&quot; length must be at least 4 characters that are not space. */}
            {errors.description}
          </Label>
        )}
      </FormGroup>
      <div className="add-tool-total-price">
        <div>Total Price</div>
        <div className="total-price-calculated">
          {totalPriceWithShipping} {formData.currency}
        </div>
      </div>
      {errors &&
        (errors.name ||
          errors.description ||
          errors.invoice ||
          errors.quantity ||
          errors.unitPrice) && <div className="toolFormError"> Missing Required Field </div>}
      <div className="add-tool-buttons">
        <Button outline style={boxStyle} onClick={handleCancelClick}>
          Cancel
        </Button>
        <Button
          id="submit-button"
          style={boxStyle}
          // disabled={!formData.name || !formData.description}
        >
          Submit
        </Button>
      </div>
    </Form>
  );
}
