import { TOTAL_TEAMS, ACTIVE_TEAMS } from '../../languages/en/ui';
import './TeamsOverview.css';

function TeamsOverview({ numberOfTeams, numberOfActiveTeams }) {
  return (
    <div className="teams__overview--top">
      <div className="card" id="card_team" data-testid="card_team">
        <div className="card-body">
          <h6 className="card-text">
            <i className="fa fa-users" aria-hidden="true" /> {TOTAL_TEAMS}: {numberOfTeams}
          </h6>
        </div>
      </div>

      <div className="card" id="card_active" data-testid="card_active">
        <div className="card-body">
          <h6 className="card-text">
            <i className="fa fa-circle fa-circle-isActive" aria-hidden="true" /> {ACTIVE_TEAMS}:{' '}
            {numberOfActiveTeams}
          </h6>
        </div>
      </div>
    </div>
  );
}

export default TeamsOverview;
