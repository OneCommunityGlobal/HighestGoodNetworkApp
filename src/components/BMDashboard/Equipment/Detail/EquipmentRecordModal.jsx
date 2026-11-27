import { useState } from 'react';
import axios from 'axios';
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
import { ENDPOINTS } from '~/utils/URL';

const recordFields = {
  updates: { condition: ['Good', 'Needs Repair', 'Out of Order'] },
  purchases: { priority: ['Low', 'Medium', 'High'], status: ['Pending', 'Approved', 'Rejected'] },
};

function EquipmentRecordModal({ equipmentId, editor, onClose, onSaved }) {
  const { kind, record } = editor;
  const fields = Object.entries(recordFields[kind]);
  const [values, setValues] = useState(() =>
    Object.fromEntries(
      fields.map(([field, choices]) => [
        field,
        choices.includes(record?.[field]) ? record[field] : choices[0],
      ]),
    ),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async event => {
    event.preventDefault();
    setBusy(true);
    setError('');
    const path = `${ENDPOINTS.BM_EQUIPMENT_BY_ID(equipmentId)}/records/${kind}`;
    try {
      if (record) {
        const original = Object.fromEntries(
          fields.map(([field]) => [field, record[field] ?? null]),
        );
        await axios.patch(`${path}/${record.index}`, {
          ...values,
          original: { ...original, date: record.date ?? null },
        });
      } else {
        await axios.post(path, values);
      }
      onSaved();
      onClose();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not save the equipment record.');
      setBusy(false);
    }
  };

  return (
    <Modal isOpen toggle={busy ? undefined : onClose}>
      <Form onSubmit={submit}>
        <ModalHeader>
          {record ? 'Edit' : 'Add'} {kind === 'updates' ? 'update' : 'purchase'}
        </ModalHeader>
        <ModalBody>
          {fields.map(([field, choices]) => (
            <FormGroup key={field}>
              <Label for={`equipment-record-${field}`}>
                {field[0].toUpperCase() + field.slice(1)}
              </Label>
              <Input
                id={`equipment-record-${field}`}
                type="select"
                value={values[field]}
                onChange={event => setValues({ ...values, [field]: event.target.value })}
                disabled={busy}
              >
                {choices.map(choice => (
                  <option key={choice}>{choice}</option>
                ))}
              </Input>
            </FormGroup>
          ))}
          {error && <p role="alert">{error}</p>}
        </ModalBody>
        <ModalFooter>
          <Button type="button" disabled={busy} onClick={onClose}>
            Cancel
          </Button>
          <Button color="primary" type="submit" disabled={busy}>
            {busy ? 'Saving…' : 'Save'}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}

export default EquipmentRecordModal;
