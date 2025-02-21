import React from 'react';
import { TOTAL_TEAMS, ACTIVE_TEAMS } from '../../languages/en/ui';
import './TeamsOverview.css';

const TeamsOverview = ({ numberOfTeams, numberOfActiveTeams }) => {
  const numberOfNonActiveTeams = numberOfTeams - numberOfActiveTeams;

  return (
    <div className="teams__overview--top">
      {/* Total Teams Card */}
      <div className="card" id="card_team" data-testid="card_team">
        <div className="card-body">
          <h6 className="card-text">
            <i className="fa fa-users" aria-hidden="true"></i> {TOTAL_TEAMS}: {numberOfTeams}
          </h6>
        </div>
      </div>

      {/* Active Teams Card */}
      <div className="card" id="card_active" data-testid="card_active">
        <div className="card-body">
          <h6 className="card-text">
            <i className="fa fa-circle fa-circle-isActive" aria-hidden="true"></i> {ACTIVE_TEAMS}: {numberOfActiveTeams}
          </h6>
        </div>
      </div>

      {/* Non-Active Teams Card */}
      <div className="card" id="card_active" data-testid="card_active">
        <div className="card-body">
          <h6 className="card-text">
            <i className="fa fa-circle fa-circle-Active" aria-hidden="true"></i> Non-Active Teams: {numberOfNonActiveTeams}
          </h6>
        </div>
      </div>
    </div>
  );
};

export default TeamsOverview;
