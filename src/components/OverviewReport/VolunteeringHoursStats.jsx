/* eslint-disable no-plusplus */
/* eslint-disable no-console */
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { ENDPOINTS } from 'utils/URL';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from 'components/common/Loading';
import { Button } from 'reactstrap';
import DonutChart from './DonutChart';

export default function VolunteeringHoursStats(props) {
  const { startDate, endDate } = props;
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(ENDPOINTS.GET_VOLUNTEER_HOUR_STATS(startDate, endDate));
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

  console.log(data);

  const donutData = [];
  if (data) {
    for (let i = 0; i < 6; i++) {
      const group = i * 10;
      const groupString = `${group}-${group + 9}`;
      console.log(i, group, groupString);
      const dataObj = {};
      dataObj.label = `${group} to ${group + 9} hours - ${data[groupString]}`;
      dataObj.value = data[groupString];
      donutData.push(dataObj);
    }
    donutData.push({ label: `60+ hours - ${data['60+']}`, value: data['60+'] });
  }

  console.log('donut data: ', donutData);

  if (loading) {
    return (
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: '1rem',
        }}
      >
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <Button color="info" onClick={fetchData}>
        Try again
      </Button>
    );
  }

  return (
    <div>
      {startDate}
      <br />
      {endDate}
      <div>
        {data && (
          <DonutChart data={donutData} width={800} height={400} total={data.numberOfUsers} />
        )}
      </div>
    </div>
  );
}
