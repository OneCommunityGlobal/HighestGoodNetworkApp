import { TOTAL_TEAMS, ACTIVE_TEAMS } from '../../languages/en/ui';
import './TeamsOverview.css';

function TeamsOverview({ numberOfTeams, numberOfActiveTeams }) {
  const numberOfNonActiveTeams = numberOfTeams - numberOfActiveTeams;

  return (
    <div className="teams__overview--top">
      {/* Total Teams Card */}
      <div className="card" id="card_team" data-testid="card_team">
        <div className="card-body">
          <h6 className="card-text" id="total_teams" data-testid="total_teams">
            <i className="fa fa-users" aria-hidden="true" /> {TOTAL_TEAMS}: {numberOfTeams}
          </h6>
        </div>
      </div>

      {/* Active Teams Card */}
      <div className="card" id="card_active" data-testid="card_active">
        <div className="card-body">
          <h6 className="card-text" id="active_teams" data-testid="active_teams">
            <i className="fa fa-circle fa-circle-isActive" aria-hidden="true" /> {ACTIVE_TEAMS}:{' '}
            {numberOfActiveTeams}
          </h6>
        </div>
      </div>

      {/* Non-Active Teams Card */}
      <div className="card" id="card_non_active" data-testid="card_non_active">
        <div className="card-body">
          <h6 className="card-text" id="non_active_teams" data-testid="non_active_teams">
            <i className="fa fa-circle fa-circle-Active" aria-hidden="true" /> Non-Active Teams:{' '}
            {numberOfNonActiveTeams}
          </h6>
        </div>
      </div>
    </div>
  );
}

export default TeamsOverview;
