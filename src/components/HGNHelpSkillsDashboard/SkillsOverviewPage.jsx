import { useState } from 'react';
import { useSelector } from 'react-redux';
import RadarChart from '../HGNSkillsDashboard/SkillsProfilePage/components/RadarChart';
import Accordion from './Accordion';
import { PreferenceFilterButtons, SkillFilterButtons } from './FilterButtons';
import RankedUserList from './RankedUserList';
import styles from './style/SkillsOverviewPage.module.css';

function SkillsOverviewPage() {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const darkMode = useSelector(state => state.theme.darkMode);
  const userProfile = useSelector(state => state.userProfile);

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
        <SkillFilterButtons selectedSkills={selectedSkills} setSelectedSkills={setSelectedSkills} />
      </Accordion>

      {/* Preference Filters */}
      <Accordion title="Filter by Preferences" darkMode={darkMode}>
        <PreferenceFilterButtons
          selectedPreferences={selectedPreferences}
          setSelectedPreferences={setSelectedPreferences}
        />
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
