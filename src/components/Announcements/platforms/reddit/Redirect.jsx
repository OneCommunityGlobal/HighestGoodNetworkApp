import { useEffect, useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ENDPOINTS } from '../../../../utils/URL';

function Redirect() {
  const { search } = useLocation();
  const [redditCode, setRedditCode] = useState(null);
  const history = useHistory();

  const fetchRedditRefreshToken = async oneTimeCode => {
    try {
      await axios.get(`${ENDPOINTS.AP_REDDIT_AUTH_LOGIN}?code=${encodeURIComponent(oneTimeCode)}`);
      history.push('/announcements');
    } catch (error) {
      toast.error(error.message || ' Failed to connect to Reddit');
    }
  };

  useEffect(() => {
    const query = new URLSearchParams(search);
    if (query.has('code')) {
      const code = query.get('code');
      setRedditCode(code);
      fetchRedditRefreshToken(code);
    }
  }, []);

  return <div>Recived code from Reddit {redditCode}</div>;
}

export default Redirect;
