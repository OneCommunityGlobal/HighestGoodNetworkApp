/* eslint-disable no-unused-vars */
import { Col, Row } from 'reactstrap';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';
import MultiHorizontalBarChart from './MultiHorizontalBarChart';
import DonutChart from './DonutChart';

export default function TasksProjectsStats(props) {
  const { startDate, endDate } = props;
  const lastWeekStartDate = moment(startDate)
    .subtract(1, 'week')
    .startOf('week')
    .format('YYYY-MM-DD');
  const lastWeekEndDate = moment(endDate)
    .subtract(1, 'week')
    .endOf('week')
    .format('YYYY-MM-DD');
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  // test data - delete while api integration
  const dataKeys = ['withTasks', 'withoutTasks'];
  const barData = [
    {
      label: 'This Week',
      withTasks: { total: 50, percentage: 47 },
      withoutTasks: { total: 25, percentage: 37 },
    },
    {
      label: 'Last Week',
      withTasks: { total: 20, percentage: 30 },
      withoutTasks: { total: 25, percentage: 43 },
    },
  ];

  const pieData = {
    legend: 'Tasks vs. Projects',
    data: [
      { label: 'Tasks', value: 84.8 },
      { label: 'Projects', value: 120 },
    ],
  };

  // api call
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(ENDPOINTS.GET_TASK_AND_PROJECT_STATS(startDate, endDate));
      setData(res.data);
      setLoading(false);
    } catch (_) {
      setError(true);
      setLoading(false);
      toast('Oops! Something went wrong.');
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  return (
    <Row>
      <Col>
        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '1rem' }}>
          <div className="team-members-div">
            <h4 style={{ fontWeight: 700 }}>Members with tasks assigned to them</h4>
            <MultiHorizontalBarChart data={barData} dataKeys={dataKeys} />
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
