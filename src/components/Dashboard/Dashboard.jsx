import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import { useEffect, useState } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Col, Container, Row } from 'reactstrap';
import { updateSummaryBarData } from '~/actions/dashboardActions';
import {
  DEV_ADMIN_ACCOUNT_CUSTOM_WARNING_MESSAGE_DEV_ENV_ONLY,
  DEV_ADMIN_ACCOUNT_EMAIL_DEV_ENV_ONLY,
  PROTECTED_ACCOUNT_MODIFICATION_WARNING_MESSAGE,
} from '~/utils/constants';
import { cantUpdateDevAdminDetails } from '~/utils/permissions';
import '../../App.module.css';
import FeedbackModal from '../FeedbackModal/FeedbackModal';
import Leaderboard from '../LeaderBoard';
import SummaryBar from '../SummaryBar/SummaryBar';
import Timelog from '../Timelog/Timelog';
import WeeklySummary from '../WeeklySummary/WeeklySummary';
import TimeOffRequestDetailModal from './TimeOffRequestDetailModal';
import { getQuestionnaireStatus } from '../HGNForm/HGNQuestionnarieRemainder/services/questionnaireService';
import QuestionnaireReminder from '../HGNForm/HGNQuestionnarieRemainder/components/QuestionnaireReminder';

export function Dashboard(props) {
  const [popup, setPopup] = useState(false);
  const [filteredUserTeamIds, setFilteredUserTeamIds] = useState([]);
  const [summaryBarData, setSummaryBarData] = useState(null);

  const { match, authUser, location, history } = props;

  const checkSessionStorage = () => JSON.parse(sessionStorage.getItem('viewingUser')) ?? false;

  const [viewingUser, setViewingUser] = useState(checkSessionStorage);

  const [displayUserId, setDisplayUserId] = useState(
    match.params.userId || viewingUser?.userId || authUser.userid,
  );

  const isNotAllowedToEdit = cantUpdateDevAdminDetails(viewingUser?.email, authUser.email);
  const darkMode = useSelector(state => state.theme.darkMode);
  const dispatch = useDispatch();

  const toggle = () => {
    if (isNotAllowedToEdit) {
      const warningMessage =
        viewingUser?.email === DEV_ADMIN_ACCOUNT_EMAIL_DEV_ENV_ONLY
          ? DEV_ADMIN_ACCOUNT_CUSTOM_WARNING_MESSAGE_DEV_ENV_ONLY
          : PROTECTED_ACCOUNT_MODIFICATION_WARNING_MESSAGE;

      toast.warn(warningMessage);
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

  const [questionnaireEligible, setQuestionnaireEligible] = useState(false);
  const [questionnaireCompleted, setQuestionnaireCompleted] = useState(null);
  const [questionnaireLoading, setQuestionnaireLoading] = useState(true);

  const checkQuestionnaireStatus = async userIdToCheck => {
    if (!userIdToCheck) {
      setQuestionnaireLoading(false);
      return;
    }

    setQuestionnaireLoading(true);

    try {
      // Check whether the user has active or invited Dropbox access.
      const accessResponse = await axios.get(ENDPOINTS.DROPBOX_CHECK_ACCESS, {
        params: {
          userId: userIdToCheck,
        },
      });

      const eligible = accessResponse.data?.eligible === true;

      setQuestionnaireEligible(eligible);

      // Check questionnaire completion only for eligible users.
      if (eligible) {
        const data = await getQuestionnaireStatus(userIdToCheck);
        setQuestionnaireCompleted(data.completed);
      } else {
        setQuestionnaireCompleted(null);
      }
    } catch (error) {
      console.error(
        'Error checking Dropbox eligibility or questionnaire status:',
        error.response?.data || error.message,
      );

      // API errors must not restrict Dashboard access.
      setQuestionnaireEligible(false);
      setQuestionnaireCompleted(null);
    } finally {
      setQuestionnaireLoading(false);
    }
  };

  useEffect(() => {
    if (displayUserId) {
      void checkQuestionnaireStatus(displayUserId);
    }
  }, [displayUserId]);

  useEffect(() => {
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  useEffect(() => {
    dispatch(updateSummaryBarData({ summaryBarData }));
  }, [summaryBarData]);

  useEffect(() => {
    const permissionDeniedMessage = location?.state?.permissionDeniedMessage;

    if (!permissionDeniedMessage) {
      return;
    }

    toast.error(`Permission Denied: ${permissionDeniedMessage}`);

    const remainingState = { ...location.state };
    delete remainingState.permissionDeniedMessage;

    history?.replace({
      ...location,
      state: Object.keys(remainingState).length ? remainingState : undefined,
    });
  }, [history, location]);

  // Wait while checking Dropbox eligibility and questionnaire status.
  if (questionnaireLoading) {
    return (
      <Container fluid className="text-center mt-5">
        <p>Loading dashboard...</p>
      </Container>
    );
  }

  // Show the questionnaire reminder only to eligible users
  // who have not completed the questionnaire.
  if (questionnaireEligible && questionnaireCompleted === false) {
    return <QuestionnaireReminder onComplete={() => history.push('/hgnform')} />;
  }

  // All other users can access the normal Dashboard.
  return (
    <Container fluid className={darkMode ? 'bg-oxford-blue' : ''}>
      <FeedbackModal />
      <SummaryBar
        displayUserId={displayUserId}
        toggleSubmitForm={toggle}
        role={authUser.role}
        summaryBarData={summaryBarData}
        isNotAllowedToEdit={isNotAllowedToEdit}
      />

      <Row className="w-100 ml-1">
        <Col lg={5} className="order-lg-2 order-2">
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
                displayUserEmail={viewingUser?.email}
                isNotAllowedToEdit={isNotAllowedToEdit}
                darkMode={darkMode}
              />
            </div>
          </div>

          <Leaderboard
            displayUserId={displayUserId}
            isNotAllowedToEdit={isNotAllowedToEdit}
            darkMode={darkMode}
            setFilteredUserTeamIds={setFilteredUserTeamIds}
          />
        </Col>

        <Col lg={7} className="left-col-dashboard order-lg-1 order-1">
          {popup && (
            <div className="my-2" id="weeklySum">
              <WeeklySummary
                displayUserId={displayUserId}
                setPopup={setPopup}
                userRole={authUser.role}
                isNotAllowedToEdit={isNotAllowedToEdit}
                darkMode={darkMode}
              />
            </div>
          )}

          <div className="my-2" id="wsummary">
            <Timelog
              isDashboard
              passSummaryBarData={setSummaryBarData}
              isNotAllowedToEdit={isNotAllowedToEdit}
              filteredUserTeamIds={filteredUserTeamIds}
            />
          </div>
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
