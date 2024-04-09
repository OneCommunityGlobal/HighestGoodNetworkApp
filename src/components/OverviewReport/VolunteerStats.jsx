import { Col, Row } from 'reactstrap';
import HorizontalBarChart from './HorizontalBarChart';
import DonutChart from './DonutChart';
import './VolunteerStats.css';

export default function VolunteerStats() {
  const barChartdata = [
    { label: 'In Teams', value: 42 },
    { label: 'Not In Teams', value: 31 },
    // Add more data as needed
  ];

  const pieData = {
    legend: 'Volunteers',
    data: [
      { label: 'New Volunteers', value: 15 },
      { label: 'Deactivated Volunteers', value: 28 },
      { label: 'Active Volunteers', value: 85 },
    ],
  };

  return (
    <Row>
      <Col>
        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '1rem' }}>
          <div className="team-members-div">
            <h4 style={{ fontWeight: 700 }}># Members in Teams</h4>
            <HorizontalBarChart data={barChartdata} width={600} height={250} />
          </div>
          <div>
            <p>
              <span style={{ fontWeight: 500 }}>Teams with 4+ Members:</span> 14 teams
            </p>
            <p>
              <span style={{ fontWeight: 500 }}>Total # Badges Awarded:</span> 94 badges
            </p>
            <p>
              <span style={{ fontWeight: 500 }}>5 people </span>have celebrated their anniversaries
              this week!
            </p>
            <span style={{ fontWeight: 500 }}>See a list of the dates below:</span>
            <ul>
              <li>
                <p>
                  <span style={{ fontWeight: 500 }}>08/10 Birthday</span> - Sávio Henrique
                </p>
              </li>
              <li>
                <p>
                  <span style={{ fontWeight: 500 }}>09/10 Wedding</span> - Sávio Henrique
                </p>
              </li>
              <li>
                <p>
                  <span style={{ fontWeight: 500 }}>10/10 Birthday</span> - Sávio Henrique
                </p>
              </li>
              <li>
                <p>
                  <span style={{ fontWeight: 500 }}>11/10 Birthday</span> - Sávio Henrique
                </p>
              </li>
              <li>
                <p>
                  <span style={{ fontWeight: 500 }}>12/10 Wedding</span> - Sávio Henrique
                </p>
              </li>
            </ul>
          </div>
        </div>
      </Col>
      <Col>
        <DonutChart legendHeading={pieData.legend} data={pieData.data} width={800} height={400} />
      </Col>
    </Row>
  );
}
