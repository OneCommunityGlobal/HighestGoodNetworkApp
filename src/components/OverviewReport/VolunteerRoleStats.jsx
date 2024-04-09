import { Col, Row } from 'reactstrap';
import DonutChart from './DonutChart';
import './VolunteerStats.css';

export default function VolunteerRoleStats() {
  const pieData = {
    legend: 'Roles',
    data: [
      { label: 'Developer', value: 10 },
      { label: 'Manager', value: 15 },
      { label: 'Admin', value: 32 },
      { label: 'Designer', value: 5 },
      { label: 'Engineer', value: 1 },
    ],
  };

  return (
    <Row>
      <Col>
        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '1rem' }}>
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
