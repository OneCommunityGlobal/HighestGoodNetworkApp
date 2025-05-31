import { useState, useEffect, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import { Table, Button, Dropdown, Form, Row, Col, Container } from 'react-bootstrap';
import './IssuesList.css';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchOpenIssues,
  deleteIssue,
  updateIssue,
} from '../../../actions/bmdashboard/issueChartActions';
import { fetchBMProjects } from '../../../actions/bmdashboard/projectActions';

export default function IssuesList() {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);

  // Fetch issues and projects from the Redux store
  const { issues: rawIssues } = useSelector(state => state.bmIssues);
  const projects = useSelector(state => state.bmProjects);

  // State hooks for filters and edits
  const [tagFilter, setTagFilter] = useState(null);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [dropdownOpenId, setDropdownOpenId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageGroupStart, setPageGroupStart] = useState(1);

  const [startDate, endDate] = dateRange;
  const itemsPerPage = 5;

  // Build a map of projectId -> projectName
  const projectMap = useMemo(() => Object.fromEntries(projects.map(p => [p._id, p.name])), [
    projects,
  ]);

  // Format and enrich issue data from the store
  const mappedIssues = useMemo(() => {
    if (!rawIssues?.length) return [];
    return rawIssues.map(issue => {
      const created = new Date(issue.createdDate);
      const diffDays = Math.floor((new Date() - created) / (1000 * 60 * 60 * 24));
      return {
        id: issue._id,
        name: issue.issueTitle?.[0] || 'Untitled',
        tag: issue.tag || '',
        date: created,
        project: projectMap[issue.projectId] || 'Unknown Project',
        openSince: diffDays,
        cost: issue.cost,
        person: issue.person,
      };
    });
  }, [rawIssues, projectMap]);

  // Fetch issues and projects when component mounts
  useEffect(() => {
    dispatch(fetchOpenIssues());
    dispatch(fetchBMProjects());
  }, [dispatch]);

  // Handler to rename an issue
  const handleRename = id => {
    const issue = mappedIssues.find(i => i.id === id);
    if (issue) {
      setEditingId(id);
      setEditedName(issue.name);
    }
    setDropdownOpenId(null);
  };

  // Handler to submit the edited issue name
  const handleNameSubmit = id => {
    dispatch(updateIssue(id, { 'issueTitle.0': editedName })).then(() =>
      dispatch(fetchOpenIssues()),
    );
    setEditingId(null);
    setEditedName('');
  };

  // Handler to delete an issue
  const handleDelete = id => {
    dispatch(deleteIssue(id)).then(() => dispatch(fetchOpenIssues()));
    setDropdownOpenId(null);
  };

  // Handler to close an issue
  const handleCloseIssue = id => {
    dispatch(updateIssue(id, { status: 'close' })).then(() => dispatch(fetchOpenIssues()));
    setDropdownOpenId(null);
  };

  // Filter issues based on selected tag, projects, and date range
  const filtered = useMemo(() => {
    return mappedIssues.filter(issue => {
      const inTag = !tagFilter || issue.tag === tagFilter;
      const inProject = selectedProjects.length === 0 || selectedProjects.includes(issue.project);
      const inDateRange =
        !startDate || !endDate || (issue.date >= startDate && issue.date <= endDate);
      return inTag && inProject && inDateRange;
    });
  }, [mappedIssues, tagFilter, selectedProjects, startDate, endDate]);

  // Calculate the current items for pagination
  const currentItems = useMemo(() => {
    const indexOfLast = currentPage * itemsPerPage;
    return filtered.slice(indexOfLast - itemsPerPage, indexOfLast);
  }, [filtered, currentPage]);

  const formatDate = date => date?.toISOString().split('T')[0];
  const dateRangeLabel =
    startDate && endDate ? `${formatDate(startDate)} - ${formatDate(endDate)}` : '';

  return (
    <Container className={darkMode ? 'dark-theme' : ''}>
      <h4 className="mb-4">A List of Issues</h4>
      <Row className="mb-3 align-items-center">
        <Col md={4}>
          <div className="datepicker-wrapper">
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={setDateRange}
              placeholderText="Filter by Date Range"
              className={`form-control ${darkMode ? 'datepicker-dark' : ''}`}
              value={dateRangeLabel}
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
        <Col md={4}>
          <Select
            isMulti
            classNamePrefix="custom-select"
            className="w-100"
            options={[...new Set(mappedIssues.map(i => i.project))].map(p => ({
              label: p,
              value: p,
            }))}
            value={selectedProjects.map(p => ({ label: p, value: p }))}
            onChange={opts => setSelectedProjects(opts.map(o => o.value))}
            placeholder="Filter by Projects"
          />
        </Col>
        <Col md={2}>
          <Button
            variant="danger"
            onClick={() => {
              setTagFilter(null);
              setSelectedProjects([]);
              setDateRange([null, null]);
            }}
          >
            Reset All
          </Button>
        </Col>
      </Row>

      <Table bordered hover responsive className="issue-table">
        <thead>
          <tr>
            <th>Issue Name</th>
            <th>Tag</th>
            <th>Open Since (days)</th>
            <th>Cost (USD)</th>
            <th>Person</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map(issue => (
            <tr key={issue.id}>
              <td>
                {editingId === issue.id && (
                  <div className="d-flex gap-2">
                    <Form.Control
                      type="text"
                      value={editedName}
                      onChange={e => setEditedName(e.target.value)}
                      autoFocus
                    />
                    <Button size="sm" variant="success" onClick={() => handleNameSubmit(issue.id)}>
                      Submit
                    </Button>
                  </div>
                )}
                {editingId !== issue.id && issue.name}
              </td>
              <td>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => setTagFilter(tagFilter === issue.tag ? null : issue.tag)}
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
                    <Dropdown.Item onClick={() => handleRename(issue.id)}>Rename</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleDelete(issue.id)}>Delete</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleCloseIssue(issue.id)}>
                      Close Issue
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="pagination-container">
        <Button
          variant="outline-secondary"
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

        {Array.from(
          { length: Math.min(5, Math.ceil(filtered.length / itemsPerPage) - pageGroupStart + 1) },
          (_, i) => (
            <Button
              key={i}
              onClick={() => setCurrentPage(pageGroupStart + i)}
              variant={currentPage === pageGroupStart + i ? 'primary' : 'outline-secondary'}
              className="mx-1"
            >
              {pageGroupStart + i}
            </Button>
          ),
        )}

        <Button
          variant="outline-secondary"
          onClick={() => {
            if (pageGroupStart + 5 <= Math.ceil(filtered.length / itemsPerPage)) {
              setPageGroupStart(pageGroupStart + 5);
              setCurrentPage(pageGroupStart + 5);
            }
          }}
          disabled={pageGroupStart + 5 > Math.ceil(filtered.length / itemsPerPage)}
        >
          &raquo;
        </Button>
      </div>
    </Container>
  );
}
