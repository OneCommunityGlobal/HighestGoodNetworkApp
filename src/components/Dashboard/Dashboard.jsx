import { useState, useEffect } from 'react';
import { Row, Col, Container } from 'reactstrap';
import { connect, useDispatch, useSelector } from 'react-redux';
import Leaderboard from '../LeaderBoard';
import WeeklySummary from '../WeeklySummary/WeeklySummary';
import Badge from '../Badge';
import Timelog from '../Timelog/Timelog';
import SummaryBar from '../SummaryBar/SummaryBar';
import '../../App.css';
import TimeOffRequestDetailModal from './TimeOffRequestDetailModal';
import { cantUpdateDevAdminDetails } from 'utils/permissions';
import { ENDPOINTS } from 'utils/URL';
import './Dashboard.css';
import axios from 'axios';
import { Modal, ModalHeader, ModalBody, Button } from 'reactstrap';

export function Dashboard(props) {
  const [popup, setPopup] = useState(false);
  const [summaryBarData, setSummaryBarData] = useState(null);
  const { authUser } = props;
  const [actualUserProfile, setActualUserProfile] = useState(null);
  const [showModal, setShowModal] = useState(false);


  const checkSessionStorage = () => JSON.parse(sessionStorage.getItem('viewingUser')) ?? false;
  const [viewingUser, setViewingUser] = useState(checkSessionStorage);
  const [displayUserId, setDisplayUserId] = useState(
    viewingUser ? viewingUser.userId : authUser.userid,
  );
  const isNotAllowedToEdit = cantUpdateDevAdminDetails(viewingUser?.email, authUser.email);
  const darkMode = useSelector(state => state.theme.darkMode);

  const toggle = () => {
    if (isNotAllowedToEdit) {
      alert('STOP! YOU SHOULDN’T BE TRYING TO CHANGE THIS. Please reconsider your choices.');
      return;
    }
    setPopup(!popup);
    setTimeout(() => {
      const elem = document.getElementById('weeklySum');
      if (elem) {
        elem.scrollIntoView();
      }
    }, 150);
  };

  const handleStorageEvent = () => {
    const sessionStorageData = checkSessionStorage();
    setViewingUser(sessionStorageData || false);
    setDisplayUserId(sessionStorageData ? sessionStorageData.userId : authUser.userid);
  };

  useEffect(() => {
    window.addEventListener('storage', handleStorageEvent);
    return () => {
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  const getUserData = async () => {

    try {
      const url = ENDPOINTS.USER_PROFILE(authUser.userid);
      const allUserInfo = await axios.get(url).then(res => res.data)

      if (allUserInfo.permissions.frontPermissions.includes('showModal')) {
        setShowModal(true);
        setActualUserProfile(allUserInfo);
      }

    } catch (error) {
      console.error("Erro", error);
    }

  }

  const handleCloseModal = async () => {
    if (actualUserProfile) {

      try {
        const userId = actualUserProfile?._id;
        const url = ENDPOINTS.USER_PROFILE(userId);

        const FilteredPermission = actualUserProfile.permissions.frontPermissions.filter(permission => permission !== 'showModal');
        const newUserInfo = { ...actualUserProfile, permissions: { frontPermissions: FilteredPermission } };

        await axios.put(url, newUserInfo);

        setActualUserProfile(null);
      } catch (error) {
        console.error("Erro", error);
      }
    }
    setShowModal(false);
  };

  useEffect(() => {

    getUserData()

  }, [authUser.userid])



  return (
    <Container fluid className={darkMode ? 'bg-oxford-blue' : ''}>
      <Modal isOpen={showModal} toggle={handleCloseModal} id="modal-content__new-role">
        <ModalHeader
          toggle={handleCloseModal}
          cssModule={{ 'modal-title': 'w-100 text-center my-auto' }}
        >
          Important Notification
        </ModalHeader>
        <ModalBody id="modal-body_new-role--padding">
          Your permissions have been updated. Please log out and log back in for the changes to take effect.
          <Button color="primary" className="mt-3" onClick={handleCloseModal}>Closer</Button>
        </ModalBody>
      </Modal>
      <SummaryBar
        displayUserId={displayUserId}
        toggleSubmitForm={toggle}
        role={authUser.role}
        summaryBarData={summaryBarData}
        isNotAllowedToEdit={isNotAllowedToEdit}
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
              <WeeklySummary
                isDashboard
                isPopup={popup}
                userRole={authUser.role}
                displayUserId={displayUserId}
                isNotAllowedToEdit={isNotAllowedToEdit}
                darkMode={darkMode}
              />
            </div>
          </div>
        </Col>
      </Row>
      <Row>
        <Col lg={{ size: 5 }} className="order-sm-12">
          <Leaderboard
            displayUserId={displayUserId}
            isNotAllowedToEdit={isNotAllowedToEdit}
            darkMode={darkMode}
          />
        </Col>
        <Col lg={{ size: 7 }} className="left-col-dashboard order-sm-1">
          {popup ? (
            <div className="my-2">
              <div id="weeklySum">
                <WeeklySummary
                  displayUserId={displayUserId}
                  setPopup={setPopup}
                  userRole={authUser.role}
                  isNotAllowedToEdit={isNotAllowedToEdit}
                  darkMode={darkMode}
                />
              </div>
            </div>
          ) : null}
          <div className="my-2" id="wsummary">
            <Timelog isDashboard passSummaryBarData={setSummaryBarData} isNotAllowedToEdit={isNotAllowedToEdit} />
          </div>
          <Badge
            userId={displayUserId}
            role={authUser.role}
            isNotAllowedToEdit={isNotAllowedToEdit}
          />
        </Col>
      </Row>
      <TimeOffRequestDetailModal isNotAllowedToEdit={isNotAllowedToEdit} />
    </Container>
  );
}

const mapStateToProps = state => ({
  authUser: state.auth.user,
  displayUserProfile: state.userProfile,
});

export default connect(mapStateToProps)(Dashboard);
