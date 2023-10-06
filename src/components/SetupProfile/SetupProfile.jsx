import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router';
import { ENDPOINTS } from 'utils/URL';
import httpService from 'services/httpService';
import SetupProfileInvalidToken from './SetupProfileInvalidToken';
import SetupProfileUserEntry from './SetupProfileUserEntry';
import './SetupProfile.css';
const SetupProfile = ({ match }) => {
  const [loading, setLoading] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [linktoken, setLinkToken] = useState('');
  const [email, setEmail] = useState('');
  useEffect(() => {
    const { token } = match.params;
    setLinkToken(token);
    httpService
      .post(ENDPOINTS.VALIDATE_TOKEN(), { token })
      .then(res => {
        if (res.status === 200) {
          setIsValidToken(true);
          setEmail(res.data.email);
        }
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      {!loading ? (
        isValidToken ? (
          <SetupProfileUserEntry token={linktoken} userEmail={email} />
        ) : (
          <SetupProfileInvalidToken />
        )
      ) : (
        <></>
      )}
    </>
  );
};

export default withRouter(SetupProfile);
