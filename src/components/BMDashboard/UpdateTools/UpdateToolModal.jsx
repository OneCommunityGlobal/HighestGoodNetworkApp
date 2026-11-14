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
  Row,
  Col,
} from 'reactstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { updateTool, fetchTools } from '../../../actions/bmdashboard/toolActions';
import { ENDPOINTS } from '../../../utils/URL';

/** Mock values shown until the backend stores these fields for every tool. */
export const TOOL_DETAIL_PLACEHOLDERS = {
  name: 'N/A',
  number: 'N/A',
  className: 'General',
  project: 'N/A',
  currentStatus: 'N/A',
  ownership: 'Team Alpha',
};

export const getToolDetails = tool => ({
  name: tool?.itemType?.name || TOOL_DETAIL_PLACEHOLDERS.name,
  number: tool?.code || TOOL_DETAIL_PLACEHOLDERS.number,
  className: tool?.itemType?.category || TOOL_DETAIL_PLACEHOLDERS.className,
  project: tool?.project?.name || TOOL_DETAIL_PLACEHOLDERS.project,
  currentStatus: tool?.condition || TOOL_DETAIL_PLACEHOLDERS.currentStatus,
  ownership: tool?.purchaseStatus || TOOL_DETAIL_PLACEHOLDERS.ownership,
});

const DETAIL_FIELDS = [
  ['name', 'Name'],
  ['number', 'Number'],
  ['className', 'Class'],
  ['project', 'Project'],
  ['currentStatus', 'Current Status'],
  ['ownership', 'Ownership'],
];

function UpdateToolModal({ modal, setModal, record, styles }) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    status: '',
    condition: '',
  });
  const [toolDetails, setToolDetails] = useState(null);
  const [detailsStatus, setDetailsStatus] = useState('loading'); // 'loading' | 'loaded' | 'error'

  // Fetch the selected row's tool each time the modal opens or a different row is picked
  useEffect(() => {
    if (!modal || !record?._id) return undefined;
    let ignore = false;
    setToolDetails(null);
    setDetailsStatus('loading');
    axios
      .get(ENDPOINTS.BM_TOOL_BY_ID(record._id))
      .then(({ data }) => {
        if (ignore) return;
        setToolDetails(data || record);
        setDetailsStatus(data ? 'loaded' : 'error');
      })
      .catch(() => {
        if (ignore) return;
        // Fall back to the row's data; anything missing there gets a placeholder
        setToolDetails(record);
        setDetailsStatus('error');
      });
    return () => {
      ignore = true;
    };
  }, [modal, record]);

  const details = getToolDetails(toolDetails);

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
    <Modal
      isOpen={modal}
      toggle={() => setModal(false)}
      size="lg"
      className={styles?.darkBlueModal}
      contentClassName={styles?.darkBlueModalContent}
      backdropClassName={styles?.darkBlueBackdrop}
    >
      <ModalHeader toggle={() => setModal(false)}>Update Tool: {formData.name}</ModalHeader>
      <Form onSubmit={handleSubmit}>
        <ModalBody>
          <Row form aria-busy={detailsStatus === 'loading'}>
            {DETAIL_FIELDS.map(([key, label]) => (
              <Col md={4} key={key}>
                <FormGroup>
                  <Label for={`tool-detail-${key}`}>{label}</Label>
                  <Input
                    id={`tool-detail-${key}`}
                    value={detailsStatus === 'loading' ? 'Loading…' : details[key]}
                    readOnly
                  />
                </FormGroup>
              </Col>
            ))}
          </Row>
          {detailsStatus === 'error' && (
            <p className="text-danger small" role="alert">
              Couldn&apos;t load the latest tool details. Showing the table&apos;s data and
              placeholders.
            </p>
          )}
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
