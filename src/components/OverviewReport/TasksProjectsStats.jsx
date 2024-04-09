import { Col, Row } from 'reactstrap';
import MultiHorizontalBarChart from './MultiHorizontalBarChart';
import DonutChart from './DonutChart';

export default function TasksProjectsStats() {
  const data = [
    { week: 'This Week', withTasks: 80, withoutTasks: 20 },
    { week: 'Last Week', withTasks: 70, withoutTasks: 30 },
  ];

  const pieData = {
    legend: 'Tasks vs. Projects',
    data: [
      { label: 'Tasks', value: 84.8 },
      { label: 'Projects', value: 120 },
    ],
  };

  return (
    <Row>
      <Col>
        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '1rem' }}>
          <div className="team-members-div">
            <h4 style={{ fontWeight: 700 }}>Members with tasks assigned to them</h4>
            <MultiHorizontalBarChart data={data} />
          </div>
          <div>
            <p>
              <span style={{ fontWeight: 500 }}># of Tasks Completed this week:</span> 49
            </p>
            <p>
              <span style={{ fontWeight: 500 }}># of Deadlines Increased this week:</span> 25
            </p>
          </div>
        </div>
      </Col>
      <Col>
        <DonutChart legendHeading={pieData.legend} data={pieData.data} width={800} height={400} />
      </Col>
    </Row>
  );
}
