import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import jwtDecode from 'jwt-decode';
import LeftSection from './LeftSection';
import RightSection from './RightSection';
import styles from '../styles/UserSkillsProfile.module.css';

function UserSkillsProfile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found. Please log in.');
        }

        const decodedToken = jwtDecode(token);
        const userId = decodedToken.userid;
        if (!userId) {
          throw new Error('User ID not found in token.');
        }

        const response = await axios.get(`http://localhost:4500/api/skills/profile/${userId}`, {
          headers: {
            Authorization: `${token}`,
          },
        });

        const { data } = response;
        if (!data) throw new Error('Failed to fetch profile data');

        setProfileData(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div
        className={`${styles.skillsLoader} ${darkMode ? styles.dark : ''}`}
        style={{
          background: darkMode ? '#3a506b' : '#fff',
          color: darkMode ? '#f7fafc' : '#2d3748',
        }}
      >
        <ClipLoader color={darkMode ? '#90cdf4' : '#007bff'} size={70} />
        <p>Loading Profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`${styles.skillsError} ${darkMode ? styles.dark : ''}`}
        style={{
          background: darkMode ? '#3a506b' : '#fff',
          color: darkMode ? '#f7fafc' : '#2d3748',
        }}
      >
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div
        className={`${styles.skillsError} ${darkMode ? styles.dark : ''}`}
        style={{
          background: darkMode ? '#3a506b' : '#fff',
          color: darkMode ? '#f7fafc' : '#2d3748',
        }}
      >
        <p>No profile data available</p>
      </div>
    );
  }

  return (
    <div
      className={`${styles.userProfileHome} ${darkMode ? styles.dark : ''}`}
      style={{
        background: darkMode ? '#1B2A41' : '#fff',
        color: darkMode ? '#f7fafc' : '#2d3748',
        minHeight: '100vh',
        transition: 'background 0.3s, color 0.3s',
      }}
    >
      <div className={`${styles.dashboardContainer}`}>
        <LeftSection profileData={profileData} darkMode={darkMode} />
        <div className={`${styles.verticalSeparator}`} />
        <RightSection profileData={profileData} darkMode={darkMode} />
      </div>
    </div>
  );
}

export default UserSkillsProfile;
