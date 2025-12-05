import { useEffect, useState } from 'react';
import axios from 'axios';
import UserCard from './UserCard';
import './style/UserCard.module.css';

function RankedUserList({ selectedSkills = [] }) {
  const [rankedUsers, setRankedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let canceled = false;

    const fetchRankedUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = {};
        if (Array.isArray(selectedSkills) && selectedSkills.length > 0) {
          params.skills = selectedSkills.join(',');
        }

        const response = await axios.get('http://localhost:4500/api/hgnform/ranked', { params });

        if (!canceled) {
          const data = response?.data || [];
          setRankedUsers(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to fetch ranked users', err);
        if (!canceled) {
          setError(err);
          setRankedUsers([]);
        }
      } finally {
        if (!canceled) setLoading(false);
      }
    };

    fetchRankedUsers();

    return () => {
      canceled = true;
    };
  }, [selectedSkills]);

  if (loading) return <p>Loading ranked users...</p>;
  if (error) return <p>Failed to load users.</p>;
  if (!rankedUsers.length) return <p>No members found.</p>;

  return (
    <div className="user-card-container">
      {rankedUsers.map(user => (
        <UserCard key={user._id || user.id || user.uuid} user={user} />
      ))}
    </div>
  );
}

export default RankedUserList;
