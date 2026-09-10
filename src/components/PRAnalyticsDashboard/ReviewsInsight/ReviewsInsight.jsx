import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import { getAllTeamCode } from '../../../actions/allTeamsAction';
import { fetchReviewsInsights } from '../../../actions/prAnalytics/reviewsInsightsAction';
import ActionDoneGraph from './ActionDoneGraph';
import PRQualityGraph from './PRQualityGraph';
import sharedStyles from './ReviewsInsight.module.css';

// Dark-mode styling for the Team Code <Select>. Light mode keeps react-select's
// own defaults (`base.*`); only colours change under dark mode. Shared helpers
// keep the repeated element shapes to a single definition each.
const getTeamSelectStyles = darkMode => {
  const surface = darkMode ? '#1c2541' : '#fff';
  const fg = darkMode ? '#f1f1f1' : '#000';

  const dmText = base => ({ ...base, color: darkMode ? '#f1f1f1' : base.color });
  const dmIndicator = base => ({
    ...base,
    color: darkMode ? '#b8c1d9' : base.color,
    ':hover': { color: darkMode ? '#f1f1f1' : base.color },
  });

  return {
    control: base => ({
      ...base,
      backgroundColor: surface,
      boxShadow: '2px 2px 4px 1px black',
      border: 'none',
      color: fg,
      minHeight: '40px',
    }),
    menu: base => ({ ...base, backgroundColor: surface, color: fg }),
    menuList: base => ({ ...base, backgroundColor: surface, color: fg }),
    option: (base, state) => {
      let optionBg = surface;
      if (state.isFocused) optionBg = darkMode ? '#23304d' : '#e6e6e6';
      return { ...base, backgroundColor: optionBg, color: fg, cursor: 'pointer' };
    },
    // Selected-team chips: without these, react-select's default light grey chip
    // stays light in dark mode.
    multiValue: base => ({
      ...base,
      backgroundColor: darkMode ? '#334155' : base.backgroundColor,
    }),
    multiValueLabel: dmText,
    multiValueRemove: base => ({
      ...base,
      color: darkMode ? '#f1f1f1' : base.color,
      ':hover': {
        backgroundColor: darkMode ? '#48597e' : '#ffbdad',
        color: darkMode ? '#fff' : '#de350b',
      },
    }),
    placeholder: base => ({ ...base, color: darkMode ? '#b8c1d9' : base.color }),
    input: dmText,
    indicatorSeparator: base => ({
      ...base,
      backgroundColor: darkMode ? '#48597e' : base.backgroundColor,
    }),
    dropdownIndicator: dmIndicator,
    clearIndicator: dmIndicator,
  };
};

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
            Approved: actionSummary.find(a => a.actionTaken === 'Approved')?.count || 0,
            'Changes Requested':
              actionSummary.find(a => a.actionTaken === 'Changes Requested')?.count || 0,
            Commented: actionSummary.find(a => a.actionTaken === 'Commented')?.count || 0,
          },
          memberCount: team.memberCount || 0,
        };

        formattedQualityData[team._id] = {
          NotApproved: qualityDistribution.find(q => q.qualityLevel === 'Not approved')?.count || 0,
          LowQuality: qualityDistribution.find(q => q.qualityLevel === 'Low Quality')?.count || 0,
          Sufficient: qualityDistribution.find(q => q.qualityLevel === 'Sufficient')?.count || 0,
          Exceptional: qualityDistribution.find(q => q.qualityLevel === 'Exceptional')?.count || 0,
        };

        teamIds.push(team._id);
      });

      // Sort team IDs alphabetically for consistent ordering and remove duplicates
      const sortedTeamIds = [...new Set(teamIds)].sort((a, b) => a.localeCompare(b));

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
            styles={getTeamSelectStyles(darkMode)}
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
        <div
          className={`${sharedStyles.riGraphs} ${darkMode ? sharedStyles.darkModeForeground : ''}`}
        >
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
