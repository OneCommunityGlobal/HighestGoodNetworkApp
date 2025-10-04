import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Table, Button, FormGroup, Label, Input } from 'reactstrap';
import { ENDPOINTS } from '~/utils/URL';
import JobCCModal from './JobCCModal'; // Modal for managing CC list
import JobCategoryCCModal from './JobCategoryCCModal';
import styles from './JobCCDashboard.module.css';

function JobCCDashboard() {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showJobCategoryCCModal, setShowJobCategoryCCModal] = useState(false);
  const darkMode = useSelector(state => state.theme.darkMode);

  const fetchJobs = async () => {
    try {
      const response = await axios.get(ENDPOINTS.JOB_NOTIFICATION_LIST);
      setJobs(response.data);
    } catch (error) {
      toast.error('Failed to fetch jobs');
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    // Extract unique categories whenever jobs data changes
    const uniqueCategories = [...new Set(jobs.map(job => job.category))].sort();
    setCategories(uniqueCategories);
  }, [jobs]);

  const handleSort = () => {
    const sortedJobs = [...jobs].sort((a, b) => {
      if (sortOrder === 'desc') {
        return new Date(a.datePosted) - new Date(b.datePosted);
      }
      return new Date(b.datePosted) - new Date(a.datePosted);
    });
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    setJobs(sortedJobs);
  };

  const handleFilterChange = e => setFilter(e.target.value);

  const handleSearchChange = e => setSearch(e.target.value);

  const formatTextSearch = text =>
    text
      .toLowerCase()
      .split('')
      .filter(item => item !== ' ')
      .join('');

  const filteredJobs = jobs.filter(job => {
    const matchesFilter = filter ? job.category === filter : true;
    const matchesSearch =
      search.length === 0 ||
      formatTextSearch(job.title).includes(formatTextSearch(search)) ||
      job.ccList.some(entry => formatTextSearch(entry.email).includes(formatTextSearch(search)));
    return matchesFilter && matchesSearch;
  });

  const handleOpenModal = job => {
    setSelectedJob(job);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedJob(null);
  };

  const handleOpenCategoryModal = () => {
    setShowJobCategoryCCModal(true);
  };

  const handleCloseCategoryModal = () => {
    setShowJobCategoryCCModal(false);
  };

  return (
    <div
      className={`${styles.jobCcDashboard} ${darkMode ? styles.darkModeJobCcDashboard : ''}`}
      style={{ height: '100%' }}
    >
      <h1 className={`${styles.dashboardTitle}`}>Job CC Dashboard</h1>
      <div className="filters-container">
        <FormGroup>
          <Label for="filter" className={`${darkMode ? 'text-light' : 'text-dark'}`}>
            Filter by Category
          </Label>
          <Input
            type="select"
            id="filter"
            style={
              darkMode
                ? { backgroundColor: 'black', color: 'white', border: 'none' }
                : { backgroundColor: 'white', color: 'black' }
            }
            value={filter}
            onChange={handleFilterChange}
          >
            <option value="">All</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Input>
        </FormGroup>
        <FormGroup>
          <Label for="search" className={`${darkMode ? 'text-light' : 'text-dark'}`}>
            Search by Title or Email
          </Label>
          <Input
            type="text"
            id="search"
            style={
              darkMode
                ? { backgroundColor: 'black', color: 'white', border: 'none' }
                : { backgroundColor: 'white', color: 'black' }
            }
            placeholder="Search..."
            value={search}
            onChange={handleSearchChange}
          />
        </FormGroup>
        <div>
          <Button color="primary" onClick={handleSort}>
            Sort by Date {sortOrder === 'desc' ? '↑' : '↓'}
          </Button>
          <Button style={{ margin: '10px' }} color="primary" onClick={handleOpenCategoryModal}>
            Add Email CC to Category
          </Button>
        </div>
      </div>

      <Table striped bordered hover className={`${styles.jobCcDashboardTable}`}>
        <thead>
          <tr>
            <th>Job Title</th>
            <th>Category</th>
            <th>Date Posted</th>
            <th>CC&apos;d Emails</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredJobs.length === 0 ? (
            <h4 className={`${darkMode ? 'text-light' : 'text-dark'} text-center`}>
              No title or email were found.
            </h4>
          ) : (
            filteredJobs.map(job => (
              <tr key={job._id}>
                <td className={`${darkMode ? 'text-light' : 'text-dark'}`}>{job.title}</td>
                <td className={`${darkMode ? 'text-light' : 'text-dark'}`}>{job.category}</td>
                <td className={`${darkMode ? 'text-light' : 'text-dark'}`}>
                  {new Date(job.datePosted).toLocaleDateString()}
                </td>
                <td className={`${darkMode ? 'text-light' : 'text-dark'}`}>
                  {job.ccList.map(entry => entry.email).join(', ') || 'No CCs'}
                </td>
                <td className={`${darkMode ? 'text-light' : 'text-dark'}`}>
                  <Button color="info" size="sm" onClick={() => handleOpenModal(job)}>
                    Manage CCs
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {showModal && (
        <JobCCModal
          job={selectedJob}
          onClose={handleCloseModal}
          darkMode={darkMode}
          onRefresh={fetchJobs}
        />
      )}

      {showJobCategoryCCModal && (
        <JobCategoryCCModal
          categories={categories}
          onClose={handleCloseCategoryModal}
          darkMode={darkMode}
          onRefresh={fetchJobs}
        />
      )}
    </div>
  );
}

export default JobCCDashboard;
