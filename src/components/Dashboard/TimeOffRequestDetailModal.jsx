import { Modal, ModalHeader, ModalBody, Row, Col, Container } from 'reactstrap';
import moment from 'moment';
import 'moment-timezone';
import { useSelector, useDispatch } from 'react-redux';
import { hideTimeOffRequestModal } from '../../actions/timeOffRequestAction';

const TimeOffRequestDetailModal = () => {
  const { isOpen, data } = useSelector(state => state.timeOffRequests.timeOffModal);
  const dispatch = useDispatch();
  const detailModalClose = () => {
    dispatch(hideTimeOffRequestModal());
  };

  const getWeekIntervals = data => {
    const dateOfLeaveStr = moment(data.startingDate)
      .tz('America/Los_Angeles')
      .format()
      .split('T')[0];
    const intervals = [];
    let startDate = moment(dateOfLeaveStr);
    for (let i = 0; i < data.duration; i++) {
      const endDate = startDate.clone().endOf('week');
      intervals.push([startDate.format('MM-DD-YYYY'), endDate.format('MM-DD-YYYY')]);
      startDate = startDate.add(1, 'week').startOf('week');
    }
    return [intervals, startDate];
  };

  return (
    <div>
      <Modal isOpen={isOpen} toggle={() => detailModalClose()} returnFocusAfterClose={true}>
        <ModalHeader toggle={() => detailModalClose()}>Time Off Details</ModalHeader>
        <ModalBody className="time-off-detail-modal">
          <Container>
            <Row>
              <Col className="mb-1">
                {data?.onVacation
                  ? `${data?.name} Is Not Available this Week`
                  : `${data?.name} Is Not Available Next Week`}
              </Col>
            </Row>
            <Row>
              <Col>
                {' '}
                {`${data?.name} is going to be absent for the following`}
                {getWeekIntervals(data)[0]?.length > 1 ? ` weeks:` : ` week:`}
              </Col>
            </Row>
            <Row className="pl-2">
              <Col className="mb-2 font-italic">
                {getWeekIntervals(data)[0].map((week, index) => (
                  <li key={index}>
                    <b>{`From `}</b>
                    {week[0]}
                    <b>{` To `}</b>
                    {week[1]}
                  </li>
                ))}
              </Col>
            </Row>
            <Row>
              <Col>Due to the reason of:</Col>
            </Row>
            <Row className="pl-2">
              <Col className="mb-2 font-italic">
                <li>{data?.reason}</li>
              </Col>
            </Row>
            <Row>
              <Col>The return day is:</Col>
            </Row>
            <Row className="pl-2">
              <Col className="mb-2 font-italic">
                <li>
                  <b>{`On `}</b>
                  {getWeekIntervals(data)[1].format('MM-DD-YYYY')}
                </li>
              </Col>
            </Row>
          </Container>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default TimeOffRequestDetailModal;
