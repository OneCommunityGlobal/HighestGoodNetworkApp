import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';
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
  const history = useHistory();

  // Fetch data from backend on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found. Please log in.');
        }

        // Decode the token to get the user ID
        const decodedToken = jwtDecode(token);
        // console.log('Decoded Token:', decodedToken);
        const userId = decodedToken.userid;
        if (!userId) {
          throw new Error('User ID not found in token.');
        }

        const response = await axios.get(
          // 'http://localhost:4500/api/skills/profile/665524c257ca141fe8921b41',
          `http://localhost:4500/api/skills/profile/${userId}`,
          {
            headers: {
              Authorization: `${token}`,
            },
          },
        );

        const { data } = response;
        if (!data) throw new Error('Failed to fetch profile data');

        if (data.isPlaceholder) {
          toast.warn('Please complete the skills survey to access the HGN Skills dashboard.');

          setTimeout(() => {
            history.push('/hgnform');
          }, 2500);
        }

        setProfileData(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array - runs only once on mount

  if (loading) {
    return (
      <div className={`${styles.skillsLoader}`}>
        <ClipLoader color="#007bff" size={70} />
        <p>Loading Profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.skillsError}`}>
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className={`${styles.skillsError}`}>
        <p>No profile data available</p>
      </div>
    );
  }

  return (
    <div className={`${styles.userProfileHome}`}>
      <div className={`${styles.dashboardContainer}`}>
        <LeftSection profileData={profileData} />
        <div className={`${styles.verticalSeparator}`} />
        <RightSection profileData={profileData} />
      </div>
    </div>
  );
}

export default UserSkillsProfile;
