import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
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
  const [inValidMessage, setInValidMessage] = useState('');
  const location = useLocation();

  useEffect(() => {
    // Set the tab title to "Profile Setup"
    if (location.pathname.includes('/ProfileInitialSetup')) {
      document.title = `Profile Setup`;
    }

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
        let res = err.response;
        if(res.data) {
          setInValidMessage(res.data);
        }
        setLoading(false);
      });
  }, [location.pathname]);

  return (
    <>
      {!loading ? (
        isValidToken ? (
          <SetupProfileUserEntry token={linktoken} userEmail={email} />
        ) : (
          <SetupProfileInvalidToken message={inValidMessage} />
        )
      ) : (
        <></>
      )}
    </>
  );
};

export default withRouter(SetupProfile);
