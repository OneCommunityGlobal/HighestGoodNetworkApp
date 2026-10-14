import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table, Spinner } from 'reactstrap';
import moment from 'moment';
import PropTypes from 'prop-types';
import { ENDPOINTS } from '../../../utils/URL';
import styles from './UpdateHistoryModal.module.css';

function UpdateHistoryModal({ isOpen, toggle, itemType, selectedProject }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(ENDPOINTS.BM_UPDATE_HISTORY(itemType.toLowerCase()));
      setHistory(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch update history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    } else {
      setHistory([]);
      setError(null);
    }
  }, [isOpen, itemType]);

  // Filter history by selected project from parent
  const filteredHistory = useMemo(() => {
    if (!history || history.length === 0) return [];
    if (selectedProject === 'all') return history;
    return history.filter(record => record.projectName === selectedProject);
  }, [history, selectedProject]);

  // Format all changes into a single string
  const formatChanges = changes => {
    if (!changes || typeof changes !== 'object') return 'N/A';
    const changeStrings = Object.entries(changes).map(([field, values]) => {
      const oldVal = values.old ?? 'N/A';
      const newVal = values.new ?? 'N/A';
      return `${field}: ${oldVal}→${newVal}`;
    });
    return changeStrings.join(', ');
  };

  const handleRefresh = () => {
    fetchHistory();
  };

  const handleClose = () => {
    toggle();
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={handleClose}
      size="xl"
      className={`${styles.updateHistoryModal} ${darkMode ? styles.darkMode : ''}`}
    >
      <ModalHeader toggle={handleClose} className={darkMode ? styles.darkHeader : ''}>
        {itemType} Update History
        {selectedProject !== 'all' && ` - ${selectedProject}`}
      </ModalHeader>
      <ModalBody className={darkMode ? styles.darkBody : ''}>
        <div className={styles.controls}>
          <span className={styles.filterInfo}>
            {selectedProject === 'all' ? 'Showing all projects' : `Filtered by: ${selectedProject}`}
          </span>
          <Button
            color="primary"
            onClick={handleRefresh}
            disabled={loading}
            className={styles.refreshBtn}
          >
            {loading ? <Spinner size="sm" /> : 'Refresh'}
          </Button>
        </div>

        {error && <div className={styles.errorMessage}>Error loading update history: {error}</div>}

        <div className={styles.tableContainer}>
          {loading && !history.length ? (
            <div className={styles.loadingContainer}>
              <Spinner color="primary" />
              <p>Loading update history...</p>
            </div>
          ) : (
            <Table
              responsive
              bordered
              hover
              className={`${styles.historyTable} ${darkMode ? styles.darkTable : ''}`}
            >
              <thead>
                <tr>
                  <th>Date/Time</th>
                  <th>Item</th>
                  <th>Project</th>
                  <th>Changes</th>
                  <th>Modified By</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.length > 0 ? (
                  filteredHistory.map(record => (
                    <tr key={record._id}>
                      <td>{moment(record.date).format('MMM DD, YYYY h:mm A')}</td>
                      <td>{record.itemName || 'N/A'}</td>
                      <td>{record.projectName || 'N/A'}</td>
                      <td className={styles.changesCell}>{formatChanges(record.changes)}</td>
                      <td>
                        {record.modifiedBy ? (
                          <a href={`/userprofile/${record.modifiedBy._id}`}>
                            {`${record.modifiedBy.firstName || ''} ${record.modifiedBy.lastName ||
                              ''}`}
                          </a>
                        ) : (
                          'N/A'
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className={styles.noRecords}>
                      No update history records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </div>

        {filteredHistory.length > 0 && (
          <div className={styles.recordCount}>Showing {filteredHistory.length} updates</div>
        )}
      </ModalBody>
      <ModalFooter className={darkMode ? styles.darkFooter : ''}>
        <Button color="secondary" onClick={handleClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}

UpdateHistoryModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  itemType: PropTypes.string.isRequired,
  selectedProject: PropTypes.string,
};

UpdateHistoryModal.defaultProps = {
  selectedProject: 'all',
};

export default UpdateHistoryModal;
