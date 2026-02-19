import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import styles from './style/RankedUserList.module.css';
import UserCard from './UserCard';

function RankedUserList({ selectedSkills, selectedPreferences, searchQuery }) {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const params = {};
        if (selectedSkills && selectedSkills.length > 0) params.skills = selectedSkills.join(',');
        if (selectedPreferences && selectedPreferences.length > 0)
          params.preferences = selectedPreferences.join(',');

        const response = await axios.get(`${process.env.REACT_APP_APIENDPOINT}/hgnform/ranked`, {
          params,
        });
        setAllUsers(response.data);
      } catch (err) {
        // error handled silently
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [selectedSkills, selectedPreferences]);

  // Client-side filter by searchQuery on top of API results
  const filteredUsers = searchQuery
    ? allUsers.filter(user => {
        const name = (user.name || '').toLowerCase();
        const skills = (user.topSkills || []).join(' ').toLowerCase();
        return (
          name.includes(searchQuery.toLowerCase()) || skills.includes(searchQuery.toLowerCase())
        );
      })
    : allUsers;

  if (loading) return <p className={`${styles.message}`}>Loading ranked users...</p>;
  if (!filteredUsers.length) return <p className={`${styles.message}`}>No users found.</p>;

  return (
    <div className={darkMode ? `${styles.darkMode}` : ''}>
      <div className={`${styles.container}`}>
        {filteredUsers.map(user => (
          <div key={user._id} className={`${styles.userWrapper}`}>
            <UserCard user={user} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default RankedUserList;
