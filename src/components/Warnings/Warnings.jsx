import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button, Alert } from 'react-bootstrap';
import hasPermission from '~/utils/permissions';
import {
  getWarningsByUserId,
  postWarningByUserId,
  deleteWarningsById,
} from '../../actions/warnings';
import WarningTrackerModal from './modals/WarningTrackerModal';
import WarningIcons from './WarningIcons';
import styles from './Warnings.module.css';
import WarningModal from './modals/WarningModal';
import moment from 'moment';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '~/utils/URL';
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
    // console.log('warningData for dashboard warnings: ', warningData);
    let toastMessage = '';
    dispatch(postWarningByUserId(warningData))
      .then(res => {
        // console.log('res of adding warning to user: ', res);
        if (res.error) {
          setError(res);
          setUsersWarnings([]);
          return;
        }
        if (warningData.color === 'blue') {
          // console.log('enter blue warning');
          toastMessage = 'Successfully logged and tracked';
        } else if (warningData.color === 'yellow') {
          toastMessage = 'Warning successfully logged';
        } else {
          // seems the date part is wrong format, either use moment, or modify the given date with moment
          const newBlueSquare = {
            // date: warningData.date,
            date: moment(warningData.date).format('YYYY-MM-DD'),
            // description: warningData.description,
            description: `Issued a blue square for ${warningData.description} for the ${
              selectedWarning.numberOfWarnings + 1 === 3
                ? `${selectedWarning.numberOfWarnings + 1}rd`
                : `${selectedWarning.numberOfWarnings + 1}th`
            } time.`,
            // createdDate: moment
            //   .tz('America/Los_Angeles')
            //   .toISOString()
            //   .split('T')[0],
            createdDate: moment().format('YYYY-MM-DD'),
          };
          // setModalTitle('Blue Square');
          axios
            .post(ENDPOINTS.ADD_BLUE_SQUARE(warningData.userId), {
              blueSquare: newBlueSquare,
            })
            .then(res => {
              toast.success('Successfully logged and Blue Square issued');
            })
            .catch(error => {
              // eslint-disable-next-line no-console
              console.log('error in adding bluesquare', error);
              toast.error('Failed to add Blue Square!');
            });
        }
        setUsersWarnings(res);
        toastMessage ? toast.success(toastMessage) : '';
        // });
      })
      .catch(err => {
        console.log(err);
      });
  };

  const warnings = !toggle
    ? null
    : usersWarnings.map(warning => (
        <div className={`${styles['warning-item-container']}`} key={warning.title}>
          <div className={`${styles['warning-wrapper']}`}>
            <WarningIcons
              warnings={warning.warnings}
              warningText={warning.title}
              handleWarningIconClicked={handlePostWarningDetails}
              handleShowWarningModal={handleShowWarningModal}
              numberOfWarnings={warning.warnings.length}
            />
            <p className={`${styles['warning-text']}`}> {warning.title}</p>
          </div>
        </div>
      ));

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
