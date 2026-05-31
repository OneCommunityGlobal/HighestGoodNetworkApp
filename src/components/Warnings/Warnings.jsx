import axios from 'axios';
import moment from 'moment';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Alert, Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import hasPermission from '~/utils/permissions';
import { ENDPOINTS } from '~/utils/URL';
import {
  deleteWarningsById,
  getWarningsByUserId,
  postWarningByUserId,
} from '../../actions/warnings';
import WarningModal from './modals/WarningModal';
import WarningTrackerModal from './modals/WarningTrackerModal';
import WarningIcons from './WarningIcons';
import styles from './Warnings.module.css';
// Better Descriptions (“i” = ,ltd = Please be more specific in your time log descriptions.)
// Log Time to Tasks (“i” = ,lttt = Please log all time working on specific tasks to those tasks rather than the general category. )
// Log Time as You Go (“i” = ,ltayg = Reminder to please log your time as you go. At a minimum, please log daily any time you work.)
// Log Time to Action Items (“i” = ,ltayg = Reminder to please log your time as you go. At a minimum, please log daily any time you work.)
// Intangible Time Log w/o Reason (“i” = ,itlr = The timer should be used for all time logged, so any time logged as intangible must also include in the time log description an explanation for why you didn’t use the timer.

export default function Warning({
  personId,
  username,
  userRole,
  displayUser,
  showTrackers = false,
}) {
  const dispatch = useDispatch();
  const [usersWarnings, setUsersWarnings] = useState([]);

  const [toggleWarningTrackerModal, setToggleWarningTrackerModal] = useState(false);
  const [toggle, setToggle] = useState(false);
  const [toggleWarningModal, setToggleWarningModal] = useState(false);
  const [selectedWarning, setSelectedWarning] = useState(null);
  const [error, setError] = useState(null);
  const rolesAllowedToTracking = ['Administrator', 'Owner'];
  const canViewTrackerButton =
    rolesAllowedToTracking.includes(userRole) || dispatch(hasPermission('viewTrackingOverview'));
  const canEditWarning =
    rolesAllowedToTracking.includes(userRole) ||
    dispatch(hasPermission('addWarningTracker')) ||
    dispatch(hasPermission('deactivateWarningTracker')) ||
    dispatch(hasPermission('reactivateWarningTracker')) ||
    dispatch(hasPermission('deleteWarningTracker'));

  const fetchUsersWarningsById = async () => {
    dispatch(getWarningsByUserId(personId))
      .then(res => {
        if (!res || res.error) {
          setUsersWarnings([]);
          return;
        }
        setUsersWarnings(res);
      })
      .catch(() => {
        setUsersWarnings([]);
      });
  };

  const handleToggle = () => {
    if (!toggle) fetchUsersWarningsById();
    setToggle(prev => !prev);
  };

  useEffect(() => {
    if (showTrackers) {
      setToggle(true);
      if (usersWarnings.length === 0) {
        const delay = ((personId?.charCodeAt(0) ?? 0) * 20) % 5000;
        const timer = setTimeout(() => {
          fetchUsersWarningsById();
        }, delay);
        return () => clearTimeout(timer);
      }
    } else {
      setToggle(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTrackers]);

  const handleDeleteWarning = async warningId => {
    dispatch(deleteWarningsById(warningId, personId)).then(res => {
      if (!res || res.error) {
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
    const { firstName, lastName, email } = displayUser || {};
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
    let toastMessage = '';
    dispatch(postWarningByUserId(warningData))
      .then(res => {
        if (res.error) {
          setError(res);
          setUsersWarnings([]);
          return;
        }
        if (warningData.color === 'blue') {
          toastMessage = 'Successfully logged and tracked';
        } else if (warningData.color === 'yellow') {
          toastMessage = 'Warning successfully logged and sent by email.';
        } else {
          let description = warningData.description;
          if (warningData.description === 'Blu Sq Rmvd - For No Summary') {
            description = `not submitting a weekly summary (${warningData.description})`;
          } else if (warningData.description === 'Blu Sq Rmvd - Hrs Close Enoug') {
            description = `completing most of your hours but not all (${warningData.description})`;
          }
          const newBlueSquare = {
            date: moment(warningData.date).format('YYYY-MM-DD'),
            description: `Issued a blue square for being reminded/warned for the ${
              selectedWarning.numberOfWarnings + 1 === 3
                ? `${selectedWarning.numberOfWarnings + 1}rd`
                : `${selectedWarning.numberOfWarnings + 1}th`
            } time for "${description}".`,
            createdDate: moment().format('YYYY-MM-DD'),
          };
          axios
            .post(ENDPOINTS.ADD_BLUE_SQUARE(warningData.userId), {
              blueSquare: newBlueSquare,
            })
            .then(res => {
              toast.success('Successfully logged and Blue Square issued on profile and by email.');
            })
            .catch(error => {
              // eslint-disable-next-line no-console
              console.log('error in adding bluesquare', error);
              toast.error('Failed to add Blue Square!');
            });
        }
        setUsersWarnings(res);
        if (toastMessage) {
          toast.success(toastMessage);
        }
      })
      .catch(() => {});
  };

  const warnings = toggle
    ? usersWarnings.map(warning => (
        <div className={`${styles['warning-item-container']}`} key={warning.title}>
          <div className={`${styles['warning-wrapper']}`}>
            <p className={`${styles['warning-text']}`}> {warning.title}</p>
            <WarningIcons
              warnings={warning.warnings}
              warningText={warning.title}
              handleWarningIconClicked={handlePostWarningDetails}
              handleShowWarningModal={handleShowWarningModal}
              numberOfWarnings={warning.warnings.length}
            />
          </div>
        </div>
      ))
    : null;

  return (
    <div className={`${styles['warnings-container']}`}>
      <div className={styles.button__container}>
        {canViewTrackerButton && (
          <Button
            className={`btn btn-warning warning-btn ${styles.tracking__btn}`}
            size="sm"
            onClick={handleToggle}
          >
            {toggle ? 'Hide' : 'Tracking'}
          </Button>
        )}

        {canEditWarning && (
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
          numberOfWarnings={selectedWarning.numberOfWarnings}
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
          userRole={userRole}
        />
      )}

      <div className={`${styles['warning-wrapper']}`}> {warnings}</div>
      <div className={`${styles['error-container']}`}>
        {error && (
          <Alert key="warning" variant="warning">
            {error.error}
          </Alert>
        )}
      </div>
    </div>
  );
}

Warning.propTypes = {
  personId: PropTypes.string.isRequired,
  username: PropTypes.string,
  userRole: PropTypes.string,
  displayUser: PropTypes.object,
  showTrackers: PropTypes.bool,
};
