import jwtDecode from 'jwt-decode';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import config from '~/config.json';
import httpService from '~/services/httpService';
import { ENDPOINTS } from '~/utils/URL';
import RadarChart from '../HGNSkillsDashboard/SkillsProfilePage/components/RadarChart';
import Accordion from './Accordion';
import { PreferenceFilterButtons, SkillFilterButtons } from './FilterButtons';
import RankedUserList from './RankedUserList';
import SearchBar from './SearchBar';
import styles from './style/SkillsOverviewPage.module.css';

function SkillsOverviewPage() {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const darkMode = useSelector(state => state.theme.darkMode);
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // The skills survey lives behind its own endpoint and is not part of state.userProfile,
  // so this page has to fetch it itself rather than read it from the store.
  useEffect(() => {
    const token = localStorage.getItem(config.tokenKey);
    let userId;
    try {
      userId = token ? jwtDecode(token)?.userid : undefined;
    } catch (_) {
      userId = undefined;
    }

    if (!userId) {
      setLoadingProfile(false);
      return;
    }

    httpService.setjwt(token);
    httpService
      .get(ENDPOINTS.SKILLS_PROFILE(userId))
      // isPlaceholder means the user has not filled in the survey yet
      .then(({ data }) => setProfileData(data?.isPlaceholder ? null : data))
      .catch(() => setProfileData(null))
      .finally(() => setLoadingProfile(false));
  }, []);

  const hasFilters =
    selectedSkills.length > 0 || selectedPreferences.length > 0 || searchQuery.trim().length > 0;

  let radarContent;
  if (loadingProfile) {
    radarContent = <p className={styles.noDataMsg}>Loading your skills radar...</p>;
  } else if (profileData?.skillInfo) {
    radarContent = <RadarChart profileData={profileData} compact={false} />;
  } else {
    radarContent = (
      <p className={styles.noDataMsg}>Complete the skills survey to view your radar chart.</p>
    );
  }

  return (
    <div className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}>
      <h1 className={styles.title}>Skills Overview</h1>

      {/* Radar Chart for logged-in user */}
      <div className={`${styles.radarSection} ${darkMode ? styles.radarDark : ''}`}>
        <h2 className={styles.sectionTitle}>Your Skills Radar</h2>
        <div className={styles.radarWrapper}>{radarContent}</div>
      </div>

      {/* Search Bar */}
      <h2 className={styles.sectionTitle}>Find Community Members</h2>
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} darkMode={darkMode} />

      {/* Skill Filters */}
      <Accordion title="Filter by Skills" defaultOpen darkMode={darkMode}>
        <SkillFilterButtons
          selectedSkills={selectedSkills}
          setSelectedSkills={setSelectedSkills}
          darkMode={darkMode}
        />
      </Accordion>

      {/* Preference Filters */}
      <Accordion title="Filter by Preferences" darkMode={darkMode}>
        <PreferenceFilterButtons
          selectedPreferences={selectedPreferences}
          setSelectedPreferences={setSelectedPreferences}
          darkMode={darkMode}
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
