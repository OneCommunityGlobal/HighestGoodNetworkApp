import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import RankedUserList from './RankedUserList';
import styles from './style/CommunityMembersPage.module.css';

const availableSkills = ['React', 'Redux', 'HTML', 'CSS', 'MongoDB', 'Database', 'Agile'];
const RANKED_USERS_ENDPOINT = 'http://localhost:4500/api/hgnform/ranked';

function CommunityMembersPage() {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [rankedUsers, setRankedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRankedUsers = async () => {
      setLoading(true);
      try {
        const params = {
          skills: (selectedSkills.length ? selectedSkills : availableSkills).join(','),
        };
        const response = await axios.get(RANKED_USERS_ENDPOINT, { params });
        setRankedUsers(response.data);
        setError(null);
      } catch (err) {
        setError('Unable to load community members right now. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRankedUsers();
  }, [selectedSkills]);

  const handleCheckboxChange = skill => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill],
    );
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const clearFilters = () => {
    setSelectedSkills([]);
  };

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const normalizedSelectedSkills = selectedSkills.map(skill => skill.toLowerCase());
    let result = rankedUsers;

    if (normalizedSearch) {
      result = rankedUsers.filter(user => {
        const nameMatches = user.name?.toLowerCase().includes(normalizedSearch);
        const skillMatches = Array.isArray(user.topSkills)
          ? user.topSkills.some(skill => skill.toLowerCase().includes(normalizedSearch))
          : false;
        return nameMatches || skillMatches;
      });
    }

    if (normalizedSelectedSkills.length) {
      result = result.filter(user => {
        if (!Array.isArray(user.topSkills) || user.topSkills.length === 0) return false;
        return user.topSkills.some(skill =>
          normalizedSelectedSkills.includes((skill || '').toLowerCase()),
        );
      });
    }

    return [...result].sort((a, b) => {
      const first = a.name || '';
      const second = b.name || '';
      return sortOrder === 'asc' ? first.localeCompare(second) : second.localeCompare(first);
    });
  }, [rankedUsers, searchTerm, sortOrder, selectedSkills]);

  const emptyMessage =
    searchTerm || selectedSkills.length
      ? 'No community members match your current filters.'
      : 'No community members available yet.';

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>One Community Members</h1>
      <div className={styles.controlsRow}>
        <div className={styles.searchWrapper}>
          <input
            type="search"
            value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
            placeholder="Search by team member name or skills"
            className={styles.searchInput}
            aria-label="Search community members"
          />
        </div>
        <button
          type="button"
          className={styles.filterButton}
          onClick={() => setShowFilters(prev => !prev)}
        >
          {showFilters ? 'Hide Filters' : 'Filter'}
        </button>
        <button type="button" className={styles.sortButton} onClick={toggleSortOrder}>
          {sortOrder === 'asc' ? 'A→Z Sort' : 'Z→A Sort'}
        </button>
        {(selectedSkills.length > 0 || searchTerm) && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={() => {
              clearFilters();
              setSearchTerm('');
            }}
          >
            Clear All
          </button>
        )}
      </div>

      {showFilters && (
        <div className={styles.filtersPanel}>
          {availableSkills.map(skill => (
            <label key={skill} className={styles.filterOption}>
              <input
                type="checkbox"
                checked={selectedSkills.includes(skill)}
                onChange={() => handleCheckboxChange(skill)}
              />
              <span>{skill}</span>
            </label>
          ))}
        </div>
      )}

      <p className={styles.helperText}>
        When multiple filters are selected, the score represents the average value, and the options
        are ranked based on their scoring. Click each profile to learn more details.
      </p>

      <RankedUserList
        users={filteredUsers}
        loading={loading}
        error={error}
        emptyMessage={emptyMessage}
      />
    </div>
  );
}

export default CommunityMembersPage;
