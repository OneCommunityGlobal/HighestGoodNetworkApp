import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Container,
  Alert,
  Spinner,
} from 'reactstrap';
import hasPermission from '~/utils/permissions';
import { boxStyle, boxStyleDark } from '~/styles';
import '../Header/index.css';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import MembersAutoComplete from './MembersAutoComplete';
import ToggleSwitch from './ToggleSwitch/ToggleSwitch';
import InfoModal from './InfoModal';

/* ---------- small helpers to reduce cognitive complexity ---------- */

function ValidationAlerts({ duplicateUserAlert, isValidUser }) {
  if (duplicateUserAlert) {
    return <Alert color="danger">Member is already a part of this team.</Alert>;
  }
  if (isValidUser === false) {
    return <Alert color="danger">Please choose a valid user.</Alert>;
  }
  return null;
}
function labelForFilter(mode) {
  switch (mode) {
    case 'active':
      return 'Active';
    case 'inactive':
      return 'In Active';
    default:
      return 'All';
  }
}

function bgForFilter(mode) {
  switch (mode) {
    case 'active':
      return 'limegreen';
    case 'inactive':
      return '#ccc';
    default:
      return 'dodgerblue';
  }
}

function textForFilter(mode) {
  return mode === 'inactive' ? 'black' : 'white';
}

function applyStatusFilter(list, mode) {
  if (mode === 'active') return list.filter(u => u?.isActive === true);
  if (mode === 'inactive') return list.filter(u => u?.isActive !== true);
  return list;
}

