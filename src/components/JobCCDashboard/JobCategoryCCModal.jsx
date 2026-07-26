import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
} from 'reactstrap';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import styles from './JobCCDashboard.module.css';

function JobCategoryCCModal({ categories, onClose, onRefresh, darkMode }) {
  const [email, setEmail] = useState('');
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const handleFilterChange = e => setFilter(e.target.value);

  const handleAddEmail = async () => {
    if (!email) {
      toast.error('Please enter an email.');
      return;
    }

    const atIndex = email.indexOf('@');
    if (atIndex <= 0 || atIndex >= email.length - 1) {
      toast.error('Please enter a valid email address.');
      return;
    }
    const dotIndex = email.lastIndexOf('.');
    if (dotIndex <= atIndex + 1 || dotIndex >= email.length - 1) {
      toast.error('Please enter a valid email address.');
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

  const darkClass = darkMode ? styles.darkModeModel : '';

  return (
    <Modal isOpen toggle={onClose}>
      <ModalHeader className={darkClass} toggle={onClose}>
        Manage CC
      </ModalHeader>
      <ModalBody className={darkClass}>
        <Form
          onSubmit={e => {
            e.preventDefault();
            handleAddEmail();
          }}
        >
          <FormGroup>
            <Label className={styles.label} for="filter">
              Filter by Category
            </Label>
            <Input
              type="select"
              id="filter"
              value={filter}
              onChange={handleFilterChange}
              className={styles.selectInput}
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
            <Label className={styles.label} for="email">
              Add Email Address
            </Label>
            <Input
              type="email"
              id="email"
              placeholder="Enter email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={styles.input}
            />
          </FormGroup>
          <Button color="primary" onClick={handleAddEmail} disabled={loading}>
            {loading ? 'Adding...' : 'Add Email'}
          </Button>
        </Form>
      </ModalBody>
      <ModalFooter className={darkClass}>
        <Button color="danger" onClick={onClose} disabled={loading}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}

JobCategoryCCModal.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  onClose: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
  darkMode: PropTypes.bool.isRequired,
};

export default JobCategoryCCModal;
