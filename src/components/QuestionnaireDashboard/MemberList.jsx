import { useState } from 'react';
import styles from './MemberList.module.css';

const names = ['Shreya Laheri', 'Anjali', 'Rahul Verma'];
const dummyMembers = Array.from({ length: 45 }, (_, i) => ({
  id: i + 1,
  name: names[i % names.length],
  email: `user${i + 1}@onecommunity.com`,
  score: `${6 - (i % 3)}/10`,
  skills: 'HTML, CSS, Java, Reactjs',
}));

function MemberList() {
  const [currentPage, setCurrentPage] = useState(1);
  const membersPerPage = 5;

  const indexOfLast = currentPage * membersPerPage;
  const indexOfFirst = indexOfLast - membersPerPage;
  const currentMembers = dummyMembers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(dummyMembers.length / membersPerPage);

  const goToPage = page => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className={styles.memberListContainer}>
      <div className={styles.cards}>
        {currentMembers.map(member => (
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
            <p
              style={{
                color: parseInt(member.score, 10) >= 5 ? 'green' : 'red',
              }}
            >
              Score: {member.score}
            </p>
            <p>
              <u>Top Skills:</u> {member.skills}
            </p>
          </div>
        ))}
      </div>

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
    </div>
  );
}

export default MemberList;
