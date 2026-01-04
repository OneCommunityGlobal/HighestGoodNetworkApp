import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { useHistory, useParams } from 'react-router-dom';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import LeftSection from './LeftSection';
import RightSection from './RightSection';
import styles from '../styles/UserSkillsProfile.module.css';
import jwtDecode from 'jwt-decode';
import { ENDPOINTS } from '~/utils/URL';

function UserSkillsProfile() {
  const { userId: routeUserId } = useParams();
  const dispatch = useDispatch();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const history = useHistory();
  const darkMode = useSelector(state => state.theme.darkMode);

  // Fetch data from backend on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        let effectiveUserId = routeUserId;
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found. Please log in.');
        }
        if (!effectiveUserId) {
          const decodedToken = jwtDecode(token);
          effectiveUserId = decodedToken.userid;
        }
        if (!effectiveUserId) {
          throw new Error('User ID not found in token.');
        }

        const response = await axios.get(ENDPOINTS.SKILLS_PROFILE(effectiveUserId), {
          headers: {
            Authorization: `${token}`,
          },
        });
        // console.log('Profile Data:', response.data);

        const { data } = response;
        if (!data) throw new Error('Failed to fetch profile data');

        if (data.isPlaceholder) {
          toast.warn('Please complete the skills survey to access the HGN Skills dashboard.');

          setTimeout(() => {
            history.push('/hgnform');
          }, 2500);
        }

        // Send data to Redux store
        dispatch({ type: 'SET_USER_SKILLS_PROFILE_DATA', payload: data });

        setProfileData(data);
        setLoading(false);
      } catch (err) {
        setError(err.response.data.error);
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array - runs only once on mount

  /* eslint-disable no-console */

  if (loading) {
    return (
      <div className={`${styles.skillsLoader} ${darkMode ? 'dark-mode' : ''}`}>
        <ClipLoader color="#007bff" size={70} />
        <p>Loading Profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.skillsError} ${darkMode ? 'dark-mode' : ''}`}>
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className={`${styles.skillsError} ${darkMode ? 'dark-mode' : ''}`}>
        <p>No profile data available</p>
      </div>
    );
  }

  return (
    <div className={`${styles.userProfileHome} ${darkMode ? 'dark-mode' : ''}`}>
      <div className={`${styles.dashboardContainer}`}>
        <LeftSection />
        <div className={`${styles.verticalSeparator}`} />
        <RightSection />
      </div>
    </div>
  );
}

export default UserSkillsProfile;
