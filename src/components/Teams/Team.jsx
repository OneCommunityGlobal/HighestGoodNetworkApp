/* eslint-disable react/destructuring-assignment */
import './Team.css';
import { connect, useSelector, useDispatch } from 'react-redux';
import { Button } from 'reactstrap';
import hasPermission from '~/utils/permissions';
import { boxStyle, boxStyleDark } from '~/styles';
import { DELETE } from '../../languages/en/ui';
import { getTeamMembers } from '../../actions/allTeamsAction';
import { useEffect, useMemo, useState } from 'react';
import { fetchTeamMembersCached, getCachedTeamMembers } from './teamMembersCache';

export function Team(props) {
  const dispatch = useDispatch();
  const darkMode = useSelector(s => s.theme.darkMode);
  const canDeleteTeam = props.hasPermission('deleteTeam');
  const canPutTeam = props.hasPermission('putTeam');

  const teamId = String(props.teamId || '');

  const [localMembers, setLocalMembers] = useState(() => getCachedTeamMembers(teamId) || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cached = getCachedTeamMembers(teamId);
    if (cached && !localMembers) setLocalMembers(cached);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  useEffect(() => {
    if (!getCachedTeamMembers(teamId) && teamId) {
      fetchTeamMembersCached(dispatch, getTeamMembers, teamId)
        .then(setLocalMembers)
        .catch(() => {});
    }
  }, [dispatch, teamId]);

  const members = localMembers ?? props.team?.members ?? [];

  const { total, active, inactive } = useMemo(() => {
    const list = Array.isArray(members) ? members : [];
    const tot = list.length;

    let haveFlag = false,
      act = 0;
    for (const m of list) {
      const flag = m?.isActive ?? m?.active;
      if (typeof flag === 'boolean') {
        haveFlag = true;
        if (flag) act += 1;
      }
    }
    const firstLoad = loading && localMembers == null;
    return {
      total: firstLoad ? '…' : tot,
      active: firstLoad ? '…' : tot === 0 ? 0 : haveFlag ? act : '…',
      inactive: firstLoad ? '…' : tot === 0 ? 0 : haveFlag ? tot - act : '…',
    };
  }, [members, loading, localMembers]);

  const handleOpenMembers = async () => {
    setLoading(true);
    try {
      const data = await fetchTeamMembersCached(dispatch, getTeamMembers, teamId);
      setLocalMembers(data);
    } finally {
      setLoading(false);
      props.onMembersClick(props.teamId, props.name, props.teamCode);
    }
  };

  return (
    <tr className="teams__tr" id={`tr_${teamId}`}>
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
              props.onStatusClick(props.name, teamId, props.active, props.teamCode);
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
            if (!getCachedTeamMembers(teamId)) {
              fetchTeamMembersCached(dispatch, getTeamMembers, teamId)
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
              onClick={() => props.onEditTeam(props.name, teamId, props.active, props.teamCode)}
              style={darkMode ? {} : boxStyle}
              disabled={!canPutTeam}
            >
              Edit
            </Button>
          </span>
          <span className="usermanagement-actions-cell">
            <Button
              color="danger"
              onClick={() => props.onDeleteClick(props.name, teamId, props.active, props.teamCode)}
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
