import React, { useState } from 'react';
import './ReviewsInsight.css';
import ActionDoneGraph from './ActionDoneGraph';
import PRQualityGraph from './PRQualityGraph';

function ReviewsInsight() {
  const [duration, setDuration] = useState('Last Week');
  const [selectedTeams, setSelectedTeams] = useState([]);

  const handleDurationChange = (event) => {
    setDuration(event.target.value);
  };

  const handleTeamChange = (event) => {
    const options = Array.from(event.target.selectedOptions, (option) => option.value);
    setSelectedTeams(options);
  };

  return (
    <div className="reviews-insight-container">
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
            <option value="Team A">Team A</option>
            <option value="Team B">Team B</option>
            <option value="Team C">Team C</option>
            <option value="Team D">Team D</option>
          </select>
        </div>
      </div>

      {/* Display Selected Teams */}
      <div className="selected-teams">
        {selectedTeams.length === 1 ? (
          <p>Selected Team: {selectedTeams[0]}</p>
        ) : selectedTeams.length > 1 ? (
          <p>Selected Teams: {selectedTeams.join(', ')}</p>
        ) : (
          <p>No Teams Selected</p>
        )}
      </div>

      {/* Graphs Section */}
      <div className="graphs">
        <ActionDoneGraph duration={duration} selectedTeams={selectedTeams} />
        <PRQualityGraph duration={duration} selectedTeams={selectedTeams} />
      </div>
    </div>
  );
}

export default ReviewsInsight;