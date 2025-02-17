import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
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
import PhoneInput from 'react-phone-input-2';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import Joi from 'joi';
import {
  fetchMaterialTypes,
  postBuildingInventoryType,
  resetPostBuildingInventoryTypeResult,
} from '../../../actions/bmdashboard/invTypeActions';
import { fetchInvUnits } from '../../../actions/bmdashboard/invUnitActions';
import { boxStyle } from '../../../styles';
import './AddMaterial.css';
import DragAndDrop from '../../common/DragAndDrop/DragAndDrop';

const initialFormState = {
  // project: 'Project1',
  name: '',
  invoice: '',
  unitPrice: '',
  currency: 'USD',
  quantity: '',
  unit: '',
  purchaseDate: '',
  shippingFee: '',
  taxes: '',
  areaCode: '+1',
  phoneNumber: '',
  images: [],
  link: '',
  description: '',
};

export default function AddMaterialForm() {
  const [formData, setFormData] = useState(initialFormState);
  const [areaCode, setAreaCode] = useState('1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]); // log here for correct state snapshot (will show each render)
  const [errors, setErrors] = useState({});
  const history = useHistory();
  const dispatch = useDispatch();
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const postBuildingInventoryResult = useSelector(state => state.bmInvTypes.postedResult);
  const materialTypes = useSelector(state => state.bmInvTypes.list);
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [newMaterial, setNewMaterial] = useState('');
  const [showTextbox, setShowTextbox] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const units = useSelector(state => state.bmInvUnits.list);
  // console.log(materialTypes);
  // console.log(units)
  const createdBy = useSelector(state => state.auth.user.email);

  useEffect(() => {
    dispatch(fetchMaterialTypes());
    dispatch(fetchInvUnits());
  }, [dispatch]);

  useEffect(() => {
    if (postBuildingInventoryResult?.error === true) {
      toast.error(`${postBuildingInventoryResult?.result}`);
      dispatch(fetchMaterialTypes());
      dispatch(resetPostBuildingInventoryTypeResult());
    } else if (postBuildingInventoryResult?.result !== null) {
      toast.success(
        `Created a new Material Type "${postBuildingInventoryResult?.result.name}" successfully`,
      );
      dispatch(fetchMaterialTypes());
      dispatch(resetPostBuildingInventoryTypeResult());
      setShowNavigationModal(true);
    }
  }, [postBuildingInventoryResult, dispatch]);

  const handleViewInventory = () => {
    setShowNavigationModal(false);
    history.push('/bmdashboard/inventorytypes');
  };

  const handleStartPurchase = () => {
    setShowNavigationModal(false);
    history.push('/bmdashboard/materials/purchase');
  };

  const handleStayHere = () => {
    setShowNavigationModal(false);
  };

  const validationObj = {
    name: Joi.string()
      .min(3)
      .max(15)
      .required(),
    unit: Joi.string()
      .min(1)
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
    purchaseDate: Joi.date().required(),
    createdBy,
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
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const { unitPrice, quantity, taxes, shippingFee } = formData;

  const calculateTotalPrice = (price, totalQuantity) => price * totalQuantity;
  const calculateTotalTax = (taxPercentage, totalPrice) => (taxPercentage * totalPrice) / 100;

  const totalPrice = calculateTotalPrice(unitPrice, quantity);
  const totalTax = calculateTotalTax(Number(taxes), totalPrice);
  const totalPriceWithShipping = (totalPrice + totalTax + Number(shippingFee)).toFixed(2);

  const phoneChange = (name, phone) => {
    setFormData(prevData => ({
      ...prevData,
      [name]: phone,
    }));
  };

  const handleSubmit = async event => {
    event.preventDefault();
    const validationErrors = validate(formData);
    setErrors(validationErrors || {});

    if (validationErrors) {
      return;
    }
    const imageURL = uploadedFiles.map(file => URL.createObjectURL(file));
    const updatedFormData = {
      ...formData,
      category: 'Material',
      images: imageURL[0],
      areaCode,
      phoneNumber,
      totalPriceWithShipping,
    };
    dispatch(postBuildingInventoryType(updatedFormData));
    setSelectedMaterial('');
    setSelectedUnit('');
    setNewMaterial(''); // Reset newMaterial
    setShowTextbox(false);
    setFormData(initialFormState);
    setUploadedFiles([]);
    setAreaCode(1);
    setPhoneNumber('');
    // }
    // TODO: validate form data
    // TODO: submit data to API
  };

  const handleCancelClick = () => {
    setSelectedMaterial('');
    setSelectedUnit('');
    setFormData(initialFormState);
    setUploadedFiles([]);
    setAreaCode(1);
    setPhoneNumber('');
  };

  const handleRemoveFile = index => {
    setUploadedFiles(prevUploadedFiles => prevUploadedFiles.filter((file, i) => i !== index));
  };

  const handleMaterialChange = e => {
    const { value } = e.target;

    if (value === 'other') {
      setShowTextbox(true);
      setSelectedMaterial('');
      setSelectedUnit('');
      handleInputChange('unit', '');
      handleInputChange('name', '');
    } else {
      setShowTextbox(false);
      const selectedMaterialData = materialTypes.find(material => material._id === value);
      setSelectedMaterial(value);
      const materialName = selectedMaterialData?.name || '';
      const materialUnit = selectedMaterialData?.unit || '';
      handleInputChange('name', materialName);
      setSelectedUnit(materialUnit);
      handleInputChange('unit', materialUnit);
    }
  };

  const handleUnitChange = e => {
    const { value } = e.target;
    if (value === 'other') {
      setSelectedUnit(value);
      setNewUnit('');
    } else {
      setSelectedUnit(value);
      handleInputChange('unit', value);
    }
  };

  return (
    <>
      <main className="add-material-container">
        <header className="add-material-header">
          <h2>ADD TYPE: Material</h2>
        </header>

        <Form className="add-material-form container" onSubmit={handleSubmit}>
          <FormGroup>
            <Label for="material-select">
              Select Material <span className="field-required">*</span>
            </Label>
            <Input
              id="material-select"
              type="select"
              value={selectedMaterial || (showTextbox ? 'other' : '')}
              onChange={handleMaterialChange}
            >
              <option value="">Select a Material</option>
              {materialTypes.map(material => (
                <option key={material._id} value={material._id}>
                  {material.name}
                </option>
              ))}
              <option value="other">Other</option>
            </Input>
          </FormGroup>
          {showTextbox && (
            <FormGroup>
              <Label for="new-material">Enter New Material</Label>
              <Input
                id="new-material"
                type="text"
                value={newMaterial}
                onChange={e => {
                  const { value } = e.target;
                  setNewMaterial(value); // Set the textbox value
                  handleInputChange('name', value); // Update formData.name
                }}
                placeholder="Enter new material name"
              />
              {errors.name && (
                <Label for="materialNameErr" sm={12} className="materialFormError">
                  {/* Tool &quot;name&quot; length must be at least 4 characters that are not space. */}
                  {errors.name}
                </Label>
              )}
            </FormGroup>
          )}
          <FormGroup>
            <Label for="unit-select">
              Select Unit <span className="field-required">*</span>
            </Label>
            <Input
              id="unit-select"
              type="select"
              value={selectedUnit}
              onChange={handleUnitChange}
              disabled={!showTextbox && !!selectedMaterial}
            >
              <option value="">Select a Unit</option>
              {units.map((unit, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <option key={index} value={unit.unit}>
                  {unit.unit}
                </option>
              ))}
              <option value="other">Other</option>
            </Input>
          </FormGroup>
          {selectedUnit === 'other' && (
            <FormGroup>
              <Label for="new-unit">Enter New Unit</Label>
              <Input
                id="new-unit"
                type="text"
                value={newUnit}
                onChange={e => {
                  const { value } = e.target;
                  setNewUnit(value); // Set the textbox value
                  handleInputChange('unit', value); // Update formData.name
                }}
                placeholder="Enter new unit name"
              />
              {errors.unit && (
                <Label for="materialUnitErr" sm={12} className="materialFormError">
                  {/* Tool &quot;name&quot; length must be at least 4 characters that are not space. */}
                  {errors.unit}
                </Label>
              )}
            </FormGroup>
          )}
          <FormGroup>
            <Label for="invoice-number">
              Invoice Number or ID <span className="field-required">*</span>
            </Label>
            <Input
              id="invoice-number"
              type="text"
              name="invoice"
              placeholder="Input Invoice No or ID for the material"
              value={formData.invoice}
              onChange={event => handleInputChange('invoice', event.target.value)}
            />
            {errors.invoice && (
              <Label for="materialInvoiceErr" sm={12} className="materialFormError">
                {errors.invoice}
              </Label>
            )}
          </FormGroup>
          <div className="add-material-flex-group">
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
                <Label for="materialUnitPriceErr" sm={12} className="materialFormError">
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
                <Label for="materialQuantityErr" sm={12} className="materialFormError">
                  {errors.quantity}
                </Label>
              )}
            </FormGroup>
          </div>
          <div className="add-material-flex-group">
            <FormGroup>
              <Label for="purchase-date">
                Purchase Date <span className="field-required">*</span>
              </Label>
              <Input
                id="purchase-date"
                type="date"
                name="purchase-date"
                value={formData.purchaseDate}
                onChange={event => handleInputChange('purchaseDate', event.target.value)}
              />
              {errors.purchaseDate && (
                <Label for="purchaseDateErr" sm={12} className="materialFormError">
                  Enter Date
                </Label>
              )}
            </FormGroup>
          </div>
          <div className="add-material-flex-group">
            <FormGroup>
              <Label for="shipping-fee">Shipping Fee excluding taxes (enter 0 if free)</Label>
              <Input
                id="shipping-fee"
                type="number"
                name="shipping-fee"
                placeholder="0.00"
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

          <PhoneInput
            country="US"
            regions={['america', 'europe', 'asia', 'oceania', 'africa']}
            limitMaxLength="true"
            value={formData.phoneNumber}
            onChange={phone => phoneChange('phoneNumber', phone)}
            inputStyle={{ height: 'auto', width: '40%', fontSize: 'inherit' }}
          />
          <FormGroup>
            <Label for="imageUpload">Upload Material Picture</Label>
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
            <Label for="link">Link to Buy</Label>
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
              Material Description <span className="field-required">*</span>
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
              <Label for="materialDescriptionErr" sm={12} className="materialFormError">
                {/* Tool &quot;description&quot; length must be at least 4 characters that are not space. */}
                {errors.description}
              </Label>
            )}
          </FormGroup>
          <div className="add-material-total-price">
            <div>Total Price</div>
            <div className="total-price-calculated">
              {totalPriceWithShipping} {formData.currency}
            </div>
          </div>
          <div className="add-material-createdby">
            <div>Created By</div>
            <div className="createdby">{createdBy}</div>
          </div>
          {errors &&
            (errors.name ||
              errors.description ||
              errors.invoice ||
              errors.quantity ||
              errors.unitPrice ||
              errors.toDate ||
              errors.fromDate) && <div className="materialFormError"> Missing Required Field </div>}
          <div className="add-material-buttons">
            <Button outline style={boxStyle} onClick={handleCancelClick}>
              Cancel
            </Button>
            <Button id="submit-button" style={boxStyle}>
              Submit
            </Button>
          </div>
        </Form>
      </main>
      <Modal
        isOpen={showNavigationModal}
        toggle={() => setShowNavigationModal(false)}
        className="navigation-modal"
      >
        <ModalHeader toggle={() => setShowNavigationModal(false)}>
          Material Added Successfully - What's Next?
        </ModalHeader>
        <ModalBody>
          <div className="navigation-options">
            <div className="option-container">
              <h5>View All Inventory Types</h5>
              <p>View your just added material, including all available inventory types</p>
              <Button color="primary" onClick={handleViewInventory}>
                View All Inventory Types
              </Button>
            </div>
            <div className="option-container">
              <h5>Start Material Purchase</h5>
              <p>Initiate a purchase request to be approved by project admin</p>
              <Button color="success" onClick={handleStartPurchase}>
                Start Purchase Request
              </Button>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={handleStayHere}>
            Stay on Current Page
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
