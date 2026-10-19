import axios from 'axios';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import styles from './style/RankedUserList.module.css';
import UserCard from './UserCard';

const PAGE_SIZE = 20;

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

function RankedUserList({
  selectedSkills,
  selectedPreferences,
  searchQuery,
  sortBy,
  sortOrder,
  currentPage,
  setCurrentPage,
}) {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);

      try {
        const params = {};
        const hasFilters =
          (selectedSkills && selectedSkills.length > 0) ||
          (selectedPreferences && selectedPreferences.length > 0) ||
          (searchQuery && searchQuery.trim().length > 0);

        if (selectedSkills && selectedSkills.length > 0) {
          params.skills = selectedSkills.join(',');
        }

        if (selectedPreferences && selectedPreferences.length > 0) {
          params.preferences = selectedPreferences.join(',');
        }

        if (searchQuery && searchQuery.trim().length > 0) {
          params.search = searchQuery.trim();
        }

        const endpoint = hasFilters
          ? `${process.env.REACT_APP_APIENDPOINT}/hgnform/ranked`
          : `${process.env.REACT_APP_APIENDPOINT}/hgnHelp/community`;

        if (!hasFilters && sortBy === 'name' && sortOrder) {
          params.sortOrder = sortOrder;
        }

        const response = await axios.get(endpoint, { params });
        setAllUsers(response.data.map(normalizeUser));
      } catch (err) {
        setAllUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [selectedSkills, selectedPreferences, searchQuery, sortOrder, sortBy]);

  const filteredUsers = searchQuery
    ? allUsers.filter(user => {
        const name = (user.name || '').toLowerCase();
        const skills = (user.topSkills || []).join(' ').toLowerCase();
        const query = searchQuery.toLowerCase();

        return name.includes(query) || skills.includes(query);
      })
    : allUsers;

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === 'score') {
      const scoreA = typeof a.score === 'number' ? a.score : -Infinity;
      const scoreB = typeof b.score === 'number' ? b.score : -Infinity;

      if (scoreA < scoreB) return sortOrder === 'desc' ? 1 : -1;
      if (scoreA > scoreB) return sortOrder === 'desc' ? -1 : 1;
    }

    const nameA = (a.name || '').toLowerCase();
    const nameB = (b.name || '').toLowerCase();

    if (nameA < nameB) return sortOrder === 'desc' ? 1 : -1;
    if (nameA > nameB) return sortOrder === 'desc' ? -1 : 1;

    return 0;
  });

  const totalPages = Math.ceil(sortedUsers.length / PAGE_SIZE);
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), Math.max(totalPages, 1));

  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
  const paginatedUsers = sortedUsers.slice(startIndex, startIndex + PAGE_SIZE);

  const handlePrevious = () => {
    setCurrentPage(page => Math.max(page - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage(page => Math.min(page + 1, totalPages));
  };

  if (loading) {
    return <p className={styles.message}>Loading ranked users...</p>;
  }

  if (!sortedUsers.length) {
    return <p className={styles.message}>No users found.</p>;
  }

  return (
    <div className={darkMode ? styles.darkMode : ''}>
      <div className={styles.container}>
        {paginatedUsers.map(user => (
          <div key={user._id} className={styles.userWrapper}>
            <UserCard user={user} />
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination} aria-label="Community member pagination">
          <button
            type="button"
            className={styles.paginationButton}
            onClick={handlePrevious}
            disabled={safeCurrentPage === 1}
          >
            Previous
          </button>

          <span className={styles.paginationInfo}>
            Page {safeCurrentPage} of {totalPages}
          </span>

          <button
            type="button"
            className={styles.paginationButton}
            onClick={handleNext}
            disabled={safeCurrentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

RankedUserList.propTypes = {
  selectedSkills: PropTypes.arrayOf(PropTypes.string),
  selectedPreferences: PropTypes.arrayOf(PropTypes.string),
  searchQuery: PropTypes.string,
  sortBy: PropTypes.string,
  sortOrder: PropTypes.string,
  currentPage: PropTypes.number.isRequired,
  setCurrentPage: PropTypes.func.isRequired,
};

export default RankedUserList;
