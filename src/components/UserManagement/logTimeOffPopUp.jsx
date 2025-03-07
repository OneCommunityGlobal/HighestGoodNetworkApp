import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment-timezone';
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
  Form,
  Alert,
} from 'reactstrap';
import DatePicker from 'react-datepicker';
import { boxStyle, boxStyleDark } from '../../styles';
import '../Header/DarkMode.css';
import 'react-datepicker/dist/react-datepicker.css';
import {
  addTimeOffRequestThunk,
  updateTimeOffRequestThunk,
  deleteTimeOffRequestThunk,
} from '../../actions/timeOffRequestAction';

const LogTimeOffPopUp = React.memo(props => {
  const darkMode = useSelector(state => state.theme.darkMode);

  const dispatch = useDispatch();
  const allRequests = useSelector(state => state.timeOffRequests.requests);
  const today = moment().format('YYYY-MM-DD');
  const nextSundayStr = moment()
    .isoWeekday(7)
    .startOf('day');
  const nextSunday = new Date(nextSundayStr.year(), nextSundayStr.month(), nextSundayStr.date());

  const initialRequestData = {
    dateOfLeave: nextSunday,
    numberOfWeeks: 1,
    reasonForLeave: '',
  };

  const initialRequestDataErrors = {
    dateOfLeaveError: '',
    numberOfWeeksError: '',
    reasonForLeaveError: '',
  };

  const initialUpdateRequestData = {
    id: '',
    dateOfLeave: today,
    numberOfWeeks: 1,
    reasonForLeave: '',
  };

  const initialUpdateRequestDataErrors = {
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
  const [showSuccessfulUpdateAllert, setShowSuccessfulUpdateAllert] = useState(false);

  const resetState = () => {
    setRequestData(initialRequestData);
    setRequestDataErrors(initialRequestDataErrors);
    setUpdateRequestData(initialUpdateRequestData);
    setUpdateRequestDataErrors(initialUpdateRequestDataErrors);
  };

  const closePopup = () => {
    resetState();
    props.onClose();
  };

  const closeNested = () => {
    SetNestedModal(false);
  };

  const openNested = request => {
    SetNestedModal(true);
    setUpdateRequestDataErrors(initialUpdateRequestDataErrors);
    setShowSuccessfulUpdateAllert(false);
    setUpdateRequestData({
      id: request._id,
      dateOfLeave: moment(request.startingDate).format('YYYY-MM-DD'),
      numberOfWeeks: request.duration,
      reasonForLeave: request.reason,
    });
  };

  const getDateWithoutTimeZone = date => {
    const newDateObject = new Date(date);
    const day = newDateObject.getDate();
    const month = newDateObject.getMonth() + 1;
    const year = newDateObject.getFullYear();
    return moment(`${month}-${day}-${year}`, 'MM-DD-YYYY').format('YYYY-MM-DD');
  };

  const handleUpdateRequestDataChange = e => {
    e.preventDefault();
    const { id, value } = e.target;
    setUpdateRequestData(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const filterSunday = date => {
    const day = date.getDay();
    return day === 0;
  };

  const handleAddRequestDataChange = e => {
    e.preventDefault();
    const { id, value } = e.target;
    setRequestData(prev => ({
      ...prev,
      [id]: value,
    }));
  };
  // checks if date value is not empty
  const validateDateOfLeave = data => {
    if (!data.dateOfLeave) {
      setRequestDataErrors(prev => ({
        ...prev,
        dateOfLeaveError: 'Date of leave can not be empty',
      }));
      return false;
    }
    return true;
  };
  // checks if duration is not empty and is not negative or 0
  const validateNumberOfWeeks = (data, nestedmodal) => {
    if ((data, nestedmodal)) {
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
  // checks reason for leave is not empty
  const validateReasonForLeave = (data, nestedmodal) => {
    if (nestedmodal) {
      if (!data.reasonForLeave) {
        setUpdateRequestDataErrors(prev => ({
          ...prev,
          reasonForLeaveError: 'Reason for leave can not be empty',
        }));
        return false;
      }
      const words = data.reasonForLeave?.split(' ');
      if (words.length < 10) {
        setUpdateRequestDataErrors(prev => ({
          ...prev,
          reasonForLeaveError: 'Reason for leave can not be less than 10 words',
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
      const words = data.reasonForLeave?.split(' ');
      if (words.length < 10) {
        setRequestDataErrors(prev => ({
          ...prev,
          reasonForLeaveError: 'Reason for leave can not be less than 10 words',
        }));
        return false;
      }
    }
    return true;
  };
  // checks if date of leave is not before the start of current week
  const validateDateIsNotBeforeStartOfCurrentWeek = data => {
    const isBeforeToday = moment(getDateWithoutTimeZone(data.dateOfLeave)).isBefore(
      moment().startOf('week'),
      'day',
    );
    if (isBeforeToday) {
      setRequestDataErrors(prev => ({
        ...prev,
        dateOfLeaveError: 'Date of leave can not be before the start of current week',
      }));
      return false;
    }

    return true;
  };
  // checks if the newly added request doesn't overlap with existing ones
  const checkIfRequestOverlapsWithOtherRequests = data => {
    const dataStartingDate = moment(getDateWithoutTimeZone(data.dateOfLeave)).startOf('day');
    const dataEndingDate = moment(getDateWithoutTimeZone(data.dateOfLeave))
      .add(Number(data.numberOfWeeks), 'week')
      .subtract(1, 'day')
      .startOf('day');
    if (allRequests[props.user._id]?.length > 0) {
      const isAnyOverlapingRequests = allRequests[props.user._id].some(request => {
        const requestStartingDate = moment(request.startingDate.split('T')[0]).startOf('day');
        const requestEndingDate = moment(request.endingDate.split('T')[0]).startOf('day');

        if (
          (requestStartingDate.isSameOrAfter(dataStartingDate) &&
            requestStartingDate.isSameOrBefore(dataEndingDate)) ||
          (requestEndingDate.isSameOrAfter(dataStartingDate) &&
            requestEndingDate.isSameOrBefore(dataEndingDate))
        ) {
          return true;
        }
        return false;
      });

      if (isAnyOverlapingRequests) {
        setRequestDataErrors(prev => ({
          ...prev,
          dateOfLeaveError: 'this request overlap with other existing requests',
        }));
        return false;
      }
    }
    return true;
  };

  // checks if the updated request duration doesn't overlap with existing ones
  const checkIfUpdatedRequestOverlapsWithOtherRequests = data => {
    const dataStartingDate = moment(data.dateOfLeave.split('T')[0]).startOf('day');
    const dataEndingDate = moment(data.dateOfLeave.split('T')[0])
      .add(Number(data.numberOfWeeks), 'week')
      .subtract(1, 'day')
      .startOf('day');

    const isAnyOverlapingRequests = allRequests[props.user._id].some(request => {
      if (request._id === data.id) {
        return false;
      }
      const requestStartingDate = moment(request.startingDate.split('T')[0]).startOf('day');
      const requestEndingDate = moment(request.endingDate.split('T')[0]).startOf('day');

      if (
        (requestStartingDate.isSameOrAfter(dataStartingDate) &&
          requestStartingDate.isSameOrBefore(dataEndingDate)) ||
        (requestEndingDate.isSameOrAfter(dataStartingDate) &&
          requestEndingDate.isSameOrBefore(dataEndingDate))
      ) {
        return true;
      }
      return false;
    });

    if (isAnyOverlapingRequests) {
      setUpdateRequestDataErrors(prev => ({
        ...prev,
        numberOfWeeksError: 'this request overlap with other existing requests',
      }));
      return false;
    }
    return true;
  };

  const handleAddRequest = e => {
    e.preventDefault();
    setRequestDataErrors(initialRequestDataErrors);

    if (!validateDateOfLeave(requestData)) return;
    if (!validateDateIsNotBeforeStartOfCurrentWeek(requestData)) return;
    if (!checkIfRequestOverlapsWithOtherRequests(requestData)) return;
    if (!validateNumberOfWeeks(requestData, false)) return;
    if (!validateReasonForLeave(requestData, false)) return;

    const data = {
      requestFor: props.user._id,
      reason: requestData.reasonForLeave,
      startingDate: getDateWithoutTimeZone(requestData.dateOfLeave),
      duration: requestData.numberOfWeeks,
    };
    dispatch(addTimeOffRequestThunk(data));
  };

  const handleUpdateRequestSave = e => {
    e.preventDefault();
    setUpdateRequestDataErrors(initialUpdateRequestDataErrors);

    if (!validateNumberOfWeeks(updateRequestData, true)) return;
    if (!validateReasonForLeave(updateRequestData, true)) return;
    if (!checkIfUpdatedRequestOverlapsWithOtherRequests(updateRequestData)) return;

    const data = {
      reason: updateRequestData.reasonForLeave,
      startingDate: moment(updateRequestData.dateOfLeave)
        .tz('America/Los_Angeles')
        .format('YYYY-MM-DD'),
      duration: updateRequestData.numberOfWeeks,
    };

    dispatch(updateTimeOffRequestThunk(updateRequestData.id, data));
    setShowSuccessfulUpdateAllert(true);
  };

  const handleDeleteRequest = id => {
    dispatch(deleteTimeOffRequestThunk(id));
  };

  const sortRequests = (a, b) => {
    const momentA = moment(a.startingDate, 'YYYY-MM-DD');
    const momentB = moment(b.startingDate, 'YYYY-MM-DD');
    return momentA - momentB;
  };

  return (
    <Modal
      isOpen={props.open}
      toggle={closePopup}
      className={darkMode ? 'text-light dark-mode' : ''}
    >
      <ModalHeader toggle={closePopup} className={darkMode ? 'bg-space-cadet' : ''}>
        Add New Time Off Request
      </ModalHeader>
      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Container>
          <Form>
            <Row>
              <Col>
                <FormGroup>
                  <Label className={darkMode ? 'text-light' : ''} for="dateOfLeave">
                    Date of leave
                  </Label>
                  <DatePicker
                    selected={requestData.dateOfLeave}
                    onChange={date => {
                      setRequestData(prev => ({
                        ...prev,
                        dateOfLeave: date,
                      }));
                    }}
                    filterDate={filterSunday}
                    dateFormat="MM/dd/yyyy"
                    placeholderText="Select a Sunday"
                    id="dateOfLeave"
                    className="date-of-leave-datepicker"
                  />

                  <FormText color="danger">{requestDataErrors.dateOfLeaveError}</FormText>
                </FormGroup>
              </Col>
              <Col>
                <FormGroup>
                  <Label className={darkMode ? 'text-light' : ''} for="numberOfWeeks">
                    Duration in weeks
                  </Label>
                  <Input
                    type="number"
                    name="numberOfWeeks"
                    id="numberOfWeeks"
                    value={requestData.numberOfWeeks}
                    onChange={e => handleAddRequestDataChange(e)}
                  />
                  <FormText color="danger">{requestDataErrors.numberOfWeeksError}</FormText>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col>
                <FormGroup>
                  <Label className={darkMode ? 'text-light' : ''} for="reasonForLeave">
                    Reason for leave
                  </Label>
                  <Input
                    type="textarea"
                    rows="2"
                    placeholder="Add the reason for requesting time off here"
                    id="reasonForLeave"
                    value={requestData.reasonForLeave}
                    onChange={e => handleAddRequestDataChange(e)}
                  />
                  <FormText color="danger">{requestDataErrors.reasonForLeaveError}</FormText>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col>
                <Button
                  color="primary"
                  style={darkMode ? boxStyleDark : boxStyle}
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
      {allRequests[props.user._id]?.length > 0 && (
        <>
          <ModalHeader className={darkMode ? 'bg-space-cadet' : ''}>Time Off Requests</ModalHeader>
          <ModalBody
            className={`Logged-time-off-cards-container ${darkMode ? 'bg-yinmn-blue' : ''}`}
          >
            <Container>
              {allRequests[props.user._id]
                .slice()
                .sort(sortRequests)
                .map(request => (
                  <Card
                    className={`mb-2 ${darkMode ? 'bg-yinmn-blue border-white' : ''}`}
                    key={request._id}
                  >
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
                          <Button color="primary" onClick={() => openNested(request)}>
                            Edit
                          </Button>
                          <Button
                            color="danger ml-1"
                            onClick={() => handleDeleteRequest(request._id)}
                          >
                            Delete
                          </Button>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                ))}
            </Container>
            <Modal
              isOpen={nestedModal}
              toggle={closeNested}
              className={darkMode ? 'text-light dark-mode' : ''}
            >
              <ModalHeader toggle={closeNested} className={darkMode ? 'bg-space-cadet' : ''}>
                Edit Time Off Request
              </ModalHeader>
              <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
                <Container>
                  <Form>
                    <Row>
                      <Col>
                        <FormGroup>
                          <Label for="numberOfWeeks" className={darkMode ? 'text-light' : ''}>
                            Duration in weeks
                          </Label>
                          <Input
                            type="number"
                            value={updateRequestData.numberOfWeeks}
                            id="numberOfWeeks"
                            onChange={e => handleUpdateRequestDataChange(e)}
                          />

                          <FormText color="danger">
                            {updaterequestDataErrors.numberOfWeeksError}
                          </FormText>
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <FormGroup>
                          <Label for="reasonForLeave" className={darkMode ? 'text-light' : ''}>
                            Reason for leave
                          </Label>
                          <Input
                            type="textarea"
                            rows="2"
                            value={updateRequestData.reasonForLeave}
                            id="reasonForLeave"
                            onChange={e => handleUpdateRequestDataChange(e)}
                          />
                          <FormText color="danger">
                            {updaterequestDataErrors.reasonForLeaveError}
                          </FormText>
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col xs="auto" className="d-flex align-items-start">
                        <Button
                          color="primary"
                          style={darkMode ? boxStyleDark : boxStyle}
                          onClick={e => handleUpdateRequestSave(e)}
                        >
                          Save
                        </Button>
                      </Col>
                      <Col>
                        {showSuccessfulUpdateAllert && (
                          <Alert className="time-off-request-alert">Updated !</Alert>
                        )}
                      </Col>
                    </Row>
                  </Form>
                </Container>
              </ModalBody>
              <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
                <Button
                  color="secondary"
                  onClick={closeNested}
                  style={darkMode ? boxStyleDark : boxStyle}
                >
                  Close
                </Button>
              </ModalFooter>
            </Modal>
          </ModalBody>
        </>
      )}
      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Button color="secondary" onClick={closePopup} style={darkMode ? boxStyleDark : boxStyle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
});
export default LogTimeOffPopUp;
