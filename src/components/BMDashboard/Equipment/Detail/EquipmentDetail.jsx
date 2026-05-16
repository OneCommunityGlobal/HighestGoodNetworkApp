import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Button, Input, FormGroup, Label, FormFeedback, Spinner } from 'reactstrap';
import { useHistory, useParams } from 'react-router-dom';
import { fetchEquipmentById, updateEquipmentById } from '~/actions/bmdashboard/equipmentActions';
import { fetchBMProjects } from '~/actions/bmdashboard/projectActions';
import { fetchEquipmentTypes } from '~/actions/bmdashboard/invTypeActions';
import { v4 as uuidv4 } from 'uuid';
import EquipmentModal from '../EquipmentModal';
import styles from './EquipmentDetailPage.module.css';

const OWNERSHIP_OPTIONS = ['Purchased', 'Rented'];
const USAGE_OPTIONS = ['Operational', 'Under Maintenance', 'Out of Service'];
const CONDITION_OPTIONS = ['New', 'Used', 'Refurbished'];

function DetailItem({ label, value }) {
  return (
    <p className="EquipmentDetailPage__detail_item">
      {label}: <span className="EquipmentDetailPage__span">{value}</span>
    </p>
  );
}

function LinkItem({ label, value }) {
  return (
    <p className="EquipmentDetailPage__detail_item">
      <a href={value} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    </p>
  );
}

function DescriptionItem({ label, value, title }) {
  const [modal, setModal] = useState(false);
  const toggle = () => setModal(!modal);

  return (
    <div>
      <Button onClick={toggle} color="link" className="descriptionItem_button">
        {label}
      </Button>
      <EquipmentModal modal={modal} toggle={toggle} title={title} value={value} />
    </div>
  );
}

function RentalDurationItem({ label, from, to }) {
  return (
    <p className="EquipmentDetailPage__detail_item">
      {label}: <span className="EquipmentDetailPage__span">{from}</span> to{' '}
      <span className="EquipmentDetailPage__span">{to}</span>
    </p>
  );
}

function DashedLineItem() {
  return <div className="EquipmentDetailPage__dashed_line" />;
}

function EditableDropdown({ label, value, options, onChange, error }) {
  return (
    <FormGroup className={styles.editableField}>
      <Label className={styles.editableFieldLabel}>{label}:</Label>
      <Input
        type="select"
        value={value}
        onChange={e => onChange(e.target.value)}
        className={styles.editableFieldInput}
        invalid={!!error}
      >
        <option value="">-- Select --</option>
        {options.map(opt => (
          <option
            key={typeof opt === 'object' ? opt.value : opt}
            value={typeof opt === 'object' ? opt.value : opt}
          >
            {typeof opt === 'object' ? opt.label : opt}
          </option>
        ))}
      </Input>
      {error && <FormFeedback>{error}</FormFeedback>}
    </FormGroup>
  );
}

function EditableRadioGroup({ label, value, options, onChange, error }) {
  return (
    <FormGroup className={styles.editableField}>
      <Label className={styles.editableFieldLabel}>{label}:</Label>
      <div className={styles.radioGroup}>
        {options.map(opt => (
          <Label key={opt} check className={styles.radioLabel}>
            <Input
              type="radio"
              name={label}
              value={opt}
              checked={value === opt}
              onChange={() => onChange(opt)}
            />{' '}
            {opt}
          </Label>
        ))}
      </div>
      {error && <div className={styles.fieldError}>{error}</div>}
    </FormGroup>
  );
}

