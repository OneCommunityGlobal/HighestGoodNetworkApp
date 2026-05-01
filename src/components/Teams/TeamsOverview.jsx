import React from 'react';
import { TOTAL_TEAMS, ACTIVE_TEAMS, IN_ACTIVE_TEAMS } from '../../languages/en/ui';
import styles from './TeamsOverview.module.css';

const TeamsOverview = ({
  numberOfTeams,
  numberOfActiveTeams,
  numberOfInActiveTeams,
  onActiveClick,
  onInactiveClick,
  onAllClick,
  selectedFilter,
}) => {
  const getCardClass = filterType => {
    const base = [styles.card];

    if (filterType === 'all') base.push(styles.totalCard);
    if (filterType === 'active') base.push(styles.activeCard);
    if (filterType === 'inactive') base.push(styles.inactiveCard);

    if (selectedFilter === filterType) base.push(styles.selectedFilter);

    return base.join(' ');
  };

  return (
    <div className={styles.overviewTop}>
      <div
        className={getCardClass('all')}
        id="card_team"
        onClick={onAllClick}
        onKeyDown={onAllClick}
        role="button"
        tabIndex={0}
        data-testid="total_teams"
        style={{ cursor: 'pointer' }}
      >
        <div className={styles.cardBody}>
          <h6 className={styles.cardText}>
            <i className={`fa fa-users ${styles.cardTextIcon}`} aria-hidden="true" />
            {TOTAL_TEAMS}: {numberOfTeams}
          </h6>
        </div>
      </div>

      <div
        className={getCardClass('active')}
        id="card_active"
        onClick={onActiveClick}
        onKeyDown={onActiveClick}
        role="button"
        tabIndex={0}
        data-testid="active_teams"
        style={{ cursor: 'pointer' }}
      >
        <div className={styles.cardBody}>
          <h6 className={styles.cardText}>
            <i
              className={`fa fa-circle ${styles.faCircleIsActive} ${styles.cardTextIcon}`}
              aria-hidden="true"
            />
            {ACTIVE_TEAMS}: {numberOfActiveTeams}
          </h6>
        </div>
      </div>

      <div
        className={getCardClass('inactive')}
        id="card_in_active"
        onClick={onInactiveClick}
        onKeyDown={onInactiveClick}
        role="button"
        tabIndex={0}
        data-testid="inactive_teams"
        style={{ cursor: 'pointer' }}
      >
        <div className={styles.cardBody}>
          <h6 className={styles.cardText}>
            <i
              className={`fa fa-circle ${styles.faCircleIsInActive} ${styles.cardTextIcon}`}
              aria-hidden="true"
            />
            {IN_ACTIVE_TEAMS}: {numberOfInActiveTeams}
          </h6>
        </div>
      </div>
    </div>
  );
};

export default TeamsOverview;
