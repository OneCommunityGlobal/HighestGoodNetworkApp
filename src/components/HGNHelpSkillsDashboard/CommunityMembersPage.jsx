// CommunityMembersPage.jsx
import { useState } from 'react';
import RankedUserList from './RankedUserList';

const availableSkills = ['React', 'Redux', 'HTML', 'CSS', 'MongoDB', 'Database', 'JavaScript'];
const availablePreferences = ['Design', 'Backend', 'Frontend', 'Data', 'Agile', 'DevOps'];

function CommunityMembersPage() {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedPreferences, setSelectedPreferences] = useState([]);

  const toggleItem = (item, selectedArray, setSelectedArray) => {
    setSelectedArray(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item],
    );
  };

  const renderToggleButtons = (items, selectedItems, toggleFn, color = '#4f46e5') => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
      {items.map(item => {
        const isSelected = selectedItems.includes(item);
        return (
          <button
            key={item}
            onClick={() => toggleFn(item)}
            type="button"
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: isSelected ? `2px solid ${color}` : '1px solid #ccc',
              background: isSelected ? color : '#f5f5f5',
              color: isSelected ? '#fff' : '#333',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all 0.3s ease',
            }}
          >
            {item}
          </button>
        );
      })}
    </div>
  );

  return (
    <div
      style={{
        padding: '30px',
        fontFamily: 'Arial, sans-serif',
        maxWidth: '900px',
        margin: '0 auto',
      }}
    >
      <h2 style={{ marginBottom: '15px', color: '#222' }}>Filter Community Members by Skills</h2>
      {renderToggleButtons(availableSkills, selectedSkills, skill =>
        toggleItem(skill, selectedSkills, setSelectedSkills),
      )}

      <h2 style={{ marginBottom: '15px', color: '#222' }}>Filter by Preferences</h2>
      {renderToggleButtons(availablePreferences, selectedPreferences, pref =>
        toggleItem(pref, selectedPreferences, setSelectedPreferences),
      )}

      {selectedSkills.length > 0 || selectedPreferences.length > 0 ? (
        <RankedUserList selectedSkills={selectedSkills} selectedPreferences={selectedPreferences} />
      ) : (
        <p style={{ color: '#666', fontSize: '1rem' }}>
          Select skills or preferences above to see filtered members.
        </p>
      )}
    </div>
  );
}

export default CommunityMembersPage;
