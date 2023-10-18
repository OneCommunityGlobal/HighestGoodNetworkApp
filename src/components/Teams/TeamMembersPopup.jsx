import React, { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Container,
  Alert,
  TabContent,
} from 'reactstrap';
import MembersAutoComplete from './MembersAutoComplete';
// import { SwitchComponent } from '@syncfusion/ej2-react-buttons';

import hasPermission from 'utils/permissions';
import { boxStyle } from 'styles';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import { connect } from 'react-redux';
import ToggleSwitch from '../UserProfile/UserProfileEdit/ToggleSwitch';
import InfoModal from './InfoModal';

const TeamMembersPopup = React.memo(props => {
  const closePopup = () => {
    props.onClose();
    setSortOrder(0);
  };
  const [selectedUser, onSelectUser] = useState(undefined);
  const [isValidUser, onValidation] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [memberList, setMemberList] = useState([]);
  const [sortOrder, setSortOrder] = useState(0);
  const [teamVisibility, setTeamVisibility] = useState([]);
  const [infoModal, setInfoModal] = useState(false);

  const canAssignTeamToUsers = props.hasPermission('assignTeamToUsers');

  const toggleInfoModal = () => {
    setInfoModal(!infoModal);
  };

  const onAddUser = () => {
    if (selectedUser && !props.members.teamMembers.some(x => x._id === selectedUser._id)) {
      props.onAddUser(selectedUser);
      setSearchText('');
    } else {
      onValidation(false);
    }
  };
  const selectUser = user => {
    onSelectUser(user);
    onValidation(true);
  };

  /**
   * The function to sort the memberlist
   * @param {-1 | 0 | 1} [sort = 0]
   * -1: ascending order by date
   * 0: alphabetized order by name
   * 1: descending order by date
   */
  const sortList = (sort = 0) => {
    let sortedList = [];

    if (sort === 0) {
      sortedList = props.members.teamMembers.toSorted(sortByAlpha);
    } else {
      const sortByDateList = props.members.teamMembers.toSorted((a, b) => {
        return moment(a.addDateTime).diff(moment(b.addDateTime)) * -sort;
      });

      const dataList = Object.values(
        sortByDateList.reduce((pre, cur) => {
          const date = moment(cur.addDateTime).format('MMM-DD-YY');
          pre[date] ? pre[date].push(cur) : (pre[date] = [cur]);
          return pre;
        }, {}),
      );

      dataList.forEach(item => {
        sortedList.push(...item.toSorted(sortByAlpha));
      });
    }

    setMemberList(sortedList);
  };

  const sortByAlpha = useCallback((a, b) => {
    const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
    const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
    return nameA.localeCompare(nameB);
  });

  const icons = {
    '-1': { icon: faSortUp },
    '0': { icon: faSort, style: { color: 'lightgrey' } },
    '1': { icon: faSortDown },
  };

  const toggleOrder = useCallback(() => {
    setSortOrder(pre => {
      if (pre !== -1) {
        return pre - 1;
      }
      return 1;
    });
  });

  // call the handler to update the team member's visibility
  const UpdateTeamMembersVisiblity = (userId, choice) => {
    props.onUpdateTeamMemberVisiblity(userId, choice);
  };

  useEffect(() => {
    sortList(sortOrder);
    setTeamVisibility(props.teamData);
  }, [props.members.teamMembers, sortOrder]);

  useEffect(() => {
    onValidation(true);
  }, [props.open]);

  useEffect(() => {
    setTeamVisibility(props.teamData);
  }, [props.teamData]);
  return (
    <Container fluid>
      <InfoModal isOpen={infoModal} toggle={toggleInfoModal} />

      <Modal isOpen={props.open} toggle={closePopup} autoFocus={false} size="lg">
        <ModalHeader toggle={closePopup}>{`Members of ${props.selectedTeamName}`}</ModalHeader>
        <ModalBody style={{ textAlign: 'center' }}>
          {canAssignTeamToUsers && (
            <div className="input-group-prepend" style={{ marginBottom: '10px' }}>
              <MembersAutoComplete
                userProfileData={props.usersdata}
                onAddUser={selectUser}
                searchText={searchText}
                setSearchText={setSearchText}
              />
              <Button color="primary" onClick={onAddUser} style={boxStyle}>
                Add
              </Button>
            </div>
          )}
          {!isValidUser && <Alert color="danger">Please choose a valid user.</Alert>}
          <table className="table table-bordered table-responsive-sm">
            <thead>
              <tr>
                <th>#</th>
                <th>User Name</th>
                <th style={{ cursor: 'pointer' }} onClick={toggleOrder}>
                  Date Added <FontAwesomeIcon {...icons[sortOrder]} />
                </th>
                <th>
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
                {canAssignTeamToUsers && <th />}
              </tr>
            </thead>
            <tbody>
              {props.members.teamMembers.length > 0 &&
                memberList.toSorted().map((user, index) => {
                  // console.log('choice from backend', teamVisibility[0]?.members.find(member => member.userId === user._id)?.visible );
                  return (
                    <tr key={`team_member_${index}`}>
                      <td>{index + 1}</td>
                      <td>{`${user.firstName} ${user.lastName}`}</td>
                      <td>{moment(user.addDateTime).format('MMM-DD-YY')}</td>
                      <td>
                        <ToggleSwitch
                          switchType="limit-visiblity"
                          userId={user._id}
                          choice={
                            teamVisibility[0]?.members.find(member => member.userId === user._id)
                              ?.visible || true
                          }
                          UpdateTeamMembersVisiblity={UpdateTeamMembersVisiblity}
                        />
                      </td>
                      {canAssignTeamToUsers && (
                        <td>
                          <Button
                            color="danger"
                            onClick={() => props.onDeleteClick(`${user._id}`)}
                            style={boxStyle}
                          >
                            Delete
                          </Button>
                        </td>
                      )}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={closePopup} style={boxStyle}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
});

export default connect(null, { hasPermission })(TeamMembersPopup);
