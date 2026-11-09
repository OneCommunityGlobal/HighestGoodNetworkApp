/* eslint-disable react/destructuring-assignment */
import styles from './Team.module.css';
import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect, useSelector, useDispatch } from 'react-redux';
import { Button } from 'reactstrap';
import hasPermission from '~/utils/permissions';
import { boxStyle, boxStyleDark } from '~/styles';
import { DELETE } from '../../languages/en/ui';
import { getTeamMembers } from '../../actions/allTeamsAction';
import {
  fetchTeamMembersCached,
  getCachedTeamMembers,
  clearCachedTeamMembers,
} from './teamMembersCache';

import { permissions } from '../../utils/constants';
// The getAllTeams aggregation does not include each member's isActive flag,
// so the row resolves it from the user profiles the Teams page already loads.
// The map is built once per profiles array and shared by every row.
let cachedProfiles;
let cachedStatusMap = new Map();
function getUserStatusMap(profiles) {
  if (profiles !== cachedProfiles) {
    cachedProfiles = profiles;
    cachedStatusMap = new Map();
    if (Array.isArray(profiles)) {
      for (const p of profiles) {
        if (p?._id && typeof p.isActive === 'boolean')
          cachedStatusMap.set(String(p._id), p.isActive);
      }
    }
  }
  return cachedStatusMap;
}

export function computeCounts(members, statusMap = new Map()) {
  // Skip entries with no user id: the aggregation emits an empty object for a
  // team with no members and for members whose profile was deleted, and the
  // members popup does not list those either.
  const list = (Array.isArray(members) ? members : []).filter(m => m?._id);
  const tot = list.length;
  if (tot === 0) return { total: 0, active: 0, inactive: 0 };

  let act = 0;
  let sawFlag = false;
  for (const m of list) {
    const ownFlag = m.isActive ?? m.active;
    const flag = typeof ownFlag === 'boolean' ? ownFlag : statusMap.get(String(m._id));
    if (typeof flag === 'boolean') {
      sawFlag = true;
      if (flag) act += 1;
    }
  }
  // Statuses are unknown until the user profiles finish loading.
  if (!sawFlag) return { total: tot, active: '…', inactive: '…' };
  // Same rule as the members popup: anyone not explicitly active is inactive.
  return { total: tot, active: act, inactive: tot - act };
}
import headerStyles from './TeamTableHeader.module.css';

