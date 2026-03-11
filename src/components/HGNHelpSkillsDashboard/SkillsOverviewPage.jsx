import PropTypes from 'prop-types';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import RadarChart from '../HGNSkillsDashboard/SkillsProfilePage/components/RadarChart';
import { availablePreferences, availableSkills, formatSkillName } from './FilerData.js';
import RankedUserList from './RankedUserList';
import styles from './style/SkillsOverviewPage.module.css';

function Accordion({ title, children, defaultOpen = false, darkMode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={styles.accordion}>
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className={`${styles.accordionHeader} ${darkMode ? styles.dark : ''}`}
      >
        <span className={styles.accordionTitle}>{title}</span>
        <span className={styles.accordionIcon}>{open ? '−' : '+'}</span>
      </button>
      {open && <div className={styles.accordionContent}>{children}</div>}
    </div>
  );
}

Accordion.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  defaultOpen: PropTypes.bool,
  darkMode: PropTypes.bool,
};

function SkillsOverviewPage() {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const darkMode = useSelector(state => state.theme.darkMode);
  const userProfile = useSelector(state => state.userProfile);

  const toggleItem = (item, selectedArray, setSelectedArray) => {
    setSelectedArray(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item],
    );
  };

  const hasFilters =
    selectedSkills.length > 0 || selectedPreferences.length > 0 || searchQuery.trim().length > 0;

  return (
    <div className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}>
      <h1 className={styles.title}>Skills Overview</h1>

      {/* Radar Chart for logged-in user */}
      <div className={`${styles.radarSection} ${darkMode ? styles.radarDark : ''}`}>
        <h2 className={styles.sectionTitle}>Your Skills Radar</h2>
        <div className={styles.radarWrapper}>
          {userProfile?.skillInfo ? (
            <RadarChart profileData={userProfile} compact={false} />
          ) : (
            <p className={styles.noDataMsg}>Complete the skills survey to view your radar chart.</p>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <h2 className={styles.sectionTitle}>Find Community Members</h2>
      <div className={`${styles.searchContainer} ${darkMode ? styles.darkSearch : ''}`}>
        <input
          type="text"
          placeholder="Search members by name or skill..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className={`${styles.searchInput} ${darkMode ? styles.darkSearchInput : ''}`}
        />
        {searchQuery && (
          <button
            type="button"
            className={`${styles.clearButton} ${darkMode ? styles.darkClearButton : ''}`}
            onClick={() => setSearchQuery('')}
          >
            ✕
          </button>
        )}
      </div>

      {/* Skill Filters */}
      <Accordion title="Filter by Skills" defaultOpen darkMode={darkMode}>
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
      </Accordion>

      {/* Preference Filters */}
      <Accordion title="Filter by Preferences" darkMode={darkMode}>
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
      </Accordion>

      {/* Results */}
      <div className={styles.resultsSection}>
        {hasFilters ? (
          <RankedUserList
            selectedSkills={selectedSkills}
            selectedPreferences={selectedPreferences}
            searchQuery={searchQuery.trim()}
          />
        ) : (
          <p className={styles.message}>
            Search or select skills and preferences above to find community members.
          </p>
        )}
      </div>
    </div>
  );
}

export default SkillsOverviewPage;
