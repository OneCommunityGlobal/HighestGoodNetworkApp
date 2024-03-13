import { useEffect, useState } from 'react';
import { Button, Form, FormGroup, Label, Input, Container, Row, Col } from 'reactstrap';
import './UpdateEquipment.css';
import '../../BMDashboard.css';
import CheckTypesModal from 'components/BMDashboard/shared/CheckTypesModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera } from '@fortawesome/free-solid-svg-icons';
import { useHistory } from 'react-router-dom';

export default function UpdateEquipment() {
  const history = useHistory();
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
  const [itemOwnership, setItemOwnership] = useState('');

  useEffect(() => {
    // Replace with your actual logic to fetch the item's details
    const fetchItemDetails = async () => {
      // const response = await fetch('/api/item-details');
      // const data = await response.json();
      // setItemOwnership(data.ownership);

      // Simulating a response
      setItemOwnership('Rental'); // For example, set it to 'Rental' or 'Owned'
    };

    fetchItemDetails();
  }, []);

  const handleCancel = () => history.goBack();

  const handleSubmit = e => {
    e.preventDefault(); // Prevent the default form submit action

    // Create a data object with the values from your state
    const formData = {
      lastUsedBy,
      lastUsedByOther,
      lastUsedFor,
      lastUsedForOther,
      replacementRequired,
      description,
      sendNote,
      updateDate,
      status,
      notes,
      itemOwnership,
      // ...any other fields you want to include
    };

    // eslint-disable-next-line no-console
    console.log('Form Data Submitted:', formData);

    // Here you would typically make an API call to submit your form data
    // For example:
    // fetch('/api/submit-equipment-update', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(formData),
    // })
    // .then(response => response.json())
    // .then(data => {
    //   console.log('Success:', data);
    //   // Perform any actions after successful submission, like redirecting
    //   history.push('/success-page'); // Redirect to a success page, if you have one
    // })
    // .catch((error) => {
    //   console.error('Error:', error);
    // });
  };
  return (
    <Container className="inv-form-page-container">
      <CheckTypesModal modal={modal} setModal={setModal} type="Equipments" />
      <header className="bm-dashboard__header">
        <h1>Update Tool or Equipment Status Form</h1>
      </header>
      <div className="image-container">
        <img src="https://via.placeholder.com/150" alt="Placeholder" />
      </div>
      <Form className="inv-form">
        <FormGroup className="background-from-db">
          <Row form>
            <Col md={4}>
              <Label for="itemName">Name</Label>
              <Input readOnly value="Grinder" className="read-only-input" />
            </Col>
            <Col md={4}>
              <Label for="itemNumber">Number</Label>
              <Input readOnly value="#1" className="read-only-input" />
            </Col>
            <Col md={4}>
              <Label for="itemClass">Class</Label>
              <Input readOnly value="Tool" className="read-only-input" />
            </Col>
          </Row>
          <Row form>
            <Col md={4}>
              <Label for="itemProject">Project</Label>
              <Input readOnly value="Project 1" className="read-only-input" />
            </Col>
            <Col md={4}>
              <Label for="itemStatus">Current Status</Label>
              <Input readOnly value="Working Well" className="read-only-input" />
            </Col>
            <Col md={4}>
              <Label for="itemOwnership">Ownership</Label>
              <Input readOnly value="Rental" className="read-only-input" />
            </Col>
          </Row>
          {/* Only show this row if the item is a rental */}
          {itemOwnership === 'Rental' && (
            <Row form>
              <Col md={4}>
                <Label for="rentalEndDate">Rental End Date</Label>
                <Input readOnly value="MM-DD-YYYY" className="read-only-input" />
              </Col>
              <Col md={4}>
                <Label for="daysLeft">Days Left</Label>
                <Input readOnly value="20" className="read-only-input" />
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
                <option value="1">Available</option>
                <option value="2">Checked Out</option>
                <option value="3">Under Maintenance</option>
                <option value="4">Retired</option>
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