export function Team({
  teamId,
  name,
  teamCode = '',
  index = 0,
  active = false,
  onMembersClick = undefined,
  onStatusClick = undefined,
  onEditTeam = undefined,
  onDeleteClick = undefined,
  team = undefined,
  hasPermission,
  ...restProps
}) {
  const props = {
    teamId,
    name,
    teamCode,
    index,
    active,
    onMembersClick,
    onStatusClick,
    onEditTeam,
    onDeleteClick,
    team,
    hasPermission,
    ...restProps,
  };
  const dispatch = useDispatch();
  const darkMode = useSelector(s => s.theme.darkMode);
  const userProfiles = useSelector(s => s.allUserProfiles?.userProfiles);
  const userStatusMap = useMemo(() => getUserStatusMap(userProfiles), [userProfiles]);
  const canDeleteTeam = props.hasPermission(permissions.deleteTeam);
  const canPutTeam = props.hasPermission(permissions.putTeam);

  // Keep a raw id for callbacks (number stays number in tests)
  const teamIdRaw =
    typeof props.teamId === 'string' && /^\d+$/.test(props.teamId)
      ? Number(props.teamId)
      : props.teamId;

  // string key for cache/DOM ids
  const teamIdKey = String(props.teamId ?? '');

  // localMembers is only populated after the user opens the modal or hovers.
  // On mount we do NOT pre-fetch — that was firing GET /api/team/:id/users
  // for every single row on page load (thousands of requests = 30s load time).
  // Member counts are computed from props.team.members which already comes
  // from the getAllTeams aggregation, so no extra request is needed.
  const [localMembers, setLocalMembers] = useState(() => getCachedTeamMembers(teamIdKey) || null);

  const members = localMembers ?? props.team?.members ?? [];
  const { total, active: activeCount, inactive } = computeCounts(members, userStatusMap);

  // Fire callback immediately (keeps tests & UX snappy), then refresh members.
  // We do NOT reset localMembers to null or set loading=true here — doing so
  // caused the count to flash back to '…' on every click. Since props.team.members
  // is always available as a fallback, the count stays stable while the fresh
  // fetch completes in the background.
  const handleOpenMembers = () => {
    clearCachedTeamMembers(teamIdKey);
    if (typeof props.onMembersClick === 'function') {
      props.onMembersClick(teamIdRaw, props.name, props.teamCode); // don't pass localMembers
    }
    fetchTeamMembersCached(dispatch, getTeamMembers, teamIdKey)
      .then(fresh => {
        setLocalMembers(fresh);
      })
      .catch(() => {});
  };

  return (
    <tr
      className={`${styles.teams__tr} ${darkMode ? styles.darkModeRow : ''}`}
      id={`tr_${teamIdKey}`}
    >
      <th
        className="teams__order--input"
        scope="row"
        style={{ textAlign: 'center', verticalAlign: 'middle' }}
      >
        <div>{(props.index ?? 0) + 1}</div>
      </th>
      {/*  Wrap long names vertically */}
      <td className={headerStyles.teamNameCol}>
        {props.name} ({total} | {activeCount} | {inactive})
      </td>
      <td className="teams__active--input" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
        <button
          data-testid="active-marker"
          type="button"
          onClick={() => {
            if (canDeleteTeam || canPutTeam) {
              props.onStatusClick(props.name, teamIdRaw, props.active, props.teamCode);
            }
          }}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          aria-label={`Change status for team ${props.name}`}
        >
          <div className={props.active ? 'isActive' : 'isNotActive'}>
            <i className="fa fa-circle" aria-hidden="true" />
          </div>
        </button>
      </td>

      <td
        className={styles['centered-cell']}
        style={{ textAlign: 'center', verticalAlign: 'middle' }}
      >
        <div className={styles.membersBtnWrapper}>
          <button
            style={darkMode ? {} : boxStyle}
            type="button"
            className="btn btn-outline-info"
            onMouseEnter={() => {
              if (!getCachedTeamMembers(teamIdKey)) {
                fetchTeamMembersCached(dispatch, getTeamMembers, teamIdKey)
                  .then(setLocalMembers)
                  .catch(() => {});
              }
            }}
            onClick={handleOpenMembers}
            data-testid="members-btn"
            aria-label={
              typeof activeCount === 'number' ? `Users, ${activeCount} active members` : 'Users'
            }
          >
            <i className="fa fa-users" />
          </button>
          {/* Same green active-member bubble as the Projects page Members button. */}
          {typeof activeCount === 'number' && (
            <span
              className={styles.activeMemberBadge}
              data-testid="active-member-badge"
              title="Active members"
              aria-hidden="true"
            >
              {activeCount}
            </span>
          )}
        </div>
      </td>

      {(canDeleteTeam || canPutTeam) && (
        <td style={{ verticalAlign: 'middle' }}>
          <div className={styles.actionButtonsContainer}>
            <Button
              color="success"
              onClick={() => props.onEditTeam(props.name, teamIdRaw, props.active, props.teamCode)}
              style={darkMode ? {} : boxStyle}
              disabled={!canPutTeam}
            >
              Edit
            </Button>
            <Button
              color="danger"
              onClick={() =>
                props.onDeleteClick(props.name, teamIdRaw, props.active, props.teamCode)
              }
              style={darkMode ? boxStyleDark : boxStyle}
              disabled={!canDeleteTeam}
            >
              {DELETE}
            </Button>
          </div>
        </td>
      )}
    </tr>
  );
}

Team.propTypes = {
  // injected by connect
  hasPermission: PropTypes.func.isRequired,

  // basic identity/labels
  teamId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  name: PropTypes.string.isRequired,
  teamCode: PropTypes.string,
  index: PropTypes.number,

  // status flags
  active: PropTypes.bool,

  // callbacks
  onMembersClick: PropTypes.func,
  onStatusClick: PropTypes.func,
  onEditTeam: PropTypes.func,
  onDeleteClick: PropTypes.func,

  // optional team object (used for members & modifiedDatetime)
  team: PropTypes.shape({
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    teamName: PropTypes.string,
    teamCode: PropTypes.string,
    isActive: PropTypes.bool,
    members: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        firstName: PropTypes.string,
        lastName: PropTypes.string,
        isActive: PropTypes.bool,
        active: PropTypes.bool,
      }),
    ),
    modifiedDatetime: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.instanceOf(Date),
    ]),
  }),
};

export default connect(null, { hasPermission })(Team);
