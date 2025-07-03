import { useState, useEffect } from 'react';
import { Container, Row, Col, InputGroup, Input } from 'reactstrap';
import { useSelector, useDispatch } from 'react-redux';
import BMError from '../shared/BMError';
import { fetchBMProjectMembers } from '../../../actions/bmdashboard/projectMemberAction';
import BMTimeLogDisplayMember from './BMTimeLogDisplayMember';

function BMTimeLogCard(props) {
  const [isError, setIsError] = useState(false);
  const [memberList, setMemberList] = useState([]);
  const [isMemberFetched, setIsMemberFetched] = useState(false);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const dispatch = useDispatch();
  const errors = useSelector(state => state.errors);
  const projectInfo = useSelector(state => state.bmProjectMembers);

  useEffect(() => {
    dispatch(fetchBMProjectMembers(props.selectedProject));
  }, [props.selectedProject, dispatch]);

  useEffect(() => {
    if (projectInfo && projectInfo.members.members) {
      setMemberList(projectInfo.members.members);
      setFilteredMembers(projectInfo.members.members);
      setIsMemberFetched(true);
    }
  }, [projectInfo]);

  // trigger an error state if there is an errors object
  useEffect(() => {
    if (Object.entries(errors).length > 0) {
      setIsError(true);
    }
  }, [errors]);

  // Filter members based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMembers(memberList);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = memberList.filter(member => {
      const firstName = member.user.firstName.toLowerCase();
      const lastName = member.user.lastName.toLowerCase();
      const fullName = `${firstName} ${lastName}`;
      const role = member.user.role.toLowerCase();

      // Check if user has teams and search in them too
      const teamMatch =
        member.user.teams && member.user.teams.length > 0
          ? member.user.teams.some(team =>
              // eslint-disable-next-line no-nested-ternary
              typeof team === 'string'
                ? team.toLowerCase().includes(query)
                : team.name
                ? team.name.toLowerCase().includes(query)
                : false,
            )
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

  return (
    <Container fluid>
      {isMemberFetched && (
        <>
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

          {filteredMembers.length > 0 ? (
            <Row>
              {filteredMembers.map((value, index) => (
                <Col md={4} key={value.user._id}>
                  <BMTimeLogDisplayMember
                    firstName={value.user.firstName}
                    lastName={value.user.lastName}
                    role={value.user.role}
                    index={index}
                    memberId={value.user._id}
                    projectId={props.selectedProject}
                  />
                </Col>
              ))}
            </Row>
          ) : (
            <Row>
              <Col className="text-center py-4">
                <h5>No members found matching &quot;{searchQuery}&quot;</h5>
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
