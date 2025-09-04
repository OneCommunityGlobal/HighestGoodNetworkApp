import { Modal, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import styles from './JobCCDashboard.module.css';
import { useSelector } from 'react-redux';

function JobCategoryCCModal({ categories, onClose, onRefresh }) {
  const [email, setEmail] = useState('');
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const handleFilterChange = e => setFilter(e.target.value);
  const darkMode = useSelector(state => state.theme.darkMode);

  const handleAddEmail = async () => {
    if (!email) {
      toast.error('Please enter an email.');
      return;
    }
    if (filter === '') {
      toast.error('Please select a category.');
      return;
    }

    setLoading(true);

    if (filter === 'all') {
      try {
        await Promise.all(
          categories.map(category =>
            axios.post(`${ENDPOINTS.JOB_NOTIFICATION_LIST}/category`, {
              email,
              category,
            }),
          ),
        );

        // Add to local list for immediate UI feedback
        setEmail('');
        onRefresh(); // Refresh parent data
      } catch (error) {
        toast.error('Failed to add email. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      try {
        await axios.post(`${ENDPOINTS.JOB_NOTIFICATION_LIST}/category`, {
          email,
          category: filter,
        });

        // Add to local list for immediate UI feedback
        setEmail('');
        onRefresh(); // Refresh parent data
      } catch (error) {
        toast.error('Failed to add email. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Modal isOpen toggle={onClose} className={`${styles.modalWrapper}`}>
      <div className={`${darkMode ? styles.darkModeModel : ''}`}>
        <div className={`${styles.modalHeader}`}>
          <h5 className={`${styles.modalTitle}`}>Manage CC</h5>
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
              <Label className={`${styles.label}`} for="filter">
                Filter by Category
              </Label>
              <Input
                type="select"
                id="filter"
                value={filter}
                onChange={handleFilterChange}
                className={`${styles.selectInput}`}
              >
                <option value="">Select Category</option>
                <option value="all">All</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Input>
            </FormGroup>
            <FormGroup>
              <Label className={`${styles.label}`} for="email">
                Add Email Address
              </Label>
              <Input
                type="email"
                id="email"
                placeholder="Enter email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={`${styles.input}`}
              />
            </FormGroup>
            <Button color="primary" onClick={handleAddEmail} disabled={loading}>
              {loading ? 'Adding...' : 'Add Email'}
            </Button>
          </Form>
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

export default JobCategoryCCModal;
