/* eslint-disable react/destructuring-assignment */
import './Team.css';
import { connect, useSelector, useDispatch } from 'react-redux';
import { Button } from 'reactstrap';
import hasPermission from '~/utils/permissions';
import { boxStyle, boxStyleDark } from '~/styles';
import { DELETE } from '../../languages/en/ui';
import { getTeamMembers } from '../../actions/allTeamsAction';
import { useEffect, useState } from 'react';
import { fetchTeamMembersCached, getCachedTeamMembers } from './teamMembersCache';

function computeCounts(members, loading, localMembers) {
  const list = Array.isArray(members) ? members : [];

  if (loading && localMembers == null) return { total: '…', active: '…', inactive: '…' };
  const tot = list.length;
  if (tot === 0) return { total: 0, active: 0, inactive: 0 };

  let act = 0;
  let sawFlag = false;
  for (const m of list) {
    const flag = m?.isActive ?? m?.active;
    if (typeof flag === 'boolean') {
      sawFlag = true;
      if (flag) act += 1;
    }
  }
  if (!sawFlag) return { total: tot, active: '…', inactive: '…' };
  return { total: tot, active: act, inactive: tot - act };
}

export function Team(props) {
  const dispatch = useDispatch();
  const darkMode = useSelector(s => s.theme.darkMode);
  const canDeleteTeam = props.hasPermission('deleteTeam');
  const canPutTeam = props.hasPermission('putTeam');

  // Keep a raw id for callbacks (number stays number in tests)
  const teamIdRaw = props.teamId;
  // string key for cache/DOM ids
  const teamIdKey = String(props.teamId ?? '');

  const [localMembers, setLocalMembers] = useState(() => getCachedTeamMembers(teamIdKey) || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cached = getCachedTeamMembers(teamIdKey);
    if (cached && !localMembers) setLocalMembers(cached);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamIdKey]);

  useEffect(() => {
    if (!getCachedTeamMembers(teamIdKey) && teamIdKey) {
      fetchTeamMembersCached(dispatch, getTeamMembers, teamIdKey)
        .then(setLocalMembers)
        .catch(() => {});
    }
  }, [dispatch, teamIdKey]);

  const members = localMembers ?? props.team?.members ?? [];
  const { total, active, inactive } = computeCounts(members, loading, localMembers);

  const handleOpenMembers = async () => {
    setLoading(true);
    try {
      const data = await fetchTeamMembersCached(dispatch, getTeamMembers, teamIdKey);
      setLocalMembers(data);
    } finally {
      setLoading(false);
      // IMPORTANT: pass the raw value so tests get number 1 (not "1")
      props.onMembersClick(teamIdRaw, props.name, props.teamCode);
    }
  };

  return (
    <tr className="teams__tr" id={`tr_${teamIdKey}`}>
      <th className="teams__order--input" scope="row">
        <div>{(props.index ?? 0) + 1}</div>
      </th>

      <td className="team-name-col">
        {props.name} ({total} | {active} | {inactive})
      </td>

      <td className="teams__active--input">
        <button
          data-testid="active-marker"
          type="button"
          onClick={() => {
            if (canDeleteTeam || canPutTeam) {
              props.onStatusClick(props.name, teamIdRaw, props.active, props.teamCode);
            }
          }}
          style={{ boxStyle }}
          aria-label={`Change status for team ${props.name}`}
        >
          <div className={props.active ? 'isActive' : 'isNotActive'}>
            <i className="fa fa-circle" aria-hidden="true" />
          </div>
        </button>
      </td>

      <td className="centered-cell">
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
          aria-label="Users"
          disabled={loading}
        >
          {loading ? <i className="fa fa-spinner fa-spin" /> : <i className="fa fa-users" />}
        </button>
      </td>

      {(canDeleteTeam || canPutTeam) && (
        <td>
          <span className="usermanagement-actions-cell">
            <Button
              color="success"
              onClick={() => props.onEditTeam(props.name, teamIdRaw, props.active, props.teamCode)}
              style={darkMode ? {} : boxStyle}
              disabled={!canPutTeam}
            >
              Edit
            </Button>
          </span>
          <span className="usermanagement-actions-cell">
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
          </span>
        </td>
      )}
    </tr>
  );
}

export default connect(null, { hasPermission })(Team);
