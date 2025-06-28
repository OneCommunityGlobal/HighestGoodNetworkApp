import { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import jwtDecode from 'jwt-decode';
import { useDispatch } from 'react-redux';
import LeftSection from './LeftSection';
import RightSection from './RightSection';
import '../styles/UserSkillsProfile.css';

function UserSkillsProfile() {
  const dispatch = useDispatch();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        // console.log('Profile Data:', response.data);

        const { data } = response;
        if (!data) throw new Error('Failed to fetch profile data');

        // Send data to Redux store
        // dispatch({ type: 'SET_PROFILE_DATA', payload: data });
        dispatch({ type: 'SET_USER_SKILLS_PROFILE_DATA', payload: data });

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
      <div className="skills-loader">
        <ClipLoader color="#007bff" size={70} />
        <p>Loading Profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="skills-error">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="skills-error">
        <p>No profile data available</p>
      </div>
    );
  }

  return (
    <div className="user-profile-home">
      <div className="dashboard-container">
        {/* <LeftSection profileData={profileData} /> */}
        <LeftSection />
        <div className="vertical-separator" />
        {/* <RightSection profileData={profileData} /> */}
        <RightSection />
      </div>
    </div>
  );
}

export default UserSkillsProfile;
