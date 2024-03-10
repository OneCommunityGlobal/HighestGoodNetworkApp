import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Form, FormGroup, Label, Input, Container, Row, Col } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css'; // Make sure to import Bootstrap CSS
import BMError from 'components/BMDashboard/shared/BMError';
import '../../BMDashboard.css'; // Your custom CSS
import CheckTypesModal from 'components/BMDashboard/shared/CheckTypesModal';

export default function UpdateEquipment() {
  const errors = useSelector(state => state.errors);
  const [isError, setIsError] = useState(false);
  const [modal, setModal] = useState(false);
  const [lastUsedBy, setLastUsedBy] = useState('');
  const [lastUsedByOther, setLastUsedByOther] = useState('');
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (Object.entries(errors).length) {
      setIsError(true);
    }
  }, [errors]);

  if (isError) {
    return (
      <Container className="bm-error-page">
        <h2>Add Type: Equipment</h2>
        <BMError errors={errors} />
      </Container>
    );
  }

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
        <FormGroup>
          <Label for="status">Status/Condition</Label>
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
            value={lastUsedByOther} // Make sure you have defined this state variable
            onChange={e => setLastUsedByOther(e.target.value)} // And the function to update it
            className="mt-2" // Add some margin top for spacing
          />
        </FormGroup>
        <FormGroup>
          <Label for="notes">Note (All the managers in this project can see this)</Label>
          <Input
            type="textarea"
            name="notes"
            id="notes"
            rows="3"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </FormGroup>
        <Row form>
          <Col md={6}>
            <Button onClick={() => setModal(true)} className="bm-dashboard__button btn-secondary">
              Cancel
            </Button>
          </Col>
          <Col md={6}>
            <Button type="submit" className="bm-dashboard__button btn-secondary">
              Submit
            </Button>
          </Col>
        </Row>
      </Form>
    </Container>
  );
}
