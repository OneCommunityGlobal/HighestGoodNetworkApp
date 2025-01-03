import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button, Alert } from 'react-bootstrap';
import {
  getWarningsByUserId,
  postWarningByUserId,
  deleteWarningsById,
} from '../../actions/warnings';
import WarningTrackerModal from './modals/WarningTrackerModal';

import WarningIcons from './WarningIcons';
import './Warnings.css';
import WarningModal from './modals/WarningModal';
// Better Descriptions (“i” = ,ltd = Please be more specific in your time log descriptions.)
// Log Time to Tasks (“i” = ,lttt = Please log all time working on specific tasks to those tasks rather than the general category. )
// Log Time as You Go (“i” = ,ltayg = Reminder to please log your time as you go. At a minimum, please log daily any time you work.)
// Log Time to Action Items (“i” = ,ltayg = Reminder to please log your time as you go. At a minimum, please log daily any time you work.)
// Intangible Time Log w/o Reason (“i” = ,itlr = The timer should be used for all time logged, so any time logged as intangible must also include in the time log description an explanation for why you didn’t use the timer.

export default function Warning({ personId, username, userRole, displayUser }) {
  const dispatch = useDispatch();
  const [usersWarnings, setUsersWarnings] = useState([]);

  const [toggleWarningTrackerModal, setToggleWarningTrackerModal] = useState(false);
  const [toggle, setToggle] = useState(false);
  const [toggleWarningModal, setToggleWarningModal] = useState(false);
  const [selectedWarning, setSelectedWarning] = useState(null);
  const [error, setError] = useState(null);

  const fetchUsersWarningsById = async () => {
    dispatch(getWarningsByUserId(personId)).then(res => {
      if (res.error) {
        setError(res);
        setUsersWarnings([]);
        return;
      }
      setUsersWarnings(res);
    });
  };

  const handleToggle = () => {
    setToggle(prev => !prev);
    fetchUsersWarningsById();
  };

  const handleDeleteWarning = async warningId => {
    dispatch(deleteWarningsById(warningId, personId)).then(res => {
      if (res.error) {
        setError(res);
        setUsersWarnings([]);
        return;
      }
      setUsersWarnings(res);
    });
  };

  const handleShowWarningModal = ({ id, deleteWarning, warningDetails }) => {
    const numberOfWarnings = usersWarnings.find(
      warning => warning.title === warningDetails.warningText,
    )?.warnings.length;

    setSelectedWarning({ ...warningDetails, id, deleteWarning, numberOfWarnings, username });
    setToggleWarningModal(prev => !prev);
  };
  const handlePostWarningDetails = async ({
    id,
    colorAssigned: color,
    todaysDate: dateAssigned,
    warningText,
  }) => {
    const { firstName, lastName, email } = displayUser;
    const monitorData = {
      firstName,
      lastName,
      email,
    };

    const warningData = {
      userId: personId,
      iconId: id,
      color,
      date: dateAssigned,
      description: warningText,
      monitorData,
    };

    dispatch(postWarningByUserId(warningData)).then(res => {
      if (res.error) {
        setError(res);
        setUsersWarnings([]);
        return;
      }

      setUsersWarnings(res);
    });
  };

  const warnings = !toggle
    ? null
    : usersWarnings.map(warning => (
        <div className="warning-item-container" key={warning.title}>
          <div className="warning-wrapper">
            <WarningIcons
              warnings={warning.warnings}
              warningText={warning.title}
              handleWarningIconClicked={handlePostWarningDetails}
              handleShowWarningModal={handleShowWarningModal}
              numberOfWarnings={warning.warnings.length}
            />
            <p className="warning-text"> {warning.title}</p>
          </div>
        </div>
      ));

  return (
    (userRole === 'Administrator' || userRole === 'Owner') && (
      <div className="warnings-container">
        <div className="button__container">
          <Button
            className="btn btn-warning warning-btn tracking__btn"
            size="sm"
            onClick={handleToggle}
          >
            {toggle ? 'Hide' : 'Tracking'}
          </Button>

          {userRole === 'Owner' && (
            <Button
              className="btn"
              size="sm"
              onClick={() => setToggleWarningTrackerModal(prev => !prev)}
            >
              +/-
            </Button>
          )}
        </div>

        {toggleWarningModal && (
          <WarningModal
            selectedWarning={selectedWarning}
            visible={toggleWarningModal}
            warning={selectedWarning}
            setToggleModal={setToggleWarningModal}
            handleDeleteWarning={handleDeleteWarning}
            handleIssueWarning={handlePostWarningDetails}
          />
        )}
        {toggleWarningTrackerModal && (
          <WarningTrackerModal
            toggleWarningTrackerModal={toggleWarningTrackerModal}
            personId={personId}
            setToggleWarningTrackerModal={setToggleWarningTrackerModal}
            getUsersWarnings={fetchUsersWarningsById}
          />
        )}

        <div className="warning-wrapper">{warnings}</div>
        <div className="error-container">
          {error && (
            <Alert key="warning" variant="warning">
              {error.error}
            </Alert>
          )}
        </div>
      </div>
    )
  );
}
