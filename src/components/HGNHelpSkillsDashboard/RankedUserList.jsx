import { useEffect, useState } from 'react';
import axios from 'axios';
import UserCard from './UserCard';
import './style/UserCard.module.css';

function RankedUserList({ selectedSkills }) {
  const [rankedUsers, setRankedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedSkills || selectedSkills.length === 0) return;

    const fetchRankedUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:4500/api/hgnform/ranked', {
          params: { skills: selectedSkills.join(',') },
        });
        setRankedUsers(response.data);
      } catch (err) {
        // console.error('Error fetching ranked users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRankedUsers();
  }, [selectedSkills]);

  if (loading) return <p>Loading ranked users...</p>;

  return (
    <div className="user-card-container">
      {rankedUsers.map(user => (
        <UserCard key={user._id} user={user} />
      ))}
    </div>
  );
}

export default RankedUserList;
