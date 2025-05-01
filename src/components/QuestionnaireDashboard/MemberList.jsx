import React, { useState } from 'react';
import './MemberList.css';

const names = ['Shreya Laheri', 'Anjali', 'Rahul Verma'];
const dummyMembers = Array.from({ length: 45 }, (_, i) => ({
  id: i + 1,
  name: names[i % names.length],
  email: `user${i + 1}@onecommunity.com`,
  score: `${6 - (i % 3)}/10`,
  skills: 'HTML, CSS, Java, Reactjs',
}));

const MemberList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const membersPerPage = 5;

  // Get current page data
  const indexOfLast = currentPage * membersPerPage;
  const indexOfFirst = indexOfLast - membersPerPage;
  const currentMembers = dummyMembers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(dummyMembers.length / membersPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="member-list-container">
      <div className="cards">
        {currentMembers.map(member => (
          <div key={member.id} className="member-card">
            <h3>{member.name}</h3>
            <img src="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
               alt={`${member.name}'s avatar`} className="member-avatar"/>

            <p><i className="fa fa-envelope" style={{ marginRight: '5px' }}></i>{member.email}</p>
            <p style={{ color: parseInt(member.score) >= 5 ? 'green' : 'red' }}>
                Score: {member.score}
            </p>
            <p><u>Top Skills:</u> {member.skills}</p>
          </div>
        ))}
      </div>

      <div className="pagination-controls">
        <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button key={i} className={currentPage === i + 1 ? 'active' : ''} onClick={() => goToPage(i + 1)}>{i + 1}</button>
        ))}
        <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
      </div>
    </div>
  );
};

export default MemberList;
