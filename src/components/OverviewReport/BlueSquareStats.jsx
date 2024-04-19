/* eslint-disable no-unused-vars */
import { Col, Row } from 'reactstrap';
import { useCallback, useEffect, useState } from 'react';
import moment from 'moment';
import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';
import { toast } from 'react-toastify';
import DonutChart from './DonutChart';

export default function BlueSquareStats(props) {
  // uncomment the following
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
    legend: 'Issued for',
    data: [
      { label: 'Only missing summary', value: 12.48 },
      { label: 'Only missing hours', value: 4.16 },
      { label: 'Missing Both', value: 17.16 },
    ],
  };

  // api call
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(ENDPOINTS.GET_BLUE_SQUARE_STATS(startDate, endDate));
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
