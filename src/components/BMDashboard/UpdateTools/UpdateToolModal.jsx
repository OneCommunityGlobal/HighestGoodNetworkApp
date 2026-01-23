import { useState, useEffect } from 'react';
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
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { updateTool, fetchTools } from '../../../actions/bmdashboard/toolActions';

function UpdateToolModal({ modal, setModal, record }) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    status: '',
    condition: '',
  });

  useEffect(() => {
    if (record) {
      const availableArr = record.itemType?.available || [];
      const isAvailable = availableArr.includes(record._id);

      setFormData({
        name: record.itemType?.name || '',
        status: isAvailable ? 'Available' : 'Using',
        condition: record.condition || '',
      });
    }
  }, [record]);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      const response = await updateTool(record._id, formData);
      if (response.status === 200 || response.status === 201) {
        toast.success('Tool updated successfully!');
        await dispatch(fetchTools());
        setModal(false);
      } else {
        toast.error('Update failed on server.');
      }
    } catch (err) {
      toast.error('Network error during update.');
    }
  };

  return (
    <Modal isOpen={modal} toggle={() => setModal(false)}>
      <ModalHeader>Update Tool: {formData.name}</ModalHeader>
      <Form onSubmit={handleSubmit}>
        <ModalBody>
          <FormGroup>
            <Label for="name">Tool Name (Updating this affects all tools of this type)</Label>
            <Input name="name" value={formData.name} onChange={handleInputChange} />
          </FormGroup>
          <FormGroup>
            <Label for="status">Status (Availability)</Label>
            <Input type="select" name="status" value={formData.status} onChange={handleInputChange}>
              <option value="Available">Available</option>
              <option value="Using">Using</option>
            </Input>
          </FormGroup>
          <FormGroup>
            <Label for="condition">Condition</Label>
            <Input
              type="select"
              name="condition"
              value={formData.condition}
              onChange={handleInputChange}
            >
              <option value="New">New</option>
              <option value="Good">Good</option>
              <option value="Worn">Worn</option>
              <option value="Needs Repair">Needs Repair</option>
            </Input>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" type="submit">
            Save Changes
          </Button>
          <Button color="secondary" onClick={() => setModal(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}

export default UpdateToolModal;
