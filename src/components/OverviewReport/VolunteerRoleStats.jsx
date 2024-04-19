/* eslint-disable no-unused-vars */
import { Col, Row } from 'reactstrap';
import './VolunteerStats.css';
import { useCallback, useEffect, useState } from 'react';
import moment from 'moment';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';
import DonutChart from './DonutChart';

export default function VolunteerRoleStats(props) {
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

  // api call
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(ENDPOINTS.GET_VOLUNTEER_ROLE_STATS(startDate, endDate));
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
