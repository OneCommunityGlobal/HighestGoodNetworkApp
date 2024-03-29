import { useState } from 'react';
import { Form, FormGroup, Label, Input, Button } from 'reactstrap';
import DragAndDrop from 'components/common/DragAndDrop/DragAndDrop';
import { PhoneInput } from 'components/common/PhoneInput/PhoneInput';

import { boxStyle } from 'styles';
import './AddToolForm.css';

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

  const handleInputChange = (name, value) => {
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

  const handleSubmit = event => {
    event.preventDefault();
    // const updatedFormData = {
    //   ...formData,
    //   images: uploadedFiles,
    //   areaCode,
    //   phoneNumber,
    // };
    // console.log('Data', updatedFormData);
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
      <FormGroup>
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
      </FormGroup>
      <FormGroup>
        <Label for="tool">Tool name</Label>
        <Input
          id="tool"
          type="text"
          name="tool"
          placeholder="Enter tool name."
          value={formData.name}
          onChange={event => handleInputChange('name', event.target.value)}
        />
      </FormGroup>
      <FormGroup>
        <Label for="invoice-number">Invoice Number or ID</Label>
        <Input
          id="invoice-number"
          type="text"
          name="invoice"
          placeholder="Input Invoice No or  ID for the tool or equipment"
          value={formData.invoice}
          onChange={event => handleInputChange('invoice', event.target.value)}
        />
      </FormGroup>
      <div className="add-tool-flex-group">
        <FormGroup>
          <Label for="unit-price">Unit Price (excl.taxes & shipping)</Label>
          <Input
            id="unit-price"
            type="number"
            name="unit-price"
            value={formData.unitPrice}
            onChange={event => handleInputChange('unitPrice', event.target.value)}
          />
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
          <Label for="quantity">Total quantity</Label>
          <Input
            id="quantity"
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={event => handleInputChange('quantity', event.target.value)}
          />
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
        <Label for="description">Tool/Equipment Description</Label>
        <Input
          type="textarea"
          rows="4"
          name="description"
          id="description"
          value={formData.description}
          onChange={event => handleInputChange('description', event.target.value)}
        />
      </FormGroup>
      <div className="add-tool-total-price">
        <div>Total Price</div>
        <div className="total-price-calculated">
          {totalPriceWithShipping} {formData.currency}
        </div>
      </div>
      <div className="add-tool-buttons">
        <Button outline style={boxStyle} onClick={handleCancelClick}>
          Cancel
        </Button>
        <Button id="submit-button" style={boxStyle}>
          Submit
        </Button>
      </div>
    </Form>
  );
}
