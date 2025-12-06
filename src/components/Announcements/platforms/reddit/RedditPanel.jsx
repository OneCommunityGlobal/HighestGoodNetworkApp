import './reddit.css';
import { useEffect, useState } from 'react';
import { ENDPOINTS } from '../../../../utils/URL';
import axios from 'axios';
import SubmitPost from './SubmitPost';

export default function RedditPanel() {
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    async function validateToken() {
      try {
        const res = await axios.get(`${ENDPOINTS.AP_REDDIT_AUTH_TOKEN}`);
        setHasToken(res.data.exists);
      } catch (error) {
        setHasToken(false);
      }
    }
    validateToken();
  }, []);

  const handleConnectToReddit = () => {
    // Code to display Reddit Manager
    const authorizationUrl = `https://www.reddit.com/api/v1/authorize?
							client_id=${process.env.REACT_APP_REDDIT_CLIENT_ID}&response_type=code
							&state=random-string
							&redirect_uri=${process.env.REACT_APP_REDDIT_REDIRECT_URL}
							&duration=permanent&scope=identity,submit,save`;
    window.open(authorizationUrl, '_self');
  };

  return (
    <div style={{ padding: '1rem' }}>
      <div>
        {hasToken === false && (
          <button type="button" className="reddit-btn mt-6" onClick={handleConnectToReddit}>
            Connect to reddit
          </button>
        )}
        {hasToken === true && (
          <div>
            {/* Render Reddit post editor here */}
            <SubmitPost />
          </div>
        )}
      </div>
    </div>
  );
}
