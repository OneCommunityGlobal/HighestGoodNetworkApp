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
  useEffect(() => {
    const { token } = match.params;
    httpService
      .post(ENDPOINTS.VALIDATE_TOKEN(), { token })
      .then(res => {
        if (res.status === 200) {
          setIsValidToken(true);
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
      {!loading ? isValidToken ? <SetupProfileUserEntry /> : <SetupProfileInvalidToken /> : <></>}
    </>
  );
};

export default withRouter(SetupProfile);
