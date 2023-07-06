import React from 'react';
import axios from 'axios';
import { ENDPOINTS } from '../../utils/URL';
import { useState, useEffect } from 'react';
const TeamLocations = () => {
  const [userProfiles, setUserProfiles] = useState([]);
  useEffect(() => {
    async function getUserProfiles() {
      const users = await axios.get(ENDPOINTS.USER_PROFILES);
      setUserProfiles(users.data);
    }
    getUserProfiles();
  }, []);
  return userProfiles.map(profile => {
    return (
      <div>
        <div>{`Name: ${profile.firstName} ${profile.lastName}`}</div>
        <div>{`Title: ${profile.jobTitle}`}</div>
        <div>{`Location: ${profile.location}`}</div>
      </div>
    );
  });
};

export default TeamLocations;
