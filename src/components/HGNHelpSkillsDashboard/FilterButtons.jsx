import PropTypes from 'prop-types';
import { availablePreferences, availableSkills, formatSkillName, toggleItem } from './FilerData.js';
import styles from './style/SkillsOverviewPage.module.css';

export function SkillFilterButtons({ selectedSkills, setSelectedSkills, darkMode }) {
  return (
    <div className={styles.filterGroup}>
      {availableSkills.map(skillKey => (
        <button
          key={skillKey}
          type="button"
          onClick={() => toggleItem(skillKey, selectedSkills, setSelectedSkills)}
          className={`${styles.skillButton} ${
            selectedSkills.includes(skillKey) ? styles.selected : ''
          } ${darkMode ? styles.darkButton : ''}`}
        >
          {formatSkillName(skillKey)}
        </button>
      ))}
    </div>
  );
}

export function PreferenceFilterButtons({ selectedPreferences, setSelectedPreferences, darkMode }) {
  return (
    <div className={styles.filterGroup}>
      {availablePreferences.map(pref => (
        <button
          key={pref}
          type="button"
          onClick={() => toggleItem(pref, selectedPreferences, setSelectedPreferences)}
          className={`${styles.preferenceButton} ${
            selectedPreferences.includes(pref) ? styles.selected : ''
          } ${darkMode ? styles.darkButton : ''}`}
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
  darkMode: PropTypes.bool,
};

PreferenceFilterButtons.propTypes = {
  selectedPreferences: PropTypes.arrayOf(PropTypes.string).isRequired,
  setSelectedPreferences: PropTypes.func.isRequired,
  darkMode: PropTypes.bool,
};
