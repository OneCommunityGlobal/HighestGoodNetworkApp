import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchToolById } from 'actions/bmdashboard/toolActions';
import {
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Container,
  Row,
  Col,
  Card,
  CardImg,
} from 'reactstrap';
import './UpdateEquipment.css';
import '../../BMDashboard.css';
import CheckTypesModal from 'components/BMDashboard/shared/CheckTypesModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera } from '@fortawesome/free-solid-svg-icons';
import { useHistory, useParams } from 'react-router-dom';

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
  const toolDetails = useSelector(state => state.bmTools.toolDetails);

  const dispatch = useDispatch(); // Use this if you're using Redux
  useEffect(() => {
    if (equipmentId) {
      dispatch(fetchToolById(equipmentId));
      // The component will re-render with new state once the fetch is complete and state is updated
    }
  }, [dispatch, equipmentId]);
  const handleCancel = () => history.goBack();

  const calculateDaysLeft = endDate => {
    if (!endDate) return '';

    const today = new Date();
    const rentalEnd = new Date(endDate);
    const timeDiff = rentalEnd.getTime() - today.getTime();

    // Calculate the days left
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return daysLeft >= 0 ? daysLeft : 'Expired';
  };

  const handleSubmit = e => {
    e.preventDefault(); // Prevent the default form submit action

    const formData = {
      lastUsedBy: lastUsedBy === 'other' ? lastUsedByOther : lastUsedBy,
      lastUsedFor: lastUsedFor === 'other' ? lastUsedForOther : lastUsedFor,
      replacementRequired,
      updateDate,
      status,
      description,
      sendNote,
      notes,
      // Tool image handling logic will be implemented based on your application's requirements
    };

    // eslint-disable-next-line no-console
    console.log('Form Data Submitted:', formData);

    // Here, implement the logic to send formData to your backend server
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

      {toolDetails && (
        <Row>
          <Col md={3}>
            <Card className="mb-1">
              <CardImg
                top
                className="square-image"
                src={toolDetails.itemType.imageUrl || 'https://via.placeholder.com/150'}
                alt="Tool image"
              />
            </Card>
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
                value={toolDetails ? toolDetails.itemType.name : 'Loading...'}
                className="read-only-input"
              />
            </Col>
            <Col md={4}>
              <Label for="itemNumber">Number</Label>
              <Input
                readOnly
                value={toolDetails ? toolDetails._id : ''}
                className="read-only-input"
              />
            </Col>
            <Col md={4}>
              <Label for="itemClass">Class</Label>
              <Input
                readOnly
                value={toolDetails ? toolDetails.itemType.category : ''}
                className="read-only-input"
              />
            </Col>
          </Row>
          <Row form>
            <Col md={4}>
              <Label for="itemProject">Project</Label>
              <Input
                readOnly
                value={toolDetails ? toolDetails.project.name : ''}
                className="read-only-input"
              />
            </Col>
            <Col md={4}>
              <Label for="itemStatus">Current Status</Label>
              <Input
                readOnly
                value={
                  toolDetails && toolDetails.updateRecord.length > 0
                    ? toolDetails.updateRecord[toolDetails.updateRecord.length - 1].condition
                    : 'N/A'
                }
                className="read-only-input"
              />
            </Col>
            <Col md={4}>
              <Label for="itemOwnership">Ownership</Label>
              <Input
                readOnly
                value={toolDetails ? toolDetails.purchaseStatus : ''}
                className="read-only-input"
              />
            </Col>
          </Row>
          {/* Only show this row if the item is a rental */}
          {toolDetails && toolDetails.purchaseStatus === 'Rental' && (
            <Row form>
              <Col md={4}>
                <Label for="rentalEndDate">Rental End Date</Label>
                <Input
                  readOnly
                  value={toolDetails ? toolDetails.rentalDueDate.split('T')[0] : ''}
                  className="read-only-input"
                />
              </Col>
              <Col md={4}>
                <Label for="daysLeft">Days Left</Label>
                <Input
                  readOnly
                  value={calculateDaysLeft(toolDetails.rentalDueDate)}
                  className="read-only-input"
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
                type="select"
                name="status"
                id="status"
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
          <Label className="form-control-label">Require a replacement?</Label>
          <div className="d-flex align-items-center">
            <FormGroup check inline>
              <Label check>
                <Input
                  type="radio"
                  name="replacementRequired"
                  value="yes"
                  checked={replacementRequired === 'yes'}
                  onChange={() => setReplacementRequired('yes')}
                />{' '}
                Yes
              </Label>
            </FormGroup>
            <FormGroup check inline>
              <Label check>
                <Input
                  type="radio"
                  name="replacementRequired"
                  value="no"
                  checked={replacementRequired === 'no'}
                  onChange={() => setReplacementRequired('no')}
                />{' '}
                No
              </Label>
            </FormGroup>
          </div>
        </FormGroup>

        <FormGroup>
          <Label for="toolImage">Upload latest picture of this tool or equipment. (optional)</Label>
          <div
            style={{
              border: '2px dashed #ccc',
              textAlign: 'center',
              padding: '20px',
              marginBottom: '20px',
            }}
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault();
              // const { files } = e.dataTransfer;
              // console.log(files);
            }}
          >
            <FontAwesomeIcon icon={faCamera} size="2x" />
            <p>Drag and drop your picture here</p>
          </div>
          <Input
            type="file"
            name="toolImage"
            id="toolImage"
            // onChange={e => {
            // const { files } = e.target;
            // console.log(files);
            // }}
          />
        </FormGroup>

        <FormGroup>
          <Label for="notes">Additional Descrioption (optional)</Label>
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
          <Label className="form-control-label">Do you want to send a note for this update?</Label>
          <div className="d-flex align-items-center">
            <FormGroup check inline>
              <Label check>
                <Input
                  type="radio"
                  name="sendNote"
                  value="yes"
                  checked={sendNote === 'yes'}
                  onChange={() => setSendNote('yes')}
                />{' '}
                Yes
              </Label>
            </FormGroup>
            <FormGroup check inline>
              <Label check>
                <Input
                  type="radio"
                  name="sendNote"
                  value="no"
                  checked={sendNote === 'no'}
                  onChange={() => setSendNote('no')}
                />{' '}
                No
              </Label>
            </FormGroup>
          </div>
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
