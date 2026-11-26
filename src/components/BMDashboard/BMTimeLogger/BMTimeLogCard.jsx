import { useState, useEffect } from 'react';
import { Alert, Button, Container, Row, Col, InputGroup, Input } from 'reactstrap';
import { useSelector, useDispatch } from 'react-redux';
import BMError from '../shared/BMError';
import { fetchBMProjectMembers } from '../../../actions/bmdashboard/projectMemberAction';
import { bulkStartTimeLogs } from '../../../actions/bmdashboard/timeLoggerActions';
import BMTimeLogCheckInSummary from './BMTimeLogCheckInSummary';
import BMTimeLogDisplayMember from './BMTimeLogDisplayMember';
import BMTimeLogMemberGroup from './BMTimeLogMemberGroup';
import BMTimeLogSummary from './BMTimeLogSummary';
import { groupMembers, GROUP_BY_OPTIONS } from './groupMembers';
import styles from './BMTimeLogCard.module.css';

const getMemberName = member =>
  `${member.user.firstName || ''} ${member.user.lastName || ''}`.trim();

function BMTimeLogCard(props) {
  const [isError, setIsError] = useState(false);
  const [memberList, setMemberList] = useState([]);
  const [isMemberFetched, setIsMemberFetched] = useState(false);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState(new Set());
  const [groupBy, setGroupBy] = useState('none');
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkInMessage, setCheckInMessage] = useState(null);

  const dispatch = useDispatch();
  const errors = useSelector(state => state.errors);
  const projectInfo = useSelector(state => state.bmProjectMembers);

  useEffect(() => {
    dispatch(fetchBMProjectMembers(props.selectedProject));
    // A selection only makes sense within the project it was made in
    setSelectedMemberIds(new Set());
    setCheckInMessage(null);
  }, [props.selectedProject, dispatch]);

  useEffect(() => {
    let members = [];
    if (projectInfo?.members) {
      if (Array.isArray(projectInfo.members)) {
        members = projectInfo.members;
      } else if (projectInfo.members.members && Array.isArray(projectInfo.members.members)) {
        members = projectInfo.members.members;
      }
    }

    setMemberList(members);
    setFilteredMembers(members);
    setIsMemberFetched(true);
  }, [projectInfo]);

  // trigger an error state if there is an errors object
  useEffect(() => {
    if (Object.entries(errors).length > 0) {
      setIsError(true);
    }
  }, [errors]);

  // Success messages clear themselves; failures stay until dismissed so they are not missed
  useEffect(() => {
    if (checkInMessage?.color !== 'success') return undefined;
    const timer = setTimeout(() => setCheckInMessage(null), 5000);
    return () => clearTimeout(timer);
  }, [checkInMessage]);

  // Filter members based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMembers(memberList);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = memberList.filter(member => {
      // Skip members without valid user data
      if (!member?.user) return false;

      const firstName = member.user.firstName?.toLowerCase() || '';
      const lastName = member.user.lastName?.toLowerCase() || '';
      const role = member.user.role?.toLowerCase() || '';
      const fullName = `${firstName} ${lastName}`;

      // Check if user has teams and search in them too
      const teamMatch =
        member.user.teams && member.user.teams.length > 0
          ? member.user.teams.some(team => {
              if (typeof team === 'string') return team.toLowerCase().includes(query);
              if (team?.teamName) return team.teamName.toLowerCase().includes(query);
              return false;
            })
          : false;

      return (
        firstName.includes(query) ||
        lastName.includes(query) ||
        fullName.includes(query) ||
        role.includes(query) ||
        teamMatch
      );
    });

    setFilteredMembers(filtered);
  }, [searchQuery, memberList]);

  const handleSearchChange = e => {
    setSearchQuery(e.target.value);
  };

  const validMembers = memberList.filter(value => value?.user?._id);
  const visibleMembers = filteredMembers.filter(value => value?.user?._id);
  const allVisibleSelected =
    visibleMembers.length > 0 &&
    visibleMembers.every(value => selectedMemberIds.has(value.user._id));
  const hiddenSelectedCount =
    selectedMemberIds.size -
    visibleMembers.filter(value => selectedMemberIds.has(value.user._id)).length;

  const toggleMemberSelected = memberId => {
    setSelectedMemberIds(previous => {
      const next = new Set(previous);
      if (next.has(memberId)) {
        next.delete(memberId);
      } else {
        next.add(memberId);
      }
      return next;
    });
  };

  // Select All only affects the members the current search is showing
  const toggleAllVisible = () => {
    setSelectedMemberIds(previous => {
      const next = new Set(previous);
      visibleMembers.forEach(value => {
        if (allVisibleSelected) {
          next.delete(value.user._id);
        } else {
          next.add(value.user._id);
        }
      });
      return next;
    });
  };

  const describeCheckIn = ({ started, resumed, alreadyCheckedIn, failed }) => {
    const parts = [`Checked in ${started.length + resumed.length}.`];
    if (alreadyCheckedIn.length > 0) parts.push(`${alreadyCheckedIn.length} already checked in.`);
    if (failed.length > 0) {
      const failedNames = failed.map(({ memberId }) => {
        const member = validMembers.find(value => value.user._id === memberId);
        return member ? getMemberName(member) : memberId;
      });
      parts.push(`Failed: ${failedNames.join(', ')}.`);
    }
    return parts.join(' ');
  };

  const checkInSelected = async () => {
    setIsCheckingIn(true);
    setCheckInMessage(null);
    try {
      const results = await dispatch(
        bulkStartTimeLogs(props.selectedProject, [...selectedMemberIds]),
      );
      // Failed members stay selected so they can be retried
      setSelectedMemberIds(new Set(results.failed.map(({ memberId }) => memberId)));
      setCheckInMessage({
        color: results.failed.length > 0 ? 'warning' : 'success',
        text: describeCheckIn(results),
      });
    } catch (error) {
      setCheckInMessage({
        color: 'danger',
        text: error.response?.data?.message || 'Error checking in selected members',
      });
    } finally {
      setIsCheckingIn(false);
    }
  };

  const renderMemberCards = members => (
    <Row>
      {members.map((value, index) => (
        <Col sm={6} lg={4} key={value.user._id}>
          <BMTimeLogDisplayMember
            firstName={value.user.firstName || ''}
            lastName={value.user.lastName || ''}
            role={value.user.role || ''}
            index={index}
            memberId={value.user._id}
            projectId={props.selectedProject}
            isSelected={selectedMemberIds.has(value.user._id)}
            onToggleSelected={toggleMemberSelected}
          />
        </Col>
      ))}
    </Row>
  );

  return (
    <Container fluid>
      {/* Time Log Summary Section */}
      <BMTimeLogSummary projectId={props.selectedProject} />

      {isMemberFetched && (
        <>
          <BMTimeLogCheckInSummary projectId={props.selectedProject} members={validMembers} />

          <Row className="my-3">
            <Col md={6} className="mx-auto">
              <InputGroup>
                <Input
                  type="text"
                  placeholder="Search by name, role, or team..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </InputGroup>
              <small className="text-muted">
                Found {filteredMembers.length} out of {memberList.length} members
              </small>
            </Col>
          </Row>

          <div className={`${styles.bulkToolbar}`}>
            <label className={`${styles.bulkToolbarItem} mb-0`}>
              <input
                type="checkbox"
                checked={allVisibleSelected}
                disabled={visibleMembers.length === 0}
                onChange={toggleAllVisible}
              />{' '}
              {allVisibleSelected ? 'Deselect All' : 'Select All'}
            </label>
            <label className={`${styles.bulkToolbarItem} mb-0`}>
              Group by:{' '}
              <select value={groupBy} onChange={e => setGroupBy(e.target.value)}>
                <option value="none">None</option>
                {Object.entries(GROUP_BY_OPTIONS).map(([value, { label }]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <Button
              color="primary"
              disabled={selectedMemberIds.size === 0 || isCheckingIn}
              onClick={checkInSelected}
            >
              Check In Selected Members ({selectedMemberIds.size})
            </Button>
            {hiddenSelectedCount > 0 && (
              <small className="text-muted">
                {hiddenSelectedCount} selected not shown by search
              </small>
            )}
          </div>

          {checkInMessage && (
            <Alert
              color={checkInMessage.color}
              className={`${styles.checkInMessage}`}
              toggle={
                checkInMessage.color === 'success' ? undefined : () => setCheckInMessage(null)
              }
            >
              {checkInMessage.text}
            </Alert>
          )}

          {filteredMembers.length > 0 ? (
            <>
              {groupBy !== 'none'
                ? groupMembers(visibleMembers, GROUP_BY_OPTIONS[groupBy].getGroups).map(group => (
                    <BMTimeLogMemberGroup
                      key={group.key}
                      label={group.label}
                      memberCount={group.members.length}
                    >
                      {renderMemberCards(group.members)}
                    </BMTimeLogMemberGroup>
                  ))
                : renderMemberCards(visibleMembers)}
            </>
          ) : (
            <Row>
              <Col className="text-center py-4">
                {searchQuery.trim() ? (
                  <h5>No members found matching &quot;{searchQuery}&quot;</h5>
                ) : (
                  <h5>No members available for this project</h5>
                )}
              </Col>
            </Row>
          )}
        </>
      )}
      {isError && <BMError errors={errors} />}
    </Container>
  );
}

export default BMTimeLogCard;