export const TeamMembersPopup = React.memo(props => {
  const darkMode = useSelector(state => state.theme.darkMode);
  const hasVisibilityIconPermission = hasPermission('seeVisibilityIcon');
  const canAssignTeamToUsers = hasPermission('assignTeamToUsers');

  const [filterMode, setFilterMode] = useState('all');
  const [selectedUser, setSelectedUser] = useState(undefined);
  const [isValidUser, setIsValidUser] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [duplicateUserAlert, setDuplicateUserAlert] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);
  const [deletedPopup, setDeletedPopup] = useState(false);
  const [infoModal, setInfoModal] = useState(false);

  // Normalize members
  const validation = useMemo(() => {
    const raw = props.members;
    if (Array.isArray(raw)) return raw.filter(Boolean);
    if (raw && Array.isArray(raw.teamMembers)) return raw.teamMembers.filter(Boolean);
    return [];
  }, [props.members]);

  const sortByPermission = useCallback((a, b) => {
    const order = [
      'owner',
      'administrator',
      'core team',
      'manager',
      'mentor',
      'assistant manager',
      'volunteer',
    ];
    return order.indexOf(a.toLowerCase()) - order.indexOf(b.toLowerCase());
  }, []);

  const sortByAlpha = useCallback((a, b) => {
    const nameA = `${a?.firstName || ''} ${a?.lastName || ''}`.toLowerCase();
    const nameB = `${b?.firstName || ''} ${b?.lastName || ''}`.toLowerCase();
    return nameA.localeCompare(nameB);
  }, []);

  const sortedMembers = useMemo(() => {
    const src = validation;

    // permission → alpha
    if (sortOrder === 0) {
      const grouped = src.reduce((pre, cur) => {
        const roleKey = (cur.role || '').toString().toLowerCase();
        let arr = pre[roleKey];
        if (!arr) {
          arr = [];
          pre[roleKey] = arr;
        }
        arr.push(cur);
        return pre;
      }, {});
      return Object.keys(grouped)
        .sort(sortByPermission)
        .flatMap(role => [...grouped[role]].sort(sortByAlpha));
    }

    // date → alpha (null last)
    const byDate = [...src].sort((a, b) => {
      const da = a?.addDateTime ? moment(a.addDateTime) : null;
      const db = b?.addDateTime ? moment(b.addDateTime) : null;
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return da.diff(db) * -sortOrder;
    });

    const buckets = byDate.reduce((pre, cur) => {
      const key = cur?.addDateTime ? moment(cur.addDateTime).format('MMM-DD-YY') : '__NO_DATE__';
      let arr = pre[key];
      if (!arr) {
        arr = [];
        pre[key] = arr;
      }
      arr.push(cur);
      return pre;
    }, {});
    const out = [];
    for (const list of Object.values(buckets)) {
      out.push(...[...list].sort(sortByAlpha));
    }
    return out;
  }, [validation, sortOrder, sortByPermission, sortByAlpha]);

  const memberVisibility = useMemo(() => {
    const teamsData = props.teamData;
    const map = {};
    if (Array.isArray(teamsData) && teamsData.length > 0) {
      for (const m of teamsData[0]?.members || []) {
        map[m.userId] = m.visible;
      }
    }
    return map;
  }, [props.teamData]);

  useEffect(() => {
    setIsValidUser(true);
    setDuplicateUserAlert(false);
  }, [props.open]);

  const toggleInfoModal = () => setInfoModal(p => !p);
  const closeDeletedPopup = () => setDeletedPopup(p => !p);

  const handleDelete = id => {
    props.onDeleteClick(`${id}`);
    setDeletedPopup(true);
  };

  const closePopup = () => {
    props.onClose();
    setSortOrder(0);
    setFilterMode('all');
  };

  const selectUser = user => {
    setSelectedUser(user);
    setIsValidUser(true);
    setDuplicateUserAlert(false);
  };

  // avoid negated condition
  const onAddUser = () => {
    if (selectedUser) {
      const isDuplicate = validation.some(x => x?._id === selectedUser._id);
      if (isDuplicate) {
        setSearchText('');
        setDuplicateUserAlert(true);
      } else {
        props.onAddUser(selectedUser);
        setSearchText('');
        setDuplicateUserAlert(false);
      }
      return;
    }
    setDuplicateUserAlert(false);
    setIsValidUser(false);
  };

  const UpdateTeamMembersVisibility = (userId, choice) => {
    props.onUpdateTeamMemberVisibility(userId, choice);
  };

  const icons = {
    '-1': { icon: faSortUp },
    '0': { icon: faSort, style: { color: 'lightgrey' } },
    '1': { icon: faSortDown },
  };
  const toggleOrder = useCallback(() => setSortOrder(pre => (pre === -1 ? 1 : pre - 1)), []);

  const emptyState = (
    <tr>
      <td colSpan={canAssignTeamToUsers ? 6 : 5} className="empty-data-message">
        There are no users on this team.
      </td>
    </tr>
  );

  const showTableSpinner = props.open && props.fetching && validation.length === 0;

  const cycleFilter = () => {
    let next = 'all';
    if (filterMode === 'all') next = 'active';
    else if (filterMode === 'active') next = 'inactive';
    setFilterMode(next);
  };

  /* ------- row renderer (extracting logic lowers complexity) ------- */
  const renderRow = (user, index) => {
    const uid = user?._id ?? `row-${index}`;
    const first = user?.firstName ?? '';
    const last = user?.lastName ?? '';
    const role = user?.role ?? '';
    const dateTxt = user?.addDateTime ? moment(user.addDateTime).format('MMM-DD-YY') : '-';
    const isActiveDot = user?.isActive === true;

    const nameCell = ['Manager', 'Mentor', 'Assistant Manager'].includes(role) ? (
      <b>
        {first} {last} ({role})
      </b>
    ) : (
      <span>
        {first} {last} ({role})
      </span>
    );

    return (
      <tr key={`${props.selectedTeamName}-${uid}`}>
        <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
          <div className={isActiveDot ? 'isActive' : 'isNotActive'}>
            <i className="fa fa-circle" aria-hidden="true" />
          </div>
        </td>
        <td className="def-width" style={{ verticalAlign: 'middle', textAlign: 'center' }}>
          {index + 1}
        </td>
        <td className="def-width" style={{ verticalAlign: 'middle', textAlign: 'center' }}>
          {nameCell}{' '}
          {hasVisibilityIconPermission && props?.selectedTeamName && user?.isVisible === false && (
            <i className="fa fa-eye-slash" title="User is invisible" />
          )}
        </td>
        <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>{dateTxt}</td>
        <td
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <ToggleSwitch
            key={`${props.selectedTeamName}-${uid}`}
            switchType="limit-visibility"
            userId={user?._id || null}
            choice={memberVisibility[user?._id]}
            UpdateTeamMembersVisibility={user?._id ? UpdateTeamMembersVisibility : () => {}}
          />
        </td>
        {canAssignTeamToUsers && (
          <td style={{ whiteSpace: 'nowrap', minWidth: '100px', textAlign: 'center' }}>
            <Button
              color="danger"
              onClick={() => user?._id && handleDelete(user._id)}
              disabled={!user?._id}
              style={darkMode ? boxStyleDark : boxStyle}
            >
              Delete
            </Button>
          </td>
        )}
      </tr>
    );
  };

  const renderBody = () => {
    if (showTableSpinner) {
      return (
        <tr>
          <td align="center" colSpan={canAssignTeamToUsers ? 6 : 5}>
            <Spinner color={`${darkMode ? 'light' : 'dark'}`} animation="border" size="sm" />
          </td>
        </tr>
      );
    }
    const visibleList = applyStatusFilter(sortedMembers, filterMode);
    if (visibleList.length === 0) return emptyState;
    return visibleList.map((u, i) => renderRow(u, i));
  };

  return (
    <Container fluid>
      <InfoModal isOpen={infoModal} toggle={toggleInfoModal} />

      <Modal
        isOpen={props.open}
        toggle={closePopup}
        size="lg"
        className={`${darkMode ? 'dark-mode text-light' : ''} ${
          props.open ? ' open-team-members-popup-modal' : ''
        }`}
      >
        <ModalHeader className={darkMode ? 'bg-space-cadet' : ''} toggle={closePopup}>
          {`Members of ${props.selectedTeamName}`}
        </ModalHeader>

        <div className={darkMode ? 'bg-space-cadet' : ''}>
          {canAssignTeamToUsers && (
            <div className="input-group-prepend" style={{ margin: '10px' }}>
              <MembersAutoComplete
                userProfileData={props.usersdata}
                existingMembers={validation}
                onAddUser={selectUser}
                searchText={searchText}
                setSearchText={setSearchText}
              />
              <Button
                color="primary"
                onClick={onAddUser}
                style={darkMode ? boxStyleDark : boxStyle}
              >
                Add
              </Button>
            </div>
          )}
        </div>

        <ModalBody
          className={darkMode ? 'bg-yinmn-blue' : ''}
          style={{ textAlign: 'center', overflowX: 'auto' }}
        >
          <ValidationAlerts duplicateUserAlert={duplicateUserAlert} isValidUser={isValidUser} />

          <div>
            <p style={{ fontWeight: 600 }}>
              {`All : ${applyStatusFilter(validation, 'all').length}, `}
              {`Active : ${applyStatusFilter(validation, 'active').length}, `}
              {`In Active : ${applyStatusFilter(validation, 'inactive').length}`}
            </p>
          </div>

          <table
            className={`table table-bordered table-responsive-xlg ${
              darkMode ? 'dark-mode text-light' : ''
            }`}
            style={{ tableLayout: 'fixed' }}
          >
            <thead>
              <tr className={darkMode ? 'bg-space-cadet' : ''}>
                <th
                  style={{
                    width: 120,
                    textAlign: 'center',
                    background: darkMode ? '#1f2a44' : '#e9f2ff',
                    verticalAlign: 'middle',
                  }}
                >
                  <button
                    type="button"
                    onClick={cycleFilter}
                    style={{
                      backgroundColor: bgForFilter(filterMode),
                      color: textForFilter(filterMode),
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '5px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      minWidth: 90,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {labelForFilter(filterMode)}
                  </button>
                </th>

                <th
                  className="def-width"
                  style={{ width: 56, textAlign: 'center', verticalAlign: 'middle' }}
                >
                  #
                </th>

                <th
                  className="def-width"
                  style={{ minWidth: 220, textAlign: 'center', verticalAlign: 'middle' }}
                >
                  User Name
                </th>

                <th
                  style={{
                    width: 120,
                    cursor: 'pointer',
                    textAlign: 'center',
                    verticalAlign: 'middle',
                  }}
                  onClick={toggleOrder}
                >
                  Date Added{' '}
                  <FontAwesomeIcon
                    icon={icons[sortOrder].icon}
                    className={icons[sortOrder].className}
                  />
                </th>

                <th style={{ width: 110, textAlign: 'center', verticalAlign: 'middle' }}>
                  See All{' '}
                  <i
                    data-toggle="tooltip"
                    data-placement="right"
                    title="Click for more information"
                    style={{ fontSize: 17, cursor: 'pointer' }}
                    aria-hidden="true"
                    className="fa fa-info-circle"
                    onClick={toggleInfoModal}
                  />
                </th>

                {canAssignTeamToUsers && (
                  <th
                    style={{ width: 120, textAlign: 'center', verticalAlign: 'middle' }}
                    aria-label="Assign Team to Users"
                  >
                    <span style={{ display: 'none' }}>Assign Team to Users</span>
                  </th>
                )}
              </tr>
            </thead>

            <tbody>{renderBody()}</tbody>
          </table>
        </ModalBody>

        <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
          <Button color="secondary" onClick={closePopup} style={darkMode ? boxStyleDark : boxStyle}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={deletedPopup}
        toggle={closeDeletedPopup}
        className={darkMode ? 'dark-mode text-light' : ''}
      >
        <ModalHeader
          toggle={closeDeletedPopup}
          className={`${darkMode ? 'bg-space-cadet' : ''} text-danger font-weight-bold`}
        >
          Member Deleted!
        </ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
          <p>
            Team member successfully deleted! Ryunosuke Satoro famously said, &ldquo;Individually we
            are one drop, together we are an ocean.&rdquo; Through the action you just took, this
            ocean is now one drop smaller.
          </p>
        </ModalBody>
      </Modal>
    </Container>
  );
});

TeamMembersPopup.displayName = 'TeamMembersPopup';

TeamMembersPopup.propTypes = {
  open: PropTypes.bool.isRequired,
  fetching: PropTypes.bool,
  members: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.object),
    PropTypes.shape({ teamMembers: PropTypes.arrayOf(PropTypes.object) }),
  ]),
  teamData: PropTypes.arrayOf(
    PropTypes.shape({
      members: PropTypes.arrayOf(
        PropTypes.shape({
          userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
          visible: PropTypes.bool,
        }),
      ),
    }),
  ),
  usersdata: PropTypes.arrayOf(PropTypes.object),
  selectedTeamName: PropTypes.string.isRequired,
  onDeleteClick: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onAddUser: PropTypes.func.isRequired,
  onUpdateTeamMemberVisibility: PropTypes.func.isRequired,
};

TeamMembersPopup.defaultProps = {
  members: [],
  teamData: [],
  usersdata: [],
  fetching: false,
};

export default TeamMembersPopup;
