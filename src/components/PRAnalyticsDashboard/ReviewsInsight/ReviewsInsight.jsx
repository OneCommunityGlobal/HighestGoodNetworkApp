import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import './ReviewsInsight.css';
import ActionDoneGraph from './ActionDoneGraph';
import PRQualityGraph from './PRQualityGraph';

function ReviewsInsight() {
  const [duration, setDuration] = useState('Last Week');
  const [selectedTeams, setSelectedTeams] = useState(['All']);
  const darkMode = useSelector((state) => state.theme.darkMode);

  const teams = ['Team A', 'Team B', 'Team C', 'Team D'];

  // Sample data for PR actions
  const teamData = {
    'Team A': [10, 5, 8],
    'Team B': [12, 7, 6],
    'Team C': [8, 10, 5],
    'Team D': [15, 6, 9],
  };

  // Sample data for PR quality
  const qualityData = {
    'Team A': [5, 10, 15, 20],
    'Team B': [6, 12, 18, 24],
    'Team C': [4, 8, 12, 16],
    'Team D': [7, 14, 21, 28],
  };

  const handleDurationChange = (event) => {
    setDuration(event.target.value);
  };

  const handleTeamChange = (event) => {
    const options = Array.from(event.target.selectedOptions, (option) => option.value);
    setSelectedTeams(options.includes('All') ? ['All'] : options);
  };

  return (
    <div className={`reviews-insight-container ${darkMode ? 'dark-mode' : ''}`}>
      <h1>PR Reviews Insights</h1>

      {/* Filters Section */}
      <div className="filters">
        <div className="filter-item">
          <label htmlFor="duration-filter">Duration:</label>
          <select
            id="duration-filter"
            value={duration}
            onChange={handleDurationChange}
          >
            <option value="Last Week">Last Week</option>
            <option value="Last 2 weeks">Last 2 weeks</option>
            <option value="Last Month">Last Month</option>
            <option value="All Time">All Time</option>
          </select>
        </div>

        <div className="filter-item">
          <label htmlFor="team-filter">Team Code:</label>
          <select
            id="team-filter"
            multiple
            value={selectedTeams}
            onChange={handleTeamChange}
          >
            <option value="All">All Teams</option>
            {teams.map((team) => (
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

      {/* Graphs Section */}
      <div className="graphs">
        <ActionDoneGraph
          duration={duration}
          selectedTeams={selectedTeams}
          teamData={teamData}
        />
        <PRQualityGraph
          duration={duration}
          selectedTeams={selectedTeams}
          qualityData={qualityData}
        />
      </div>
    </div>
  );
}

export default ReviewsInsight;