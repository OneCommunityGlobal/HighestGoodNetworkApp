import jwtDecode from 'jwt-decode';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import config from '~/config.json';
import httpService from '~/services/httpService';
import { ENDPOINTS } from '~/utils/URL';
import styles from '../styles/UserSkillsProfile.module.css';
import LeftSection from './LeftSection';
import RightSection from './RightSection';

function UserSkillsProfile() {
  const { userId: routeUserId } = useParams();
  const dispatch = useDispatch();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const history = useHistory();
  const location = useLocation();
  const darkMode = useSelector(state => state.theme.darkMode);

  // Fetch data from backend on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        let effectiveUserId = routeUserId;
        const token = localStorage.getItem(config.tokenKey);

        if (!token) {
          throw new Error('No token found. Please log in.');
        }

        // Set the token in httpService for authentication
        httpService.setjwt(token);

        // Determine the effective user ID to fetch and the logged-in user's ID
        let decodedUserId;
        if (!effectiveUserId) {
          const decodedToken = jwtDecode(token);
          effectiveUserId = decodedToken.userid;
          decodedUserId = decodedToken.userid;
        } else {
          // Still decode for self-view comparison
          try {
            decodedUserId = jwtDecode(token)?.userid;
          } catch (_) {
            decodedUserId = undefined;
          }
        }

        if (!effectiveUserId) {
          throw new Error('User ID not found in token.');
        }

        const url = ENDPOINTS.SKILLS_PROFILE(effectiveUserId);
        const response = await httpService.get(url);

        const { data } = response;
        if (!data) throw new Error('Failed to fetch profile data');

        // If no skills data yet, decide whether to redirect
        if (data.isPlaceholder) {
          const params = new URLSearchParams(location.search);
          const noRedirect = ['1', 'true', 'yes'].includes(
            (params.get('noRedirect') || '').toLowerCase(),
          );
          const isViewingSelf = !routeUserId || routeUserId === decodedUserId;

          if (isViewingSelf && !noRedirect) {
            toast.warn('Please complete the skills survey to access the HGN Skills dashboard.');
            setTimeout(() => {
              history.push('/hgnform');
            }, 2500);
          } else {
            // Viewing another user's placeholder profile, or redirect suppressed
            toast.info('No skills survey data found for this profile yet.');
          }
        }

        // Send data to Redux store
        dispatch({
          type: 'SET_USER_SKILLS_PROFILE_DATA',
          payload: { ...data, loggedInUserId: decodedUserId },
        });

        setProfileData(data);
        setLoading(false);
      } catch (err) {
        let errorMessage = 'Failed to load profile data';

        if (err.response) {
          // Server responded with error status
          errorMessage =
            err.response.data?.error ||
            err.response.data?.message ||
            `Server error: ${err.response.status}`;
        } else if (err.request) {
          // Request was made but no response received
          errorMessage = 'No response from server. Check if backend is running on localhost:4500';
        } else {
          // Something else happened
          errorMessage = err.message;
        }

        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array - runs only once on mount

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
