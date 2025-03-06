import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button, Alert } from 'react-bootstrap';
import hasPermission from 'utils/permissions';
import {
  getWarningsByUserId,
  postWarningByUserId,
  deleteWarningsById,
} from '../../actions/warnings';
import WarningTrackerModal from './modals/WarningTrackerModal';
import WarningItem from './WarningItem';
import './Warnings.css';
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
  const [error, setError] = useState(null);
  const rolesAllowedToTracking = ['Administrator', 'Owner'];
  const isAllowedToTracking =
    rolesAllowedToTracking.includes(userRole) || dispatch(hasPermission('viewTrackingOverview'));
  const canViewTrackerButton =
    rolesAllowedToTracking.includes(userRole) ||
    dispatch(hasPermission('addWarningTracker')) ||
    dispatch(hasPermission('deactivateWarningTracker')) ||
    dispatch(hasPermission('deleteWarningTracker'));

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

    const data = {
      userId: personId,
      iconId: id,
      color,
      date: dateAssigned,
      description: warningText,
      monitorData,
    };

    dispatch(postWarningByUserId(data)).then(res => {
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
        <WarningItem
          key={warning.title}
          warnings={warning.warnings}
          warningText={warning.title}
          handlePostWarningDetails={handlePostWarningDetails}
          username={username}
          submitWarning={handlePostWarningDetails}
          handleDeleteWarning={handleDeleteWarning}
          userRole={userRole}
        />
      ));

  return (
    isAllowedToTracking &&
    (userRole === 'Administrator' || userRole === 'Owner' || userRole === 'Manager') && (
      <div className="warnings-container">
        <div className="button__container">
          <Button
            className="btn btn-warning warning-btn tracking__btn"
            size="sm"
            onClick={handleToggle}
          >
            {toggle ? 'Hide' : 'Tracking'}
          </Button>

          {canViewTrackerButton && (
            <Button
              className="btn"
              size="sm"
              onClick={() => setToggleWarningTrackerModal(prev => !prev)}
            >
              +/-
            </Button>
          )}
        </div>

        {toggleWarningTrackerModal && (
          <WarningTrackerModal
            toggleWarningTrackerModal={toggleWarningTrackerModal}
            personId={personId}
            setToggleWarningTrackerModal={setToggleWarningTrackerModal}
            getUsersWarnings={fetchUsersWarningsById}
            userRole={userRole}
          />
        )}

        <div className="warning-wrapper"> {warnings}</div>
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
