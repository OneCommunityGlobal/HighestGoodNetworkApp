import { useState, useEffect, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import axios from 'axios';
import 'react-datepicker/dist/react-datepicker.css';
import { Table, Button, Dropdown, Form, Row, Col } from 'react-bootstrap';
import './IssuesList.css';
import { useSelector } from 'react-redux';
import { ENDPOINTS } from '../../../utils/URL';

export default function IssuesList() {
  const darkMode = useSelector(state => state.theme.darkMode);

  const [projects, setProjects] = useState([]);
  const [openIssues, setOpenIssues] = useState([]);
  const [tagFilter, setTagFilter] = useState(null);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageGroupStart, setPageGroupStart] = useState(1);
  const [error, setError] = useState('');

  const [startDate, endDate] = dateRange;
  const itemsPerPage = 5;

  // Fetch projects from the backend
  const fetchProjects = async () => {
    try {
      const response = await axios.get(ENDPOINTS.BM_GET_ISSUE_PROJECTS);
      setProjects(response.data);
    } catch (err) {
      setError(`Error fetching projects: ${err}`);
    }
  };

  // Fetch open issues with applied filters
  const fetchIssuesWithFilters = async () => {
    try {
      const formattedStart = startDate ? new Date(startDate).toISOString() : null;
      const formattedEnd = endDate ? new Date(endDate).toISOString() : null;
      const projectIds = selectedProjects.length > 0 ? selectedProjects.join(',') : null;
      const url = ENDPOINTS.BM_GET_OPEN_ISSUES(projectIds, formattedStart, formattedEnd, tagFilter);
      const response = await axios.get(url);
      setOpenIssues(response.data);
    } catch (err) {
      setError(`Error fetching open issues with filters: ${err}`);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchAndResetPagination = async () => {
      await fetchIssuesWithFilters();
      setCurrentPage(1);
      setPageGroupStart(1);
    };
    fetchAndResetPagination();
  }, [tagFilter, selectedProjects, startDate, endDate]);

  // Memoize the mapped issues to avoid unnecessary recalculations
  const mappedIssues = useMemo(() => {
    return openIssues.map(issue => {
      const created = new Date(issue.createdDate);
      const diffDays = Math.floor((new Date() - created) / (1000 * 60 * 60 * 24));
      return {
        id: issue._id,
        name: issue.issueTitle?.[0] || 'Untitled',
        tag: issue.tag || '',
        openSince: diffDays,
        cost: issue.cost,
        person: issue.person,
      };
    });
  }, [openIssues]);

  const projectOptions = useMemo(
    () => projects.map(p => ({ value: p.projectId, label: p.projectName })),
    [projects],
  );

  // Handle renaming an issue
  const handleRename = id => {
    const issue = mappedIssues.find(i => i.id === id);
    if (issue) {
      setEditingId(id);
      setEditedName(issue.name);
    }
    setDropdownOpenId(null);
  };

  const handleNameSubmit = async id => {
    try {
      await axios.patch(ENDPOINTS.BM_ISSUE_UPDATE(id), { 'issueTitle.0': editedName });
      fetchIssuesWithFilters();
    } catch (err) {
      setError(`Error updating issue name: ${err}`);
    }
    setEditingId(null);
    setEditedName('');
  };

  // Handle deleting an issue
  const handleDelete = async id => {
    try {
      await axios.delete(ENDPOINTS.BM_ISSUE_UPDATE(id));
      fetchIssuesWithFilters();
    } catch (err) {
      setError(`Error deleting issue: ${err}`);
    }
    setDropdownOpenId(null);
  };

  // Handle closing an issue
  const handleCloseIssue = async id => {
    try {
      await axios.patch(ENDPOINTS.BM_ISSUE_UPDATE(id), { status: 'closed' });
      fetchIssuesWithFilters();
    } catch (err) {
      setError(`Error closing issue: ${err}`);
    }
    setDropdownOpenId(null);
  };

  const filtered = useMemo(() => mappedIssues, [mappedIssues]);

  const currentItems = useMemo(() => {
    const indexOfLast = currentPage * itemsPerPage;
    return filtered.slice(indexOfLast - itemsPerPage, indexOfLast);
  }, [filtered, currentPage]);

  // Format date for display
  const formatDate = date => date?.toISOString().split('T')[0];
  const dateRangeLabel =
    startDate && endDate ? `${formatDate(startDate)} - ${formatDate(endDate)}` : '';

  return (
    <div className={`custom-container ${darkMode ? 'dark-theme' : ''}`}>
      <h4 className="mb-4">A List of Issues</h4>
      <Row className="mb-3 align-items-center">
        <Col xs={12} md={6}>
          <div className="datepicker-wrapper">
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={update => {
                setDateRange(update);
                const [newStartDate, newEndDate] = update;
                fetchIssuesWithFilters(selectedProjects, newStartDate, newEndDate, tagFilter);
              }}
              placeholderText={dateRangeLabel || 'Filter by Date Range'}
              className={`date-picker-input form-control ${darkMode ? 'dark-theme' : ''}`}
              calendarClassName={darkMode ? 'dark-theme-calendar' : ''}
            />
            <Button variant="outline-danger" size="sm" onClick={() => setDateRange([null, null])}>
              ✕
            </Button>
          </div>
        </Col>
        <Col xs={12} md={4}>
          <Select
            isMulti
            classNamePrefix="custom-select"
            className="w-100"
            options={projectOptions}
            value={projectOptions.filter(option => selectedProjects.includes(option.value))}
            onChange={opts => setSelectedProjects(opts.map(o => o.value))}
            placeholder="Filter by Projects"
          />
        </Col>
        <Col xs={12} md={2}>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              setTagFilter(null);
              setSelectedProjects([]);
              setDateRange([null, null]);
            }}
          >
            Reset
          </Button>
        </Col>
      </Row>
      {error && <div className="alert alert-danger">{error}</div>}
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
              <td className={editingId === issue.id ? 'rename-active' : ''}>
                {editingId === issue.id ? (
                  <div className="d-flex gap-2">
                    <Form.Control
                      type="text"
                      value={editedName}
                      onChange={e => setEditedName(e.target.value)}
                      className="rename-input"
                    />
                    <Button size="sm" variant="success" onClick={() => handleNameSubmit(issue.id)}>
                      Submit
                    </Button>
                  </div>
                ) : (
                  issue.name
                )}
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
              <td>{`${issue.person?.name} - ${issue.person?.role}`}</td>
              <td>
                <Dropdown
                  show={dropdownOpenId === issue.id}
                  onToggle={isOpen => setDropdownOpenId(isOpen ? issue.id : null)}
                >
                  <Dropdown.Toggle
                    variant="outline-secondary"
                    size="sm"
                    className="dropdown-toggle-custom"
                  >
                    Options
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="dropdown-menu-custom">
                    <Dropdown.Item
                      className="dropdown-item-custom"
                      onClick={() => handleRename(issue.id)}
                    >
                      Rename
                    </Dropdown.Item>
                    <Dropdown.Item
                      className="dropdown-item-custom"
                      onClick={() => handleDelete(issue.id)}
                    >
                      Delete
                    </Dropdown.Item>
                    <Dropdown.Item
                      className="dropdown-item-custom"
                      onClick={() => handleCloseIssue(issue.id)}
                    >
                      Close
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
    </div>
  );
}
