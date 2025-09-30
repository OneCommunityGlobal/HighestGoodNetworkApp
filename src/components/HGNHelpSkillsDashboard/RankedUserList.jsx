// RankedUserList.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import UserCard from './UserCard';

function RankedUserList({ selectedSkills, selectedPreferences }) {
  const [rankedUsers, setRankedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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
        console.error('Error fetching ranked users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRankedUsers();
  }, [selectedSkills, selectedPreferences]);

  if (loading) return <p style={{ color: '#666', fontSize: '1rem' }}>Loading ranked users...</p>;
  if (!rankedUsers.length)
    return <p style={{ color: '#666', fontSize: '1rem' }}>No users found.</p>;

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        justifyContent: 'center',
      }}
    >
      {rankedUsers.map(user => (
        <div
          key={user._id}
          style={{
            width: '250px',
            border: '1px solid #ccc',
            borderRadius: '12px',
            padding: '15px',
            background: '#fff',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <UserCard user={user} />
        </div>
      ))}
    </div>
  );
}

export default RankedUserList;
