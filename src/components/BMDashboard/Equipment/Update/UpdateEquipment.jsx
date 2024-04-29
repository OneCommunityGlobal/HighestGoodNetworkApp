import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEquipmentById } from 'actions/bmdashboard/equipmentActions';
import { Button, Form, FormGroup, Label, Container, Row, Col, Input } from 'reactstrap';
import './UpdateEquipment.css';
import '../../BMDashboard.css';
import CheckTypesModal from 'components/BMDashboard/shared/CheckTypesModal';
import { useHistory, useParams } from 'react-router-dom';
import Radio from 'components/common/Radio';
import DragAndDrop from 'components/common/DragAndDrop/DragAndDrop';
import Image from 'components/common/Image/Image';

export default function UpdateEquipment() {
  const history = useHistory();
  const { equipmentId } = useParams();
  const [modal, setModal] = useState(false);
  const [lastUsedBy, setLastUsedBy] = useState('');
  const [lastUsedByOther, setLastUsedByOther] = useState('');
  const [lastUsedFor, setLastUsedFor] = useState('');
  const [lastUsedForOther, setLastUsedForOther] = useState('');
  const [replacementRequired, setReplacementRequired] = useState('');
  const [description, setDescription] = useState('');
  const [sendNote, setSendNote] = useState('');
  const [updateDate, setUpdateDate] = useState('');
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const equipmentDetails = useSelector(state => state.bmEquipments.singleEquipment);

  const dispatch = useDispatch();
  useEffect(() => {
    if (equipmentId) {
      dispatch(fetchEquipmentById(equipmentId));
    }
  }, [dispatch, equipmentId]);
  const handleCancel = () => history.goBack();

  const calculateDaysLeft = endDate => {
    if (!endDate) return '';

    const today = new Date();
    const rentalEnd = new Date(endDate);
    const timeDiff = rentalEnd.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return daysLeft >= 0 ? daysLeft : 'Expired';
  };

  const handleSubmit = e => {
    e.preventDefault();
  };

  return (
    <Container className="inv-form-page-container">
      <CheckTypesModal modal={modal} setModal={setModal} type="Equipments" />
      <Row>
        <Col md={12}>
          <header className="bm-dashboard__header text-center">
            <h1>Update Tool or Equipment Status</h1>
          </header>
        </Col>
      </Row>

      {equipmentDetails && (
        <Row>
          <Col md={3}>
            <Image
              name="equipment-image"
              src={equipmentDetails.imageUrl || 'https://via.placeholder.com/150'}
              alt="Equipment image"
              className="square-image"
            />
          </Col>
        </Row>
      )}
      <Form className="inv-form">
        <FormGroup className="background-from-db">
          <Row form>
            <Col md={4}>
              <Label for="itemName">Name</Label>
              <Input
                readOnly
                value={equipmentDetails ? equipmentDetails.itemType.name : 'Loading...'}
                className="read-only-input"
                id="itemName"
              />
            </Col>
            <Col md={4}>
              <Label for="itemNumber">Number</Label>
              <Input
                readOnly
                value={equipmentDetails ? equipmentDetails._id : ''}
                className="read-only-input"
                id="itemNumber"
              />
            </Col>
            <Col md={4}>
              <Label for="itemClass">Class</Label>
              <Input
                readOnly
                value={equipmentDetails ? equipmentDetails.itemType.category : ''}
                className="read-only-input"
                id="itemClass"
              />
            </Col>
          </Row>
          <Row form>
            <Col md={4}>
              <Label for="itemProject">Project</Label>
              <Input
                readOnly
                value={equipmentDetails ? equipmentDetails.project.name : ''}
                className="read-only-input"
                id="itemProject"
              />
            </Col>
            <Col md={4}>
              <Label for="itemStatus">Current Status</Label>
              <Input
                readOnly
                value={
                  equipmentDetails && equipmentDetails.updateRecord.length > 0
                    ? equipmentDetails.updateRecord[equipmentDetails.updateRecord.length - 1]
                        .condition
                    : 'N/A'
                }
                className="read-only-input"
                id="itemStatus"
              />
            </Col>
            <Col md={4}>
              <Label for="itemOwnership">Ownership</Label>
              <Input
                readOnly
                value={equipmentDetails ? equipmentDetails.purchaseStatus : ''}
                className="read-only-input"
                id="itemOwnership"
              />
            </Col>
          </Row>
          {equipmentDetails && equipmentDetails.purchaseStatus === 'Rental' && (
            <Row form>
              <Col md={4}>
                <Label for="rentalEndDate">Rental End Date</Label>
                <Input
                  readOnly
                  value={equipmentDetails ? equipmentDetails.rentalDueDate.split('T')[0] : ''}
                  className="read-only-input"
                  id="rentalEndDate"
                />
              </Col>
              <Col md={4}>
                <Label for="daysLeft">Days Left</Label>
                <Input
                  readOnly
                  value={calculateDaysLeft(equipmentDetails.rentalDueDate)}
                  className="read-only-input"
                  id="daysLeft"
                />
              </Col>
            </Row>
          )}
        </FormGroup>
        <Row form>
          <Col md={12}>
            <div className="update-confirm-text">
              Please confirm you are updating the status of the tool or equipment shown above.
            </div>
          </Col>
        </Row>
        <Row form>
          <Col md={4}>
            <FormGroup>
              <Label for="updateDate">Update Date</Label>
              <Input
                type="date"
                name="updateDate"
                id="updateDate"
                value={updateDate}
                onChange={e => setUpdateDate(e.target.value)}
                placeholder="DD/MM/YYYY"
                className="form-control"
              />
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col md={8}>
            <FormGroup>
              <Label for="status">Status/Condition Now</Label>
              <Input
                id="status"
                name="status"
                type="select"
                value={status}
                onChange={e => setStatus(e.target.value)}
              >
                <option value="1">Working well</option>
                <option value="2">Broken/Needs repair</option>
                <option value="3">Stolen/Lost</option>
                <option value="4">End of life</option>
                <option value="5">Returned</option>
              </Input>
            </FormGroup>
          </Col>
          <Col md={8}>
            <FormGroup>
              <Label for="lastUsedBy">Who used the tool/equipment last time?</Label>
              <Input
                type="select"
                name="lastUsedBy"
                id="lastUsedBy"
                value={lastUsedBy}
                onChange={e => setLastUsedBy(e.target.value)}
              >
                <option value="1">Jane Doe (Volunteer #1)</option>
                <option value="2">Jane Doe (Volunteer #2)</option>
                <option value="3">Jane Doe (Volunteer #3)</option>
                <option value="4">Jane Doe (Volunteer #4)</option>
                <option value="other">Other (Please specify below)</option>
              </Input>
              <Input
                type="text"
                name="lastUsedByOther"
                id="lastUsedByOther"
                placeholder="If other is selected, input the name."
                value={lastUsedByOther}
                onChange={e => setLastUsedByOther(e.target.value)}
                className="mt-2"
              />
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col md={8}>
            <FormGroup>
              <Label for="lastUsedFor">What was it used for last time?</Label>
              <Input
                type="select"
                name="lastUsedFor"
                id="lastUsedFor"
                value={lastUsedFor}
                onChange={e => setLastUsedFor(e.target.value)}
              >
                <option value="1">Kitchen - tiling</option>
                <option value="2">Kitchen - tiling</option>
                <option value="3">Kitchen - tiling</option>
                <option value="4">Kitchen - tiling</option>
                <option value="other">Other (Please specify below)</option>
              </Input>
              <Input
                type="text"
                name="lastUsedForOther"
                id="lastUsedForOther"
                placeholder="If other is selected, input the task."
                value={lastUsedForOther}
                onChange={e => setLastUsedForOther(e.target.value)}
                className="mt-2"
              />
            </FormGroup>
          </Col>
        </Row>

        <FormGroup>
          <Label className="form-control-label" for="replacementRequired-yes">
            Require a replacement?
          </Label>
          <Radio
            name="replacementRequired"
            options={[
              { label: 'Yes', value: 'yes', id: 'replacementRequired-yes' },
              { label: 'No', value: 'no', id: 'replacementRequired-no' },
            ]}
            value={replacementRequired}
            onChange={e => setReplacementRequired(e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <Label for="file-upload-input">
            Upload latest picture of this tool or equipment. (optional)
          </Label>
          <DragAndDrop uploadedFiles={uploadedFiles} updateUploadedFiles={setUploadedFiles} />
        </FormGroup>

        <FormGroup>
          <Label for="notes">Additional Description (optional)</Label>
          <Input
            type="textarea"
            name="description"
            id="description"
            placeholder="Provide detail description if need."
            rows="3"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <Label className="form-control-label" for="sendNote-yes">
            Do you want to send a note for this update?
          </Label>
          <Radio
            name="sendNote"
            options={[
              { label: 'Yes', value: 'yes' },
              { label: 'No', value: 'no' },
            ]}
            value={sendNote}
            onChange={e => setSendNote(e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <Label for="notes">Note (All the managers in this project can see this)</Label>
          <Input
            type="textarea"
            name="notes"
            id="notes"
            placeholder="A short note as a notice or reminder for your co-workers to learn about this update."
            rows="3"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <div className="inv-form-btn-group">
            <Button
              color="secondary"
              className="bm-dashboard__button btn btn-secondary"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button color="primary" onClick={handleSubmit}>
              Submit
            </Button>
          </div>
        </FormGroup>
      </Form>
    </Container>
  );
}
