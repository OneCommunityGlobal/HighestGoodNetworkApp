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
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [teamData, setTeamData] = useState({});
  const [qualityData, setQualityData] = useState({});
  const dispatch = useDispatch();

  const { loading, data, error } = useSelector(state => state.reviewsInsights);
  const teamCodes = useSelector(state => state.allTeamsData.allTeamCode.distinctTeamCodes);
  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    dispatch(getAllTeamCode());
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
        };
      });
      setTeamData(formattedTeamData);
      setQualityData(formattedQualityData);
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
    <div className={`${styles.reviewsInsightContainer} ${darkMode ? 'dark-mode' : ''}`}>
      <h1>PR Reviews Insights</h1>

      <div className={styles.riFilters}>
        <div className={styles.riFilterItem}>
          <label htmlFor="ri-duration-filter">Duration:</label>
          <select id="ri-duration-filter" value={duration} onChange={handleDurationChange}>
            <option value="Last Week">Last Week</option>
            <option value="Last 2 weeks">Last 2 weeks</option>
            <option value="Last Month">Last Month</option>
            <option value="All Time">All Time</option>
          </select>
        </div>

        <div className={styles.riFilterItem}>
          <label htmlFor="team-filter">Team Code:</label>
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
      </div>

      <div className={styles.riSelectedTeams}>
        {selectedTeams.length === 0 ? (
          <p>No teams selected</p>
        ) : selectedTeams.some(team => team.value === 'All') ? (
          <p>Selected Teams: All Teams</p>
        ) : (
          <p>Selected Teams: {selectedTeams.map(team => team.label).join(', ')}</p>
        )}
      </div>

      {loading && <div className={styles.riLoading}>Loading...</div>}
      {error && <div className={styles.riError}>{error}</div>}
      {!loading && !error && (
        <div className={styles.riGraphs}>
          <ActionDoneGraph selectedTeams={selectedTeams} teamData={teamData} />
          <PRQualityGraph selectedTeams={selectedTeams} qualityData={qualityData} />
        </div>
      )}
    </div>
  );
}

export default ReviewsInsight;
