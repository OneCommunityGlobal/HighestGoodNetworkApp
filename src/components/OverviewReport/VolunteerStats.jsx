/* eslint-disable no-unused-vars */
import { Col, Row } from 'reactstrap';
import { toast } from 'react-toastify';
import './VolunteerStats.css';
import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';
import moment from 'moment';
import HorizontalBarChart from './HorizontalBarChart';
import DonutChart from './DonutChart';

export default function VolunteerStats(props) {
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

  // api call
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(ENDPOINTS.GET_VOLUNTEER_STATS(startDate, endDate));
      setData(res.data);
      setLoading(false);
    } catch (_) {
      setError(true);
      setLoading(false);
      toast('Oops! Something went wrong.');
    }
  }, []);

  // we want to fetch the data on page load
  // also whenever the start/end date changes.
  // i.e the user has switched the weeks tab.
  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

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
