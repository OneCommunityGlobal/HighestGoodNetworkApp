import { useEffect, useState } from 'react';
import axios from 'axios';
import UserCard from './UserCard';
import { useSelector } from 'react-redux';
import styles from './style/RankedUserList.module.css';

function RankedUserList({ selectedSkills, selectedPreferences }) {
  const [rankedUsers, setRankedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const darkMode = useSelector(state => state.theme.darkMode);
  useEffect(() => {
    if (
      (!selectedSkills || selectedSkills.length === 0) &&
      (!selectedPreferences || selectedPreferences.length === 0)
    )
      return;

    const fetchRankedUsers = async () => {
      setLoading(true);
      try {
        const params = {};
        if (selectedSkills.length > 0) params.skills = selectedSkills.join(',');
        if (selectedPreferences.length > 0) params.preferences = selectedPreferences.join(',');

        const response = await axios.get(`${process.env.REACT_APP_APIENDPOINT}/hgnform/ranked`, {
          params,
        });
        setRankedUsers(response.data);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    fetchRankedUsers();
  }, [selectedSkills, selectedPreferences]);

  if (loading) return <p className={`${styles.message}`}>Loading ranked users...</p>;
  if (!rankedUsers.length) return <p className={`${styles.message}`}>No users found.</p>;

  return (
    <div className={darkMode ? `${styles.darkMode}` : ''}>
      <div className={`${styles.container}`}>
        {rankedUsers.map(user => (
          <div key={user._id} className={`${styles.userWrapper}`}>
            <UserCard user={user} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default RankedUserList;
