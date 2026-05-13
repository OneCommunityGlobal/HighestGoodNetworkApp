import React, { useState, useEffect } from 'react';
import {
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import styles from './IntermediateTaskList.module.css';

const IntermediateTaskForm = ({ task, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    expectedHours: '',
    dueDate: '',
    status: 'pending',
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        expectedHours: task.expectedHours || task.expected_hours || '',
        dueDate:
          task.dueDate || task.due_date
            ? new Date(task.dueDate || task.due_date).toISOString().split('T')[0]
            : '',
        status: task.status || 'pending',
      });
    }
  }, [task]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }

    if (formData.expectedHours && (isNaN(formData.expectedHours) || formData.expectedHours < 0)) {
      alert('Expected hours must be a positive number');
      return;
    }

    // Convert to backend format
    const submitData = {
      title: formData.title,
      description: formData.description,
      expectedHours: formData.expectedHours ? parseFloat(formData.expectedHours) : 0,
      status: formData.status,
    };

    // Only set logged_hours to 0 when creating a new task (not editing)
    if (!task) {
      submitData.loggedHours = 0;
    }

    // Only include dueDate if it's set
    if (formData.dueDate) {
      submitData.dueDate = new Date(formData.dueDate).toISOString();
    }

    onSubmit(submitData);
  };

  return (
    <Modal isOpen={true} toggle={onCancel} size="lg">
      <ModalHeader toggle={onCancel}>
        {task ? 'Edit Intermediate Task' : 'Add Intermediate Task'}
      </ModalHeader>
      <Form onSubmit={handleSubmit} className={styles.formModal}>
        <ModalBody>
          <FormGroup>
            <Label for="title">Title *</Label>
            <Input
              type="text"
              name="title"
              id="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter task title"
            />
          </FormGroup>

          <FormGroup>
            <Label for="description">Description</Label>
            <Input
              type="textarea"
              name="description"
              id="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter task description"
            />
          </FormGroup>

          <div className={styles.formRow}>
            <FormGroup className={styles.formGroupHalf}>
              <Label for="expectedHours">Expected Hours</Label>
              <Input
                type="number"
                name="expectedHours"
                id="expectedHours"
                min="0"
                step="0.5"
                value={formData.expectedHours}
                onChange={handleChange}
                placeholder="0"
              />
            </FormGroup>

            <FormGroup className={styles.formGroupHalf}>
              <Label for="dueDate">Due Date</Label>
              <Input
                type="date"
                name="dueDate"
                id="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </FormGroup>
          </div>

          <FormGroup>
            <Label for="status">Status</Label>
            <Input
              type="select"
              name="status"
              id="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              {task && <option value="completed">Completed</option>}
            </Input>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button color="primary" type="submit">
            {task ? 'Update' : 'Create'} Task
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default IntermediateTaskForm;
