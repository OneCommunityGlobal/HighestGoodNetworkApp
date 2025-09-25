import { ACTIVE_TEAMS, IN_ACTIVE_TEAMS, TOTAL_TEAMS } from '../../languages/en/ui';
import './TeamsOverview.css';

const TeamsOverview = ({
  numberOfTeams,
  numberOfActiveTeams,
  numberOfInActiveTeams,
  onActiveClick,
  onInactiveClick,
  onAllClick,
  selectedFilter,
}) => {
  const getCardClass = filterType =>
    selectedFilter === filterType ? 'card selected-filter' : 'card';

  return (
    <div className="teams__overview--top">
      <div
        className={getCardClass('all')}
        id="card_team"
        onClick={onAllClick}
        onKeyDown={onAllClick} // 1. Add keyboard event handler
        role="button" // 2. Tell screen readers this acts like a button
        tabIndex={0}
        data-testid="total_teams"
        style={{ cursor: 'pointer' }}
      >
        <div className="card-body">
          <h6 className="card-text">
            <i className="fa fa-users" aria-hidden="true" /> {TOTAL_TEAMS}: {numberOfTeams}
          </h6>
        </div>
      </div>

      <div
        className={getCardClass('active')}
        id="card_active"
        onClick={onActiveClick}
        onKeyDown={onActiveClick} // 1. Add keyboard event handler
        role="button" // 2. Tell screen readers this acts like a button
        tabIndex={0} // 3. Make it focusable with the keyboard
        data-testid="active_teams"
        style={{ cursor: 'pointer' }}
      >
        <div className="card-body">
          <h6 className="card-text">
            <i className="fa fa-circle fa-circle-isActive" aria-hidden="true" /> {ACTIVE_TEAMS}:{' '}
            {numberOfActiveTeams}
          </h6>
        </div>
      </div>

      <div
        className={getCardClass('inactive')}
        id="card_in_active"
        onClick={onInactiveClick}
        onKeyDown={onInactiveClick} // 1. Add keyboard event handler
        role="button" // 2. Tell screen readers this acts like a button
        tabIndex={0} // 3. Make it focusable with the keyboard
        data-testid="inactive_teams"
        style={{ cursor: 'pointer' }}
      >
        <div className="card-body">
          <h6 className="card-text">
            <i className="fa fa-circle fa-circle-isInActive" aria-hidden="true" /> {IN_ACTIVE_TEAMS}
            : {numberOfInActiveTeams}
          </h6>
        </div>
      </div>
    </div>
  );
};

export default TeamsOverview;
