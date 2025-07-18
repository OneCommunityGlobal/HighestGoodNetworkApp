/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable import/order */
import { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchToolById } from '~/actions/bmdashboard/toolActions';
import { Container, Button } from 'reactstrap';
import { v4 as uuidv4 } from 'uuid';
import ToolModal from './ToolModal';
import styles from './ToolDetailPage.module.css';

function DetailItem({ label, value }) {
  return (
    <p className={`${styles.toolDetailPage_detailItem}`}>
      {label}: <span className={`${styles.toolDetailPage_span}`}>{value}</span>
    </p>
  );
}

function LinkItem({ label, value }) {
  return (
    <p className={`${styles.toolDetailPage_detailItem}`}>
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
      <Button onClick={toggle} color="link" className={`${styles.descriptionItemButton}`}>
        {label}
      </Button>
      <ToolModal modal={modal} toggle={toggle} title={title} value={value} />
    </div>
  );
}

function RentalDurationItem({ label, from, to }) {
  return (
    <p className={`${styles.toolDetailPage_detailItem}`}>
      {label}: <span className={`${styles.toolDetailPage_span}`}>{from}</span> to{' '}
      <span className={`${styles.toolDetailPage_span}`}>{to}</span>
    </p>
  );
}

function DashedLineItem() {
  return <div className={`${styles.toolDetailPage_dashedLine}`} />;
}

function ToolDetailPage() {
  const history = useHistory();
  const { toolId } = useParams();

  const tool = useSelector(state => state.tool);

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
  const formattedLastUpdateDate = formatDateString(tool?.updateRecord[0]?.date);

  const lastUsedPerson = `${tool?.updateRecord[0]?.createdBy.firstName} ${tool?.updateRecord[0]?.createdBy.lastName}`;

  const details = [
    { label: 'Belongs to project', value: 'Building 1' },
    { label: 'Class', value: tool?.itemType.category },
    { label: 'Name', value: tool?.itemType.name },
    { label: 'Number', value: tool?.code },
    { label: 'Ownership', value: tool?.purchaseStatus },
    { label: 'Add Date', value: 'MM - DD - YYYY' },
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
    { label: 'Description', value: tool?.itemType.description },
    { label: 'Dashed Line' },
    { label: 'Current Status', value: tool?.updateRecord[0]?.condition },
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
    <Container
      className={`${styles.toolDetailPage} justify-content-center align-items-center mw-80 px-4`}
    >
      <header className={`${styles.toolDetailPage_header}`}>
        <h1>Tool Detail Page</h1>
      </header>
      <main className="ToolDetailPage__content">
        <p>
          <img
            src={tool?.imageUrl}
            alt={tool?.itemType.name}
            className={`${styles.toolDetailPage_image}`}
          />
        </p>
        {details.filter(Boolean).map(renderDetails)}
        <Button outline onClick={() => history.push('/bmdashboard')}>
          Back to List
        </Button>
      </main>
    </Container>
  );
}

export default ToolDetailPage;
