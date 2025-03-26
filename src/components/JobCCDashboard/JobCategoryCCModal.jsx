import { Modal, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';

function JobCategoryCCModal({ categories, onClose, darkMode, onRefresh }) {
  const [email, setEmail] = useState('');
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const handleFilterChange = e => setFilter(e.target.value);

  const handleAddEmail = async () => {
    if (!email) {
      toast.error('Please enter an email.');
      return;
    }

    setLoading(true);
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
  };

  return (
    <Modal isOpen toggle={onClose} className={darkMode ? 'dark-mode' : ''}>
      <div className="modal-header">
        <h5 className="modal-title">Manage CC</h5>
        <Button close onClick={onClose} />
      </div>
      <div className="modal-body">
        <Form>
          <FormGroup>
            <Label for="filter">Filter by Category</Label>
            <Input type="select" id="filter" value={filter} onChange={handleFilterChange}>
              <option value="">All</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Input>
          </FormGroup>
          <FormGroup>
            <Label for="email">Add Email Address</Label>
            <Input
              type="email"
              id="email"
              placeholder="Enter email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </FormGroup>
          <Button color="primary" onClick={handleAddEmail} disabled={loading}>
            {loading ? 'Adding...' : 'Add Email'}
          </Button>
        </Form>
      </div>
    </Modal>
  );
}

export default JobCategoryCCModal;
