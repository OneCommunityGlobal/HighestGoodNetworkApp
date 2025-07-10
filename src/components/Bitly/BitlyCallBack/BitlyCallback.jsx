import { useEffect } from 'react';
import { useHistory } from 'react-router-dom'; // v5 hook
import axios from 'axios';
import { toast } from 'react-toastify';

export default function BitlyCallback() {
  const history = useHistory();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (!code) {
      toast.error('Missing Bitly code');
      history.replace('/announcements');
      return;
    }

    axios
      .post('/api/bitly/exchange', { code })
      .then(() => {
        toast.success('Bitly connected!');
        history.replace('/announcements');
      })
      .catch(() => {
        toast.error('Bitly auth failed');
        history.replace('/announcements');
      });
  }, [history]);

  return <p>Connecting to Bitly…</p>;
}
