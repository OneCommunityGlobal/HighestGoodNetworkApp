import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Select from 'react-select';
import styles from './ReviewsInsight.module.css';
import ActionDoneGraph from './ActionDoneGraph';
import PRQualityGraph from './PRQualityGraph';
import { fetchReviewsInsights } from '../../../actions/prAnalytics/reviewsInsightsAction';
import { getAllTeamCode } from '../../../actions/allTeamsAction';

function ReviewsInsight() {
  const [duration, setDuration] = useState('Last Week');
  const [selectedTeams, setSelectedTeams] = useState([{ value: 'All', label: 'All Teams' }]);
  const [teamData, setTeamData] = useState({});
  const [qualityData, setQualityData] = useState({});
  const [dataViewActive, setDataViewActive] = useState(false);
  const [orderedTeamIds, setOrderedTeamIds] = useState([]);
  const dispatch = useDispatch();

  const { loading, data, error } = useSelector(state => state.reviewsInsights);
  const teamCodes = useSelector(state => state.allTeamsData.allTeamCode.distinctTeamCodes);
  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    dispatch(getAllTeamCode(true));
  }, [dispatch]);

  useEffect(() => {
    const durationMapping = {
      'Last Week': 'lastWeek',
      'Last 2 weeks': 'last2weeks',
      'Last Month': 'lastMonth',
      'All Time': 'allTime',
    };

    const queryParams = {
      duration: durationMapping[duration],
      teams:
        selectedTeams.length === 0 || selectedTeams.some(team => team.value === 'All')
          ? ''
          : selectedTeams.map(team => team.value).join(','),
    };

    const token = localStorage.getItem('token');
    dispatch(fetchReviewsInsights(queryParams, token));
  }, [duration, selectedTeams, dispatch]);

  useEffect(() => {
    if (data && data.teams) {
      const formattedTeamData = {};
      const formattedQualityData = {};
      const teamIds = []; // Track team order

      data.teams.forEach(team => {
        const actionSummary = Array.isArray(team.actionSummary) ? team.actionSummary : [];
        const qualityDistribution = Array.isArray(team.qualityDistribution)
          ? team.qualityDistribution
          : [];

        formattedTeamData[team._id] = {
          actionSummary: {
            Approved: actionSummary.find(action => action.actionTaken === 'Approved')?.count || 0,
            'Changes Requested':
              actionSummary.find(action => action.actionTaken === 'Changes Requested')?.count || 0,
            Commented: actionSummary.find(action => action.actionTaken === 'Commented')?.count || 0,
          },
        };

        formattedQualityData[team._id] = {
          NotApproved:
            qualityDistribution.find(quality => quality.qualityLevel === 'Not approved')?.count ||
            0,
          LowQuality:
            qualityDistribution.find(quality => quality.qualityLevel === 'Low Quality')?.count || 0,
          Sufficient:
            qualityDistribution.find(quality => quality.qualityLevel === 'Sufficient')?.count || 0,
          Exceptional:
            qualityDistribution.find(quality => quality.qualityLevel === 'Exceptional')?.count || 0,
          memberCount: team.memberCount,
        };

        teamIds.push(team._id);
      });

      // Sort team IDs alphabetically for consistent ordering and remove duplicates
      const sortedTeamIds = [...new Set(teamIds)].sort();

      setTeamData(formattedTeamData);
      setQualityData(formattedQualityData);
      setOrderedTeamIds(sortedTeamIds);
    }
  }, [data]);

  const handleDurationChange = event => {
    setDuration(event.target.value);
  };

  const handleTeamChange = selectedOptions => {
    setSelectedTeams(selectedOptions || []);
  };

  const teamOptions = [
    { value: 'All', label: 'All Teams' },
    ...(teamCodes || []).map(team => ({ value: team, label: team })),
  ];

  return (
    <div
      className={`${styles.reviewsInsightContainer} ${darkMode ? styles.darkModeForeground : ''} ${
        darkMode ? styles.darkModeBackground : ''
      }`}
    >
      <h1 className={darkMode ? styles.darkModeForeground : styles.heading}>PR Reviews Insights</h1>

      <div className={`${styles.riFilters} ${darkMode ? styles.darkModeForeground : ''}`}>
        <div className={`${styles.riFilterItem} ${darkMode ? styles.darkModeForeground : ''}`}>
          <label
            htmlFor="ri-duration-filter"
            className={`${styles.riFilterItemLabel} ${darkMode ? styles.darkModeForeground : ''}`}
          >
            Duration:
          </label>
          <select
            id="ri-duration-filter"
            value={duration}
            onChange={handleDurationChange}
            className={`${styles.riDurationFilter} ${
              darkMode ? styles.riDurationFilterDarkMode : ''
            }`}
          >
            <option value="Last Week">Last Week</option>
            <option value="Last 2 weeks">Last 2 weeks</option>
            <option value="Last Month">Last Month</option>
            <option value="All Time">All Time</option>
          </select>
        </div>

        <div className={`${styles.riFilterItem} ${darkMode ? styles.darkModeForeground : ''}`}>
          <label
            htmlFor="team-filter"
            className={`${styles.riFilterItemLabel} ${darkMode ? styles.darkModeForeground : ''}`}
          >
            Team Code:
          </label>
          <Select
            id="team-filter"
            isMulti
            options={teamOptions}
            value={selectedTeams}
            onChange={handleTeamChange}
            placeholder="Search and select teams..."
            styles={{
              control: base => ({
                ...base,
                backgroundColor: darkMode ? '#1c2541' : '#fff',
                boxShadow: '2px 2px 4px 1px black',
                border: 'none',
                color: darkMode ? '#f1f1f1' : '#000',
                minHeight: '40px',
              }),
              placeholder: base => ({
                ...base,
                color: darkMode ? '#f1f1f1' : '#000',
              }),
              input: base => ({
                ...base,
                color: darkMode ? '#f1f1f1' : '#000',
              }),
              multiValue: base => ({
                ...base,
                backgroundColor: darkMode ? '#1c2541' : '#e0e0e0',
                color: darkMode ? '#f1f1f1' : '#000',
              }),
              multiValueLabel: base => ({
                ...base,
                color: darkMode ? '#f1f1f1' : '#000',
              }),
              multiValueRemove: base => ({
                ...base,
                color: darkMode ? '#f1f1f1' : '#000',
                ':hover': {
                  backgroundColor: '#dc3545',
                  color: '#fff',
                },
              }),
              dropdownIndicator: base => ({
                ...base,
                color: darkMode ? '#f1f1f1' : '#000',
              }),
              menu: base => ({
                ...base,
                backgroundColor: darkMode ? '#1c2541' : '#fff',
                color: darkMode ? '#f1f1f1' : '#000',
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isFocused
                  ? darkMode
                    ? '#34495e'
                    : '#e0e0e0'
                  : darkMode
                  ? '#1c2541'
                  : '#fff',
                color: darkMode ? '#f1f1f1' : '#000',
              }),
            }}
          />
        </div>

        <div className={`${styles.riFilterItem} ${darkMode ? styles.darkModeForeground : ''}`}>
          <span className={styles.riDataviewTitle}>Data View</span>
          <div className={styles.riToggleWrap}>
            <label className={styles.riSwitch}>
              <input
                type="checkbox"
                checked={dataViewActive}
                onChange={() => setDataViewActive(v => !v)}
                aria-label="Toggle data view: Percent vs Number"
                className={styles.riSwitchInput}
              />
              <span className={`${styles.riSlider} ${darkMode ? styles.riSliderDarkMode : ''}`} />
            </label>

            <span className={`${styles.modeLabel} ${darkMode ? styles.darkModeForeground : ''}`}>
              {dataViewActive ? 'PERCENT' : 'NUMBER'}
            </span>
          </div>
        </div>
      </div>

      <div>
        {selectedTeams.length === 0 ? (
          <p className={`${styles.riSelectedTeams} ${darkMode ? styles.darkModeForeground : ''}`}>
            No teams selected
          </p>
        ) : selectedTeams.some(team => team.value === 'All') ? (
          <p className={`${styles.riSelectedTeams} ${darkMode ? styles.darkModeForeground : ''}`}>
            Selected Teams: All Teams
          </p>
        ) : (
          <p className={`${styles.riSelectedTeams} ${darkMode ? styles.darkModeForeground : ''}`}>
            Selected Teams: {selectedTeams.map(team => team.label).join(', ')}
          </p>
        )}
      </div>

      {loading && (
        <div className={`${styles.riLoading} ${darkMode ? styles.darkModeForeground : ''}`}>
          Loading...
        </div>
      )}
      {error && <div className={`${styles.riError}`}>{error}</div>}
      {!loading && !error && (
        <div className={`${styles.riGraphs} ${darkMode ? styles.darkModeForeground : ''}`}>
          <ActionDoneGraph
            selectedTeams={selectedTeams}
            teamData={teamData}
            orderedTeamIds={orderedTeamIds}
          />
          <PRQualityGraph
            selectedTeams={selectedTeams}
            qualityData={qualityData}
            isDataViewActive={dataViewActive}
            orderedTeamIds={orderedTeamIds}
          />
        </div>
      )}
    </div>
  );
}

export default ReviewsInsight;
