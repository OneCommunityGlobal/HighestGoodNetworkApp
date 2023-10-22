import { useHistory } from 'react-router-dom';
import { Container, Button } from 'reactstrap';
import './TEDetailPage.css';
import { v4 as uuidv4 } from 'uuid';

function DetailItem({label, value}){
  return (
    <p>
      {label}: <span className='TEDetailPage__span'>{value}</span>
    </p>
  )
};


function TEDetailPage() {

  const history = useHistory();

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

  const details = [
    { label: 'Belongs to project', value: dummyTool.projectId },
    { label: 'Class', value: dummyTool.class },
    { label: 'Name', value: dummyTool.title },
    { label: 'Number', value: `#${dummyTool.number}` },
    { label: 'Ownership', value: dummyTool.ownership },
    { label: 'Add Date', value: dummyTool.addDate },
    { label: 'Rental Duration', value: dummyTool.returnDate },
    { label: 'Current Usage', value: dummyTool.currentUsage },
    { label: 'Input Invoice No or ID', value: dummyTool.invoiceNo },
    { label: 'Price', value: dummyTool.price },
    { label: 'Add Condition', value: dummyTool.condition },
    { label: 'Shipping Fee', value: dummyTool.shippingFee },
    { label: 'Taxes', value: dummyTool.taxes },
    { label: 'Supplier Phone Number', value: dummyTool.supplierPhoneNo },
    { label: 'Link To Buy/Rent', value: dummyTool.linkToBuy },
    { label: 'Description', value: dummyTool.description },
    { label: 'Current Status', value: dummyTool.currentStatus },
    { label: 'Last Update Date', value: dummyTool.lastUpdated },
    { label: 'Last Used Person', value: dummyTool.lastUsedBy },
    { label: 'Last Used Task', value: dummyTool.lastUsedTask },
    { label: 'Asked for a replacement?', value: dummyTool.askedForReplacement ? 'Yes' : 'No' },
  ];

  return (
    <Container className="justify-content-center align-items-center mw-80 px-4">
      <header className="TEDetailPage__header">
        <h1>Tool or Equipment Detail Page</h1>
      </header>
      <main className="TEDetailPage__content">
        <p>
          <img src={dummyTool.image} alt={dummyTool.title} className="TEDetailPage__image" />
        </p>
        {details.map(detail => (
          <DetailItem key={uuidv4()} label={detail.label} value={detail.value} />
        ))}
        <Button outline onClick={() => history.push('/bmdashboard')}>
          Back to List
        </Button>
      </main>
    </Container>
  );
}

export default TEDetailPage;
