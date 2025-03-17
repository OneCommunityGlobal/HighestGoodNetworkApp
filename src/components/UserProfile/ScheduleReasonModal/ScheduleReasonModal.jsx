import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Container, Row, Col, Modal as NestedModal, ModalBody, ModalFooter } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import Form from 'react-bootstrap/Form';
import moment from 'moment-timezone';
import DatePicker from 'react-datepicker';
import { boxStyle, boxStyleDark } from 'styles';
import ScheduleReasonModalCard from './ScheduleReasonModalCard';
import {
  addTimeOffRequestThunk,
  deleteTimeOffRequestThunk,
} from '../../../actions/timeOffRequestAction';
import 'react-datepicker/dist/react-datepicker.css';
import './ScheduleReasonModal.css';

const ScheduleReasonModal = ({
  handleClose,
  userId,
  infringements,
  user,
  canManageTimeOffRequests,
  checkIfUserCanScheduleTimeOff,
  darkMode,
}) => {
  const dispatch = useDispatch();
  const allRequests = useSelector(state => state.timeOffRequests.requests);

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

  const initialConfirmationData = {
    offTimeWeeks: [],
    returnDate: '',
    reasonForLeave: '',
  };

  const [requestData, setRequestData] = useState(initialRequestData);
  const [requestDataErrors, setRequestDataErrors] = useState(initialRequestDataErrors);

  const [confirmationModal, setConfirmationModal] = useState(false);
  const [confirmationModalData, setConfirmationModalData] = useState(initialConfirmationData);
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
  const [allowedDurationModal, setAllowedDurationModal] = useState(false);
  const [allowedDurationData, setAllowedDurationData] = useState({});
  const [requestTodelete, setRequestTodelete] = useState('');

  const ContainerMaxHeight = checkIfUserCanScheduleTimeOff() ? '160px' : '600px';

  const checkIfUserIsAllowedToscheduleForTheDuration = data => {
    if (!data) return false;
    const blueSquares = Number(infringements?.length) || 0;
    const numberOfWeeks = Number(data);
    let scheduledVacation = 0;

    allRequests[userId]?.forEach(element => {
      scheduledVacation += Number(element.duration);
    });

    const infringementsAndScheduledTimeOff = scheduledVacation + blueSquares;
    const hasRolePermission = user.role === 'Administrator' || user.role === 'Owner';

    if (
      infringementsAndScheduledTimeOff + numberOfWeeks > 4 &&
      !hasRolePermission &&
      !canManageTimeOffRequests
    ) {
      setAllowedDurationData({
        numberOfScheduledReasons: allRequests[userId]?.length || 0,
        durationOfScheduledReasons: scheduledVacation,
        blueSquares: blueSquares || 0,
      });
      setAllowedDurationModal(true);
      return true;
    }
    return false;
  };

  const handleAddRequestDataChange = e => {
    e.preventDefault();
    const { name, value } = e.target;
    if (name === 'numberOfWeeks') {
      if (checkIfUserIsAllowedToscheduleForTheDuration(value)) return;
    }
    setRequestData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const getDateWithoutTimeZone = date => {
    const newDateObject = new Date(date);
    const day = newDateObject.getDate();
    const month = newDateObject.getMonth() + 1;
    const year = newDateObject.getFullYear();
    return moment(`${month}-${day}-${year}`, 'MM-DD-YYYY').format('YYYY-MM-DD');
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

    if (allRequests[userId]?.length > 0) {
      const isAnyOverlapingRequests = allRequests[userId].some(request => {
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
          dateOfLeaveError: 'this request overlaps with other existing requests',
        }));
        return false;
      }
    }
    return true;
  };
  // checks if reason for leave is not empty and if it has over 10 words
  const validateReasonForLeave = data => {
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
    return true;
  };
  // checks if duration is not empty,negative or 0
  const validateNumberOfWeeks = data => {
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
    return true;
  };

  const toggleConfirmationModal = () => {
    setConfirmationModal(prev => !prev);
  };

  const toggleDeleteConfirmationModal = () => {
    setDeleteConfirmationModal(prev => !prev);
  };

  const toggleDurationInfoModal = () => {
    setAllowedDurationModal(prev => !prev);
  };

  const getWeekIntervals = data => {
    const dateOfLeaveStr = getDateWithoutTimeZone(data.dateOfLeave);
    const intervals = [];
    let startDate = moment(dateOfLeaveStr);
    for (let i = 0; i < data.numberOfWeeks; i++) {
      const endDate = startDate.clone().endOf('week');
      intervals.push([startDate.format('MM-DD-YYYY'), endDate.format('MM-DD-YYYY')]);
      startDate = startDate.add(1, 'week').startOf('week');
    }

    return { intervals, startDate };
  };

  const filterSunday = date => {
    const day = date.getDay();
    return day === 0;
  };

  const handleSaveReason = e => {
    e.preventDefault();
    setRequestDataErrors(initialRequestDataErrors);

    if (!validateDateOfLeave(requestData)) return;
    if (!validateDateIsNotBeforeStartOfCurrentWeek(requestData)) return;
    if (!checkIfRequestOverlapsWithOtherRequests(requestData)) return;
    if (!validateNumberOfWeeks(requestData)) return;
    if (!validateReasonForLeave(requestData)) return;

    const { intervals, startDate } = getWeekIntervals(requestData);
    setConfirmationModalData({
      offTimeWeeks: intervals,
      returnDate: startDate.format('MM-DD-YYYY'),
      reasonForLeave: requestData.reasonForLeave,
    });
    toggleConfirmationModal();
  };

  const handelConfirmReason = () => {
    const data = {
      requestFor: userId,
      reason: requestData.reasonForLeave,
      startingDate: getDateWithoutTimeZone(requestData.dateOfLeave),
      duration: requestData.numberOfWeeks,
    };
    dispatch(addTimeOffRequestThunk(data));
    setRequestData(initialRequestData);
    toggleConfirmationModal();
  };

  const handleDeleteRequest = id => {
    toggleDeleteConfirmationModal();
    setRequestTodelete(id);
  };

  const handelDeleteConfirmReason = () => {
    dispatch(deleteTimeOffRequestThunk(requestTodelete));
    setRequestTodelete('');
    toggleDeleteConfirmationModal();
  };

  const sortRequests = (a, b) => {
    const momentA = moment(a.startingDate, 'YYYY-MM-DD');
    const momentB = moment(b.startingDate, 'YYYY-MM-DD');
    return momentA - momentB;
  };

  const durationExplanationText = data => {
    const { numberOfScheduledReasons, blueSquares, durationOfScheduledReasons } = data;

    const transitionWord = numberOfScheduledReasons > 0 && blueSquares > 0 ? ` and ` : '';
    const scheduledReasonsText =
      numberOfScheduledReasons > 0
        ? `${numberOfScheduledReasons} scheduled ${
            numberOfScheduledReasons > 1 ? 'reasons' : 'reason'
          } for a duration of ${durationOfScheduledReasons} ${
            durationOfScheduledReasons > 1 ? 'weeks' : 'week'
          }`
        : '';

    const blueSquaresText =
      blueSquares > 0 ? ` ${blueSquares} blue ${blueSquares > 1 ? 'squares' : 'square'}` : '';

    const allowedPeriodText = `. Therefore,  you are only allowed to schedule a reason for no more than ${4 -
      blueSquares -
      durationOfScheduledReasons} ${
      4 - blueSquares - durationOfScheduledReasons > 1 ? 'weeks' : 'week'
    }`;

    const finalText =
      scheduledReasonsText === '' && blueSquaresText === ''
        ? `You are only allowed to schedule reason for no more than 4 Weeks.`
        : `You have ${scheduledReasonsText} ${transitionWord} ${blueSquaresText}${allowedPeriodText}.`;

    return finalText;
  };

  return (
    <>
      {checkIfUserCanScheduleTimeOff() && (
        <>
          <Modal.Header closeButton={true} className={darkMode ? 'bg-space-cadet' : ''}>
            <Modal.Title className="centered-container">
              <div className="centered-text mt-0 p1">Choose to Use a Blue Square</div>
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSaveReason}>
            <Modal.Body className={darkMode ? 'bg-yinmn-blue' : ''}>
              <Form.Group className="mb-0" controlId="exampleForm.ControlTextarea1">
                <Form.Label className={`mb-3 ${darkMode ? 'text-light' : ''}`}>
                  {` Need to take time off for an emergency or vacation? That's no problem. The system
                  will still issue you a blue square but scheduling here will note this reason on it
                  so it's clear you chose to use one (vs receiving one for missing something) and
                  let us know in advance. Blue squares are meant for situations like this and we allow the use and scheduling of 4 a year.`}
                </Form.Label>
                <Form.Label className={darkMode ? 'text-light' : ''}>
                  {`Select the Sunday of the week you'll be leaving (If you'll be absent this week,
                  choose the Sunday of current week):`}
                </Form.Label>
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
                  className="form-control"
                  wrapperClassName="w-100"
                />
                <Form.Text className="text-danger pl-1">
                  {requestDataErrors.dateOfLeaveError}
                </Form.Text>
                <Form.Label className={darkMode ? 'text-light' : ''}>
                  Enter the duration of your absence (In Weeks):
                </Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter duration in weeks"
                  name="numberOfWeeks"
                  value={requestData.numberOfWeeks}
                  min="0"
                  step="1"
                  onChange={e => {
                    const value = e.target.value;
                    if (value === '' || /^[0-9]+$/.test(value)) {
                      handleAddRequestDataChange(e);
                    }
                  }}
                />
                <Form.Text className="text-danger pl-1">
                  {requestDataErrors.numberOfWeeksError}
                </Form.Text>
                <Form.Label className={`mt-1 ${darkMode ? 'text-light' : ''}`}>
                  What is your reason for requesting this time off?
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="reasonForLeave"
                  className="w-100 user-time-off-scheduler-reason-input"
                  // controlId=""
                  placeholder="Please be detailed in describing your reason and, if it is different than your scheduled Sunday, include the expected date you’ll return to work."
                  value={requestData.reasonForLeave}
                  onChange={e => handleAddRequestDataChange(e)}
                />
                <Form.Text className="text-danger pl-1">
                  {requestDataErrors.reasonForLeaveError}
                </Form.Text>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer className={darkMode ? 'bg-yinmn-blue' : ''}>
              <Button
                variant="secondary"
                onClick={handleClose}
                style={darkMode ? boxStyleDark : boxStyle}
              >
                Close
              </Button>
              <Button
                variant="primary"
                type="submit"
                title="To Save - add a new reason or edit an existing reason. 
          Clicking 'Save' will generate an email to you and One Community as a record of this request."
                style={darkMode ? boxStyleDark : boxStyle}
              >
                Save
              </Button>
              <NestedModal
                isOpen={confirmationModal}
                toggle={toggleConfirmationModal}
                className={darkMode ? 'text-light dark-mode' : ''}
              >
                <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
                  <Container>
                    <Row>
                      <Col className="mb-1">
                        The time off will be scheduled for the following
                        {confirmationModalData.offTimeWeeks?.length > 1 ? ` weeks:` : ` week:`}
                      </Col>
                    </Row>
                    {confirmationModalData.offTimeWeeks?.length > 0 && (
                      <Row className="pl-2">
                        <Col className="mb-2 font-italic">
                          {confirmationModalData.offTimeWeeks.map((week, index) => (
                            <li key={index}>
                              <b>{`From `}</b>
                              {week[0]}
                              <b>{` To `}</b>
                              {week[1]}
                            </li>
                          ))}
                        </Col>
                      </Row>
                    )}

                    <Row>
                      <Col>Due to the reason of:</Col>
                    </Row>
                    <Row className="pl-2">
                      <Col className="mb-2 font-italic">
                        <li>{confirmationModalData.reasonForLeave}</li>
                      </Col>
                    </Row>
                    <Row>
                      <Col>The return day is:</Col>
                    </Row>
                    <Row className="pl-2">
                      <Col className="mb-2 font-italic">
                        <li>
                          <b>{`On `}</b>
                          {confirmationModalData.returnDate}
                        </li>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        Please review the details of the request before confirming your selection.
                        Once confirmed, an email will be sent to you and your manager.
                      </Col>
                    </Row>
                  </Container>
                </ModalBody>
                <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
                  <Button variant="primary" onClick={handelConfirmReason}>
                    Confirm
                  </Button>
                  <Button variant="secondary" onClick={toggleConfirmationModal}>
                    Cancel
                  </Button>
                </ModalFooter>
              </NestedModal>
              <NestedModal
                isOpen={allowedDurationModal}
                toggle={toggleDurationInfoModal}
                className={darkMode ? 'text-light dark-mode' : ''}
              >
                <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
                  <Container>
                    <Row>{durationExplanationText(allowedDurationData)}</Row>
                  </Container>
                </ModalBody>
                <ModalFooter className={darkMode ? 'text-light' : ''}>
                  <Button variant="secondary" onClick={toggleDurationInfoModal}>
                    Close
                  </Button>
                </ModalFooter>
              </NestedModal>
            </Modal.Footer>
          </Form>
        </>
      )}
      {allRequests[userId]?.length > 0 && (
        <>
          <Modal.Header
            closeButton={!checkIfUserCanScheduleTimeOff()}
            style={{ borderTop: '1px solid #dee2e6' }}
          >
            {' '}
            <Modal.Title className="centered-container">
              <div className="centered-text mt-0">Scheduled Time Off</div>
            </Modal.Title>
          </Modal.Header>
          <Modal.Footer>
            <Container
              style={{
                overflowY: 'auto',
                overflowX: 'hidden',
                maxHeight: ContainerMaxHeight,
                paddingLeft: '0px',
              }}
              id="user-time-off-request-list"
            >
              {allRequests[userId]
                .slice()
                .sort(sortRequests)
                .map(request => (
                  <ScheduleReasonModalCard
                    key={request._id}
                    request={request}
                    handleDeleteRequest={handleDeleteRequest}
                  />
                ))}
            </Container>
            <NestedModal isOpen={deleteConfirmationModal} toggle={toggleDeleteConfirmationModal}>
              <ModalBody>
                <Container>
                  <Row className="mt-3">
                    <Col className="mb-1">
                      <b>Are you sure you want to delete the scheduled time off?</b>
                    </Col>
                  </Row>
                  <Row>
                    {' '}
                    <Col className="mb-1">
                      Once you confirm, an email will be sent to you and your manager to notify them
                      of the update.
                    </Col>
                  </Row>{' '}
                </Container>
              </ModalBody>
              <ModalFooter>
                <Button variant="primary" onClick={handelDeleteConfirmReason}>
                  Confirm
                </Button>
                <Button variant="secondary" onClick={toggleDeleteConfirmationModal}>
                  Cancel
                </Button>
              </ModalFooter>
            </NestedModal>
          </Modal.Footer>
        </>
      )}
    </>
  );
};

export default React.memo(ScheduleReasonModal);
