import { useState, useEffect } from 'react';
import slackIcon from './slackicon.png';
import profilePic from './profilepic.png';
import './community.css';

const mockMembers = [
  {
    id: 1,
    name: 'Alice Johnson',
    email: 'alice@example.com',
    slack: 'alice',
    score: 8,
    skills: ['HTML', 'CSS', 'Node.js', 'MongoDB'],
    profilePic,
  },
  {
    id: 2,
    name: 'Bob Smith',
    email: 'bob@example.com',
    slack: 'bob',
    score: 4,
    skills: ['HTML', 'CSS', 'React'],
    profilePic,
  },
  {
    id: 3,
    name: 'Carol Davis',
    email: 'carol@example.com',
    slack: 'carol',
    score: 9,
    skills: ['Node.js', 'React', 'MongoDB'],
    profilePic,
  },
  {
    id: 4,
    name: 'David Martin',
    email: 'david@example.com',
    slack: 'david',
    score: 6,
    skills: ['React', 'MongoDB', 'HTML', 'CSS'],
    profilePic,
  },
  {
    id: 5,
    name: 'Eve Thompson',
    email: 'eve@example.com',
    slack: 'eve',
    score: 3,
    skills: ['CSS', 'Node.js', 'React'],
    profilePic,
  },
  {
    id: 6,
    name: 'Sam Johnson',
    email: 'samjohnson@onecommunity.com',
    slack: 'samj',
    score: 3,
    skills: ['CSS', 'Node.js', 'React', 'Javascript'],
    profilePic,
  },
  {
    id: 7,
    name: 'Laurel Thomson',
    email: 'laurelthomson@onecommunity.com',
    slack: 'laurelt',
    score: 3,
    skills: ['CSS', 'Node.js', 'React', 'Javascript', 'MongoDB'],
    profilePic,
  },
];

function CommunityMembersList({ userTeamIds = [] }) {
  const [members, setMembers] = useState(mockMembers);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    let filtered = [...mockMembers];

    if (search) {
      filtered = filtered.filter(
        m =>
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.skills.some(skill => skill.toLowerCase().includes(search.toLowerCase())),
      );
    }

    if (filter) {
      filtered = filtered.filter(m => m.score > 7);
    }

    filtered.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });

    setMembers(filtered);
  }, [search, filter, sortOrder]);

  return (
    <div className="members-container">
      <h1 className="heading">One Community Members</h1>
      <div className="controls">
        <input
          className="search-input"
          placeholder="Search by team member name or skills"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button type="button" className="control-button" onClick={() => setFilter(prev => !prev)}>
          <span className="icon">≡</span> {filter ? 'Show All' : 'Filter (Score>7)'}
        </button>

        <button
          type="button"
          className="control-button"
          onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
        >
          AZ Sort {sortOrder === 'asc' ? '↓' : '↑'}
        </button>
      </div>
      <div className="cards-grid">
        {members.map(member => (
          <div
            key={member.id}
            className={`member-card ${userTeamIds.includes(member.id) ? 'highlight' : ''}`}
          >
            <img src={member.profilePic} alt={member.name} className="profile-img" />
            <p className="member-name">{member.name}</p>
            <p className="member-text">
              <span role="img" aria-label="email">
                📧
              </span>{' '}
              {member.email}
            </p>
            <p className="member-text">
              <img src={slackIcon} alt="Slack" className="slackicon" /> {member.slack}
            </p>

            <div className="member-footer">
              <p className="score">
                Score: <span className={member.score >= 5 ? 'green' : 'red'}>{member.score}</span>
                /10
              </p>

              <p className="skills">
                <span className="skills-label">Top Skills:</span> <br /> {member.skills.join(', ')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CommunityMembersList;
