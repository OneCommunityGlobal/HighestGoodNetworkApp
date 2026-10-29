import { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, InputGroup, Input, Button, Label } from 'reactstrap';
import { useSelector, useDispatch } from 'react-redux';
import BMError from '../shared/BMError';
import { fetchBMProjectMembers } from '../../../actions/bmdashboard/projectMemberAction';
import BMTimeLogDisplayMember from './BMTimeLogDisplayMember';
import BMTimeLogSummary from './BMTimeLogSummary';
import styles from './BMTimeLogCard.module.css';

function BMTimeLogCard(props) {
  const [isError, setIsError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const dispatch = useDispatch();
  const projectInfo = useSelector(state => state.bmProjectMembers);
  const errors = useSelector(state => state.errors);
  const darkMode = useSelector(state => state.theme?.darkMode || false);

  useEffect(() => {
    dispatch(fetchBMProjectMembers(props.selectedProject));
  }, [props.selectedProject, dispatch]);

  // Never render a previous project's data, even before the fetch effect runs.
  const isCurrentProject = projectInfo.projectId === props.selectedProject;
  const memberStatus = isCurrentProject ? projectInfo.status : 'idle';
  const isMemberFetched = memberStatus === 'success' || memberStatus === 'empty';
  const projectMembers = isCurrentProject
    ? projectInfo.members
    : projectInfo.byProject?.[props.selectedProject]?.members;
  // The slice retains only successful member data for each project. Keep cards
  // mounted during refresh/retry so their timers and the search context survive.
  const memberList = useMemo(() => (projectMembers || []).filter(member => member?.user?._id), [
    projectMembers,
  ]);
  const hasCachedMembers = memberList.length > 0;
  const showMemberList = isMemberFetched || hasCachedMembers;
  const retryMembers = () => dispatch(fetchBMProjectMembers(props.selectedProject));
  const activeQuery = searchQuery.trim();
  const clearSearch = () => setSearchQuery('');

  // trigger an error state if there is an errors object
  useEffect(() => {
    if (Object.entries(errors).length > 0) {
      setIsError(true);
    }
  }, [errors]);

  // Filter members based on search query
  const filteredMembers = useMemo(() => {
    if (!activeQuery) return memberList;

    const query = activeQuery.toLowerCase();
    return memberList.filter(member => {
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
              if (team?.name) return team.name.toLowerCase().includes(query);
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
  }, [activeQuery, memberList]);

  const matchingMemberIds = new Set(filteredMembers.map(member => member.user._id));

  const handleSearchChange = e => {
    setSearchQuery(e.target.value);
  };

  return (
    <Container
      fluid
      className={`${styles.memberSearchScope} ${darkMode ? styles.memberSearchDark : ''}`}
    >
      {/* Time Log Summary Section */}
      <BMTimeLogSummary projectId={props.selectedProject} />

      {(memberStatus === 'idle' || memberStatus === 'loading') && (
        <p role="status" className={styles.memberSearchFeedback}>
          {hasCachedMembers ? 'Refreshing project members...' : 'Loading project members...'}
        </p>
      )}
      {memberStatus === 'error' && (
        <div role="alert" className={styles.memberRecoveryNotice}>
          <p>
            {hasCachedMembers
              ? 'Unable to refresh members. Showing previously loaded data.'
              : 'Unable to load members. Please try again.'}
          </p>
          <Button type="button" color="secondary" onClick={retryMembers}>
            Retry
          </Button>
        </div>
      )}
      {showMemberList && (
        <>
          <Row className="my-3">
            <Col md={8} className="mx-auto">
              <Label for="bm-member-search">Search members</Label>
              <InputGroup className={styles.memberSearchControls}>
                <Input
                  id="bm-member-search"
                  className={styles.memberSearchInput}
                  type="search"
                  placeholder="Search by name, role, or team..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  aria-describedby="bm-member-search-status"
                />
                <Button
                  type="button"
                  color="secondary"
                  className={styles.memberSearchClear}
                  onClick={clearSearch}
                  disabled={!searchQuery}
                >
                  Clear Search
                </Button>
              </InputGroup>
              <div
                id="bm-member-search-status"
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className={styles.memberSearchFeedback}
              >
                <p>
                  Found {filteredMembers.length} out of {memberList.length} members
                </p>
                {activeQuery && (
                  <>
                    <p>Showing results for &quot;{searchQuery}&quot;</p>
                    <span className={styles.memberSearchAppliedFilter}>
                      Applied filter: Search: &quot;{activeQuery}&quot;
                    </span>
                  </>
                )}
              </div>
            </Col>
          </Row>

          {/* Keep timers mounted while search hides nonmatching members. */}
          <Row>
            {memberList.map((value, index) => (
              <Col
                xs={12}
                sm={6}
                lg={4}
                className={styles.memberCardColumn}
                key={`${props.selectedProject}_${value.user._id}`}
                hidden={!matchingMemberIds.has(value.user._id)}
              >
                <BMTimeLogDisplayMember
                  isVisible={matchingMemberIds.has(value.user._id)}
                  firstName={value.user.firstName || ''}
                  lastName={value.user.lastName || ''}
                  role={value.user.role || ''}
                  index={index}
                  memberId={value.user._id}
                  projectId={props.selectedProject}
                />
              </Col>
            ))}
          </Row>
          {filteredMembers.length === 0 && (
            <Row>
              <Col className={styles.memberSearchEmpty}>
                {activeQuery ? (
                  <>
                    <h5>No members found matching &quot;{searchQuery}&quot;</h5>
                    <p>Clear the search or try another name, role, or team.</p>
                    <Button type="button" color="secondary" onClick={clearSearch}>
                      Clear Search
                    </Button>
                  </>
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
