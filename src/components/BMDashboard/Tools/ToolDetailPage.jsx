import { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchToolById } from 'actions/bmdashboard/toolActions';
import { Container, Button } from 'reactstrap';
import { v4 as uuidv4 } from 'uuid';
import ToolModal from './ToolModal';
import './ToolDetailPage.css';

function DetailItem({ label, value }) {
  return (
    <p className="ToolDetailPage__detail_item">
      {label}: <span className="ToolDetailPage__span">{value}</span>
    </p>
  );
}

function LinkItem({ label, value }) {
  return (
    <p className="ToolDetailPage__detail_item">
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
      <ToolModal modal={modal} toggle={toggle} title={title} value={value} />
    </div>
  );
}

function RentalDurationItem({ label, from, to }) {
  return (
    <p className="ToolDetailPage__detail_item">
      {label}: <span className="ToolDetailPage__span">{from}</span> to{' '}
      <span className="ToolDetailPage__span">{to}</span>
    </p>
  );
}

function DashedLineItem() {
  return <div className="ToolDetailPage__dashed_line" />;
}

function ToolDetailPage() {
  const history = useHistory();
  const { toolId } = useParams();

  const tool = useSelector(state => state.tool);

  console.log('Tool', tool);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchToolById(toolId));
  }, []);

  const toolStatus = tool?.logRecord.find(record => record.type === 'Check In');

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
  const formattedLastUpdateDate = formatDateString(tool?.updateRecord[0].date);

  const lastUsedPerson = `${tool?.updateRecord[0].createdBy.firstName} ${tool?.updateRecord[0].createdBy.lastName}`;
  
  const details = [
    { label: 'Belongs to project', value: 'Building 1' },
    { label: 'Class', value: tool?.itemType.category },
    { label: 'Name', value: tool?.itemType.name },
    { label: 'Number', value: tool?.code },
    //TO DO
    { label: 'Ownership', value: tool?.purchaseStatus },
    { label: 'Add Date', value: 'MM - DD - YYYY' },
    { label: 'Rental Duration' },
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
    { label: 'Description', value: tool?.itemType.description },
    { label: 'Dashed Line' },
    { label: 'Current Status', value: tool?.updateRecord[0].condition },
    { label: 'Last Update Date', value: formattedLastUpdateDate },
    { label: 'Last Used Person', value: lastUsedPerson },
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
    <Container className="ToolDetailPage justify-content-center align-items-center mw-80 px-4">
      <header className="ToolDetailPage__header">
        <h1>Tool Detail Page</h1>
      </header>
      <main className="ToolDetailPage__content">
        <p>
          <img src={tool?.imageUrl} alt={tool?.itemType.name} className="ToolDetailPage__image" />
        </p>
        {details.map(renderDetails)}
        <Button outline onClick={() => history.push('/bmdashboard')}>
          Back to List
        </Button>
      </main>
    </Container>
  );
}

export default ToolDetailPage;
