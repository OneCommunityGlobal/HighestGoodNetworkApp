import { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Container,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import { connect } from 'react-redux';
import Leaderboard from '../LeaderBoard';
import WeeklySummary from '../WeeklySummary/WeeklySummary';
import Badge from '../Badge';
import Timelog from '../Timelog/Timelog';
import SummaryBar from '../SummaryBar/SummaryBar';
import PopUpBar from '../PopUpBar';
import '../../App.css';
import { getTimeZoneAPIKey } from '../../actions/timezoneAPIActions';

export function Dashboard(props) {
  const [popup, setPopup] = useState(false);
  const [summaryBarData, setSummaryBarData] = useState(null);
  const [userProfile, setUserProfile] = useState(undefined);
  const { match, auth } = props;
  const userId = match.params.userId || auth.user.userid;
  const [isModalVisible, setModalVisible] = useState(true);
  const [modalContent, setModalContent] = useState('');

  const toggle = () => {
    setPopup(!popup);
    setTimeout(() => {
      const elem = document.getElementById('weeklySum');
      if (elem) {
        elem.scrollIntoView();
      }
    }, 150);
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react/destructuring-assignment
    props.getTimeZoneAPIKey();
  }, []);

  useEffect(() => {
    const {
      match: { params },
      getUserProfile,
    } = props;
    if (params && params.userId && userId !== params.userId) {
      getUserProfile(params.userId);
    }
  }, [props]);

  return (
    <Container fluid>
      <Modal isOpen={isModalVisible} toggle={toggleModal} backdrop="static">
        <ModalHeader toggle={closeModal}>Teamwork Deadline Reminder</ModalHeader>
        <ModalBody>
          <div>
            <p>
              If you are seeing this, it’s because you are on a team! As a member of a team, you
              need to turn in your work 24 hours earlier, i.e. FRIDAY night at midnight Pacific
              Time. This is so your manager has time to review it and submit and report on your
              entire team’s work by the usual Saturday night deadline. For any work you plan on
              completing Saturday, please take pictures as best you can and include it in your
              summary as if it were already done. By dismissing this notice, you acknowledge you
              understand and will do this.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={closeModal}>
            Dismiss
          </Button>
        </ModalFooter>
      </Modal>

      {match.params.userId && auth.user.userid !== match.params.userId ? <PopUpBar /> : ''}
      <SummaryBar
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        asUser={userId}
        toggleSubmitForm={toggle}
        role={auth.user.role}
        summaryBarData={summaryBarData}
      />

      <Row>
        <Col lg={{ size: 7 }}>&nbsp;</Col>
        <Col lg={{ size: 5 }}>
          <div className="row justify-content-center">
            <div
              role="button"
              className="mt-3 mb-5 text-center"
              onClick={toggle}
              onKeyDown={toggle}
              tabIndex="0"
            >
              <WeeklySummary isDashboard isPopup={popup} asUser={userId} />
            </div>
          </div>
        </Col>
      </Row>
      <Row>
        <Col lg={{ size: 5 }} className="order-sm-12">
          <Leaderboard asUser={userId} />
        </Col>
        <Col lg={{ size: 7 }} className="left-col-dashboard order-sm-1">
          {popup ? (
            <div className="my-2">
              <div id="weeklySum">
                <WeeklySummary asUser={userId} setPopup={setPopup} />
              </div>
            </div>
          ) : null}
          <div className="my-2" id="wsummary">
            <Timelog isDashboard asUser={userId} passSummaryBarData={setSummaryBarData} />
          </div>
          <Badge userId={userId} role={auth.user.role} />
        </Col>
      </Row>
    </Container>
  );
}

const mapStateToProps = state => ({
  auth: state.auth,
});

export default connect(mapStateToProps, {
  getTimeZoneAPIKey,
})(Dashboard);
