import { Col, Row } from 'reactstrap';
import DonutChart from './DonutChart';

export default function BlueSquareStats() {
  const pieData = {
    legend: 'Issued for',
    data: [
      { label: 'Only missing summary', value: 12.48 },
      { label: 'Only missing hours', value: 4.16 },
      { label: 'Missing Both', value: 17.16 },
    ],
  };
  return (
    <Row>
      <Col>
        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '1rem' }} />
      </Col>
      <Col>
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <DonutChart legendHeading={pieData.legend} data={pieData.data} width={800} height={400} />
          <p style={{ fontSize: '1.4rem' }}>
            <span style={{ fontWeight: 500 }}>25</span> Blue Squares were reasoned in advance, about
            <span style={{ fontWeight: 500 }}> 25%</span> of them
          </p>
        </div>
      </Col>
    </Row>
  );
}
