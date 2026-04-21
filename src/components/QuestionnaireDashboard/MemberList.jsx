import { useMemo, useState } from 'react';
import styles from './MemberList.module.css';

const names = ['Shreya Laheri', 'Anjali', 'Rahul Verma'];
const allSkills = ['HTML', 'CSS', 'Java', 'Reactjs', 'JavaScript', 'Node.js', 'MongoDB', 'Python'];

const dummyMembers = Array.from({ length: 45 }, (_, i) => ({
  id: i + 1,
  name: names[i % names.length],
  email: `user${i + 1}@onecommunity.com`,
  score: 6 - (i % 3),
  skills: ['HTML', 'CSS', 'Java', 'Reactjs'],
}));

function MemberList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [minScore, setMinScore] = useState(0);
  const [maxScore, setMaxScore] = useState(10);

  const membersPerPage = 5;

  // Filter members based on selected filters
  const filteredMembers = useMemo(() => {
    return dummyMembers.filter(member => {
      // Filter by skills
      const skillMatch =
        selectedSkills.length === 0 || selectedSkills.some(skill => member.skills.includes(skill));

      // Filter by score range
      const scoreMatch = member.score >= minScore && member.score <= maxScore;

      return skillMatch && scoreMatch;
    });
  }, [selectedSkills, minScore, maxScore]);

  const indexOfLast = currentPage * membersPerPage;
  const indexOfFirst = indexOfLast - membersPerPage;
  const currentMembers = filteredMembers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredMembers.length / membersPerPage);

  const goToPage = page => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleSkillToggle = skill => {
    setSelectedSkills(prev => {
      if (prev.includes(skill)) {
        return prev.filter(s => s !== skill);
      }
      return [...prev, skill];
    });
    setCurrentPage(1); // Reset to page 1 when filter changes
  };

  const handleScoreChange = (type, value) => {
    if (type === 'min') {
      setMinScore(Number(value));
    } else {
      setMaxScore(Number(value));
    }
    setCurrentPage(1); // Reset to page 1 when filter changes
  };

  const handleClearFilters = () => {
    setSelectedSkills([]);
    setMinScore(0);
    setMaxScore(10);
    setCurrentPage(1);
  };

  return (
    <div className={styles.memberListContainer}>
      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.filterSection}>
          <div className={styles.filterLabel}>Filter by Skills:</div>
          <div className={styles.skillTags}>
            {allSkills.map(skill => (
              <button
                key={skill}
                type="button"
                className={`${styles.skillTag} ${
                  selectedSkills.includes(skill) ? styles.skillTagActive : ''
                }`}
                onClick={() => handleSkillToggle(skill)}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filterSection}>
          <div className={styles.filterLabel}>Score Range:</div>
          <div className={styles.scoreRange}>
            <div className={styles.scoreInput}>
              <label htmlFor="minScore">Min:</label>
              <input
                id="minScore"
                type="number"
                min="0"
                max="10"
                value={minScore}
                onChange={e => handleScoreChange('min', e.target.value)}
                className={styles.scoreField}
              />
            </div>
            <span className={styles.scoreSeparator}>to</span>
            <div className={styles.scoreInput}>
              <label htmlFor="maxScore">Max:</label>
              <input
                id="maxScore"
                type="number"
                min="0"
                max="10"
                value={maxScore}
                onChange={e => handleScoreChange('max', e.target.value)}
                className={styles.scoreField}
              />
            </div>
          </div>
        </div>

        <div className={styles.filterActions}>
          <button type="button" className={styles.clearButton} onClick={handleClearFilters}>
            Clear Filters
          </button>
          <div className={styles.resultCount}>Showing {filteredMembers.length} members</div>
        </div>
      </div>

      {/* Member Cards */}
      <div className={styles.cards}>
        {currentMembers.length > 0 ? (
          currentMembers.map(member => (
            <div key={member.id} className={styles.memberCard}>
              <h3>{member.name}</h3>
              <img
                src="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
                alt={`${member.name}'s avatar`}
                className={styles.memberAvatar}
              />
              <p>
                <i className="fa fa-envelope" style={{ marginRight: '5px' }} />
                {member.email}
              </p>
              <p className={member.score >= 5 ? styles.scoreGreen : styles.scoreRed}>
                Score: {member.score}/10
              </p>
              <p>
                <u>Top Skills:</u> {member.skills.join(', ')}
              </p>
            </div>
          ))
        ) : (
          <div className={styles.noResults}>No members found matching your filters.</div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className={styles.paginationControls}>
          <button
            type="button"
            className={styles.pageButton}
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              type="button"
              key={i}
              className={`${styles.pageButton} ${currentPage === i + 1 ? styles.active : ''}`}
              onClick={() => goToPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button
            type="button"
            className={styles.pageButton}
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default MemberList;
