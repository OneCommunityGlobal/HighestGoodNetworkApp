import React from 'react';
import { forwardRef } from 'react';
import { Form, FormControl, Button } from 'react-bootstrap';
import { FaCalendarAlt } from 'react-icons/fa';
import styles from './CustomDatePickerInput.css';

const CustomDatePickerInput = forwardRef(({ value, onClick }, ref) => (
  <Form.Group>
    <Form.Label>Choose the Sunday of the week you'll return:</Form.Label>
    <div className="input-group">
      <FormControl
        value={value}
        readOnly
        ref={ref}
        className="form-control" // Use 'form-control' class for Bootstrap styling
        placeholder="Select a Sunday"
      />
      <div className="input-group-append">
        <Button
          onClick={onClick}
          variant="outline-secondary"
          className="btn-icon"
          style={{ borderColor: 'lightgrey' }}
        >
          <FaCalendarAlt style={{ transform: 'translateY(-1px)' }} />
        </Button>
      </div>
    </div>
  </Form.Group>
));

export default React.memo(CustomDatePickerInput);
