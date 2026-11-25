import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Container, Row, Col, InputGroup, Input, Button } from 'reactstrap';
import { useDispatch } from 'react-redux';
import { fetchBMProjectMembers } from '../../../actions/bmdashboard/projectMemberAction';
import BMTimeLogDisplayMember from './BMTimeLogDisplayMember';
import BMTimeLogSummary from './BMTimeLogSummary';

// The members endpoint has returned both `members: [...]` and
// `members: { members: [...] }`, so accept either shape.
const normalizeMembers = members => {
  if (Array.isArray(members)) return members;
  if (Array.isArray(members?.members)) return members.members;
  return [];
};

const getLoadErrorMessage = error => {
  const status = error?.response?.status;
  if (status === 400)
    return 'This project link is not valid. Please select a project from the list.';
  if (status === 404) return 'This project was not found. Please select a project from the list.';
  return 'Could not load the members for this project.';
};

function BMTimeLogCard({ selectedProject }) {
  const [memberList, setMemberList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  // 'loading' | 'loaded' | 'error'
  const [loadStatus, setLoadStatus] = useState('loading');
  const [loadError, setLoadError] = useState(null);

  const dispatch = useDispatch();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const loadMembers = useCallback(async () => {
    setLoadStatus('loading');
    setLoadError(null);

    const result = await dispatch(fetchBMProjectMembers(selectedProject));
    if (!isMounted.current) return;

    if (result?.ok) {
      const members = normalizeMembers(result.members);
      setMemberList(members);
      setLoadStatus('loaded');
    } else {
      setMemberList([]);
      setLoadError(result?.error ?? null);
      setLoadStatus('error');
    }
  }, [dispatch, selectedProject]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  // Filter members based on search query. Computed during render (not in an
  // effect) so the list never lags one render behind the search box.
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return memberList;

    const query = searchQuery.toLowerCase();
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
  }, [searchQuery, memberList]);

  const handleSearchChange = e => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  if (loadStatus === 'loading') {
    return (
      <Container fluid>
        <Row>
          <Col className="text-center py-4">
            <i className="fa fa-spinner fa-pulse" aria-hidden="true" /> Loading members...
          </Col>
        </Row>
      </Container>
    );
  }

  if (loadStatus === 'error') {
    return (
      <Container fluid>
        <Row>
          <Col className="text-center py-4" role="alert">
            <h5>{getLoadErrorMessage(loadError)}</h5>
            <Button outline color="primary" className="mt-2" onClick={loadMembers}>
              Retry
            </Button>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid>
      {/* Time Log Summary Section */}
      <BMTimeLogSummary projectId={selectedProject} />

      <Row className="my-3">
        <Col md={6} className="mx-auto">
          <InputGroup>
            <Input
              type="text"
              placeholder="Search by name, role, or team..."
              aria-label="Search members by name, role, or team"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery && (
              <Button outline color="secondary" onClick={handleClearSearch}>
                Clear
              </Button>
            )}
          </InputGroup>
          <small className="text-muted">
            Found {filteredMembers.length} out of {memberList.length} members
          </small>
        </Col>
      </Row>

      {filteredMembers.length > 0 ? (
        <Row>
          {filteredMembers
            .filter(value => value?.user?._id)
            .map((value, index) => (
              <Col md={4} key={value.user._id}>
                <BMTimeLogDisplayMember
                  firstName={value.user.firstName || ''}
                  lastName={value.user.lastName || ''}
                  role={value.user.role || ''}
                  index={index}
                  memberId={value.user._id}
                  projectId={selectedProject}
                />
              </Col>
            ))}
        </Row>
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
    </Container>
  );
}

export default BMTimeLogCard;
