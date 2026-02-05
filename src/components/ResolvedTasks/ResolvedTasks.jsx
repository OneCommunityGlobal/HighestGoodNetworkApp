import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table } from 'reactstrap';
import { connect } from 'react-redux';
import axios from 'axios';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { ENDPOINTS } from '~/utils/URL';

const ResolvedTasks = props => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { darkMode } = props.auth;

  useEffect(() => {
    const fetchResolvedTasks = async () => {
      try {
        const response = await axios.get(ENDPOINTS.RESOLVED_TASKS(1, 100));
        setTasks(response.data.tasks);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchResolvedTasks();
  }, []);

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="text-center mt-5 text-danger">Error: {error}</div>;

  return (
    <Container
      fluid
      className={`p-4 ${darkMode ? 'bg-oxford-blue text-light' : ''}`}
      style={{ minHeight: '100vh' }}
    >
      <Row className="mb-4">
        <Col>
          <h2 className="mb-3">Resolved and Closed Tasks</h2>
          <Table
            striped
            responsive
            hover
            variant={darkMode ? 'dark' : ''}
            className={darkMode ? 'text-light' : ''}
          >
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
                          className={darkMode ? 'text-info' : ''}
                        >
                          {item.taskId.taskName}
                        </Link>
                      ) : (
                        <span className="text-muted">Task deleted/unavailable</span>
                      )}
                    </td>
                    <td>
                      {item.taskId?.resources?.map((res, index) => (
                        <div key={res.userID?._id || index} style={{ marginBottom: '4px' }}>
                          <div>{res.name}</div>
                          <div className="text-muted small">
                            {res.userID?.email || 'No email available'}
                          </div>
                        </div>
                      ))}
                    </td>
                    <td>
                      <div>
                        {item.userId
                          ? `${item.userId.firstName} ${item.userId.lastName}`
                          : item.userName || 'Unknown'}
                      </div>
                      <div className="text-muted small">
                        {item.userId?.email || item.userEmail || 'No email available'}
                      </div>
                    </td>
                    <td>{moment(item.timestamp).format('LLL')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};

const mapStateToProps = state => ({
  auth: state.auth,
});

export default connect(mapStateToProps)(ResolvedTasks);
