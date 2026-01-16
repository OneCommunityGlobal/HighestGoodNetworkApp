/* eslint-disable react/destructuring-assignment */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect, useSelector, useDispatch } from 'react-redux';
import { Button } from 'reactstrap';
import hasPermission from '~/utils/permissions';
import { boxStyle, boxStyleDark } from '~/styles';
import { DELETE } from '../../languages/en/ui';
import { getTeamMembers } from '../../actions/allTeamsAction';
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
import headerStyles from './TeamTableHeader.module.css';

export function Team(props) {
  const dispatch = useDispatch();
  const darkMode = useSelector(s => s.theme.darkMode);
  const canDeleteTeam = props.hasPermission('deleteTeam');
  const canPutTeam = props.hasPermission('putTeam');

  // Keep a raw id for callbacks (number stays number in tests)
  const teamIdRaw =
    typeof props.teamId === 'string' && /^\d+$/.test(props.teamId)
      ? Number(props.teamId)
      : props.teamId;

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

  // Fire callback immediately (keeps tests & UX snappy), then refresh members
  const handleOpenMembers = () => {
    if (typeof props.onMembersClick === 'function') {
      props.onMembersClick(teamIdRaw, props.name, props.teamCode);
    }

    setLoading(true);
    fetchTeamMembersCached(dispatch, getTeamMembers, teamIdKey)
      .then(setLocalMembers)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  return (
    <tr className="teams__tr" id={`tr_${teamIdKey}`}>
      <th className="teams__order--input" scope="row">
        <div>{(props.index ?? 0) + 1}</div>
      </th>
      {/*  Wrap long names vertically */}
      <td className={headerStyles.teamNameCol}>
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
          // style={boxStyle}
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

Team.defaultProps = {
  teamCode: '',
  index: 0,
  active: false,
  onMembersClick: undefined,
  onStatusClick: undefined,
  onEditTeam: undefined,
  onDeleteClick: undefined,
  team: undefined,
};

export default connect(null, { hasPermission })(Team);
