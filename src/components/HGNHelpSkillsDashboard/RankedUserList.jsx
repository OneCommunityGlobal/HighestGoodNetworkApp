import axios from 'axios';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ENDPOINTS } from '~/utils/URL';
import styles from './style/RankedUserList.module.css';
import UserCard from './UserCard';

const extractSkillEntries = skillData => {
  if (!skillData || typeof skillData !== 'object') return [];

  if (Array.isArray(skillData)) {
    return skillData.flatMap(skill => {
      if (typeof skill === 'string') return [{ name: skill, rating: undefined }];
      if (skill && typeof skill === 'object') {
        const name = skill.name || skill.skill || skill.label || skill.type;
        return name ? [{ name, rating: skill.rating ?? skill.score ?? undefined }] : [];
      }
      return [];
    });
  }

  return Object.values(skillData).flatMap(section => {
    if (!section || typeof section !== 'object') return [];
    if (Array.isArray(section)) {
      return section.flatMap(skill => {
        if (typeof skill === 'string') return [{ name: skill, rating: undefined }];
        if (skill && typeof skill === 'object') {
          const name = skill.name || skill.skill || skill.label || skill.type;
          return name ? [{ name, rating: skill.rating ?? skill.score ?? undefined }] : [];
        }
        return [];
      });
    }

    return Object.entries(section).map(([skillName, rating]) => ({
      name: skillName,
      rating: typeof rating === 'number' ? rating : undefined,
    }));
  });
};

const normalizeUser = user => {
  if (Array.isArray(user.topSkills) && user.topSkills.length > 0) return user;

  const rawSkills = user.skills;
  const skillEntries = extractSkillEntries(rawSkills);

  const uniqueSkills = Array.from(
    new Map(
      skillEntries.filter(entry => entry.name).map(entry => [entry.name.toLowerCase(), entry]),
    ).values(),
  );

  const sortedSkills = uniqueSkills
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .map(entry => entry.name);

  return {
    ...user,
    topSkills: sortedSkills,
    skills: sortedSkills,
  };
};

function RankedUserList({ selectedSkills, selectedPreferences, searchQuery, sortOrder }) {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const darkMode = useSelector(state => state.theme.darkMode);

  // Load every community member once, then filter/search/sort on the client so all
  // skills in the filter list work regardless of the backend's skill-key handling.
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(ENDPOINTS.HGN_COMMUNITY_MEMBERS);
        const users = Array.isArray(response.data) ? response.data : [];
        setAllUsers(users.map(normalizeUser));
      } catch (err) {
        // Network/parse failures are surfaced to the user via the error state below;
        // there is nothing else to recover here.
        setError('Unable to load community members. Please try again later.');
        setAllUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const query = searchQuery.trim().toLowerCase();

  const filteredUsers = allUsers.filter(user => {
    const userSkills = (user.topSkills || []).map(skill => skill.toLowerCase());

    if (selectedSkills && selectedSkills.length > 0) {
      const matchesSkills = selectedSkills.every(skill => userSkills.includes(skill.toLowerCase()));
      if (!matchesSkills) return false;
    }

    if (selectedPreferences && selectedPreferences.length > 0) {
      const userPreferences = new Set((user.preferences || []).map(pref => pref.toLowerCase()));
      const matchesPreferences = selectedPreferences.every(pref =>
        userPreferences.has(pref.toLowerCase()),
      );
      if (!matchesPreferences) return false;
    }

    if (query) {
      const name = (user.name || '').toLowerCase();
      const matchesQuery = name.includes(query) || userSkills.some(skill => skill.includes(query));
      if (!matchesQuery) return false;
    }

    return true;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const nameA = (a.name || '').toLowerCase();
    const nameB = (b.name || '').toLowerCase();
    if (nameA < nameB) return sortOrder === 'desc' ? 1 : -1;
    if (nameA > nameB) return sortOrder === 'desc' ? -1 : 1;
    return 0;
  });

  if (loading) return <p className={`${styles.message}`}>Loading community members...</p>;
  if (error) return <p className={`${styles.message}`}>{error}</p>;
  if (!sortedUsers.length) return <p className={`${styles.message}`}>No members found.</p>;

  return (
    <div className={darkMode ? `${styles.darkMode}` : ''}>
      <div className={`${styles.container}`}>
        {sortedUsers.map(user => (
          <div key={user._id} className={`${styles.userWrapper}`}>
            <UserCard user={user} />
          </div>
        ))}
      </div>
    </div>
  );
}

RankedUserList.propTypes = {
  selectedSkills: PropTypes.arrayOf(PropTypes.string),
  selectedPreferences: PropTypes.arrayOf(PropTypes.string),
  searchQuery: PropTypes.string,
  sortOrder: PropTypes.string,
};

export default RankedUserList;
