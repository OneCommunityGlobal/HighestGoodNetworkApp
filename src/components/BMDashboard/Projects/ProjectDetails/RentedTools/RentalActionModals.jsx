import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Button,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';
import { DAY_MS, formatDueIn } from '../alertUtils';

const toDateInput = date => {
  const d = new Date(date);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// Local end of day, so "extend to Nov 20" means through Nov 20.
const endOfDay = dateInput => {
  const [y, m, d] = dateInput.split('-').map(Number);
  return new Date(y, m - 1, d, 23, 59, 59);
};

function useModalClasses() {
  const darkMode = useSelector(state => state.theme?.darkMode);
  return {
    className: darkMode ? 'dark-mode text-light' : '',
    contentClassName: darkMode ? 'bg-yinmn-blue text-light' : '',
  };
}

export function ConfirmReturnModal({ item, isOpen, toggle, onConfirm, busy }) {
  const modalClasses = useModalClasses();
  if (!item) return null;
  return (
    <Modal isOpen={isOpen} toggle={toggle} {...modalClasses}>
      <ModalHeader toggle={toggle}>Mark {item.name} as returned?</ModalHeader>
      <ModalBody>
        <p className="mb-1">
          Due {new Date(item.dueDate).toLocaleDateString()} ({formatDueIn(item.daysLeft)}).
        </p>
        <p className="mb-0">It will be removed from this list of active rentals.</p>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle} disabled={busy}>
          Cancel
        </Button>
        <Button color="primary" onClick={onConfirm} disabled={busy}>
          {busy ? 'Saving…' : 'Mark returned'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export function ExtendRentalModal({ item, isOpen, toggle, onSubmit, busy }) {
  const modalClasses = useModalClasses();
  const [date, setDate] = useState('');
  const [error, setError] = useState('');

  // The new date must be after both today and the current due date.
  const minDate = item
    ? toDateInput(Math.max(Date.now(), new Date(item.dueDate).getTime()) + DAY_MS)
    : '';

  useEffect(() => {
    if (!isOpen || !item) return;
    const base = Math.max(Date.now(), new Date(item.dueDate).getTime());
    setDate(toDateInput(base + 7 * DAY_MS));
    setError('');
  }, [isOpen, item]);

  if (!item) return null;

  const handleSubmit = e => {
    e.preventDefault();
    if (!date || date < minDate) {
      setError(`Choose a date on or after ${new Date(`${minDate}T00:00`).toLocaleDateString()}.`);
      return;
    }
    onSubmit(endOfDay(date).toISOString(), setError);
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} {...modalClasses}>
      <Form onSubmit={handleSubmit}>
        <ModalHeader toggle={toggle}>Extend rental: {item.name}</ModalHeader>
        <ModalBody>
          <p className="mb-3">
            Currently due {new Date(item.dueDate).toLocaleDateString()} (
            {formatDueIn(item.daysLeft)}).
          </p>
          <FormGroup className="mb-0">
            <Label for="extend-rental-date">New due date</Label>
            <Input
              id="extend-rental-date"
              type="date"
              min={minDate}
              value={date}
              onChange={e => setDate(e.target.value)}
              invalid={Boolean(error)}
              aria-describedby={error ? 'extend-rental-error' : undefined}
              required
            />
          </FormGroup>
          {error && (
            <p id="extend-rental-error" role="alert" className="text-danger mt-2 mb-0">
              {error}
            </p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button type="button" color="secondary" onClick={toggle} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" color="primary" disabled={busy}>
            {busy ? 'Saving…' : 'Extend rental'}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}
