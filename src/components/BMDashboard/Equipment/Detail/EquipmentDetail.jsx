import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Button } from 'reactstrap';
import { useHistory, useParams } from 'react-router-dom';
import { fetchToolById } from 'actions/bmdashboard/toolActions';
import { fetchEquipmentById } from 'actions/bmdashboard/equipmentActions';
import { v4 as uuidv4 } from 'uuid';
import EquipmentModal from '../EquipmentModal';
import '../EquipmentDetailPage.css';

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

  const tool = useSelector(state => state.tool);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchToolById(equipmentId));
  }, []);

  useEffect(() => {
    dispatch(fetchEquipmentById(equipmentId));
  }, []);

  const toolStatus = true;

  let toolLogRecord;

  if (toolStatus) {
    toolLogRecord = 'Checked In';
  } else {
    toolLogRecord = 'Checked out';
  }

  function formatDateString(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  const formattedRentedOnDate = formatDateString(tool?.rentedOnDate);
  const formattedRentedDueDate = formatDateString(tool?.rentalDueDate);

  const details = [
    { label: 'Belongs to project', value: 'Building 1' },
    { label: 'Class', value: 'Equipment' },
    { label: 'Name', value: 'Back Hoe' },
    { label: 'Number', value: '007' },
    { label: 'Ownership', value: 'Owned' },
    { label: 'Add Date', value: '02 - 29 - 2024' },
    // Remove 'Rental Duration' from details if 'Ownership' is 'Purchase'
    tool?.purchaseStatus === 'Purchase' ? null : { label: 'Rental Duration' },
    { label: 'Current Usage', value: toolLogRecord },
    { label: 'Dashed Line' },
    { label: 'Input Invoice No or ID', value: 'No123ABC' },
    { label: 'Price', value: '150USD' },
    { label: 'Add Condition', value: 'New' },
    { label: 'Shipping Fee', value: '25USD' },
    { label: 'Taxes', value: '15USD' },
    { label: 'Supplier Phone Number', value: '555-33-3333' },
    {
      label: 'Link To Buy/Rent',
      value: 'https://www.homedepot.com/',
    },
    { label: 'Description', value: 'Testing Description' },
    { label: 'Dashed Line' },
    { label: 'Current Status', value: 'Tested' },
    { label: 'Last Update Date', value: '03-01-2024' },
    { label: 'Last Used Person', value: 'Jae' },
    { label: 'Last Used Task', value: 'Garden clean up' },
    { label: 'Asked for a replacement?', value: 'No' },
  ];

  const generateKey = () => uuidv4();

  const renderDetailItem = detail => (
    <DetailItem key={generateKey()} label={detail.label} value={detail.value} />
  );

  const renderLinkItem = detail => (
    <LinkItem key={generateKey()} label={detail.label} value={detail.value} />
  );

  const renderRentalDurationItem = detail => (
    <RentalDurationItem
      key={generateKey()}
      label={detail.label}
      from={formattedRentedOnDate}
      to={formattedRentedDueDate}
    />
  );

  const renderDescriptionItem = detail => (
    <DescriptionItem
      key={generateKey()}
      label={detail.label}
      value={detail.value}
      title={tool?.itemType.name}
    />
  );

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
    <Container className="EquipmentDetailPage justify-content-center align-items-center mw-80 px-4">
      <header className="EquipmentDetailPage__header">
        <h1>Equipment Detail Page</h1>
      </header>
      <main className="EquipmentDetailPage__content">
        <p>
          <img src={tool?.imageUrl} alt="" className="EquipmentDetailPage__image" />
        </p>
        {details.filter(Boolean).map(renderDetails)}
        <Button outline onClick={() => history.push('/bmdashboard/equipment')}>
          Back to List
        </Button>
      </main>
    </Container>
  );
}

export default EquipmentDetail;
