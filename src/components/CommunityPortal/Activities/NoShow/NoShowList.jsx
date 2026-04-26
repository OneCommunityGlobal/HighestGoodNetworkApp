import { useState } from 'react';
import styles from './NoShowList.module.css';
import {
  Modal,
  ModalHeader,
  ModalBody,
  Button,
  Row,
  Col,
  Input,
  ListGroup,
  ListGroupItem,
  CardTitle,
  Card,
  CardText,
  CardBody,
  CardHeader,
} from 'reactstrap';

import axios from 'axios';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '../../../../utils/URL';
import 'react-toastify/dist/ReactToastify.css';

function NoShowList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const mockData = {
    eventId: 1,
    eventName: 'Event 1',
    eventDate: '2023-10-01',
    eventTime: '10:00 AM',
    participants: [
      { participantID: 1, name: 'Alice', email: 'alice@gmail.com' },
      { participantID: 2, name: 'Bob', email: 'bob@gmail.com' },
      { participantID: 3, name: 'Charlie', email: 'charlie@gmail.com' },
      { participantID: 4, name: 'David', email: 'david@gmail.com' },
    ],
  };

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  return (
    <div>
      <Card
        style={{
          backgroundColor: '#fafafa',
          borderRadius: 0,
          minWidth: '100%',
        }}
      >
        <CardHeader tag="h2">No Show Rate Tracking</CardHeader>
        <CardBody>
          <CardText>
            Popup when click
            <Button onClick={toggleModal} color="link">
              Get List
            </Button>
          </CardText>
        </CardBody>
      </Card>
      <NoShowListModal isOpen={isModalOpen} toggle={toggleModal} mockData={mockData} />
    </div>
  );
}

function NoShowListModal({ isOpen, toggle, mockData }) {
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [validationMessage, setValidationMessage] = useState('');

  const handleSelectAll = e => {
    setValidationMessage(''); // Clear validation message on select all
    if (e.target.checked) {
      setSelectedParticipants(mockData.participants.map(p => p.participantID));
    } else {
      setSelectedParticipants([]);
    }
  };

  const handleSelectParticipant = participantId => {
    setValidationMessage(''); // Clear validation message
    setSelectedParticipants(prevSelected => {
      if (prevSelected.includes(participantId)) {
        return prevSelected.filter(id => id !== participantId);
      }
      return [...prevSelected, participantId];
    });
  };

  const handleSendEmail = async () => {
    if (selectedParticipants.length === 0) {
      setValidationMessage('Please select at least one participant to send an email');
      return;
    }
    try {
      setValidationMessage(''); // Clear validation message on success
      const response = await axios.post(ENDPOINTS.CP_NOSHOW, {
        participants: selectedParticipants,
        eventId: mockData.eventId,
      });

      if (response.status === 200) {
        const msg =
          typeof response.data?.message === 'string'
            ? response.data.message
            : response.data?.message?.message || 'Success';
        toast.success(msg, {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        toast.error('Failed to send now show list emails. Please try again', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error('Failed to send now show list emails. Please try again', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>No Show List</ModalHeader>
      <ModalBody>
        {mockData.participants.length > 0 ? (
          <CardBody>
            <CardTitle tag="h5" className="mx-auto font-weight-bold">
              {mockData.eventName} | {mockData.eventTime}
            </CardTitle>

            <ListGroup>
              <ListGroupItem>
                <Row>
                  <Col xs="auto" className="d-flex justify-content-center align-items-center">
                    <Input
                      type="checkbox"
                      className={`${styles.customCheckbox} ms-1`}
                      checked={selectedParticipants.length === mockData.participants.length}
                      onChange={handleSelectAll}
                    />
                  </Col>
                  <Col>Select All</Col>
                </Row>
              </ListGroupItem>
              {mockData.participants.map(participant => (
                <ListGroupItem key={participant.participantID}>
                  <Row>
                    <Col xs="auto" className="d-flex justify-content-center align-items-center">
                      <Input
                        type="checkbox"
                        className={`${styles.customCheckbox} ms-1`}
                        checked={selectedParticipants.includes(participant.participantID)}
                        onChange={() => handleSelectParticipant(participant.participantID)}
                      />
                    </Col>
                    <Col className="text-primary">{participant.name}</Col>
                    <Col>{participant.email}</Col>
                  </Row>
                </ListGroupItem>
              ))}
            </ListGroup>
            {/* Display validation message */}
            {validationMessage && (
              <Row style={{ color: 'red', marginTop: '10px' }}>{validationMessage}</Row>
            )}
            <Row className="d-flex justify-content-center align-items-center mt-3">
              <Button color="secondary" onClick={handleSendEmail} style={{ marginTop: '10px' }}>
                Send Email
              </Button>
              <Button
                color="secondary"
                onClick={toggle}
                style={{ marginTop: '10px', marginLeft: '10px' }}
              >
                Close
              </Button>
            </Row>
          </CardBody>
        ) : (
          <CardBody>
            <CardText>No users in the No Show List.</CardText>
          </CardBody>
        )}
      </ModalBody>
    </Modal>
  );
}

export default NoShowList;
