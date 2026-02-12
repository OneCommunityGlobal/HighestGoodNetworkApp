import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Button } from 'reactstrap';
import { useHistory, useParams } from 'react-router-dom';
import { fetchEquipmentById } from '~/actions/bmdashboard/equipmentActions';
import { v4 as uuidv4 } from 'uuid';
import EquipmentModal from '../EquipmentModal';
import styles from './EquipmentDetailPage.module.css';

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

function EquipmentDetail() {
  const history = useHistory();
  const { equipmentId } = useParams();

  const equipment = useSelector(state => state.bmEquipments.singleEquipment);

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchEquipmentById(equipmentId));
  }, [dispatch, equipmentId]);

  const lastLogRecord =
    equipment?.logRecord && equipment.logRecord.length > 0
      ? equipment.logRecord[equipment.logRecord.length - 1]
      : null;
  let currentUsage = null;

  if (lastLogRecord?.type === 'Check In') {
    currentUsage = 'Checked In';
  } else if (lastLogRecord?.type === 'Check Out') {
    currentUsage = 'Checked Out';
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
  const condition = equipment?.condition || latestUpdateRecord?.condition;
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

  const details = [
    { label: 'Belongs to Project', value: formatValue(equipment?.project?.name) },
    { label: 'Class', value: formatValue(equipment?.itemType?.category) },
    { label: 'Name', value: formatValue(equipment?.itemType?.name) },
    { label: 'Number', value: formatValue(equipment?.code) },
    { label: 'Ownership', value: formatValue(equipment?.purchaseStatus) },
    { label: 'Add Date', value: formatDateString(equipment?.createdAt) },
    // Remove 'Rental Duration' from details if 'Ownership' is 'Purchase'
    equipment?.purchaseStatus === 'Purchased' ? null : { label: 'Rental Duration' },
    { label: 'Current Usage', value: formatValue(currentUsage) },
    { label: 'Dashed Line' },
    {
      label: 'Input Invoice No or ID',
      value: formatValue(invoiceNumber),
    },
    {
      label: 'Price',
      value: formatValue(price),
    },
    {
      label: 'Add Condition',
      value: formatValue(condition),
    },
    {
      label: 'Shipping Fee',
      value: formatValue(shippingFee),
    },
    {
      label: 'Taxes',
      value: formatValue(taxes),
    },
    {
      label: 'Supplier Phone Number',
      value: formatValue(supplierPhoneNumber),
    },
    {
      label: 'Link To Buy/Rent',
      value: formatValue(purchaseLink),
    },
    {
      label: 'Description',
      value: formatValue(description),
    },
    { label: 'Dashed Line' },
    { label: 'Current Status', value: formatValue(currentStatus) },
    { label: 'Last Update Date', value: formattedLastUpdateDate },
    {
      label: 'Last Used Person',
      value: formatValue(lastUsedPerson),
    },
    { label: 'Last Used Task', value: formatValue(lastUsedTask) },
    {
      label: 'Asked for a replacement?',
      value: formatValue(replacementRequested),
    },
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

  const renderDashedLineItem = detail => (
    <DashedLineItem key={generateKey()} label={detail.label} />
  );

  const renderDetails = detail => {
    switch (detail.label) {
      case 'Link To Buy/Rent':
        return renderLinkItem(detail);
      case 'Description':
        return renderDescriptionItem(detail);
      case 'Rental Duration':
        return renderRentalDurationItem(detail);
      case 'Dashed Line':
        return renderDashedLineItem(detail);
      default:
        return renderDetailItem(detail);
    }
  };
  return (
    <Container
      className={`${styles.equipmentDetailPage} justify-content-center align-items-center mw-80 px-4`}
    >
      <header className={styles.equipmentDetailPageHeader}>
        <h1>Equipment Detail Page</h1>
      </header>
      <main className={styles.equipmentDetailPageContent}>
        <p>
          <img
            src={equipment?.imageUrl}
            alt={equipment?.itemType?.name || 'Equipment image'}
            className={styles.equipmentDetailPageImage}
          />
        </p>
        {details.filter(Boolean).map(renderDetails)}
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
