import { Modal, ModalHeader, ModalBody, Row, Col, Container } from 'reactstrap';
import React from 'react';
import moment from 'moment';
import 'moment-timezone';
import { useSelector, useDispatch } from 'react-redux';
import { hideTimeOffRequestModal } from '../../actions/timeOffRequestAction';

// ErrorBoundary for function components
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    if (window.logger) window.logger.logError(error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <div style={{ color: 'red', padding: 20 }}>Something went wrong in TimeOffRequestDetailModal. Please refresh the page or contact support.</div>;
    }
    return this.props.children;
  }
}

const TimeOffRequestDetailModal = () => {
  const darkMode = useSelector(state => state?.theme?.darkMode ?? false);
  const { isOpen = false, data = null } = useSelector(state => state?.timeOffRequests?.timeOffModal ?? {});
  const dispatch = useDispatch();
  const detailModalClose = () => {
    dispatch(hideTimeOffRequestModal());
  };

  const getWeekIntervals = req => {
    if (!req) return [[], null];
    const dateOfLeaveStr = moment(req.startingDate)
      .tz('America/Los_Angeles')
      .format()
      .split('T')[0];
    const intervals = [];
    let startDate = moment(dateOfLeaveStr);
    for (let i = 0; i < (req.duration || 0); i++) {
      const endDate = startDate.clone().endOf('week');
      intervals.push([startDate.format('MM-DD-YYYY'), endDate.format('MM-DD-YYYY')]);
      startDate = startDate.add(1, 'week').startOf('week');
    }
    return [intervals, startDate];
  };

  // Early return for missing critical data
  if (!data) {
    return <div style={{ padding: 20 }}>Loading time off request details...</div>;
  }

  return (
    <div>
      <Modal
        isOpen={isOpen}
        toggle={() => detailModalClose()}
        returnFocusAfterClose={true}
        className={darkMode ? 'dark-mode text-light' : ''}
      >
        <ModalHeader toggle={() => detailModalClose()} className={darkMode ? 'bg-space-cadet' : ''}>
          Time Off Details
        </ModalHeader>
        <ModalBody className={`${darkMode ? 'bg-yinmn-blue' : ''}`}>
          {data?.leaderboard ? (
            <>
              <Container>
                <Row>
                  <Col className="mb-1">{`${data?.name ?? ''} has the following time off requests:`}</Col>
                </Row>
              </Container>
              {data.requests?.map(req => (
                <Container className="time-off-detail-modal-card-container" key={req._id}>
                  <Row className="pl-2">
                    <Col className="mb-2 font-italic">
                      {getWeekIntervals(req)[0].map((week, index) => (
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
                      <li>{req?.reason ?? ''}</li>
                    </Col>
                  </Row>
                  <Row>
                    <Col>The return day is:</Col>
                  </Row>
                  <Row className="pl-2">
                    <Col className="mb-2 font-italic">
                      <li>
                        <b>{`On `}</b>
                        {getWeekIntervals(req)[1]?.format('MM-DD-YYYY')}
                      </li>
                    </Col>
                  </Row>
                </Container>
              ))}
            </>
          ) : (
            <Container>
              <Row>
                <Col className="mb-1">
                  {data?.onVacation
                    ? `${data?.name ?? ''} Is Not Available this Week`
                    : `${data?.name ?? ''} Is Not Available Next Week`}
                </Col>
              </Row>
              <Row>
                <Col>
                  {' '}
                  {`${data?.name ?? ''} is going to be absent for the following`}
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
                  <li>{data?.reason ?? ''}</li>
                </Col>
              </Row>
              <Row>
                <Col>The return day is:</Col>
              </Row>
              <Row className="pl-2">
                <Col className="mb-2 font-italic">
                  <li>
                    <b>{`On `}</b>
                    {getWeekIntervals(data)[1]?.format('MM-DD-YYYY')}
                  </li>
                </Col>
              </Row>
            </Container>
          )}
        </ModalBody>
      </Modal>
    </div>
  );
};

const TimeOffRequestDetailModalWithErrorBoundary = props => (
  <ErrorBoundary>
    <TimeOffRequestDetailModal {...props} />
  </ErrorBoundary>
);

export default TimeOffRequestDetailModalWithErrorBoundary;
