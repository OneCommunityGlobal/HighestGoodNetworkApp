import { useState } from 'react';
import RankedUserList from './RankedUserList'; // wherever your RankedUserList is

const availableSkills = ['React', 'Redux', 'HTML', 'CSS', 'MongoDB', 'Database', 'Agile'];

function CommunityMembersPage() {
  const [selectedSkills, setSelectedSkills] = useState([]);

  const handleCheckboxChange = skill => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill],
    );
  };

  return (
    <div>
      <h2>Select Skills to Filter Community Members</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
        {availableSkills.map(skill => (
          <label key={skill}>
            <input
              type="checkbox"
              checked={selectedSkills.includes(skill)}
              onChange={() => handleCheckboxChange(skill)}
            />
            {skill}
          </label>
        ))}
      </div>

      {selectedSkills.length > 0 && <RankedUserList selectedSkills={selectedSkills} />}
    </div>
  );
}

export default CommunityMembersPage;
