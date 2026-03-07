import { useState, useEffect } from 'react';
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
  const [isDark, setIsDark] = useState(false);
  const membersPerPage = 5;

  useEffect(() => {
    const header = document.querySelector('.header-wrapper');
    const isDarkNow = () => {
      const html = document.documentElement;
      const body = document.body;
      const tokens = [
        body.className,
        html.className,
        body.getAttribute('data-theme') || '',
        html.getAttribute('data-theme') || '',
        header?.className || '',
      ]
        .join(' ')
        .toLowerCase();
      return tokens.includes('dark');
    };
    const update = () => setIsDark(isDarkNow());
    update();
    const observers = [];
    const o1 = new MutationObserver(update);
    o1.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    observers.push(o1);
    const o2 = new MutationObserver(update);
    o2.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });
    observers.push(o2);
    if (header) {
      const o3 = new MutationObserver(update);
      o3.observe(header, { attributes: true, attributeFilter: ['class'] });
      observers.push(o3);
    }
    return () => observers.forEach(o => o.disconnect());
  }, []);

  // Get current page data
  const indexOfLast = currentPage * membersPerPage;
  const indexOfFirst = indexOfLast - membersPerPage;
  const currentMembers = dummyMembers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(dummyMembers.length / membersPerPage);

  const goToPage = page => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className={`${styles['member-list-container']} ${isDark ? styles.darkOn : ''}`}>
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
            <p style={{ color: parseInt(member.score, 10) >= 5 ? 'green' : 'red' }}>
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
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            type="button"
            key={i}
            className={currentPage === i + 1 ? 'active' : ''}
            onClick={() => goToPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button
          type="button"
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
