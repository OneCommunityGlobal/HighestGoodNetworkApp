import PropTypes from 'prop-types';
import { availablePreferences, availableSkills, formatSkillName, toggleItem } from './FilerData.js';
import styles from './style/CommunityMembersPage.module.css';

export function SkillFilterButtons({ selectedSkills, setSelectedSkills }) {
  return (
    <div className={styles.filterGroup}>
      {availableSkills.map(skillKey => (
        <button
          key={skillKey}
          type="button"
          onClick={() => toggleItem(skillKey, selectedSkills, setSelectedSkills)}
          className={`${styles.skillButton} ${
            selectedSkills.includes(skillKey) ? styles.selected : ''
          }`}
        >
          {formatSkillName(skillKey)}
        </button>
      ))}
    </div>
  );
}

export function PreferenceFilterButtons({ selectedPreferences, setSelectedPreferences }) {
  return (
    <div className={styles.filterGroup}>
      {availablePreferences.map(pref => (
        <button
          key={pref}
          type="button"
          onClick={() => toggleItem(pref, selectedPreferences, setSelectedPreferences)}
          className={`${styles.preferenceButton} ${
            selectedPreferences.includes(pref) ? styles.selected : ''
          }`}
        >
          {pref}
        </button>
      ))}
    </div>
  );
}

SkillFilterButtons.propTypes = {
  selectedSkills: PropTypes.arrayOf(PropTypes.string).isRequired,
  setSelectedSkills: PropTypes.func.isRequired,
};

PreferenceFilterButtons.propTypes = {
  selectedPreferences: PropTypes.arrayOf(PropTypes.string).isRequired,
  setSelectedPreferences: PropTypes.func.isRequired,
};
