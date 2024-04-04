/* eslint-disable no-console */
import axios from 'axios';
import { useEffect, useState } from 'react';
import { ENDPOINTS } from 'utils/URL';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function VolunteeringHoursStats(props) {
  const { startDate, endDate } = props;
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  console.log(data);

  useEffect(() => {
    const fetchData = async () => {
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
    };

    fetchData();
  }, [startDate, endDate]);

  return (
    <div>
      {startDate}
      <br />
      {endDate}
    </div>
  );
}