function EquipmentDetail() {
  const history = useHistory();
  const { equipmentId } = useParams();
  const dispatch = useDispatch();

  const equipment = useSelector(state => state.bmEquipments.singleEquipment);
  const { loading: updateLoading } = useSelector(state => state.bmEquipments.updateEquipment);
  const projects = useSelector(state => state.bmProjects);
  const equipmentTypes = useSelector(state => state.bmInvTypes.list);

  const [isEditing, setIsEditing] = useState(false);

  const [formValues, setFormValues] = useState({
    project: '',
    equipmentClass: '',
    ownership: '',
    currentUsage: '',
    condition: '',
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    dispatch(fetchEquipmentById(equipmentId));
    dispatch(fetchBMProjects());
    dispatch(fetchEquipmentTypes());
  }, [dispatch, equipmentId]);

  useEffect(() => {
    if (equipment && equipment._id) {
      setFormValues({
        project: equipment.project?._id || '',
        equipmentClass: equipment.equipmentClass || equipment.itemType?.category || '',
        ownership: equipment.purchaseStatus || '',
        currentUsage: equipment.currentUsage || '',
        condition: equipment.condition || '',
      });
    }
  }, [equipment]);

  const projectOptions = useMemo(() => {
    if (!Array.isArray(projects)) return [];
    return projects.map(proj => ({ value: proj._id, label: proj.name }));
  }, [projects]);

  const classOptions = useMemo(() => {
    if (!Array.isArray(equipmentTypes)) return [];
    const categories = [...new Set(equipmentTypes.map(t => t.category).filter(Boolean))];
    return categories;
  }, [equipmentTypes]);

  const lastLogRecord =
    equipment?.logRecord && equipment.logRecord.length > 0
      ? equipment.logRecord[equipment.logRecord.length - 1]
      : null;
  let derivedUsage = null;

  if (lastLogRecord?.type === 'Check In') {
    derivedUsage = 'Checked In';
  } else if (lastLogRecord?.type === 'Check Out') {
    derivedUsage = 'Checked Out';
  }

  const formatValue = value => {
    if (value === 0) return 0;
    if (value === '' || value === null || value === undefined) return 'Not Available';
    return value;
  };

  const formatPersonName = person => {
    if (!person) return null;
    const fullName = `${person.firstName || ''} ${person.lastName || ''}`.trim();
    return fullName || null;
  };

  function formatDateString(dateString) {
    if (!dateString) return 'Not Available';
    const date = new Date(dateString);
    return Number.isNaN(date.getTime()) ? 'Not Available' : date.toLocaleDateString();
  }

  const formattedRentedOnDate = formatDateString(equipment?.rentedOnDate);
  const formattedRentedDueDate = formatDateString(equipment?.rentalDueDate);
  const latestUpdateRecord =
    equipment?.updateRecord && equipment.updateRecord.length > 0
      ? equipment.updateRecord[equipment.updateRecord.length - 1]
      : null;
  const latestPurchaseRecord =
    equipment?.purchaseRecord && equipment.purchaseRecord.length > 0
      ? equipment.purchaseRecord[equipment.purchaseRecord.length - 1]
      : null;

  const formattedLastUpdateDate = formatDateString(latestUpdateRecord?.date);

  const formatCurrency = amount => {
    if (amount === 0 || amount) {
      const numericAmount = Number(amount);
      if (Number.isNaN(numericAmount)) return amount;
      return `$${numericAmount.toLocaleString()}`;
    }
    return null;
  };

  const invoiceNumber =
    latestPurchaseRecord?.invoiceId ||
    latestPurchaseRecord?.invoiceNo ||
    latestPurchaseRecord?.invoice;
  const purchaseLink =
    latestPurchaseRecord?.purchaseLink ||
    equipment?.purchaseLink ||
    equipment?.itemType?.purchaseLink;
  const price = formatCurrency(latestPurchaseRecord?.price ?? equipment?.price ?? equipment?.cost);
  const conditionDisplay = equipment?.condition || latestUpdateRecord?.condition;
  const shippingFee = formatCurrency(
    latestPurchaseRecord?.shippingFee ?? equipment?.shippingFee ?? equipment?.shippingCost,
  );
  const taxes = formatCurrency(
    latestPurchaseRecord?.tax ?? latestPurchaseRecord?.taxes ?? equipment?.taxes,
  );
  const supplierPhoneNumber =
    equipment?.supplierPhoneNumber ||
    latestPurchaseRecord?.supplierPhoneNumber ||
    latestPurchaseRecord?.supplier?.phoneNumber;
  const description = equipment?.itemType?.description || equipment?.description;
  const currentStatus = latestUpdateRecord?.condition;
  const lastUsedPerson = formatPersonName(latestUpdateRecord?.createdBy);
  const lastUsedTask = latestUpdateRecord?.task || latestUpdateRecord?.usedFor;
  const replacementRequested =
    typeof latestUpdateRecord?.replacementRequired === 'boolean'
      ? latestUpdateRecord.replacementRequired
        ? 'Yes'
        : 'No'
      : latestUpdateRecord?.replacementRequired;

  const validate = () => {
    const errors = {};
    if (!formValues.project) errors.project = 'Project is required.';
    if (!formValues.ownership) errors.ownership = 'Ownership is required.';
    if (!formValues.currentUsage) errors.currentUsage = 'Current usage is required.';
    if (!formValues.condition) errors.condition = 'Condition is required.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEdit = () => {
    setIsEditing(true);
    setFormErrors({});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormErrors({});
    if (equipment && equipment._id) {
      setFormValues({
        project: equipment.project?._id || '',
        equipmentClass: equipment.equipmentClass || equipment.itemType?.category || '',
        ownership: equipment.purchaseStatus || '',
        currentUsage: equipment.currentUsage || '',
        condition: equipment.condition || '',
      });
    }
  };

  const handleSave = async () => {
    if (!validate()) return;

    const payload = {
      projectId: formValues.project,
      equipmentClass: formValues.equipmentClass,
      purchaseStatus: formValues.ownership,
      currentUsage: formValues.currentUsage,
      condition: formValues.condition,
    };

    try {
      await dispatch(updateEquipmentById(equipmentId, payload));
      setIsEditing(false);
      setFormErrors({});
    } catch {
      // error already handled by the action (toast shown)
    }
  };

  const updateField = (field, value) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const details = [
    { label: 'Name', value: formatValue(equipment?.itemType?.name) },
    { label: 'Number', value: formatValue(equipment?.code) },
    { label: 'Add Date', value: formatDateString(equipment?.createdAt) },
    equipment?.purchaseStatus === 'Purchased' ? null : { label: 'Rental Duration' },
    { label: 'Dashed Line' },
    { label: 'Input Invoice No or ID', value: formatValue(invoiceNumber) },
    { label: 'Price', value: formatValue(price) },
    { label: 'Add Condition', value: formatValue(conditionDisplay) },
    { label: 'Shipping Fee', value: formatValue(shippingFee) },
    { label: 'Taxes', value: formatValue(taxes) },
    { label: 'Supplier Phone Number', value: formatValue(supplierPhoneNumber) },
    { label: 'Link To Buy/Rent', value: formatValue(purchaseLink) },
    { label: 'Description', value: formatValue(description) },
    { label: 'Dashed Line' },
    { label: 'Current Status', value: formatValue(currentStatus) },
    { label: 'Last Update Date', value: formattedLastUpdateDate },
    { label: 'Last Used Person', value: formatValue(lastUsedPerson) },
    { label: 'Last Used Task', value: formatValue(lastUsedTask) },
    { label: 'Asked for a replacement?', value: formatValue(replacementRequested) },
  ];

  const generateKey = () => uuidv4();

  const renderDetailItem = detail => (
    <DetailItem key={generateKey()} label={detail.label} value={detail.value} />
  );

  const renderLinkItem = detail => {
    if (detail.value === 'Not Available') {
      return renderDetailItem(detail);
    }
    return <LinkItem key={generateKey()} label={detail.label} value={detail.value} />;
  };

  const renderRentalDurationItem = detail => (
    <RentalDurationItem
      key={generateKey()}
      label={detail.label}
      from={formattedRentedOnDate}
      to={formattedRentedDueDate}
    />
  );

  const renderDescriptionItem = detail => {
    if (detail.value === 'Not Available') {
      return renderDetailItem(detail);
    }
    return (
      <DescriptionItem
        key={generateKey()}
        label={detail.label}
        value={detail.value}
        title={equipment?.itemType?.name || 'Description'}
      />
    );
  };

  const renderDashedLineItem = () => <DashedLineItem key={generateKey()} />;

  const renderDetails = detail => {
    switch (detail.label) {
      case 'Link To Buy/Rent':
        return renderLinkItem(detail);
      case 'Description':
        return renderDescriptionItem(detail);
      case 'Rental Duration':
        return renderRentalDurationItem(detail);
      case 'Dashed Line':
        return renderDashedLineItem();
      default:
        return renderDetailItem(detail);
    }
  };

  const renderEditableFields = () => (
    <div className={styles.editableSection}>
      <EditableDropdown
        label="Belongs to Project"
        value={formValues.project}
        options={projectOptions}
        onChange={val => updateField('project', val)}
        error={formErrors.project}
      />
      <EditableDropdown
        label="Class"
        value={formValues.equipmentClass}
        options={classOptions}
        onChange={val => updateField('equipmentClass', val)}
        error={formErrors.equipmentClass}
      />
      <EditableRadioGroup
        label="Ownership"
        value={formValues.ownership}
        options={OWNERSHIP_OPTIONS}
        onChange={val => updateField('ownership', val)}
        error={formErrors.ownership}
      />
      <EditableDropdown
        label="Current Usage"
        value={formValues.currentUsage}
        options={USAGE_OPTIONS}
        onChange={val => updateField('currentUsage', val)}
        error={formErrors.currentUsage}
      />
      <EditableDropdown
        label="Condition"
        value={formValues.condition}
        options={CONDITION_OPTIONS}
        onChange={val => updateField('condition', val)}
        error={formErrors.condition}
      />
    </div>
  );

  const renderViewFields = () => (
    <>
      <DetailItem label="Belongs to Project" value={formatValue(equipment?.project?.name)} />
      <DetailItem
        label="Class"
        value={formatValue(equipment?.equipmentClass || equipment?.itemType?.category)}
      />
      <DetailItem label="Ownership" value={formatValue(equipment?.purchaseStatus)} />
      <DetailItem
        label="Current Usage"
        value={formatValue(equipment?.currentUsage || derivedUsage)}
      />
      <DetailItem label="Condition" value={formatValue(equipment?.condition)} />
    </>
  );

  return (
    <Container
      className={`${styles.equipmentDetailPage} justify-content-center align-items-center mw-80 px-4`}
    >
      <header className={styles.equipmentDetailPageHeader}>
        <h1>Equipment Detail Page</h1>
        {!isEditing && (
          <Button color="primary" className={styles.editBtn} onClick={handleEdit}>
            Edit
          </Button>
        )}
      </header>
      <main className={styles.equipmentDetailPageContent}>
        <p>
          <img
            src={equipment?.imageUrl}
            alt={equipment?.itemType?.name || 'Equipment image'}
            className={styles.equipmentDetailPageImage}
          />
        </p>

        {isEditing ? renderEditableFields() : renderViewFields()}

        {details.filter(Boolean).map(renderDetails)}

        {isEditing && (
          <div className={styles.actionButtons}>
            <Button
              color="success"
              className={styles.saveBtn}
              onClick={handleSave}
              disabled={updateLoading}
            >
              {updateLoading ? (
                <>
                  <Spinner size="sm" /> Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
            <Button
              color="secondary"
              outline
              className={styles.cancelBtn}
              onClick={handleCancel}
              disabled={updateLoading}
            >
              Cancel
            </Button>
          </div>
        )}

        <Button
          className={styles.backBtn}
          style={{ color: 'black', borderWidth: '2px', borderRadius: '9px' }}
          outline
          onClick={() => history.push('/bmdashboard/equipment')}
        >
          Back to List
        </Button>
      </main>
    </Container>
  );
}

export default EquipmentDetail;
