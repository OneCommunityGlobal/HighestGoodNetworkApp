import axios from 'axios';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ENDPOINTS } from '~/utils/URL';
import { formatSkillName } from './FilerData.js';
import styles from './style/RankedUserList.module.css';
import UserCard from './UserCard';

const TOP_SKILLS_PER_SECTION = 4;
const PAGE_SIZE = 20;

const extractSkillEntries = skillData => {
  if (!skillData || typeof skillData !== 'object') return [];

  if (Array.isArray(skillData)) {
    return skillData.flatMap(skill => {
      if (typeof skill === 'string')
        return [{ name: skill, rating: undefined, section: 'default' }];
      if (skill && typeof skill === 'object') {
        const name = skill.name || skill.skill || skill.label || skill.type;
        return name
          ? [{ name, rating: skill.rating ?? skill.score ?? undefined, section: 'default' }]
          : [];
      }
      return [];
    });
  }

  return Object.entries(skillData).flatMap(([sectionName, section]) => {
    if (!section || typeof section !== 'object') return [];
    if (Array.isArray(section)) {
      return section.flatMap(skill => {
        if (typeof skill === 'string')
          return [{ name: skill, rating: undefined, section: sectionName }];
        if (skill && typeof skill === 'object') {
          const name = skill.name || skill.skill || skill.label || skill.type;
          return name
            ? [{ name, rating: skill.rating ?? skill.score ?? undefined, section: sectionName }]
            : [];
        }
        return [];
      });
    }

    return Object.entries(section).map(([skillName, rating]) => ({
      name: skillName,
      rating: typeof rating === 'number' ? rating : undefined,
      section: sectionName,
    }));
  });
};

const normalizeUser = user => {
  const rawSkills = user.skills;
  const skillEntries = Array.isArray(user.topSkills)
    ? user.topSkills.map(name => ({ name, rating: undefined, section: 'default' }))
    : extractSkillEntries(rawSkills);

  const uniqueSkills = Array.from(
    new Map(
      skillEntries.filter(entry => entry.name).map(entry => [entry.name.toLowerCase(), entry]),
    ).values(),
  );

  // Mirror the backend's strict /ranked rule: a skill only counts for filtering
  // and search if it's in the top 4 (by score) within its own section, so the
  // filter stays meaningful instead of matching anyone who rated a skill at all.
  const skillsBySection = uniqueSkills.reduce((acc, entry) => {
    const section = entry.section || 'default';
    if (!acc[section]) acc[section] = [];
    acc[section].push(entry);
    return acc;
  }, {});

  const topSkillNames = Object.values(skillsBySection).flatMap(entries =>
    entries
      .slice()
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, TOP_SKILLS_PER_SECTION)
      .map(entry => entry.name),
  );

  // Keep the raw skill keys (used by the filter buttons, which pass FilerData's
  // keys) separate from the human-readable names search/display should use,
  // and leave the original `skills` field untouched for other consumers.
  const displaySkills = topSkillNames.map(formatSkillName);

  return {
    ...user,
    topSkills: topSkillNames,
    displaySkills,
  };
};

function RankedUserList({
  selectedSkills,
  selectedPreferences,
  searchQuery,
  sortOrder,
  currentPage,
  setCurrentPage,
}) {
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
        const detail = err.response?.status ? ` (${err.response.status})` : '';
        setError(`Unable to load community members. Please try again later.${detail}`);
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
      const displaySkills = (user.displaySkills || []).map(skill => skill.toLowerCase());
      // Match against both the raw skill keys and their human-readable labels,
      // since the keys (e.g. "UnitTest") don't contain the words a member
      // would actually type (e.g. "testing").
      const matchesQuery =
        name.includes(query) ||
        userSkills.some(skill => skill.includes(query)) ||
        displaySkills.some(skill => skill.includes(query));
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

  const totalPages = Math.ceil(sortedUsers.length / PAGE_SIZE);
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), Math.max(totalPages, 1));
  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
  const paginatedUsers = sortedUsers.slice(startIndex, startIndex + PAGE_SIZE);

  const handlePrevious = () => setCurrentPage(page => Math.max(page - 1, 1));
  const handleNext = () => setCurrentPage(page => Math.min(page + 1, totalPages));

  if (loading) return <p className={`${styles.message}`}>Loading community members...</p>;
  if (error) return <p className={`${styles.message}`}>{error}</p>;
  if (!sortedUsers.length) return <p className={`${styles.message}`}>No members found.</p>;

  return (
    <div className={darkMode ? `${styles.darkMode}` : ''}>
      <div className={`${styles.container}`}>
        {paginatedUsers.map(user => (
          <div key={user._id} className={`${styles.userWrapper}`}>
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
  sortOrder: PropTypes.string,
  currentPage: PropTypes.number.isRequired,
  setCurrentPage: PropTypes.func.isRequired,
};

export default RankedUserList;
