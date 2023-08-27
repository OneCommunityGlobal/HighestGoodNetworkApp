import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  addTimeOffRequestThunk,
  updateTimeOffRequestThunk,
  deleteTimeOffRequestThunk,
} from '../../actions/timeOffRequestAction';
import moment from 'moment';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  FormText,
  Container,
  Row,
  Col,
  FormGroup,
  Label,
  Card,
  CardBody,
  CardTitle,
  Form,
} from 'reactstrap';
import { boxStyle } from 'styles';

const LogTimeOffPopUp = React.memo(props => {
  const dispatch = useDispatch();
  const today = moment().format('YYYY-MM-DD');
  const [requestToUpdate, setrequestToUpdate] = useState({});

  const initialRequestData = {
    dateOfLeave: today,
    numberOfWeeks: 1,
    reasonForLeave: '',
  };

  const initialRequestDataErrors = {
    dateOfLeaveError: '',
    numberOfWeeksError: '',
    reasonForLeaveError: '',
  };

  const initialUpdateRequestData = {
    dateOfLeave: requestToUpdate?.dateOfLeave || today,
    numberOfWeeks: requestToUpdate?.numberOfWeeks || 1,
    reasonForLeave: requestToUpdate?.reasonForLeave || '',
  };

  const initialUpdateRequestDataErrors = {
    dateOfLeaveError: '',
    numberOfWeeksError: '',
    reasonForLeaveError: '',
  };

  const [requestData, setRequestData] = useState(initialRequestData);
  const [requestDataErrors, setRequestDataErrors] = useState(initialRequestDataErrors);
  const [updateRequestData, setUpdateRequestData] = useState(initialUpdateRequestData);
  const [updaterequestDataErrors, setUpdateRequestDataErrors] = useState(
    initialUpdateRequestDataErrors,
  );

  const [nestedModal, SetNestedModal] = useState(false);

  const resetState = () => {
    setRequestData(initialRequestData);
    setRequestDataErrors(initialRequestDataErrors);
    setUpdateRequestData(initialUpdateRequestData);
    setUpdateRequestDataErrors(initialUpdateRequestDataErrors);
  };

  const closePopup = e => {
    resetState();
    props.onClose();
  };

  const closeNested = () => {
    SetNestedModal(false);
  };

  const openNested = () => {
    SetNestedModal(true);
  };

  const handleAddRequestDataChange = e => {
    e.preventDefault();
    const id = e.target.id;
    const value = e.target.value;
    setRequestData(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const validateDateOfLeave = (data, nestedModal) => {
    if (nestedModal) {
      if (!data.dateOfLeave) {
        setUpdateRequestDataErrors(prev => ({
          ...prev,
          dateOfLeaveError: 'Date of leave can not be empty',
        }));
        return false;
      }
    } else {
      if (!data.dateOfLeave) {
        setRequestDataErrors(prev => ({
          ...prev,
          dateOfLeaveError: 'Date of leave can not be empty',
        }));
        return false;
      }
    }
    return true;
  };

  const validateNumberOfWeeks = (data, nestedModal) => {
    if ((data, nestedModal)) {
      if (!data.numberOfWeeks) {
        setUpdateRequestDataErrors(prev => ({
          ...prev,
          numberOfWeeksError: 'Duration can not be empty',
        }));
        return false;
      }
      if (data.numberOfWeeks < 1) {
        setUpdateRequestDataErrors(prev => ({
          ...prev,
          numberOfWeeksError: 'Duration can not be less than 1 week',
        }));
        return false;
      }
    } else {
      if (!data.numberOfWeeks) {
        setRequestDataErrors(prev => ({
          ...prev,
          numberOfWeeksError: 'Duration can not be empty',
        }));
        return false;
      }
      if (data.numberOfWeeks < 1) {
        setRequestDataErrors(prev => ({
          ...prev,
          numberOfWeeksError: 'Duration can not be less than 1 week',
        }));
        return false;
      }
    }
    return true;
  };

  const validateReasonForLeave = (data, nestedModal) => {
    if (nestedModal) {
      if (!data.reasonForLeave) {
        setUpdateRequestDataErrors(prev => ({
          ...prev,
          reasonForLeaveError: 'Reason for leave can not be empty',
        }));
        return false;
      }
    } else {
      if (!data.reasonForLeave) {
        setRequestDataErrors(prev => ({
          ...prev,
          reasonForLeaveError: 'Reason for leave can not be empty',
        }));
        return false;
      }
    }
    return true;
  };

  const validateDateIsNotBeforeToday = (data, nestedModal) => {
    if (nestedModal) {
      const isBeforeToday = moment(data.dateOfLeave).isBefore(moment(), 'day');
      if (isBeforeToday) {
        setUpdateRequestDataErrors(prev => ({
          ...prev,
          dateOfLeaveError: 'Date of leave can not be before today',
        }));
        return false;
      }
    } else {
      const isBeforeToday = moment(data.dateOfLeave).isBefore(moment(), 'day');
      if (isBeforeToday) {
        setRequestDataErrors(prev => ({
          ...prev,
          dateOfLeaveError: 'Date of leave can not be before today',
        }));
        return false;
      }
    }
    return true;
  };

  const validateDateIsNotBeforeEndOfOtherRequests = (data, nestedModal) => {
    if (props.userTimeOffRequests.length > 0) {
      const isAnyEndingDateAfterDate = props.userTimeOffRequests.some(request => {
        const requestDate = moment(request.endingDate);
        const dateOfLeave = moment(data.dateOfLeave);
        console.log(requestDate);
        return requestDate.isAfter(dateOfLeave);
      });

      if (nestedModal) {
        if (isAnyEndingDateAfterDate) {
          setUpdateRequestDataErrors(prev => ({
            ...prev,
            dateOfLeaveError: 'Date of leave can not be before the return date of other requests',
          }));
          return false;
        }
      } else {
        if (isAnyEndingDateAfterDate) {
          setRequestDataErrors(prev => ({
            ...prev,
            dateOfLeaveError: 'Date of leave can not be before the return date of other requests',
          }));
          return false;
        }
      }
    }
    return true;
  };

  const handleAddRequest = e => {
    e.preventDefault();
    setRequestDataErrors(initialRequestDataErrors);

    if (!validateDateOfLeave(requestData, false)) return;
    if (!validateNumberOfWeeks(requestData, false)) return;
    if (!validateReasonForLeave(requestData, false)) return;
    if (!validateDateIsNotBeforeToday(requestData, false)) return;
    if (!validateDateIsNotBeforeEndOfOtherRequests(requestData, false)) return;

    console.log(requestData);
    console.log();
    const data = {
      requestFor: props.user._id,
      reason: requestData.reasonForLeave,
      startingDate: moment(requestData.dateOfLeave).format('MM/DD/YY'),
      duration: requestData.numberOfWeeks,
    };

    dispatch(addTimeOffRequestThunk(data));
  };

  return (
    <Modal isOpen={props.open} toggle={closePopup}>
      <ModalHeader toggle={closePopup}>Add New Time Off Request</ModalHeader>
      <ModalBody>
        <Container>
          <Form>
            <Row>
              <Col>
                <FormGroup>
                  <Label for="dateOfLeave">Date of leave</Label>
                  <Input
                    type="date"
                    name="dateOfLeave"
                    id="dateOfLeave"
                    value={requestData.dateOfLeave}
                    onChange={e => handleAddRequestDataChange(e)}
                  />
                  {<FormText color="danger">{requestDataErrors.dateOfLeaveError}</FormText>}
                </FormGroup>
              </Col>
              <Col>
                <FormGroup>
                  <Label for="numberOfWeeks">Duration in weeks</Label>
                  <Input
                    type="number"
                    name="numberOfWeeks"
                    id="numberOfWeeks"
                    value={requestData.numberOfWeeks}
                    onChange={e => handleAddRequestDataChange(e)}
                  />
                  {<FormText color="danger">{requestDataErrors.numberOfWeeksError}</FormText>}
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col>
                <FormGroup>
                  <Label for="reasonForLeave">Reason for leave</Label>
                  <Input
                    type="textarea"
                    rows="2"
                    placeholder="Add the reason for requesting time off here"
                    id="reasonForLeave"
                    value={requestData.reasonForLeave}
                    onChange={e => handleAddRequestDataChange(e)}
                  />
                  {<FormText color="danger">{requestDataErrors.reasonForLeaveError}</FormText>}
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col>
                <Button
                  color="primary"
                  style={boxStyle}
                  onClick={e => {
                    handleAddRequest(e);
                  }}
                >
                  Save
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </ModalBody>
      {props.userTimeOffRequests.length > 0 && (
        <>
          <ModalHeader>Time Off Requests</ModalHeader>
          <ModalBody className="Logged-time-off-cards-container">
            <Container>
              {props.userTimeOffRequests.map(request => (
                <Card className="mb-2" key={request._id}>
                  <CardBody>
                    <Row>
                      <Col>
                        <h6>Date of Leave:</h6>
                        <p>{moment(request.startingDate).format('MM/DD/YYYY')}</p>
                      </Col>
                      <Col>
                        <h6>Duration (weeks):</h6>
                        <p>{request.duration}</p>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <h6>Reason for Leave:</h6>
                        <p>{request.reason}</p>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <Button color="primary" onClick={openNested}>
                          Edit
                        </Button>
                        <Button color="danger ml-1">Delete</Button>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              ))}
            </Container>
            <Modal isOpen={nestedModal} toggle={closeNested}>
              <ModalHeader toggle={closeNested}>Edit Time Off Request</ModalHeader>
              <ModalBody>
                <Container>
                  <Form>
                    <Row>
                      <Col>
                        <FormGroup>
                          <Label for="dateOfLeave">Date of leave</Label>
                          <Input type="date" value={updateRequestData.dateOfLeave} />
                          {
                            <FormText color="danger">
                              {updaterequestDataErrors.dateOfLeaveError}
                            </FormText>
                          }
                        </FormGroup>
                      </Col>
                      <Col>
                        <FormGroup>
                          <Label for="numberOfWeeks">Duration in weeks</Label>
                          <Input type="number" value={updateRequestData.numberOfWeeks} />
                          {
                            <FormText color="danger">
                              {updaterequestDataErrors.numberOfWeeksError}
                            </FormText>
                          }
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <FormGroup>
                          <Label for="reasonForLeave">Reason for leave</Label>
                          <Input
                            type="textarea"
                            rows="2"
                            value={updateRequestData.reasonForLeave}
                          />
                          {
                            <FormText color="danger">
                              {updaterequestDataErrors.reasonForLeaveError}
                            </FormText>
                          }
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <Button color="primary" style={boxStyle}>
                          Save
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </Container>
              </ModalBody>
              <ModalFooter>
                <Button color="secondary" onClick={closeNested} style={boxStyle}>
                  Close
                </Button>
              </ModalFooter>
            </Modal>
          </ModalBody>
        </>
      )}
      <ModalFooter>
        <Button color="secondary" onClick={closePopup} style={boxStyle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
});
export default LogTimeOffPopUp;
