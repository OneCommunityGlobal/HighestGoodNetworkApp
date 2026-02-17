import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Select from 'react-select';
import sharedStyles from './ReviewsInsight.module.css';
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

      data.teams.forEach(team => {
        const actionSummary = Array.isArray(team.actionSummary) ? team.actionSummary : [];
        const qualityDistribution = Array.isArray(team.qualityDistribution)
          ? team.qualityDistribution
          : [];

        formattedTeamData[team._id] = {
          actionSummary: {
            Approved: actionSummary.find(a => a.actionTaken === 'Approved')?.count || 0,
            'Changes Requested':
              actionSummary.find(a => a.actionTaken === 'Changes Requested')?.count || 0,
            Commented: actionSummary.find(a => a.actionTaken === 'Commented')?.count || 0,
          },
        };

        formattedQualityData[team._id] = {
          NotApproved: qualityDistribution.find(q => q.qualityLevel === 'Not approved')?.count || 0,
          LowQuality: qualityDistribution.find(q => q.qualityLevel === 'Low Quality')?.count || 0,
          Sufficient: qualityDistribution.find(q => q.qualityLevel === 'Sufficient')?.count || 0,
          Exceptional: qualityDistribution.find(q => q.qualityLevel === 'Exceptional')?.count || 0,
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
    <div
      className={`${sharedStyles.reviewsInsightContainer} ${darkMode ? sharedStyles.darkMode : ''}`}
    >
      <h1>PR Reviews Insights</h1>

      <div className={sharedStyles.riFilters}>
        <div className={sharedStyles.riFilterItem}>
          <label htmlFor="ri-duration-filter">Duration:</label>
          <select
            id="ri-duration-filter"
            className={`${sharedStyles.riDurationFilter} ${
              darkMode ? sharedStyles.riDurationFilterDarkMode : ''
            }`}
            value={duration}
            onChange={handleDurationChange}
          >
            <option value="Last Week">Last Week</option>
            <option value="Last 2 weeks">Last 2 weeks</option>
            <option value="Last Month">Last Month</option>
            <option value="All Time">All Time</option>
          </select>
        </div>

        <div className={sharedStyles.riFilterItem}>
          <label htmlFor="team-filter">Team Code:</label>
          <Select
            id="team-filter"
            isMulti
            options={teamOptions}
            value={selectedTeams}
            onChange={handleTeamChange}
            placeholder="Search and select teams..."
            classNamePrefix="react-select"
            styles={{
              control: base => ({
                ...base,
                backgroundColor: darkMode ? '#1c2541' : '#fff',
                boxShadow: '2px 2px 4px 1px black',
                border: 'none',
                color: darkMode ? '#f1f1f1' : '#000',
                minHeight: '40px',
              }),

              menu: base => ({
                ...base,
                backgroundColor: darkMode ? '#1c2541' : '#fff',
                color: darkMode ? '#f1f1f1' : '#000',
              }),

              menuList: base => ({
                ...base,
                backgroundColor: darkMode ? '#1c2541' : '#fff',
                color: darkMode ? '#f1f1f1' : '#000',
              }),

              option: (base, state) => ({
                ...base,
                backgroundColor: state.isFocused
                  ? darkMode
                    ? '#23304d'
                    : '#e6e6e6'
                  : darkMode
                  ? '#1c2541'
                  : '#fff',
                color: darkMode ? '#f1f1f1' : '#000',
                cursor: 'pointer',
              }),
            }}
          />
        </div>

        <div
          className={`${sharedStyles.riFilterItem} ${
            darkMode ? sharedStyles.darkModeForeground : ''
          }`}
        >
          <span className={sharedStyles.riDataviewTitle}>Data View</span>
          <div className={sharedStyles.riToggleWrap}>
            <label className={sharedStyles.riSwitch}>
              <input
                type="checkbox"
                checked={dataViewActive}
                onChange={() => setDataViewActive(v => !v)}
                aria-label="Toggle data view: Percent vs Number"
                className={sharedStyles.riSwitchInput}
              />
              <span
                className={`${sharedStyles.riSlider} ${
                  darkMode ? sharedStyles.riSliderDarkMode : ''
                }`}
              />
            </label>

            <span
              className={`${sharedStyles.riModeLabel} ${
                darkMode ? sharedStyles.darkModeForeground : ''
              }`}
            >
              {dataViewActive ? 'PERCENT' : 'NUMBER'}
            </span>
          </div>
        </div>
      </div>

      <div className={sharedStyles.riSelectedTeams}>
        {selectedTeams.length === 0 ? (
          <p
            className={`${sharedStyles.riSelectedTeams} ${
              darkMode ? sharedStyles.darkModeForeground : ''
            }`}
          >
            No teams selected
          </p>
        ) : selectedTeams.some(team => team.value === 'All') ? (
          <p
            className={`${sharedStyles.riSelectedTeams} ${
              darkMode ? sharedStyles.darkModeForeground : ''
            }`}
          >
            Selected Teams: All Teams
          </p>
        ) : (
          <p
            className={`${sharedStyles.riSelectedTeams} ${
              darkMode ? sharedStyles.darkModeForeground : ''
            }`}
          >
            Selected Teams: {selectedTeams.map(team => team.label).join(', ')}
          </p>
        )}
      </div>

      {loading && <div className={sharedStyles.riLoading}>Loading...</div>}
      {error && <div className={sharedStyles.riError}>{error}</div>}
      {!loading && !error && (
        <div className={sharedStyles.riGraphs}>
          <ActionDoneGraph selectedTeams={selectedTeams} teamData={teamData} />
          <PRQualityGraph
            selectedTeams={selectedTeams}
            qualityData={qualityData}
            isDataViewActive={dataViewActive}
          />
        </div>
      )}
    </div>
  );
}

export default ReviewsInsight;
