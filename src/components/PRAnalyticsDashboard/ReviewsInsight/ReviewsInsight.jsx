import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import './ReviewsInsight.css';
import ActionDoneGraph from './ActionDoneGraph';
import PRQualityGraph from './PRQualityGraph';
import { fetchReviewsInsights } from '../../../actions/prAnalytics/reviewsInsightsAction';

function ReviewsInsight() {
  const [duration, setDuration] = useState('Last Week');
  const [selectedTeams, setSelectedTeams] = useState(['All']);
  const [teamData, setTeamData] = useState({});
  const [qualityData, setQualityData] = useState({});
  const dispatch = useDispatch();
  const { loading, data, error } = useSelector(state => state.reviewsInsights);
  const darkMode = useSelector(state => state.theme.darkMode);

  const teams = ['Team A', 'Team B', 'Team C', 'Team D'];

  const handleDurationChange = event => {
    setDuration(event.target.value);
  };

  const handleTeamChange = event => {
    const options = Array.from(event.target.selectedOptions, option => option.value);
    setSelectedTeams(options.includes('All') ? ['All'] : options);
  };

  useEffect(() => {
    const durationMapping = {
      'Last Week': 'lastWeek',
      'Last 2 weeks': 'last2weeks',
      'Last Month': 'lastMonth',
      'All Time': 'allTime',
    };

    const queryParams = {
      duration: durationMapping[duration],
      teams: selectedTeams.includes('All') ? '' : selectedTeams.join(','),
    };

    const token = localStorage.getItem('token');
    dispatch(fetchReviewsInsights(queryParams, token));
  }, [duration, selectedTeams, dispatch]);

  useEffect(() => {
    if (data && data.teams) {
      const formattedTeamData = {};
      const formattedQualityData = {};

      data.teams.forEach(team => {
        // Ensure actionSummary and qualityDistribution are arrays
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

  return (
    <div className={`reviews-insight-container ${darkMode ? 'dark-mode' : ''}`}>
      <h1>PR Reviews Insights</h1>

      <div className="filters">
        <div className="filter-item">
          <label htmlFor="duration-filter">Duration:</label>
          <select id="duration-filter" value={duration} onChange={handleDurationChange}>
            <option value="Last Week">Last Week</option>
            <option value="Last 2 weeks">Last 2 weeks</option>
            <option value="Last Month">Last Month</option>
            <option value="All Time">All Time</option>
          </select>
        </div>

        <div className="filter-item">
          <label htmlFor="team-filter">Team Code:</label>
          <select id="team-filter" multiple value={selectedTeams} onChange={handleTeamChange}>
            <option value="All">All Teams</option>
            {teams.map(team => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Display Selected Teams */}
      <div className="selected-teams">
        {selectedTeams.includes('All') ? (
          <p>Selected Teams: All Teams</p>
        ) : selectedTeams.length === 1 ? (
          <p>Selected Team: {selectedTeams[0]}</p>
        ) : (
          <p>Selected Teams: {selectedTeams.join(', ')}</p>
        )}
      </div>

      {/* Loading, Error, and Graphs Section */}
      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}
      {!loading && !error && (
        <div className="graphs">
          <ActionDoneGraph duration={duration} selectedTeams={selectedTeams} teamData={teamData} />
          <PRQualityGraph
            duration={duration}
            selectedTeams={selectedTeams}
            qualityData={qualityData}
          />
        </div>
      )}
    </div>
  );
}

export default ReviewsInsight;
