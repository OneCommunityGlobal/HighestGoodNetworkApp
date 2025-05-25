import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import { Table, Button, Dropdown, Form, Row, Col, Container } from 'react-bootstrap';
import './IssuesList.css';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBMProjects } from 'actions/bmdashboard/projectActions';
import { deleteIssue, fetchOpenIssues, updateIssue } from 'actions/bmdashboard/issueChartActions';

export default function IssueList() {
  const [tagFilter, setTagFilter] = useState(null);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [issues, setIssues] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState('');
  const darkMode = useSelector(state => state.theme.darkMode);

  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const closeDropdown = () => setDropdownOpenId(null);

  const handleTagClick = tag => {
    if (tagFilter === tag) {
      setTagFilter(null);
      return;
    }
    setTagFilter(tag);
  };
  const dispatch = useDispatch();

  const { issues: rawIssues } = useSelector(state => state.bmIssues);
  const projects = useSelector(state => state.bmProjects);
  const projectMap = Object.fromEntries(projects.map(p => [p._id, p.name]));

  useEffect(() => {
    dispatch(fetchOpenIssues());
    dispatch(fetchBMProjects());
  }, [dispatch]);

  const getDaysSinceCreated = createdDateStr => {
    const created = new Date(createdDateStr);
    const now = new Date();
    const diffTime = now - created; // difference in milliseconds
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // convert to days
    return diffDays;
  };

  useEffect(() => {
    if (Array.isArray(rawIssues) && rawIssues.length > 0) {
      const processed = rawIssues.map(issue => ({
        id: issue._id,
        name: issue.issueTitle?.[0] || 'Untitled',
        tag: issue.tag || '',
        date: new Date(issue.createdDate.split('T')[0]) || null,
        project: projectMap[issue.projectId] || 'Unknown Project',
        openSince: getDaysSinceCreated(issue.createdDate.split('T')[0]),
        cost: issue.cost,
        person: issue.person,
      }));
      setIssues(processed);
    }
  }, [rawIssues]);

  const uniqueProjects = [...new Set(issues.map(issue => issue.project))];
  const projectOptions = uniqueProjects.map(project => ({
    label: project,
    value: project,
  }));

  const handleRename = issueId => {
    const issue = issues.find(i => i.id === issueId);
    if (issue) {
      setEditingId(issueId);
      setEditedName(issue.name);
    }
    closeDropdown();
  };

  const handleDelete = issueId => {
    dispatch(deleteIssue(issueId));
    closeDropdown();
  };

  const handleCloseIssue = issueId => {
    dispatch(updateIssue(issueId, { status: 'close' }));
    closeDropdown();
  };

  const handleNameChange = e => {
    setEditedName(e.target.value);
  };

  const handleReset = () => {
    setTagFilter(null);
    setSelectedProjects([]);
    setDateRange([null, null]);
  };

  const handleNameSubmit = issueId => {
    dispatch(updateIssue(issueId, { 'issueTitle.0': editedName }));
    setEditingId(null);
    setEditedName('');
  };

  const filteredIssues = issues.filter(issue => {
    const inDateRange =
      !startDate || !endDate || (issue.date >= startDate && issue.date <= endDate);
    return (
      (!tagFilter || issue.tag === tagFilter) &&
      (selectedProjects.length === 0 || selectedProjects.includes(issue.project)) &&
      inDateRange
    );
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageGroupStart, setPageGroupStart] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(filteredIssues.length / itemsPerPage);

  // Slice data for current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredIssues.slice(indexOfFirstItem, indexOfLastItem);
  const handlePageClick = page => {
    setCurrentPage(page);

    // Shift page group if needed
    if (page >= pageGroupStart + 5) {
      setPageGroupStart(pageGroupStart + 5);
    } else if (page < pageGroupStart) {
      setPageGroupStart(pageGroupStart - 5);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const end = Math.min(pageGroupStart + 4, totalPages);
    // eslint-disable-next-line no-plusplus
    for (let i = pageGroupStart; i <= end; i++) {
      pageNumbers.push(
        <Button
          key={i}
          onClick={() => handlePageClick(i)}
          variant={currentPage === i ? 'primary' : 'outline-secondary'}
          className="mx-1"
        >
          {i}
        </Button>,
      );
    }
    return pageNumbers;
  };

  const formatDate = date => {
    return date.toISOString().slice(0, 10); // YYYY-MM-DD
  };

  const formattedRange =
    startDate && endDate ? `${formatDate(startDate)} - ${formatDate(endDate)}` : '';

  return (
    <Container className={`${darkMode ? 'dark-theme' : ''}`} style={{ padding: '20px' }}>
      <h4 className="mb-4">A List of Issues</h4>

      <Row className="mb-3 align-items-center">
        {/* Date Filter */}
        <Col md={4}>
          <div className="d-flex align-items-center">
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={update => setDateRange(update)}
              isClearable={false} // we'll use our own clear button
              placeholderText="Filter by Date Range"
              className="form-control"
              value={startDate && endDate ? formattedRange : ''}
            />
            <Button
              variant="outline-danger"
              size="sm"
              className="ms-2"
              onClick={() => setDateRange([null, null])}
            >
              ✕
            </Button>
          </div>
        </Col>

        {/* Project Filter */}
        <Col md={4}>
          <div className="d-flex align-items-center">
            <Select
              isMulti
              options={projectOptions}
              value={projectOptions.filter(opt => selectedProjects.includes(opt.value))}
              onChange={selectedOptions =>
                setSelectedProjects(selectedOptions.map(opt => opt.value))
              }
              placeholder="Filter by Projects"
            />
          </div>
        </Col>

        {/* Reset All Filters */}
        <Col md={2}>
          <Button variant="danger" onClick={handleReset}>
            Reset All
          </Button>
        </Col>
      </Row>

      <Table bordered hover responsive className="issue-table">
        <thead>
          <tr>
            <th>Issue Name</th>
            <th>Tag</th>
            <th>Open Since(days)</th>
            <th>Cost(usd)</th>
            <th>Person</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map(issue => (
            <tr key={issue.id}>
              <td>
                {editingId === issue.id ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Form.Control
                      type="text"
                      value={editedName}
                      onChange={handleNameChange}
                      autoFocus
                    />
                    <Button size="sm" variant="success" onClick={() => handleNameSubmit(issue.id)}>
                      Submit
                    </Button>
                  </div>
                ) : (
                  issue.name || 'Unnamed'
                )}
              </td>
              <td>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => handleTagClick(issue.tag)}
                >
                  {issue.tag}
                </Button>
              </td>
              <td>{issue.openSince}</td>
              <td>{issue.cost}</td>
              <td>{`${issue.person.name} - ${issue.person.role}`}</td>
              <td>
                <Dropdown
                  show={dropdownOpenId === issue.id}
                  onToggle={isOpen => setDropdownOpenId(isOpen ? issue.id : null)}
                >
                  <Dropdown.Toggle variant="outline-secondary" size="sm">
                    Options
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="dropdown-menu-custom">
                    <Button
                      variant="link"
                      className="dropdown-item"
                      onClick={() => handleRename(issue.id)}
                    >
                      Rename
                    </Button>
                    <Button
                      variant="link"
                      className="dropdown-item"
                      onClick={() => handleDelete(issue.id)}
                    >
                      Delete
                    </Button>
                    <Button
                      variant="link"
                      className="dropdown-item"
                      onClick={() => handleCloseIssue(issue.id)}
                    >
                      Close Issue
                    </Button>
                  </Dropdown.Menu>
                </Dropdown>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="d-flex justify-content-center mt-3">
        <Button
          variant="outline-secondary"
          className="mx-1"
          onClick={() => {
            if (pageGroupStart > 1) {
              setPageGroupStart(pageGroupStart - 5);
              setCurrentPage(pageGroupStart - 5);
            }
          }}
          disabled={pageGroupStart === 1}
        >
          &laquo;
        </Button>

        {renderPageNumbers()}

        <Button
          variant="outline-secondary"
          className="mx-1"
          onClick={() => {
            if (pageGroupStart + 5 <= totalPages) {
              setPageGroupStart(pageGroupStart + 5);
              setCurrentPage(pageGroupStart + 5);
            }
          }}
          disabled={pageGroupStart + 5 > totalPages}
        >
          &raquo;
        </Button>
      </div>
    </Container>
  );
}
