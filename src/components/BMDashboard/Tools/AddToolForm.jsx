import { useState } from 'react';
import { Form, FormGroup, Label, Input, Button } from 'reactstrap';
import DragAndDrop from 'components/common/DragAndDrop/DragAndDrop';
import PhoneInput from 'react-phone-input-2';

import { boxStyle } from 'styles';
import 'react-phone-input-2/lib/style.css';
import './AddToolForm.css';

export default function AddToolForm() {
  const [selectedCategory, setSelectedCategory] = useState('Tool');
  const [selectedName, setSelectedName] = useState('');

  const handleCategoryChange = event => {
    const category = event.target.value;
    setSelectedCategory(category);
    setSelectedName('');
  };

  return (
    <Form className="add-tool-form container">
      <FormGroup>
        <Label for="select-project">Project</Label>
        <Input id="select-project" name="project" type="select">
          <option>Project 1</option>
          <option>Project 2</option>
        </Input>
      </FormGroup>
      <div className="add-tool-flex-group">
        <FormGroup>
          <Label for="select-category">Tool or Equipment</Label>
          <Input
            id="select-category"
            name="category"
            type="select"
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            <option value="Tool">Tool</option>
            <option value="Equipment">Equipment</option>
          </Input>
        </FormGroup>

        <FormGroup>
          <Label for="select-name">Name</Label>
          <Input
            id="select-name"
            name="name"
            type="select"
            value={selectedName}
            onChange={e => setSelectedName(e.target.value)}
          >
            {selectedCategory === 'Tool' ? (
              <>
                <option value="Tool 1">Tool 1</option>
                <option value="Tool 2">Tool 2</option>
              </>
            ) : (
              <>
                <option value="Equipment 1">Equipment 1</option>
                <option value="Equipment 2">Equipment 2</option>
              </>
            )}
          </Input>
        </FormGroup>
      </div>
      <FormGroup>
        <Label for="invoice-number">Invoice Number or ID</Label>
        <Input
          id="invoice-number"
          type="text"
          name="invoice"
          placeholder="Input Invoice No or  ID for the tool or equipment"
        />
      </FormGroup>
      <div className="add-tool-flex-group">
        <FormGroup>
          <Label for="unit-price">Unit Price (excl.taxes & shipping)</Label>
          <Input id="unit-price" type="number" name="unit-price" />
        </FormGroup>
        <FormGroup>
          <Label for="currency">Currency</Label>
          <Input id="currency" type="select" name="currency">
            <option>USD</option>
            <option>EUR</option>
            <option>CAD</option>
          </Input>
        </FormGroup>
        <FormGroup>
          <Label for="quantity">Total quantity</Label>
          <Input id="quantity" type="number" name="quantity" />
        </FormGroup>
      </div>
      <div className="add-tool-flex-group">
        <FormGroup>
          <Label for="purchase-rental">Purchase or Rental</Label>
          <Input id="purchase-rental" type="select" name="purchase-rental">
            <option>Purchase</option>
            <option>Rental</option>
          </Input>
        </FormGroup>
        <FormGroup>
          <Label for="condition">Condition</Label>
          <Input id="condition" type="select" name="condition">
            <option>New</option>
            <option>Used</option>
          </Input>
        </FormGroup>
      </div>
      <div className="add-tool-flex-group">
        <FormGroup>
          <Label for="from-date">Purchase/Rental Date</Label>
          <Input id="from-date" type="date" name="from-date" />
        </FormGroup>
        <FormGroup>
          <Label for="to-date">Return date (if rented)</Label>
          <Input id="to-date" type="date" name="to-date" />
        </FormGroup>
      </div>
      <div className="add-tool-flex-group">
        <FormGroup>
          <Label for="shipping-fee">Shipping Fee excluding taxes (enter 0 if free)</Label>
          <Input id="shipping-fee" type="number" name="shipping-fee" placeholder="100.00" />
        </FormGroup>
        <FormGroup>
          <Label for="taxes">Taxes</Label>
          <Input id="taxes" type="number" name="taxes" placeholder="%" />
        </FormGroup>
      </div>
      {/* <div className="add-tool-supplier-phone">
        <FormGroup>
          <Label for="phone-number">Supplier phone number</Label>
          <Input id="phone-number" type="tel" name="phone-number" placeholder="XXX-XX-XX" />
        </FormGroup>
      </div> */}
      <FormGroup>
        <Label for="phone-number">Supplier Phone Number</Label>
        <PhoneInput id="phone-number" name="phone-number" inputClass="phone-input-style" />
      </FormGroup>
      <FormGroup>
        <Label for="imageUpload">Upload Tool/Equipment Picture</Label>
        <DragAndDrop id="imageUpload" name="imageUpload" />
      </FormGroup>

      <FormGroup>
        <Label for="link">Link to Buy/Rent</Label>
        <Input id="link" type="text" name="link" placeholder="https://" />
      </FormGroup>
      <FormGroup>
        <Label for="description">Tool/Equipment Description</Label>
        <Input type="textarea" name="description" id="description" />
      </FormGroup>
      <div className="add-tool-total-price">
        <div>Total Price</div>
        <div className="total-price-calculated">30.00USD</div>
      </div>
      <div className="add-tool-buttons">
        <Button outline style={boxStyle}>
          Cancel
        </Button>
        <Button style={boxStyle}>Submit</Button>
      </div>
    </Form>
  );
}
