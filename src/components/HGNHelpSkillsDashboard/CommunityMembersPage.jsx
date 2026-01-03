import React, { useState, useMemo } from 'react';
import RankedUserList from './RankedUserList';

const availableSkills = ['React', 'Redux', 'HTML', 'CSS', 'MongoDB', 'Database', 'Agile'];

function CommunityMembersPage() {
  const [selectedSkills, setSelectedSkills] = useState([]);

  const handleCheckboxChange = skill => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill],
    );
  };

  // EFFECTIVE SKILLS = what we pass to RankedUserList
  const effectiveSkills = useMemo(() => {
    return selectedSkills.length > 0 ? selectedSkills : availableSkills;
  }, [selectedSkills]);

  return (
    <div>
      <h1>Community Members</h1>

      <div style={{ marginBottom: 16 }}>
        <strong>Filter by skills:</strong>
        <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
          {availableSkills.map(skill => (
            <label key={skill} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="checkbox"
                checked={selectedSkills.includes(skill)}
                onChange={() => handleCheckboxChange(skill)}
              />
              {skill}
            </label>
          ))}
        </div>
      </div>

      <RankedUserList selectedSkills={effectiveSkills} />
    </div>
  );
}

export default CommunityMembersPage;
