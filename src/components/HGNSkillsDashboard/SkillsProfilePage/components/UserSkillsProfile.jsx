import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useHistory, useParams } from 'react-router-dom';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import { useDispatch } from 'react-redux';
import LeftSection from './LeftSection';
import RightSection from './RightSection';
import styles from '../styles/UserSkillsProfile.module.css';
import {jwtDecode} from 'jwt-decode';

function UserSkillsProfile() {
  const { userId: routeUserId } = useParams();
  const dispatch = useDispatch();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const history = useHistory();

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

        const response = await axios.get(
          `${process.env.REACT_APP_APIENDPOINT}/skills/profile/${effectiveUserId}`,
        );
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
    <div className="user-profile-home">
      <div className="dashboard-container">
        <LeftSection />
        <div className="vertical-separator" />
        <RightSection />
      </div>
    </div>
  );
}

export default UserSkillsProfile;
