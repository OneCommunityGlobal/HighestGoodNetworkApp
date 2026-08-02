import { useCallback, useEffect, useState } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { connect } from 'react-redux';
import axios from 'axios';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { ENDPOINTS } from '~/utils/URL';
import PropTypes from 'prop-types';
import styles from './ResolvedTasks.module.css';

const PAGE_SIZE = 20;

const ResolvedTasks = props => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const darkMode = Boolean(props.theme?.darkMode);

  const fetchResolvedTasks = useCallback(async currentPage => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(ENDPOINTS.RESOLVED_TASKS(currentPage, PAGE_SIZE));
      setTasks(response.data.tasks || []);
      setTotalPages(response.data.pagination?.pages || 1);
      setTotal(response.data.pagination?.total || 0);
    } catch (err) {
      setError(err.message);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResolvedTasks(page);
  }, [fetchResolvedTasks, page]);

  const renderAssignedResources = resources => {
    if (!resources || resources.length === 0) {
      return (
        <span className={darkMode ? styles.mutedTextDark : styles.mutedText}>
          No resources assigned
        </span>
      );
    }

    return resources.map((res, index) => (
      <div key={res.userID?._id || `${res.name}-${index}`} className={styles.resourceBlock}>
        <div>{res.name}</div>
        <div className={darkMode ? styles.mutedTextDark : styles.mutedText}>
          {res.userID?.email || 'No email available'}
        </div>
      </div>
    ));
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageButtons = [];
    const maxButtons = 5;
    const half = Math.floor(maxButtons / 2);
    let start = Math.max(page - half, 1);
    let end = Math.min(start + maxButtons - 1, totalPages);

    if (end - start < maxButtons - 1) {
      start = Math.max(end - maxButtons + 1, 1);
    }

    for (let i = start; i <= end; i += 1) {
      pageButtons.push(i);
    }

    const buttonClass = darkMode ? styles.pageButtonDark : styles.pageButton;
    const activeClass = darkMode ? styles.pageButtonActiveDark : styles.pageButtonActive;

    return (
      <div className={styles.pagination}>
        <button
          type="button"
          className={buttonClass}
          onClick={() => setPage(prev => Math.max(prev - 1, 1))}
          disabled={page === 1 || loading}
        >
          Previous
        </button>
        {pageButtons.map(pageNumber => (
          <button
            key={pageNumber}
            type="button"
            className={`${buttonClass} ${page === pageNumber ? activeClass : ''}`}
            onClick={() => setPage(pageNumber)}
            disabled={loading}
          >
            {pageNumber}
          </button>
        ))}
        <button
          type="button"
          className={buttonClass}
          onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages || loading}
        >
          Next
        </button>
        <span className={styles.pageInfo}>
          Page {page} of {totalPages} ({total} total)
        </span>
      </div>
    );
  };

  if (loading && tasks.length === 0) {
    return (
      <div className={`${styles.statusMessage} ${darkMode ? styles.pageDark : ''}`}>Loading...</div>
    );
  }

  if (error && tasks.length === 0) {
    return <div className={`${styles.statusMessage} ${styles.errorMessage}`}>Error: {error}</div>;
  }

  return (
    <Container fluid className={`${styles.page} ${darkMode ? styles.pageDark : ''}`}>
      <Row className="mb-4">
        <Col>
          <h2 className={styles.title}>Resolved and Closed Tasks</h2>
          <div className={styles.tableWrapper}>
            <table className={`${styles.table} ${darkMode ? styles.tableDark : ''}`}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Task Name</th>
                  <th>Assigned Resources</th>
                  <th>Resolved/Closed By</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center">
                      No resolved tasks found.
                    </td>
                  </tr>
                ) : (
                  tasks.map(item => (
                    <tr key={item._id}>
                      <td>{item.taskId?.num || 'N/A'}</td>
                      <td>
                        {item.taskId ? (
                          <Link
                            to={`/wbs/tasks/${item.taskId._id}`}
                            className={`${styles.taskLink} ${darkMode ? styles.taskLinkDark : ''}`}
                          >
                            {item.taskId.taskName}
                          </Link>
                        ) : (
                          <span className={darkMode ? styles.mutedTextDark : styles.mutedText}>
                            Task deleted/unavailable
                          </span>
                        )}
                      </td>
                      <td>{renderAssignedResources(item.taskId?.resources)}</td>
                      <td>
                        <div>
                          {item.userId
                            ? `${item.userId.firstName} ${item.userId.lastName}`
                            : item.userName || 'Unknown'}
                        </div>
                        <div className={darkMode ? styles.mutedTextDark : styles.mutedText}>
                          {item.userId?.email || item.userEmail || 'No email available'}
                        </div>
                      </td>
                      <td>{moment(item.timestamp).format('LLL')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {renderPagination()}
        </Col>
      </Row>
    </Container>
  );
};

const mapStateToProps = state => ({
  theme: state.theme,
});

ResolvedTasks.propTypes = {
  theme: PropTypes.shape({
    darkMode: PropTypes.bool,
  }),
};

export default connect(mapStateToProps)(ResolvedTasks);
