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
import { toast } from 'react-toastify';
import { purchaseMaterial } from '~/actions/bmdashboard/materialsActions';

const PRIORITIES = ['Low', 'Medium', 'High'];

// Creates a material purchase (restock) request from the project dashboard,
// using the same endpoint as Materials > Purchase Request.
function RestockRequestModal({ isOpen, toggle, projectId, item, onSubmitted }) {
  const darkMode = useSelector(state => state.theme?.darkMode);
  const [quantity, setQuantity] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [brand, setBrand] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !item) return;
    // Suggest buying back up to the amount originally bought.
    const suggested = Math.max(1, Math.ceil(Number(item.bought) - Number(item.available)));
    setQuantity(String(suggested));
    setPriority(item.level === 'critical' ? 'High' : 'Medium');
    setBrand(item.vendor || '');
    setError('');
  }, [isOpen, item]);

  if (!item) return null;

  const handleSubmit = async e => {
    e.preventDefault();
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      setError('Enter a quantity greater than 0.');
      return;
    }
    setSubmitting(true);
    const response = await purchaseMaterial({
      primaryId: projectId,
      secondaryId: item.raw?.itemType?._id,
      quantity: qty,
      priority,
      brand,
    });
    setSubmitting(false);

    if (response?.status === 201) {
      toast.success(`Restock request submitted for ${item.name}`);
      onSubmitted?.();
      toggle();
    } else {
      const message =
        response?.data?.message || response?.data?.error || 'Could not submit the restock request.';
      setError(typeof message === 'string' ? message : 'Could not submit the restock request.');
      toast.error(`Restock request for ${item.name} failed`);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      className={darkMode ? 'dark-mode text-light' : ''}
      contentClassName={darkMode ? 'bg-yinmn-blue text-light' : ''}
    >
      <Form onSubmit={handleSubmit}>
        <ModalHeader toggle={toggle}>Create restock request: {item.name}</ModalHeader>
        <ModalBody>
          <p className="mb-3">
            {item.available} of {item.bought} {item.unit} left ({item.percentLeft.toFixed(1)}%).
          </p>
          <FormGroup>
            <Label for="restock-quantity">Quantity{item.unit ? ` (${item.unit})` : ''}</Label>
            <Input
              id="restock-quantity"
              type="number"
              min="1"
              step="any"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              invalid={Boolean(error)}
              aria-describedby={error ? 'restock-error' : undefined}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label for="restock-priority">Priority</Label>
            <Input
              id="restock-priority"
              type="select"
              value={priority}
              onChange={e => setPriority(e.target.value)}
            >
              {PRIORITIES.map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Input>
          </FormGroup>
          <FormGroup>
            <Label for="restock-brand">Preferred brand (optional)</Label>
            <Input id="restock-brand" value={brand} onChange={e => setBrand(e.target.value)} />
          </FormGroup>
          {error && (
            <p id="restock-error" role="alert" className="text-danger mb-0">
              {error}
            </p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button type="button" color="secondary" onClick={toggle} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" color="primary" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit request'}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}

export default RestockRequestModal;
