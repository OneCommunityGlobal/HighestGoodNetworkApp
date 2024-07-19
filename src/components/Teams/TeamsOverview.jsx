import React from 'react';
import { TOTAL_TEAMS, ACTIVE_TEAMS } from '../../languages/en/ui';
import "./TeamsOverview.css"

export const TeamsOverview = props => {
  return (
    <div className="teams__overview--top">
      <div className="card" id="card_team" data-testid="card_team">
        <div className="card-body">
          <h6 className="card-text">
            <i className="fa fa-users" aria-hidden="true"></i> {TOTAL_TEAMS}: {props.numberOfTeams}
          </h6>
        </div>
      </div>

      <div className="card" id="card_active" data-testid="card_active">
        <div className="card-body">
          <h6 className="card-text">
            <i className="fa fa-circle fa-circle-isActive" aria-hidden="true"></i> {ACTIVE_TEAMS}: {props.numberOfActiveTeams}
          </h6>
        </div>
      </div>
    </div>
  );
};

export default TeamsOverview;
