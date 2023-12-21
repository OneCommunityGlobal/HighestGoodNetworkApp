import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchToolById } from 'actions/bmdashboard/toolActions';
import { Container, Button } from 'reactstrap';
import { v4 as uuidv4 } from 'uuid';
import ToolModal from './ToolModal';
import './ToolDetailPage.css';

// TO DO: add fields to buildingtool model and extract them here, replace dummy tool

const dummyTool = {
  toolId: 1,
  image:
    'https://www.bhg.com/thmb/pUCCsrlUI40Ikl-h7_xtpm1cEEg=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/gas-2-stroke-cycle-backpack-leaf-blower-with-tube-throttle-1fc228c0ed8b48ce9efe2353c9cadcaa.jpg',
  title: 'leafblower',
  projectId: 123,
  class: 'tool',
  number: '1',
  ownership: 'rental',
  addDate: '12-12-20',
  returnDate: '1-30-21',
  currentUsage: 'inUse',
  invoiceNo: '12345abcde',
  price: '100$',
  condition: 'new',
  shippingFee: '0$',
  taxes: '6$',
  supplierPhoneNo: '111-111-1111',
  linkToBuy:
    'https://www.homedepot.com/b/Outdoors-Outdoor-Power-Equipment-Leaf-Blowers/N-5yc1vZbxav',
  description: 'ECHO PB-580T gas blower has a tube throttle with variable speed',
  currentStatus: 'working well',
  lastUpdated: 'MM-DD-YYYY',
  lastUsedBy: 'Jane Doe',
  lastUsedTask: 'garden-cleaning',
  askedForReplacement: false,
};

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

function ToolDetailPage() {
  const history = useHistory();
  const tool = useSelector(state => state.tool);

  console.log('Tool', tool);
  
  const toolStatus = tool.logRecord.find(record => record.type === 'Check In');
  
  let toolLogRecord;
  
  if (toolStatus) {
    toolLogRecord = 'Checked In';
  } else {
    toolLogRecord = 'Checked out';
  };

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchToolById('657b3a082d8cc6bd67704ea2'));
  }, []);

  const details = [
    { label: 'Belongs to project', value: 'Building 1' },
    { label: 'Class', value: tool.itemType?.category },
    { label: 'Name', value: tool.itemType?.name },
    { label: 'Number', value: tool.code },
    { label: 'Ownership', value: tool.purchaseStatus },
    { label: 'Add Date', value: tool.rentedOnDate },
    { label: 'Rental Duration' },
    { label: 'Current Usage', value: toolLogRecord },
    { label: 'Input Invoice No or ID', value: 'No123ABC' },
    { label: 'Price', value: '150USD' },
    //TO DO
    { label: 'Add Condition', value: '' },
    { label: 'Shipping Fee', value: '25USD' },
    { label: 'Taxes', value: '15USD' },
    { label: 'Supplier Phone Number', value: '555-33-3333' },
    {
      label: 'Link To Buy/Rent',
      value:
        'https://www.homedepot.com/b/Outdoors-Outdoor-Power-Equipment-Leaf-Blowers/N-5yc1vZbxav',
    },
    { label: 'Description', value: tool.itemType?.description },
    //TO DO
    { label: 'Current Status', value: '' },
    //TO DO
    { label: 'Last Update Date', value: '' },
    { label: 'Last Used Person', value: '' },
    { label: 'Last Used Task', value: 'garden clean up' },
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
      from={tool.rentedOnDate}
      to={tool.rentalDue}
    />
  );

  const renderDescriptionItem = detail => (
    <DescriptionItem
      key={generateKey()}
      label={detail.label}
      value={detail.value}
      title={dummyTool.title}
    />
  );

  const renderDetails = detail => {
    switch (detail.label) {
      case 'Link To Buy/Rent':
        return renderLinkItem(detail);
      case 'Description':
        return renderDescriptionItem(detail);
      case 'Rental Duration':
        return renderRentalDurationItem(detail);
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
          <img src={dummyTool.image} alt={dummyTool.title} className="ToolDetailPage__image" />
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
