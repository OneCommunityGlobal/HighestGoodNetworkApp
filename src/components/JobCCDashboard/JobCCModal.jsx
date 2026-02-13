import { useState } from 'react';
import { Modal, Form, FormGroup, Label, Input, Button, Table } from 'reactstrap';
import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import styles from './JobCCDashboard.module.css';

function JobCCModal({ job, onClose, onRefresh }) {
  const [email, setEmail] = useState('');
  const [ccList, setCCList] = useState(job.ccList || []);
  const [loading, setLoading] = useState(false);
  const darkMode = useSelector(state => state.theme.darkMode);

  const handleAddEmail = async () => {
    if (!email) {
      toast.error('Please enter an email.');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${ENDPOINTS.JOB_NOTIFICATION_LIST}/job`, {
        email,
        jobId: job._id,
      });

      // Add to local list for immediate UI feedback
      setCCList(prevList => [...prevList, { email }]);
      setEmail('');
      onRefresh(); // Refresh parent data
    } catch (error) {
      toast.error('Failed to add email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveEmail = async emailToRemove => {
    const ccEntry = ccList.find(entry => entry.email === emailToRemove);
    if (!ccEntry) return;
    setLoading(true);
    try {
      await axios.delete(`${ENDPOINTS.JOB_NOTIFICATION_LIST}${ccEntry._id}`);
      // Remove from local list for immediate UI feedback
      setCCList(prevList => prevList.filter(entry => entry.email !== emailToRemove));
      onRefresh(); // Refresh parent data
    } catch (error) {
      toast.error('Failed to remove email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen toggle={onClose} className={`${styles.modalWrapper}`}>
      <div className={`${darkMode ? styles.darkModeModel : ''}`}>
        <div className={`${styles.modalHeader}`}>
          <h5 className={`${styles.modalTitle}`}>{`Manage CCs for ${job.title}`}</h5>
          <Button color="danger" className={`${styles.modalCloseButton}`} onClick={onClose}>
            &times;
          </Button>
        </div>
      </div>
      <div className={`${darkMode ? styles.darkModeModel : ''}`}>
        <div className={`${styles.modalBody}`}>
          <Form
            onSubmit={e => {
              e.preventDefault();
              handleAddEmail();
            }}
          >
            <FormGroup>
              <Label for="email" className={`${styles.label}`}>
                Add Email Address
              </Label>
              <Input
                type="email"
                id="email"
                placeholder="Enter email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
                className={`${styles.input}`}
              />
            </FormGroup>
            <Button
              color="primary"
              style={{ marginBottom: '10px' }}
              onClick={handleAddEmail}
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Email'}
            </Button>
          </Form>

          <h6 className={`${styles.listTitle}`}>Current CC List</h6>

          <Table striped bordered hover className={`${styles.jobCcDashboardTable}`}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ccList.map(entry => (
                <tr key={entry.email}>
                  <td>{entry.email}</td>
                  <td>
                    <Button
                      color="danger"
                      size="sm"
                      onClick={() => handleRemoveEmail(entry.email)}
                      disabled={loading}
                    >
                      {loading ? 'Removing...' : 'Remove'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
      <div className={`${darkMode ? styles.darkModeModel : ''}`}>
        <div className={`${styles.modalFooter}`}>
          <Button color="danger" onClick={onClose} disabled={loading}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default JobCCModal;
